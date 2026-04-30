import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import JobDetail from '@/components/JobDetail';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { API_BASE_URL } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    try {
        const res = await fetch(`${API_BASE_URL}/jobs/external/${id}`, { cache: 'no-store' });
        if (!res.ok) return { title: 'Job Not Found' };
        const job = await res.json();
        return {
            title: `${job.title} | Careers`,
            description: job.description?.slice(0, 160) || '',
        };
    } catch {
        return { title: 'Careers' };
    }
}

export default async function JobDetailPage({ params }: Props) {
    const { id } = await params;

    let job = null;
    try {
        const res = await fetch(`${API_BASE_URL}/jobs/external/${id}`, { cache: 'no-store' });
        if (res.ok) job = await res.json();
    } catch {
        // fall through to notFound
    }

    if (!job) notFound();

    return (
        <>
            <Navbar />
            <JobDetail job={job} />
            <Footer />
        </>
    );
}
