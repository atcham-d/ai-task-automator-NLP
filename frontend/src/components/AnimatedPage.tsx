import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedPageProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export const AnimatedPage: React.FC<AnimatedPageProps> = ({ children, className, style }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    );
};

// Stagger container for child animations
export const StaggerContainer: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({
    children,
    className,
    style,
}) => {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.1 } },
            }}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    );
};

export const StaggerItem: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({
    children,
    className,
    style,
}) => {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    );
};
