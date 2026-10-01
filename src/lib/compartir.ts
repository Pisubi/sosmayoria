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
const C = { noche: '#2c204b', marfil: '#f3f4d6', naranja: '#e37a29', azul: '#2c204b', arena: '#d3d4a6' }

type Ctx = CanvasRenderingContext2D
const font = (peso: number, px: number) => `${peso} ${px}px Archivo, system-ui, sans-serif`

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

/** Caja de la marca: borde de tinta y sombra dura, sin esquinas redondeadas. */
function caja(ctx: Ctx, x: number, y: number, w: number, h: number, fondo: string, borde = 6, sombra = 14) {
  ctx.fillStyle = C.azul
  ctx.fillRect(x + sombra, y + sombra, w, h)
  ctx.fillRect(x, y, w, h)
  ctx.fillStyle = fondo
  ctx.fillRect(x + borde, y + borde, w - borde * 2, h - borde * 2)
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
  caja(ctx, 70, y, W - 140, 130, fondo)
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  if (t.url) {
    ajustado(ctx, texto, W / 2, y + 62, W - 220, 900, 44)
    ajustado(ctx, sitio(t.url), W / 2, y + 106, W - 220, 600, 30)
  } else ajustado(ctx, texto, W / 2, y + 80, W - 220, 900, 44)
  ctx.textAlign = 'left'
}

/** Insignia estilo resumen anual: el perfil como identidad para mostrar. */
function insignia(ctx: Ctx, t: Tarjeta) {
  ctx.fillStyle = C.naranja
  ctx.fillRect(0, 0, W, H)
  ctx.textAlign = 'center'
  ctx.fillStyle = C.azul
  ctx.font = font(800, 36)
  ctx.fillText('MI RESULTADO EN LA MAYORÍA', W / 2, ARRIBA + 60)
  ctx.font = font(900, 100)
  ctx.fillText('SOY', W / 2, ARRIBA + 250)

  // Caja con el perfil
  ctx.save()
  ctx.translate(W / 2, ARRIBA + 460)
  caja(ctx, -470, -150, 940, 300, C.azul)
  ctx.fillStyle = C.marfil
  ctx.font = font(900, 110)
  const lineas = envolver(ctx, t.titulo.toUpperCase(), 820).slice(0, 2)
  lineas.forEach((l, i) => ajustado(ctx, l, 0, (lineas.length === 1 ? 38 : -12) + i * 104, 840, 900, lineas.length === 1 ? 110 : 90))
  ctx.restore()

  let y = ARRIBA + 720
  ctx.fillStyle = C.azul
  ctx.font = font(600, 42)
  envolver(ctx, t.texto, W - 200)
    .slice(0, 2)
    .forEach((l) => {
      ctx.fillText(l, W / 2, y)
      y += 56
    })
  y += 50
  const dato = (titulo: string, valor: string, yy: number) => {
    ctx.font = font(800, 30)
    ctx.fillText(titulo, W / 2, yy)
    ctx.font = font(900, 64)
    ctx.fillText(valor, W / 2, yy + 76)
  }
  dato('CON LA MAYORÍA', `${t.mayoria} de ${t.definidas}`, y)
  if (t.temaDistinto) dato('DONDE MÁS ME DIFERENCIO', t.temaDistinto, y + 160)
  ctx.textAlign = 'left'
  llamado(ctx, t, C.marfil, C.azul, '¿Y vos qué sos? Jugá →')
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
