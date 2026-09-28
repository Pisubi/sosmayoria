import type { Question } from '../types'

export const questions: Question[] = [
  // Economía
  {
    id: 'economia-1',
    axisId: 'economia',
    direction: 1,
    text: 'El Estado debería reducir su intervención en la fijación de precios y dejar que los regule el mercado.',
  },
  {
    id: 'economia-2',
    axisId: 'economia',
    direction: -1,
    text: 'El Estado debe controlar los precios de bienes esenciales para evitar abusos de posición dominante.',
  },
  {
    id: 'economia-3',
    axisId: 'economia',
    direction: 1,
    text: 'Las empresas públicas deficitarias deberían privatizarse.',
  },
  {
    id: 'economia-4',
    axisId: 'economia',
    direction: -1,
    text: 'Sectores estratégicos como la energía y el agua deben permanecer en manos del Estado.',
  },

  // Fiscal
  {
    id: 'fiscal-1',
    axisId: 'fiscal',
    direction: 1,
    text: 'El equilibrio fiscal debe ser una prioridad, incluso si implica recortar subsidios.',
  },
  {
    id: 'fiscal-2',
    axisId: 'fiscal',
    direction: -1,
    text: 'El Estado debe sostener el gasto social aunque eso implique un mayor déficit fiscal.',
  },
  {
    id: 'fiscal-3',
    axisId: 'fiscal',
    direction: 1,
    text: 'Hay que reducir el número de ministerios y organismos públicos para bajar el gasto del Estado.',
  },
  {
    id: 'fiscal-4',
    axisId: 'fiscal',
    direction: -1,
    text: 'Los subsidios a servicios públicos como luz, gas y transporte deben mantenerse para proteger el poder adquisitivo.',
  },

  // Comercio exterior
  {
    id: 'comercio-1',
    axisId: 'comercio',
    direction: 1,
    text: 'Argentina debería bajar aranceles a las importaciones para dar más competencia y opciones a los consumidores.',
  },
  {
    id: 'comercio-2',
    axisId: 'comercio',
    direction: -1,
    text: 'Hay que proteger a la industria nacional de la competencia de productos importados.',
  },
  {
    id: 'comercio-3',
    axisId: 'comercio',
    direction: 1,
    text: 'Firmar más tratados de libre comercio beneficiaría a la economía argentina.',
  },
  {
    id: 'comercio-4',
    axisId: 'comercio',
    direction: -1,
    text: 'Sin protección arancelaria, muchas industrias locales y sus empleos desaparecerían.',
  },

  // Moneda
  {
    id: 'moneda-1',
    axisId: 'moneda',
    direction: 1,
    text: 'Argentina debería dolarizar su economía para terminar con la inflación.',
  },
  {
    id: 'moneda-2',
    axisId: 'moneda',
    direction: -1,
    text: 'Es mejor mantener el peso y una política monetaria propia manejada por el Banco Central.',
  },
  {
    id: 'moneda-3',
    axisId: 'moneda',
    direction: 1,
    text: 'El Banco Central debería perder la capacidad de emitir moneda para financiar al Tesoro.',
  },
  {
    id: 'moneda-4',
    axisId: 'moneda',
    direction: -1,
    text: 'Tener moneda propia le permite al país responder mejor a las crisis económicas.',
  },

  // Federalismo
  {
    id: 'federalismo-1',
    axisId: 'federalismo',
    direction: 1,
    text: 'Las provincias deberían quedarse con más recursos y depender menos de la Nación.',
  },
  {
    id: 'federalismo-2',
    axisId: 'federalismo',
    direction: -1,
    text: 'El Gobierno nacional debe coordinar de forma centralizada la distribución de recursos entre provincias.',
  },
  {
    id: 'federalismo-3',
    axisId: 'federalismo',
    direction: 1,
    text: 'La Ciudad y las provincias deberían tener más autonomía para decidir sus propias políticas.',
  },
  {
    id: 'federalismo-4',
    axisId: 'federalismo',
    direction: -1,
    text: 'La coparticipación federal debería reformarse para dar más poder de decisión al gobierno nacional.',
  },

  // Trabajo
  {
    id: 'trabajo-1',
    axisId: 'trabajo',
    direction: 1,
    text: 'Las leyes laborales deberían flexibilizarse para facilitar la contratación.',
  },
  {
    id: 'trabajo-2',
    axisId: 'trabajo',
    direction: -1,
    text: 'Los sindicatos cumplen un rol clave en la defensa de los derechos de los trabajadores.',
  },
  {
    id: 'trabajo-3',
    axisId: 'trabajo',
    direction: 1,
    text: 'El esquema actual de indemnización por despido desalienta la creación de empleo formal.',
  },
  {
    id: 'trabajo-4',
    axisId: 'trabajo',
    direction: -1,
    text: 'El derecho a huelga y la negociación colectiva no deben debilitarse.',
  },

  // Seguridad
  {
    id: 'seguridad-1',
    axisId: 'seguridad',
    direction: 1,
    text: 'Hay que bajar la edad de imputabilidad penal.',
  },
  {
    id: 'seguridad-2',
    axisId: 'seguridad',
    direction: -1,
    text: 'Es más importante garantizar el debido proceso que endurecer las penas.',
  },
  {
    id: 'seguridad-3',
    axisId: 'seguridad',
    direction: 1,
    text: 'Las fuerzas de seguridad deberían tener más libertad de acción para enfrentar el delito.',
  },
  {
    id: 'seguridad-4',
    axisId: 'seguridad',
    direction: -1,
    text: 'Aumentar las penas no resuelve por sí solo el problema de la inseguridad.',
  },

  // Agenda social
  {
    id: 'agenda_social-1',
    axisId: 'agenda_social',
    direction: 1,
    text: 'El aborto debe seguir siendo legal, seguro y gratuito.',
  },
  {
    id: 'agenda_social-2',
    axisId: 'agenda_social',
    direction: -1,
    text: 'La familia tradicional debe ser protegida especialmente por el Estado.',
  },
  {
    id: 'agenda_social-3',
    axisId: 'agenda_social',
    direction: 1,
    text: 'La educación sexual integral debe ser obligatoria en todas las escuelas.',
  },
  {
    id: 'agenda_social-4',
    axisId: 'agenda_social',
    direction: -1,
    text: 'Los cambios recientes en las leyes de identidad de género avanzaron demasiado rápido.',
  },

  // Campo y energía
  {
    id: 'campo_energia-1',
    axisId: 'campo_energia',
    direction: 1,
    text: 'Las retenciones a las exportaciones agropecuarias deberían eliminarse.',
  },
  {
    id: 'campo_energia-2',
    axisId: 'campo_energia',
    direction: -1,
    text: 'Las retenciones son necesarias para redistribuir la renta agropecuaria.',
  },
  {
    id: 'campo_energia-3',
    axisId: 'campo_energia',
    direction: 1,
    text: 'El mercado de energía debería liberarse de controles de precios y subsidios.',
  },
  {
    id: 'campo_energia-4',
    axisId: 'campo_energia',
    direction: -1,
    text: 'El Estado debe intervenir para asegurar precios accesibles de alimentos y energía en el mercado interno.',
  },

  // Grieta / Peronismo
  {
    id: 'grieta-1',
    axisId: 'grieta',
    direction: 1,
    text: 'El peronismo, con todas sus variantes, representa mejor los intereses de las mayorías populares.',
  },
  {
    id: 'grieta-2',
    axisId: 'grieta',
    direction: -1,
    text: 'El peronismo, en su conjunto, ha sido más perjudicial que beneficioso para el desarrollo del país.',
  },
  {
    id: 'grieta-3',
    axisId: 'grieta',
    direction: 1,
    text: 'Políticas como la Asignación Universal por Hijo o las moratorias previsionales son logros que hay que defender.',
  },
  {
    id: 'grieta-4',
    axisId: 'grieta',
    direction: -1,
    text: 'Argentina necesita una alternativa política claramente no peronista para gobernar.',
  },
]
