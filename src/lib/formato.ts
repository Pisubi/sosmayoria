const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

export function fecha(f: string): string {
  const [y, m] = f.split('-')
  return m ? `${MESES[Number(m) - 1]} de ${y}` : y
}
