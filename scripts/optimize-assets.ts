import {readdir,mkdir} from 'node:fs/promises';
import {basename,extname,join} from 'node:path';
import {execFileSync} from 'node:child_process';
const dir=new URL('../public/media/',import.meta.url).pathname;
const source=process.argv[2]||dir;
await mkdir(dir,{recursive:true});
for(const file of await readdir(source)){if(!/\.(png|jpe?g|jfif)$/i.test(file))continue;execFileSync('magick',[join(source,file),'-auto-orient','-strip','-resize','1920x1920>','-quality','80',join(dir,`${basename(file,extname(file))}.webp`)])}
console.log('Raster images optimized. Requires ImageMagick and Bun.');
