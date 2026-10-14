import type { Eleccion, NombreEje } from '../src/types'

/**
 * Siete votantes "conscientes": qué respondería cada uno en cada carta ideológica (y en la de
 * aprobación), decidido carta por carta según la postura típica, no con el modelo de la brújula.
 * Sirven para verificar que la brújula ubica a cada uno donde se espera (tests y
 * scripts/simular-brujula.ts). Si se agrega una carta con eje, hay que sumarle su fila.
 * esperado: -1 / 0 / 1 = lado - de la escala, centro, lado +.
 */
export const ARQUETIPOS = [
  { nombre: 'Libertario mileísta', esperado: { economia: 1, valores: 1, autoridad: 1 } },
  { nombre: 'Kirchnerista', esperado: { economia: -1, valores: -1, autoridad: -1 } },
  { nombre: 'Izquierda trotskista', esperado: { economia: -1, valores: -1, autoridad: -1 } },
  { nombre: 'Centroderecha (PRO)', esperado: { economia: 1, valores: 0, autoridad: 1 } },
  { nombre: 'Peronista conservador', esperado: { economia: -1, valores: 1, autoridad: 1 } },
  { nombre: 'Radical progresista', esperado: { economia: 0, valores: -1, autoridad: -1 } },
  { nombre: 'Liberal en lo económico y lo civil', esperado: { economia: 1, valores: -1, autoridad: -1 } },
] as const satisfies readonly { nombre: string; esperado: Record<NombreEje, -1 | 0 | 1> }[]

/** Una letra por arquetipo, en el orden de ARQUETIPOS. */
const TABLA: Record<string, string> = {
  'que-deberia-priorizar-la-economia': 'baababb',
  'la-argentina-necesita-una-reforma-labora': 'abbabaa',
  'hay-que-permitir-jornadas-laborales-de-1': 'abbbbba',
  'hay-que-bajar-los-aportes-patronales': 'abbabaa',
  'tienen-que-volver-las-afjp-jubilacion-pr': 'abbabba',
  'estoy-de-acuerdo-con-la-reforma-jubilato': 'abbabba',
  'estoy-de-acuerdo-con-la-reforma-tributar': 'abbabba',
  'hay-que-privatizar-aerolineas-argentinas': 'abbabaa',
  'hay-que-privatizar-ypf': 'abbbbba',
  'se-deben-privatizar-todas-las-empresas-y': 'abbbbba',
  'los-ricos-deben-pagar-mas-impuestos-que': 'baabaab',
  'como-deberia-abrirse-la-economia-argenti': 'abbbbba',
  'es-mas-importante-proteger-la-produccion': 'baabaab',
  'que-es-mejor-para-un-pais-que-el-empleo': 'abbabaa',
  'las-empresas-de-servicios-publicos-deber': 'abbabaa',
  'la-ayuda-del-estado-a-los-sectores-mas-p': 'baaaaab',
  'hay-que-hacer-mas-controles-de-precios-p': 'baababb',
  'que-imagen-tenes-de-los-sindicatos': 'baababb',
  'hay-que-bajar-la-edad-de-imputabilidad': 'abbaabb',
  'tiene-que-haber-acceso-al-aborto-legal': 'baaabaa',
  'una-persona-deberia-poder-decidir-su-mue': 'baaabaa',
  'dos-personas-del-mismo-sexo-deberian-pod': 'baaabaa',
  'alquilar-un-vientre-para-tener-hijos-deb': 'aababaa',
  'el-trabajo-sexual-deberia-ser-legal': 'abbbbba',
  'hay-que-legalizar-el-consumo-de-marihuan': 'baabbaa',
  'igualdad-entre-varones-y-mujeres-que-pen': 'baaabaa',
  'con-que-frase-estas-mas-de-acuerdo': 'aaaaaaa',
  'si-un-gobierno-democratico-no-da-solucio': 'aaaabaa',
  'hay-que-respetar-el-derecho-a-manifestar': 'baabbaa',
  'el-gobierno-funcionaria-mejor-si-decidie': 'abbabba',
  'las-personas-poco-informadas-no-deberian': 'abbbbbb',
  'si-un-fallo-judicial-es-politico-el-pres': 'aabbabb',
  'el-estado-tiene-que-seguir-juzgando-a-lo': 'baabaaa',
  'no-me-gustaria-tener-inmigrantes-como-ve': 'bbbbabb',
  'no-me-gustaria-tener-como-vecinos-a-pers': 'abbaabb',
  'para-algunos-delitos-deberia-existir-la': 'abbbabb',
  'ante-la-inseguridad-que-hay-que-prioriza': 'abbaabb',
  'ante-un-corte-de-calle-el-gobierno-deber': 'baabbab',
  'una-sociedad-justa-es-aquella-en-la-que': 'abbaaaa',
  'las-parejas-del-mismo-sexo-deberian-pode': 'baaabaa',
  'las-deportistas-trans-deberian-competir': 'baabbba',
  'aprobas-la-gestion-del-gobierno-nacional': 'abbabba',
  'el-estado-tiene-que-ser-dueno-de-algunas': 'baaaaab',
  'el-libre-mercado-funciona-solo-para-los': 'baababb',
  'la-obra-publica-es-una-inversion-no-un-g': 'baaaaab',
  'en-la-argentina-de-hoy-el-estado-deberia': 'baaaaab',
  'el-estado-deberia-regular-la-inteligenci': 'baaaaab',
  'para-combatir-el-narcotrafico-que-es-mas': 'baabbaa',
  'para-luchar-contra-el-delito-la-policia': 'abbaabb',
  'los-militares-tienen-que-ayudar-a-combat': 'abbaabb',
  'un-gobierno-puede-suspender-por-un-tiemp': 'abbbabb',
  'hay-que-derogar-el-matrimonio-igualitari': 'abbbabb',
  'se-avanzo-tanto-en-la-igualdad-de-las-mu': 'abbaabb',
  'en-las-decisiones-importantes-del-hogar': 'bbbbabb',
  'cuando-falta-trabajo-los-hombres-deberia': 'bbbbabb',
  'el-cambio-climatico-es-un-invento-del-so': 'abbbbbb',
  'los-recursos-naturales-estrategicos-liti': 'baaaaab',
  'estas-a-favor-del-acuerdo-de-libre-comer': 'abbabaa',
}

export function respuestaDe(arquetipo: number, carta: string): Eleccion | undefined {
  return TABLA[carta]?.[arquetipo] as Eleccion | undefined
}

export const cartasConRespuesta = (): string[] => Object.keys(TABLA)
