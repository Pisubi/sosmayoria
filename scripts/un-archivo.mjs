// Arma el juego en un solo .html, con el código y los estilos adentro, para mandarlo como archivo.
// Uso: node scripts/un-archivo.mjs [salida.html]   (por defecto, dist-archivo/la-mayoria.html)
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const salida = process.argv[2] ?? 'dist-archivo/la-mayoria.html'
const tmp = 'dist-archivo/.build'
rmSync(tmp, { recursive: true, force: true })
execFileSync('npx', ['vite', 'build', '--base', './', '--outDir', tmp, '--emptyOutDir'], { stdio: 'inherit' })

let html = readFileSync(join(tmp, 'index.html'), 'utf8')
const leer = (ruta) => readFileSync(join(tmp, ruta), 'utf8')
html = html.replace(/<script type="module" crossorigin src="\.\/([^"]+)"><\/script>/, (_, ruta) => {
  const js = leer(ruta)
  if (/<\/script/i.test(js)) throw new Error(`${ruta} contiene </script>`)
  return `<script type="module">${js}</script>`
})
html = html.replace(/<link rel="stylesheet" crossorigin href="\.\/([^"]+)">/, (_, ruta) => `<style>${leer(ruta)}</style>`)
html = html.replace(
  /href="\.\/favicon\.svg"/,
  `href="data:image/svg+xml;base64,${Buffer.from(leer('favicon.svg')).toString('base64')}"`,
)
if (/(src|href)="\.\//.test(html)) throw new Error('Quedó una referencia a un archivo local')

mkdirSync(dirname(salida), { recursive: true })
writeFileSync(salida, html)
rmSync(tmp, { recursive: true, force: true })
console.log(`${salida}: ${(html.length / 1024).toFixed(0)} KB`)
