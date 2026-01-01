import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Zap, Wifi, WifiOff } from "lucide-react";
import { GlassButton, GlassNavLink } from "@/components/ui/glass-tabs";
import { useStats } from "@/hooks/useData";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/stats", label: "Stats" },
  { href: "/alerts", label: "Alerts" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

function ApiStatusBadge() {
  const { data, isLoading, isError } = useStats();
  
  const isOffline = isError || data?.apiOffline;
  const isConnected = !isLoading && !isOffline && data;
  
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors",
        isLoading && "bg-muted text-muted-foreground",
        isConnected && "bg-primary/10 text-primary",
        isOffline && "bg-destructive/10 text-destructive"
      )}
    >
      {isLoading ? (
        <>
          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
          <span className="hidden sm:inline">Connecting...</span>
        </>
      ) : isConnected ? (
        <>
          <Wifi className="w-3 h-3" />
          <span className="hidden sm:inline">Live</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span className="hidden sm:inline">Offline</span>
        </>
      )}
    </div>
  );
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderColor: 'hsl(var(--primary) / 0.3)' }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
              <span className="text-xl font-bold text-foreground drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">SolBoy Alerts</span>
            </Link>
            <ApiStatusBadge />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <GlassNavLink active={location.pathname === link.href}>
                  {link.label}
                </GlassNavLink>
              </Link>
            ))}
            <a
              href="https://t.me/solboy_calls"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2"
            >
              <GlassButton variant="primary" size="sm">
                Get Started
              </GlassButton>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-muted-foreground"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden backdrop-blur-xl border-t animate-fade-in" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'hsl(var(--primary) / 0.3)' }}>
          <div className="container mx-auto px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`block transition-colors ${
                  location.pathname === link.href
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://t.me/solboy_calls"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="block"
            >
              <GlassButton variant="primary" size="md" className="w-full">
                Get Started
              </GlassButton>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
