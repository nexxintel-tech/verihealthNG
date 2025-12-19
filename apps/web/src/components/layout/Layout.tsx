import React from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Bell, 
  Settings, 
  Activity, 
  LogOut,
  Search,
  Menu,
  UserCheck,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { logout, getUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const { toast } = useToast();
  const user = getUser();

  const isPatient = user?.role === 'patient';
  
  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard", roles: ['patient', 'clinician', 'admin', 'institution_admin'] },
    { href: "/patients", icon: Users, label: isPatient ? "My Profile" : "Patients", roles: ['patient', 'clinician', 'admin', 'institution_admin'] },
    { href: "/alerts", icon: Bell, label: "Alerts", roles: ['clinician', 'admin', 'institution_admin'] },
    { href: "/admin/clinician-approvals", icon: UserCheck, label: "Clinician Approvals", roles: ['institution_admin'] },
    { href: "/admin/users", icon: Shield, label: "Admin Panel", roles: ['admin'] },
    { href: "/settings", icon: Settings, label: "Settings", roles: ['patient', 'clinician', 'admin', 'institution_admin'] },
  ];

  // Filter nav items based on user role
  const visibleNavItems = navItems.filter(item => 
    item.roles.includes(user?.role || 'patient')
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="p-6 flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
          <Activity className="h-5 w-5" />
        </div>
        <span className="font-heading font-bold text-xl tracking-tight">VeriHealth</span>
      </div>
      
      <div className="flex-1 px-4 py-6 space-y-1">
        {visibleNavItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div 
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                location === item.href || (item.href !== "/" && location.startsWith(item.href))
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </div>
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-sidebar-accent/50 rounded-lg p-4 mb-4">
          <h4 className="text-xs font-semibold text-sidebar-foreground/80 uppercase tracking-wider mb-2">System Status</h4>
          <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>System Operational</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60 mt-1">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span>Sync Active</span>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
          onClick={async () => {
            await logout();
            toast({
              title: "Signed out",
              description: "You have been successfully logged out",
            });
            setLocation("/login");
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0 fixed inset-y-0 left-0 z-50">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-w-0 flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 md:hidden">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 border-r-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <span className="font-heading font-bold text-lg">VeriHealth</span>
          </div>

          <div className="hidden md:flex relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search patients, conditions, or alerts..." 
              className="pl-9 bg-secondary/50 border-transparent focus:bg-background focus:border-input transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full border-2 border-card" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src="https://github.com/shadcn.png" alt="@drsmith" />
                    <AvatarFallback>DS</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.email || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">
                      {user?.role || "Role"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={async () => {
                    await logout();
                    toast({
                      title: "Signed out",
                      description: "You have been successfully logged out",
                    });
                    setLocation("/login");
                  }}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
