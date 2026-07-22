"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { SaveBar } from "@/components/saveBar";
import {
  Settings as SettingsIcon,
  Hash,
  ShieldAlert,
  Clock,
  PauseCircle,
  Target,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  LogIn,
  LogOut,
} from "lucide-react";
import {
  getSettingsAction,
  updateSettingsAction,
  DiscordChannel,
  DiscordRole,
  SettingsData,
} from "./actions";

const PRESET_GOALS = [
  { label: "1 hora semanal", seconds: 3600 },
  { label: "2 horas semanais", seconds: 7200 },
  { label: "3 horas semanais", seconds: 10800 },
  { label: "4 horas semanais", seconds: 14400 },
  { label: "5 horas semanais", seconds: 18000 },
  { label: "6 horas semanais", seconds: 21600 },
  { label: "7 horas semanais", seconds: 25200 },
  { label: "8 horas semanais", seconds: 28800 },
  { label: "9 horas semanais", seconds: 32400 },
  { label: "10 horas semanais", seconds: 36000 },
  { label: "15 horas semanais", seconds: 54000 },
  { label: "20 horas semanais", seconds: 72000 },
  { label: "30 horas semanais", seconds: 108000 },
  { label: "40 horas semanais", seconds: 144000 },
];

export default function PMSettingsPage() {
  const params = useParams();
  const guildId = params?.guildId as string;

  const [loading, setLoading] = useState(true);
  const [saving, startSaving] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [channels, setChannels] = useState<DiscordChannel[]>([]);
  const [roles, setRoles] = useState<DiscordRole[]>([]);

  const [initialForm, setInitialForm] = useState<SettingsData | null>(null);
  const [form, setForm] = useState<SettingsData>({
    weeklyGoalActive: false,
    weeklyGoalSeconds: 36000,
    pointOpenLogChannelId: null,
    pointCloseLogChannelId: null,
    pointOpenRoleId: null,
    pointPauseRoleId: null,
    pointCloseRoleId: null,
  });

  const [customHours, setCustomHours] = useState<number>(10);

  useEffect(() => {
    if (!guildId) return;

    let isMounted = true;
    setLoading(true);
    setErrorMsg(null);

    getSettingsAction(guildId)
      .then((res) => {
        if (!isMounted) return;

        if (res.error) {
          setErrorMsg(res.error);
          toast.error(res.error, { description: res.description, position: "top-right" });
          return;
        }

        if (res.channels) setChannels(res.channels);
        if (res.roles) setRoles(res.roles);

        if (res.settings) {
          setForm(res.settings);
          setInitialForm(res.settings);
          if (res.settings.weeklyGoalSeconds) {
            setCustomHours(Math.round(res.settings.weeklyGoalSeconds / 3600));
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error(err);
        setErrorMsg("Falha ao carregar dados do servidor.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [guildId]);

  const isChanged = initialForm !== null && JSON.stringify(form) !== JSON.stringify(initialForm);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isChanged) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isChanged]);

  const handleReset = () => {
    if (!initialForm) return;
    setForm(initialForm);
    if (initialForm.weeklyGoalSeconds) {
      setCustomHours(Math.round(initialForm.weeklyGoalSeconds / 3600));
    }
  };

  const handleSave = () => {
    if (!guildId) return;

    startSaving(async () => {
      const res = await updateSettingsAction(guildId, form);
      if (res.success) {
        setInitialForm(form);
        toast.success("Configurações salvas com sucesso!", {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
          position: "top-right"
        });
      } else {
        toast.error(res.error || "Erro ao salvar alterações.", {
          description: res.description,
          position: "top-right"
        });
      }
    });
  };

  const channelOptions: ComboboxOption[] = channels.map((ch) => ({
    value: ch.id,
    label: ch.name,
    icon: <Hash className="w-3.5 h-3.5 text-muted-foreground shrink-0" />,
  }));

  const roleOptions: ComboboxOption[] = roles.map((r) => ({
    value: r.id,
    label: r.name,
    color: r.hexColor,
  }));

  const presetOptions: ComboboxOption[] = PRESET_GOALS.map((p) => ({
    value: String(p.seconds),
    label: p.label,
    icon: <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />,
  }));

  if (loading) {
    return (
      <div className="p-6 md:p-10 w-full max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card><CardHeader><Skeleton className="h-6 w-full" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-6 w-full" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></CardContent></Card>
          <Card className="md:col-span-2"><CardHeader><Skeleton className="h-6 w-full" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-6 max-w-2xl mx-auto flex flex-col items-center justify-center text-center h-[60vh] space-y-4">
        <div className="p-3 rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">Acesso Indisponível</h2>
        <p className="text-sm text-muted-foreground">{errorMsg}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 w-full max-w-4xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary" />
          Configurações do Bate-Ponto
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie os canais de notificação, cargos automáticos e meta semanal de horas.
        </p>
      </div>

      {/* Grid de Seções */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* Canais de Log */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Hash className="w-4 h-4 text-primary" />
              Canais de Registros
            </CardTitle>
            <CardDescription>
              Canais para envio automático de avisos de bate-ponto.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-muted-foreground" />
                Canal de Abertura
              </Label>
              <Combobox
                options={channelOptions}
                value={form.pointOpenLogChannelId}
                onSelect={(val) =>
                  setForm((prev) => ({ ...prev, pointOpenLogChannelId: val }))
                }
                placeholder="Selecione um canal de texto..."
                searchPlaceholder="Buscar canal de texto..."
                emptyText="Nenhum canal encontrado."
                width={360}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-muted-foreground" />
                Canal de Encerramento
              </Label>
              <Combobox
                options={channelOptions}
                value={form.pointCloseLogChannelId}
                onSelect={(val) =>
                  setForm((prev) => ({ ...prev, pointCloseLogChannelId: val }))
                }
                placeholder="Selecione um canal de texto..."
                searchPlaceholder="Buscar canal de texto..."
                emptyText="Nenhum canal encontrado."
                width={360}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cargos Automáticos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Cargos Automáticos
            </CardTitle>
            <CardDescription>
              Cargos atribuídos ao membro conforme o status do ponto.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <LogIn className="w-4 h-4 text-success" />
                Cargo ao Abrir Ponto
              </Label>
              <Combobox
                options={roleOptions}
                value={form.pointOpenRoleId}
                onSelect={(val) =>
                  setForm((prev) => ({ ...prev, pointOpenRoleId: val }))
                }
                placeholder="Selecione um cargo..."
                searchPlaceholder="Buscar cargo..."
                emptyText="Nenhum cargo encontrado."
                width={360}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <PauseCircle className="w-4 h-4 text-warning" />
                Cargo ao Pausar Ponto
              </Label>
              <Combobox
                options={roleOptions}
                value={form.pointPauseRoleId}
                onSelect={(val) =>
                  setForm((prev) => ({ ...prev, pointPauseRoleId: val }))
                }
                placeholder="Selecione um cargo..."
                searchPlaceholder="Buscar cargo..."
                emptyText="Nenhum cargo encontrado."
                width={360}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <LogOut className="w-4 h-4 text-destructive" />
                Cargo ao Fechar Ponto
              </Label>
              <Combobox
                options={roleOptions}
                value={form.pointCloseRoleId}
                onSelect={(val) =>
                  setForm((prev) => ({ ...prev, pointCloseRoleId: val }))
                }
                placeholder="Selecione um cargo..."
                searchPlaceholder="Buscar cargo..."
                emptyText="Nenhum cargo encontrado."
                width={360}
              />
            </div>
          </CardContent>
        </Card>

        {/* Meta Semanal */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Meta Semanal de Horas
              </CardTitle>
              <div className="flex items-center gap-3">
                <Label htmlFor="weeklyGoalActive" className="text-sm font-medium cursor-pointer">
                  {form.weeklyGoalActive ? "Ativada" : "Desativada"}
                </Label>
                <Switch
                  id="weeklyGoalActive"
                  checked={form.weeklyGoalActive}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, weeklyGoalActive: checked }))
                  }
                />
              </div>
            </div>
            <CardDescription>
              Defina a quantidade de horas esperada para os membros cumprirem por semana.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {form.weeklyGoalActive ? (
              <div className="grid gap-4 sm:grid-cols-2 p-4 rounded-lg bg-muted/40 border">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Opção Pré-definida
                  </Label>
                  <Combobox
                    options={presetOptions}
                    value={form.weeklyGoalSeconds ? String(form.weeklyGoalSeconds) : null}
                    onSelect={(val) => {
                      if (!val) return;
                      const secs = Number(val);
                      setForm((prev) => ({ ...prev, weeklyGoalSeconds: secs }));
                      setCustomHours(Math.round(secs / 3600));
                    }}
                    placeholder="Selecione um tempo pré-definido..."
                    searchPlaceholder="Buscar tempo..."
                    emptyText="Nenhum tempo encontrado."
                    width={370}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ou digite em horas</Label>
                  <Input
                    type="number"
                    min={1}
                    max={168}
                    value={customHours}
                    onChange={(e) => {
                      const h = Math.max(0, parseInt(e.target.value) || 0);
                      setCustomHours(h);
                      setForm((prev) => ({
                        ...prev,
                        weeklyGoalSeconds: h * 3600,
                      }));
                    }}
                    placeholder="Ex: 10"
                    className="mt-1"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-muted/30 border border-dashed flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>A meta semanal está desativada. Ative o interruptor acima para configurar.</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Barra de salvamento */}
      <SaveBar
        isChanged={isChanged}
        onSubmit={handleSave}
        onReset={handleReset}
        isLoading={saving}
      />
    </div>
  );
}