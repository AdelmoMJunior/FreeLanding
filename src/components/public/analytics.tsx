import Script from "next/script";

import { getGoogleAnalyticsId } from "@/lib/analytics/google";

export function Analytics() {
  const googleAnalyticsId = getGoogleAnalyticsId(process.env.NEXT_PUBLIC_GA_ID);

  if (!googleAnalyticsId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleAnalyticsId)}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', ${JSON.stringify(googleAnalyticsId)});
        `}
      </Script>
    </>
  );
}
