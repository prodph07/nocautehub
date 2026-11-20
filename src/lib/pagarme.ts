import type { PlanTier } from "@/types/tenant";

export const PLAN_PRICING: Record<
  PlanTier,
  {
    name: string;
    regularCents: number;
    firstMonthPromoCents: number;
    firstMonthDiscountCents: number;
  }
> = {
  essencial: {
    name: "Nocaute Hub - Plano Essencial",
    regularCents: 4700, // R$ 47,00 / mês
    firstMonthPromoCents: 2000, // R$ 20,00 no 1º mês (opção promocional)
    firstMonthDiscountCents: 2700,
  },
  pro: {
    name: "Nocaute Hub - Plano Pro",
    regularCents: 9700, // R$ 97,00 / mês
    firstMonthPromoCents: 4900, // R$ 49,00 no 1º mês (opção promocional)
    firstMonthDiscountCents: 4800,
  },
};

export function formatBrlFromCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function getDefaultTrialDays(): number {
  const raw = process.env.PAGARME_TRIAL_DAYS?.trim();
  if (raw !== undefined && raw !== "") {
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 90) {
      return Math.floor(parsed);
    }
  }
  return 15;
}

export function isPagarmeConfigured(): boolean {
  return Boolean(process.env.PAGARME_SECRET_KEY?.trim());
}

function getPagarmeAuthHeader(secretKey: string): string {
  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

export interface DirectSubscriptionInput {
  tenantId: string;
  tenantName: string;
  slug: string;
  planTier: PlanTier;
  trialDays: number;
  customer: {
    name: string;
    email: string;
    document: string; // CPF (11 dígitos) ou CNPJ (14 dígitos)
    phone: string; // DDD + número (10 ou 11 dígitos)
  };
  billingAddress: {
    zipCode: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  card: {
    number: string;
    holderName: string;
    expMonth: number;
    expYear: number;
    cvv: string;
  };
}

export interface DirectSubscriptionResult {
  subscriptionId: string;
  status: string;
  trialDays: number;
  regularCents: number;
  firstChargeDateIso: string;
}

/**
 * Cria a assinatura recorrente diretamente via Checkout Transparente (POST /core/v5/subscriptions).
 * - Não depende da página hospedada confusa da Pagar.me.
 * - Não cria planos duplicados na conta Pagar.me (usa assinatura avulsa com `items`).
 * - Quando `trialDays > 0`, agenda o início da 1ª cobrança para `now + trialDays` via `start_at`.
 */
export async function createPagarmeDirectSubscription(
  input: DirectSubscriptionInput
): Promise<DirectSubscriptionResult> {
  const secretKey = process.env.PAGARME_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error("PAGARME_SECRET_KEY não configurada no servidor.");
  }

  const spec = PLAN_PRICING[input.planTier];
  const trialDays = Math.max(0, Math.min(90, Math.floor(input.trialDays)));

  const cleanDoc = input.customer.document.replace(/\D/g, "");
  if (cleanDoc.length !== 11 && cleanDoc.length !== 14) {
    throw new Error("Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.");
  }
  const isCnpj = cleanDoc.length === 14;

  let cleanPhone = input.customer.phone.replace(/\D/g, "");
  if (cleanPhone.startsWith("55") && cleanPhone.length >= 12) {
    cleanPhone = cleanPhone.slice(2);
  }
  if (cleanPhone.length < 10) {
    throw new Error("Informe um telefone/WhatsApp válido com DDD.");
  }
  const areaCode = cleanPhone.slice(0, 2);
  const phoneNumber = cleanPhone.slice(2);

  const cleanZip = input.billingAddress.zipCode.replace(/\D/g, "");
  if (cleanZip.length !== 8) {
    throw new Error("Informe um CEP válido com 8 dígitos.");
  }

  const cleanCardNumber = input.card.number.replace(/\D/g, "");
  if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
    throw new Error("Número do cartão de crédito inválido.");
  }

  const cleanCvv = input.card.cvv.replace(/\D/g, "");
  if (cleanCvv.length < 3 || cleanCvv.length > 4) {
    throw new Error("Código de segurança (CVV) inválido.");
  }

  let expYear = Number(input.card.expYear);
  if (expYear < 100) {
    expYear += 2000;
  }
  const expMonth = Number(input.card.expMonth);
  if (!expMonth || expMonth < 1 || expMonth > 12) {
    throw new Error("Mês de validade do cartão inválido.");
  }

  const firstChargeDate = new Date(
    Date.now() + trialDays * 24 * 60 * 60 * 1000
  );
  const firstChargeDateIso = firstChargeDate.toISOString();

  const streetNumber = input.billingAddress.number.trim() || "S/N";
  const streetName = input.billingAddress.street.trim() || "Rua";
  const neighborhood = input.billingAddress.neighborhood.trim() || "Centro";
  const city = input.billingAddress.city.trim() || "São Paulo";
  const state =
    input.billingAddress.state.trim().toUpperCase().slice(0, 2) || "SP";

  // Formato exigido pela Pagar.me v5 para line_1: "Número, Rua, Bairro"
  const line1 = `${streetNumber}, ${streetName}, ${neighborhood}`.slice(0, 255);

  const payload: Record<string, unknown> = {
    code: `nh_${input.slug}_${Date.now()}`.slice(0, 52),
    payment_method: "credit_card",
    currency: "BRL",
    interval: "month",
    interval_count: 1,
    billing_type: "prepaid",
    statement_descriptor: "NOCAUTEHUB",
    ...(trialDays > 0 ? { start_at: firstChargeDateIso } : {}),
    items: [
      {
        description: `${spec.name} — ${input.tenantName}`.slice(0, 128),
        quantity: 1,
        pricing_scheme: {
          scheme_type: "unit",
          price: spec.regularCents,
        },
      },
    ],
    customer: {
      name: input.customer.name.trim(),
      email: input.customer.email.trim().toLowerCase(),
      document: cleanDoc,
      document_type: isCnpj ? "CNPJ" : "CPF",
      type: isCnpj ? "company" : "individual",
      phones: {
        mobile_phone: {
          country_code: "55",
          area_code: areaCode,
          number: phoneNumber,
        },
      },
    },
    card: {
      number: cleanCardNumber,
      holder_name: input.card.holderName.trim().toUpperCase(),
      exp_month: expMonth,
      exp_year: expYear,
      cvv: cleanCvv,
      billing_address: {
        line_1: line1,
        zip_code: cleanZip,
        city,
        state,
        country: "BR",
      },
    },
    metadata: {
      tenant_id: input.tenantId,
      slug: input.slug,
      plan_tier: input.planTier,
      trial_days: String(trialDays),
    },
  };

  const auth = getPagarmeAuthHeader(secretKey);
  const res = await fetch("https://api.pagar.me/core/v5/subscriptions", {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data?.id) {
    const rawErrors = data?.errors
      ? Object.values(data.errors).flat().join(" ")
      : "";
    const gatewayError =
      data?.charges?.[0]?.last_transaction?.gateway_response?.errors?.[0]
        ?.message || "";
    throw new Error(
      gatewayError ||
        rawErrors ||
        data?.message ||
        "Não foi possível validar o cartão na operadora. Verifique os dados e tente novamente."
    );
  }

  const subStatus = String(data.status || "").toLowerCase();
  if (subStatus === "failed" || subStatus === "canceled") {
    throw new Error(
      "O cartão foi recusado pelo banco emissor. Verifique os dados ou tente outro cartão."
    );
  }

  return {
    subscriptionId: String(data.id),
    status: subStatus || "active",
    trialDays,
    regularCents: spec.regularCents,
    firstChargeDateIso,
  };
}
