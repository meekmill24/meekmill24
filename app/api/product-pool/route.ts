import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const publicDir = path.join(process.cwd(), 'public');
        const itemsDir = path.join(publicDir, 'items', 'premium');
        
        if (!fs.existsSync(itemsDir)) {
            return NextResponse.json({ pool: [] });
        }

        const files = fs.readdirSync(itemsDir);
        const pool = files
            .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
            .map(file => {
                // Determine category based on filename or just use 'general'
                let cat = 'general';
                const lower = file.toLowerCase();
                if (lower.includes('electrical') || lower.includes('headphones') || lower.includes('watch') || lower.includes('phone')) cat = 'electrical';
                else if (lower.includes('furniture') || lower.includes('chair') || lower.includes('table') || lower.includes('bed')) cat = 'furniture';
                else if (lower.includes('gym') || lower.includes('treadmill') || lower.includes('weights')) cat = 'gym';
                else if (lower.includes('fashion') || lower.includes('shirt') || lower.includes('bag')) cat = 'fashion';
                else if (lower.includes('car') || lower.includes('tire') || lower.includes('battery')) cat = 'automotive';

                return {
                    name: file.split('.')[0].replace(/[-_]/g, ' '),
                    cat,
                    path: `/items/premium/${file}`
                };
            });

        return NextResponse.json({ pool });
    } catch (error) {
        console.error('Error reading product pool:', error);
        return NextResponse.json({ pool: [], error: 'Failed to load product pool' }, { status: 500 });
    }
}
