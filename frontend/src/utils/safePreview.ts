// ═══════════════════════════════════════════════════════════════════════════
//  safePreview.js — the ONE job of this file: take the raw HTML the AI wrote
//  and make it safe + functional to show inside a sandboxed <iframe>.
//
//  You only ever import ONE thing:  safePreviewHtml(html)
//  It returns a new HTML string with defensive CSS + a small runtime script
//  injected, so that inside the preview: links between the AI's pages work,
//  buttons/forms/cart/mobile-menu respond, and broken images fall back nicely.
//
//  💡 For students: you do NOT need to read the rest of this file. Treat it as
//  a black box — `safePreviewHtml(html)` in, safe HTML out. It's long only
//  because it bundles all the little fixes that make a generated site "feel
//  real" in the preview. The one export used across the app is at the bottom.
// ═══════════════════════════════════════════════════════════════════════════

export const MODAL_CSS = [
  '.__ms-back{position:fixed;inset:0;background:rgba(15,17,21,.7);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:2147483646;animation:__ms-in .2s ease;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,system-ui,sans-serif}',
  ".__ms-card{background:#fff;color:#0f172a;width:min(440px,92vw);border-radius:18px;box-shadow:0 30px 80px -10px rgba(0,0,0,.4);padding:28px;position:relative;animation:__ms-pop .25s cubic-bezier(.2,.9,.4,1.2)}",
  ".__ms-x{position:absolute;top:12px;right:12px;width:32px;height:32px;border-radius:8px;background:transparent;border:0;cursor:pointer;color:#64748b;font-size:22px;line-height:1;display:flex;align-items:center;justify-content:center}",
  ".__ms-x:hover{background:#f1f5f9;color:#0f172a}",
  ".__ms-title{font-size:20px;font-weight:700;letter-spacing:-.02em;margin:0 0 4px}",
  ".__ms-sub{font-size:13px;color:#64748b;margin:0 0 18px}",
  ".__ms-fld{margin-bottom:12px}",
  ".__ms-fld label{display:block;font-size:12px;font-weight:600;color:#334155;margin-bottom:6px}",
  ".__ms-fld input,.__ms-fld textarea,.__ms-fld select{width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:10px;font-size:14px;font-family:inherit;color:#0f172a;background:#fff;outline:none;transition:border-color .15s,box-shadow .15s;box-sizing:border-box}",
  ".__ms-fld input:focus,.__ms-fld textarea:focus,.__ms-fld select:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.15)}",
  ".__ms-fld textarea{min-height:80px;resize:vertical}",
  ".__ms-go{width:100%;padding:11px;border-radius:10px;background:linear-gradient(135deg,#ff5c5c,#ff8a4c);color:#fff;font-weight:600;font-size:14px;border:0;cursor:pointer;margin-top:6px;transition:transform .15s,box-shadow .15s}",
  ".__ms-go:hover{transform:translateY(-1px);box-shadow:0 10px 25px -8px rgba(255,138,76,.5)}",
  ".__ms-ok{text-align:center;padding:14px 0}",
  ".__ms-ok .__ms-tick{width:54px;height:54px;border-radius:50%;background:#dcfce7;color:#16a34a;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:28px}",
  ".__ms-ok h3{font-size:18px;font-weight:700;margin:0 0 4px;color:#0f172a}",
  ".__ms-ok p{font-size:13px;color:#64748b;margin:0 0 16px}",
  ".__ms-foot{font-size:11px;color:#94a3b8;text-align:center;margin-top:10px}",
  '.__ms-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#0f172a;color:#fff;padding:10px 18px;border-radius:999px;font-size:13px;font-weight:500;z-index:2147483647;box-shadow:0 20px 40px -10px rgba(0,0,0,.4);animation:__ms-toast-in .3s ease;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,system-ui,sans-serif}',

  // ── Cart panel (slides in from right) ──
  '.__ms-cart-back{justify-content:flex-end}',
  '.__ms-cart-panel{background:#fff;color:#0f172a;width:min(440px,100vw);height:100vh;display:flex;flex-direction:column;animation:__ms-slide-in .25s cubic-bezier(.2,.9,.4,1)}',
  '.__ms-cart-head{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #e2e8f0}',
  '.__ms-cart-head h2{margin:0;font-size:18px;font-weight:700;letter-spacing:-.02em}',
  '.__ms-cart-body{flex:1;overflow-y:auto;padding:8px 16px}',
  '.__ms-cart-empty{text-align:center;padding:48px 16px;color:#64748b}',
  '.__ms-cart-empty p{margin:8px 0 0;font-size:14px;font-weight:600;color:#0f172a}',
  '.__ms-cart-empty-sub{font-size:12px!important;color:#94a3b8!important;font-weight:400!important;margin-top:4px!important}',
  '.__ms-cart-row{display:grid;grid-template-columns:60px 1fr auto;gap:12px;align-items:center;padding:12px 8px;border-bottom:1px solid #f1f5f9}',
  '.__ms-cart-row img{width:60px;height:60px;border-radius:10px;object-fit:cover;display:block}',
  '.__ms-cart-imgph{width:60px;height:60px;border-radius:10px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;font-size:24px}',
  '.__ms-cart-info{min-width:0}',
  '.__ms-cart-name{font-size:14px;font-weight:600;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.__ms-cart-price{font-size:13px;color:#64748b;margin-top:2px}',
  '.__ms-cart-qty{display:flex;align-items:center;gap:6px}',
  '.__ms-cart-qty button{width:28px;height:28px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;cursor:pointer;font-size:16px;line-height:1;color:#0f172a;display:flex;align-items:center;justify-content:center;padding:0}',
  '.__ms-cart-qty button:hover{background:#f1f5f9}',
  '.__ms-cart-qty span{min-width:18px;text-align:center;font-size:14px;font-weight:600}',
  '.__ms-cart-foot{padding:16px 24px;border-top:1px solid #e2e8f0;background:#fafbfc}',
  '.__ms-cart-total-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;font-size:15px}',
  '.__ms-cart-total{font-weight:700;font-size:18px;color:#0f172a}',
  '.__ms-cart-checkout{width:100%;padding:12px;border-radius:10px;background:linear-gradient(135deg,#ff5c5c,#ff8a4c);color:#fff;font-weight:600;font-size:14px;border:0;cursor:pointer;transition:transform .15s,box-shadow .15s}',
  '.__ms-cart-checkout:hover{transform:translateY(-1px);box-shadow:0 10px 25px -8px rgba(255,138,76,.5)}',

  // ── Floating cart FAB (only shown if AI forgot a header cart icon) ──
  '.__ms-fab{position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#ff5c5c,#ff8a4c);color:#fff;font-size:22px;border:0;cursor:pointer;box-shadow:0 12px 28px -8px rgba(255,92,92,.55);z-index:2147483645;display:flex;align-items:center;justify-content:center;padding:0;font-family:inherit}',
  '.__ms-fab .cart-count{position:absolute;top:-4px;right:-4px;background:#0f172a;color:#fff;font-size:11px;font-weight:700;border-radius:999px;min-width:20px;height:20px;display:flex;align-items:center;justify-content:center;padding:0 5px}',
  '.__ms-pulse{animation:__ms-pulse .35s ease}',

  "@keyframes __ms-in{from{opacity:0}to{opacity:1}}",
  "@keyframes __ms-pop{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}",
  "@keyframes __ms-toast-in{from{opacity:0;transform:translate(-50%,12px)}to{opacity:1;transform:translate(-50%,0)}}",
  "@keyframes __ms-slide-in{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}",
  "@keyframes __ms-pulse{0%{transform:scale(1)}50%{transform:scale(1.4)}100%{transform:scale(1)}}",
].join("\n");

// Defensive CSS injected into every preview so AI-generated pages can't
// blow up the layout — keeps blobs contained, makes header sticky, enforces
// mobile-first stacking, prevents horizontal overflow.
export const FIX_CSS = [
  '<style id="__Creova_fix__">',
  "*,*::before,*::after{box-sizing:border-box}",
  "body{overflow-x:hidden!important;position:relative;margin:0}",
  "h1,h2,h3,h4,p{overflow-wrap:break-word;word-break:break-word;max-width:100%}",
  "img,svg,video,iframe{max-width:100%;height:auto}",
  // Product image baseline (gives every product img a clean square crop even
  // if the AI forgot to add object-fit). Only applies inside .product-card.
  ".product-card img{width:100%;aspect-ratio:1/1;object-fit:cover;display:block}",
  '.blob,[class*="blob"],[class*="gradient-orb"],[class*="bg-blur"]{position:fixed!important;z-index:0!important;opacity:.15!important;pointer-events:none!important;max-width:500px!important;max-height:500px!important}',
  'section,main,.hero,[id="home"],[id="features"],[id="pricing"],[id="testimonials"],[id="faq"],[id="contact"],[id="about"],[id="cta"],[id="how-it-works"],[id="products"],[id="menu"],[id="shop"],[id="portfolio"],article,.container{position:relative;z-index:1}',
  'header,nav,.nav,.navbar,[class*="header"],[class*="navbar"]{position:sticky!important;top:0!important;z-index:50!important;background:rgba(255,255,255,.92)!important;backdrop-filter:blur(12px)!important;-webkit-backdrop-filter:blur(12px)!important}',
  '.hero-card,[class*="hero-card"],[class*="hero-image"],[class*="hero-visual"]{max-width:100%;overflow:hidden}',
  '[class*="grid"]{max-width:100%;overflow:hidden}',
  // Bulletproof card grids: never let columns collapse so narrow that text
  // wraps one letter per line. auto-fit + minmax keeps each card >=240px and
  // wraps to fewer columns instead of squishing. Overrides the AI's brittle
  // "repeat(3,1fr)" which breaks when it lands on the wrong wrapper.
  '.product-grid,[class*="product-grid"],.grid-2,.grid-3,.grid-4,[class*="grid-2"],[class*="grid-3"],[class*="grid-4"]{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))!important;gap:1.5rem!important;align-items:stretch!important}',
  // If a grid landed on the section container by mistake, force its heading,
  // intro AND the card grid to span the full row so the real card grid (with
  // its own auto-fit columns) lays out properly instead of in one narrow cell.
  'section>h1,section>h2,section>h3,section>p,section>.product-grid,section .container>h1,section .container>h2,section .container>h3,section .container>p,section .container>.product-grid{grid-column:1/-1!important}',
  // Price + add-to-cart never break to one-letter-per-line.
  '.price,.add-to-cart,[data-add-to-cart]{white-space:nowrap!important}',
  // Keep section padding sane — some AI output uses huge 6-8rem padding that
  // leaves big empty gaps between components. Hero keeps its own padding.
  'section:not(.hero):not([class*="hero"]):not([id="home"]):not([id="hero"]){padding-top:clamp(2.5rem,5vw,4rem)!important;padding-bottom:clamp(2.5rem,5vw,4rem)!important}',
  // A 2-column .hero is meant for the HOME hero (a .hero-content + a visual).
  // When the AI reuses .hero for a simple centred page header, its direct
  // heading/eyebrow/text children become flex items squished into a narrow
  // column ("Get In Touc h"). Let the container wrap and force those direct
  // text children to a full row so they stack (the home hero's .hero-content /
  // .hero-visual divs are unaffected).
  '.hero>.container,.hero-content,.hero .container{flex-wrap:wrap}',
  '.hero>.container>h1,.hero>.container>h2,.hero>.container>h3,.hero>.container>p,.hero>.container>span,.hero>.container>.eyebrow,.hero>.container>.btn,.hero>.container>.ctas,.hero>.container>a{flex-basis:100%!important;max-width:100%!important}',
  // CTA-band button must stay readable (white pill + brand-colour text), never
  // white text on white. (Scoped to the coloured CTA band, not hero CTAs.)
  '.cta-band .btn,.cta-band a.btn,.cta-band button,.cta-section .btn,.cta-section a.btn{background:#fff!important;color:var(--primary,#1d4ed8)!important;border-color:#fff!important}',
  // ── Form fields: the AI very often leaves inputs/buttons browser-default
  // (square grey boxes). Give EVERY form a clean polished baseline. ──
  'form input:not([type=checkbox]):not([type=radio]):not([type=submit]):not([type=button]),form textarea,form select{display:block!important;width:100%!important;box-sizing:border-box!important;padding:.7rem .9rem!important;margin-top:.35rem!important;border:1px solid rgba(15,23,42,.16)!important;border-radius:.6rem!important;background:#fff!important;color:#0f172a!important;font-size:.95rem!important;font-family:inherit!important;line-height:1.4!important}',
  'form input::placeholder,form textarea::placeholder{color:#94a3b8!important}',
  'form input:focus,form textarea:focus,form select:focus{outline:none!important;border-color:var(--primary,#6366f1)!important;box-shadow:0 0 0 3px rgba(99,102,241,.18)!important}',
  'form textarea{min-height:120px!important;resize:vertical!important}',
  'form label{display:block!important;margin-top:.9rem!important;margin-bottom:.1rem!important;font-size:.85rem!important;font-weight:600!important;color:#334155!important}',
  'form button,form [type=submit]{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:.4rem!important;margin-top:1.1rem!important;padding:.75rem 1.4rem!important;border:0!important;border-radius:.6rem!important;background:linear-gradient(135deg,var(--primary,#1d4ed8),var(--accent,#6366f1))!important;color:#fff!important;font-weight:600!important;font-size:.95rem!important;cursor:pointer!important;width:auto!important}',
  // Generic buttons that the AI left chrome-default get a sane baseline (no bg
  // override so styled buttons keep their look).
  'button:not(.cart-icon):not(.__ms-hamburger):not(.__ms-x):not(.__ms-cart-checkout):not(.__ms-go){cursor:pointer;border-radius:.5rem;font-family:inherit}',
  // Kill default link blue/underline so footer/secondary links look intentional.
  'a{text-decoration:none}',
  // Auth cards: tighter margin + a sensible heading size (the AI often uses a
  // huge clamp(2rem,5vw,3.5rem) which wraps "Create Your account" one word per
  // line) + don't let the auth section stretch to a tall min-height.
  '.auth-card,[class*="auth-card"]{margin:1.5rem auto!important}',
  '.auth-card h1,.auth-card h2,[class*="auth-card"] h1,[class*="auth-card"] h2{font-size:clamp(1.4rem,3.5vw,2rem)!important;line-height:1.2!important}',
  '[id="signin"],[id="signup"],[id="login"],[data-page="signin"],[data-page="signup"]{min-height:auto!important}',
  // Primary CTAs use a single-hue gradient (primary -> darker primary) so a
  // clashing primary+accent palette can never produce an ugly two-colour
  // button (e.g. red -> teal).
  '.add-to-cart,[data-add-to-cart],form button[type="submit"],.btn-primary,[class*="btn-primary"]{background:linear-gradient(135deg,var(--primary,#1d4ed8),color-mix(in srgb,var(--primary,#1d4ed8) 72%,#000))!important;color:#fff!important}',
  // ── Hamburger button (only ever visible at ≤768px) ──
  ".__ms-hamburger{display:none;background:transparent;border:0;cursor:pointer;padding:8px;color:currentColor;border-radius:8px;align-items:center;justify-content:center;transition:background .15s}",
  ".__ms-hamburger:hover{background:rgba(0,0,0,.06)}",
  ".__ms-hamburger.__ms-hb-active{background:rgba(0,0,0,.08)}",
  // The cloned auth section is ALWAYS hidden by default. It only shows inside
  // the open mobile menu (at ≤768px, after the user taps the hamburger).
  // Without this rule the clones would render alongside the real nav links on
  // desktop, causing duplicate Sign In / Sign Up buttons.
  ".__ms-auth-mobile{display:none!important}",
  // ── TABLET (≤768px) ──
  "@media(max-width:768px){",
  ".container,[class*=container]{padding-left:1rem!important;padding-right:1rem!important}",
  // Show hamburger inline with the rest of the header row.
  ".__ms-hamburger{display:inline-flex!important;margin-left:auto!important;order:99!important}",
  // Hide the AI's standalone auth buttons in the header — we move them into
  // the dropdown menu so the mobile header is just Logo + Hamburger.
  // Hide BOTH the link itself AND its direct wrapper (whichever the AI used).
  ".__ms-auth-original,.__ms-auth-original-wrap{display:none!important}",
  // Hide the nav by default (it becomes an overlay when opened).
  "nav.__ms-nav-collapsible,.__ms-nav-collapsible{display:none!important}",
  // Cloned auth section inside the dropdown gets its own visual block.
  ".__ms-nav-open .__ms-auth-mobile{display:flex!important;flex-direction:column!important;gap:.4rem!important;width:100%!important;padding-top:.5rem!important;margin-top:.5rem!important;border-top:1px solid rgba(0,0,0,.08)!important}",
  ".__ms-auth-clone{display:block!important;width:100%!important;padding:.75rem 1rem!important;font-size:.95rem!important;text-align:center!important;border-radius:8px!important;color:#0f172a!important;border:1px solid rgba(0,0,0,.12)!important;text-decoration:none!important}",
  ".__ms-auth-clone.__ms-auth-primary{background:var(--primary,#1d4ed8)!important;color:#fff!important;border-color:var(--primary,#1d4ed8)!important;font-weight:600!important}",
  // When open, nav becomes an overlay dropdown anchored to the header.
  "nav.__ms-nav-collapsible.__ms-nav-open,.__ms-nav-collapsible.__ms-nav-open{display:flex!important;flex-direction:column!important;align-items:stretch!important;position:absolute!important;top:100%!important;left:0!important;right:0!important;width:100%!important;max-width:100%!important;background:#fff!important;color:#0f172a!important;padding:.5rem!important;gap:.15rem!important;box-shadow:0 18px 40px -8px rgba(0,0,0,.18)!important;border-top:1px solid rgba(0,0,0,.06)!important;z-index:60!important;max-height:calc(100vh - 60px)!important;overflow-y:auto!important}",
  ".__ms-nav-collapsible.__ms-nav-open a{display:block!important;width:100%!important;padding:.75rem 1rem!important;font-size:1rem!important;text-align:left!important;border-radius:8px!important;color:#0f172a!important;white-space:normal!important;line-height:1.3!important}",
  ".__ms-nav-collapsible.__ms-nav-open a:hover{background:rgba(0,0,0,.04)!important}",
  '.hero,[class*="hero-grid"],[id="home"]>div,[id="home"]>.container>div{display:flex!important;flex-direction:column!important;gap:1.5rem!important}',
  '.hero-card,[class*="hero-card"],[class*="hero-image"],[class*="hero-visual"]{max-width:100%!important;margin:0 auto!important;width:100%!important}',
  '[class*="grid-3"],[class*="grid-4"],.grid-3,.grid-4,[class*="grid-2"],.grid-2{grid-template-columns:1fr 1fr!important;gap:1rem!important}',
  ".product-grid,[class*=product-grid]{grid-template-columns:1fr 1fr!important;gap:1rem!important}",
  "h1{font-size:clamp(1.6rem,5vw,2.4rem)!important;line-height:1.15!important}",
  "h2{font-size:clamp(1.3rem,4vw,1.9rem)!important;line-height:1.2!important}",
  "h3{font-size:1rem!important}",
  "p,.lead{font-size:.95rem!important}",
  "section{padding:2.5rem 0!important}",
  ".auth-card,[class*=auth-card]{max-width:100%!important;margin:2rem 1rem!important;padding:1.5rem!important}",
  "}",
  // ── PHONE (≤480px) — single column everything, no overflow ──
  "@media(max-width:480px){",
  ".container,[class*=container]{padding-left:.85rem!important;padding-right:.85rem!important}",
  // Header stays one-row at phone size — hamburger handles the nav links.
  "header>div,header>nav,.nav>.inner,[class*=header]>div{gap:.5rem!important;padding:.6rem 1rem!important;min-height:56px!important}",
  // Auth buttons (Sign In/Sign Up) shrink so they fit alongside the hamburger.
  "header .auth,[class*=auth-buttons],[class*=header-auth]{gap:.3rem!important}",
  "header .auth a,[class*=auth-buttons] a{padding:.4rem .65rem!important;font-size:.78rem!important}",
  ".logo{font-size:.95rem!important}",
  ".cart-icon{padding:6px!important;font-size:18px!important}",
  ".cart-count{font-size:10px!important;min-width:16px!important;height:16px!important}",
  // Hero
  '.hero,[class*="hero-grid"]{gap:1rem!important;padding-top:1.5rem!important}',
  "h1{font-size:clamp(1.4rem,7vw,1.9rem)!important}",
  "h2{font-size:clamp(1.15rem,5vw,1.5rem)!important}",
  // ALL grids → 1 column
  '[class*="grid-3"],[class*="grid-4"],.grid-3,.grid-4,[class*="grid-2"],.grid-2,.product-grid,[class*="product-grid"]{grid-template-columns:1fr!important;gap:1rem!important}',
  // CTAs stack full-width, touch-friendly
  ".btn-primary,.btn-ghost,button[type=submit],.ctas a,.ctas button{min-height:44px!important;padding:.75rem 1.25rem!important;font-size:.9rem!important}",
  ".ctas{flex-direction:column!important;gap:.6rem!important;width:100%!important}",
  ".ctas>*{width:100%!important;text-align:center!important}",
  // Cards
  ".product-card,.card,article{padding:1rem!important}",
  // Auth pages
  ".auth-card,[class*=auth-card]{max-width:100%!important;margin:1.5rem .5rem!important;padding:1.5rem!important}",
  // Footer stacks single column
  "footer,[class*=footer]{text-align:center!important;padding:2rem 0 1.5rem!important}",
  "footer .foot-grid,footer [class*=foot-grid],footer .columns{grid-template-columns:1fr!important;gap:1.5rem!important}",
  "footer .brand-block,footer [class*=brand-block]{margin:0 auto!important;max-width:280px!important}",
  "section{padding:2rem 0!important}",
  "body>*{max-width:100vw!important}",
  "}",
  'footer,[class*="footer"]{position:relative!important;z-index:1}',
  "</style>",
].join("\n");

// Cart logic injected into the preview iframe so generated e-commerce sites
// have a real working cart (add / remove / qty / total / checkout) even
// though they're static HTML.
//
// AI is instructed to emit:
//   <button class="add-to-cart" data-name="..." data-price="29.99" data-image="...">
// and a header button <button class="cart-icon">🛒 <span class="cart-count">0</span></button>
//
// This module returns the JS string (no <script> wrapper) so previewScript.js
// can splice it into the main IIFE.

export function buildCartScript() {
  const L = [];
  L.push("var __ms_cart=[];");

  L.push("function __ms_money(n){return '$'+(Math.round(n*100)/100).toFixed(2)}");

  // A site is a "shop site" ONLY when the AI emitted real product buttons
  // (.add-to-cart) or an explicit cart icon. data-page='shop' alone isn't
  // enough — portfolios also use it for their Work page (no products there).
  // Non-shop sites (saas, portfolio, agency, generic) get NO cart UI — no
  // floating FAB, no badge updates.
  L.push("function __ms_isShopSite(){");
  L.push("  if(document.querySelector('.add-to-cart,[data-add-to-cart]'))return true;");
  L.push("  if(document.querySelector('.cart-icon,.cart-btn,.cart-button,.cart-toggle,[data-cart-icon]'))return true;");
  L.push("  return false;");
  L.push("}");

  L.push("function __ms_updateBadge(){");
  L.push("  var count=__ms_cart.reduce(function(s,i){return s+i.qty},0);");
  L.push("  var badges=document.querySelectorAll('.cart-count,.cart-badge,.cart-quantity,[data-cart-count]');");
  L.push("  badges.forEach(function(b){b.textContent=String(count)});");
  // Only auto-mount the floating cart when this is actually a shop site OR
  // the user has items in their cart (the latter is the safety net).
  L.push("  if(badges.length===0&&(count>0||__ms_isShopSite())){__ms_ensureFloatingCart(count)}");
  L.push("}");

  // If the AI forgot to render a cart icon on a shop site, drop a floating one in.
  L.push("function __ms_ensureFloatingCart(count){");
  L.push("  var fab=document.getElementById('__ms_cart_fab');");
  L.push("  if(!fab){");
  L.push("    fab=document.createElement('button');");
  L.push("    fab.id='__ms_cart_fab';");
  L.push("    fab.className='__ms-fab';");
  L.push("    fab.innerHTML='🛒 <span class=\"cart-count\" data-cart-count>0</span>';");
  L.push("    fab.addEventListener('click',function(e){e.preventDefault();__ms_openCart()});");
  L.push("    document.body.appendChild(fab);");
  L.push("  }");
  L.push("  fab.querySelector('.cart-count').textContent=String(count);");
  L.push("}");

  L.push("function __ms_addToCart(btn){");
  L.push("  var name=btn.getAttribute('data-name')||'Item';");
  L.push("  var price=parseFloat(btn.getAttribute('data-price')||'0')||0;");
  L.push("  var image=btn.getAttribute('data-image')||'';");
  L.push("  if(!image){");
  L.push("    var card=btn.closest('article,.product-card,.card,li,div');");
  L.push("    var img=card&&card.querySelector('img');");
  L.push("    if(img)image=img.getAttribute('src')||'';");
  L.push("  }");
  L.push("  var key=name.toLowerCase();");
  L.push("  var existing=null;");
  L.push("  for(var i=0;i<__ms_cart.length;i++){if(__ms_cart[i].key===key){existing=__ms_cart[i];break}}");
  L.push("  if(existing){existing.qty+=1}");
  L.push("  else{__ms_cart.push({key:key,name:name,price:price,image:image,qty:1})}");
  L.push("  __ms_updateBadge();");
  L.push("  __ms_toast('Added: '+name);");
  L.push("  __ms_pulseBadge();");
  L.push("}");

  L.push("function __ms_pulseBadge(){");
  L.push("  var b=document.querySelector('.cart-count,.cart-badge,.cart-quantity,[data-cart-count]');");
  L.push("  if(!b)return;");
  L.push("  b.classList.remove('__ms-pulse');");
  L.push("  void b.offsetWidth;");
  L.push("  b.classList.add('__ms-pulse');");
  L.push("}");

  L.push("function __ms_changeQty(key,delta){");
  L.push("  for(var i=0;i<__ms_cart.length;i++){");
  L.push("    if(__ms_cart[i].key===key){");
  L.push("      __ms_cart[i].qty+=delta;");
  L.push("      if(__ms_cart[i].qty<=0)__ms_cart.splice(i,1);");
  L.push("      break;");
  L.push("    }");
  L.push("  }");
  L.push("  __ms_updateBadge();");
  L.push("  __ms_renderCart();");
  L.push("}");

  L.push("function __ms_total(){return __ms_cart.reduce(function(s,i){return s+i.price*i.qty},0)}");

  L.push("function __ms_renderCart(){");
  L.push("  var body=document.querySelector('.__ms-cart-body');");
  L.push("  if(!body)return;");
  L.push("  if(__ms_cart.length===0){");
  L.push("    body.innerHTML='<div class=\"__ms-cart-empty\"><div style=\"font-size:42px\">🛒</div><p>Your cart is empty</p><p class=\"__ms-cart-empty-sub\">Add some products to get started.</p></div>';");
  L.push("    var ft=document.querySelector('.__ms-cart-foot');if(ft)ft.style.display='none';");
  L.push("    return;");
  L.push("  }");
  L.push("  var rows=__ms_cart.map(function(it){");
  L.push("    var img=it.image?'<img src=\"'+it.image+'\" alt=\"\" onerror=\"this.style.display=\\'none\\'\">':'<div class=\"__ms-cart-imgph\">🛍️</div>';");
  L.push("    return '<div class=\"__ms-cart-row\">'+img+");
  L.push("      '<div class=\"__ms-cart-info\"><div class=\"__ms-cart-name\">'+it.name+'</div>'+");
  L.push("      '<div class=\"__ms-cart-price\">'+__ms_money(it.price)+'</div></div>'+");
  L.push("      '<div class=\"__ms-cart-qty\">'+");
  L.push("      '<button data-qty-minus=\"'+it.key+'\" aria-label=\"Decrease\">−</button>'+");
  L.push("      '<span>'+it.qty+'</span>'+");
  L.push("      '<button data-qty-plus=\"'+it.key+'\" aria-label=\"Increase\">+</button>'+");
  L.push("      '</div>'+");
  L.push("    '</div>';");
  L.push("  }).join('');");
  L.push("  body.innerHTML=rows;");
  L.push("  var ft=document.querySelector('.__ms-cart-foot');if(ft)ft.style.display='';");
  L.push("  var tot=document.querySelector('.__ms-cart-total');if(tot)tot.textContent=__ms_money(__ms_total());");
  L.push("}");

  L.push("function __ms_openCart(){");
  L.push("  if(document.querySelector('.__ms-cart-back'))return;");
  L.push("  var back=document.createElement('div');");
  L.push("  back.className='__ms-cart-back __ms-back';");
  L.push("  back.innerHTML='<div class=\"__ms-cart-panel\" role=\"dialog\" aria-modal=\"true\">'+");
  L.push("    '<div class=\"__ms-cart-head\"><h2>Your cart</h2>'+");
  L.push("    '<button class=\"__ms-x\" aria-label=\"Close\">&times;</button></div>'+");
  L.push("    '<div class=\"__ms-cart-body\"></div>'+");
  L.push("    '<div class=\"__ms-cart-foot\"><div class=\"__ms-cart-total-row\"><span>Total</span><span class=\"__ms-cart-total\">$0.00</span></div>'+");
  L.push("    '<button class=\"__ms-cart-checkout\">Checkout</button></div>'+");
  L.push("  '</div>';");
  L.push("  document.body.appendChild(back);");
  L.push("  back.addEventListener('click',function(e){if(e.target===back)__ms_closeCart()});");
  L.push("  back.querySelector('.__ms-x').addEventListener('click',__ms_closeCart);");
  L.push("  back.querySelector('.__ms-cart-checkout').addEventListener('click',function(){");
  L.push("    if(__ms_cart.length===0){__ms_toast('Cart is empty');return}");
  L.push("    var n=__ms_cart.reduce(function(s,i){return s+i.qty},0);");
  L.push("    var t=__ms_money(__ms_total());");
  L.push("    back.querySelector('.__ms-cart-panel').innerHTML='<div class=\"__ms-ok\"><div class=\"__ms-tick\">✓</div><h3>Order placed!</h3><p>'+n+' item'+(n===1?'':'s')+' · '+t+' — this is a demo confirmation.</p></div>';");
  L.push("    __ms_cart=[];__ms_updateBadge();");
  L.push("    setTimeout(__ms_closeCart,2200);");
  L.push("  });");
  L.push("  back.addEventListener('click',function(e){");
  L.push("    var minus=e.target.getAttribute&&e.target.getAttribute('data-qty-minus');");
  L.push("    var plus=e.target.getAttribute&&e.target.getAttribute('data-qty-plus');");
  L.push("    if(minus){__ms_changeQty(minus,-1)}else if(plus){__ms_changeQty(plus,1)}");
  L.push("  });");
  L.push("  __ms_renderCart();");
  L.push("}");

  L.push("function __ms_closeCart(){var b=document.querySelector('.__ms-cart-back');if(b)b.remove()}");

  // Wire cart-icon clicks
  L.push("document.addEventListener('click',function(e){");
  L.push("  var icon=e.target.closest&&e.target.closest('.cart-icon,.cart-btn,.cart-button,.cart-toggle,.cart-link,[data-cart-icon],[data-cart-toggle],a[href=\"#cart\"],[aria-label*=\"cart\" i]');");
  // Never treat an Add-to-Cart product button as the cart toggle.
  L.push("  if(icon&&(icon.classList.contains('add-to-cart')||(icon.closest&&icon.closest('.add-to-cart,[data-add-to-cart]'))))icon=null;");
  // stopImmediatePropagation so the generic click handler below can't also fire
  // its \"Coming soon\" fallback for a cart button the AI named differently.
  L.push("  if(icon){e.preventDefault();e.stopImmediatePropagation();__ms_openCart()}");
  L.push("},true);");

  // Initial badge sync once DOM ready
  L.push("if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',__ms_updateBadge);else __ms_updateBadge();");

  return L.join("\n");
}

// Returns true if the click was a cart action — handled by this module.
// Used by previewScript.js to short-circuit before opening the order modal.
export const ADD_TO_CART_HANDLER = [
  "var atc=e.target.closest&&e.target.closest('.add-to-cart,[data-add-to-cart]');",
  "if(atc){e.preventDefault();e.stopPropagation();__ms_addToCart(atc);return}",
].join("");

// Multi-page router injected into the preview iframe.
//
// When the AI emits the new structure:
//   <header>...nav...</header>
//   <main data-page="home">...</main>
//   <main data-page="shop">...</main>
//   <main data-page="about">...</main>
//   <footer>...</footer>
//
// this script hides all <main> blocks except the active one and rewires the
// nav so clicking "Shop" SWAPS the visible page (not just scroll). Header,
// footer, cart icon, and cart state persist across pages.
//
// Backwards-compatible: if the document has fewer than 2 [data-page] blocks,
// router stays dormant and the existing scroll-to-section behaviour wins.

export function buildRouterScript() {
  const L = [];
  L.push("var __ms_routerActive=false;");
  L.push("var __ms_pages=[];");
  L.push("var __ms_currentPage='home';");

  L.push("function __ms_initRouter(){");
  L.push("  var nodes=document.querySelectorAll('[data-page]');");
  L.push("  if(nodes.length<2){__ms_routerActive=false;return false}");
  L.push("  __ms_routerActive=true;");
  L.push("  __ms_pages=[];");
  L.push("  for(var i=0;i<nodes.length;i++){");
  L.push("    var name=(nodes[i].getAttribute('data-page')||'').toLowerCase().trim();");
  L.push("    if(!name)continue;");
  L.push("    __ms_pages.push(name);");
  L.push("    nodes[i].setAttribute('data-page',name);");
  L.push("  }");
  L.push("  var initial=location.hash.replace('#','').toLowerCase();");
  L.push("  if(__ms_pages.indexOf(initial)===-1)initial=__ms_pages.indexOf('home')!==-1?'home':__ms_pages[0];");
  L.push("  __ms_showPage(initial,true);");
  L.push("  return true;");
  L.push("}");

  L.push("function __ms_resolvePage(target){");
  L.push("  if(!target)return null;");
  L.push("  target=String(target).toLowerCase().replace(/^#/,'').replace(/^https?:\\/\\/[^/]+/,'').replace(/^\\/+|\\/+$/g,'').replace(/[?#].*$/,'').replace(/\\.[a-z]+$/,'');");
  L.push("  if(__ms_pages.indexOf(target)!==-1)return target;");
  L.push("  // alias map for natural-language nav text → page id");
  L.push("  var aliases={products:['shop','catalog','store'],shop:['products','catalog','store'],menu:['shop','products'],work:['portfolio','projects','case-studies'],portfolio:['work','projects'],services:['features','offerings'],features:['services','offerings'],plans:['pricing','membership'],pricing:['plans','membership'],reach:['contact'],getintouch:['contact'],reservations:['reservation','book','booking'],reservation:['reservations','book','booking']};");
  L.push("  var alts=aliases[target]||[];");
  L.push("  for(var i=0;i<alts.length;i++)if(__ms_pages.indexOf(alts[i])!==-1)return alts[i];");
  L.push("  for(var j=0;j<__ms_pages.length;j++){if(__ms_pages[j].indexOf(target)!==-1||target.indexOf(__ms_pages[j])!==-1)return __ms_pages[j]}");
  L.push("  return null;");
  L.push("}");

  L.push("function __ms_showPage(name,silent){");
  L.push("  var nodes=document.querySelectorAll('[data-page]');");
  L.push("  var found=false;");
  L.push("  for(var i=0;i<nodes.length;i++){");
  L.push("    if(nodes[i].getAttribute('data-page')===name){");
  L.push("      nodes[i].hidden=false;");
  L.push("      nodes[i].style.display='';");
  L.push("      found=true;");
  L.push("    }else{");
  L.push("      nodes[i].hidden=true;");
  L.push("    }");
  L.push("  }");
  L.push("  if(!found)return false;");
  L.push("  __ms_currentPage=name;");
  L.push("  // Mark active nav link");
  L.push("  var links=document.querySelectorAll('header a[href], nav a[href]');");
  L.push("  for(var j=0;j<links.length;j++){");
  L.push("    var h=(links[j].getAttribute('href')||'').replace(/^#/,'').toLowerCase();");
  L.push("    var resolved=__ms_resolvePage(h);");
  L.push("    if(resolved===name){links[j].setAttribute('aria-current','page');links[j].classList.add('__ms-active-nav');links[j].classList.add('active')}");
  L.push("    else{links[j].removeAttribute('aria-current');links[j].classList.remove('__ms-active-nav');links[j].classList.remove('active')}");
  L.push("  }");
  L.push("  if(!silent){");
  L.push("    try{history.replaceState(null,'','#'+name)}catch(_){}");
  L.push("    window.scrollTo({top:0,behavior:'smooth'});");
  L.push("  }");
  L.push("  return true;");
  L.push("}");

  L.push("function __ms_routerHandleLink(href){");
  L.push("  if(!__ms_routerActive)return false;");
  L.push("  var resolved=__ms_resolvePage(href);");
  L.push("  if(!resolved)return false;");
  L.push("  __ms_showPage(resolved,false);");
  L.push("  return true;");
  L.push("}");

  // Inject minimal CSS for active nav state + page transition
  // Active-nav: bold + a coloured underline only. We deliberately DON'T force a
  // text colour — the AI's own .active style (often a filled pill with white
  // text) would otherwise clash and render green-on-green invisible text.
  L.push("(function(){var s=document.createElement('style');s.textContent='.__ms-active-nav{font-weight:700;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:5px;text-decoration-color:var(--primary,#ff5c5c)}[data-page]{animation:__ms_pageIn .3s ease}@keyframes __ms_pageIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}';document.head.appendChild(s)})();");

  L.push("if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',__ms_initRouter);else __ms_initRouter();");

  return L.join("\n");
}

// Snippet spliced into previewScript.js's main click handler. Returns true
// (handled) when the click was a nav link that mapped to a router page.
export const ROUTER_LINK_HANDLER = [
  "if(__ms_routerActive&&found.kind==='a'){",
  "  var __h=(el.getAttribute('href')||'').trim();",
  "  if(__h&&__h!=='#'&&__h.indexOf('javascript:')!==0){",
  "    if(__ms_routerHandleLink(__h)){e.preventDefault();return}",
  "  }",
  "}",
].join("");

// Hamburger-menu injection for the preview iframe.
//
// At ≤768px the AI's nav links almost never fit. Without this they wrap
// mid-word (tablet) or stack onto their own rows (phone) and consume 70% of
// the viewport before any real content shows.
//
// This script gives every generated site a clean Logo + Hamburger header at
// small widths. Clicking the hamburger drops down a single overlay menu that
// contains BOTH the nav links AND any header auth buttons (Sign In / Sign Up).
//
// Pushed line-by-line so the JS reaches the iframe verbatim.

export function buildHamburgerScript() {
  const L = [];

  // Walk up from a node until we hit an ancestor whose computed display is
  // flex or inline-flex (or until we hit <header>). That's where we want
  // to drop the hamburger so it sits inline with the logo/nav.
  L.push("function __ms_findFlexParent(el,fallback){");
  L.push("  var n=el&&el.parentNode;");
  L.push("  while(n&&n!==document.body){");
  L.push("    var d=window.getComputedStyle(n).display;");
  L.push("    if(d==='flex'||d==='inline-flex')return n;");
  L.push("    if(n===fallback)return fallback;");
  L.push("    n=n.parentNode;");
  L.push("  }");
  L.push("  return fallback;");
  L.push("}");

  L.push("function __ms_hb_init(){");
  L.push("  var header=document.querySelector('header,.nav,.navbar,[class*=site-header]');");
  L.push("  if(!header)return;");
  L.push("  if(header.querySelector('.__ms-hamburger'))return;"); // already added
  L.push("  var nav=header.querySelector('nav,.links,[class*=nav-links],[class*=menu-links]');");
  L.push("  if(!nav)return;");
  L.push("  var links=nav.querySelectorAll('a');");
  L.push("  if(links.length<2)return;"); // single link → no menu needed

  // Tag the nav so CSS can find it for hide/show at small widths.
  L.push("  nav.classList.add('__ms-nav-collapsible');");

  // Make sure the header has a non-static position so the overlay can anchor.
  L.push("  var hcs=window.getComputedStyle(header);");
  L.push("  if(hcs.position==='static')header.style.position='relative';");

  // Find auth buttons (Sign In / Sign Up / Login / Register) in the header.
  // We DON'T rely on a specific class name (AI markup varies); instead we
  // scan every <a>/<button> in the header and match by visible text.
  L.push("  var AUTH_RE=/^\\s*(sign[\\s-]*in|sign[\\s-]*up|log[\\s-]*in|log[\\s-]*out|register|create\\s+account|get\\s+started\\s+free|join\\s+now|account)\\s*$/i;");
  L.push("  var SIGNUP_RE=/sign[\\s-]*up|register|create\\s+account|join\\s+now/i;");
  L.push("  var authNodes=[];");
  L.push("  var candidates=header.querySelectorAll('a,button');");
  L.push("  for(var ci=0;ci<candidates.length;ci++){");
  L.push("    var c=candidates[ci];");
  L.push("    if(c.classList.contains('__ms-hamburger'))continue;");
  L.push("    if(c.closest&&c.closest('.__ms-auth-mobile'))continue;");
  L.push("    var txt=(c.textContent||'').trim();");
  L.push("    if(AUTH_RE.test(txt))authNodes.push(c);");
  L.push("  }");
  // Tag each auth node + its direct wrapper so CSS can hide them on mobile.
  L.push("  authNodes.forEach(function(n){");
  L.push("    n.classList.add('__ms-auth-original');");
  L.push("    if(n.parentNode&&n.parentNode!==header)n.parentNode.classList.add('__ms-auth-original-wrap');");
  L.push("  });");
  L.push("  if(authNodes.length>0){");
  L.push("    var section=document.createElement('div');");
  L.push("    section.className='__ms-auth-mobile';");
  L.push("    authNodes.forEach(function(n){");
  L.push("      var clone=n.cloneNode(true);");
  L.push("      clone.classList.remove('__ms-auth-original');");
  L.push("      clone.classList.add('__ms-auth-clone');");
  L.push("      var t=(n.textContent||'');");
  L.push("      if(n.classList.contains('primary')||SIGNUP_RE.test(t))clone.classList.add('__ms-auth-primary');");
  L.push("      section.appendChild(clone);");
  L.push("    });");
  L.push("    nav.appendChild(section);");
  L.push("  }");

  // Build the hamburger button.
  L.push("  var btn=document.createElement('button');");
  L.push("  btn.type='button';");
  L.push("  btn.className='__ms-hamburger';");
  L.push("  btn.setAttribute('aria-label','Toggle menu');");
  L.push("  btn.setAttribute('aria-expanded','false');");
  L.push("  btn.innerHTML='<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\"><path d=\"M3 6h18\"></path><path d=\"M3 12h18\"></path><path d=\"M3 18h18\"></path></svg>';");

  // Drop the button into the same flex container that owns the nav — so it
  // sits inline with logo/nav/auth (not on its own row below the header).
  L.push("  var anchor=__ms_findFlexParent(nav,header);");
  L.push("  anchor.appendChild(btn);");

  // Toggle on click.
  L.push("  btn.addEventListener('click',function(e){");
  L.push("    e.preventDefault();e.stopPropagation();");
  L.push("    var open=nav.classList.toggle('__ms-nav-open');");
  L.push("    btn.classList.toggle('__ms-hb-active',open);");
  L.push("    btn.setAttribute('aria-expanded',String(open));");
  L.push("  });");

  // Close on link click. requestAnimationFrame so the link's own handler
  // (router / scroll) fires first.
  L.push("  function closeMenu(){nav.classList.remove('__ms-nav-open');btn.classList.remove('__ms-hb-active');btn.setAttribute('aria-expanded','false');}");
  L.push("  nav.addEventListener('click',function(e){");
  L.push("    if(e.target.closest('a,button'))requestAnimationFrame(closeMenu);");
  L.push("  });");

  // Close on outside click + Escape.
  L.push("  document.addEventListener('click',function(e){if(!header.contains(e.target))closeMenu();});");
  L.push("  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu();});");

  L.push("}");

  // Init on DOM ready.
  L.push("if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',__ms_hb_init);else __ms_hb_init();");

  return L.join("\n");
}


// Build the injected <script>+<style> string for the preview iframe.
// Pushed line-by-line so every \s and \" reaches the iframe verbatim.
export function buildPreviewScript(marker: string): string {
  const L = [];
  L.push("<style>" + MODAL_CSS + "<" + "/style>");
  L.push('<script id="' + marker + '">');
  L.push("(function(){if(window.__CreovaSafePreview)return;window.__CreovaSafePreview=true;");

  // ── inject multi-page router first (no-ops if site is single-page) ──
  L.push(buildRouterScript());

  // ── inject hamburger menu at ≤768px (always runs, CSS does the rest) ──
  L.push(buildHamburgerScript());

  // ── helpers ──
  L.push('function findClickable(t){while(t&&t!==document&&t!==document.body){var tag=t.tagName;if(tag==="A")return{kind:"a",el:t};if(tag==="BUTTON")return{kind:"button",el:t};if(t.getAttribute&&t.getAttribute("role")==="button")return{kind:"button",el:t};t=t.parentNode}return null}');
  L.push('function pathToAnchor(href){var clean=href.replace(/^https?:\\/\\/[^/]+/,"").replace(/[?#].*$/,"").replace(/^\\/+|\\/+$/g,"").replace(/\\.[a-z]+$/i,"");if(!clean)return"";if(clean.indexOf("/")!==-1)clean=clean.split("/").pop();return clean.toLowerCase().replace(/[^a-z0-9\\-_]/g,"-")}');

  // Aggressive scrollToId (used by single-page sites): exact id → substring → alias → heading text.
  L.push('function scrollToId(id){');
  L.push('  if(!id){window.scrollTo({top:0,behavior:"smooth"});return true}');
  L.push('  id=String(id).toLowerCase();');
  L.push('  var el=document.getElementById(id);');
  L.push('  if(el){el.scrollIntoView({behavior:"smooth",block:"start"});return true}');
  L.push('  var all=document.querySelectorAll("[id]");');
  L.push('  for(var i=0;i<all.length;i++){var aid=all[i].id.toLowerCase();if(aid===id||aid.indexOf(id)!==-1||id.indexOf(aid)!==-1){all[i].scrollIntoView({behavior:"smooth",block:"start"});return true}}');
  L.push('  var aliases={shop:["products","menu","store","catalog"],products:["shop","menu","store"],menu:["products","shop"],services:["features","what-we-do"],features:["services","benefits"],plans:["pricing","membership"],pricing:["plans","membership"],work:["projects","portfolio","case-studies"],projects:["work","portfolio"],team:["about","people"],story:["about"],reviews:["testimonials"],testimonials:["reviews"],questions:["faq"],faq:["questions"],reach:["contact"]};');
  L.push('  var alts=aliases[id]||[];');
  L.push('  for(var j=0;j<alts.length;j++){var hit=document.getElementById(alts[j]);if(hit){hit.scrollIntoView({behavior:"smooth",block:"start"});return true}}');
  L.push('  var heads=document.querySelectorAll("h1,h2,h3,section,nav");');
  L.push('  for(var k=0;k<heads.length;k++){var txt=(heads[k].innerText||"").toLowerCase();if(txt&&txt.indexOf(id.replace(/-/g," "))!==-1){heads[k].scrollIntoView({behavior:"smooth",block:"start"});return true}}');
  L.push('  return false;');
  L.push('}');

  L.push('function nextSection(fromEl){var sections=document.querySelectorAll("section");var from=fromEl.getBoundingClientRect().top+window.scrollY;var best=null,bestD=Infinity;for(var i=0;i<sections.length;i++){var d=sections[i].getBoundingClientRect().top+window.scrollY-from;if(d>50&&d<bestD){bestD=d;best=sections[i]}}return best}');

  // ── categorize button text → action ──
  L.push('function categorize(text){var t=(text||"").toLowerCase().trim();if(!t)return null;');
  L.push('if(/order|checkout|buy\\s*now/.test(t))return"order";');
  L.push('if(/book|reserve|appointment|schedule|reservation/.test(t))return"book";');
  L.push('if(/sign\\s*in|log\\s*in|login/.test(t))return"signin";');
  L.push('if(/sign\\s*up|register|join|create\\s*account|get\\s*started|try\\s*free|start\\s*free|start\\s*your|begin|journey/.test(t))return"signup";');
  L.push('if(/contact|email\\s*us|talk|message\\s*us|get\\s*in\\s*touch|reach\\s*us/.test(t))return"contact";');
  L.push('if(/subscribe|newsletter|notify|updates/.test(t))return"subscribe";');
  L.push('if(/donate|give|support\\s*us/.test(t))return"signup";');
  L.push('if(/home|top/.test(t))return"scroll-top";');
  L.push('if(/about|learn|more|how|explore|story|mission/.test(t))return"scroll-about";');
  L.push('if(/feature|service|why\\s*us|benefit/.test(t))return"scroll-features";');
  L.push('if(/price|plan|premium|upgrade|membership|ticket/.test(t))return"scroll-pricing";');
  L.push('if(/product|shop|menu|catalog|browse/.test(t))return"scroll-products";');
  L.push('if(/portfolio|work|project|case|gallery/.test(t))return"scroll-portfolio";');
  L.push('if(/team|people|staff/.test(t))return"scroll-team";');
  L.push('if(/testimonial|review/.test(t))return"scroll-testimonials";');
  L.push('if(/faq|question/.test(t))return"scroll-faq";return null}');

  L.push('function scrollByHint(hint,el){var ids={');
  L.push('"scroll-top":[""],');
  L.push('"scroll-about":["about","story","mission","how","how-it-works"],');
  L.push('"scroll-features":["features","services","benefits","why","why-us"],');
  L.push('"scroll-pricing":["pricing","plans","membership","price","tickets"],');
  L.push('"scroll-products":["products","shop","menu","catalog","featured-products"],');
  L.push('"scroll-portfolio":["portfolio","work","projects","gallery","case-studies"],');
  L.push('"scroll-team":["team","people","staff","speakers"],');
  L.push('"scroll-testimonials":["testimonials","reviews","customers"],');
  L.push('"scroll-faq":["faq","questions"]');
  L.push('}[hint]||[];');
  L.push('// Router-aware: when in multi-page mode, prefer page-swap over scroll');
  L.push('if(__ms_routerActive){for(var p=0;p<ids.length;p++){if(__ms_routerHandleLink(ids[p]))return true}}');
  L.push('for(var i=0;i<ids.length;i++)if(scrollToId(ids[i]))return true;');
  L.push('var sec=nextSection(el);if(sec){sec.scrollIntoView({behavior:"smooth",block:"start"});return true}return false}');

  // ── modal data ──
  L.push("var MODALS={");
  L.push('order:{t:"Place your order",s:"Tell us what you need — we\'ll handle the rest.",f:[{l:"Full name",n:"name",t:"text",r:true},{l:"Phone",n:"phone",t:"tel",r:true},{l:"Delivery address",n:"address",t:"text",r:true},{l:"Notes (optional)",n:"notes",t:"textarea"}],g:"Place order",ok:"Order placed!",okm:"We\'ll send confirmation to your phone shortly."},');
  L.push('book:{t:"Book a slot",s:"Pick a time and we\'ll confirm by email.",f:[{l:"Full name",n:"name",t:"text",r:true},{l:"Email",n:"email",t:"email",r:true},{l:"Preferred date",n:"date",t:"date",r:true},{l:"Notes (optional)",n:"notes",t:"textarea"}],g:"Request booking",ok:"Booking requested!",okm:"We\'ll confirm your slot within an hour."},');
  L.push('signin:{t:"Sign in",s:"Welcome back.",f:[{l:"Email",n:"email",t:"email",r:true},{l:"Password",n:"password",t:"password",r:true}],g:"Sign in",ok:"Signed in!",okm:"Welcome back — this is a demo confirmation."},');
  L.push('signup:{t:"Create your account",s:"It takes less than a minute.",f:[{l:"Full name",n:"name",t:"text",r:true},{l:"Email",n:"email",t:"email",r:true},{l:"Password",n:"password",t:"password",r:true}],g:"Create account",ok:"Account created!",okm:"Welcome aboard — this is a demo confirmation."},');
  L.push('contact:{t:"Contact us",s:"We typically reply within a few hours.",f:[{l:"Your name",n:"name",t:"text",r:true},{l:"Email",n:"email",t:"email",r:true},{l:"Message",n:"message",t:"textarea",r:true}],g:"Send message",ok:"Message sent!",okm:"Thanks — we\'ll be in touch soon."},');
  L.push('subscribe:{t:"Get updates",s:"No spam. Unsubscribe anytime.",f:[{l:"Email",n:"email",t:"email",r:true}],g:"Subscribe",ok:"You\'re subscribed!",okm:"Thanks for joining the list."}};');

  // ── modal open/close + toast ──
  L.push('function openModal(kind){var m=MODALS[kind];if(!m)return;closeModal();var back=document.createElement("div");back.className="__ms-back";var fields=m.f.map(function(f){var input=f.t==="textarea"?"<textarea name=\\""+f.n+"\\""+(f.r?" required":"")+"></textarea>":"<input name=\\""+f.n+"\\" type=\\""+f.t+"\\""+(f.r?" required":"")+">";return "<div class=\\"__ms-fld\\"><label>"+f.l+"</label>"+input+"</div>"}).join("");back.innerHTML="<div class=\\"__ms-card\\" role=\\"dialog\\" aria-modal=\\"true\\"><button class=\\"__ms-x\\" aria-label=\\"Close\\">&times;</button><h2 class=\\"__ms-title\\">"+m.t+"</h2><p class=\\"__ms-sub\\">"+m.s+"</p><form class=\\"__ms-form\\">"+fields+"<button type=\\"submit\\" class=\\"__ms-go\\">"+m.g+"</button></form><p class=\\"__ms-foot\\">Demo · No data is sent</p></div>";document.body.appendChild(back);back.addEventListener("click",function(e){if(e.target===back)closeModal()});back.querySelector(".__ms-x").addEventListener("click",closeModal);back.querySelector(".__ms-form").addEventListener("submit",function(e){e.preventDefault();back.querySelector(".__ms-card").innerHTML="<div class=\\"__ms-ok\\"><div class=\\"__ms-tick\\">✓</div><h3>"+m.ok+"</h3><p>"+m.okm+"</p></div>";setTimeout(function(){closeModal()},2000)})}');
  L.push('function closeModal(){var b=document.querySelector(".__ms-back");if(b)b.remove()}');
  L.push('function __ms_toast(msg){var t=document.createElement("div");t.className="__ms-toast";t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.remove()},2200)}');
  L.push('window.__ms_toast=__ms_toast;');
  L.push('document.addEventListener("keydown",function(e){if(e.key==="Escape"){closeModal();var c=document.querySelector(".__ms-cart-back");if(c)c.remove()}});');

  // ── inject cart module ──
  L.push(buildCartScript());

  // ── image fallback: when a photo fails to load (e.g. an old Pollinations URL
  // that now 402s), swap to a RELEVANT loremflickr keyword photo, then a
  // guaranteed-working picsum image, then a clean placeholder. We clear the
  // page's own onerror first so a dead inline retry can't loop. ──
  L.push('document.addEventListener("error",function(e){');
  L.push('  var t=e.target;');
  L.push('  if(!t||t.tagName!=="IMG")return;');
  L.push('  t.onerror=null;');
  L.push('  var step=parseInt(t.dataset.__msFallback||"0",10);');
  L.push('  var alt=t.alt||t.getAttribute("data-name")||"product";');
  L.push('  var kw=alt.toLowerCase().replace(/[^a-z0-9 ]/g," ").trim().split(/\\s+/).slice(0,3).join(",")||"abstract";');
  L.push('  if(step===0){');
  L.push('    t.dataset.__msFallback="1";');
  L.push('    t.src="https://loremflickr.com/600/600/"+encodeURIComponent(kw)+"?lock="+Math.floor(Math.random()*100000);');
  L.push('  }else if(step===1){');
  L.push('    t.dataset.__msFallback="2";');
  L.push('    t.src="https://picsum.photos/seed/"+encodeURIComponent(kw)+"/600/600";');
  L.push('  }else if(step===2){');
  L.push('    t.dataset.__msFallback="3";');
  // Neutral placeholder: a soft gradient with a small centred photo icon. We
  // use a wide viewBox + "slice" so it fills any size (hero or thumbnail)
  // without the icon ballooning — and NO text, so a broken hero never shows
  // a giant caption.
  L.push('    var svg=\'<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%23eef2f7"/><stop offset="1" stop-color="%23dde4ec"/></linearGradient></defs><rect width="400" height="300" fill="url(%23g)"/><g fill="none" stroke="%23aab4c2" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><rect x="158" y="115" width="84" height="70" rx="8"/><circle cx="182" cy="140" r="9"/><path d="M160 172l26-22 18 15 24-20 14 12"/></g></svg>\';');
  L.push('    t.src=\'data:image/svg+xml;utf8,\'+svg;');
  L.push('  }');
  L.push('},true);');

  // ── main click handler ──
  L.push('document.addEventListener("click",function(e){');
  L.push(ADD_TO_CART_HANDLER);
  L.push('var found=findClickable(e.target);if(!found)return;var el=found.el;');
  L.push('if(el.closest&&el.closest(".cart-icon,.cart-btn,.cart-button,.cart-toggle,.cart-link,[data-cart-icon],[data-cart-toggle]"))return;');
  L.push('var text=(el.innerText||el.textContent||"").trim();');
  // Router-first: try to swap pages on link clicks
  L.push(ROUTER_LINK_HANDLER);
  L.push('if(found.kind==="a"){');
  L.push('  var href=(el.getAttribute("href")||"").trim();');
  L.push('  if(href.charAt(0)==="#"&&href.length>1){e.preventDefault();scrollToId(href.slice(1));return}');
  L.push('  if(href&&href!=="#"&&href.indexOf("javascript:")!==0){');
  L.push('    e.preventDefault();');
  L.push('    var guess=pathToAnchor(href);');
  L.push('    if(guess&&scrollToId(guess))return;');
  L.push('  }else{e.preventDefault()}');
  L.push('}else if(found.kind==="button"){');
  L.push('  if(el.type==="submit"&&el.closest&&el.closest("form"))return;');
  L.push('  e.preventDefault();');
  L.push('}');
  L.push('var cat=categorize(text);');
  L.push('if(cat&&MODALS[cat]){openModal(cat);return}');
  L.push('if(cat&&cat.indexOf("scroll-")===0){scrollByHint(cat,el);return}');
  L.push('var isCtaLike=el.classList&&(el.classList.contains("btn-primary")||el.classList.contains("cta")||el.closest&&el.closest("[class*=\\"cta\\"]"));');
  L.push('if(isCtaLike){openModal("signup");return}');
  L.push('__ms_toast("Coming soon")');
  L.push('},true);');

  // ── form submit handler ──
  // Form submit → clear, CONTEXTUAL demo feedback (sign in / sign up / contact /
  // subscribe / reservation) so the user always sees something happen.
  L.push('document.addEventListener("submit",function(e){');
  L.push('  var f=e.target;');
  L.push('  if(f.closest&&(f.closest(".__ms-back")||f.closest(".__ms-cart-back")))return;');
  L.push('  e.preventDefault();');
  L.push('  var btn=f.querySelector&&f.querySelector("button[type=submit],[type=submit],button");');
  L.push('  var t=((btn&&btn.textContent)||"").toLowerCase();');
  L.push('  var hasPw=f.querySelector&&f.querySelector("input[type=password]");');
  L.push('  var msg="\\u2713 Thanks! — this is a demo";');
  L.push('  if(hasPw&&/sign\\s*up|create|register|join/.test(t))msg="\\u2713 Account created — this is a demo";');
  L.push('  else if(hasPw||/sign\\s*in|log\\s*in/.test(t))msg="\\u2713 Signed in — this is a demo";');
  L.push('  else if(/subscribe|newsletter|notify/.test(t))msg="\\u2713 Subscribed — this is a demo";');
  L.push('  else if(/book|reserv/.test(t))msg="\\u2713 Reservation requested — this is a demo";');
  L.push('  else if(/send|message|contact/.test(t))msg="\\u2713 Message sent — this is a demo";');
  L.push('  __ms_toast(msg);');
  L.push('},true);');

  L.push("})();");
  L.push("<" + "/script>");
  return L.join("\n");
}

// Wraps any HTML string with a runtime safety + UX layer before rendering
// it inside an iframe srcDoc. Solves three things:
//
// 1. Nav links the AI generates (href="/features", "page.html", etc.) used
//    to navigate the iframe to a broken URL and blank it. We block all such
//    navigation and route to a matching section instead.
//
// 2. AI CTAs are often <a href="#"> or plain <button> with no destination.
//    We read the button text and either smooth-scroll to a matching section
//    OR pop a polished modal (Order Now → order form, Sign In → login,
//    Contact → contact form, Subscribe → email signup, etc.). Every
//    clickable thing now FEELS functional.
//
// 3. Form submits never reload the iframe — they show a "Thanks!" toast.


const MARKER = "__Creova_safe_preview__";
const SAFE_SCRIPT = buildPreviewScript(MARKER);

// Remove AI-written page-router scripts. The platform handles multi-page
// routing; the AI's own version frequently matches pages on element .id while
// the pages use data-page — so its showPage() hides EVERY page, leaving the
// site blank. We keep all other AI scripts (real interactivity).
function stripAiPageRouterScripts(html: string): string {
  return html.replace(
    /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
    (full: string, body: string) => {
      if (/__Creova/.test(full)) return full; // never touch our own
      if (/(data-page|page-route)/.test(body) && /hidden/.test(body)) return "";
      return full;
    },
  );
}

// The one export used across the app: takes the raw AI HTML and returns
// safe, iframe-ready HTML with the fix CSS + runtime script injected.
export function safePreviewHtml(html: string): string {
  if (!html) return html;
  if (html.indexOf(MARKER) !== -1) return html;
  html = stripAiPageRouterScripts(html);
  const injection = FIX_CSS + "\n" + SAFE_SCRIPT;
  if (/<head[\s>]/i.test(html)) {
    return html.replace(
      /<head([^>]*)>/i,
      (m, attrs) => `<head${attrs}>${injection}`,
    );
  }
  if (/<body[\s>]/i.test(html)) {
    return html.replace(
      /<body([^>]*)>/i,
      (m, attrs) => `<body${attrs}>${injection}`,
    );
  }
  return injection + html;
}
