export type PublicLandingModule = Readonly<{
  title: string;
  description: string;
  imagePath: string | null;
  imageAlt: string;
}>;

export type AdminModule = Readonly<{
  id: string;
  title: string;
  description: string;
  imagePath: string | null;
  imageAlt: string;
  sortOrder: number;
  isActive: boolean;
}>;
