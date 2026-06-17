export type PublicLandingFaq = Readonly<{
  question: string;
  answer: string;
}>;

export type AdminFaq = Readonly<{
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}>;
