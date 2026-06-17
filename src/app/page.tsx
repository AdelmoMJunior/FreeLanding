import type { Metadata } from "next";

import { PublicLanding } from "@/components/public/public-landing";
import { getPublicLandingContent } from "@/lib/landing/queries";

export const revalidate = 60;

function getSafeMetadataImage(imagePath: string | null) {
  if (!imagePath) {
    return undefined;
  }

  if (imagePath.startsWith("/")) {
    return imagePath;
  }

  try {
    const url = new URL(imagePath);

    if (url.protocol === "https:" || url.protocol === "http:") {
      return url.toString();
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublicLandingContent();
  const image = getSafeMetadataImage(content.seo.imagePath);
  const icon = getSafeMetadataImage(content.faviconPath);

  return {
    title: content.seo.title,
    description: content.seo.description,
    ...(icon ? { icons: { icon } } : {}),
    openGraph: {
      title: content.seo.title,
      description: content.seo.description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function Home() {
  const content = await getPublicLandingContent();

  return <PublicLanding content={content} />;
}
