import React, { useState } from 'react';
import { Sparkles, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { Textarea } from './Input';
import { Card } from './Card';

interface NlInputPanelProps {
    onParse: (text: string) => Promise<void>;
    parsing: boolean;
    parsedDef: any;
}

export const NlInputPanel: React.FC<NlInputPanelProps> = ({ onParse, parsing, parsedDef }) => {
    const [localNlInput, setLocalNlInput] = useState('');
    const [jsonVisible, setJsonVisible] = useState(true);

    const handleParseClick = () => {
        onParse(localNlInput);
    };

    return (
        <div
            style={{
                width: '280px',
                borderRight: '1px solid #1e1e2e',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                overflowY: 'auto',
            }}
        >
            <label
                style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#f1f5f9',
                }}
            >
                Describe your automation
            </label>
            <Textarea
                value={localNlInput}
                onChange={(e) => setLocalNlInput(e.target.value)}
                placeholder="When I receive an email from..."
                style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    minHeight: '160px',
                }}
            />
            <p style={{ color: '#475569', fontSize: '11px' }}>{localNlInput.length} / 500 characters</p>
            <Button variant="primary" style={{ width: '100%' }} onClick={handleParseClick} disabled={parsing}>
                {parsing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
                {parsing ? 'Parsing...' : 'Parse Workflow'}
            </Button>

            {/* JSON Preview */}
            {parsedDef && (
                <div>
                    <button
                        onClick={() => setJsonVisible(!jsonVisible)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 0',
                            fontFamily: "'DM Sans', sans-serif",
                        }}
                    >
                        {jsonVisible ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        Parsed JSON
                    </button>
                    {jsonVisible && (
                        <Card style={{ padding: '12px', marginTop: '8px', background: '#0a0a0f' }}>
                            <pre
                                style={{
                                    fontSize: '10px',
                                    color: '#6366f1',
                                    margin: 0,
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-all',
                                    fontFamily: "'JetBrains Mono', monospace",
                                }}
                            >
                                {JSON.stringify(parsedDef, null, 2)}
                            </pre>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};
