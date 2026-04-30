import { notFound } from 'next/navigation';
import { PageAPI } from '@/lib/api';
import PageRenderer from '@/components/PageRenderer';
import PreviewFrame from '@/components/PreviewFrame';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
    searchParams: Promise<{ preview?: string; viewport?: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const page = await PageAPI.getBySlug(slug);

    if (!page) {
        return { title: 'Page Not Found' };
    }

    return {
        title: page.seoMeta?.title || page.title,
        description: page.seoMeta?.description || '',
        keywords: page.seoMeta?.keywords?.join(', ') || '',
    };
}

export default async function DynamicPage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const { preview, viewport } = await searchParams;
    const isPreview = preview === 'true';

    const page = await PageAPI.getBySlug(slug);

    // If page not found → 404
    if (!page) {
        notFound();
    }

    // If not published AND not in preview mode → show preview banner automatically
    // (don't 404 draft pages — show them with a preview banner instead)
    const showPreviewBanner = page.status !== 'published';

    const pageContent = (
        <>
            {/* Preview banner */}
            {showPreviewBanner && (
                <div style={{
                    background: '#f59e0b',
                    color: '#1f2937',
                    textAlign: 'center',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: 600,
                    position: 'sticky',
                    top: 0,
                    zIndex: 9999,
                }}>
                    👁️ Preview Mode — This page is not published yet
                </div>
            )}
            <PageRenderer page={page} />
        </>
    );

    // Wrap in device frame if viewport is specified
    if (isPreview && viewport && (viewport === 'tablet' || viewport === 'mobile')) {
        return <PreviewFrame>{pageContent}</PreviewFrame>;
    }

    return pageContent;
}
