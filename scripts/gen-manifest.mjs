import fs from 'fs';
import path from 'path';

const premiumDir = path.join(process.cwd(), 'public/items/premium');
const files = fs.readdirSync(premiumDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

const manifestContent = `export const productFiles = ${JSON.stringify(files, null, 4)};\n\nexport default productFiles;`;

fs.writeFileSync(path.join(process.cwd(), 'lib/product-manifest.ts'), manifestContent);
console.log('Manifest generated successfully.');
