import { Button } from "./ui/button"
import { Card } from "./ui/card"

interface SaveBarProps {
  isChanged: boolean
  onSubmit: () => void
  onReset: () => void
  isLoading: boolean
}

export function SaveBar({
  isChanged,
  onSubmit,
  onReset,
  isLoading
}: SaveBarProps) {
  if (!isChanged) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <Card className="flex flex-col sm:flex-row items-center justify-between px-6 py-3 shadow-xl border bg-card/95 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">Cuidado — você tem alterações não salvas!</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onReset} disabled={isLoading}>
            Desfazer
          </Button>
          <Button size="sm" onClick={onSubmit} disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </Card>
    </div>
  )
}