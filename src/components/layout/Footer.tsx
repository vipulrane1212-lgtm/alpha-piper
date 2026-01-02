import { Link } from "react-router-dom";
import { Send, Zap, Bot, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css?family=IBM%20Plex%20Sans:500|IBM%20Plex%20Sans:300");
        
        .fancy-footer {
          position: relative;
          width: 100%;
          margin-top: auto;
          padding: 8rem 4rem 4rem;
          background: transparent;
          font-family: "IBM Plex Sans", system-ui, sans-serif;
          font-weight: 300;
          overflow: hidden;
        }
        
        .fancy-footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            transparent 30%,
            hsl(var(--background) / 0.3) 50%,
            hsl(var(--background) / 0.7) 70%,
            hsl(var(--background)) 100%
          );
          pointer-events: none;
          z-index: 0;
        }
        
        .fancy-footer-content {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 3rem;
          z-index: 10;
        }
        
        @media (max-width: 768px) {
          .fancy-footer {
            padding: 4rem 1.5rem 2rem;
          }
          
          .fancy-footer-content {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          
          .fancy-footer-col2,
          .fancy-footer-col3 {
            text-align: center;
          }
          
          .fancy-footer-social {
            justify-content: center;
          }
        }
        
        .fancy-footer-col1 h3 {
          font-size: 1.5rem;
          font-weight: 500;
          margin-bottom: 1rem;
          color: hsl(var(--foreground));
        }
        
        .fancy-footer-col1 p {
          color: hsl(var(--muted-foreground));
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        
        .fancy-footer-social {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        
        .fancy-footer-social a[aria-label="Contact Admin"] {
          min-width: fit-content;
          width: auto;
        }
        
        .fancy-footer-social a {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: hsl(var(--muted));
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          color: hsl(var(--muted-foreground));
          transition: all 0.3s ease;
          text-decoration: none;
        }
        
        .fancy-footer-social a:hover {
          background: hsl(var(--primary) / 0.1);
          border-color: hsl(var(--primary));
          color: hsl(var(--primary));
          transform: translateY(-2px);
        }
        
        .fancy-footer-social a[aria-label="GMGN Bot"],
        .fancy-footer-social a[aria-label="Maestro Bot"],
        .fancy-footer-social a[aria-label="Telegram Channel"],
        .fancy-footer-social a[aria-label="Telegram Bot"] {
          width: auto;
          height: auto;
          padding: 0.5rem 0.75rem;
        }
        
        .fancy-footer-telegram-buttons {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        
        @media (max-width: 768px) {
          .fancy-footer-telegram-buttons {
            justify-content: center;
          }
        }
        
        .fancy-footer-col1 .copyright {
          color: hsl(var(--muted-foreground));
          font-size: 0.875rem;
          margin-top: 1rem;
        }
        
        .fancy-footer-col2,
        .fancy-footer-col3 {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .fancy-footer-col2 p,
        .fancy-footer-col3 p {
          color: hsl(var(--muted-foreground));
          margin: 0;
          transition: color 0.3s ease;
          cursor: pointer;
        }
        
        .fancy-footer-col2 p:hover,
        .fancy-footer-col3 p:hover {
          color: hsl(var(--foreground));
        }
        
        .fancy-footer-col2 a,
        .fancy-footer-col3 a {
          color: hsl(var(--muted-foreground));
          text-decoration: none;
          transition: color 0.3s ease;
        }
        
        .fancy-footer-col2 a:hover,
        .fancy-footer-col3 a:hover {
          color: hsl(var(--foreground));
        }
      `}</style>
      
      <footer id="footer" className="fancy-footer">
        <div className="fancy-footer-content">
          <div className="fancy-footer-col1">
            <h3>
              <Zap className="inline-block w-5 h-5 mr-2 text-primary" />
              SolBoy Alerts
            </h3>
            <p>
              Eat , Sleep , Trade Memecoin , Repeat
            </p>
            
            {/* Telegram Channel & Bot Buttons */}
            <div className="fancy-footer-telegram-buttons">
              <a
                href="https://t.me/solboy_calls"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram Channel"
                className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-primary/10 border border-border hover:border-primary rounded-lg transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">Channel</span>
              </a>
              <a
                href="https://t.me/Plaguealertbot"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram Bot"
                className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-primary/10 border border-border hover:border-primary rounded-lg transition-all"
              >
                <Bot className="w-4 h-4" />
                <span className="text-sm">Bot</span>
              </a>
            </div>
            
            {/* GMGN & Maestro Bot Buttons */}
            <div className="fancy-footer-social">
              <a
                href="https://t.me/gmgnaibot?start=i_drplague"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GMGN Bot"
                className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-primary/10 border border-border hover:border-primary rounded-lg transition-all"
              >
                <Bot className="w-4 h-4" />
                <span className="text-sm">GMGN Bot</span>
              </a>
              <a
                href="https://t.me/maestro?start=r-degendartadmin"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Maestro Bot"
                className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-primary/10 border border-border hover:border-primary rounded-lg transition-all"
              >
                <Bot className="w-4 h-4" />
                <span className="text-sm">Maestro Bot</span>
              </a>
            </div>
            
            {/* Admin Contact */}
            <div className="fancy-footer-social">
              <a
                href="https://t.me/dr_plague31"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact Admin"
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary rounded-lg transition-all text-primary whitespace-nowrap"
              >
                <Send className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">Contact Admin</span>
              </a>
            </div>
            <p className="copyright">
              {new Date().getFullYear()} ÃƒÂ¢Ã¢â‚¬ÂÃ…â€œÃƒÆ’Ã‚Â©ÃƒÂ¢Ã¢â‚¬ÂÃ‚Â¬ÃƒÂ¢Ã…â€™Ã‚Â All Rights Reserved
            </p>
            <p className="copyright" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
              Not financial advice. Trade at your own risk.
            </p>
          </div>
          
          <div className="fancy-footer-col2">
            <Link to="/about">
              <p>About</p>
            </Link>
            <Link to="/pipeline">
              <p>Trading Guide</p>
            </Link>
            <Link to="/faq">
              <p>FAQ</p>
            </Link>
            <Link to="/stats">
              <p>Statistics</p>
            </Link>
          </div>
          
          <div className="fancy-footer-col3">
            <a
              href="https://t.me/Plaguealertbot"
              target="_blank"
              rel="noopener noreferrer"
            >
              <p>Telegram Bot</p>
            </a>
            <a
              href="https://t.me/dr_plague31"
              target="_blank"
              rel="noopener noreferrer"
            >
              <p>Contact Admin</p>
            </a>
            <a
              href="https://telegra.ph/Solboy-Alert-Pipeline--Complete-Trading-Guide-12-23"
              target="_blank"
              rel="noopener noreferrer"
            >
              <p>Complete Guide</p>
            </a>
            <Link to="/alerts">
              <p>Recent Alerts</p>
            </Link>
            <Link to="/pipeline">
              <p>Pipeline</p>
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
