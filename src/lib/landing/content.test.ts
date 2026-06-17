import { afterEach, describe, expect, it } from "vitest";

import { buildLandingContent } from "@/lib/landing/content";

const page = {
  seo_title: "Sistema comercial para lojas",
  seo_description: "Venda, estoque e caixa em uma rotina mais previsivel.",
  seo_image_path: null,
};

const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

afterEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
});

describe("buildLandingContent", () => {
  it("uses database settings over static fallback when values are present", () => {
    const content = buildLandingContent({
      page,
      settings: {
        headline: "Controle sua loja sem planilhas soltas",
        subheadline: "Acompanhe vendas, estoque e caixa em uma tela clara.",
        primary_cta_label: "Falar com especialista",
        primary_cta_url: "#contato",
        secondary_cta_label: "Ver recursos",
        secondary_cta_url: "#modulos",
        cta_title: "Vamos conversar sobre sua necessidade?",
        cta_description: "Envie seus dados para receber um retorno objetivo da equipe comercial.",
        whatsapp_number: "+55 (11) 98888-7777",
        whatsapp_message: "Olá, quero saber mais sobre a oferta.",
        contact_email: "comercial@example.com",
        contact_phone: "(11) 98888-7777",
      },
    });

    expect(content.hero.title).toBe("Controle sua loja sem planilhas soltas");
    expect(content.hero.description).toBe("Acompanhe vendas, estoque e caixa em uma tela clara.");
    expect(content.hero.primaryAction).toEqual({ label: "Falar com especialista", href: "#contato" });
    expect(content.hero.secondaryAction).toEqual({ label: "Ver recursos", href: "#modulos" });
    expect(content.seo).toEqual({
      title: "Sistema comercial para lojas",
      description: "Venda, estoque e caixa em uma rotina mais previsivel.",
      imagePath: null,
    });
    expect(content.contact).toEqual({
      email: "comercial@example.com",
      phone: "(11) 98888-7777",
    });
    expect(content.cta.title).toBe("Vamos conversar sobre sua necessidade?");
    expect(content.cta.description).toBe("Envie seus dados para receber um retorno objetivo da equipe comercial.");
    expect(content.whatsapp).toEqual({
      href: "https://wa.me/5511988887777?text=Ol%C3%A1%2C%20quero%20saber%20mais%20sobre%20a%20oferta.",
      label: "Abrir conversa no WhatsApp",
    });
  });

  it("keeps fallback values when database settings are empty", () => {
    const content = buildLandingContent({
      page: {
        seo_title: " ",
        seo_description: "",
        seo_image_path: "",
      },
      settings: {
        headline: " ",
        subheadline: "",
        primary_cta_label: "",
        primary_cta_url: "",
        secondary_cta_label: " ",
        secondary_cta_url: "",
        cta_title: " ",
        cta_description: "",
        whatsapp_number: "",
        whatsapp_message: "",
        contact_email: "",
        contact_phone: " ",
      },
    });

    expect(content.hero.title).toBe("Apresente sua oferta com clareza e gere contatos qualificados.");
    expect(content.hero.primaryAction).toEqual({ label: "Ver destaques", href: "#modulos" });
    expect(content.seo.title).toBe("FreeLanding");
    expect(content.whatsapp).toBeNull();
  });

  it("omits whatsapp link when the number has no usable digits", () => {
    const content = buildLandingContent({
      page,
      settings: {
        headline: "Novo titulo",
        subheadline: "Nova descricao",
        primary_cta_label: "Contato",
        primary_cta_url: "#contato",
        secondary_cta_label: "Modulos",
        secondary_cta_url: "#modulos",
        cta_title: "Contato",
        cta_description: "Fale com a equipe para entender os próximos passos.",
        whatsapp_number: "telefone",
        whatsapp_message: "Mensagem",
        contact_email: "",
        contact_phone: "",
      },
    });

    expect(content.whatsapp).toBeNull();
  });

  it("omits whatsapp link when the number has an invalid amount of digits", () => {
    const content = buildLandingContent({
      page,
      settings: {
        headline: "Novo titulo",
        subheadline: "Nova descricao",
        primary_cta_label: "Contato",
        primary_cta_url: "#contato",
        secondary_cta_label: "Modulos",
        secondary_cta_url: "#modulos",
        cta_title: "Contato",
        cta_description: "Fale com a equipe para entender os próximos passos.",
        whatsapp_number: "12345",
        whatsapp_message: "Mensagem",
        contact_email: "",
        contact_phone: "",
      },
    });

    expect(content.whatsapp).toBeNull();
  });

  it("falls back from unsafe CTA urls", () => {
    const content = buildLandingContent({
      page,
      settings: {
        headline: "Novo titulo",
        subheadline: "Nova descricao",
        primary_cta_label: "Contato",
        primary_cta_url: "javascript:alert(1)",
        secondary_cta_label: "Site externo",
        secondary_cta_url: "//example.com",
        cta_title: "Contato",
        cta_description: "Fale com a equipe para entender os próximos passos.",
        whatsapp_number: "",
        whatsapp_message: "",
        contact_email: "",
        contact_phone: "",
      },
    });

    expect(content.hero.primaryAction).toEqual({ label: "Contato", href: "#modulos" });
    expect(content.hero.secondaryAction).toEqual({ label: "Site externo", href: "#beneficios" });
  });

  it("uses only active database modules ordered by sort order", () => {
    const content = buildLandingContent({
      modules: [
        {
          title: " Financeiro ",
          description: " Contas e caixa do dia. ",
          image_path: "javascript:alert(1)",
          image_alt: "",
          sort_order: 20,
          is_active: true,
        },
        {
          title: "Inativo",
          description: "Não deve aparecer.",
          image_path: null,
          image_alt: "",
          sort_order: 1,
          is_active: false,
        },
        {
          title: "Estoque",
          description: "Entradas, saídas e alertas.",
          image_path: "modules/estoque.webp",
          image_alt: "Tela de estoque",
          sort_order: 10,
          is_active: true,
        },
      ],
    });

    expect(content.modules).toEqual([
      {
        title: "Estoque",
        description: "Entradas, saídas e alertas.",
        imagePath: "/modules/estoque.webp",
        imageAlt: "Tela de estoque",
      },
      {
        title: "Financeiro",
        description: "Contas e caixa do dia.",
        imagePath: null,
        imageAlt: "",
      },
    ]);
  });

  it("keeps only relative or configured Supabase storage module images", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";

    const content = buildLandingContent({
      modules: [
        {
          title: "Caixa",
          description: "Venda no balcão.",
          image_path: "https://cdn.example.com/caixa.webp",
          image_alt: "Imagem externa",
          sort_order: 10,
          is_active: true,
        },
        {
          title: "Estoque",
          description: "Conferência de produtos.",
          image_path: "https://project.supabase.co/storage/v1/object/public/landing-images/landing-pages/page-id/estoque.webp",
          image_alt: "Imagem enviada",
          sort_order: 20,
          is_active: true,
        },
      ],
    });

    expect(content.modules).toEqual([
      {
        title: "Caixa",
        description: "Venda no balcão.",
        imagePath: null,
        imageAlt: "Imagem externa",
      },
      {
        title: "Estoque",
        description: "Conferência de produtos.",
        imagePath: "https://project.supabase.co/storage/v1/object/public/landing-images/landing-pages/page-id/estoque.webp",
        imageAlt: "Imagem enviada",
      },
    ]);
  });

  it("keeps static modules when database modules are empty", () => {
    const content = buildLandingContent({
      modules: [
        {
          title: " ",
          description: "Sem título.",
          image_path: null,
          image_alt: "",
          sort_order: 1,
          is_active: true,
        },
      ],
    });

    expect(content.modules[0]?.title).toBe("Destaques da oferta");
  });

  it("uses only active database benefits ordered by sort order", () => {
    const content = buildLandingContent({
      benefits: [
        {
          title: " Atendimento previsível ",
          description: " Equipe segue uma rotina mais clara nos horários de pico. ",
          icon_name: "clock",
          sort_order: 20,
          is_active: true,
        },
        {
          title: "Inativo",
          description: "Não deve aparecer.",
          icon_name: null,
          sort_order: 1,
          is_active: false,
        },
        {
          title: "Menos retrabalho",
          description: "Balcão, estoque e financeiro falam a mesma língua.",
          icon_name: "check-circle",
          sort_order: 10,
          is_active: true,
        },
      ],
    });

    expect(content.benefits).toEqual([
      {
        title: "Menos retrabalho",
        description: "Balcão, estoque e financeiro falam a mesma língua.",
        iconName: "check-circle",
      },
      {
        title: "Atendimento previsível",
        description: "Equipe segue uma rotina mais clara nos horários de pico.",
        iconName: "clock",
      },
    ]);
  });

  it("keeps static benefits when database benefits are empty", () => {
    const content = buildLandingContent({
      benefits: [
        {
          title: " ",
          description: "Sem título.",
          icon_name: null,
          sort_order: 1,
          is_active: true,
        },
      ],
    });

    expect(content.benefits[0]?.title).toBe("Mensagem principal mais clara para quem chega pela primeira vez.");
  });

  it("uses only active database FAQs ordered by sort order", () => {
    const content = buildLandingContent({
      faqs: [
        {
          question: " Como funciona o contato inicial? ",
          answer: " A conversa começa pelo canal configurado na landing. ",
          sort_order: 20,
          is_active: true,
        },
        {
          question: "Inativa?",
          answer: "Não deve aparecer.",
          sort_order: 1,
          is_active: false,
        },
        {
          question: "Atende lojas com balcão?",
          answer: "Sim, com apoio para venda, estoque e caixa.",
          sort_order: 10,
          is_active: true,
        },
      ],
    });

    expect(content.faq).toEqual([
      {
        question: "Atende lojas com balcão?",
        answer: "Sim, com apoio para venda, estoque e caixa.",
      },
      {
        question: "Como funciona o contato inicial?",
        answer: "A conversa começa pelo canal configurado na landing.",
      },
    ]);
  });

  it("keeps static FAQs when database FAQs are empty", () => {
    const content = buildLandingContent({
      faqs: [
        {
          question: " ",
          answer: "Sem pergunta.",
          sort_order: 1,
          is_active: true,
        },
      ],
    });

    expect(content.faq[0]?.question).toBe("Posso adaptar os textos para qualquer tipo de negócio?");
  });
});
