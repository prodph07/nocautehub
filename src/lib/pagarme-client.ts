/**
 * Tokeniza o cartão de crédito diretamente no navegador do cliente usando a
 * Chave Pública da Pagar.me (pk_...), garantindo conformidade PCI.
 * Caso o navegador possua bloqueador de rede (AdBlock) que impeça a chamada direta
 * a api.pagar.me, retorna null para que o backend utilize o fallback seguro via HTTPS.
 */
export async function tokenizeCardInBrowser(card: {
  number: string;
  holderName: string;
  expMonth: number;
  expYear: number;
  cvv: string;
}): Promise<string | null> {
  const publicKey =
    process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY?.trim() ||
    "pk_weyxa0Nh0s9elzZ0";

  if (!publicKey) return null;

  const cleanNumber = card.number.replace(/\D/g, "");
  const cleanCvv = card.cvv.replace(/\D/g, "");
  let expYear = Number(card.expYear);
  if (expYear < 100) expYear += 2000;
  const expMonth = Number(card.expMonth);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(
      `https://api.pagar.me/core/v5/tokens?appId=${encodeURIComponent(
        publicKey
      )}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          type: "card",
          card: {
            number: cleanNumber,
            holder_name: card.holderName.trim().toUpperCase(),
            exp_month: expMonth,
            exp_year: expYear,
            cvv: cleanCvv,
          },
        }),
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    return data?.id ? String(data.id) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
