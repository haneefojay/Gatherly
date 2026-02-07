import React from 'react';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-ash-50 flex flex-col">
            {children}
        </div>
    );
}
