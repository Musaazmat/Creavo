// Offline fallback website generator — builds a styled template site (palette + pages) when the AI model is unavailable.

// Palette + brand-name + tagline helpers for the mock generator.
// Kept separate so the main template can stay focused on layout.

type SiteType =
  | "ecommerce"
  | "restaurant"
  | "portfolio"
  | "agency"
  | "saas"
  | "event"
  | "nonprofit"
  | "generic";

interface Palette {
  name: string;
  primary: string;
  accent: string;
  bg: string;
  bgSoft: string;
  ink: string;
  muted: string;
}

interface Product {
  name: string;
  img: string;
  desc: string;
  price: string;
  unit?: string;
}

interface HomePageOptions {
  brand: string;
  sub: string;
  type: SiteType;
  imgKw: string;
}

interface ProductPageOptions {
  brand: string;
  products: Product[];
}

interface WorkPageOptions {
  brand: string;
  imgKw: string;
}

interface AboutPageOptions {
  brand: string;
  sub: string;
}

interface BrandPageOptions {
  brand: string;
}

interface AllPagesOptions extends HomePageOptions {
  products: Product[];
}

type NavItem = [label: string, href: string, page: string];

const PALETTES: Palette[] = [
  {
    name: "Indigo",
    primary: "#6366f1",
    accent: "#a855f7",
    bg: "#ffffff",
    bgSoft: "#f8fafc",
    ink: "#0f172a",
    muted: "#475569",
  },
  {
    name: "Emerald",
    primary: "#10b981",
    accent: "#14b8a6",
    bg: "#ffffff",
    bgSoft: "#f0fdf4",
    ink: "#052e1a",
    muted: "#475569",
  },
  {
    name: "Rose",
    primary: "#f43f5e",
    accent: "#ec4899",
    bg: "#ffffff",
    bgSoft: "#fff1f2",
    ink: "#3f0712",
    muted: "#64748b",
  },
  {
    name: "Amber",
    primary: "#f59e0b",
    accent: "#f97316",
    bg: "#ffffff",
    bgSoft: "#fffbeb",
    ink: "#451a03",
    muted: "#78350f",
  },
  {
    name: "Sky",
    primary: "#0ea5e9",
    accent: "#6366f1",
    bg: "#ffffff",
    bgSoft: "#f0f9ff",
    ink: "#0c1f3a",
    muted: "#475569",
  },
];

// Picks a color palette based on keywords found in the prompt.
function pickPalette(p: string): Palette {
  const s = (p || "").toLowerCase();
  if (/(warm|restaurant|food|spice|cafe|bakery|fruit)/.test(s))
    return PALETTES[3];
  if (/(eco|green|nature|wellness|farm|organic|plant|fruit|vegan)/.test(s))
    return PALETTES[1];
  if (/(jewel|beauty|fashion|wedding|cloth|apparel|boutique)/.test(s))
    return PALETTES[2];
  if (/(tech|saas|app|software|ai|data|dashboard)/.test(s)) return PALETTES[4];
  return PALETTES[0];
}

// Guesses the kind of site (shop, restaurant, portfolio, etc.) from the prompt.
function pickType(p: string): SiteType {
  const s = (p || "").toLowerCase();
  if (/restaurant|cafe|bakery|menu|dish|cuisine|coffee\s*shop|bistro/.test(s))
    return "restaurant";
  if (
    /shop|store|ecommerce|e-?commerce|buy|cart|product|fruit|food|order|grocery|clothes|cloth(ing)?|fashion|apparel|boutique|wear|outfit|shoe|jewel(ry|lery)|cosmetic|beauty\s*product|skincare/.test(
      s,
    )
  )
    return "ecommerce";
  if (
    /portfolio|designer|photographer|developer|artist|illustrator|writer/.test(
      s,
    )
  )
    return "portfolio";
  if (/agency|studio|consult/.test(s)) return "agency";
  if (/saas|software|app|tool|dashboard|platform/.test(s)) return "saas";
  if (/event|conference|wedding|workshop|festival/.test(s)) return "event";
  if (/ngo|charity|nonprofit|donate|foundation/.test(s)) return "nonprofit";
  return "generic";
}

// Pulls a short brand name out of the prompt text.
function brandName(p: string): string {
  const t = (p || "")
    .trim()
    .replace(/^(create|build|make|design|generate)\s+(a|an|the)\s+/i, "")
    .replace(/^(a|an|the)\s+/i, "")
    .split(/[.!?,\n]/)[0]
    .split(/\s+/)
    .slice(0, 3)
    .join(" ")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim();
  return (t || "Creova Studio").slice(0, 32);
}

// Returns a fitting tagline based on keywords in the prompt.
function tagline(p: string): string {
  const s = (p || "").toLowerCase();
  if (/fruit/.test(s)) return "Farm-fresh fruit, delivered with care.";
  if (/food|restaurant|cafe|order/.test(s))
    return "Crave-worthy dishes, delivered fast.";
  if (/cloth|fashion|apparel/.test(s))
    return "Style that speaks before you do.";
  if (/portfolio|designer|developer/.test(s))
    return "Work worth a closer look.";
  if (/saas|software|app|tool/.test(s)) return "Built for teams who ship.";
  if (/wellness|fitness|health/.test(s)) return "Feel your best, every day.";
  if (/agency|studio/.test(s)) return "Design and engineering that converts.";
  return "Beautifully made. Built to ship.";
}

// 6 themed products for ecommerce-style sites
function productsFor(p: string): Product[] {
  const s = (p || "").toLowerCase();
  if (/fruit/.test(s)) {
    return [
      {
        name: "Crisp Organic Apples",
        img: "fresh red organic apples wooden basket farmers market",
        desc: "Perfectly crunchy and sweet — snack or bake.",
        price: "5.99",
        unit: "/lb",
      },
      {
        name: "Sweet Ripe Bananas",
        img: "yellow ripe bananas wooden table sunlight tropical",
        desc: "Energy-boosting and creamy, a daily essential.",
        price: "1.99",
        unit: "/lb",
      },
      {
        name: "Juicy Navel Oranges",
        img: "fresh orange citrus fruit wooden crate sunny",
        desc: "Bursting with Vitamin C — incredibly refreshing.",
        price: "4.49",
        unit: "/bag",
      },
      {
        name: "Mixed Ripe Berries",
        img: "mixed berries strawberries blueberries raspberries bowl rustic",
        desc: "Strawberries, blueberries, and raspberries.",
        price: "7.29",
        unit: "/pack",
      },
      {
        name: "Alphonso Mangoes",
        img: "ripe alphonso mango golden indian summer wooden",
        desc: "King of mangoes — buttery and aromatic.",
        price: "12.99",
        unit: "/box",
      },
      {
        name: "Green Seedless Grapes",
        img: "fresh green grapes bunch vineyard sunlight",
        desc: "Crunchy, sweet, perfect for snacking.",
        price: "3.49",
        unit: "/lb",
      },
    ];
  }
  if (/restaurant|cafe|bakery|menu|food/.test(s)) {
    return [
      {
        name: "Margherita Pizza",
        img: "wood fired margherita pizza fresh basil mozzarella",
        desc: "San Marzano tomatoes, fior di latte, basil.",
        price: "14.50",
        unit: "",
      },
      {
        name: "Truffle Pasta",
        img: "creamy truffle pasta black truffle italian restaurant",
        desc: "Hand-rolled tagliatelle, black truffle shavings.",
        price: "22.00",
        unit: "",
      },
      {
        name: "Grilled Salmon",
        img: "grilled salmon fillet lemon asparagus elegant plate",
        desc: "Atlantic salmon, lemon-butter, seasonal greens.",
        price: "26.50",
        unit: "",
      },
      {
        name: "Butter Chicken",
        img: "creamy butter chicken indian curry naan bread",
        desc: "Slow-cooked tomato cream sauce, basmati rice.",
        price: "16.00",
        unit: "",
      },
      {
        name: "Caesar Salad",
        img: "fresh caesar salad parmesan croutons romaine",
        desc: "Crisp romaine, parmesan, garlic croutons.",
        price: "11.00",
        unit: "",
      },
      {
        name: "Chocolate Lava Cake",
        img: "warm chocolate lava cake vanilla ice cream dessert",
        desc: "Molten center, vanilla bean ice cream.",
        price: "9.50",
        unit: "",
      },
    ];
  }
  // Generic ecommerce
  return [
    {
      name: "Signature Item One",
      img: "modern lifestyle product photography minimal",
      desc: "Crafted for daily delight.",
      price: "29.00",
      unit: "",
    },
    {
      name: "Bestseller",
      img: "premium lifestyle product photography clean",
      desc: "Loved by hundreds.",
      price: "39.00",
      unit: "",
    },
    {
      name: "Limited Edition",
      img: "luxury product photo elegant studio lighting",
      desc: "Small batch, big personality.",
      price: "59.00",
      unit: "",
    },
    {
      name: "Daily Essential",
      img: "everyday lifestyle product clean studio shot",
      desc: "Made for the everyday hero.",
      price: "19.00",
      unit: "",
    },
    {
      name: "Gift Set",
      img: "gift box premium products elegant ribbon",
      desc: "Pre-curated, ready to give.",
      price: "79.00",
      unit: "",
    },
    {
      name: "New Arrival",
      img: "stylish new product photo minimal background",
      desc: "Just dropped — limited stock.",
      price: "44.00",
      unit: "",
    },
  ];
}

// Builds a square product image URL from a text description.
function imageUrl(description: string, seed: number): string {
  const desc = encodeURIComponent(description);
  return `https://image.pollinations.ai/prompt/${desc}?width=600&height=600&nologo=true&seed=${seed}`;
}

// Builds a larger hero image URL from a text description.
function heroImageUrl(description: string, seed: number): string {
  const desc = encodeURIComponent(description);
  return `https://image.pollinations.ai/prompt/${desc}?width=900&height=700&nologo=true&seed=${seed}`;
}

// Common onerror fallback string (inline, picks up alt text dynamically)
const IMG_ONERROR = `this.onerror=null;this.src='https://loremflickr.com/600/600/'+encodeURIComponent(this.alt)+'?lock='+Date.now()`;

// Individual <main data-page="..."> blocks for the mock template.
// Each returns ONLY the inner HTML of one route — header + footer live in
// mockGenerator.js.

// Builds the home route markup (hero section plus feature cards).
function homePage({ brand, sub, type, imgKw }: HomePageOptions): string {
  const heroImg = heroImageUrl(`${imgKw} hero modern lifestyle photo`, 101);
  // Context-appropriate primary CTA per site type
  const ctas = {
    ecommerce: { text: "Shop now", href: "#shop" },
    restaurant: { text: "View menu", href: "#menu" },
    portfolio: { text: "See work", href: "#shop" },
    agency: { text: "Get a quote", href: "#contact" },
    saas: { text: "Start for free", href: "#signup" },
    event: { text: "Get tickets", href: "#contact" },
    nonprofit: { text: "Donate now", href: "#contact" },
    generic: { text: "Get started", href: "#signup" },
  };
  const { text: ctaText, href: ctaHref } = ctas[type] || ctas.generic;
  return `
  <main data-page="home" class="page-route">
    <section class="hero container">
      <div class="hero-copy">
        <span class="eyebrow">Welcome to ${brand}</span>
        <h1>${brand}.<br><span class="gradient">${sub.split(" ").slice(0, 3).join(" ")}</span></h1>
        <p class="lead">${sub} Built with care, ready to ship.</p>
        <div class="ctas">
          <a class="btn-primary" href="${ctaHref}">${ctaText}</a>
          <a class="btn-ghost" href="#about">Learn more</a>
        </div>
      </div>
      <div class="hero-image">
        <img src="${heroImg}" alt="${brand} hero" loading="lazy" onerror="${IMG_ONERROR}">
      </div>
    </section>
    <section class="container">
      <header class="section-head">
        <span class="eyebrow">Why ${brand}</span>
        <h2>Crafted to feel special.</h2>
        <p class="lead">Three reasons our customers come back.</p>
      </header>
      <div class="grid-3">
        <div class="card"><div class="feat-icon">✨</div><h3>Quality first</h3><p class="muted">Hand-picked, never compromised.</p></div>
        <div class="card"><div class="feat-icon">⚡</div><h3>Fast delivery</h3><p class="muted">From our door to yours within hours.</p></div>
        <div class="card"><div class="feat-icon">💚</div><h3>Loved by locals</h3><p class="muted">4.9 stars from 2,000+ happy customers.</p></div>
      </div>
    </section>
  </main>`;
}

// Builds the shop route with a grid of product cards.
function shopPage({ brand, products }: ProductPageOptions): string {
  const cards = products
    .map((p, i) => {
      const img = imageUrl(p.img, 200 + i);
      return `
    <article class="product-card">
      <img src="${img}" alt="${p.name}" loading="lazy" onerror="${IMG_ONERROR}">
      <h3>${p.name}</h3>
      <p class="desc muted">${p.desc}</p>
      <div class="price-row">
        <span class="price">$${p.price}${p.unit}</span>
        <button class="add-to-cart" data-name="${p.name}" data-price="${p.price}" data-image="${img}">Add to Cart</button>
      </div>
    </article>`;
    })
    .join("");
  return `
  <main data-page="shop" class="page-route" hidden>
    <section class="container">
      <header class="section-head">
        <span class="eyebrow">Catalog</span>
        <h1>Shop ${brand}</h1>
        <p class="lead">Browse our full lineup — freshly stocked, ready to ship.</p>
      </header>
      <div class="product-grid">${cards}</div>
    </section>
  </main>`;
}

// Builds the restaurant menu route with a grid of dishes.
function menuPage({ brand, products }: ProductPageOptions): string {
  const items = products
    .map((p, i) => {
      const img = imageUrl(p.img, 300 + i);
      return `
    <article class="product-card">
      <img src="${img}" alt="${p.name}" loading="lazy" onerror="${IMG_ONERROR}">
      <h3>${p.name}</h3>
      <p class="desc muted">${p.desc}</p>
      <div class="price-row">
        <span class="price">$${p.price}</span>
        <button class="add-to-cart" data-name="${p.name}" data-price="${p.price}" data-image="${img}">Order</button>
      </div>
    </article>`;
    })
    .join("");
  return `
  <main data-page="menu" class="page-route" hidden>
    <section class="container">
      <header class="section-head">
        <span class="eyebrow">Our menu</span>
        <h1>Made fresh, every day.</h1>
        <p class="lead">Crafted by our chefs from locally-sourced ingredients.</p>
      </header>
      <div class="product-grid">${items}</div>
    </section>
  </main>`;
}

// Builds the portfolio "work" route with a grid of project tiles.
function workPage({ brand, imgKw }: WorkPageOptions): string {
  // 6 project tiles for portfolio sites
  const projects = [
    {
      title: "Aurora — Brand Identity",
      blurb: "A modern wordmark for a wellness studio.",
      kw: "minimal brand identity logo dark elegant",
    },
    {
      title: "Northwind — Web Redesign",
      blurb: "Reimagining a 90s airline with bold motion.",
      kw: "modern airline website design dashboard",
    },
    {
      title: "Mirror — Product Launch",
      blurb: "Launch site + campaign for a meditation app.",
      kw: "calm meditation app interface soft gradient",
    },
    {
      title: "Plain & Co — Packaging",
      blurb: "Sustainable packaging for a craft tea brand.",
      kw: "elegant tea packaging botanical minimal",
    },
    {
      title: "Sundial — Mobile App",
      blurb: "An iOS app for daily creative practice.",
      kw: "ios mobile app interface dark minimal",
    },
    {
      title: "Field Notes — Editorial",
      blurb: "Magazine layout for a quarterly print zine.",
      kw: "magazine editorial layout typography",
    },
  ];
  const tiles = projects
    .map(
      (p, i) => `
    <article class="card">
      <img src="${imageUrl(p.kw + " case study", 400 + i)}" alt="${p.title}" loading="lazy" onerror="${IMG_ONERROR}" style="aspect-ratio:4/3;object-fit:cover;border-radius:.75rem;margin-bottom:1rem">
      <h3>${p.title}</h3>
      <p class="muted">${p.blurb}</p>
    </article>`,
    )
    .join("");
  return `
  <main data-page="shop" class="page-route" hidden>
    <section class="container">
      <header class="section-head">
        <span class="eyebrow">Selected work</span>
        <h1>Recent projects.</h1>
        <p class="lead">A look at what I've shipped over the past year.</p>
      </header>
      <div class="product-grid">${tiles}</div>
    </section>
  </main>`;
}

// Builds the features route listing product highlights.
function featuresPage({ brand }: BrandPageOptions): string {
  return `
  <main data-page="features" class="page-route" hidden>
    <section class="container">
      <header class="section-head">
        <span class="eyebrow">Features</span>
        <h1>Everything you need.</h1>
        <p class="lead">A focused set of tools that helps you ship faster.</p>
      </header>
      <div class="grid-3">
        <div class="card"><div class="feat-icon">⚡</div><h3>Lightning fast</h3><p class="muted">Sub-second renders, near-perfect Lighthouse.</p></div>
        <div class="card"><div class="feat-icon">🔁</div><h3>Iterate by chat</h3><p class="muted">Every refinement lands in seconds with full context.</p></div>
        <div class="card"><div class="feat-icon">📱</div><h3>Production ready</h3><p class="muted">Semantic HTML, accessible markup, fully responsive.</p></div>
        <div class="card"><div class="feat-icon">🎨</div><h3>Beautiful by default</h3><p class="muted">Crafted typography, palette-aware gradients, motion.</p></div>
        <div class="card"><div class="feat-icon">🔒</div><h3>Secure & private</h3><p class="muted">Your data, your control — encrypted end to end.</p></div>
        <div class="card"><div class="feat-icon">🌍</div><h3>One-click deploy</h3><p class="muted">Push to GitHub Pages, Vercel, or download static HTML.</p></div>
      </div>
    </section>
  </main>`;
}

// Builds the about route with the story text and stat cards.
function aboutPage({ brand, sub }: AboutPageOptions): string {
  return `
  <main data-page="about" class="page-route" hidden>
    <section class="container">
      <header class="section-head">
        <span class="eyebrow">Our story</span>
        <h1>About ${brand}.</h1>
        <p class="lead">${sub}</p>
      </header>
      <div class="prose">
        <p>${brand} started with a simple belief: great products should feel personal. We obsess over every detail — sourcing, packaging, delivery — so you can focus on enjoying what you ordered.</p>
        <p>From day one, we've been backed by a small but dedicated team that genuinely cares about quality. Every order is checked by hand, and every customer hears back from a real person.</p>
      </div>
      <div class="grid-3" style="margin-top:3rem">
        <div class="card"><h3 class="stat">10k+</h3><p class="muted">Happy customers</p></div>
        <div class="card"><h3 class="stat">4.9★</h3><p class="muted">Average rating</p></div>
        <div class="card"><h3 class="stat">2 hrs</h3><p class="muted">Avg. response time</p></div>
      </div>
    </section>
  </main>`;
}

// Builds the contact route with a message form and contact details.
function contactPage({ brand }: BrandPageOptions): string {
  return `
  <main data-page="contact" class="page-route" hidden>
    <section class="container">
      <header class="section-head">
        <span class="eyebrow">Get in touch</span>
        <h1>We'd love to hear from you.</h1>
        <p class="lead">Drop us a line — we usually reply within a few hours.</p>
      </header>
      <div class="contact-grid">
        <form class="auth-card" onsubmit="event.preventDefault();window.__ms_toast&&window.__ms_toast('Message sent — we\\'ll be in touch!');this.reset()">
          <div class="fld"><label>Your name</label><input name="name" type="text" required></div>
          <div class="fld"><label>Email</label><input name="email" type="email" required></div>
          <div class="fld"><label>Message</label><textarea name="message" rows="4" required></textarea></div>
          <button type="submit" class="btn-primary" style="width:100%">Send message</button>
        </form>
        <aside class="contact-info">
          <div><h4>Email</h4><p class="muted">hello@${brand.toLowerCase().replace(/\s+/g, "")}.com</p></div>
          <div><h4>Phone</h4><p class="muted">+91 98765 43210</p></div>
          <div><h4>Address</h4><p class="muted">12 Marketplace Ave<br>Mumbai, IN 400001</p></div>
          <div><h4>Hours</h4><p class="muted">Mon–Sat · 9am–7pm</p></div>
        </aside>
      </div>
    </section>
  </main>`;
}

// Builds the sign-in route with a login form.
function signinPage({ brand }: BrandPageOptions): string {
  // Use string concat for onsubmit so we don't have to escape quotes.
  const onSubmit =
    "event.preventDefault();var b=this.querySelector('button[type=submit]');b.textContent='✓ Signed in';b.disabled=true;setTimeout(function(){b.textContent='Sign in';b.disabled=false},2000);";
  return `
  <main data-page="signin" class="page-route" hidden>
    <section class="container">
      <form class="auth-card" onsubmit="${onSubmit}">
        <h1 style="margin-bottom:.5rem">Welcome back</h1>
        <p class="muted" style="margin-bottom:1.5rem">Sign in to your ${brand} account.</p>
        <div class="fld"><label>Email</label><input name="email" type="email" placeholder="you@example.com" required></div>
        <div class="fld"><label>Password</label><input name="password" type="password" placeholder="••••••••" required></div>
        <button type="submit" class="btn-primary" style="width:100%">Sign in</button>
        <p class="muted" style="margin-top:1rem;text-align:center;font-size:.9rem">Don't have an account yet? <a href="#signup" style="color:var(--primary);font-weight:600">Create one</a></p>
      </form>
    </section>
  </main>`;
}

// Builds the sign-up route with a registration form.
function signupPage({ brand }: BrandPageOptions): string {
  const onSubmit =
    "event.preventDefault();var b=this.querySelector('button[type=submit]');b.textContent='✓ Account created';b.disabled=true;setTimeout(function(){b.textContent='Create account';b.disabled=false},2200);";
  return `
  <main data-page="signup" class="page-route" hidden>
    <section class="container">
      <form class="auth-card" onsubmit="${onSubmit}">
        <h1 style="margin-bottom:.5rem">Create your ${brand} account</h1>
        <p class="muted" style="margin-bottom:1.5rem">It takes less than a minute — no credit card needed.</p>
        <div class="fld"><label>Full name</label><input name="name" type="text" placeholder="Your name" required></div>
        <div class="fld"><label>Email</label><input name="email" type="email" placeholder="you@example.com" required></div>
        <div class="fld"><label>Password</label><input name="password" type="password" placeholder="At least 6 characters" minlength="6" required></div>
        <button type="submit" class="btn-primary" style="width:100%">Create account</button>
        <p class="muted" style="margin-top:1rem;text-align:center;font-size:.9rem">Already have an account? <a href="#signin" style="color:var(--primary);font-weight:600">Sign in</a></p>
      </form>
    </section>
  </main>`;
}

// Multi-page fallback template used when the LLM is unreachable. Each <main>
// route is a complete destination (header + footer stay shared). The page
// router in client/utils/previewScript.js handles swapping which <main> is
// visible — this generator just emits the markup in the agreed shape.

// Returns the full CSS stylesheet, filled in with the chosen palette colors.
const BASE_CSS = (c: Palette): string => `
:root{--primary:${c.primary};--accent:${c.accent};--bg:${c.bg};--bg-soft:${c.bgSoft};--ink:${c.ink};--muted:${c.muted};--radius:18px;--max:1200px}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:Inter,system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--ink);line-height:1.6;overflow-x:hidden}
a{color:inherit;text-decoration:none}
ul{list-style:none}
img,svg{display:block;max-width:100%}
[hidden]{display:none!important}
.container{max-width:var(--max);margin:0 auto;padding:0 1.5rem}
section{padding:clamp(3rem,6vw,5rem) 0;position:relative;z-index:1}
h1{font-size:clamp(2.2rem,6vw,4rem);font-weight:800;letter-spacing:-.02em;line-height:1.05;overflow-wrap:break-word}
h2{font-size:clamp(1.75rem,4vw,2.75rem);font-weight:700;letter-spacing:-.02em;line-height:1.15}
h3{font-size:1.1rem;font-weight:600;letter-spacing:-.01em}
h4{font-size:.85rem;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.55);margin-bottom:.75rem;font-weight:600}
.muted{color:var(--muted);font-size:.95rem}
.lead{color:var(--muted);font-size:1.05rem;line-height:1.65;max-width:60ch}
.gradient{background:linear-gradient(135deg,var(--primary),var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;color:transparent}
.eyebrow{display:inline-block;padding:.4rem .85rem;border-radius:999px;background:color-mix(in oklab,var(--primary) 12%,transparent);color:var(--primary);font-size:.78rem;font-weight:600;letter-spacing:.04em;margin-bottom:.85rem}
.btn-primary{display:inline-flex;align-items:center;gap:.5rem;padding:.85rem 1.6rem;border-radius:.75rem;background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;font-weight:600;font-size:.95rem;border:0;cursor:pointer;box-shadow:0 12px 30px -10px var(--primary);transition:transform .2s,box-shadow .2s}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 20px 40px -10px var(--primary)}
.btn-ghost{display:inline-flex;align-items:center;gap:.5rem;padding:.85rem 1.6rem;border-radius:.75rem;background:transparent;color:var(--ink);font-weight:600;font-size:.95rem;border:1px solid color-mix(in oklab,var(--ink) 15%,transparent);cursor:pointer}
.card{background:#fff;padding:1.75rem;border-radius:1rem;border:1px solid color-mix(in oklab,var(--ink) 8%,transparent);box-shadow:0 1px 3px rgba(0,0,0,.04);transition:transform .25s,box-shadow .25s}
.card:hover{transform:translateY(-4px);box-shadow:0 20px 40px -10px rgba(0,0,0,.12)}
.section-head{text-align:center;max-width:640px;margin:0 auto 3rem}
.section-head .lead{margin:0 auto}
.grid-3{display:grid;grid-template-columns:1fr;gap:1.25rem}
@media(min-width:768px){.grid-3{grid-template-columns:repeat(3,1fr)}}
.product-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem}
.product-card{background:#fff;border-radius:1rem;padding:1rem;border:1px solid color-mix(in oklab,var(--ink) 8%,transparent);transition:transform .2s,box-shadow .2s;display:flex;flex-direction:column}
.product-card:hover{transform:translateY(-4px);box-shadow:0 20px 40px -20px rgba(0,0,0,.15)}
.product-card img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:.75rem;margin-bottom:1rem}
.product-card h3{margin-bottom:.35rem}
.product-card .desc{font-size:.9rem;margin-bottom:1rem;flex:1}
.price-row{display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin-top:auto}
.price{font-weight:700;font-size:1.1rem;color:var(--primary)}
.add-to-cart{padding:.55rem 1rem;border-radius:.5rem;background:var(--primary);color:#fff;font-weight:600;font-size:.85rem;border:0;cursor:pointer;transition:background .15s}
.add-to-cart:hover{background:var(--accent)}
.feat-icon{font-size:1.75rem;margin-bottom:.75rem}
.stat{font-size:2.4rem;font-weight:800;background:linear-gradient(135deg,var(--primary),var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero{display:grid;grid-template-columns:1fr;gap:2rem;align-items:center;padding-top:clamp(2rem,5vw,4rem)}
@media(min-width:1024px){.hero{grid-template-columns:1.1fr 1fr;gap:3rem}}
.hero-copy{max-width:560px}
.hero-copy .lead{margin:1.25rem 0 1.75rem}
.ctas{display:flex;flex-wrap:wrap;gap:.75rem}
.hero-image img{border-radius:1.5rem;box-shadow:0 30px 60px -20px rgba(0,0,0,.25);aspect-ratio:4/3;object-fit:cover}
.prose p{margin-bottom:1rem;color:var(--muted);max-width:65ch;margin-left:auto;margin-right:auto;text-align:center}
.contact-grid{display:grid;grid-template-columns:1fr;gap:2rem;align-items:start;max-width:880px;margin:0 auto}
@media(min-width:768px){.contact-grid{grid-template-columns:1.2fr 1fr}}
.contact-info{display:flex;flex-direction:column;gap:1.25rem;padding:2rem 1.5rem}
.contact-info h4{color:var(--ink);letter-spacing:.04em;margin-bottom:.25rem;text-transform:none;font-size:.95rem}
.auth-card{max-width:420px;margin:2rem auto;padding:2.25rem;background:#fff;border-radius:1rem;box-shadow:0 20px 50px -20px rgba(0,0,0,.15);border:1px solid color-mix(in oklab,var(--ink) 8%,transparent)}
.fld{margin-bottom:1rem}
.fld label{display:block;font-size:.85rem;font-weight:600;margin-bottom:.4rem;color:var(--ink)}
.fld input,.fld textarea{width:100%;padding:.7rem .9rem;border-radius:.5rem;border:1px solid color-mix(in oklab,var(--ink) 15%,transparent);background:var(--bg-soft);font:inherit;color:var(--ink)}
.fld input:focus,.fld textarea:focus{outline:2px solid var(--primary);outline-offset:1px;border-color:var(--primary)}
header.nav{position:sticky;top:0;z-index:50;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);background:rgba(255,255,255,.92);border-bottom:1px solid color-mix(in oklab,var(--ink) 8%,transparent)}
.nav .inner{display:flex;align-items:center;gap:1rem;height:68px;padding:0 clamp(1rem,4vw,2rem);max-width:var(--max);margin:0 auto}
.nav .logo{display:flex;align-items:center;gap:.6rem;font-weight:700;font-size:1.05rem}
.nav .logo .mark{width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;display:grid;place-items:center;font-weight:800}
.nav .links{display:none;gap:.25rem;margin-left:auto}
@media(min-width:768px){.nav .links{display:flex}}
.nav .links a{padding:.5rem .85rem;border-radius:8px;font-size:.92rem;color:var(--muted);font-weight:500;transition:color .15s,background .15s}
.nav .links a:hover{color:var(--ink);background:color-mix(in oklab,var(--ink) 5%,transparent)}
.nav .auth{display:flex;gap:.4rem;margin-left:.5rem}
.nav .auth a{padding:.5rem .85rem;border-radius:.5rem;font-size:.9rem;font-weight:600;border:1px solid color-mix(in oklab,var(--ink) 15%,transparent)}
.nav .auth a.primary{background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;border-color:transparent}
.cart-icon{position:relative;background:transparent;border:0;cursor:pointer;font-size:22px;padding:8px;color:var(--ink)}
.cart-count{position:absolute;top:-2px;right:-2px;background:var(--primary);color:#fff;font-size:11px;border-radius:999px;min-width:18px;height:18px;padding:0 5px;display:inline-flex;align-items:center;justify-content:center;font-weight:700}
[data-page]{animation:pageIn .35s ease}
@keyframes pageIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
footer{background:var(--ink);color:#fff;padding:clamp(2.5rem,5vw,4rem) 0 2rem;margin-top:4rem}
.foot-grid{display:grid;grid-template-columns:1fr;gap:2rem;max-width:var(--max);margin:0 auto;padding:0 1.5rem}
@media(min-width:768px){.foot-grid{grid-template-columns:1.4fr 1fr 1fr 1fr}}
footer .brand-block p{color:rgba(255,255,255,.65);margin:.85rem 0;font-size:.92rem;max-width:340px}
footer ul li a{display:block;padding:.35rem 0;color:rgba(255,255,255,.78);font-size:.93rem}
footer ul li a:hover{color:#fff}
.foot-bottom{margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid rgba(255,255,255,.08);font-size:.82rem;color:rgba(255,255,255,.55);max-width:var(--max);margin-left:auto;margin-right:auto;padding-left:1.5rem;padding-right:1.5rem;display:flex;flex-wrap:wrap;gap:1rem;justify-content:space-between}
@media(max-width:768px){.container{padding:0 1rem}.product-grid{grid-template-columns:1fr 1fr;gap:1rem}.product-card img{aspect-ratio:1/1}.hero{grid-template-columns:1fr;gap:1.5rem}.hero-image{order:-1}.contact-grid{grid-template-columns:1fr}.foot-grid{grid-template-columns:1fr 1fr}h1{font-size:clamp(1.6rem,5vw,2.4rem)}h2{font-size:clamp(1.3rem,4vw,1.9rem)}section{padding:2.5rem 0}}
@media(max-width:480px){.container{padding:0 .85rem}.nav .inner{flex-wrap:wrap;gap:.4rem;height:auto;min-height:56px;padding:.6rem 1rem}.nav .links{display:flex;flex-wrap:wrap;gap:.2rem;width:100%;justify-content:center;margin-left:0;order:3}.nav .links a{padding:.35rem .55rem;font-size:.8rem}.nav .auth{margin-left:auto;gap:.3rem}.nav .auth a{padding:.35rem .65rem;font-size:.78rem}.nav .logo{font-size:.95rem}.cart-icon{padding:5px;font-size:18px}.cart-count{font-size:10px;min-width:16px;height:16px}.product-grid{grid-template-columns:1fr;gap:1rem}.grid-3{grid-template-columns:1fr;gap:1rem}.hero{padding-top:1.5rem;gap:1rem}.ctas{flex-direction:column;width:100%}.ctas>*{width:100%;text-align:center;min-height:44px}h1{font-size:clamp(1.4rem,7vw,1.9rem);line-height:1.15}h2{font-size:clamp(1.15rem,5vw,1.5rem)}p,.lead{font-size:.92rem}.card,.product-card{padding:1rem}.auth-card{max-width:100%;margin:1.5rem .5rem;padding:1.5rem}.foot-grid{grid-template-columns:1fr;text-align:center;gap:1.5rem}footer .brand-block{margin:0 auto;max-width:280px}.foot-bottom{flex-direction:column;text-align:center;gap:.5rem}section{padding:2rem 0}.section-head{margin-bottom:2rem}}
`;

// Each entry: [label, hash, dataPageValue]
function navConfig(type: SiteType): NavItem[] {
  const config: Record<SiteType, NavItem[]> = {
      ecommerce: [
        ["Home", "#home", "home"],
        ["Shop", "#shop", "shop"],
        ["About", "#about", "about"],
        ["Contact", "#contact", "contact"],
      ],
      restaurant: [
        ["Home", "#home", "home"],
        ["Menu", "#menu", "menu"],
        ["About", "#about", "about"],
        ["Contact", "#contact", "contact"],
      ],
      portfolio: [
        ["Home", "#home", "home"],
        ["Work", "#shop", "shop"],
        ["About", "#about", "about"],
        ["Contact", "#contact", "contact"],
      ],
      agency: [
        ["Home", "#home", "home"],
        ["Services", "#features", "features"],
        ["About", "#about", "about"],
        ["Contact", "#contact", "contact"],
      ],
      saas: [
        ["Home", "#home", "home"],
        ["Features", "#features", "features"],
        ["About", "#about", "about"],
        ["Contact", "#contact", "contact"],
      ],
      event: [
        ["Home", "#home", "home"],
        ["About", "#about", "about"],
        ["Contact", "#contact", "contact"],
      ],
      nonprofit: [
        ["Home", "#home", "home"],
        ["About", "#about", "about"],
        ["Contact", "#contact", "contact"],
      ],
      generic: [
        ["Home", "#home", "home"],
        ["Features", "#features", "features"],
        ["About", "#about", "about"],
        ["Contact", "#contact", "contact"],
      ],
  };
  return config[type] || [
      ["Home", "#home", "home"],
      ["About", "#about", "about"],
      ["Contact", "#contact", "contact"],
    ];
}

// Builds the nav bar link markup for the given site type.
function navFor(type: SiteType): string {
  return navConfig(type)
    .map(([label, href]) => `<a href="${href}">${label}</a>`)
    .join("\n      ");
}

// Returns a cart button, but only for shop and restaurant sites.
function cartIcon(type: SiteType): string {
  if (type !== "ecommerce" && type !== "restaurant") return "";
  return `<button class="cart-icon" aria-label="Cart">🛒 <span class="cart-count">0</span></button>`;
}

// Build a footer "Browse" column from the same nav config — so we never link
// to a #page that doesn't exist on this site type.
function footerBrowseLinks(type: SiteType): string {
  return navConfig(type)
    .map(([label, href]) => `<li><a href="${href}">${label}</a></li>`)
    .join("");
}

// Assembles all the page routes needed for the given site type.
function pagesFor({
  type,
  brand,
  sub,
  imgKw,
  products,
}: AllPagesOptions): string {
  const out = [homePage({ brand, sub, type, imgKw })];
  if (type === "ecommerce") out.push(shopPage({ brand, products }));
  if (type === "restaurant") out.push(menuPage({ brand, products }));
  if (type === "portfolio") out.push(workPage({ brand, imgKw }));
  if (["saas", "agency", "generic"].includes(type))
    out.push(featuresPage({ brand }));
  out.push(aboutPage({ brand, sub }));
  out.push(contactPage({ brand }));
  out.push(signinPage({ brand }));
  out.push(signupPage({ brand }));
  return out.join("\n");
}

// Builds the complete fallback HTML page (head, nav, pages, footer) from a prompt.
export function generateMockSite(prompt: string): string {
  const c = pickPalette(prompt);
  const type = pickType(prompt);
  const brand = brandName(prompt);
  const sub = tagline(prompt);
  const initial = brand[0]?.toUpperCase() || "M";
  const imgKw = (prompt || "modern lifestyle")
    .split(/\s+/)
    .slice(0, 3)
    .join(" ");
  const products = productsFor(prompt);

  return `<!doctype html>
<html lang="en" style="scroll-behavior:smooth">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${brand}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>${BASE_CSS(c)}</style>
</head>
<body>

<header class="nav">
  <div class="inner">
    <a class="logo" href="#home"><span class="mark">${initial}</span>${brand}</a>
    <nav class="links">
      ${navFor(type)}
    </nav>
    <div class="auth">
      <a href="#signin">Sign In</a>
      <a class="primary" href="#signup">Sign Up</a>
    </div>
    ${cartIcon(type)}
  </div>
</header>

${pagesFor({ type, brand, sub, imgKw, products })}

<footer>
  <div class="foot-grid">
    <div class="brand-block">
      <div class="logo" style="display:flex;align-items:center;gap:.6rem;font-weight:700;color:#fff"><span style="width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,var(--primary),var(--accent));display:grid;place-items:center;color:#fff;font-weight:800">${initial}</span>${brand}</div>
      <p>${sub} Built with care, served with love.</p>
    </div>
    <div><h4>Browse</h4><ul>${footerBrowseLinks(type)}</ul></div>
    <div><h4>Account</h4><ul><li><a href="#signup">Create account</a></li><li><a href="#signin">Sign in</a></li><li><a href="#contact">Help</a></li></ul></div>
    <div><h4>Connect</h4><ul><li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a></li><li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li><li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a></li></ul></div>
  </div>
  <div class="foot-bottom"><span>© ${new Date().getFullYear()} ${brand}. All rights reserved.</span><span>Built with Creova · ${c.name} edition</span></div>
</footer>

</body></html>`;
}

// Returns a plain-text site plan (type, brand, palette, pages) for a prompt.
export function mockEnhancePrompt(prompt: string): string {
  const c = pickPalette(prompt);
  const type = pickType(prompt);
  const pageMap = {
    ecommerce: "Home, Shop, About, Contact, Sign In, Sign Up",
    restaurant: "Home, Menu, About, Contact, Sign In, Sign Up",
    portfolio: "Home, Work, About, Contact, Sign In, Sign Up",
    agency: "Home, Services, About, Contact, Sign In, Sign Up",
    saas: "Home, Features, About, Contact, Sign In, Sign Up",
    event: "Home, Schedule, About, Contact, Sign In, Sign Up",
    nonprofit: "Home, Programs, About, Donate, Contact, Sign In, Sign Up",
    generic: "Home, Features, About, Contact, Sign In, Sign Up",
  };
  return `Type: ${type}
Brand: ${brandName(prompt)}
Audience: people looking for ${prompt || "a polished site"}.
Tone: modern, confident, friendly
Palette: primary ${c.primary}, accent ${c.accent}, bg #ffffff, ink #0f172a
Fonts: Inter, Inter
Hero headline: ${tagline(prompt)}
Hero subhead: A clean, accessible multi-page site shaped around what you described.
Image keyword: ${(prompt || "lifestyle").split(/\s+/).slice(0, 3).join(" ")}
Pages: ${pageMap[type]}
Unique touch: A themed gradient hero with context-aware product photography.`;
}
