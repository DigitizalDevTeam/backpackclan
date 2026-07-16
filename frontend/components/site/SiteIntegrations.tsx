import type { IntegrationSettings } from "@/types/settings";
import { sanitizeGtmId, sanitizeTawkToId } from "@/lib/site/integrations";
import Script from "next/script";

interface SiteIntegrationsProps {
  integrations: IntegrationSettings;
}

export function SiteIntegrations({ integrations }: SiteIntegrationsProps) {
  const gtmId = sanitizeGtmId(integrations.gtmId);
  const tawkToId = integrations.tawkToEnabled
    ? sanitizeTawkToId(integrations.tawkToId)
    : null;

  return (
    <>
      {gtmId ? (
        <>
          <Script id="gtm-script" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        </>
      ) : null}

      {tawkToId ? (
        <Script id="tawk-script" strategy="lazyOnload">
          {`var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/${tawkToId}';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();`}
        </Script>
      ) : null}
    </>
  );
}
