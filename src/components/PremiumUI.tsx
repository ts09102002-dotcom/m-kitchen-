import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Mic, MicOff, CircleAlert as AlertCircle, Sparkles, Loader as Loader2, X } from "lucide-react";
import { toast } from "sonner";

// ==========================================
// 1. MAHARAJI LOGO (CUSTOM ANIME SVG CROWN)
// ==========================================
export interface LogoProps {
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export const MaharajiLogo: React.FC<LogoProps> = ({ size = "md", animated = true }) => {
  const sizeClasses = {
    sm: "h-10 py-0.5 flex items-center gap-2 text-lg font-serif",
    md: "flex flex-col items-center gap-1.5 text-xl font-semibold",
    lg: "flex flex-col items-center gap-3 text-3xl font-black text-center"
  };

  const emblemSizes = {
    sm: "w-9 h-9 shrink-0",
    md: "w-22 h-22",
    lg: "w-32 h-32 md:w-36 md:h-36"
  };

  return (
    <div className={`font-serif ${sizeClasses[size]} select-none`}>
      {/* 3D Round Mahogany and Gold Embossed Chef Medallion SVG */}
      <svg 
        className={`${emblemSizes[size]} ${animated ? "animate-logo-premium" : ""} transition-transform duration-300 hover:scale-110 active:scale-95`}
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Metallic Gold Gradient Stops for embossed luxury look */}
          <linearGradient id="goldMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FAF7F2" />
            <stop offset="20%" stopColor="#E8C766" />
            <stop offset="40%" stopColor="#D4AF37" />
            <stop offset="60%" stopColor="#B38728" />
            <stop offset="80%" stopColor="#F5DC8A" />
            <stop offset="100%" stopColor="#5C4033" />
          </linearGradient>

          {/* Premium Velvet Crimson Red Ribbon Gradient */}
          <linearGradient id="velvetRed" x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#A03546" />
            <stop offset="50%" stopColor="#7B1E2B" />
            <stop offset="100%" stopColor="#5C0F1A" />
          </linearGradient>

          {/* High Depth Drop Shadow for 3D realism */}
          <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feOffset dx="0" dy="2.5" result="offset" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.4" />
            </feComponentTransfer>
            <feComposite in="SourceGraphic" in2="offset" operator="over" />
          </filter>

          {/* Shimmer sweep glass gloss reflection */}
          <linearGradient id="shimmerGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FAF7F2" stopOpacity="0" />
            <stop offset="35%" stopColor="#FAF7F2" stopOpacity="0" />
            <stop offset="50%" stopColor="#FAF7F2" stopOpacity="0.45" />
            <stop offset="65%" stopColor="#FAF7F2" stopOpacity="0" />
            <stop offset="100%" stopColor="#FAF7F2" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Real Transparent Medallion PNG Image from User */}
        <g id="royal-maharaji-chef" filter="url(#logoShadow)">
          <image 
            href="https://i.ibb.co/rKH953Pw/f9132bb7-ee8f-4f24-9da2-1b31129efa04-removalai-preview.png"
            x="0"
            y="0"
            width="200"
            height="200"
            referrerPolicy="no-referrer"
          />
        </g>

        {/* Glassmorphic Reflection Overlay */}
        <circle cx="100" cy="100" r="95" fill="url(#shimmerGradient)" opacity="0.32" pointerEvents="none" />
      </svg>

      {/* For small spaces, show the text next to the chef avatar badge */}
      {size === "sm" && (
        <div className="tracking-tight flex items-baseline font-bold font-serif pl-1">
          <span className="text-maroon-royal pr-[1px]">Maharaji</span>
          <span className="text-gold-rich pl-[1px] md:font-semibold">Kitchen</span>
        </div>
      )}

      {/* For medium block spaces, show elegant titles beneath */}
      {size === "md" && (
        <div className="text-center mt-1">
          <div className="tracking-tight flex items-baseline justify-center font-bold font-serif text-xl">
            <span className="text-maroon-royal pr-[1px]">Maharaji</span>
            <span className="text-gold-rich pl-[1px] md:font-semibold">Kitchen</span>
          </div>
          <span className="text-[10px] tracking-[0.15em] font-accent text-mocha font-light italic block mt-0.5">
            Royal Taste, Royal Experience
          </span>
        </div>
      )}

      {/* Large promotional block labels */}
      {size === "lg" && (
        <div className="text-center mt-2">
          <div className="tracking-tight flex items-baseline justify-center font-black font-serif text-3xl">
            <span className="text-maroon-royal pr-1">Maharaji</span>
            <span className="text-gold-rich pl-1 font-semibold">Kitchen</span>
          </div>
          <span className="text-xs md:text-sm tracking-[0.18em] font-accent text-mocha font-normal italic block mt-1">
            Royal Taste, Royal Experience
          </span>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. PREMIUM BUTTON SYSTEM (HAPTIC CRADLE)
// ==========================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "gold" | "ghost" | "danger" | "icon";
  loading?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  loading = false,
  size = "md",
  className = "",
  children,
  ...props
}) => {
  const baseStyle = "relative overflow-hidden font-sans font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold-rich focus:ring-offset-1 text-center flex items-center justify-center gap-2 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeClasses = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base"
  };

  const variantClasses = {
    primary: "bg-royal-gradient text-cream-ivory shadow-lg shadow-maroon-deep/30 border border-maroon-royal/20 hover:brightness-110",
    gold: "bg-gold-gradient text-charcoal-deep font-bold border border-gold-rich shadow-md shadow-gold-rich/20 animate-gold-glow hover:brightness-105",
    ghost: "bg-transparent border border-maroon-royal/35 text-maroon-royal hover:bg-maroon-royal/5",
    danger: "bg-gradient-to-r from-red-700 to-red-950 text-cream-ivory shadow-md border border-red-900 active:scale-95",
    icon: "p-2 rounded-full border border-gold-rich/25 bg-cream-warm/40 text-mocha hover:text-maroon-royal hover:bg-cream-warm hover:scale-105"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyle} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...(props as any)}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
      {children}
    </motion.button>
  );
};

// ==========================================
// 3. PREMIUM CARD SYSTEM
// ==========================================
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "standard" | "glass" | "dark" | "outline";
}

export const Card: React.FC<CardProps> = ({
  variant = "standard",
  className = "",
  children,
  ...props
}) => {
  const base = "rounded-2xl p-6 transition-all duration-300 ";
  
  const styles = {
    standard: "bg-white border border-gold-rich/10 shadow-md shadow-mocha/5 hover:shadow-xl hover:translate-y-[-2px]",
    glass: "bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl",
    dark: "bg-luxury-dark text-cream-ivory border border-gold-rich/20 shadow-2xl p-6",
    outline: "bg-transparent border-2 border-dashed border-gold-rich/20 rounded-2xl"
  };

  return (
    <div 
      className={`${base} ${styles[variant]} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

// ==========================================
// 4. PREMIUM SKELETON LOADERS
// ==========================================
export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`relative overflow-hidden bg-cream-warm/65 rounded-xl ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F5DC8A]/25 to-transparent -translate-x-full animate-shimmer-sweep" />
    </div>
  );
};

// ==========================================
// 5. PREMIUM MODAL WRAPPER
// ==========================================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blur Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-charcoal-deep/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg bg-[#FAF7F2] rounded-3xl overflow-hidden border border-gold-rich/25 shadow-2xl z-10 p-6 md:p-8 text-espresso"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gold-rich/10 pb-4 mb-4">
              <h3 className="font-serif text-xl font-bold text-maroon-royal flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-rich animate-pulse" />
                {title}
              </h3>
              <button 
                onClick={onClose}
                className="p-1 rounded-full text-mocha hover:text-maroon-royal hover:bg-cream-warm/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inner Content */}
            <div className="max-h-[75vh] overflow-y-auto pr-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// 6. PREMIUM FORM INPUT WITH FLOATING LABEL
// ==========================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const FormInput: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = "",
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const value = props.value;

  const isFloating = focused || (value !== undefined && value !== "");

  return (
    <div className="relative mb-5 font-sans">
      <div className={`relative flex items-center rounded-xl border transition-all duration-300 bg-white ${
        error ? "border-danger focus-within:ring-danger/30" : 
        focused ? "border-gold-rich ring-2 ring-gold-rich/25" : "border-gold-rich/20"
      }`}>
        {icon && <div className="pl-3.5 text-mocha">{icon}</div>}
        
        <input
          className={`w-full px-3.5 py-3 text-sm text-espresso bg-transparent rounded-xl focus:outline-none placeholder-transparent ${className}`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        <label
          className={`absolute left-3.5 pointer-events-none transition-all duration-200 text-mocha ${
            isFloating 
              ? "text-[10px] -translate-y-5 px-1 bg-white text-maroon-royal font-medium" 
              : "text-sm translate-y-0"
          } ${icon ? "pl-7" : ""}`}
          style={{ top: isFloating ? "-4px" : "14px" }}
        >
          {label}
        </label>
      </div>
      {error && (
        <span className="flex items-center gap-1.5 text-xs text-danger mt-1 font-medium pl-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </span>
      )}
    </div>
  );
};

// ==========================================
// 7. VOICE SEARCH AND SPEECH INPUT WRAPPER
// ==========================================
interface VoiceProps {
  onResults: (text: string) => void;
  placeholder?: string;
}

export const VoiceSearchMic: React.FC<VoiceProps> = ({ onResults, placeholder = "Search dish name..." }) => {
  const [listening, setListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Speech Recognition capability
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = "en-IN"; // Set language to Indian English for curry dishes
      rec.interimResults = false;

      rec.onstart = () => {
        setListening(true);
        setSpeechError(null);
      };

      rec.onerror = (e: any) => {
        setSpeechError("Didn't catch that. Please try again.");
        setListening(false);
      };

      rec.onend = () => {
        setListening(false);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        onResults(transcript);
        setListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [onResults]);

  const toggleListen = () => {
    if (!recognitionRef.current) {
      toast.error("Voice search is not supported in this browser. Please use modern Chrome/Edge.");
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Recognition already started
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={toggleListen}
        className={`relative p-3 rounded-full border shadow-md flex items-center justify-center transition-all duration-300 cursor-pointer ${
          listening 
            ? "border-maroon-royal bg-maroon-royal text-white animate-mic-active" 
            : "border-gold-rich/30 bg-cream-warm/40 text-mocha hover:text-maroon-royal hover:bg-cream-warm"
        }`}
        title={listening ? "Listening... click to stop" : "Click to search by voice"}
      >
        {listening ? <Mic className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
        {listening && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green bg-success rounded-full ring-2 ring-[#FAF7F2]" />
        )}
      </button>
      {speechError && (
        <span className="absolute text-[10px] text-danger font-medium mt-11 bg-white px-2 py-0.5 rounded shadow">
          {speechError}
        </span>
      )}
    </div>
  );
};

// ==========================================
// 8. LUXURIOUS EMPTY STATE COMPONENT
// ==========================================
interface EmptyProps {
  title: string;
  message: string;
}

export const EmptyState: React.FC<EmptyProps> = ({ title, message }) => {
  return (
    <Card variant="outline" className="flex flex-col items-center text-center p-8 border-dashed max-w-sm mx-auto">
      <svg
        className="w-24 h-24 text-gold-rich/40 mb-3"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
        <path d="M40 50 Q50 40 60 50" stroke="currentColor" strokeWidth="1.5" />
        <path d="M45 42 L42 35" stroke="currentColor" strokeWidth="1.5" />
        <path d="M55 42 L58 35" stroke="currentColor" strokeWidth="1.5" />
        <path d="M50 63 Q50 67 48 65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <h4 className="font-serif text-lg font-bold text-maroon-royal mb-1">{title}</h4>
      <p className="text-xs text-mocha leading-relaxed">{message}</p>
    </Card>
  );
};
