import { useEffect, useRef } from "react";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import CaosShell from "@/components/CaosShell";

const Index = () => {
  const { user, createLocalUser } = useLocalAuth();
  const created = useRef(false);

  // Create a local session on very first ever visit (localStorage empty).
  // useLocalAuth already reads from localStorage synchronously, so returning
  // users render CaosShell on the very first frame — no flash needed.
  useEffect(() => {
    if (!user && !created.current) {
      created.current = true;
      createLocalUser("Caos");
    }
  }, [user, createLocalUser]);

  if (!user) {
    return (
      <div className="fixed inset-0 bg-[#0a0d1a] flex items-center justify-center">
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              style={{ animationDelay: `${i * 0.2}s` }}
              className="w-2 h-2 rounded-full bg-white/30 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <CaosShell
      userId={user.id}
      aiName="Caos"
      voiceId="pt-female"
      onLogout={() => {
        localStorage.removeItem("caos_local_user");
        window.location.reload();
      }}
    />
  );
};

export default Index;
