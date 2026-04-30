import { redirect } from 'next/navigation';
import { PageAPI } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  let pages: Awaited<ReturnType<typeof PageAPI.getAll>> = [];

  try {
    pages = await PageAPI.getAll();
  } catch {
    // API unreachable — fall through to redirect below
  }

  // Always prefer the /home page
  const homePage = pages.find((p) => p.slug === 'home' && p.status === 'published');
  if (homePage) {
    redirect('/home');
  }

  // Fallback: first published page
  const firstPublished = pages.find((p) => p.status === 'published');
  if (firstPublished) {
    redirect(`/${firstPublished.slug}`);
  }

  // Fallback: first draft page
  const firstPage = pages[0];
  if (firstPage) {
    redirect(`/${firstPage.slug}?preview=true`);
  }

  // No pages at all — redirect to /home anyway
  redirect('/home');
}
