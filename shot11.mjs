import { chromium } from 'playwright'
const [archivo, out] = process.argv.slice(2)
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, acceptDownloads: true })
const p = await ctx.newPage()
const errs = [], externos = []
p.on('pageerror', (e) => errs.push('pageerror: ' + e.message))
p.on('console', (m) => m.type() === 'error' && errs.push('console: ' + m.text()))
// Sin red: las fuentes de Google fallan a propósito, el juego tiene que andar igual.
await ctx.route(/^https?:/, (r) => { externos.push(r.request().url()); r.abort() })
await p.goto('file://' + archivo)
await p.screenshot({ path: out + '/a-inicio.png' })
await p.getByRole('button', { name: /^Jugar →/ }).click()
// Juega 12, recarga en el medio y retoma
for (let i = 0; i < 12; i++) {
  await p.locator('article button').nth(i % 3 === 0 ? 1 : 0).click()
  if (i === 5) await p.screenshot({ path: out + '/b-carta.png' })
  await p.locator('article button').last().click()
}
await p.reload()
const retomar = p.getByRole('button', { name: /Seguir|Retomar|Continuar/ })
console.log('botón para retomar tras recargar:', await retomar.count())
await retomar.first().click()
console.log('retoma en:', await p.locator('main p').first().innerText())
while (await p.locator('article').count()) {
  await p.locator('article button').first().click()
  await p.locator('article button').last().click()
}
await p.screenshot({ path: out + '/c-datos.png' })
await p.getByRole('button', { name: /Ver mi resultado/ }).click()
await p.screenshot({ path: out + '/d-resultado.png' })
console.log('brújula:', await p.getByText('Tu brújula política').count())
const [dl] = await Promise.all([p.waitForEvent('download'), p.getByRole('button', { name: /Compartir en historias/ }).click()])
await dl.saveAs(out + '/e-historia.png')
await p.getByRole('button', { name: /Jugar otra ronda/ }).click()
console.log('otra ronda, carta:', await p.locator('main p').first().innerText())
await p.getByRole('button', { name: /Cómo funciona/ }).first().click()
console.log('cómo funciona, brújula explicada:', await p.getByText('La brújula política').count())
console.log('pedidos externos:', [...new Set(externos.map((u) => new URL(u).host))])
console.log('errores:', errs.filter((e) => !/ERR_FAILED|fonts/.test(e)), '| (de fuentes bloqueadas:', errs.length, ')')
await b.close()
