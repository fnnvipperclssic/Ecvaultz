import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import ParticleBackground from '@/Components/ParticleBackground';

/* ── Scroll-aware Navbar ── */
function Navbar({ scrolled }) {
    return (
        <nav className={`fixed top-0 z-50 w-full transition-all duration-500 ${
            scrolled
                ? 'bg-surface-50/80 backdrop-blur-2xl border-b border-white/[0.05] shadow-lg shadow-black/30'
                : 'bg-transparent'
        }`}>
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 shadow-glow-sm shadow-primary-600/40">
                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">Ecvaultz</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/login" className={`text-sm font-medium px-4 py-2 rounded-xl transition-all duration-300 ${
                            scrolled
                                ? 'text-surface-500 hover:text-surface-800 hover:bg-surface-200'
                                : 'text-surface-400 hover:text-white hover:bg-white/5'
                        }`}>Sign in</Link>
                        <Link href="/register" className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-500 transition-all duration-300 shadow-glow-sm shadow-primary-600/30 hover:shadow-glow hover:shadow-primary-500/40 active:scale-[0.97]">
                            Get started
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

/* ── Reveal-on-scroll wrapper ── */
function Reveal({ children, delay = 0 }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); }
        }, { threshold: 0.15 });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={`reveal ${visible ? 'visible' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
            {children}
        </div>
    );
}

/* ── Feature card with hover glow ── */
function FeatureCard({ icon, title, description, index }) {
    return (
        <Reveal delay={index * 100}>
            <div className="group relative rounded-2xl bg-surface-100/60 backdrop-blur-sm border border-surface-300 hover:border-primary-500/20 p-6 transition-all duration-500 hover:shadow-glow hover:-translate-y-1">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400 group-hover:bg-primary-500/20 group-hover:text-primary-300 transition-all duration-300">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                    </svg>
                </div>
                <h3 className="mb-2 text-base font-semibold text-surface-800 group-hover:text-white transition-colors duration-300">{title}</h3>
                <p className="text-sm leading-relaxed text-surface-500">{description}</p>
            </div>
        </Reveal>
    );
}

/* ── Landing Page ── */
export default function Landing() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', title: 'AES-256-GCM Encryption', description: 'Every file encrypted with a unique per-user key. Keys stored separately from data. Files are never stored in plaintext on disk.' },
        { icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z', title: 'Two-Factor Authentication', description: 'TOTP-based 2FA with Google Authenticator or Authy. 8 one-time recovery codes. Account lockout after repeated failures.' },
        { icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316', title: 'Secure File Sharing', description: 'Internal user-to-user sharing with granular read/write permissions. External links with optional password protection and configurable expiration.' },
        { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Virus & Malware Scanning', description: 'Automatic ClamAV integration scans every upload. Malicious files rejected before they touch storage. MIME-type validation via content analysis, not just extensions.' },
        { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Complete Audit Trail', description: 'Every action logged with timestamp, IP, and user agent. Track logins, uploads, downloads, shares, and deletions. Exportable for compliance requirements.' },
        { icon: 'M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7c0-2 1-3 3-3h10c2 0 3 1 3 3M4 7h16', title: 'Smart Organization', description: 'Folder hierarchies, instant search with debounce, drag-and-drop uploads, grid and list views, bulk operations with safety confirmations.' },
    ];

    const steps = [
        { icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z', title: 'Create Your Vault', desc: 'Sign up with a strong password. Enable 2FA for maximum account protection.' },
        { icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12', title: 'Upload & Organize', desc: 'Drag and drop files. Every file is scanned, hashed, and encrypted before storage.' },
        { icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316', title: 'Share Securely', desc: 'Internal sharing or password-protected external links. Full access logging on every share.' },
        { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Monitor & Control', desc: 'Audit trail of every action. Manage sessions, revoke shares, and stay in control.' },
    ];

    return (
        <div className="min-h-screen bg-surface-50 relative overflow-hidden">
            {/* Animated particle network */}
            <ParticleBackground particleColor="139, 69, 255" particleCount={65} />

            <Navbar scrolled={scrolled} />

            {/* ═══════════════ HERO ═══════════════ */}
            <section className="relative pt-32 pb-24 sm:pt-44 sm:pb-32">
                {/* Glow orbs */}
                <div className="absolute top-20 right-1/4 w-[500px] h-[500px] rounded-full bg-primary-600/8 blur-[180px] animate-pulse-glow pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-cyan-400/6 blur-[150px] animate-pulse-glow pointer-events-none" style={{ animationDelay: '2s' }} />

                <div className="relative z-10 mx-auto max-w-4xl px-6 lg:px-8 text-center">
                    {/* Beta badge */}
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/5 px-4 py-1.5 backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                        </span>
                        <span className="text-sm text-surface-500">Now in public beta</span>
                    </div>

                    {/* Main heading */}
                    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.1]">
                        Your Digital{' '}
                        <span className="bg-gradient-to-r from-primary-400 via-purple-300 to-accent-cyan bg-clip-text text-transparent">
                            Vault
                        </span>
                        <br />
                        <span className="text-surface-600">Built for Maximum Security</span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-surface-500 sm:text-xl">
                        Store, manage, and share sensitive files with AES-256-GCM encryption,
                        two-factor authentication, and defense-in-depth security — in one platform.
                    </p>

                    {/* CTA buttons */}
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/register" className="group inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 text-base font-semibold text-white shadow-glow shadow-primary-600/30 transition-all duration-300 hover:bg-primary-500 hover:shadow-glow-lg hover:-translate-y-0.5 active:scale-[0.97]">
                            Create your free vault
                            <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                        <a href="#features" className="inline-flex items-center gap-2 rounded-xl border border-surface-400 bg-surface-100/60 backdrop-blur-sm px-8 py-3.5 text-base font-semibold text-surface-600 transition-all duration-300 hover:border-surface-500 hover:text-surface-800 hover:bg-surface-200/60">
                            Explore features
                        </a>
                    </div>

                    {/* Trust indicators */}
                    <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
                        {[
                            { label: 'Encryption', value: 'AES-256-GCM' },
                            { label: '2FA', value: 'TOTP + Recovery' },
                            { label: 'Uptime', value: '99.9% SLA' },
                            { label: 'Support', value: '24/7 Monitoring' },
                        ].map((item) => (
                            <div key={item.label} className="text-center">
                                <div className="text-lg font-bold text-white">{item.value}</div>
                                <div className="text-xs text-surface-500 mt-1">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ FEATURES ═══════════════ */}
            <section id="features" className="relative py-24 sm:py-32">
                <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
                <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                    <Reveal>
                        <div className="mx-auto max-w-2xl text-center mb-16">
                            <p className="text-sm font-semibold text-primary-400 uppercase tracking-widest">Features</p>
                            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                                Security Without Compromise
                            </h2>
                            <p className="mt-4 text-lg text-surface-500">
                                Defense-in-depth architecture protects your data at every layer — from network to storage.
                            </p>
                        </div>
                    </Reveal>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((f, i) => <FeatureCard key={i} {...f} index={i} />)}
                    </div>
                </div>
            </section>

            {/* ═══════════════ HOW IT WORKS ═══════════════ */}
            <section className="relative py-24 sm:py-32 bg-surface-100/30">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <Reveal>
                        <div className="mx-auto max-w-2xl text-center mb-16">
                            <p className="text-sm font-semibold text-primary-400 uppercase tracking-widest">How It Works</p>
                            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Start in Minutes</h2>
                        </div>
                    </Reveal>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((step, i) => (
                            <Reveal key={i} delay={i * 150}>
                                <div className="relative flex flex-col items-center text-center group">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600/15 text-primary-400 border border-primary-500/20 group-hover:bg-primary-600/25 group-hover:scale-110 transition-all duration-300">
                                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                                        </svg>
                                    </div>
                                    <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary-500/15 text-sm font-bold text-primary-400">
                                        {i + 1}
                                    </div>
                                    <h4 className="mb-1 text-base font-semibold text-white">{step.title}</h4>
                                    <p className="text-sm text-surface-500">{step.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ CTA ═══════════════ */}
            <section className="relative py-24 sm:py-32">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[600px] h-[300px] rounded-full bg-primary-600/8 blur-[150px]" />
                </div>
                <Reveal>
                    <div className="relative z-10 mx-auto max-w-2xl text-center px-6">
                        <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to Secure Your Files?</h2>
                        <p className="mt-4 text-lg text-surface-500">Free to start. No credit card required. Enterprise-grade security from day one.</p>
                        <div className="mt-10">
                            <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-10 py-4 text-lg font-semibold text-white shadow-glow shadow-primary-600/30 transition-all duration-300 hover:bg-primary-500 hover:shadow-glow-lg hover:-translate-y-0.5 active:scale-[0.97]">
                                Create your vault
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* ═══════════════ FOOTER ═══════════════ */}
            <footer className="border-t border-surface-300 bg-surface-100/50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
                                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold text-surface-600">Ecvaultz</span>
                        </div>
                        <p className="text-xs text-surface-500">
                            &copy; {new Date().getFullYear()} Ecvaultz. Protected by AES-256-GCM encryption.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
