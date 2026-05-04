/**
 * Robust file download utility for Next.js.
 *
 * Strategy:
 *   1. Try File System Access API (Chrome 86+) — opens a native "Save As" dialog
 *      with the suggested filename. Most reliable method.
 *   2. Fallback: create an <a> tag *outside* the React root (appended to <html>
 *      instead of <body>) to avoid Next.js router click interception, then dispatch
 *      a synthetic MouseEvent directly on the element.
 */

export interface DownloadOptions {
    /** The raw data — ArrayBuffer, Uint8Array, or string */
    data: BlobPart;
    /** Desired filename, e.g. "report_20260312.xlsx" */
    filename: string;
    /** MIME type, e.g. "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" */
    mimeType: string;
}

export async function downloadFile({ data, filename, mimeType }: DownloadOptions): Promise<void> {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });

    // ─── Method 1: File System Access API (Chrome 86+) ───
    if (typeof window !== "undefined" && "showSaveFilePicker" in window) {
        try {
            const ext = "." + (filename.split(".").pop() || "bin");
            const handle = await (window as any).showSaveFilePicker({
                suggestedName: filename,
                types: [
                    {
                        description: filename,
                        accept: { [mimeType]: [ext] },
                    },
                ],
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return; // success
        } catch (err: any) {
            if (err?.name === "AbortError") return; // user cancelled — not an error
            // fall through to Method 2
        }
    }

    // ─── Method 2: Anchor fallback ───
    // Append to <html> (documentElement) instead of <body> to bypass
    // any React/Next.js delegated click handlers on <body>/<div id="__next">.
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.style.position = "fixed";
    anchor.style.left = "-9999px";
    anchor.style.top = "-9999px";
    document.documentElement.appendChild(anchor);

    // Dispatch a non-bubbling click so Next.js router never sees it
    anchor.dispatchEvent(
        new MouseEvent("click", {
            view: window,
            bubbles: false,
            cancelable: false,
        })
    );

    setTimeout(() => {
        document.documentElement.removeChild(anchor);
        URL.revokeObjectURL(url);
    }, 30_000);
}
