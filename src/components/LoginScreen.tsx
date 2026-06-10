import React, { useState } from "react";
import { useStore } from "../store";
import { MaharajiLogo, Button, Card, FormInput } from "./PremiumUI";
import { KeyRound, User, Lock, Sparkles, LogIn, ChevronLeft, CircleAlert as AlertCircle } from "lucide-react";

export const LoginScreen: React.FC = () => {
  const login = useStore(state => state.login);
  const currentUser = useStore(state => state.currentUser);
  const setActiveTab = useStore(state => state.setActiveTab);

  // States
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Please key in both username and password.");
      return;
    }

    setLoading(true);

    // Simulate luxury verification delays
    setTimeout(() => {
      const success = login(username, password);
      setLoading(false);

      if (success) {
        // Find active role and set active tab
        const user = useStore.getState().currentUser;
        if (user?.role === "admin") {
          setActiveTab("live");
        } else {
          setActiveTab("live");
        }
      } else {
        // Red shake feedback trigger
        setError("Invalid royal credentials. Please retry.");
      }
    }, 800);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-cream-soft font-sans text-espresso select-none">
      
      {/* Decorative Palace Mandala Overlays in backgrounds */}
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#7B1E2B_2px,transparent_2px)] [background-size:16px_16px] pointer-events-none" />

      <div className="max-w-md w-full scale-100 transition-all duration-500 relative z-10">
        
        {/* Upper Floating Backwards Button */}
        <button 
          onClick={() => {
            window.history.pushState({}, "", "?table=5");
            window.dispatchEvent(new Event("popstate"));
          }} 
          className="absolute -top-14 left-0 flex items-center gap-1 text-xs text-mocha hover:text-maroon-royal font-bold transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Exit to Customer Menu</span>
        </button>

        <Card variant="glass" className="border-2 border-gold-rich/30 relative overflow-hidden py-10 px-8 md:px-10 rounded-3xl">
          {/* Header crown glow lines */}
          <div className="absolute top-0 inset-x-0 h-2 bg-royal-gradient" />

          {/* Logo center column */}
          <div className="mb-8">
            <MaharajiLogo size="lg" />
          </div>

          <div className="text-center mb-6">
            <h2 className="font-serif text-lg font-bold text-maroon-royal flex items-center justify-center gap-1.5 uppercase tracking-wider">
              <KeyRound className="w-4.5 h-4.5 text-gold-rich animate-pulse" />
              Staff Gateway
            </h2>
            <p className="text-xs text-mocha mt-1">
              Authenticate of security credentials to unlock restaurant POS dashboards.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <FormInput
              label="Staff Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={<User className="w-4 h-4 text-mocha" />}
              placeholder="Username"
              disabled={loading}
              required
            />

            <FormInput
              label="Private Passphrase"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4 text-mocha" />}
              placeholder="••••••••"
              disabled={loading}
              required
            />

            {error && (
              <div className="p-3.5 bg-danger/10 border border-danger/35 rounded-xl text-xs text-danger font-medium flex items-center gap-2 animate-bounce">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3.5 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider shadow-lg shadow-maroon-deep/30 cursor-pointer"
              loading={loading}
            >
              <LogIn className="w-4 h-4" />
              <span>Verify and Enter Portal</span>
            </Button>
          </form>

          {/* Secure gateway compliance */}
          <div className="mt-8 pt-4 border-t border-gold-rich/10 text-center text-[9px] text-mocha uppercase tracking-widest font-mono">
            Authorized Personnel Gateway Only
          </div>
        </Card>
      </div>
    </div>
  );
};
