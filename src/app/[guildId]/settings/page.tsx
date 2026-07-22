"use client";

import Lottie from "lottie-react";
import development from "@/lib/coding.json";

export default function Settings() {
  return (
    <div className="flex items-start justify-center w-full h-full">
      <div className="flex flex-col items-center justify-center">
        <Lottie
          animationData={development}
          loop
          autoPlay
          className="w-82 h-82"
        />
        <h1 className="text-4xl font-black text-primary mt-4">Em desenvolvimento</h1>
        <p className="text-sm text-muted-foreground mt-4">Ainda estamos pensando o que adicionar aqui...</p>
      </div>
    </div>
  )
}