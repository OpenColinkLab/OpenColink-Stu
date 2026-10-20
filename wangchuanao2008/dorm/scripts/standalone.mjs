import fs from 'node:fs';
const dir='dist';let html=fs.readFileSync(`${dir}/index.html`,'utf8');
html=html.replace(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/,(_,p)=>`<script type="module">${fs.readFileSync(`${dir}/${p.replace(/^\.\/|^\//,'')}`,'utf8').replace(/<\/script/gi,'<\\/script')}</script>`);
html=html.replace(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/,(_,p)=>`<style>${fs.readFileSync(`${dir}/${p.replace(/^\.\/|^\//,'')}`,'utf8')}</style>`);
fs.writeFileSync('宿舍3D.html',html);
console.log('Created standalone: 宿舍3D.html');
