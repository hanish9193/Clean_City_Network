import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, Menu, User, ShieldCheck, Map, BarChart3, UploadCloud, Leaf } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function Navigation() {
  const [location] = useLocation();
  const { user, logout, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home", icon: Leaf },
    { href: "/upload", label: "Report Waste", icon: UploadCloud },
    { href: "/dashboard", label: "Collector Map", icon: Map },
    { href: "/analytics", label: "Impact Stats", icon: BarChart3 },
  ];

  const NavContent = ({ mobile = false }) => (
    <div className={`flex ${mobile ? "flex-col space-y-4" : "items-center space-x-6"}`}>
      {navLinks.map((link) => {
        const Icon = link.icon;
        const isActive = location === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`
              flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary
              ${isActive ? "text-primary font-bold" : "text-muted-foreground"}
            `}
            onClick={() => mobile && setIsOpen(false)}
          >
            <Icon className="w-4 h-4" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary font-display">
              WasteWise
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6">
          <NavContent />
          
          <div className="pl-6 border-l ml-6">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username || "Citizen"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email || "Verified User"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/api/login">
                <Button size="sm">Log In / Sign Up</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-6 mt-6">
                <NavContent mobile />
                <div className="border-t pt-6">
                  {user ? (
                    <Button variant="outline" className="w-full justify-start" onClick={() => logout()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  ) : (
                    <Link href="/api/login">
                      <Button className="w-full">Log In</Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
