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
    firstMonthPromoCents: 2000,
    firstMonthDiscountCents: 2700,
  },
  pro: {
    name: "Nocaute Hub - Plano Pro",
    regularCents: 9700, // R$ 97,00 / mês
    firstMonthPromoCents: 4900,
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
  cardToken?: string | null;
  card?: {
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
 * Prioriza `card_token` (gerado no navegador com a chave pública pk_...) e mantém fallback para `card`.
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

  const billingAddressBlock = {
    line_1: `${streetNumber}, ${streetName}, ${neighborhood}`.slice(0, 255),
    zip_code: cleanZip,
    city,
    state,
    country: "BR",
  };

  let cardAuthFields: Record<string, unknown>;

  if (input.cardToken && input.cardToken.trim().startsWith("token_")) {
    cardAuthFields = {
      card_token: input.cardToken.trim(),
      card: {
        billing_address: billingAddressBlock,
      },
    };
  } else {
    const cleanCardNumber = (input.card?.number || "").replace(/\D/g, "");
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      throw new Error("Número do cartão de crédito inválido.");
    }
    const cleanCvv = (input.card?.cvv || "").replace(/\D/g, "");
    if (cleanCvv.length < 3 || cleanCvv.length > 4) {
      throw new Error("Código de segurança (CVV) inválido.");
    }
    let expYear = Number(input.card?.expYear || 0);
    if (expYear < 100) expYear += 2000;
    const expMonth = Number(input.card?.expMonth || 0);
    if (!expMonth || expMonth < 1 || expMonth > 12) {
      throw new Error("Mês de validade do cartão inválido.");
    }

    cardAuthFields = {
      card: {
        number: cleanCardNumber,
        holder_name: (input.card?.holderName || "").trim().toUpperCase(),
        exp_month: expMonth,
        exp_year: expYear,
        cvv: cleanCvv,
        billing_address: billingAddressBlock,
      },
    };
  }

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
    ...cardAuthFields,
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

export interface PagarmeSubscriptionSnapshot {
  id: string;
  status: string;
  nextBillingAt: string | null;
  createdAt: string | null;
  cardBrand: string | null;
  cardLastFour: string | null;
  holderName: string | null;
  priceCents: number | null;
}

/**
 * Consulta os dados em tempo real da assinatura na Pagar.me API v5.
 */
export async function getPagarmeSubscriptionDetails(
  subscriptionId: string
): Promise<PagarmeSubscriptionSnapshot | null> {
  const secretKey = process.env.PAGARME_SECRET_KEY?.trim();
  if (!secretKey || !subscriptionId) return null;

  try {
    const auth = getPagarmeAuthHeader(secretKey);
    const res = await fetch(
      `https://api.pagar.me/core/v5/subscriptions/${encodeURIComponent(
        subscriptionId
      )}`,
      {
        headers: { Authorization: auth, Accept: "application/json" },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();

    return {
      id: String(data.id),
      status: String(data.status || "active"),
      nextBillingAt: data.next_billing_at || data.start_at || null,
      createdAt: data.created_at || null,
      cardBrand: data.card?.brand || null,
      cardLastFour: data.card?.last_four_digits || null,
      holderName: data.card?.holder_name || null,
      priceCents:
        typeof data.items?.[0]?.pricing_scheme?.price === "number"
          ? data.items[0].pricing_scheme.price
          : null,
    };
  } catch {
    return null;
  }
}

/**
 * Faz upgrade da assinatura ativa na Pagar.me para o Plano Pro (R$ 97,00/mês).
 */
export async function upgradePagarmeSubscriptionToPro(
  subscriptionId: string,
  tenantName: string
): Promise<boolean> {
  const secretKey = process.env.PAGARME_SECRET_KEY?.trim();
  if (!secretKey || !subscriptionId) return false;

  const auth = getPagarmeAuthHeader(secretKey);
  const getRes = await fetch(
    `https://api.pagar.me/core/v5/subscriptions/${encodeURIComponent(
      subscriptionId
    )}`,
    {
      headers: { Authorization: auth, Accept: "application/json" },
    }
  );
  if (!getRes.ok) return false;
  const sub = await getRes.json();
  const itemId = sub?.items?.[0]?.id;
  if (!itemId) return false;

  const proSpec = PLAN_PRICING.pro;
  const putRes = await fetch(
    `https://api.pagar.me/core/v5/subscriptions/${encodeURIComponent(
      subscriptionId
    )}/items/${encodeURIComponent(itemId)}`,
    {
      method: "PUT",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        description: `${proSpec.name} — ${tenantName}`.slice(0, 128),
        quantity: 1,
        pricing_scheme: {
          scheme_type: "unit",
          price: proSpec.regularCents,
        },
      }),
    }
  );

  return putRes.ok;
}

/**
 * Atualiza o cartão de crédito vinculado a uma assinatura existente na Pagar.me API v5.
 */
export async function updatePagarmeSubscriptionCard(
  subscriptionId: string,
  input: {
    cardToken?: string | null;
    card?: {
      number: string;
      holderName: string;
      expMonth: number;
      expYear: number;
      cvv: string;
    };
  }
): Promise<void> {
  const secretKey = process.env.PAGARME_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error("PAGARME_SECRET_KEY não configurada.");
  }

  let body: Record<string, unknown>;
  if (input.cardToken && input.cardToken.trim().startsWith("token_")) {
    body = { card_token: input.cardToken.trim() };
  } else {
    const cleanNumber = (input.card?.number || "").replace(/\D/g, "");
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      throw new Error("Número do cartão inválido.");
    }
    const cleanCvv = (input.card?.cvv || "").replace(/\D/g, "");
    if (cleanCvv.length < 3 || cleanCvv.length > 4) {
      throw new Error("CVV inválido.");
    }
    let expYear = Number(input.card?.expYear || 0);
    if (expYear < 100) expYear += 2000;
    const expMonth = Number(input.card?.expMonth || 0);
    if (!expMonth || expMonth < 1 || expMonth > 12) {
      throw new Error("Mês de validade inválido.");
    }
    body = {
      card: {
        number: cleanNumber,
        holder_name: (input.card?.holderName || "").trim().toUpperCase(),
        exp_month: expMonth,
        exp_year: expYear,
        cvv: cleanCvv,
      },
    };
  }

  const auth = getPagarmeAuthHeader(secretKey);
  const res = await fetch(
    `https://api.pagar.me/core/v5/subscriptions/${encodeURIComponent(
      subscriptionId
    )}/card`,
    {
      method: "PATCH",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      data?.message || "Não foi possível atualizar o cartão na operadora."
    );
  }
}
