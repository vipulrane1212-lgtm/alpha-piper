import { Link } from "react-router-dom";
import { Send, Zap, Bot, MessageCircle } from "lucide-react";

function Footer() {
  return (
    <>
      <style>{`
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
          z-index: 10;
        }
        
        @media (min-width: 769px) {
          .fancy-footer-content {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: 3rem;
          }
        }
        
        @media (max-width: 768px) {
          .fancy-footer {
            padding: 4rem 1.5rem 2rem;
          }
          
          .fancy-footer-content {
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }
        }
        
        .fancy-footer-brand-section {
          display: flex;
          flex-direction: column;
        }
        
        .fancy-footer-brand {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .fancy-footer-brand h3 {
          font-size: 1.5rem;
          font-weight: 500;
          margin: 0;
          color: hsl(var(--foreground));
        }
        
        .fancy-footer-brand p {
          color: hsl(var(--muted-foreground));
          margin: 0;
          line-height: 1.6;
        }
        
        .fancy-footer-button-group {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
          width: 100%;
        }
        
        .fancy-footer-button-group-50-50 {
          display: flex;
          gap: 0.75rem;
        }
        
        .fancy-footer-button-group-50-50 a {
          flex: 1;
          min-width: 0;
        }
        
        .fancy-footer-button-full {
          width: 100%;
        }
        
        .fancy-footer-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: hsl(var(--muted));
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          color: hsl(var(--muted-foreground));
          text-decoration: none;
          transition: all 0.3s ease;
          font-size: 0.875rem;
          white-space: nowrap;
          box-sizing: border-box;
        }
        
        .fancy-footer-button:hover {
          background: hsl(var(--primary) / 0.1);
          border-color: hsl(var(--primary));
          color: hsl(var(--primary));
          transform: translateY(-2px);
        }
        
        .fancy-footer-button-primary {
          background: hsl(var(--primary) / 0.1);
          border-color: hsl(var(--primary) / 0.3);
          color: hsl(var(--primary));
        }
        
        .fancy-footer-button-primary:hover {
          background: hsl(var(--primary) / 0.2);
          border-color: hsl(var(--primary));
        }
        
        .fancy-footer-copyright {
          color: hsl(var(--muted-foreground));
          font-size: 0.875rem;
          margin: 1rem 0 0 0;
        }
        
        .fancy-footer-disclaimer {
          color: hsl(var(--muted-foreground));
          font-size: 0.75rem;
          margin: 1.5rem 0 0 0;
          text-align: center;
        }
        
        .fancy-footer-links-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin: 1.5rem 0;
        }
        
        @media (max-width: 768px) {
          .fancy-footer-links-section {
            gap: 1.5rem;
          }
        }
        
        .fancy-footer-links-col {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .fancy-footer-links-col a {
          color: hsl(var(--muted-foreground));
          text-decoration: none;
          transition: color 0.3s ease;
          font-size: 0.875rem;
        }
        
        .fancy-footer-links-col a:hover {
          color: hsl(var(--foreground));
        }
        
        @media (min-width: 769px) {
          .fancy-footer-brand-section {
            grid-column: 1;
          }
          
          .fancy-footer-links-section {
            grid-column: 2 / 4;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
        `}</style>
      
      <footer id="footer" className="fancy-footer">
        <div className="fancy-footer-content">
          <div className="fancy-footer-brand-section">
            <div className="fancy-footer-brand">
              <h3>
                <Zap className="inline-block w-5 h-5 mr-2 text-primary" />
                SolBoy Alerts
              </h3>
              <p>Eat , Sleep , Trade Memecoin , Repeat</p>
            </div>
            
            <div className="fancy-footer-button-group fancy-footer-button-group-50-50">
              <a
                href="https://t.me/solboy_calls"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram Channel"
                className="fancy-footer-button"
              >
                <MessageCircle className="w-4 h-4 flex-shrink-0" />
                <span>Channel</span>
              </a>
              <a
                href="https://t.me/Plaguealertbot"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram Bot"
                className="fancy-footer-button"
              >
                <Bot className="w-4 h-4 flex-shrink-0" />
                <span>Bot</span>
              </a>
            </div>
            
            <div className="fancy-footer-button-group fancy-footer-button-group-50-50">
              <a
                href="https://t.me/gmgnaibot?start=i_drplague"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GMGN Bot"
                className="fancy-footer-button"
              >
                <Bot className="w-4 h-4 flex-shrink-0" />
                <span>GMGN Bot</span>
              </a>
              <a
                href="https://t.me/maestro?start=r-degendartadmin"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Maestro Bot"
                className="fancy-footer-button"
              >
                <Bot className="w-4 h-4 flex-shrink-0" />
                <span>Maestro Bot</span>
              </a>
            </div>
            
            <div className="fancy-footer-button-group">
              <a
                href="https://t.me/dr_plague31"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact Admin"
                className="fancy-footer-button fancy-footer-button-primary fancy-footer-button-full"
              >
                <Send className="w-4 h-4 flex-shrink-0" />
                <span>Contact Admin</span>
              </a>
            </div>
            
            <p className="fancy-footer-copyright">
              {new Date().getFullYear()} © All Rights Reserved
            </p>
          </div>
          
          <div className="fancy-footer-links-section">
            <div className="fancy-footer-links-col">
              <a
                href="https://t.me/Plaguealertbot"
                target="_blank"
                rel="noopener noreferrer"
              >
                Telegram Bot
              </a>
              <a
                href="https://t.me/dr_plague31"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contact Admin
              </a>
              <a
                href="https://telegra.ph/Solboy-Alert-Pipeline--Complete-Trading-Guide-12-23"
                target="_blank"
                rel="noopener noreferrer"
              >
                Complete Guide
              </a>
              <Link to="/alerts">Recent Alerts</Link>
              <Link to="/pipeline">Pipeline</Link>
            </div>
            
            <div className="fancy-footer-links-col">
              <Link to="/about">About</Link>
              <Link to="/pipeline">Trading Guide</Link>
              <Link to="/faq">FAQ</Link>
              <Link to="/stats">Statistics</Link>
            </div>
          </div>
          
          <p className="fancy-footer-disclaimer">
            Not financial advice. Trade at your own risk.
          </p>
        </div>
      </footer>
    </>
  );
}
export { Footer };
