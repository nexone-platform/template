'use client';

interface TextProps {
    content?: string;
    fontSize?: string;
    color?: string;
    align?: 'left' | 'center' | 'right';
}

export default function Text({
    content = 'Enter your text here',
    fontSize = '16px',
    color = '',
    align = 'left',
}: TextProps) {
    const style: React.CSSProperties = {
        fontSize,
        textAlign: align,
        ...(color ? { color } : {}),
    };

    return (
        <p style={style}>
            {content}
        </p>
    );
}
