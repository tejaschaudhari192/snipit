interface AiGeneratingIconProps {
  /**
   * Tailwind width and height classes
   * @default "w-6 h-6"
   */
  size?: string;
  /**
   * Color theme - "purple" | "blue" | "emerald" | "amber"
   * @default "purple"
   */
  theme?: "purple" | "blue" | "emerald" | "amber";
  /**
   * Additional custom classes
   */
  className?: string;
}

const themeColors = {
  purple: {
    primary: "#a855f7",
    secondary: "#6366f1",
    glow: "rgba(168, 85, 247, 0.4)",
  },
  blue: {
    primary: "#3b82f6",
    secondary: "#06b6d4",
    glow: "rgba(59, 130, 246, 0.4)",
  },
  emerald: {
    primary: "#10b981",
    secondary: "#14b8a6",
    glow: "rgba(16, 185, 129, 0.4)",
  },
  amber: {
    primary: "#f59e0b",
    secondary: "#ef4444",
    glow: "rgba(245, 158, 11, 0.4)",
  },
};

const AiGeneratingIcon: React.FC<AiGeneratingIconProps> = ({
  size = "w-6 h-6",
  theme = "purple",
  className = "",
}) => {
  const colors = themeColors[theme];
  const gradientId = `ai-gradient-${theme}`;
  const glowId = `ai-glow-${theme}`;

  return (
    <div
      className={`relative flex items-center justify-center ${size} ${className}`}
      aria-label="AI Generating"
    >
      <style>{`
        @keyframes ai-sparkle {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1) rotate(0deg); 
            filter: brightness(1);
          }
          25% { 
            opacity: 0.7; 
            transform: scale(0.8) rotate(8deg); 
            filter: brightness(1.3);
          }
          50% { 
            opacity: 0.4; 
            transform: scale(0.6) rotate(0deg); 
            filter: brightness(0.85);
          }
          75% { 
            opacity: 0.7; 
            transform: scale(0.8) rotate(-8deg); 
            filter: brightness(1.2);
          }
        }
        
        @keyframes ai-pulse-glow {
          0%, 100% { 
            opacity: 0.7; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.2; 
            transform: scale(1.2);
          }
        }
        
        @keyframes ai-orbit {
          0% { transform: rotate(0deg) translateX(2px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(2px) rotate(-360deg); }
        }
        
        .ai-sparkle-main {
          animation: ai-sparkle 0.9s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        
        .ai-sparkle-secondary {
          animation: ai-sparkle 1.1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        
        .ai-sparkle-tertiary {
          animation: ai-sparkle 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        
        .ai-pulse-glow {
          animation: ai-pulse-glow 1s ease-in-out infinite;
        }
        
        .ai-orbit {
          animation: ai-orbit 3s linear infinite;
        }
      `}</style>

      {/* Definitions for gradients */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.secondary} />
          </linearGradient>
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colors.glow} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
      </svg>

      {/* Background glow pulse */}
      <div
        className="absolute inset-[-25%] rounded-full ai-pulse-glow"
        style={{
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
        }}
      />

      {/* Main Large Star */}
      <svg
        viewBox="0 0 24 24"
        className="absolute w-[85%] h-[85%] ai-sparkle-main drop-shadow-lg"
        style={{
          animationDelay: "0ms",
          filter: `drop-shadow(0 0 4px ${colors.primary})`,
        }}
      >
        <path
          d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"
          fill={`url(#${gradientId})`}
        />
      </svg>

      {/* Medium Star (Bottom Left) - with orbit effect container */}
      <div className="absolute bottom-[-5%] left-[-15%] w-[45%] h-[45%] ai-orbit">
        <svg
          viewBox="0 0 24 24"
          className="w-full h-full ai-sparkle-secondary"
          style={{
            animationDelay: "150ms",
            filter: `drop-shadow(0 0 3px ${colors.secondary})`,
          }}
        >
          <path
            d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"
            fill={`url(#${gradientId})`}
          />
        </svg>
      </div>

      {/* Small Star (Top Right) */}
      <svg
        viewBox="0 0 24 24"
        className="absolute top-[-8%] right-[-12%] w-[32%] h-[32%] ai-sparkle-tertiary"
        style={{
          animationDelay: "300ms",
          filter: `drop-shadow(0 0 2px ${colors.primary})`,
        }}
      >
        <path
          d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"
          fill={`url(#${gradientId})`}
        />
      </svg>

      {/* Tiny orbiting particle */}
      <div
        className="absolute w-[12%] h-[12%] rounded-full ai-orbit"
        style={{
          top: "10%",
          left: "80%",
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          animationDuration: "1.5s",
          animationDelay: "0.3s",
          boxShadow: `0 0 6px ${colors.glow}`,
        }}
      />
    </div>
  );
};

export default AiGeneratingIcon;
