import { LogOut, Menu, Plus, Settings, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "../context/AuthContext";

const links = [
  { label: "Home", to: "/" },
  { label: "My Projects", to: "/dashboard", protected: true },
  { label: "Community", to: "/community" },
  { label: "Pricing", to: "/pricing" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();
  const visibleLinks = links.filter((link) => !link.protected || user);
  const initials = (user?.name || user?.email || "U").split(/\s+/).map((word) => word[0]).slice(0, 2).join("").toUpperCase();

  const signOut = () => { logoutUser(); navigate("/"); };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Sparkles className="size-4" /></span>
          Creova
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {visibleLinks.map((link) => <NavLink key={link.to} to={link.to} end={link.to === "/"} className={({ isActive }) => `rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>{link.label}</NavLink>)}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          {user ? <>
            <Button variant="outline" size="sm" onClick={() => navigate("/pricing")}><Zap data-icon="inline-start" />{user.credits ?? 0}<Plus data-icon="inline-end" /></Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Open account menu"><Avatar className="size-8"><AvatarFallback>{initials}</AvatarFallback></Avatar></Button>} />
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5"><p className="text-sm font-medium">{user.name}</p><p className="truncate text-xs text-muted-foreground">{user.email}</p></div>
                <DropdownMenuSeparator />
                <DropdownMenuGroup><DropdownMenuItem onClick={() => navigate("/pricing")}><Zap data-icon="inline-start" />Buy credits</DropdownMenuItem><DropdownMenuItem onClick={() => navigate("/settings")}><Settings data-icon="inline-start" />Settings</DropdownMenuItem></DropdownMenuGroup>
                <DropdownMenuSeparator /><DropdownMenuItem onClick={signOut}><LogOut data-icon="inline-start" />Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </> : <><Button variant="ghost" asChild><Link to="/login">Sign in</Link></Button><Button asChild><Link to="/register">Get started</Link></Button></>}
        </div>
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation"><Menu /></Button>} />
          <SheetContent side="right"><SheetTitle>Navigation</SheetTitle><div className="flex flex-col gap-2 pt-6">{visibleLinks.map((link) => <Button key={link.to} variant="ghost" className="justify-start" asChild><Link to={link.to}>{link.label}</Link></Button>)}<div className="my-2 border-t" />{user ? <Button variant="ghost" className="justify-start" onClick={signOut}><LogOut data-icon="inline-start" />Sign out</Button> : <><Button variant="ghost" className="justify-start" asChild><Link to="/login">Sign in</Link></Button><Button asChild><Link to="/register">Get started</Link></Button></>}</div></SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export { Navbar };
