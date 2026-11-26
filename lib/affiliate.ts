/**
 * Amazon Associates affiliate tag for naveenbandarage.com.
 */
export const AMAZON_AFFILIATE_TAG = "navb0f-20";

/**
 * The disclosure Amazon Associates requires next to affiliate links.
 */
export const AMAZON_DISCLOSURE =
  "As an Amazon Associate I earn from qualifying purchases.";

function withTag(url: string) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}tag=${AMAZON_AFFILIATE_TAG}`;
}

/**
 * Amazon search deep link. Used when a specific product page is not known.
 */
export function amazonSearchUrl(query: string) {
  return withTag(`https://www.amazon.com/s?k=${encodeURIComponent(query)}`);
}

/**
 * Convert a 978-prefixed ISBN-13 into its ISBN-10 form, which is the ASIN
 * Amazon uses for print books. Falls back to a search link for other formats.
 */
export function amazonBookUrl(isbn: string) {
  const digits = isbn.replace(/[^0-9Xx]/g, "");

  if (digits.length === 13 && digits.startsWith("978")) {
    const body = digits.slice(3, 12);
    let sum = 0;

    for (let index = 0; index < 9; index += 1) {
      sum += (10 - index) * Number(body[index]);
    }

    const remainder = (11 - (sum % 11)) % 11;
    const checkDigit = remainder === 10 ? "X" : String(remainder);

    return withTag(`https://www.amazon.com/dp/${body}${checkDigit}`);
  }

  return amazonSearchUrl(isbn);
}
