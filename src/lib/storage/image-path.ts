export type LandingImageExtension = "jpg" | "png" | "webp";

type CreateLandingImageStoragePathInput = Readonly<{
  landingPageId: string;
  randomId: string;
  extension: LandingImageExtension;
}>;

export function createLandingImageStoragePath({
  landingPageId,
  randomId,
  extension,
}: CreateLandingImageStoragePathInput) {
  return `landing-pages/${landingPageId}/${randomId}.${extension}`;
}
