// AuthShell — shared layout wrapper for the login/register/verify screens.
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo, PageBackdrop } from "../assets/ui";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageBackdrop grid />
      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <Logo />
        <Button variant="ghost" size="sm" asChild><Link to="/"><ArrowLeft data-icon="inline-start" />Back home</Link></Button>
      </header>
      <main className="relative flex min-h-[calc(100vh-80px)] items-start justify-center px-4 py-12 sm:items-center">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader><CardTitle className="text-2xl">{title}</CardTitle><CardDescription>{subtitle}</CardDescription></CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
          {footer && <p className="mt-5 text-center text-sm text-muted-foreground">{footer}</p>}
        </div>
      </main>
    </div>
  );
}
