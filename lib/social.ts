// @panachecentral on every platform. Single source so the footer and the
// contact page can't drift apart.
export const CONTACT_EMAIL = "panachecentral@gmail.com";

export const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com/panachecentral" },
  { label: "TikTok", href: "https://tiktok.com/@panachecentral" },
  { label: "X", href: "https://x.com/panachecentral" },
  { label: "Email", href: `mailto:${CONTACT_EMAIL}` },
] as const;
