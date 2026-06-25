/**
 * AZMA OS - Sovereign High Council
 * Layout Component
 */

import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sovereign High Council | AZMA OS',
  description: 'Platform governance and supervisory intelligence',
};

export default function SovereignHighCouncilLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <div className="sovereign-high-council-layout">
      {children}
      
      <style jsx global>{`
        .sovereign-high-council-layout {
          --color-gold: rgb(251, 191, 36);
          --color-gold-light: rgb(251, 206, 78);
          --color-slate-950: rgb(2, 6, 23);
          --color-slate-900: rgb(15, 23, 42);
          --color-slate-800: rgb(30, 41, 59);
        }

        .sovereign-high-council-layout * {
          box-sizing: border-box;
        }

        /* Cosmic gradient background */
        @keyframes cosmicGlow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }

        @keyframes living-light {
          0% {
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.1);
          }
          50% {
            box-shadow: 0 0 40px rgba(251, 191, 36, 0.2);
          }
          100% {
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.1);
          }
        }

        @keyframes intelligent-motion {
          0% {
            transform: translateY(0);
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-2px);
            opacity: 0.5;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        /* Typography */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800&display=swap');

        .gold {
          color: var(--color-gold);
        }

        .text-gold {
          color: var(--color-gold);
        }

        .bg-gold\/10 {
          background-color: rgba(251, 191, 36, 0.1);
        }

        .border-gold\/10 {
          border-color: rgba(251, 191, 36, 0.1);
        }

        .border-gold\/20 {
          border-color: rgba(251, 191, 36, 0.2);
        }

        .border-gold\/30 {
          border-color: rgba(251, 191, 36, 0.3);
        }

        .hover\:border-gold\/30:hover {
          border-color: rgba(251, 191, 36, 0.3);
        }

        .hover\:shadow-amber-500\/10:hover {
          box-shadow: 0 0 20px rgba(251, 146, 60, 0.1);
        }

        .shadow-lg {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        }

        .focus\:ring-2:focus {
          outline: 2px solid;
        }

        .focus\:ring-gold\/50:focus {
          outline-color: rgba(251, 191, 36, 0.5);
        }

        /* Gradient backgrounds */
        .bg-gradient-to-br {
          background: linear-gradient(to bottom right, var(--tw-gradient-stops));
        }

        .bg-gradient-to-r {
          background: linear-gradient(to right, var(--tw-gradient-stops));
        }

        .from-slate-950 {
          --tw-gradient-from: rgb(2, 6, 23);
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(2, 6, 23 / 0));
        }

        .via-slate-900 {
          --tw-gradient-via: rgb(15, 23, 42);
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to, rgb(15, 23, 42 / 0));
        }

        .to-black {
          --tw-gradient-to: rgb(0, 0, 0);
        }

        .from-amber-400 {
          --tw-gradient-from: rgb(251, 191, 36);
        }

        .to-yellow-300 {
          --tw-gradient-to: rgb(253, 224, 71);
        }

        .bg-clip-text {
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Backdrop blur */
        .backdrop-blur-xl {
          backdrop-filter: blur(20px);
        }

        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
        }

        /* Animations */
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* Rounded corners */
        .rounded-full {
          border-radius: 9999px;
        }

        .rounded-xl {
          border-radius: 0.75rem;
        }

        .rounded {
          border-radius: 0.25rem;
        }

        .rounded-lg {
          border-radius: 0.5rem;
        }

        /* Sizing */
        .w-3 {
          width: 0.75rem;
        }

        .h-3 {
          height: 0.75rem;
        }

        .min-h-screen {
          min-height: 100vh;
        }

        .inset-0 {
          inset: 0;
        }

        /* Position */
        .fixed {
          position: fixed;
        }

        .absolute {
          position: absolute;
        }

        .relative {
          position: relative;
        }

        .overflow-hidden {
          overflow: hidden;
        }

        .pointer-events-none {
          pointer-events: none;
        }

        .z-10 {
          z-index: 10;
        }

        .-z-10 {
          z-index: -10;
        }

        /* Display */
        .flex {
          display: flex;
        }

        .grid {
          display: grid;
        }

        .space-y-6 > * + * {
          margin-top: 1.5rem;
        }

        .space-y-4 > * + * {
          margin-top: 1rem;
        }

        .gap-6 {
          gap: 1.5rem;
        }

        .gap-4 {
          gap: 1rem;
        }

        .gap-2 {
          gap: 0.5rem;
        }

        /* Justify & Align */
        .justify-between {
          justify-content: space-between;
        }

        .justify-center {
          justify-content: center;
        }

        .items-center {
          align-items: center;
        }

        .items-start {
          align-items: flex-start;
        }

        /* Padding */
        .p-6 {
          padding: 1.5rem;
        }

        .px-6 {
          padding-left: 1.5rem;
          padding-right: 1.5rem;
        }

        .py-8 {
          padding-top: 2rem;
          padding-bottom: 2rem;
        }

        .py-12 {
          padding-top: 3rem;
          padding-bottom: 3rem;
        }

        /* Margin */
        .mb-8 {
          margin-bottom: 2rem;
        }

        .mb-6 {
          margin-bottom: 1.5rem;
        }

        .mb-4 {
          margin-bottom: 1rem;
        }

        .mb-3 {
          margin-bottom: 0.75rem;
        }

        .mb-2 {
          margin-bottom: 0.5rem;
        }

        .mb-12 {
          margin-bottom: 3rem;
        }

        .mt-1 {
          margin-top: 0.25rem;
        }

        .mt-2 {
          margin-top: 0.5rem;
        }

        .mt-4 {
          margin-top: 1rem;
        }

        .mt-6 {
          margin-top: 1.5rem;
        }

        .ml-2 {
          margin-left: 0.5rem;
        }

        /* Text */
        .text-4xl {
          font-size: 2.25rem;
          line-height: 2.5rem;
        }

        .text-3xl {
          font-size: 1.875rem;
          line-height: 2.25rem;
        }

        .text-2xl {
          font-size: 1.5rem;
          line-height: 2rem;
        }

        .text-xl {
          font-size: 1.25rem;
          line-height: 1.75rem;
        }

        .text-lg {
          font-size: 1.125rem;
          line-height: 1.75rem;
        }

        .text-sm {
          font-size: 0.875rem;
          line-height: 1.25rem;
        }

        .text-xs {
          font-size: 0.75rem;
          line-height: 1rem;
        }

        .font-bold {
          font-weight: 700;
        }

        .font-semibold {
          font-weight: 600;
        }

        .text-gray-300 {
          color: rgb(209, 213, 219);
        }

        .text-gray-400 {
          color: rgb(156, 163, 175);
        }

        .text-gray-500 {
          color: rgb(107, 114, 128);
        }

        .text-amber-300 {
          color: rgb(252, 211, 77);
        }

        .text-amber-300\/70 {
          color: rgba(252, 211, 77, 0.7);
        }

        .text-red-400 {
          color: rgb(248, 113, 113);
        }

        .text-green-400 {
          color: rgb(74, 222, 128);
        }

        .text-yellow-400 {
          color: rgb(250, 204, 21);
        }

        .hover\:text-amber-300:hover {
          color: rgb(252, 211, 77);
        }

        .hover\:text-gold:hover {
          color: var(--color-gold);
        }

        .transition-colors {
          transition: color 0.3s;
        }

        .transition-all {
          transition: all 0.3s;
        }

        .transition-opacity {
          transition: opacity 0.3s;
        }

        .duration-300 {
          transition-duration: 0.3s;
        }

        .opacity-0 {
          opacity: 0;
        }

        .opacity-10 {
          opacity: 0.1;
        }

        .opacity-20 {
          opacity: 0.2;
        }

        .opacity-30 {
          opacity: 0.3;
        }

        .border {
          border-width: 1px;
        }

        .border-t {
          border-top-width: 1px;
        }

        .border-b {
          border-bottom-width: 1px;
        }

        /* Grid */
        .grid-cols-1 {
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }

        @media (min-width: 768px) {
          .md\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (min-width: 1024px) {
          .lg\:grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        /* Button */
        button {
          border: none;
          background: none;
          cursor: pointer;
          padding: 0;
          font: inherit;
        }

        .max-w-7xl {
          max-width: 80rem;
        }

        .mx-auto {
          margin-left: auto;
          margin-right: auto;
        }
      `}</style>
    </div>
  );
}
