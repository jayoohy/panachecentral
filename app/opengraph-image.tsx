import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand guide: the logo only ever sits on a solid field. The 512px wordmark is on white, so the card is white.
export default async function OpenGraphImage() {
  const logo = await readFile(path.join(process.cwd(), "public/logo/web-app-manifest-512x512.png"));

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFFFF" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/png;base64,${logo.toString("base64")}`} alt="" width={630} height={630} />
      </div>
    ),
    size
  );
}
