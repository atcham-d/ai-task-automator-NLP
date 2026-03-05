import React, { useState } from 'react';
import { AnimatedPage, StaggerContainer, StaggerItem } from '../components/AnimatedPage';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { User, Lock, Link2, AlertTriangle, Bell, Mail } from 'lucide-react';

const ToggleSwitch: React.FC<{ defaultChecked?: boolean; onChange?: (checked: boolean) => void }> = ({
    defaultChecked = false,
    onChange,
}) => {
    const [checked, setChecked] = useState(defaultChecked);

    return (
        <button
            type="button"
            onClick={() => {
                setChecked(!checked);
                onChange?.(!checked);
            }}
            style={{
                width: '44px',
                height: '24px',
                borderRadius: '12px',
                border: 'none',
                background: checked
                    ? 'linear-gradient(135deg, #6366f1, #a78bfa)'
                    : '#1e1e2e',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.3s',
                flexShrink: 0,
            }}
        >
            <div
                style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: '3px',
                    left: checked ? '23px' : '3px',
                    transition: 'left 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
            />
        </button>
    );
};

export const SettingsPage: React.FC = () => {
    return (
        <AnimatedPage>
            <h1
                style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#f1f5f9',
                    marginBottom: '32px',
                }}
            >
                Settings
            </h1>

            <StaggerContainer style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '700px' }}>
                {/* Profile */}
                <StaggerItem>
                    <Card>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: 'rgba(99,102,241,0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#6366f1',
                                }}
                            >
                                <User size={18} />
                            </div>
                            <h2
                                style={{
                                    fontFamily: "'Syne', sans-serif",
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    color: '#f1f5f9',
                                }}
                            >
                                Profile
                            </h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Input label="Full Name" defaultValue="Disha Sharma" />
                            <Input label="Email" type="email" defaultValue="disha@example.com" />
                            <Button variant="primary" size="sm" style={{ alignSelf: 'flex-start' }}>
                                Update Profile
                            </Button>
                        </div>
                    </Card>
                </StaggerItem>

                {/* Security */}
                <StaggerItem>
                    <Card>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: 'rgba(99,102,241,0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#6366f1',
                                }}
                            >
                                <Lock size={18} />
                            </div>
                            <h2
                                style={{
                                    fontFamily: "'Syne', sans-serif",
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    color: '#f1f5f9',
                                }}
                            >
                                Security
                            </h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Input label="Current Password" type="password" placeholder="••••••••" />
                            <Input label="New Password" type="password" placeholder="••••••••" />
                            <Input label="Confirm New Password" type="password" placeholder="••••••••" />
                            <Button variant="primary" size="sm" style={{ alignSelf: 'flex-start' }}>
                                Change Password
                            </Button>
                        </div>
                    </Card>
                </StaggerItem>

                {/* Connected Integrations */}
                <StaggerItem>
                    <Card>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: 'rgba(99,102,241,0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#6366f1',
                                }}
                            >
                                <Link2 size={18} />
                            </div>
                            <h2
                                style={{
                                    fontFamily: "'Syne', sans-serif",
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    color: '#f1f5f9',
                                }}
                            >
                                Connected Integrations
                            </h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Input
                                label="Slack Webhook URL"
                                placeholder="https://hooks.slack.com/services/..."
                                defaultValue="https://hooks.slack.com/services/T01/B02/xyz123"
                            />
                            <Input
                                label="SMTP Host"
                                placeholder="smtp.gmail.com"
                                defaultValue="smtp.gmail.com"
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <Input label="SMTP Port" placeholder="587" defaultValue="587" />
                                <Input label="SMTP User" placeholder="you@gmail.com" defaultValue="disha@gmail.com" />
                            </div>
                            <Button variant="primary" size="sm" style={{ alignSelf: 'flex-start' }}>
                                Save Integrations
                            </Button>
                        </div>
                    </Card>
                </StaggerItem>

                {/* Notifications */}
                <StaggerItem>
                    <Card>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: 'rgba(99,102,241,0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#6366f1',
                                }}
                            >
                                <Bell size={18} />
                            </div>
                            <h2
                                style={{
                                    fontFamily: "'Syne', sans-serif",
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    color: '#f1f5f9',
                                }}
                            >
                                Notifications
                            </h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { label: 'Email on workflow failure', icon: <Mail size={14} />, defaultOn: true },
                                { label: 'Daily execution summary', icon: <Bell size={14} />, defaultOn: true },
                                { label: 'Weekly analytics report', icon: <Bell size={14} />, defaultOn: false },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px 0',
                                        borderBottom: i < 2 ? '1px solid rgba(30,30,46,0.5)' : 'none',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ color: '#475569' }}>{item.icon}</span>
                                        <span style={{ fontSize: '14px', color: '#f1f5f9' }}>{item.label}</span>
                                    </div>
                                    <ToggleSwitch defaultChecked={item.defaultOn} />
                                </div>
                            ))}
                        </div>
                    </Card>
                </StaggerItem>

                {/* Danger Zone */}
                <StaggerItem>
                    <Card style={{ border: '1px solid rgba(248,113,113,0.3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: 'rgba(248,113,113,0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#f87171',
                                }}
                            >
                                <AlertTriangle size={18} />
                            </div>
                            <h2
                                style={{
                                    fontFamily: "'Syne', sans-serif",
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    color: '#f87171',
                                }}
                            >
                                Danger Zone
                            </h2>
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>
                            Once you delete your account, there is no going back. All your workflows, logs, and settings will be permanently removed.
                        </p>
                        <Button variant="danger" size="sm">
                            Delete Account
                        </Button>
                    </Card>
                </StaggerItem>
            </StaggerContainer>
        </AnimatedPage>
    );
};
