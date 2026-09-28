/** Imagen para compartir el resultado (1080×1350, formato vertical de redes). */
export interface Tarjeta {
  mayoria: number
  definidas: number
  titulo: string
  url: string
}

const W = 1080
const H = 1350
const C = { noche: '#0f2230', marfil: '#f0ece3', naranja: '#c8602a', azul: '#1e3a47' }

function envolver(ctx: CanvasRenderingContext2D, texto: string, ancho: number): string[] {
  const lineas: string[] = []
  let linea = ''
  for (const w of texto.split(/\s+/)) {
    const prueba = linea ? `${linea} ${w}` : w
    if (ctx.measureText(prueba).width > ancho && linea) {
      lineas.push(linea)
      linea = w
    } else linea = prueba
  }
  if (linea) lineas.push(linea)
  return lineas
}

export async function renderShareImage(t: Tarjeta): Promise<Blob> {
  await document.fonts?.ready
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const font = (peso: number, px: number) => `${peso} ${px}px Montserrat, system-ui, sans-serif`

  ctx.fillStyle = C.noche
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = C.marfil
  ctx.font = font(700, 48)
  ctx.fillText('La Mayoría', 90, 140)
  ctx.fillStyle = C.naranja
  ctx.beginPath()
  ctx.arc(90 + ctx.measureText('La Mayoría').width + 18, 128, 9, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(240,236,227,0.6)'
  ctx.font = font(500, 30)
  ctx.fillText('¿Sabés qué piensa la Argentina?', 90, 200)

  // Anillo: cuántas con la mayoría
  const cx = W / 2, cy = 560, r = 230
  const frac = t.definidas ? t.mayoria / t.definidas : 0
  ctx.lineWidth = 44
  ctx.strokeStyle = C.naranja
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
  ctx.strokeStyle = C.marfil
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2)
  ctx.stroke()
  ctx.textAlign = 'center'
  ctx.fillStyle = C.marfil
  ctx.font = font(700, 170)
  ctx.fillText(String(t.mayoria), cx, cy + 40)
  ctx.fillStyle = 'rgba(240,236,227,0.6)'
  ctx.font = font(600, 34)
  ctx.fillText(`DE ${t.definidas}`, cx, cy + 105)

  ctx.fillStyle = 'rgba(240,236,227,0.75)'
  ctx.font = font(500, 36)
  ctx.fillText('Pienso como la mayoría de los argentinos en', cx, 900)
  ctx.fillText(`${t.mayoria} de ${t.definidas} temas`, cx, 950)
  ctx.fillStyle = C.naranja
  ctx.font = font(700, 70)
  envolver(ctx, t.titulo, W - 180).slice(0, 2).forEach((l, i) => ctx.fillText(l, cx, 1070 + i * 80))

  ctx.fillStyle = C.naranja
  ctx.font = font(700, 34)
  ctx.fillText('¿Y vos? ' + t.url.replace(/^https?:\/\//, '').replace(/\/$/, ''), cx, 1240)

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo generar la imagen'))), 'image/png'),
  )
}
