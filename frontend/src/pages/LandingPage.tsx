import React from 'react';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
    return (
        <div className="bg-[#0a0a0f] font-['DM_Sans'] text-slate-100 selection:bg-indigo-500/30">
            <div className="relative min-h-screen overflow-x-hidden">
                {/* Hero Background Grid */}
                <div className="absolute inset-0 grid-bg pointer-events-none opacity-50"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-[#2c2fed]/10 to-transparent blur-3xl rounded-full opacity-30"></div>
                
                {/* Navigation */}
                <header className="relative z-50 px-6 py-6 md:px-12 flex items-center justify-between border-b border-[#1e1e2e]/50 bg-[#0a0a0f]/80 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#2c2fed] rounded-lg flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-xl">account_tree</span>
                        </div>
                        <h1 className="font-['Syne'] text-2xl font-bold tracking-tight text-white">FlowAI</h1>
                    </div>
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                        <a className="hover:text-[#2c2fed] transition-colors" href="#features">Features</a>
                        <a className="hover:text-[#2c2fed] transition-colors" href="#how-it-works">How It Works</a>
                        <a className="hover:text-[#2c2fed] transition-colors" href="https://github.com/atcham-d/ai-task-automator-NLP#readme" target="_blank" rel="noopener noreferrer">Docs</a>
                        <a className="hover:text-[#2c2fed] transition-colors" href="https://github.com/atcham-d/ai-task-automator-NLP" target="_blank" rel="noopener noreferrer">GitHub</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="hidden sm:block px-5 py-2 text-sm font-semibold text-white/80 hover:text-white no-underline transition-colors active:text-white visited:text-white/80">
                            Login
                        </Link>
                        <Link 
                            to="/signup" 
                            className="px-5 py-2 text-sm font-bold bg-[#2c2fed] hover:bg-[#2c2fed]/90 text-white rounded-full transition-all glow-indigo no-underline"
                        >
                            Start Building Free
                        </Link>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="relative z-10 px-6 pt-20 pb-32 text-center max-w-6xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2c2fed]/10 border border-[#2c2fed]/20 text-[#2c2fed] text-xs font-bold uppercase tracking-widest mb-8 mx-auto">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2c2fed] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2c2fed]"></span>
                        </span>
                        AI-Powered Workflow Automation
                    </div>
                    <h1 className="font-['Syne'] text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-8 text-white">
                        Describe It. <br/>
                        <span className="text-gradient">Automate It.</span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-['DM_Sans']">
                        Transform natural language into powerful automated workflows. Our AI-driven engine interprets your requirements and builds execution nodes instantly.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                        <Link 
                            to="/signup" 
                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#2c2fed] to-[#a78bfa] text-white font-bold rounded-full text-lg shadow-xl shadow-[#2c2fed]/20 hover:scale-105 transition-transform no-underline"
                        >
                            Get Started Now
                        </Link>
                        <a 
                            href="#how-it-works" 
                            className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-full text-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2 no-underline"
                        >
                            <span className="material-symbols-outlined">play_circle</span>
                            See How It Works
                        </a>
                    </div>

                    {/* Workflow Preview Mockup */}
                    <div className="relative group max-w-5xl mx-auto">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#2c2fed] to-[#a78bfa] rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative rounded-xl overflow-hidden border border-[#1e1e2e] bg-[#111118] aspect-video shadow-2xl">
                            <div className="flex items-center px-4 py-3 border-b border-[#1e1e2e] bg-[#0a0a0f]/50">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                                </div>
                                <div className="mx-auto text-xs text-slate-500 font-mono">canvas / main-automated-flow.json</div>
                            </div>
                            <div className="p-8 h-full bg-[#0a0a0f]/30">
                                <img 
                                    className="w-full h-full object-cover rounded-lg opacity-80" 
                                    alt="Screenshot of an AI visual workflow editor with nodes and connections" 
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYDaNeeUwUYPTjvaCQJhcU-A_EUxKt6GfDNCFfk5skS1YxtgflZXlrzBzjVataQee0XzkBFGPzDThGhRtrxMPzwS4v0lKTk7_xLroL_lCuiar7VY08kCB4ZfccnfLzeevNiX7KmfiEeJez7230_9CbatznEt5TpLgHp6oa-gZ-fEsTuW4CP2VPHLWRXMId-NGkrSkWJBBUdf1OyoaAXjjvBV0YNFuECew639Ju8wZmjxoWKtuSZ8taX_nuwbITySxGPeM0Q13JcAF-"
                                />
                            </div>
                        </div>
                    </div>
                </main>

                {/* Features Section */}
                <section id="features" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-['Syne'] text-3xl md:text-4xl font-bold mb-4 text-white">Enterprise-Grade Automation</h2>
                        <p className="text-slate-400 max-w-xl mx-auto">Powering the next generation of developer workflows with cutting-edge AI.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                        {/* Feature 1 */}
                        <div className="group p-8 rounded-2xl bg-[#111118] border border-[#1e1e2e] hover:border-[#2c2fed]/50 transition-all duration-300">
                            <div className="w-12 h-12 mb-6 rounded-xl bg-[#2c2fed]/10 flex items-center justify-center text-[#2c2fed] group-hover:bg-[#2c2fed] group-hover:text-white transition-all">
                                <span className="material-symbols-outlined">chat_bubble</span>
                            </div>
                            <h3 className="font-['Syne'] text-xl font-bold mb-3 text-white">Natural Language Parsing</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Describe your logic in plain English and watch the AI generate complex architectural nodes instantly without a single line of code.
                            </p>
                        </div>
                        {/* Feature 2 */}
                        <div className="group p-8 rounded-2xl bg-[#111118] border border-[#1e1e2e] hover:border-[#2c2fed]/50 transition-all duration-300">
                            <div className="w-12 h-12 mb-6 rounded-xl bg-[#2c2fed]/10 flex items-center justify-center text-[#2c2fed] group-hover:bg-[#2c2fed] group-hover:text-white transition-all">
                                <span className="material-symbols-outlined">drag_indicator</span>
                            </div>
                            <h3 className="font-['Syne'] text-xl font-bold mb-3 text-white">Visual Flow Editor</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                A sleek, drag-and-drop interface for fine-tuning your automated sequences with absolute precision and real-time validation.
                            </p>
                        </div>
                        {/* Feature 3 */}
                        <div className="group p-8 rounded-2xl bg-[#111118] border border-[#1e1e2e] hover:border-[#2c2fed]/50 transition-all duration-300">
                            <div className="w-12 h-12 mb-6 rounded-xl bg-[#2c2fed]/10 flex items-center justify-center text-[#2c2fed] group-hover:bg-[#2c2fed] group-hover:text-white transition-all">
                                <span className="material-symbols-outlined">monitoring</span>
                            </div>
                            <h3 className="font-['Syne'] text-xl font-bold mb-3 text-white">Execution & Monitoring</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Real-time tracking and comprehensive logs for every trigger and action across your entire tech stack with smart alerting.
                            </p>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section id="how-it-works" className="relative z-10 py-24 px-6 overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative">
                            {/* Dotted Line Background */}
                            <div className="hidden md:block absolute top-[28px] left-0 w-full h-px border-t border-dashed border-[#2c2fed]/40 -z-10"></div>
                            {/* Step 1 */}
                            <div className="flex flex-col items-center text-center flex-1">
                                <div className="w-14 h-14 rounded-full bg-[#0a0a0f] border-4 border-[#2c2fed]/20 flex items-center justify-center mb-6 relative z-10 shadow-lg shadow-[#2c2fed]/30">
                                    <span className="font-['Syne'] font-bold text-[#2c2fed]">1</span>
                                </div>
                                <span className="material-symbols-outlined text-[#2c2fed] mb-4 text-3xl">edit_note</span>
                                <h4 className="font-['Syne'] text-lg font-bold mb-2 text-white">Describe</h4>
                                <p className="text-slate-400 text-sm px-4">Input your workflow requirements using natural language.</p>
                            </div>
                            {/* Step 2 */}
                            <div className="flex flex-col items-center text-center flex-1">
                                <div className="w-14 h-14 rounded-full bg-[#0a0a0f] border-4 border-[#2c2fed]/20 flex items-center justify-center mb-6 relative z-10 shadow-lg shadow-[#2c2fed]/30">
                                    <span className="font-['Syne'] font-bold text-[#2c2fed]">2</span>
                                </div>
                                <span className="material-symbols-outlined text-[#2c2fed] mb-4 text-3xl">visibility</span>
                                <h4 className="font-['Syne'] text-lg font-bold mb-2 text-white">Review</h4>
                                <p className="text-slate-400 text-sm px-4">Verify the AI-generated logic and connections in the visual editor.</p>
                            </div>
                            {/* Step 3 */}
                            <div className="flex flex-col items-center text-center flex-1">
                                <div className="w-14 h-14 rounded-full bg-[#0a0a0f] border-4 border-[#2c2fed]/20 flex items-center justify-center mb-6 relative z-10 shadow-lg shadow-[#2c2fed]/30">
                                    <span className="font-['Syne'] font-bold text-[#2c2fed]">3</span>
                                </div>
                                <span className="material-symbols-outlined text-[#2c2fed] mb-4 text-3xl">rocket_launch</span>
                                <h4 className="font-['Syne'] text-lg font-bold mb-2 text-white">Activate</h4>
                                <p className="text-slate-400 text-sm px-4">Deploy your automation with a single click and monitor performance.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="relative z-10 py-24 px-6 text-center max-w-4xl mx-auto">
                    <div className="p-12 rounded-3xl bg-gradient-to-br from-[#2c2fed]/20 to-[#a78bfa]/10 border border-[#2c2fed]/20">
                        <h2 className="font-['Syne'] text-4xl font-bold mb-6 text-white">Ready to scale your workflows?</h2>
                        <p className="text-slate-300 mb-10 text-lg">Join 50,000+ developers building the future with FlowAI.</p>
                        <Link 
                            to="/signup" 
                            className="px-10 py-4 bg-[#2c2fed] text-white font-bold rounded-full text-lg hover:scale-105 transition-transform glow-indigo no-underline inline-block"
                        >
                            Get Started Free
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer className="relative z-10 border-t border-[#1e1e2e] bg-[#0a0a0f] pt-16 pb-8 px-6">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-[#2c2fed] rounded flex items-center justify-center text-white">
                                <span className="material-symbols-outlined text-sm">account_tree</span>
                            </div>
                            <h2 className="font-['Syne'] text-xl font-bold tracking-tight text-white line-height-1">FlowAI</h2>
                        </div>
                        <nav className="flex items-center gap-8 text-sm text-slate-500 font-medium">
                            <a className="hover:text-white transition-colors" href="https://github.com/atcham-d/ai-task-automator-NLP#readme" target="_blank" rel="noopener noreferrer">Docs</a>
                            <a className="hover:text-white transition-colors" href="https://github.com/atcham-d/ai-task-automator-NLP" target="_blank" rel="noopener noreferrer">GitHub</a>
                            <a className="hover:text-white transition-colors" href="#">Status</a>
                            <a className="hover:text-white transition-colors" href="#">Terms</a>
                        </nav>
                        <div className="flex items-center gap-4 text-slate-500">
                            <a className="hover:text-white" href="#">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path></svg>
                            </a>
                        </div>
                    </div>
                    <div className="text-center mt-12 text-slate-600 text-xs">
                        © {new Date().getFullYear()} FlowAI. All rights reserved. Built with precision for developers.
                    </div>
                </footer>
            </div>
        </div>
    );
};
