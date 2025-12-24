import { Link } from "react-router-dom";
import { Send, Zap } from "lucide-react";

const socialLinks = [
  {
    name: "Telegram Bot",
    href: "https://t.me/solboy_calls",
    icon: Send,
  },
];

export function Footer() {
  return (
    <footer className="bg-secondary border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold text-foreground">SolBoy Alerts</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Premium Solana memecoin trading alerts. Quality over quantity.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/stats" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Stats
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://telegra.ph/Solboy-Alert-Pipeline--Complete-Trading-Guide-12-23"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Trading Guide
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/solboy_calls"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Telegram Bot
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Connect</h3>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary border border-border transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} SolBoy Alerts. All rights reserved.</p>
          <p className="mt-2">Not financial advice. Trade at your own risk.</p>
        </div>
      </div>
    </footer>
  );
}
