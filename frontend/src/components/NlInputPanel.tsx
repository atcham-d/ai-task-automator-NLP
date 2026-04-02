import React, { useState } from 'react';
import { Sparkles, Loader2, ChevronDown, ChevronRight, X } from 'lucide-react';
import { Button } from './Button';
import { Textarea } from './Input';
import type { WorkflowDefinition } from '../types/workflow';

interface NlInputPanelProps {
    onParse: (text: string) => Promise<void>;
    parsing: boolean;
    parsedDef: WorkflowDefinition | null;
    isOpen?: boolean;
    onToggle?: () => void;
}

export const NlInputPanel: React.FC<NlInputPanelProps> = ({ 
    onParse, 
    parsing, 
    parsedDef,
    isOpen = true,
    onToggle
}) => {
    const [localNlInput, setLocalNlInput] = useState('');
    const [jsonVisible, setJsonVisible] = useState(false);

    const handleParseClick = () => {
        onParse(localNlInput);
    };

    return (
        <div
            className={`
                fixed inset-y-0 left-0 z-40 w-72 bg-[#0a0a0f] border-r border-[#1e1e2e] 
                transform transition-transform duration-300 ease-in-out flex flex-col
                md:relative md:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:hidden'}
            `}
        >
            <div className="p-5 flex flex-col gap-5 overflow-y-auto flex-1">
                <div className="flex items-center justify-between">
                    <label className="font-display text-sm font-bold text-[#f1f5f9]">
                        Describe your automation
                    </label>
                    <button 
                        onClick={onToggle}
                        className="md:hidden p-1.5 text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-white/5 rounded-md transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-4">
                    <Textarea
                        value={localNlInput}
                        onChange={(e) => {
                            if (e.target.value.length <= 500) {
                                setLocalNlInput(e.target.value);
                            }
                        }}
                        maxLength={500}
                        placeholder="When I receive an email from..."
                        className="min-h-[180px] text-[13px] leading-relaxed"
                    />
                    <div className="flex justify-between items-center">
                        <p className="text-[#475569] text-[11px] font-medium font-mono">
                            {localNlInput.length} / 500
                        </p>
                    </div>
                </div>

                <Button 
                    variant="primary" 
                    className="w-full shadow-lg shadow-[#6366f1]/20" 
                    onClick={handleParseClick} 
                    disabled={parsing || !localNlInput.trim()}
                >
                    {parsing ? (
                        <Loader2 size={14} className="animate-spin mr-2" />
                    ) : (
                        <Sparkles size={14} className="mr-2" />
                    )}
                    {parsing ? 'Parsing...' : 'Parse Workflow'}
                </Button>

                {/* JSON Preview */}
                {parsedDef && (
                    <div className="mt-2 text-[10px]">
                        <button
                            onClick={() => setJsonVisible(!jsonVisible)}
                            className="flex items-center gap-2 text-[#94a3b8] hover:text-[#f1f5f9] font-medium transition-colors py-1 group"
                        >
                            {jsonVisible ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            <span className="font-mono tracking-tight uppercase">Parsed Schema</span>
                        </button>
                        {jsonVisible && (
                            <div className="mt-3 p-3 bg-black/40 rounded-xl border border-[#1e1e2e] overflow-hidden">
                                <pre className="text-[#6366f1] whitespace-pre-wrap break-all font-mono leading-relaxed">
                                    {JSON.stringify(parsedDef, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Hint for users */}
            <div className="p-4 border-t border-[#1e1e2e] bg-black/20">
                <p className="text-[10px] text-[#475569] leading-normal italic">
                    Tip: Be specific about the triggers and apps you want to connect.
                </p>
            </div>
        </div>
    );
};
