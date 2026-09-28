import { useEffect, useState } from 'react'
import { ComoFunciona } from './components/ComoFunciona'
import { Header } from './components/Header'
import { Inicio } from './components/Inicio'
import { Juego } from './components/Juego'
import { ParticipantForm } from './components/ParticipantForm'
import { Resultado } from './components/Resultado'
import { cartas, orden } from './data/cartas'
import { nuevaSemilla, resumir, sortear, type Resumen } from './engine/juego'
import {
  cartasVistas,
  guardarPersona,
  guardarRonda,
  marcarVistas,
  personaGuardada,
  rondaGuardada,
  type RondaGuardada,
} from './lib/guardado'
import { UNDER_16, type Participant } from './lib/participant'
import { cargarEstado, collecting, enviarPartida, type Estado } from './lib/supabase'
import type { Carta, Jugada, Tema } from './types'

type Stage =
  | { step: 'inicio' }
  | { step: 'juego'; ronda: RondaGuardada; cartas: Carta[] }
  | { step: 'datos'; ronda: RondaGuardada; resumen: Resumen }
  | { step: 'resultado'; resumen: Resumen }
  | { step: 'metodologia'; from: Stage }

const porId = new Map(cartas.map((c) => [c.id, c]))

function App() {
  const [stage, setStage] = useState<Stage>({ step: 'inicio' })
  const [guardada, setGuardada] = useState<RondaGuardada | null>(() => rondaGuardada())
  const [estado, setEstado] = useState<Estado | null>(null)

  useEffect(() => {
    cargarEstado(orden).then(setEstado)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [stage.step])

  function jugar(temas: Tema[]) {
    const semilla = nuevaSemilla()
    const elegidas = sortear(cartas, semilla, cartasVistas(), new Set(temas))
    const ronda: RondaGuardada = { semilla, cartas: elegidas.map((c) => c.id), jugadas: [], temas, inicio: Date.now() }
    guardarRonda(ronda)
    setStage({ step: 'juego', ronda, cartas: elegidas })
  }

  function retomar(ronda: RondaGuardada) {
    const elegidas = ronda.cartas.map((id) => porId.get(id)).filter((c): c is Carta => Boolean(c))
    // Si cambió el banco y faltan cartas, se empieza de nuevo.
    if (elegidas.length !== ronda.cartas.length) return jugar(ronda.temas)
    setStage({ step: 'juego', ronda, cartas: elegidas })
  }

  function avance(ronda: RondaGuardada, jugadas: Jugada[]) {
    guardarRonda({ ...ronda, jugadas })
  }

  function fin(ronda: RondaGuardada, jugadas: Jugada[]) {
    const resumen = resumir(cartas, jugadas)
    marcarVistas(jugadas.map((j) => j.carta))
    guardarRonda(null)
    setGuardada(null)
    // Los datos demográficos van siempre entre la última carta y el resultado.
    setStage({ step: 'datos', ronda: { ...ronda, jugadas }, resumen })
  }

  function datos(ronda: RondaGuardada, resumen: Resumen, persona: Participant) {
    guardarPersona(persona)
    if (persona.age !== UNDER_16) {
      enviarPartida(orden, ronda.jugadas, persona, (Date.now() - ronda.inicio) / 1000, resumen.promedio)
    }
    setStage({ step: 'resultado', resumen })
  }

  function inicio() {
    setGuardada(rondaGuardada())
    setStage({ step: 'inicio' })
  }

  function metodologia() {
    setStage((from) => (from.step === 'metodologia' ? from : { step: 'metodologia', from }))
  }

  function volver(from: Stage) {
    if (from.step === 'inicio' || from.step === 'metodologia') return inicio()
    if (from.step === 'juego') {
      const r = rondaGuardada()
      if (r) return retomar(r)
    }
    setStage(from)
  }

  return (
    <>
      <Header onHome={inicio} onMethodology={metodologia} />
      {stage.step === 'inicio' && (
        <Inicio guardada={guardada} onJugar={jugar} onRetomar={retomar} onMethodology={metodologia} />
      )}
      {stage.step === 'juego' && (
        <Juego
          key={stage.ronda.semilla}
          cartas={stage.cartas}
          jugadas={stage.ronda.jugadas}
          conteos={estado?.conteos ?? {}}
          onJugada={(j) => avance(stage.ronda, j)}
          onFin={(j) => fin(stage.ronda, j)}
        />
      )}
      {stage.step === 'datos' && (
        <ParticipantForm
          inicial={personaGuardada()}
          guardando={collecting}
          onContinue={(p) => datos(stage.ronda, stage.resumen, p)}
        />
      )}
      {stage.step === 'resultado' && (
        <Resultado
          resumen={stage.resumen}
          conteos={estado?.conteos ?? {}}
          histograma={estado?.histograma ?? null}
          onOtraRonda={() => jugar([])}
          onMethodology={metodologia}
        />
      )}
      {stage.step === 'metodologia' && (
        <ComoFunciona
          backLabel={stage.from.step === 'juego' ? 'Volver a la ronda' : stage.from.step === 'resultado' ? 'Volver al resultado' : 'Volver'}
          onBack={() => volver(stage.from)}
        />
      )}
    </>
  )
}

export default App
