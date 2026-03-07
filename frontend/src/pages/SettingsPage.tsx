import React, { useState, useEffect } from 'react';
import { AnimatedPage, StaggerContainer, StaggerItem } from '../components/AnimatedPage';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { User, Lock, AlertTriangle, Bell, Mail, Loader2, Save } from 'lucide-react';
import { apiGet, apiPatch, apiDelete } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/* ─── Types ─── */

interface ProfileData {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string;
}

interface NotificationPrefs {
    notify_on_failure: boolean;
    notify_on_success: boolean;
    weekly_digest: boolean;
    notification_email: string | null;
}

const ToggleSwitch: React.FC<{ checked?: boolean; onChange?: (checked: boolean) => void }> = ({
    checked = false,
    onChange,
}) => {
    return (
        <button
            type="button"
            onClick={() => {
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
    const { logout } = useAuth();

    // Data states
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [notifications, setNotifications] = useState<NotificationPrefs | null>(null);

    // Form states
    const [fullName, setFullName] = useState('');
    const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });

    // Status states
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Initial fetch
    useEffect(() => {
        let cancelled = false;
        async function loadData() {
            try {
                setLoading(true);
                const [prof, prefs] = await Promise.all([
                    apiGet<ProfileData>('/api/profile/'),
                    apiGet<NotificationPrefs>('/api/profile/notifications'),
                ]);
                if (cancelled) return;
                setProfile(prof);
                setFullName(prof.full_name || '');
                setNotifications(prefs);
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to load settings');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        loadData();
        return () => { cancelled = true; };
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const updated = await apiPatch<ProfileData>('/api/profile/', { full_name: fullName });
            setProfile(updated);
            toast.success('Profile updated');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Update failed');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.next !== passwords.confirm) {
            toast.error('New passwords do not match');
            return;
        }
        setSavingPassword(true);
        try {
            await apiPatch('/api/profile/password', {
                current_password: passwords.current,
                new_password: passwords.next,
            });
            toast.success('Password changed successfully');
            setPasswords({ current: '', next: '', confirm: '' });
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to change password');
        } finally {
            setSavingPassword(false);
        }
    };

    const handleToggleNotification = async (key: keyof NotificationPrefs) => {
        if (!notifications) return;
        const newValue = !notifications[key];
        const prev = { ...notifications };

        // Optimistic update
        setNotifications({ ...notifications, [key]: newValue });

        try {
            await apiPatch('/api/profile/notifications', { [key]: newValue });
            toast.success('Preference updated');
        } catch (err) {
            setNotifications(prev);
            toast.error(err instanceof Error ? err.message : 'Failed to update preference');
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('CRITICAL: This will permanently delete your account and all associated data. Are you absolutely sure?')) {
            return;
        }
        setDeleting(true);
        try {
            await apiDelete('/api/profile/');
            toast.success('Account deleted');
            await logout();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete account');
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Loader2 size={40} style={{ color: '#6366f1', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

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
                        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Input
                                label="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                            <Input
                                label="Email Address"
                                type="email"
                                value={profile?.email || ''}
                                disabled
                                placeholder="Loading..."
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                disabled={savingProfile}
                                style={{ alignSelf: 'flex-start' }}
                            >
                                {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                Update Profile
                            </Button>
                        </form>
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
                        <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Input
                                label="Current Password"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={passwords.current}
                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                            />
                            <Input
                                label="New Password"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={passwords.next}
                                onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                            />
                            <Input
                                label="Confirm New Password"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                disabled={savingPassword}
                                style={{ alignSelf: 'flex-start' }}
                            >
                                {savingPassword ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                                Change Password
                            </Button>
                        </form>
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
                                { label: 'Email on workflow failure', key: 'notify_on_failure' as const, icon: <Mail size={14} /> },
                                { label: 'Notification on execution success', key: 'notify_on_success' as const, icon: <Bell size={14} /> },
                                { label: 'Weekly analytics report', key: 'weekly_digest' as const, icon: <Bell size={14} /> },
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
                                    <ToggleSwitch
                                        checked={notifications?.[item.key] || false}
                                        onChange={() => handleToggleNotification(item.key)}
                                    />
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
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={handleDeleteAccount}
                            disabled={deleting}
                        >
                            {deleting ? <Loader2 size={14} className="animate-spin" /> : <AlertTriangle size={14} />}
                            {deleting ? 'Deleting...' : 'Delete Account'}
                        </Button>
                    </Card>
                </StaggerItem>
            </StaggerContainer>
        </AnimatedPage>
    );
};
