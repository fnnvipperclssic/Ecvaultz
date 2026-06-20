import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from '@inertiajs/react';
import ParticleBackground from '@/Components/ParticleBackground';

/* ══════════════════════════════════════════════
   ECVAULTZ LANDING — Premium Immersive Design
   ══════════════════════════════════════════════ */

function Navbar({ scrolled }) {
    return (
        <nav className={`fixed top-0 z-50 w-full transition-all duration-500 ${
            scrolled ? 'glass-nav shadow-elevation-2' : 'bg-transparent'
        }`}>
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-glow-sm">
                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">Ecvaultz</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-6">
                        <a href="#features" className={`text-sm font-medium transition-colors ${scrolled ? 'text-surface-500 hover:text-surface-800' : 'text-surface-400 hover:text-white'}`}>Features</a>
                        <a href="#how" className={`text-sm font-medium transition-colors ${scrolled ? 'text-surface-500 hover:text-surface-800' : 'text-surface-400 hover:text-white'}`}>How It Works</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/login" className={`text-sm font-medium px-4 py-2 rounded-xl transition-all ${scrolled ? 'text-surface-500 hover:text-surface-800 hover:bg-surface-200' : 'text-surface-400 hover:text-white hover:bg-white/5'}`}>Sign in</Link>
                        <Link href="/register" className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-500 transition-all duration-300 shadow-glow-sm hover:shadow-glow active:scale-[0.97]">Get Started</Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

function Reveal({ children, delay = 0 }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } }, { threshold: 0.1 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return <div ref={ref} className={`reveal ${visible ? 'visible' : ''}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

function AnimatedCounter({ target, label, suffix = '', duration = 2000 }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const counted = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !counted.current) {
                counted.current = true;
                const start = performance.now();
                const animate = (now) => {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    setCount(Math.round(eased * target));
                    if (progress < 1) requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
            }
        }, { threshold: 0.3 });
        obs.observe(el);
        return () => obs.disconnect();
    }, [target, duration]);

    return (
        <div ref={ref} className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-white">{count}{suffix}</div>
            <div className="text-xs text-surface-500 mt-1">{label}</div>
        </div>
    );
}

export default function Landing() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', h, { passive: true });
        return () => window.removeEventListener('scroll', h);
    }, []);

    return (
        <div className="min-h-screen bg-surface-50 relative overflow-hidden">
            {/* Multi-layer animated background */}
            <ParticleBackground particleColor="139,69,255" particleCount={60} />
            <div className="fixed top-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-primary-600/6 blur-[180px] animate-pulse-glow pointer-events-none" />
            <div className="fixed bottom-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-400/5 blur-[160px] animate-pulse-glow pointer-events-none" style={{ animationDelay: '2s' }} />
            <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />

            <Navbar scrolled={scrolled} />

            {/* ═══════════ HERO ═══════════ */}
            <section className="relative pt-36 pb-28 sm:pt-48 sm:pb-36">
                <div className="relative z-10 mx-auto max-w-5xl px-6 lg:px-8 text-center">
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/5 backdrop-blur-sm px-4 py-1.5 animate-fade-in">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                        </span>
                        <span className="text-sm text-surface-500">Now in public beta — Free to use</span>
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.1] animate-slide-up">
                        Your Digital{' '}
                        <span className="text-gradient">Vault</span>
                        <br />
                        <span className="text-surface-500">for Maximum Security</span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-surface-500 sm:text-xl animate-slide-up" style={{ animationDelay: '100ms' }}>
                        AES-256-GCM encryption. Two-factor authentication. Zero-knowledge architecture.
                        Store, share, and protect your most sensitive files — all in one place.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
                        <Link href="/register" className="group inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-4 text-base font-semibold text-white shadow-glow shadow-primary-600/30 transition-all duration-300 hover:bg-primary-500 hover:shadow-glow-lg hover:-translate-y-0.5 active:scale-[0.97]">
                            Create your free vault
                            <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                        <a href="#features" className="inline-flex items-center gap-2 rounded-xl border border-surface-400 bg-surface-100/60 backdrop-blur-sm px-8 py-4 text-base font-semibold text-surface-600 transition-all duration-300 hover:border-surface-500 hover:text-surface-800 hover:bg-surface-200/60">
                            Explore features
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </a>
                    </div>

                    {/* Trust stats */}
                    <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl mx-auto">
                        <AnimatedCounter target={256} label="Bit Encryption" />
                        <AnimatedCounter target={11} label="Security Layers" />
                        <AnimatedCounter target={99.9} label="Uptime %" suffix="%" />
                        <AnimatedCounter target={24} label="Monitoring" suffix="/7" />
                    </div>
                </div>
            </section>

            {/* ═══════════ FEATURES ═══════════ */}
            <section id="features" className="relative py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <Reveal>
                        <div className="mx-auto max-w-2xl text-center mb-16">
                            <p className="text-sm font-semibold text-primary-400 uppercase tracking-widest">Enterprise Security</p>
                            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Everything you need to protect your data</h2>
                            <p className="mt-4 text-lg text-surface-500">Defense-in-depth architecture with military-grade encryption at every layer.</p>
                        </div>
                    </Reveal>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', title: 'AES-256-GCM Encryption', desc: 'Files encrypted with unique per-user keys. Keys stored separately. Plaintext never touches disk.' },
                            { icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z', title: 'Two-Factor Auth', desc: 'TOTP authenticator apps. Recovery codes. Account lockout. Conditional access policies.' },
                            { icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684', title: 'Secure Sharing', desc: 'Internal & external shares. Password protection. Expiry dates. Full access logging.' },
                            { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944', title: 'Virus Scanning', desc: 'ClamAV integration. MIME validation via content analysis. SHA-256 integrity verification.' },
                            { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Audit Trail', desc: 'Complete activity logs. IP tracking. Export for compliance. Immutable record keeping.' },
                            { icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0', title: 'Role-Based Access', desc: 'Granular permissions. Admin & User roles. 28 permission scopes. Policy-based authorization.' },
                        ].map((f, i) => (
                            <Reveal key={i} delay={i * 100}>
                                <div className="group glass rounded-2xl p-6 glass-hover transition-all duration-500">
                                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400 group-hover:bg-primary-500/20 group-hover:text-primary-300 transition-all duration-300 group-hover:scale-110">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={f.icon} /></svg>
                                    </div>
                                    <h3 className="mb-2 text-base font-semibold text-white group-hover:text-white transition-colors">{f.title}</h3>
                                    <p className="text-sm leading-relaxed text-surface-500">{f.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ HOW IT WORKS ═══════════ */}
            <section id="how" className="relative py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <Reveal>
                        <div className="mx-auto max-w-2xl text-center mb-16">
                            <p className="text-sm font-semibold text-primary-400 uppercase tracking-widest">Simple Workflow</p>
                            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Secure in 4 steps</h2>
                        </div>
                    </Reveal>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { step: '01', title: 'Create Account', desc: 'Sign up with email and a strong password. Enable 2FA for maximum protection.' },
                            { step: '02', title: 'Upload Files', desc: 'Drag and drop. Every file is scanned, hashed, then encrypted before storage.' },
                            { step: '03', title: 'Organize & Share', desc: 'Create folders. Share securely with internal users or external links.' },
                            { step: '04', title: 'Monitor & Control', desc: 'Track all activity. Manage access. Stay in complete control.' },
                        ].map((s, i) => (
                            <Reveal key={i} delay={i * 150}>
                                <div className="text-center group">
                                    <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600/15 text-primary-400 border border-primary-500/20 group-hover:bg-primary-600/25 group-hover:scale-110 transition-all duration-300">
                                        <span className="text-xl font-bold">{s.step}</span>
                                    </div>
                                    <h4 className="mb-2 text-base font-semibold text-white">{s.title}</h4>
                                    <p className="text-sm text-surface-500">{s.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ CTA ═══════════ */}
            <section className="relative py-24 sm:py-32">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[600px] h-[300px] rounded-full bg-primary-600/6 blur-[150px]" />
                </div>
                <Reveal>
                    <div className="relative z-10 mx-auto max-w-2xl text-center px-6">
                        <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to secure your files?</h2>
                        <p className="mt-4 text-lg text-surface-500">Free to start. No credit card. Enterprise-grade security from day one.</p>
                        <div className="mt-10">
                            <Link href="/register" className="btn-neon px-10 py-4 text-lg gap-2">
                                Create your vault
                                <svg className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </Link>
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* ═══════════ FOOTER ═══════════ */}
            <footer className="border-t border-surface-300">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600"><svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>
                            <span className="text-sm font-semibold text-surface-600">Ecvaultz</span>
                        </div>
                        <p className="text-xs text-surface-500">&copy; {new Date().getFullYear()} Ecvaultz. Protected by AES-256-GCM.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
