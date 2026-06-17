import type { CSSProperties } from "react";

import { Analytics } from "@/components/public/analytics";
import { BenefitsSection } from "@/components/public/benefits-section";
import { CtaSection } from "@/components/public/cta-section";
import { FaqSection } from "@/components/public/faq-section";
import { HeroSection } from "@/components/public/hero-section";
import { ModulesSection } from "@/components/public/modules-section";
import { SiteHeader } from "@/components/public/site-header";
import { WhatsappFloating } from "@/components/public/whatsapp-floating";
import type { PublicLandingContent } from "@/lib/landing/content";

type PublicLandingProps = Readonly<{
  content: PublicLandingContent;
}>;

type BrandStyle = CSSProperties &
  Record<
    | "--brand-color"
    | "--brand-accent-on-dark"
    | "--brand-contrast"
    | "--brand-glow"
    | "--brand-muted"
    | "--brand-shadow"
    | "--brand-soft",
    string
  >;

function hexToRgb(hex: string) {
  return {
    red: Number.parseInt(hex.slice(1, 3), 16),
    green: Number.parseInt(hex.slice(3, 5), 16),
    blue: Number.parseInt(hex.slice(5, 7), 16),
  };
}

function toLinearColorChannel(value: number) {
  const channel = value / 255;

  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance({ red, green, blue }: ReturnType<typeof hexToRgb>) {
  return 0.2126 * toLinearColorChannel(red) + 0.7152 * toLinearColorChannel(green) + 0.0722 * toLinearColorChannel(blue);
}

function contrastRatio(first: ReturnType<typeof hexToRgb>, second: ReturnType<typeof hexToRgb>) {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));

  return (lighter + 0.05) / (darker + 0.05);
}

function getReadableTextColor({ red, green, blue }: ReturnType<typeof hexToRgb>) {
  const brand = { red, green, blue };
  const white = { red: 255, green: 255, blue: 255 };
  const slate = { red: 15, green: 23, blue: 42 };

  return contrastRatio(brand, slate) >= contrastRatio(brand, white) ? "#0f172a" : "#ffffff";
}

function getAccentOnDark(color: string, rgb: ReturnType<typeof hexToRgb>) {
  const slate = { red: 15, green: 23, blue: 42 };

  return contrastRatio(rgb, slate) >= 4.5 ? color : "#ffffff";
}

function getBrandStyle(color: string): BrandStyle {
  const rgb = hexToRgb(color);

  return {
    "--brand-color": color,
    "--brand-accent-on-dark": getAccentOnDark(color, rgb),
    "--brand-contrast": getReadableTextColor(rgb),
    "--brand-glow": `rgb(${rgb.red} ${rgb.green} ${rgb.blue} / 0.2)`,
    "--brand-muted": `rgb(${rgb.red} ${rgb.green} ${rgb.blue} / 0.25)`,
    "--brand-shadow": `rgb(${rgb.red} ${rgb.green} ${rgb.blue} / 0.32)`,
    "--brand-soft": `rgb(${rgb.red} ${rgb.green} ${rgb.blue} / 0.1)`,
  };
}

export function PublicLanding({ content }: PublicLandingProps) {
  return (
    <div style={getBrandStyle(content.brand.color)}>
      <SiteHeader content={content} />
      <main id="conteudo" tabIndex={-1} className="overflow-hidden">
        <div
          style={{
            background:
              "radial-gradient(circle at top left, var(--brand-glow), transparent 32rem), linear-gradient(135deg,#06111f 0%,#0f172a 52%,#123329 100%)",
          }}
        >
          <HeroSection content={content} />
        </div>
        <ModulesSection modules={content.modules} />
        <BenefitsSection benefits={content.benefits} />
        <FaqSection faqs={content.faq} />
        <CtaSection content={content} />
      </main>
      <WhatsappFloating content={content} />
      <Analytics />
    </div>
  );
}
