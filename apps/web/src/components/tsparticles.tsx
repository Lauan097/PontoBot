"use client"

import type { Engine, ISourceOptions } from "@tsparticles/engine"
import Particles, { ParticlesProvider } from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"
import { useMemo } from "react"

const init = async (engine: Engine): Promise<void> => {
  await loadSlim(engine)
}

export function ParticlesBackground() {
  const options = useMemo<ISourceOptions>(
    () => ({
      particles: {
        move: {
          enable: true,
          speed: 0.02
        },
        number: { value: 80 },
        size: { value: 1 },
        // color: { value: "#ffffff" },
        opacity: { value: 0.3 },
      },
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "repulse",
          },
        },
        modes: {
          repulse: {
            distance: 10,
            duration: 0.2,
            factor: 0.6,
          }
        }
      }
    }), []
  )

  return (
    <ParticlesProvider init={init}>
      <Particles
        id="tsparticles"
        options={options}
        className="absolute"
      />
    </ParticlesProvider>
  )
}
