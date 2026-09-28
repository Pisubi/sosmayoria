/**
 * Imagen para compartir el resultado, pensada para historias de Instagram: 1080×1920 (9:16).
 * Arriba y abajo quedan márgenes libres, porque Instagram tapa esas zonas con su interfaz.
 */
export interface Tarjeta {
  mayoria: number
  definidas: number
  titulo: string
  texto: string
  /** Tema en el que más se aparta de la mayoría. */
  temaDistinto?: string
  /** Dirección del juego; vacía si no hay una pública (por ejemplo, abierto como archivo). */
  url: string
}

const W = 1080
const H = 1920
/** Zonas que tapa la interfaz de las historias. */
const ARRIBA = 250
const ABAJO = 330
const C = { noche: '#0f2230', marfil: '#f0ece3', naranja: '#c8602a', azul: '#1e3a47', arena: '#cac4b0' }

type Ctx = CanvasRenderingContext2D
const font = (peso: number, px: number) => `${peso} ${px}px Montserrat, system-ui, sans-serif`

function envolver(ctx: Ctx, texto: string, ancho: number): string[] {
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

function redondeado(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Texto centrado que se achica hasta entrar en el ancho. */
function ajustado(ctx: Ctx, texto: string, x: number, y: number, ancho: number, peso: number, px: number) {
  let size = px
  ctx.font = font(peso, size)
  while (size > 20 && ctx.measureText(texto).width > ancho) {
    size -= 4
    ctx.font = font(peso, size)
  }
  ctx.fillText(texto, x, y)
}

function sitio(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

/** Botón de llamado a jugar, apoyado sobre el margen de abajo. */
function llamado(ctx: Ctx, t: Tarjeta, fondo: string, color: string, texto: string) {
  const y = H - ABAJO - 150
  ctx.fillStyle = fondo
  redondeado(ctx, 70, y, W - 140, 130, 65)
  ctx.fill()
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  if (t.url) {
    ajustado(ctx, texto, W / 2, y + 62, W - 220, 700, 44)
    ctx.globalAlpha = 0.75
    ajustado(ctx, sitio(t.url), W / 2, y + 106, W - 220, 500, 30)
    ctx.globalAlpha = 1
  } else ajustado(ctx, texto, W / 2, y + 80, W - 220, 700, 44)
  ctx.textAlign = 'left'
}

/** Insignia estilo resumen anual: el perfil como identidad para mostrar. */
function insignia(ctx: Ctx, t: Tarjeta) {
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, C.naranja)
  g.addColorStop(0.55, '#7a3b1f')
  g.addColorStop(1, C.noche)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  ctx.textAlign = 'center'
  ctx.fillStyle = C.marfil
  ctx.font = font(600, 36)
  ctx.globalAlpha = 0.8
  ctx.fillText('MI RESULTADO EN LA MAYORÍA', W / 2, ARRIBA + 60)
  ctx.globalAlpha = 1
  ctx.font = font(700, 90)
  ctx.fillText('SOY', W / 2, ARRIBA + 250)

  // Insignia inclinada con el perfil
  ctx.save()
  ctx.translate(W / 2, ARRIBA + 460)
  ctx.rotate(-0.06)
  ctx.fillStyle = C.marfil
  redondeado(ctx, -470, -150, 940, 300, 150)
  ctx.fill()
  ctx.fillStyle = C.noche
  ctx.font = font(700, 110)
  const lineas = envolver(ctx, t.titulo.toUpperCase(), 820).slice(0, 2)
  lineas.forEach((l, i) => ajustado(ctx, l, 0, (lineas.length === 1 ? 38 : -12) + i * 104, 840, 700, lineas.length === 1 ? 110 : 90))
  ctx.restore()

  let y = ARRIBA + 720
  ctx.fillStyle = C.marfil
  ctx.font = font(500, 42)
  envolver(ctx, t.texto, W - 200)
    .slice(0, 2)
    .forEach((l) => {
      ctx.fillText(l, W / 2, y)
      y += 56
    })
  y += 50
  const dato = (titulo: string, valor: string, yy: number) => {
    ctx.globalAlpha = 0.7
    ctx.font = font(600, 30)
    ctx.fillText(titulo, W / 2, yy)
    ctx.globalAlpha = 1
    ctx.font = font(700, 64)
    ctx.fillText(valor, W / 2, yy + 76)
  }
  dato('CON LA MAYORÍA', `${t.mayoria} de ${t.definidas}`, y)
  if (t.temaDistinto) dato('DONDE MÁS ME DIFERENCIO', t.temaDistinto, y + 160)
  ctx.textAlign = 'left'
  llamado(ctx, t, C.marfil, C.noche, '¿Y vos qué sos? Jugá →')
}

export async function renderShareImage(t: Tarjeta): Promise<Blob> {
  await document.fonts?.ready
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  insignia(ctx, t)
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo generar la imagen'))), 'image/png'),
  )
}
