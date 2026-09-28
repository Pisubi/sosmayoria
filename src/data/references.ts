import { axes } from './axes'

export type ReferenceKind = 'figura' | 'partido'

export interface Reference {
  id: string
  kind: ReferenceKind
  name: string
  country: string
  description: string
  /** Posición estimada por eje, de -100 (poleA) a +100 (poleB) */
  position: Record<string, number>
}

// Orden de los valores: el mismo que `axes`
// economía, fiscal, comercio, trabajo, seguridad, valores, religión, migración, soberanía, ambiente, poder
type Row = [id: string, name: string, country: string, description: string, values: number[]]

function build(kind: ReferenceKind, rows: Row[]): Reference[] {
  return rows.map(([id, name, country, description, values]) => ({
    id,
    kind,
    name,
    country,
    description,
    position: Object.fromEntries(axes.map((axis, i) => [axis.id, values[i]])),
  }))
}

export const parties: Reference[] = build('partido', [
  // Argentina
  ['lla', 'La Libertad Avanza', 'Argentina', 'Liberalismo libertario: desregulación, ajuste fiscal y apertura, con una agenda conservadora en valores.',
    [95, 95, 85, 90, 70, 45, 30, 40, 60, 80, 55]],
  ['pro', 'PRO', 'Argentina', 'Centroderecha liberal: mercado, orden fiscal y seguridad, con posiciones moderadas en valores.',
    [60, 55, 55, 55, 70, 10, 10, 30, 0, 30, 0]],
  ['ucr', 'Unión Cívica Radical', 'Argentina', 'Centro republicano: defensa de las instituciones, educación pública y economía mixta.',
    [15, 10, 20, 15, 20, -20, -30, -10, -30, -10, -60]],
  ['ps', 'Partido Socialista', 'Argentina', 'Centroizquierda socialdemócrata e institucionalista, con fuerte agenda de derechos y ambiente.',
    [-40, -45, -20, -45, -25, -65, -65, -40, -40, -55, -60]],
  ['peronismo_federal', 'Peronismo federal', 'Argentina', 'Peronismo no kirchnerista: pragmático, productivista y con peso de los gobernadores.',
    [-25, -20, -30, -35, 35, 5, 15, 5, 10, 35, 0]],
  ['kirchnerismo', 'Kirchnerismo (Unión por la Patria)', 'Argentina', 'Peronismo de centroizquierda: Estado activo, redistribución, protección industrial y agenda de derechos.',
    [-75, -75, -65, -80, -45, -55, -35, -45, 30, 10, 15]],
  ['fit', 'Frente de Izquierda', 'Argentina', 'Izquierda trotskista: estatización de sectores clave, no pago de la deuda y defensa sindical.',
    [-100, -90, -60, -100, -85, -85, -80, -90, 0, -50, -35]],

  // Resto del mundo
  ['gop', 'Partido Republicano', 'EE.UU.', 'Derecha estadounidense, hoy marcada por el trumpismo: aranceles, control migratorio y soberanismo.',
    [60, 80, -60, 60, 80, 65, 60, 90, 90, 85, 70]],
  ['dem', 'Partido Demócrata', 'EE.UU.', 'Centroizquierda estadounidense: derechos civiles, políticas climáticas y cobertura social.',
    [-35, -40, -10, -45, -30, -60, -45, -40, -55, -65, -60]],
  ['psoe', 'PSOE', 'España', 'Socialdemocracia española: Estado de bienestar, feminismo y europeísmo.',
    [-40, -50, 5, -45, -30, -65, -60, -30, -60, -65, -40]],
  ['pp', 'Partido Popular', 'España', 'Centroderecha española: liberalismo económico moderado y europeísmo.',
    [40, 30, 40, 30, 50, 15, 15, 30, -20, 10, -30]],
  ['vox', 'Vox', 'España', 'Derecha nacionalista española: tradicionalismo, control migratorio y euroescepticismo.',
    [50, 40, 10, 30, 85, 80, 65, 90, 80, 70, 40]],
  ['pt', 'Partido de los Trabajadores', 'Brasil', 'Izquierda brasileña: programas sociales, Estado desarrollista y liderazgo regional.',
    [-60, -60, -40, -60, -40, -35, -10, -40, -30, -30, -30]],
  ['pl', 'Partido Liberal (bolsonarismo)', 'Brasil', 'Derecha brasileña: conservadurismo religioso, mano dura y crítica a la agenda ambiental global.',
    [45, 35, 10, 45, 90, 85, 85, 40, 70, 80, 70]],
  ['morena', 'Morena', 'México', 'Izquierda nacional-popular mexicana: programas sociales, soberanía energética y Ejecutivo fuerte.',
    [-55, -55, -30, -55, 20, -25, -20, -20, 40, 20, 50]],
  ['frente_amplio', 'Frente Amplio', 'Chile', 'Nueva izquierda chilena: feminismo, ecologismo y ampliación de derechos sociales.',
    [-65, -65, -20, -65, -45, -80, -65, -40, -50, -75, -50]],
  ['republicanos_cl', 'Partido Republicano', 'Chile', 'Derecha conservadora chilena: libre mercado, orden público y control migratorio.',
    [70, 65, 60, 60, 90, 80, 70, 85, 60, 50, 50]],
  ['rn', 'Rassemblement National', 'Francia', 'Derecha nacionalista francesa: control migratorio, proteccionismo y Estado social para los nacionales.',
    [-10, -10, -60, -20, 85, 40, 20, 95, 85, 40, 40]],
  ['renaissance', 'Renaissance', 'Francia', 'Centro liberal francés: reformas pro mercado, europeísmo y laicidad.',
    [40, 20, 45, 45, 30, -35, -60, 10, -65, -40, -20]],
  ['labour', 'Partido Laborista', 'Reino Unido', 'Centroizquierda británica: servicios públicos, derechos laborales y moderación económica.',
    [-30, -35, 0, -40, 0, -40, -40, 0, -40, -50, -50]],
  ['nuevas_ideas', 'Nuevas Ideas', 'El Salvador', 'Movimiento de Nayib Bukele: seguridad de mano dura y concentración del poder ejecutivo.',
    [10, 10, 20, 20, 100, 60, 40, 30, 60, 40, 100]],
])

export const figures: Reference[] = build('figura', [
  // Argentina
  ['milei', 'Javier Milei', 'Argentina', 'Economista libertario; propone reducir al mínimo el Estado y desregular la economía.',
    [100, 100, 90, 95, 70, 50, 30, 40, 65, 85, 65]],
  ['bullrich', 'Patricia Bullrich', 'Argentina', 'Referente de la seguridad de mano dura y aliada del programa económico liberal.',
    [70, 70, 60, 70, 95, 25, 20, 60, 40, 50, 40]],
  ['macri', 'Mauricio Macri', 'Argentina', 'Fundador del PRO; centroderecha liberal y gradualista.',
    [65, 55, 60, 60, 60, 10, 10, 20, 0, 30, -10]],
  ['lousteau', 'Martín Lousteau', 'Argentina', 'Economista radical; centro progresista en valores e institucionalista.',
    [10, 0, 20, 5, 0, -45, -50, -25, -45, -40, -60]],
  ['schiaretti', 'Juan Schiaretti', 'Argentina', 'Peronista cordobés no kirchnerista; productivista y federal.',
    [0, -5, -10, -20, 40, 10, 10, 10, 0, 40, -20]],
  ['cfk', 'Cristina Fernández de Kirchner', 'Argentina', 'Líder del kirchnerismo; Estado activo, redistribución y soberanía económica.',
    [-75, -70, -65, -75, -40, -50, -30, -45, 35, 15, 35]],
  ['kicillof', 'Axel Kicillof', 'Argentina', 'Economista heterodoxo del peronismo bonaerense; fuerte intervención estatal.',
    [-85, -80, -75, -85, -50, -60, -45, -50, 30, -10, 10]],
  ['bregman', 'Myriam Bregman', 'Argentina', 'Referente del Frente de Izquierda; socialismo, derechos humanos y feminismo.',
    [-100, -95, -60, -100, -90, -90, -85, -95, 0, -55, -40]],

  // Resto del mundo
  ['trump', 'Donald Trump', 'EE.UU.', 'Nacionalismo económico, aranceles, control migratorio y rechazo a los acuerdos multilaterales.',
    [55, 80, -80, 55, 90, 50, 50, 100, 100, 95, 90]],
  ['harris', 'Kamala Harris', 'EE.UU.', 'Demócrata de centroizquierda; derechos reproductivos, política climática y alianzas internacionales.',
    [-30, -35, -10, -45, -10, -65, -45, -20, -55, -65, -60]],
  ['sanders', 'Bernie Sanders', 'EE.UU.', 'Socialdemócrata; salud universal, impuestos a las grandes fortunas y apoyo sindical.',
    [-80, -85, -50, -90, -50, -70, -55, -45, -40, -85, -60]],
  ['lula', 'Lula da Silva', 'Brasil', 'Líder del PT; programas sociales, desarrollismo e integración regional.',
    [-55, -60, -35, -60, -35, -20, 0, -40, -35, -35, -35]],
  ['bolsonaro', 'Jair Bolsonaro', 'Brasil', 'Derecha conservadora brasileña; mano dura, religión en lo público y escepticismo ambiental.',
    [40, 30, 10, 45, 95, 90, 90, 40, 80, 90, 85]],
  ['boric', 'Gabriel Boric', 'Chile', 'Izquierda chilena; feminismo, ecologismo y ampliación del Estado social.',
    [-60, -60, -20, -60, -30, -80, -70, -35, -50, -75, -55]],
  ['kast', 'José Antonio Kast', 'Chile', 'Derecha conservadora chilena; libre mercado, orden público y control migratorio.',
    [70, 65, 60, 60, 95, 85, 75, 90, 65, 55, 55]],
  ['bukele', 'Nayib Bukele', 'El Salvador', 'Seguridad de mano dura y concentración del poder ejecutivo.',
    [15, 10, 25, 20, 100, 55, 45, 30, 55, 40, 100]],
  ['sheinbaum', 'Claudia Sheinbaum', 'México', 'Líder de Morena; programas sociales, soberanía energética y agenda climática moderada.',
    [-50, -55, -25, -50, 10, -40, -45, -20, 30, -20, 40]],
  ['sanchez', 'Pedro Sánchez', 'España', 'Líder del PSOE; socialdemocracia, feminismo y europeísmo.',
    [-40, -50, 10, -45, -35, -70, -65, -40, -65, -70, -30]],
  ['abascal', 'Santiago Abascal', 'España', 'Líder de Vox; nacionalismo, tradicionalismo y control migratorio.',
    [50, 40, 10, 30, 90, 85, 70, 95, 85, 75, 45]],
  ['meloni', 'Giorgia Meloni', 'Italia', 'Derecha nacional-conservadora italiana; familia tradicional y control migratorio dentro de la UE.',
    [20, 20, 0, 15, 80, 70, 60, 85, 30, 30, 40]],
  ['macron', 'Emmanuel Macron', 'Francia', 'Centro liberal; reformas pro mercado, europeísmo y laicidad.',
    [40, 20, 45, 45, 35, -30, -60, 15, -70, -45, -10]],
])
