'use client';

import { motion } from 'framer-motion';

export default function AnimatePage({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.99, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.99, filter: 'blur(8px)' }}
            transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1]
            }}
            className="w-full"
        >
            {children}
        </motion.div>
    );
}
