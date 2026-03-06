import React from 'react';
import { Link } from 'react-router-dom';
import { AnimatedPage, StaggerContainer, StaggerItem } from '../components/AnimatedPage';
import { BackgroundBoxes } from '../components/BackgroundBoxes';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FloatingNav } from '../components/FloatingNav';
import { Brain, Workflow, Activity, Zap, ArrowRight, Github, BookOpen, Radio } from 'lucide-react';

const features = [
    {
        icon: <Brain size={28} />,
        title: 'Natural Language Parsing',
        description: 'Describe your automation in plain English. Our AI converts your instructions into structured workflow steps automatically.',
    },
    {
        icon: <Workflow size={28} />,
        title: 'Visual Flow Editor',
        description: 'Inspect and fine-tune your workflows with an intuitive drag-and-drop node editor powered by React Flow.',
    },
    {
        icon: <Activity size={28} />,
        title: 'Execution & Monitoring',
        description: 'Activate workflows with one click. Monitor real-time execution logs and track success rates effortlessly.',
    },
];

const steps = [
    { number: '01', title: 'Describe', description: 'Type your automation instruction in natural language' },
    { number: '02', title: 'Review', description: 'Inspect the generated visual workflow and edit nodes' },
    { number: '03', title: 'Activate', description: 'Deploy your workflow and monitor execution logs' },
];

export const LandingPage: React.FC = () => {
    return (
        <AnimatedPage>
            <FloatingNav />

            {/* Hero Section */}
            <section
                style={{
                    position: 'relative',
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    padding: '96px 24px 96px',
                }}
            >
                <BackgroundBoxes rows={18} cols={28} />

                {/* Glowing orbs */}
                <div style={{
                    position: 'absolute',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
                    top: '10%',
                    left: '20%',
                    filter: 'blur(60px)',
                    pointerEvents: 'none',
                    zIndex: 0,
                }} />
                <div style={{
                    position: 'absolute',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)',
                    bottom: '20%',
                    right: '15%',
                    filter: 'blur(60px)',
                    pointerEvents: 'none',
                    zIndex: 0,
                }} />

                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '800px' }}>
                    {/* Pill badge */}
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(99,102,241,0.1)',
                            border: '1px solid rgba(99,102,241,0.2)',
                            borderRadius: '9999px',
                            padding: '6px 16px',
                            marginBottom: '32px',
                            fontSize: '13px',
                            color: '#818cf8',
                            fontWeight: 500,
                        }}
                    >
                        <Zap size={14} />
                        AI-Powered Workflow Automation
                    </div>

                    {/* Headline */}
                    <h1
                        style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: 'clamp(40px, 6vw, 64px)',
                            fontWeight: 800,
                            lineHeight: 1.1,
                            marginBottom: '24px',
                            color: '#f1f5f9',
                        }}
                    >
                        Describe It.
                        <br />
                        <span
                            style={{
                                background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Automate It.
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p
                        style={{
                            fontSize: '18px',
                            color: '#94a3b8',
                            maxWidth: '560px',
                            margin: '0 auto 40px',
                            lineHeight: 1.6,
                        }}
                    >
                        Transform plain English into powerful automated workflows. Our NLP engine parses your instructions into visual, editable flows you can deploy in seconds.
                    </p>

                    {/* CTAs */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <Link to="/signup" style={{ textDecoration: 'none' }}>
                            <Button variant="primary" size="lg">
                                Start Building Free
                                <ArrowRight size={18} />
                            </Button>
                        </Link>
                        <a href="#how-it-works" style={{ textDecoration: 'none' }}>
                            <Button variant="ghost" size="lg">See How It Works</Button>
                        </a>
                    </div>

                    {/* Canvas mockup */}
                    <div style={{ marginTop: '80px', position: 'relative' }}>
                        <div
                            style={{
                                background: '#111118',
                                border: '1px solid #1e1e2e',
                                borderRadius: '20px',
                                padding: '32px',
                                boxShadow: '0 0 60px rgba(99,102,241,0.1), 0 20px 60px rgba(0,0,0,0.5)',
                            }}
                        >
                            <svg width="100%" height="200" viewBox="0 0 700 200">
                                {/* Trigger node */}
                                <rect x="40" y="70" width="140" height="60" rx="12" fill="#111118" stroke="rgba(167,139,250,0.5)" strokeWidth="2" />
                                <text x="110" y="95" textAnchor="middle" fill="#a78bfa" fontSize="10" fontWeight="600">TRIGGER</text>
                                <text x="110" y="115" textAnchor="middle" fill="#f1f5f9" fontSize="13" fontWeight="500">Email Received</text>

                                {/* Condition node */}
                                <rect x="280" y="70" width="140" height="60" rx="12" fill="#111118" stroke="rgba(251,191,36,0.5)" strokeWidth="2" />
                                <text x="350" y="95" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="600">CONDITION</text>
                                <text x="350" y="115" textAnchor="middle" fill="#f1f5f9" fontSize="13" fontWeight="500">From Manager?</text>

                                {/* Action node */}
                                <rect x="520" y="70" width="140" height="60" rx="12" fill="#111118" stroke="rgba(99,102,241,0.5)" strokeWidth="2" />
                                <text x="590" y="95" textAnchor="middle" fill="#818cf8" fontSize="10" fontWeight="600">ACTION</text>
                                <text x="590" y="115" textAnchor="middle" fill="#f1f5f9" fontSize="13" fontWeight="500">Post to Slack</text>

                                {/* Connecting lines */}
                                <line x1="180" y1="100" x2="280" y2="100" stroke="#6366f1" strokeWidth="2" strokeDasharray="6 3">
                                    <animate attributeName="stroke-dashoffset" from="18" to="0" dur="1.5s" repeatCount="indefinite" />
                                </line>
                                <line x1="420" y1="100" x2="520" y2="100" stroke="#6366f1" strokeWidth="2" strokeDasharray="6 3">
                                    <animate attributeName="stroke-dashoffset" from="18" to="0" dur="1.5s" repeatCount="indefinite" />
                                </line>

                                {/* Arrow heads */}
                                <polygon points="278,95 278,105 268,100" fill="#6366f1" />
                                <polygon points="518,95 518,105 508,100" fill="#6366f1" />
                            </svg>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" style={{ padding: '96px 24px', maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <StaggerContainer>
                    <StaggerItem>
                        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                            <h2
                                style={{
                                    fontFamily: "'Syne', sans-serif",
                                    fontSize: '32px',
                                    fontWeight: 700,
                                    color: '#f1f5f9',
                                    marginBottom: '16px',
                                }}
                            >
                                Everything You Need
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>
                                From natural language to live automation — all in one platform.
                            </p>
                        </div>
                    </StaggerItem>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                        {features.map((feature, i) => (
                            <StaggerItem key={i}>
                                <Card hover style={{ height: '100%' }}>
                                    <div
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            background: 'rgba(99,102,241,0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#6366f1',
                                            marginBottom: '20px',
                                            boxShadow: '0 0 20px rgba(99,102,241,0.15)',
                                        }}
                                    >
                                        {feature.icon}
                                    </div>
                                    <h3
                                        style={{
                                            fontFamily: "'Syne', sans-serif",
                                            fontSize: '20px',
                                            fontWeight: 700,
                                            color: '#f1f5f9',
                                            marginBottom: '12px',
                                        }}
                                    >
                                        {feature.title}
                                    </h3>
                                    <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
                                        {feature.description}
                                    </p>
                                </Card>
                            </StaggerItem>
                        ))}
                    </div>
                </StaggerContainer>
            </section>

            {/* How It Works */}
            <section id="how-it-works" style={{ padding: '96px 24px', maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <StaggerContainer>
                    <StaggerItem>
                        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                            <h2
                                style={{
                                    fontFamily: "'Syne', sans-serif",
                                    fontSize: '32px',
                                    fontWeight: 700,
                                    color: '#f1f5f9',
                                    marginBottom: '16px',
                                }}
                            >
                                How It Works
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>
                                Three simple steps from idea to live automation.
                            </p>
                        </div>
                    </StaggerItem>

                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        {steps.map((step, i) => (
                            <React.Fragment key={i}>
                                <StaggerItem style={{ flex: '1', minWidth: '220px', maxWidth: '300px', textAlign: 'center' }}>
                                    <div
                                        style={{
                                            fontFamily: "'Syne', sans-serif",
                                            fontSize: '48px',
                                            fontWeight: 800,
                                            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                            marginBottom: '16px',
                                        }}
                                    >
                                        {step.number}
                                    </div>
                                    <h3
                                        style={{
                                            fontFamily: "'Syne', sans-serif",
                                            fontSize: '20px',
                                            fontWeight: 700,
                                            color: '#f1f5f9',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        {step.title}
                                    </h3>
                                    <p style={{ color: '#94a3b8', fontSize: '14px' }}>{step.description}</p>
                                </StaggerItem>
                                {i < steps.length - 1 && (
                                    <div
                                        style={{
                                            alignSelf: 'center',
                                            color: '#1e1e2e',
                                            display: 'flex',
                                            alignItems: 'center',
                                            paddingTop: '0px',
                                        }}
                                    >
                                        <svg width="60" height="2" style={{ marginTop: '-40px' }}>
                                            <line x1="0" y1="1" x2="60" y2="1" stroke="#1e1e2e" strokeWidth="2" strokeDasharray="6 4" />
                                        </svg>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </StaggerContainer>
            </section>

            {/* Footer */}
            <footer
                style={{
                    borderTop: '1px solid #1e1e2e',
                    padding: '48px 24px',
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={18} style={{ color: '#6366f1' }} />
                        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#f1f5f9' }}>FlowAI</span>
                    </div>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <a href="#" style={{ color: '#475569', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'} onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                            <BookOpen size={14} /> Docs
                        </a>
                        <a href="#" style={{ color: '#475569', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'} onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                            <Github size={14} /> GitHub
                        </a>
                        <a href="#" style={{ color: '#475569', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'} onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                            <Radio size={14} /> Status
                        </a>
                    </div>
                    <p style={{ color: '#475569', fontSize: '13px' }}>© 2026 FlowAI. All rights reserved.</p>
                </div>
            </footer>
        </AnimatedPage>
    );
};
