import Link from "next/link";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkText: string;
  footerHref: string;
}

const features = [
  "Real-time messaging",
  "End-to-end encrypted channels",
  "Works on every device",
];

export function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerHref,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row lg:items-stretch">
      {/* Brand panel */}
      <div className="relative hidden min-h-screen flex-1 overflow-hidden lg:flex lg:min-h-screen lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-700 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_50%)]" />
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-8 p-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <span className="text-xl font-semibold text-white">PulseChat</span>
          </Link>

          <div className="max-w-md space-y-4">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
              Connect instantly.
              <br />
              <span className="text-indigo-200">Chat without limits.</span>
            </h1>
            <p className="text-lg text-indigo-100/80">
              A modern messaging experience built for teams and friends.
            </p>
          </div>

          <ul className="space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-indigo-100">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <svg
                    className="h-3.5 w-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 p-12 text-sm text-indigo-200/60">
          © {new Date().getFullYear()} PulseChat. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-slate-950 px-6 py-12">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
            <svg
              className="h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <span className="text-lg font-semibold text-white">PulseChat</span>
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {title}
            </h2>
            <p className="text-slate-400">{subtitle}</p>
          </div>

          {children}

          <p className="text-center text-sm text-slate-500">
            {footerText}{" "}
            <Link
              href={footerHref}
              className="font-medium text-indigo-400 transition-colors hover:text-indigo-300"
            >
              {footerLinkText}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
