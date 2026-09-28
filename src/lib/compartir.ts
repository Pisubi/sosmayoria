/**
 * Imagen para compartir el resultado, pensada para historias de Instagram: 1080×1920 (9:16).
 * Arriba y abajo quedan márgenes libres, porque Instagram tapa esas zonas con su interfaz.
 */
export interface Tarjeta {
  mayoria: number
  definidas: number
  titulo: string
  texto: string
  /** Preguntas en las que la persona quedó en la minoría (se muestran hasta tres). */
  minorias: string[]
  url: string
}

const W = 1080
const H = 1920
/** Zonas que tapa la interfaz de las historias. */
const ARRIBA = 250
const ABAJO = 330
const C = { noche: '#0f2230', marfil: '#f0ece3', naranja: '#c8602a', azul: '#1e3a47', arena: '#cac4b0' }

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

/** Recorta a una línea con puntos suspensivos. */
function recortar(ctx: CanvasRenderingContext2D, texto: string, ancho: number): string {
  if (ctx.measureText(texto).width <= ancho) return texto
  let t = texto
  while (t.length > 1 && ctx.measureText(`${t}…`).width > ancho) t = t.slice(0, -1)
  return `${t.trimEnd()}…`
}

function redondeado(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export async function renderShareImage(t: Tarjeta): Promise<Blob> {
  await document.fonts?.ready
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const font = (peso: number, px: number) => `${peso} ${px}px Montserrat, system-ui, sans-serif`
  const X = 90
  const ANCHO = W - 2 * X

  ctx.fillStyle = C.noche
  ctx.fillRect(0, 0, W, H)
  // Un toque de color arriba a la derecha.
  const brillo = ctx.createRadialGradient(W, 0, 0, W, 0, 900)
  brillo.addColorStop(0, 'rgba(200,96,42,0.35)')
  brillo.addColorStop(1, 'rgba(200,96,42,0)')
  ctx.fillStyle = brillo
  ctx.fillRect(0, 0, W, H)

  // Marca
  let y = ARRIBA + 30
  ctx.fillStyle = C.marfil
  ctx.font = font(700, 56)
  ctx.fillText('La Mayoría', X, y)
  ctx.fillStyle = C.naranja
  ctx.beginPath()
  ctx.arc(X + ctx.measureText('La Mayoría').width + 20, y - 14, 10, 0, Math.PI * 2)
  ctx.fill()

  // Resultado principal
  y += 110
  ctx.fillStyle = 'rgba(240,236,227,0.7)'
  ctx.font = font(600, 40)
  ctx.fillText('Pienso como la mayoría', X, y)
  ctx.fillText('de los argentinos en', X, y + 52)
  y += 300
  ctx.fillStyle = C.marfil
  ctx.font = font(700, 260)
  const num = String(t.mayoria)
  ctx.fillText(num, X - 10, y)
  const anchoNum = ctx.measureText(num).width
  ctx.fillStyle = 'rgba(240,236,227,0.6)'
  ctx.font = font(500, 88)
  ctx.fillText(`de ${t.definidas}`, X + anchoNum + 20, y)

  // Un punto por carta: claro con la mayoría, naranja en la minoría.
  y += 60
  const n = Math.max(1, t.definidas)
  const porFila = Math.min(n, 13)
  const paso = ANCHO / porFila
  const radio = Math.min(22, paso * 0.34)
  for (let i = 0; i < n; i++) {
    const fila = Math.floor(i / porFila)
    const col = i % porFila
    ctx.fillStyle = i < t.mayoria ? C.marfil : C.naranja
    ctx.beginPath()
    ctx.arc(X + paso * col + paso / 2, y + fila * (radio * 2 + 18) + radio, radio, 0, Math.PI * 2)
    ctx.fill()
  }
  y += Math.ceil(n / porFila) * (radio * 2 + 18) + 20

  // Perfil
  ctx.fillStyle = C.naranja
  ctx.font = font(700, 96)
  const titulo = envolver(ctx, t.titulo, ANCHO).slice(0, 2)
  titulo.forEach((l, i) => ctx.fillText(l, X, y + 96 + i * 104))
  y += 96 + (titulo.length - 1) * 104 + 60
  ctx.fillStyle = 'rgba(240,236,227,0.8)'
  ctx.font = font(500, 38)
  const texto = envolver(ctx, t.texto, ANCHO).slice(0, 2)
  texto.forEach((l, i) => ctx.fillText(l, X, y + i * 50))
  y += (texto.length - 1) * 50 + 50

  // Llamado a jugar, justo arriba del margen de abajo.
  const ctaAlto = 120
  const ctaY = H - ABAJO - ctaAlto - 20

  // Donde es minoría: tantas como entren (hasta tres) entre el perfil y el llamado.
  const libre = ctaY - 40 - y
  const entran = Math.max(0, Math.min(3, t.minorias.length, Math.floor((libre - 100) / 58)))
  if (entran > 0) {
    const alto = 96 + entran * 58
    ctx.fillStyle = 'rgba(240,236,227,0.08)'
    redondeado(ctx, X - 30, y, ANCHO + 60, alto, 36)
    ctx.fill()
    ctx.fillStyle = C.naranja
    ctx.font = font(700, 30)
    ctx.fillText('SOY MINORÍA EN', X, y + 58)
    ctx.fillStyle = C.marfil
    ctx.font = font(500, 36)
    t.minorias.slice(0, entran).forEach((m, i) => ctx.fillText(recortar(ctx, m, ANCHO), X, y + 116 + i * 58))
  }

  ctx.fillStyle = C.naranja
  redondeado(ctx, X - 30, ctaY, ANCHO + 60, ctaAlto, 60)
  ctx.fill()
  ctx.fillStyle = C.marfil
  ctx.textAlign = 'center'
  ctx.font = font(700, 44)
  ctx.fillText('¿Y vos? Jugá en', W / 2, ctaY + 54)
  ctx.font = font(500, 32)
  ctx.fillText(recortar(ctx, t.url.replace(/^https?:\/\//, '').replace(/\/$/, ''), ANCHO), W / 2, ctaY + 98)
  ctx.textAlign = 'left'

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo generar la imagen'))), 'image/png'),
  )
}
