import { BenefitsSection } from "@/components/public/benefits-section";
import { CtaSection } from "@/components/public/cta-section";
import { FaqSection } from "@/components/public/faq-section";
import { HeroSection } from "@/components/public/hero-section";
import { ModulesSection } from "@/components/public/modules-section";
import { SiteHeader } from "@/components/public/site-header";
import { WhatsappFloating } from "@/components/public/whatsapp-floating";

export function PublicLanding() {
  return (
    <>
      <SiteHeader />
      <main className="overflow-hidden">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_32rem),linear-gradient(135deg,#06111f_0%,#0f172a_52%,#123329_100%)]">
          <HeroSection />
        </div>
        <ModulesSection />
        <BenefitsSection />
        <FaqSection />
        <CtaSection />
      </main>
      <WhatsappFloating />
    </>
  );
}
