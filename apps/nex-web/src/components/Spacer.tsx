'use client';

interface SpacerProps {
    height?: string;
    mobileHeight?: string;
}

export default function Spacer({ height = '60px', mobileHeight }: SpacerProps) {
    return (
        <div
            className="spacer-component"
            style={{ height, width: '100%' }}
            aria-hidden="true"
        >
            <style>{`
                @media (max-width: 768px) {
                    .spacer-component {
                        height: ${mobileHeight || height} !important;
                    }
                }
            `}</style>
        </div>
    );
}
