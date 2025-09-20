import { cn } from "@/lib/utils";
import { Wallet, TrendingUp, Shield, Zap, Settings, Menu } from "lucide-react";
import { Button } from "./button";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const navigationItems = [
  { icon: Wallet, label: "Portfolio", href: "/", active: false },
  { icon: TrendingUp, label: "Analytics", href: "#", active: false },
  { icon: Shield, label: "Security", href: "/security", active: false },
  { icon: Zap, label: "DeFi", href: "/defi", active: false },
  { icon: Settings, label: "Settings", href: "#", active: false },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [items, setItems] = useState(navigationItems);

  // Update active state based on current route
  useEffect(() => {
    const updatedItems = navigationItems.map((item) => ({
      ...item,
      active:
        item.href === "/"
          ? location.pathname === "/"
          : location.pathname.includes(item.href.substring(1)),
    }));
    setItems(updatedItems);
  }, [location]);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Navigation Sidebar */}
      <nav
        className={cn(
          "fixed left-0 top-0 h-full w-64 glass-card border-r z-40 transform transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">DEFI</h1>
              <p className="text-sm text-muted-foreground">Portfolio Pro</p>
            </div>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative",
                  item.active
                    ? "bg-primary/10 text-primary font-semibold shadow-sm border-l-4 border-primary"
                    : "hover:bg-primary/5 text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    item.active ? "text-primary" : "group-hover:text-primary",
                    "group-hover:scale-110"
                  )}
                />
                <span className={cn(
                  "font-medium",
                  item.active ? "text-primary" : "group-hover:text-primary"
                )}>{item.label}</span>
                {item.active && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary"></span>
                )}
              </a>
            ))}
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="glass-subtle rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-accent"></div>
              <div>
                <p className="text-sm font-medium">Anon User</p>
                {/* <p className="text-xs text-muted-foreground">Premium User</p> */}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
