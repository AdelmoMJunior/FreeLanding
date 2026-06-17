export type PublicLandingBenefit = Readonly<{
  title: string;
  description: string;
  iconName: string | null;
}>;

export type AdminBenefit = Readonly<{
  id: string;
  title: string;
  description: string;
  iconName: string | null;
  sortOrder: number;
  isActive: boolean;
}>;
