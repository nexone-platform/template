'use client';

import React from 'react';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface HeadingProps {
    text?: string;
    level?: HeadingLevel;
    align?: 'left' | 'center' | 'right';
    color?: string;
    fontSize?: string;
}

export default function Heading({
    text = 'Heading Text',
    level = 'h2',
    align = 'left',
    color = '',
    fontSize = '',
}: HeadingProps) {
    const Tag = level as React.ElementType;

    const style: React.CSSProperties = {
        textAlign: align,
        ...(color ? { color } : {}),
        ...(fontSize ? { fontSize } : {}),
    };

    return (
        <Tag style={style}>
            {text}
        </Tag>
    );
}

