import React from 'react';
import { Link } from 'react-router-dom';
import { AnimatedPage, StaggerContainer, StaggerItem } from '../components/AnimatedPage';
import { BackgroundBoxes } from '../components/BackgroundBoxes';
import { Button } from '../components/ui/button';
import { FloatingNav } from '../components/FloatingNav';
import { EtherealShadow } from '../components/EtherealShadow';
import { Component as EtherealBackgroundUI } from '../components/ui/etheral-shadow';
import { Brain, Workflow, Activity, Zap, ArrowRight, Github, Twitter, Linkedin } from 'lucide-react';

const features = [
    {
        icon: <Brain size={28} className="text-[#6366f1]" />,
        title: 'Natural Language Parsing',
        description: 'Describe your automation in plain English. Our AI converts your instructions into structured workflow steps automatically.',
    },
    {
        icon: <Workflow size={28} className="text-[#6366f1]" />,
        title: 'Visual Flow Editor',
        description: 'Inspect and fine-tune your workflows with an intuitive drag-and-drop node editor powered by React Flow.',
    },
    {
        icon: <Activity size={28} className="text-[#6366f1]" />,
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
        <div className="bg-[#0a0a0f] text-[#f1f5f9] min-h-screen overflow-x-hidden">
            <FloatingNav />

            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center px-8 md:px-12 overflow-hidden bg-[#0a0a0f]">
                {/* Spacer to clear Fixed Nav (approx 120px) */}
                <div className="h-[120px] md:h-[160px] shrink-0" />
                {/* Background Grid */}
                <div className="absolute inset-0 z-0">
                    <BackgroundBoxes rows={24} cols={32} />
                    <div className="absolute inset-0 opacity-40">
                        <EtherealBackgroundUI
                            color="rgba(99, 102, 241, 0.4)"
                            animation={{ scale: 60, speed: 50 }}
                            noise={{ opacity: 0.2, scale: 1.1 }}
                            sizing="fill"
                        />
                    </div>
                </div>

                {/* Glowing depth orbs */}
                <div className="absolute top-[15%] left-[10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none z-0" />
                <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none z-0" />

                <AnimatedPage className="relative z-10 w-full max-w-5xl mx-auto text-center flex flex-col items-center">
                    <StaggerContainer className="flex flex-col items-center w-full">
                        <StaggerItem>
                            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[#818cf8] text-sm font-bold mb-10 backdrop-blur-sm mx-auto">
                                <Zap size={14} className="animate-pulse" />
                                AI-Powered Workflow Automation
                            </div>
                        </StaggerItem>

                        <StaggerItem>
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black tracking-tight leading-[1.1] mb-6 pointer-events-none">
                                <span className="block text-white">Describe It.</span>
                                <span className="block bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                                    Automate It.
                                </span>
                            </h1>
                            <p className="text-[#94a3b8] text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed font-medium px-4">
                                Transform plain English into powerful automated workflows. Our NLP engine parses your instructions into visual, editable flows you can deploy in seconds.
                            </p>
                        </StaggerItem>

                        <StaggerItem>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-5 w-full max-w-md mx-auto mb-16 px-4">
                                <Button asChild size="lg" className="w-full md:w-auto h-14 md:h-16 px-12 text-base md:text-lg bg-violet-600 hover:bg-violet-700 border-2 border-violet-400/30 shadow-xl shadow-violet-500/20 transition-all hover:scale-110 group text-white rounded-full font-bold">
                                    <Link to="/signup">
                                        Start Building Free
                                        <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="w-full md:w-auto h-14 md:h-16 px-12 text-base md:text-lg border-2 border-violet-500/50 hover:bg-white/5 bg-transparent text-white transition-all shadow-lg shadow-indigo-500/10 rounded-full font-bold hover:scale-105">
                                    <a href="#how-it-works">See How It Works</a>
                                </Button>
                            </div>
                        </StaggerItem>

                        <StaggerItem className="mt-8 w-full max-w-4xl px-4">
                            <div className="relative group scale-90 md:scale-100 opacity-90 transition-all hover:opacity-100 hover:scale-105">
                                <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-[2rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                                <div className="relative bg-[#0d0d12]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl p-6 md:p-10">
                                    <div className="flex flex-col gap-4">
                                        {/* Row 1: Primary (Email -> Slack) */}
                                        <div className="aspect-[20/4] bg-indigo-500/10 rounded-[1.2rem] relative overflow-hidden flex items-center justify-between px-6 md:px-12 border border-indigo-500/20 shadow-lg">
                                            <div className="flex items-center gap-3 md:gap-6">
                                                <div className="px-3 py-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-[10px] md:text-sm font-black text-indigo-400 tracking-wider uppercase">Trigger</div>
                                                <div className="text-sm md:text-lg font-bold text-white">Email Arrives</div>
                                            </div>
                                            <ArrowRight className="text-violet-500 w-5 h-5 md:w-8 md:h-8" />
                                            <div className="flex items-center gap-3 md:gap-6">
                                                <div className="text-sm md:text-lg font-bold text-white">Slack Message</div>
                                                <div className="px-3 py-1.5 rounded-lg border border-violet-500/20 bg-violet-500/10 text-[10px] md:text-sm font-black text-violet-400 tracking-wider uppercase">Action</div>
                                            </div>
                                        </div>

                                        {/* Row 2: Secondary (Trello -> Notion) - Stacked Effect */}
                                        <div className="aspect-[20/3] bg-white/10 rounded-[1rem] relative overflow-hidden flex items-center justify-between px-6 md:px-12 border border-white/5 opacity-80 scale-95 origin-top transition-all duration-300">
                                            <div className="flex items-center gap-4">
                                                <div className="text-sm font-bold text-gray-100">Trello Card Created</div>
                                            </div>
                                            <ArrowRight className="text-gray-400 w-4 h-4" />
                                            <div className="flex items-center gap-4">
                                                <div className="text-sm font-bold text-gray-100">Notion Page Created</div>
                                            </div>
                                        </div>

                                        {/* Row 3: Tertiary (Form -> Sheets) - Subtle Gradient */}
                                        <div className="aspect-[20/2.5] bg-white/10 rounded-[0.8rem] relative overflow-hidden flex items-center justify-between px-6 md:px-12 border border-white/5 opacity-60 scale-90 origin-top transition-all duration-300">
                                            <div className="flex items-center gap-4">
                                                <div className="text-sm font-medium text-gray-200">Form Submitted</div>
                                            </div>
                                            <ArrowRight className="text-gray-500 w-3 h-3" />
                                            <div className="flex items-center gap-4">
                                                <div className="text-sm font-medium text-gray-200">Sheets Row Added</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </StaggerItem>
                    </StaggerContainer>
                </AnimatedPage>
            </section>

            {/* Content Sections with Ethereal Background */}
            <div className="relative w-full">
                <div className="absolute inset-0 z-0 pointer-events-none w-full h-full overflow-hidden">
                    <EtherealShadow
                        color="rgba(99, 102, 241, 0.25)"
                        animation={{ scale: 40, speed: 60 }}
                        noise={{ opacity: 0.2, scale: 1.2 }}
                        sizing="fill"
                    />
                </div>
                
                {/* Features Section */}
                <section id="features" className="py-24 px-6 relative z-10">
                    <div className="w-full max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="font-display text-4xl font-bold mb-4 tracking-tight text-center w-full">Everything You Need</h2>
                            <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto text-center">
                                From natural language to live automation — all in one platform.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                            {features.map((feature, i) => (
                                <div 
                                    key={i}
                                    className="p-6 rounded-2xl border border-violet-500/20 bg-white/5 backdrop-blur-sm text-left transition-all hover:bg-white/10 hover:border-violet-500/40 group"
                                >
                                    <div className="mb-4 text-violet-400 group-hover:scale-110 transition-transform w-fit">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mt-3">{feature.title}</h3>
                                    <p className="text-sm text-gray-400 mt-2 leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section id="how-it-works" className="py-24 px-6 relative z-10 mt-24 pb-32">
                    <div className="w-full max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="font-display text-4xl font-bold mb-4 tracking-tight text-center">How It Works</h2>
                            <p className="text-[#94a3b8] text-lg max-w-xl mx-auto text-center">
                                Three simple steps from idea to live automation.
                            </p>
                        </div>

                        <div className="flex flex-row justify-center items-start gap-8 mt-12 flex-wrap text-center">
                            {steps.map((step, i) => (
                                <React.Fragment key={i}>
                                    <div className="flex flex-col items-center text-center max-w-[200px]">
                                        <div className="w-14 h-14 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-lg mx-auto shadow-lg shadow-violet-600/20">
                                            {step.number}
                                        </div>
                                        <h3 className="font-semibold text-white mt-4">{step.title}</h3>
                                        <p className="text-sm text-gray-400 mt-2">{step.description}</p>
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div className="hidden md:block flex-1 border-t border-dashed border-violet-500/30 mt-7 min-w-[40px] max-w-[120px]" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="py-16 px-6 border-t border-white/5 bg-[#0a0a0f]/50 backdrop-blur-md">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <Zap size={22} className="text-[#6366f1]" />
                        <span className="font-display font-bold text-xl tracking-tight">FlowAI</span>
                    </div>
                    
                    <div className="flex items-center gap-8 text-sm text-[#475569]">
                        <a href="https://github.com/atcham-d/ai-task-automator-NLP#readme" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">Documentation</a>
                        <a href="https://github.com/atcham-d/ai-task-automator-NLP" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">GitHub</a>
                        <a href="#" className="hover:text-indigo-400 transition-colors opacity-50 cursor-not-allowed">Status</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <Github size={20} className="text-[#475569] hover:text-[#f1f5f9] cursor-pointer transition-colors" />
                        <Twitter size={20} className="text-[#475569] hover:text-[#f1f5f9] cursor-pointer transition-colors" />
                        <Linkedin size={20} className="text-[#475569] hover:text-[#f1f5f9] cursor-pointer transition-colors" />
                    </div>
                </div>
                <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#475569]">
                    <p>&copy; {new Date().getFullYear()} FlowAI. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-[#f1f5f9]">Privacy</a>
                        <a href="#" className="hover:text-[#f1f5f9]">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
