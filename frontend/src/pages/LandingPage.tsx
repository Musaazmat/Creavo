import {
  ArrowUp,
  ArrowUpRight,
  ChevronRight,
  Code2,
  Globe,
  Layers,
  Shield,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  return <div className="min-h-screen bg-background text-foreground"><Navbar /><Hero /><Features /><CTA /><Footer /></div>;
}

function Hero() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  function handleCreate() {
    const trimmed = prompt.trim();
    navigate(user ? (trimmed ? `/dashboard?prompt=${encodeURIComponent(trimmed)}` : "/dashboard") : "/register");
  }
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-24 sm:pt-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.75_0.16_55/0.18),transparent_50%)]" />
      <div className="relative mx-auto max-w-3xl text-center">
        <Button variant="outline" size="sm" className="mb-8 rounded-full" onClick={() => navigate("/pricing")}><Badge variant="secondary">NEW</Badge>Try 30 days free trial<ChevronRight data-icon="inline-end" /></Button>
        <h1 className="mb-5 text-balance text-5xl font-semibold tracking-tight sm:text-7xl">Turn thoughts into websites instantly, with <span className="bg-gradient-to-br from-rose-500 via-orange-500 to-amber-400 bg-clip-text text-transparent">AI.</span></h1>
        <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">Create, customise and publish websites faster than ever with the Creova site builder.</p>
        <Card className="mx-auto max-w-2xl border-primary/20 shadow-lg"><CardContent className="p-3"><Textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); handleCreate(); } }} rows={3} placeholder="Describe your website in detail..." aria-label="Describe your website" className="resize-none border-0 shadow-none focus-visible:ring-0" /><div className="flex items-center justify-between gap-3 pt-2"><span className="flex items-center gap-1.5 px-2 text-xs text-muted-foreground"><Sparkles data-icon="inline-start" />Powered by Creova</span><Button onClick={handleCreate}>Create with AI<ArrowUp data-icon="inline-end" /></Button></div></CardContent></Card>
        <div className="mt-16 flex flex-col items-center gap-4"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Trusted by builders shipping with</p><div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-medium text-muted-foreground">{["React", "Tailwind", "Gemini", "MongoDB", "Stripe", "GitHub"].map((name) => <span key={name} className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-primary" />{name}</span>)}</div></div>
      </div>
    </section>
  );
}

const features = [[Zap, "Generate in seconds", "Describe what you want and get a finished, working site in under three seconds."], [Wand2, "Refine by chatting", "Iterate on copy, sections and styling with plain-English requests. No design skills required."], [Globe, "Publish in one click", "Deploy to a free Creova.app subdomain or bring your own domain when you're ready."], [Code2, "Own your code", "Export production-ready HTML and CSS anytime. No lock-in, no proprietary file formats."], [Layers, "Component library", "Reusable hero, pricing, and feature blocks that always stay visually consistent."], [Shield, "Built-in best practices", "Accessible, responsive, and SEO-ready output that scores top marks on Lighthouse."]] as const;

function Features() {
  return <section className="border-t px-4 py-24"><div className="mx-auto max-w-6xl"><div className="mb-14 text-center"><Badge variant="secondary" className="mb-3">Features</Badge><h2 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">Everything you need to <span className="text-primary">ship</span>.</h2><p className="mx-auto max-w-lg text-muted-foreground">A complete toolkit for designing, refining, and publishing modern websites — without leaving your browser.</p></div><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{features.map(([Icon, title, description]) => <Card key={title} className="transition-transform hover:-translate-y-0.5"><CardContent className="p-6"><div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon /></div><h3 className="mb-1.5 font-semibold">{title}</h3><p className="text-sm leading-relaxed text-muted-foreground">{description}</p></CardContent></Card>)}</div></div></section>;
}

function CTA() {
  const navigate = useNavigate();
  const { user } = useAuth();
  return <section className="border-t px-4 py-24"><div className="mx-auto max-w-3xl text-center"><Badge variant="outline" className="mb-5"><Sparkles data-icon="inline-start" />20 free credits on signup</Badge><h2 className="mb-4 text-4xl font-semibold tracking-tight sm:text-5xl">Stop wireframing.<br />Start <span className="text-primary">shipping</span>.</h2><p className="mx-auto mb-8 max-w-md text-muted-foreground">Your first 20 credits are on us — enough for 4 new sites or 10 changes. No card required.</p><Button size="lg" onClick={() => navigate(user ? "/dashboard" : "/register")}>{user ? "Start a new site" : "Create your first site"}<ArrowUpRight data-icon="inline-end" /></Button></div></section>;
}
