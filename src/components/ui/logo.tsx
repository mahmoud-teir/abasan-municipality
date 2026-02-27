import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
    size?: number;
}

export function Logo({ className, size = 40, ...props }: LogoProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("text-primary", className)}
            {...props}
        >
            {/* Background Circle with subtle gradient feel */}
            <defs>
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
                </linearGradient>
            </defs>

            {/* Abstract Path inspired by the 'A' and 'K' with the leaf */}
            <path
                d="M30 75V40C30 30 38.9543 22 50 22V22C61.0457 22 70 30 70 40V75"
                stroke="url(#logo-gradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M30 55C30 55 45 45 60 55C75 65 90 55 90 55"
                stroke="url(#logo-gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* The signature Leaf element */}
            <path
                d="M45 55C45 55 55 25 85 20C85 20 75 50 45 55Z"
                fill="url(#logo-gradient)"
                className="animate-pulse"
                style={{ animationDuration: '3s' }}
            />

            {/* Accent dots for movement/growth */}
            <circle cx="20" cy="75" r="4" fill="currentColor" />
            <circle cx="50" cy="85" r="3" fill="currentColor" opacity="0.6" />
        </svg>
    );
}
