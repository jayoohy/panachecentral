// Checkout runs through WhatsApp until Paystack is configured. The Paystack
// code path (CheckoutForm's payment.redirectUrl branch) stays intact and
// only runs when this flag is switched back.
export type CheckoutMode = "whatsapp" | "paystack";

export const CHECKOUT_MODE: CheckoutMode =
  process.env.NEXT_PUBLIC_CHECKOUT_MODE === "paystack" ? "paystack" : "whatsapp";

// International format, digits only (e.g. 2348012345678) — set in the environment, never hardcoded.
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export function buildWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildOrderMessage(orderNumber: string, name?: string | null) {
  const base = `Hello Panache Central, I'd like to complete my order #${orderNumber}.`;
  return name ? `${base} My name is ${name}.` : base;
}

export const GENERAL_INQUIRY_MESSAGE = "Hello Panache Central, I have a question.";
