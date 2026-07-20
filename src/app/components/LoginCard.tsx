"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { signIn } from "next-auth/react"
import { FaDiscord } from "react-icons/fa"
import { FaGoogle } from "react-icons/fa6"
import Image from "next/image"

export function LoginCard() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex flex-col items-center">
        <Image
          src="/logo.svg"
          alt="Logo PontoBot"
          className="rounded-2xl border-4 border-border mb-4"
          width={60}
          height={60}
          loading="eager"
        />
        <p className="text-xl font-black text-primary">Bem-vindo(a) de volta</p>
        <p className="text-sm text-muted-foreground">
          Faça login para continuar
        </p>
      </div>

      <div className="px-6 py-7">
        <Separator className="mb-8" />

        <div className="flex flex-col gap-2.5 mb-10">
          <Button
            onClick={() => signIn("discord", { callbackUrl: "/" })}
            variant="default"
            className="py-6"
            size="lg"
          >
            <FaDiscord />
            Entrar com Discord
          </Button>
          <Button variant="secondary" className="py-6" size="lg" disabled>
            <FaGoogle />
            Entrar com Google
          </Button>
        </div>

        <p className="text-[10px] text-muted-foreground/80 text-center leading-relaxed my-auto">
          Ao entrar, você concorda com os{" "}
          <span className="underline cursor-pointer">Termos de Uso</span> e{" "}
          <span className="underline cursor-pointer">
            Política de Privacidade
          </span>
          .
        </p>
      </div>
    </div>
  )
}
