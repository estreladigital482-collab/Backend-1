import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParticleSphere } from "@/components/ParticleSphere";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { VOICE_OPTIONS, type LocalProfile, type VoiceId } from "@/lib/types";
import { getProfileStorageKey, loadLocalProfile, saveLocalProfile } from "@/lib/localProfile";
import { speak } from "@/lib/speech";
import { Volume2 } from "lucide-react";
import { toast } from "sonner";

export default function Onboarding({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [aiName, setAiName] = useState("Caos");
  const [voiceId, setVoiceId] = useState<VoiceId>("pt-female");
  const [tone, setTone] = useState<LocalProfile["tone"]>("friendly");
  const [interests, setInterests] = useState("");
  const [personality, setPersonality] = useState("");
  const [autoMode, setAutoMode] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const localProfile = loadLocalProfile(userId);
    setTone(localProfile.tone);
    setInterests(localProfile.interests);
    setPersonality(localProfile.personality);
    setAutoMode(localProfile.autoMode);
  }, [userId]);

  const preview = (id: VoiceId) => {
    const cfg = VOICE_OPTIONS.find((v) => v.id === id)!;
    const sample = cfg.lang.startsWith("pt")
      ? `Olá, eu sou ${aiName || "sua IA"}. Estou aqui para conversar com você.`
      : `Hello, I am ${aiName || "your AI"}. I'm here to chat with you.`;
    speak(sample, id);
  };

  const save = async () => {
    if (!aiName.trim()) {
      toast.error("Dê um nome à sua IA");
      return;
    }
    setSaving(true);
    saveLocalProfile(userId, {
      tone,
      interests: interests.trim(),
      personality: personality.trim(),
      autoMode,
    });
    setSaving(false);
    onDone();
  };

  return (
    <main className="min-h-[100dvh] flex flex-col items-center px-6 py-8">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <div className="w-40 h-40 sm:w-48 sm:h-48">
          <ParticleSphere state="responding" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Configure sua IA</h1>
          <p className="text-muted-foreground text-sm">Personalize como sua IA irá se chamar e interagir com você</p>
        </div>
        <div className="w-full space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aiName">Nome da IA</Label>
            <Input
              id="aiName"
              value={aiName}
              onChange={(e) => setAiName(e.target.value)}
              placeholder="Caos"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="voiceId">Voz</Label>
            <div className="flex gap-2">
              <Select value={voiceId} onValueChange={(v) => setVoiceId(v as VoiceId)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_OPTIONS.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => preview(voiceId)}>
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tone">Tom de conversa</Label>
            <Select value={tone} onValueChange={(v) => setTone(v as LocalProfile["tone"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friendly">Amigável</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="technical">Técnico</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="interests">Interesses (opcional)</Label>
            <Textarea
              id="interests"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Tecnologia, música, jogos..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="personality">Personalidade (opcional)</Label>
            <Textarea
              id="personality"
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              placeholder="Curioso, direto, bem-humorado..."
              rows={2}
            />
          </div>
          <Button onClick={save} disabled={saving} className="w-full h-12 text-lg mt-2">
            {saving ? "Salvando..." : "Começar"}
          </Button>
        </div>
      </div>
    </main>
  );
}
