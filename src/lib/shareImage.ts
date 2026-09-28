/** Imagen para compartir el resultado (1080×1350, formato vertical de redes). */
export interface ShareCard {
  testName: string
  lead: { catalog: string; family?: string; name: string; similarity: number; phrase?: string }
  others: { catalog: string; name: string; similarity: number }[]
  url: string
}

const W = 1080
const H = 1350
const C = {
  noche: '#0f2230',
  marfil: '#f0ece3',
  naranja: '#c8602a',
  papel: '#f7f4ee',
  azul: '#1e3a47',
  linea: '#e4e0d4',
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else line = test
  }
  if (line) lines.push(line)
  return lines
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export async function renderShareImage(card: ShareCard): Promise<Blob> {
  await document.fonts?.ready
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const font = (weight: number, size: number) => `${weight} ${size}px Montserrat, system-ui, sans-serif`

  ctx.fillStyle = C.noche
  ctx.fillRect(0, 0, W, H)

  // Marca
  ctx.fillStyle = C.marfil
  ctx.font = font(700, 44)
  ctx.fillText('Brújula', 80, 120)
  ctx.fillStyle = C.naranja
  ctx.beginPath()
  ctx.arc(80 + ctx.measureText('Brújula').width + 16, 110, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(240,236,227,0.6)'
  ctx.font = font(500, 26)
  ctx.fillText(`MI PERFIL POLÍTICO · TEST ${card.testName.toUpperCase()}`, 80, 190)

  // Tarjeta principal
  const top = 240
  const cardH = card.lead.phrase ? 560 : 420
  ctx.fillStyle = C.papel
  roundRect(ctx, 60, top, W - 120, cardH, 36)
  ctx.fill()

  ctx.fillStyle = C.azul
  ctx.font = font(600, 26)
  const chip = card.lead.family ?? card.lead.catalog
  const chipW = ctx.measureText(chip).width + 48
  roundRect(ctx, 110, top + 50, chipW, 52, 26)
  ctx.fill()
  ctx.fillStyle = C.marfil
  ctx.fillText(chip, 134, top + 85)

  ctx.fillStyle = C.azul
  ctx.font = font(700, 64)
  const nameLines = wrap(ctx, card.lead.name, 600)
  nameLines.slice(0, 2).forEach((l, i) => ctx.fillText(l, 110, top + 190 + i * 72))

  // Anillo
  const cx = W - 230, cy = top + 180, r = 100
  ctx.lineWidth = 22
  ctx.strokeStyle = C.linea
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
  ctx.strokeStyle = C.naranja
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.max(0, Math.min(100, card.lead.similarity)) / 100) * Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = C.azul
  ctx.textAlign = 'center'
  ctx.font = font(700, 56)
  ctx.fillText(`${Math.round(card.lead.similarity)}%`, cx, cy + 16)
  ctx.font = font(600, 20)
  ctx.fillStyle = 'rgba(30,58,71,0.55)'
  ctx.fillText('CERCANÍA', cx, cy + 50)
  ctx.textAlign = 'left'

  if (card.lead.phrase) {
    ctx.fillStyle = 'rgba(30,58,71,0.85)'
    ctx.font = font(500, 34)
    const lines = wrap(ctx, `“${card.lead.phrase}”`, W - 240)
    lines.slice(0, 5).forEach((l, i) => ctx.fillText(l, 110, top + 380 + i * 46))
  }

  // Otros catálogos
  let y = top + cardH + 70
  for (const o of card.others.slice(0, 3)) {
    ctx.fillStyle = 'rgba(240,236,227,0.55)'
    ctx.font = font(600, 22)
    ctx.fillText(o.catalog.toUpperCase(), 80, y)
    ctx.fillStyle = C.marfil
    ctx.font = font(600, 40)
    ctx.fillText(wrap(ctx, o.name, 720)[0], 80, y + 50)
    ctx.fillStyle = C.naranja
    ctx.font = font(700, 48)
    ctx.textAlign = 'right'
    ctx.fillText(`${Math.round(o.similarity)}%`, W - 80, y + 50)
    ctx.textAlign = 'left'
    y += 120
  }

  ctx.fillStyle = 'rgba(240,236,227,0.6)'
  ctx.font = font(500, 26)
  ctx.fillText('¿Y vos? Hacé el test:', 80, H - 90)
  ctx.fillStyle = C.marfil
  ctx.font = font(600, 26)
  ctx.fillText(card.url.replace(/^https?:\/\//, '').split('?')[0], 80, H - 50)

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo generar la imagen'))), 'image/png'),
  )
}
