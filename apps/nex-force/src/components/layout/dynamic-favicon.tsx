"use client";

import { useEffect } from "react";
import { useCompanyContext } from "@/lib/company-context";

/**
 * Dynamically updates the browser favicon and page title
 * when company settings are loaded from the API.
 * Falls back to the static favicon defined in layout.tsx metadata.
 */
export function DynamicFavicon() {
    const { faviconUrl, company } = useCompanyContext();

    useEffect(() => {
        // Update favicon
        if (faviconUrl && faviconUrl !== "/favicon.png") {
            let link = document.querySelector<HTMLLinkElement>(
                'link[rel="icon"][type="image/png"]'
            );
            if (!link) {
                link = document.createElement("link");
                link.rel = "icon";
                link.type = "image/png";
                document.head.appendChild(link);
            }
            link.href = faviconUrl;

            // Also update the 96x96 variant if it exists
            const link96 = document.querySelector<HTMLLinkElement>(
                'link[rel="icon"][sizes="96x96"]'
            );
            if (link96) {
                link96.href = faviconUrl;
            }
        }

        // Update page title from company name
        if (company?.organizationNameEn) {
            document.title = `${company.organizationNameEn} — HR System`;
        }
    }, [faviconUrl, company]);

    return null; // Render nothing; side-effect only
}
