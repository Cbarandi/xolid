import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { CustomCursor } from "@/components/CustomCursor";

const site = "https://xolid.ai";
const title = "XOLID — Trading with Edge";
const description =
  "We are defining a new category in trading. Edge is not found. It is built.";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title,
  description,
  applicationName: "XOLID",
  icons: {
    icon: [{ url: "/favicon.svg?v=1", type: "image/svg+xml" }],
  },
  openGraph: { title, description, url: site, siteName: "XOLID" },
  twitter: { card: "summary_large_image", title, description },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en">
      <body className="cursor-none-desktop antialiased selection:bg-white selection:text-black">
        <CustomCursor />
        {children}
        <Script
          src="https://plausible.io/js/pa-0Lv0_7Zwm6C8QH5JFdLoS.js"
          strategy="afterInteractive"
        />
        <Script id="plausible-init" strategy="afterInteractive">
          {`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
plausible.init();`}
        </Script>
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
