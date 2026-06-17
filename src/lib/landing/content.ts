import { landingContent } from "@/lib/landing/static-content";
import type { PublicLandingBenefit } from "@/lib/landing/benefit-types";
import type { PublicLandingFaq } from "@/lib/landing/faq-types";
import type { PublicLandingModule } from "@/lib/landing/module-types";
import { safeImagePathOrNull } from "@/lib/landing/safe-image";
import { safeLandingHrefOrFallback } from "@/lib/landing/safe-url";

type LandingPageRecord = Readonly<{
  seo_title: string;
  seo_description: string;
  seo_image_path: string | null;
}>;

type LandingSettingsRecord = Readonly<{
  headline: string;
  subheadline: string;
  primary_cta_label: string;
  primary_cta_url: string;
  secondary_cta_label: string;
  secondary_cta_url: string;
  cta_title?: string | null;
  cta_description?: string | null;
  whatsapp_number: string;
  whatsapp_message: string;
  contact_email: string;
  contact_phone: string;
  brand_color?: string | null;
}>;

type LandingModuleRecord = Readonly<{
  title: string;
  description: string;
  image_path: string | null;
  image_alt: string;
  sort_order: number;
  is_active?: boolean;
}>;

type LandingBenefitRecord = Readonly<{
  title: string;
  description: string;
  icon_name: string | null;
  sort_order: number;
  is_active?: boolean;
}>;

type LandingFaqRecord = Readonly<{
  question: string;
  answer: string;
  sort_order: number;
  is_active?: boolean;
}>;

export type LandingAction = Readonly<{
  label: string;
  href: string;
}>;

export type PublicLandingContent = Readonly<{
  company: typeof landingContent.company;
  eyebrow: typeof landingContent.eyebrow;
  hero: Readonly<{
    title: string;
    description: string;
    primaryAction: LandingAction;
    secondaryAction: LandingAction;
    proof: typeof landingContent.hero.proof;
    metrics: typeof landingContent.hero.metrics;
  }>;
  modules: readonly PublicLandingModule[];
  benefits: readonly PublicLandingBenefit[];
  faq: readonly PublicLandingFaq[];
  cta: Readonly<{
    title: string;
    description: string;
    action: LandingAction;
  }>;
  seo: Readonly<{
    title: string;
    description: string;
    imagePath: string | null;
  }>;
  contact: Readonly<{
    email: string;
    phone: string;
  }>;
  brand: Readonly<{
    color: string;
  }>;
  whatsapp: Readonly<{
    href: string;
    label: string;
  }> | null;
}>;

type BuildLandingContentInput = Readonly<{
  page?: LandingPageRecord | null;
  settings?: LandingSettingsRecord | null;
  modules?: readonly LandingModuleRecord[] | null;
  benefits?: readonly LandingBenefitRecord[] | null;
  faqs?: readonly LandingFaqRecord[] | null;
}>;

const fallbackSeo = {
  title: landingContent.company,
  description: landingContent.hero.description,
  imagePath: null,
} as const;

function textOrFallback(value: string | null | undefined, fallback: string) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : fallback;
}

function nullableText(value: string | null | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function buildWhatsappLink(settings?: LandingSettingsRecord | null) {
  const digits = settings?.whatsapp_number.replace(/\D/g, "") ?? "";

  if (digits.length < 10 || digits.length > 15) {
    return null;
  }

  const message = nullableText(settings?.whatsapp_message);
  const textQuery = message ? `?text=${encodeURIComponent(message)}` : "";

  return {
    href: `https://wa.me/${digits}${textQuery}`,
    label: "Abrir conversa no WhatsApp",
  };
}

function brandColorOrFallback(value: string | null | undefined) {
  const color = value?.trim().toLowerCase() ?? "";

  return /^#[0-9a-f]{6}$/.test(color) ? color : "#10b981";
}

function fallbackModules(): readonly PublicLandingModule[] {
  return landingContent.modules.map((module) => ({
    title: module.title,
    description: module.description,
    imagePath: null,
    imageAlt: "",
  }));
}

function buildModules(modules?: readonly LandingModuleRecord[] | null) {
  const parsedModules = modules
    ?.filter((module) => module.is_active !== false)
    .map((module) => ({
      module: {
        title: module.title.trim(),
        description: module.description.trim(),
        imagePath: safeImagePathOrNull(module.image_path),
        imageAlt: module.image_alt.trim(),
      },
      sortOrder: module.sort_order,
    }))
    .filter(({ module }) => module.title && module.description)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ module }) => module);

  return parsedModules?.length ? parsedModules : fallbackModules();
}

function fallbackBenefits(): readonly PublicLandingBenefit[] {
  return landingContent.benefits.map((benefit) => ({
    title: benefit,
    description: "",
    iconName: null,
  }));
}

function buildBenefits(benefits?: readonly LandingBenefitRecord[] | null) {
  const parsedBenefits = benefits
    ?.filter((benefit) => benefit.is_active !== false)
    .map((benefit) => ({
      benefit: {
        title: benefit.title.trim(),
        description: benefit.description.trim(),
        iconName: nullableText(benefit.icon_name),
      },
      sortOrder: benefit.sort_order,
    }))
    .filter(({ benefit }) => benefit.title && benefit.description)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ benefit }) => benefit);

  return parsedBenefits?.length ? parsedBenefits : fallbackBenefits();
}

function fallbackFaqs(): readonly PublicLandingFaq[] {
  return landingContent.faq.map((item) => ({
    question: item.question,
    answer: item.answer,
  }));
}

function buildFaqs(faqs?: readonly LandingFaqRecord[] | null) {
  const parsedFaqs = faqs
    ?.filter((faq) => faq.is_active !== false)
    .map((faq) => ({
      faq: {
        question: faq.question.trim(),
        answer: faq.answer.trim(),
      },
      sortOrder: faq.sort_order,
    }))
    .filter(({ faq }) => faq.question && faq.answer)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ faq }) => faq);

  return parsedFaqs?.length ? parsedFaqs : fallbackFaqs();
}

export function buildLandingContent({
  page = null,
  settings = null,
  modules = null,
  benefits = null,
  faqs = null,
}: BuildLandingContentInput = {}): PublicLandingContent {
  const primaryAction = {
    label: textOrFallback(settings?.primary_cta_label, landingContent.hero.primaryAction),
    href: safeLandingHrefOrFallback(settings?.primary_cta_url, "#modulos"),
  };
  const secondaryAction = {
    label: textOrFallback(settings?.secondary_cta_label, landingContent.hero.secondaryAction),
    href: safeLandingHrefOrFallback(settings?.secondary_cta_url, "#beneficios"),
  };

  return {
    company: landingContent.company,
    eyebrow: landingContent.eyebrow,
    hero: {
      title: textOrFallback(settings?.headline, landingContent.hero.title),
      description: textOrFallback(settings?.subheadline, landingContent.hero.description),
      primaryAction,
      secondaryAction,
      proof: landingContent.hero.proof,
      metrics: landingContent.hero.metrics,
    },
    modules: buildModules(modules),
    benefits: buildBenefits(benefits),
    faq: buildFaqs(faqs),
    cta: {
      title: textOrFallback(settings?.cta_title, landingContent.cta.title),
      description: textOrFallback(settings?.cta_description, landingContent.cta.description),
      action: primaryAction,
    },
    seo: {
      title: textOrFallback(page?.seo_title, fallbackSeo.title),
      description: textOrFallback(page?.seo_description, fallbackSeo.description),
      imagePath: nullableText(page?.seo_image_path),
    },
    contact: {
      email: textOrFallback(settings?.contact_email, ""),
      phone: textOrFallback(settings?.contact_phone, ""),
    },
    brand: {
      color: brandColorOrFallback(settings?.brand_color),
    },
    whatsapp: buildWhatsappLink(settings),
  };
}
