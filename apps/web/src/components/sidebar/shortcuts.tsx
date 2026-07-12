import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Kbd } from "../ui/kbd"
import { Separator } from "../ui/separator"
import { Command, Keyboard, X } from "lucide-react"
import { Button } from "../ui/button"

interface DialogShortcutsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DialogShortcuts({ open, onOpenChange }: DialogShortcutsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 w-full">
              <Command size={18} />
              Atalhos do Teclado
              <div className="ml-auto">
                <DialogClose asChild>
                  <Button variant="ghost">
                    <X />
                  </Button>
                </DialogClose>
              </div></DialogTitle>
        </DialogHeader>

        <Separator />

        <div className="flex flex-col min-h-48 gap-2">
          <div className="flex items-center gap-2 bg-background/40 p-2 rounded-lg">
            <Keyboard size={18} />
            Fechar Modais
            <Kbd className="ml-auto">Esc</Kbd>
          </div>

          <div className="flex items-center gap-2 bg-background/40 p-2 rounded-lg">
            <Keyboard size={18} />
            Abrir/Fechar Sidebar
            <Kbd className="ml-auto">Ctrl + B</Kbd>
          </div>
        </div>

        <DialogFooter className="justify-center!">
          <p className="text-[10px] text-muted-foreground">
            * Podem não funcionar em certos navegadores.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
