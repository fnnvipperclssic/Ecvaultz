import React, { useState } from 'react';
import { Link } from '@inertiajs/react';

function Navbar({ scrolled }) {
    return (
        <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${
            scrolled ? 'bg-surface-50/90 backdrop-blur-xl border-b border-surface-300 shadow-lg shadow-black/20' : 'bg-transparent'
        }`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 shadow-lg shadow-primary-600/30">
                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-surface-900">Ecvaultz</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/login" className={`text-sm font-medium px-4 py-2 rounded-lg transition-all ${
                            scrolled ? 'text-surface-600 hover:text-surface-900 hover:bg-surface-200' : 'text-surface-500 hover:text-surface-800 hover:bg-white/5'
                        }`}>
                            Sign in
                        </Link>
                        <Link href="/register" className="text-sm font-medium px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-500 transition-all shadow-lg shadow-primary-600/25">
                            Get started
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="group rounded-2xl border border-surface-200 bg-surface-100 p-6 transition-all duration-300 hover:border-surface-300 hover:shadow-glow hover:-translate-y-1">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400 group-hover:bg-primary-500/15 transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-surface-800">{title}</h3>
            <p className="text-sm leading-relaxed text-surface-500">{description}</p>
        </div>
    );
}

function StepCard({ number, title, description, icon }) {
    return (
        <div className="relative flex flex-col items-center text-center group">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-600/25 group-hover:shadow-primary-600/40 group-hover:-translate-y-1 transition-all duration-300">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
            </div>
            <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary-500/15 text-sm font-bold text-primary-400">
                {number}
            </div>
            <h4 className="mb-1 text-base font-semibold text-surface-800">{title}</h4>
            <p className="text-sm text-surface-500">{description}</p>
        </div>
    );
}

function SecurityBadge({ label }) {
    return (
        <div className="flex items-center gap-2 rounded-lg border border-security-glow bg-security-glow/30 px-3 py-1.5">
            <svg className="h-4 w-4 flex-shrink-0 text-security" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium text-security-light">{label}</span>
        </div>
    );
}

export default function Landing() {
    const [scrolled, setScrolled] = useState(false);
    const [faqOpen, setFaqOpen] = useState(null);

    React.useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
            title: 'Military-Grade Encryption',
            description: 'AES-256 encryption at rest and in transit. Files encrypted with keys only you control. Argon2id password hashing.',
        },
        {
            icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
            title: 'Two-Factor Authentication',
            description: 'TOTP-based 2FA with authenticator apps. 8 recovery codes ensure you never lose access to your vault.',
        },
        {
            icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
            title: 'Secure File Sharing',
            description: 'Password-protected share links with configurable expiry. Granular read/write permissions for internal users.',
        },
        {
            icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
            title: 'Virus Scanning',
            description: 'Automatic ClamAV integration scans every upload. Malicious files rejected before they touch your storage.',
        },
        {
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
            title: 'Complete Audit Trail',
            description: 'Every action logged: logins, uploads, downloads, shares, deletions. Full visibility into your vault activity.',
        },
        {
            icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
            title: 'Organized Storage',
            description: 'Folders, instant search, grid/list views, drag-and-drop uploads. Manage thousands of files effortlessly.',
        },
    ];

    const securityFeatures = [
        'XSS & CSRF Protection',
        'SQL Injection Prevention',
        'Argon2id Password Hashing',
        'Secure Session Management',
        'File Extension & MIME Validation',
        'Server-Side Authorization Policies',
        'Secure Download Endpoints',
        'Encrypted Data at Rest',
        'Rate Limiting on All Endpoints',
        'TOTP Two-Factor Authentication',
        'Soft Delete with 30-Day Recovery',
    ];

    const steps = [
        {
            icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
            title: 'Create Your Vault',
            description: 'Sign up with a strong password. Enable 2FA for maximum protection.',
        },
        {
            icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
            title: 'Upload & Organize',
            description: 'Drag and drop files. Create folders. Every file scanned and encrypted.',
        },
        {
            icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
            title: 'Share Securely',
            description: 'Internal sharing or external links. Password protection. Full access logging.',
        },
        {
            icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
            title: 'Stay Protected',
            description: 'Continuous monitoring, intrusion detection, and automatic threat alerts keep your data safe.',
        },
    ];

    const faqs = [
        { q: 'How is my data encrypted?', a: 'Files are encrypted with AES-256 at rest. All connections use HTTPS with HSTS. Passwords are hashed with Argon2id — the gold standard. Your encryption keys are stored separately from your data.' },
        { q: 'Can I recover deleted files?', a: 'Yes. Deleted files remain in your Trash for 30 days. You can restore them with one click. After 30 days, files are permanently purged.' },
        { q: 'What is Two-Factor Authentication?', a: '2FA adds a second security layer. After your password, you enter a 6-digit code from your authenticator app (Google Authenticator, Authy, etc.). We also provide 8 one-time recovery codes.' },
        { q: 'Is there a file size limit?', a: 'Each file can be up to 50 MB. You can store unlimited files. Future plans include tiered storage for larger files and teams.' },
        { q: 'How does file sharing work?', a: 'Share internally with other Ecvaultz users (read or write permissions) or generate external share links with optional passwords and expiration dates. Every access is logged.' },
    ];

    return (
        <div className="min-h-screen bg-surface-50">
            <Navbar scrolled={scrolled} />

            {/* Hero */}
            <section className="relative overflow-hidden bg-surface-50 pt-32 pb-20 sm:pt-40 sm:pb-28">
                {/* Ambient glow orbs */}
                <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/3 h-[600px] w-[600px] rounded-full bg-primary-600/10 blur-[140px] animate-pulse-glow" />
                <div className="absolute bottom-0 left-0 -translate-x-1/4 translate-y-1/3 h-[500px] w-[500px] rounded-full bg-cyan-400/8 blur-[140px] animate-pulse-glow" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-primary-500/5 blur-[120px]" />

                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.015]">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 0)',
                        backgroundSize: '48px 48px',
                    }} />
                </div>

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-surface-300 bg-surface-100 px-4 py-1.5 shadow-glow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-security opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-security"></span>
                            </span>
                            <span className="text-sm text-surface-500">Now in public beta — Free to use</span>
                        </div>

                        <h1 className="text-4xl font-extrabold tracking-tight text-surface-900 sm:text-5xl lg:text-6xl">
                            Your Digital{' '}
                            <span className="bg-gradient-to-r from-primary-400 via-purple-300 to-accent-cyan bg-clip-text text-transparent">
                                Vault
                            </span>
                            {' '}for Maximum Security
                        </h1>

                        <p className="mt-6 text-lg leading-relaxed text-surface-500 sm:text-xl">
                            Store, manage, and share your most sensitive files with enterprise-grade encryption,
                            two-factor authentication, and complete access control — all in one secure platform.
                        </p>

                        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                            <Link href="/register" className="group inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-600/30 transition-all hover:bg-primary-500 hover:shadow-primary-500/40 hover:-translate-y-0.5">
                                Create your vault
                                <svg className="h-5 w-5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                            <a href="#features" className="inline-flex items-center gap-2 rounded-xl border border-surface-300 px-8 py-3.5 text-base font-semibold text-surface-600 transition-all hover:border-surface-400 hover:text-surface-800 hover:bg-surface-100">
                                Explore features
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </a>
                        </div>

                        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-surface-500">
                            {['No credit card required', 'Free 5 GB storage', '256-bit AES encryption'].map((text) => (
                                <div key={text} className="flex items-center gap-2">
                                    <svg className="h-4 w-4 text-security" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    {text}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="border-y border-surface-200 bg-surface-100">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                        {[
                            { value: '11', label: 'Security Layers' },
                            { value: '256-bit', label: 'AES Encryption' },
                            { value: '99.9%', label: 'Uptime SLA' },
                            { value: '24/7', label: 'Monitoring' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-3xl font-extrabold text-surface-800">{stat.value}</p>
                                <p className="mt-1 text-sm text-surface-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-20 sm:py-28 bg-surface-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center mb-16">
                        <h2 className="text-3xl font-extrabold tracking-tight text-surface-900 sm:text-4xl">
                            Built for{' '}
                            <span className="bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">Security</span>
                        </h2>
                        <p className="mt-4 text-lg text-surface-500">
                            Every feature engineered with security-first principles. Your data stays private, encrypted, and under your control.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature) => (
                            <FeatureCard key={feature.title} {...feature} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Defense in Depth */}
            <section className="border-y border-surface-200 bg-surface-100 py-20 sm:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        <div>
                            <h2 className="text-3xl font-extrabold tracking-tight text-surface-900 sm:text-4xl">
                                Enterprise-grade{' '}
                                <span className="text-security">defense</span> in depth
                            </h2>
                            <p className="mt-4 text-lg text-surface-500">
                                Implementing all 11 OWASP-recommended security controls. Protection at every layer — from browser to storage.
                            </p>

                            <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {securityFeatures.map((label) => (
                                    <SecurityBadge key={label} label={label} />
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="rounded-2xl border border-surface-200 bg-surface-50 p-8 shadow-card-lg">
                                <div className="space-y-3">
                                    {[
                                        ['Browser', 'HTTPS + HSTS + CSP Headers'],
                                        ['Application', 'CSRF + XSS + SQLi Protection'],
                                        ['Authentication', 'Argon2id + 2FA TOTP + Recovery'],
                                        ['Authorization', 'Laravel Policies + Middleware'],
                                        ['Storage', 'AES-256 + Private Vault + ClamAV'],
                                        ['Infrastructure', 'Firewall + Fail2Ban + Backups'],
                                    ].map(([layer, desc]) => (
                                        <div key={layer} className="flex items-center gap-4 rounded-lg border border-surface-200 bg-surface-100 p-3 transition-colors hover:border-surface-300">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-security-glow text-security">
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-surface-800">{layer}</p>
                                                <p className="text-xs text-surface-500">{desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 sm:py-28 bg-surface-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center mb-16">
                        <h2 className="text-3xl font-extrabold tracking-tight text-surface-900 sm:text-4xl">
                            How{' '}
                            <span className="bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">Ecvaultz</span> Works
                        </h2>
                        <p className="mt-4 text-lg text-surface-500">
                            Get started in minutes. Intuitive workflow for secure file management.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {steps.map((step, i) => (
                            <StepCard key={step.title} number={i + 1} {...step} />
                        ))}
                    </div>

                    <div className="mt-16 flex justify-center">
                        <Link href="/register" className="group inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-600/30 transition-all hover:bg-primary-500 hover:-translate-y-0.5">
                            Start your secure vault now
                            <svg className="h-5 w-5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </Link>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="border-t border-surface-200 bg-surface-100 py-20 sm:py-28">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-extrabold tracking-tight text-surface-900 sm:text-4xl">Frequently Asked Questions</h2>
                    </div>

                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <div key={i} className="rounded-xl border border-surface-200 bg-surface-50 overflow-hidden transition-colors hover:border-surface-300">
                                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="flex w-full items-center justify-between px-6 py-4 text-left">
                                    <span className="text-sm font-semibold text-surface-700">{faq.q}</span>
                                    <svg className={`h-5 w-5 flex-shrink-0 text-surface-500 transition-transform ${faqOpen === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {faqOpen === i && (
                                    <div className="px-6 pb-4">
                                        <p className="text-sm text-surface-500">{faq.a}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative overflow-hidden bg-surface-50 py-20 sm:py-28">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary-600/8 blur-[140px]" />
                <div className="absolute inset-0 opacity-[0.015]" style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 0)',
                    backgroundSize: '48px 48px',
                }} />

                <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold tracking-tight text-surface-900 sm:text-4xl">
                        Ready to secure your digital life?
                    </h2>
                    <p className="mt-4 text-lg text-surface-500">
                        Join thousands protecting their files with Ecvaultz. Start free — no credit card required.
                    </p>
                    <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                        <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-600/30 transition-all hover:bg-primary-500 hover:-translate-y-0.5">
                            Create free account
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </Link>
                        <Link href="/login" className="inline-flex items-center gap-2 rounded-xl border border-surface-300 px-8 py-3.5 text-base font-semibold text-surface-700 transition-all hover:border-surface-400 hover:text-surface-800 hover:bg-surface-100">
                            Sign in to your vault
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-surface-200 bg-surface-100 py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                        <div className="col-span-2 sm:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 shadow-lg shadow-primary-600/30">
                                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                                <span className="text-lg font-bold text-surface-800">Ecvaultz</span>
                            </div>
                            <p className="text-sm text-surface-500">Digital vault with maximum security. Built with enterprise-grade encryption.</p>
                        </div>
                        {[
                            { title: 'Product', items: ['Features', 'Security', 'Pricing', 'Changelog'] },
                            { title: 'Resources', items: ['Documentation', 'API Reference', 'Help Center', 'Blog'] },
                            { title: 'Legal', items: ['Privacy Policy', 'Terms of Service', 'GDPR', 'Security Audit'] },
                        ].map((col) => (
                            <div key={col.title}>
                                <h4 className="mb-3 text-sm font-semibold text-surface-700">{col.title}</h4>
                                <ul className="space-y-2">
                                    {col.items.map((item) => (
                                        <li key={item}><a href="#" className="text-sm text-surface-500 hover:text-surface-700 transition-colors">{item}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 border-t border-surface-200 pt-6 text-center">
                        <p className="text-sm text-surface-500">&copy; {new Date().getFullYear()} Ecvaultz. All rights reserved. Secured with 256-bit AES encryption.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
