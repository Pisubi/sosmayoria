import type { Axis } from '../types'

export const axes: Axis[] = [
  {
    id: 'economia',
    name: 'Economía',
    description:
      'Qué tan activo debe ser el Estado regulando precios, mercados y empresas.',
    poleA: {
      label: 'Intervención estatal',
      description:
        'El Estado debe regular mercados, controlar precios y mantener empresas públicas en sectores clave.',
    },
    poleB: {
      label: 'Libre mercado',
      description:
        'Los precios y la actividad económica deben regularse principalmente por la oferta y la demanda.',
    },
  },
  {
    id: 'fiscal',
    name: 'Fiscal',
    description:
      'Prioridad entre sostener el gasto público o equilibrar las cuentas del Estado.',
    poleA: {
      label: 'Gasto público',
      description:
        'Sostener el gasto social y los subsidios es prioritario, aunque implique déficit.',
    },
    poleB: {
      label: 'Ajuste fiscal',
      description:
        'El equilibrio de las cuentas públicas debe primar, incluso recortando gasto y subsidios.',
    },
  },
  {
    id: 'comercio',
    name: 'Comercio exterior',
    description:
      'Postura frente a aranceles, importaciones y protección de la industria nacional.',
    poleA: {
      label: 'Proteccionismo',
      description:
        'Hay que proteger la industria local con aranceles y restricciones a las importaciones.',
    },
    poleB: {
      label: 'Apertura comercial',
      description:
        'Bajar aranceles y firmar tratados de libre comercio beneficia a la economía y a los consumidores.',
    },
  },
  {
    id: 'moneda',
    name: 'Moneda',
    description:
      'Rol de la moneda nacional y el Banco Central frente a la dolarización.',
    poleA: {
      label: 'Peso y Banco Central',
      description:
        'Conviene mantener una moneda y una política monetaria propias, manejadas por el Banco Central.',
    },
    poleB: {
      label: 'Dolarización',
      description:
        'Argentina debería adoptar el dólar como moneda para terminar con la inflación.',
    },
  },
  {
    id: 'federalismo',
    name: 'Estado y provincias',
    description:
      'Distribución del poder y los recursos entre la Nación y las provincias.',
    poleA: {
      label: 'Centralismo',
      description:
        'El Gobierno nacional debe coordinar de forma centralizada la distribución de recursos y decisiones.',
    },
    poleB: {
      label: 'Federalismo',
      description:
        'Las provincias deben tener más autonomía y quedarse con más recursos propios.',
    },
  },
  {
    id: 'trabajo',
    name: 'Trabajo',
    description:
      'Regulación del mercado laboral, sindicatos y protecciones al empleo.',
    poleA: {
      label: 'Derechos laborales',
      description:
        'Los sindicatos y las protecciones laborales actuales son necesarios y no deben debilitarse.',
    },
    poleB: {
      label: 'Flexibilización laboral',
      description:
        'Las leyes laborales deben flexibilizarse para facilitar la contratación y bajar el empleo informal.',
    },
  },
  {
    id: 'seguridad',
    name: 'Seguridad',
    description:
      'Enfoque frente al delito: garantías procesales o mayor mano dura.',
    poleA: {
      label: 'Garantismo',
      description:
        'El debido proceso y las garantías individuales deben priorizarse frente al endurecimiento penal.',
    },
    poleB: {
      label: 'Mano dura',
      description:
        'Hay que endurecer penas y dar más herramientas a las fuerzas de seguridad para combatir el delito.',
    },
  },
  {
    id: 'agenda_social',
    name: 'Agenda social',
    description:
      'Postura sobre derechos como el aborto, el matrimonio igualitario y la identidad de género.',
    poleA: {
      label: 'Conservadurismo social',
      description:
        'Hay que priorizar la protección de la familia tradicional y ser cautos con reformas recientes en derechos.',
    },
    poleB: {
      label: 'Progresismo social',
      description:
        'Hay que sostener y ampliar derechos como el aborto legal, el matrimonio igualitario y la ESI.',
    },
  },
  {
    id: 'campo_energia',
    name: 'Campo y energía',
    description:
      'Rol del Estado en la producción agropecuaria y energética.',
    poleA: {
      label: 'Regulación y retenciones',
      description:
        'El Estado debe regular precios e imponer retenciones para redistribuir la renta agropecuaria y energética.',
    },
    poleB: {
      label: 'Desregulación',
      description:
        'Las retenciones y los controles de precios deben eliminarse para incentivar la producción y exportación.',
    },
  },
  {
    id: 'grieta',
    name: 'Peronismo / Antiperonismo',
    description:
      'Identificación con la tradición peronista o con las tradiciones que históricamente se le han opuesto.',
    poleA: {
      label: 'Antiperonismo',
      description:
        'El peronismo, en su conjunto, resultó más perjudicial que beneficioso para el desarrollo del país.',
    },
    poleB: {
      label: 'Peronismo',
      description:
        'El peronismo, con todas sus variantes, representa mejor los intereses de las mayorías populares.',
    },
  },
]
