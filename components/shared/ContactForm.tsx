"use client";

import { useState } from "react";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { Button } from "@/components/shared/Button";
import { FIELD_CLASS, FIELD_LABEL_CLASS } from "@/components/shared/field-styles";

/**
 * The site has no backend email/send capability — this opens WhatsApp with
 * the visitor's own message prefilled, the same mechanism used everywhere
 * else on the storefront for reaching Panache Central directly.
 */
export function ContactForm() {
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    window.open(buildWhatsAppLink(trimmed), "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="contact-message" className={FIELD_LABEL_CLASS}>
          Message
        </label>
        <textarea
          id="contact-message"
          required
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className={`mt-1 resize-none ${FIELD_CLASS}`}
        />
      </div>
      <Button type="submit" variant="primary-gold">
        Send via WhatsApp
      </Button>
    </form>
  );
}
