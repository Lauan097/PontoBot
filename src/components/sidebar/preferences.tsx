import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

import {
  Monitor,
  Moon,
  Palette,
  PanelLeft,
  SlidersHorizontal,
  Sun,
  X
} from "lucide-react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "../ui/separator"
import { useTheme } from "next-themes"

interface DialogPreferencesProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collapsible: "icon" | "offcanvas"
  onCollapsibleChange: (value: "icon" | "offcanvas") => void
}

export function DialogPreferences({
  open,
  onOpenChange,
  collapsible,
  onCollapsibleChange
}: DialogPreferencesProps) {
  const { theme, setTheme } = useTheme()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <form>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 w-full">
              <SlidersHorizontal size={18} />
              Preferências
              <div className="ml-auto">
                <AlertDialogCancel variant="ghost">
                  <X size={20} />
                </AlertDialogCancel>
              </div>
            </AlertDialogTitle>
          </AlertDialogHeader>
 
          <Separator />
 
          <div className="flex flex-col min-h-58 gap-4">
            <div className="flex items-center gap-2 ">
              <Palette size={18} /> Aparência
              <Tabs
                value={theme}
                onValueChange={(val) => setTheme(val)}
                className="ml-auto"
              >
                <TabsList>
                  <TabsTrigger value="system">
                    <Monitor />
                  </TabsTrigger>
                  <TabsTrigger value="light">
                    <Sun />
                  </TabsTrigger>
                  <TabsTrigger value="dark">
                    <Moon />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
 
            <div className="flex items-center gap-2 ">
              <PanelLeft size={18} /> Estado da Sidebar
              <Select
                value={collapsible}
                onValueChange={(val) => onCollapsibleChange(val as "icon" | "offcanvas")}
              >
                <SelectTrigger className="w-full max-w-38 ml-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="icon">Ícones</SelectItem>
                    <SelectItem value="offcanvas">Oculta</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <AlertDialogFooter className="justify-center!">
            <p className="text-[10px] text-muted-foreground">
              * Em breve novas opções estarão disponíveis.
            </p>
          </AlertDialogFooter>
        </AlertDialogContent>
      </form>
    </AlertDialog>
  )
}
