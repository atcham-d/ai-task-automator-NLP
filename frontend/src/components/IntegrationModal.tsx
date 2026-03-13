import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { IntegrationType } from '../lib/integrationSchemas';
import { INTEGRATION_SCHEMAS } from '../lib/integrationSchemas';
import type { Integration } from '../lib/api';
import { integrationsApi } from '../lib/api';
import toast from 'react-hot-toast';
import { Button } from './Button';
import { Input } from './Input';

interface IntegrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: IntegrationType | null;
    existingIntegration?: Integration | null;
    onSuccess: () => void;
}

export const IntegrationModal: React.FC<IntegrationModalProps> = ({
    isOpen,
    onClose,
    type,
    existingIntegration,
    onSuccess,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Provide a fallback empty object shape until `type` is ready, though modal shouldn't render if `!isOpen || !type`.
    const schema = type ? INTEGRATION_SCHEMAS[type] : null;

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: schema ? zodResolver(schema) : undefined,
    });

    // Populate existing values if updating
    useEffect(() => {
        if (isOpen && type) {
            if (existingIntegration) {
                reset(existingIntegration.config);
            } else {
                reset({}); // fresh form
            }
        }
    }, [isOpen, type, existingIntegration, reset]);

    if (!isOpen || !type || !schema) return null;

    // Derive the shape keys so we can map them to inputs
    const fieldKeys = Object.keys((schema as any).shape);

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            if (existingIntegration) {
                const { name, ...configData } = data;
                await integrationsApi.update(existingIntegration.id, {
                    name: name,
                    config: configData
                });
                toast.success('Integration updated successfully');
            } else {
                const { name, ...configData } = data;
                await integrationsApi.create({
                    name: name || (type.charAt(0).toUpperCase() + type.slice(1)),
                    type,
                    config: configData,
                    is_active: true,
                });
                toast.success('Integration connected successfully');
            }
            onSuccess();
            onClose();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Operation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '24px'
        }}>
            <div style={{
                background: '#1e1e2e',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '500px',
                padding: '24px',
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', color: '#f1f5f9', marginBottom: '16px' }}>
                    {existingIntegration ? 'Update' : 'Configure'} {type}
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {fieldKeys.map((key) => {
                        // Secret obfuscation: visually hide standard secret/password tokens
                        const isSecret = key.toLowerCase().includes('password') || key.toLowerCase().includes('token') || key.toLowerCase().includes('key');

                        // User-friendly label formatting (e.g., api_key -> Api Key)
                        const label = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

                        return (
                            <div key={key}>
                                <Controller
                                    name={key as any}
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            value={(field.value as string | number) || ''}
                                            label={label}
                                            type={isSecret ? 'password' : 'text'}
                                            placeholder={`Enter ${label}...`}
                                            error={(errors as any)[key]?.message as string}
                                        />
                                    )}
                                />
                            </div>
                        );
                    })}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : existingIntegration ? 'Update' : 'Connect'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
