"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCcw } from "lucide-react"

export function ErrorCard() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
        <AlertCircle size={32} />
      </div>
      <h2 className="text-xl font-bold mb-2">Ops, algo deu errado</h2>
      <p className="text-sm text-muted-foreground mb-8">
        Não foi possível carregar as informações no momento. Tente novamente mais tarde.
      </p>
      
      <Button 
        onClick={() => window.location.reload()}
        className="gap-2"
      >
        <RefreshCcw size={16} />
        Tentar Novamente
      </Button>
    </div>
  )
}
