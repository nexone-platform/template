import MobileBottomNav from "@/components/mobile/MobileBottomNav";
import LiffAuthProvider from "@/components/mobile/LiffAuthProvider";

export default function MobileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <LiffAuthProvider>
            <div className="min-h-screen bg-gray-50 pb-20">
                {children}
                <MobileBottomNav />
            </div>
        </LiffAuthProvider>
    );
}
