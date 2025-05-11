
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  BarChart3,
  Layers,
  Send,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  Package,
  X
} from "lucide-react";

const Sidebar = ({ isMobile, setMobileMenuOpen }: { isMobile: boolean; setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Orders", href: "/orders", icon: Package },
    { name: "Segments", href: "/segments", icon: Layers },
    { name: "Campaigns", href: "/campaigns", icon: Send },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const closeMobileMenu = () => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-6">
        {isMobile && (
          <div className="flex justify-end mb-4">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
        )}
        <div className="flex items-center">
            <img src="/nexcrm.jpg" alt="Logo" className="rounded-lg shadow-[0_0_20px_4px_rgba(59,130,246,0.25)]"/>
        </div>
      </div>

      <div className="px-2 flex-1 overflow-y-auto fancy-scrollbar">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeMobileMenu}
                className={`
                  flex items-center px-3 py-3 text-base font-medium rounded-md group
                  ${isActive ? 
                    'bg-primary/10 text-primary' : 
                    'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }
                `}
              >
                <item.icon className="flex-shrink-0 mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-3 py-4 border-t">
        <div className="flex items-center space-x-3 py-2">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
              {user?.displayName.charAt(0)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="w-64 flex flex-col border-r">
          <Sidebar isMobile={false} setMobileMenuOpen={setMobileMenuOpen} />
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${mobileMenuOpen ? "block" : "hidden"}`}
      >
        <div className="fixed inset-0 bg-black/25" onClick={() => setMobileMenuOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-background">
          <Sidebar isMobile={true} setMobileMenuOpen={setMobileMenuOpen} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <Button
            variant="ghost"
            onClick={() => setMobileMenuOpen(true)}
            className="-ml-0.5 -mt-0.5 inline-flex items-center justify-center"
            size="icon"
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </Button>
        </div>

        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
