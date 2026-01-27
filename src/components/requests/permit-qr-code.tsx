'use client';

import QRCode from 'react-qr-code';

export function PermitQRCode({ value }: { value: string }) {
    return (
        <div className="bg-white p-2">
            <QRCode
                size={120}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={value}
                viewBox={`0 0 256 256`}
            />
        </div>
    );
}
