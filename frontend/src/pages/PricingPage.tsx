import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Loader2,
  Sparkles,
  Zap,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { pricingPageStyles as s } from "../assets/dummyStyles";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { queryKeys } from "../queryKeys";
import type { PaymentPackage, VerifySessionResult } from "../types";
import {
  apiError,
  createCheckoutSession,
  getPackages,
  verifySession,
} from "../utils/api";
import { PackageGridSkeleton } from "../components/Skeletons";

const faqs = [
  {
    q: "What's a credit?",
    a: "One credit = one AI generation. New sites cost 5, iterations cost 2.",
  },
  {
    q: "Do credits expire?",
    a: "No. Credits you buy stay on your account forever. The 20 free signup credits also never expire.",
  },
  {
    q: "Do I need a subscription?",
    a: "No subscription, no auto-renewal. Buy a one-time pack when you need more credits. Pay only for what you use.",
  },
  {
    q: "What payment methods work?",
    a: "All major debit / credit cards (Visa, Mastercard, Amex) — handled by Stripe's secure hosted checkout.",
  },
  {
    q: "Do you offer refunds?",
    a: "Unused credits are refundable within 14 days of purchase — just email us. Already-used credits aren't refundable.",
  },
  {
    q: "What if a generation fails?",
    a: "If the AI falls back to a template (provider error, quota exhausted, etc.) we don't charge any credits. You only pay for successful generations.",
  },
];

// Handles the Stripe success-return URL: ?session_id=cs_test_...
// We hit /verify-session, credit the user, and clear the query param.
function StripeReturnBanner() {
  const [params, setParams] = useSearchParams();
  const sessionId = params.get("session_id");
  const cancelled = params.get("cancelled");
  const { updateUser } = useAuth();
  const [status, setStatus] = useState<
    "verifying" | "cancelled" | "idle" | "success" | "error"
  >(
    sessionId ? "verifying" : cancelled ? "cancelled" : "idle",
  );
  const [result, setResult] = useState<VerifySessionResult | null>(null);
  const [error, setError] = useState("");
  const verifyMutation = useMutation({
    mutationFn: verifySession,
    onSuccess: (result) => {
      updateUser(result.user);
      setResult(result);
      setStatus("success");
    },
    onError: (verificationError) => {
      setError(apiError(verificationError));
      setStatus("error");
    },
    onSettled: () => {
        const next = new URLSearchParams(params);
        next.delete("session_id");
        next.delete("cancelled");
        setParams(next, { replace: true });
    },
  });

  useEffect(() => {
    if (sessionId) verifyMutation.mutate(sessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  if (status === "idle") return null;

  const banners: Record<
    typeof status,
    { className: string; icon?: ReactNode; body: ReactNode }
  > = {
    cancelled: {
      className: `${s.bannerBase} ${s.bannerCancelled}`,
      icon: <AlertTriangle className={s.bannerIcon} />,
      body: "Payment cancelled — no credits were charged.",
    },
    verifying: {
      className: `${s.bannerBase} ${s.bannerVerifying}`,
      body: "Verifying your payment with Stripe…",
    },
    error: {
      className: `${s.bannerBase} ${s.bannerError}`,
      icon: <AlertTriangle className={s.bannerIcon} />,
      body: (
        <>
          Couldn't verify the payment: {error}. If you were charged, refresh —
          the webhook usually credits you within a minute.
        </>
      ),
    },
    success: {
      className: `${s.bannerBase} ${s.bannerSuccess}`,
      icon: <CheckCircle2 className={s.bannerIconSuccess} />,
      body: (
        <div>
          <p className={s.bannerBodySuccess}>
            Payment received — {result?.creditsAdded || 0} credits added!
          </p>
          <p className={s.bannerBodySuccessSub}>
            Your new balance: {result?.user?.credits ?? "(refresh to see)"}{" "}
            credits.
          </p>
        </div>
      ),
    },
  };
  const banner = banners[status];

  return (
    <div className={banner.className}>
      {banner.icon}
      {banner.body}
    </div>
  );
}

// The full pricing page: hero, Stripe return banner, credit packages, and FAQ.
export default function PricingPage() {
  return (
    <div className={s.container}>
      <Navbar />

      <section className={s.hero}>
        <div className={s.heroBg} style={s.heroBgStyle} />
        <div className={s.heroInner}>
          <p className={s.heroBadge}>Pricing</p>
          <h1 className={s.heroTitle}>
            Start free. <br className={s.heroTitleBr} />
            Pay when you grow.
          </h1>
          <p className={s.heroSub}>
            No credit card to start. Cancel anytime. Built to scale with you.
          </p>
        </div>
      </section>

      <StripeReturnBanner />

      <Pricing standalone />

      <section className={s.faqSection}>
        <div className={s.faqContainer}>
          <h2 className={s.faqHeading}>
            Frequently asked questions
          </h2>
          <div className={s.faqList}>
            {faqs.map((f) => (
              <details key={f.q} className={s.faqItem}>
                <summary className={s.faqSummary}>
                  {f.q}
                  <span className={s.faqPlus}>+</span>
                </summary>
                <p className={s.faqAnswer}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Hook that starts a Stripe checkout for a package and tracks buying state/errors.
function useStripeCheckout() {
  const checkoutMutation = useMutation({
    mutationFn: async (packageId: string) => {
      const checkout = await createCheckoutSession(packageId);
      if (!checkout.url) throw new Error("Stripe didn't return a checkout URL");
      return checkout;
    },
    onSuccess: ({ url }) => {
      window.location.assign(url);
    },
  });
  return {
    buy: checkoutMutation.mutate,
    purchasingId: checkoutMutation.isPending
      ? checkoutMutation.variables
      : null,
    error: checkoutMutation.isError
      ? apiError(checkoutMutation.error)
      : "",
  };
}

// The credit packages grid. `standalone` drops the section heading (used when
// the page already has its own hero, like this one).
function Pricing({ standalone = false }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthed = Boolean(user);
  const { buy, purchasingId, error } = useStripeCheckout();

  const packagesQuery = useQuery({
    queryKey: queryKeys.payments.packages,
    queryFn: getPackages,
  });
  const packages = packagesQuery.data?.packages ?? [];
  const configured = packagesQuery.data?.configured;

  function handleBuy(pkg: PaymentPackage) {
    if (!isAuthed) {
      navigate("/register");
      return;
    }
    if (!configured) return;
    buy(pkg.id);
  }

  const sectionClass = `${s.pricingSection} ${
    !standalone ? s.pricingSectionWithBorder : ""
  }`;

  return (
    <section className={sectionClass}>
      <div className={s.pricingContainer}>
        {!standalone && (
          <div className={s.pricingHeader}>
            <p className={s.pricingHeaderBadge}>Pricing</p>
            <h2 className={s.pricingHeaderTitle}>
              Simple. No subscriptions. Just credits.
            </h2>
            <p className={s.pricingHeaderSub}>
              One credit = one AI generation. Buy what you need, when you need
              it. Credits never expire.
            </p>
          </div>
        )}

        <FreeBanner
          onCta={() => navigate(isAuthed ? "/dashboard" : "/register")}
          authed={isAuthed}
        />

        {!packagesQuery.isPending && !configured && (
          <div className={s.configWarning}>
            <AlertTriangle className={s.configWarningIcon} />
            <span>
              <strong className={s.configWarningStrong}>
                Payments not configured.
              </strong>{" "}
              Set{" "}
              <code className={s.configWarningCode}>STRIPE_SECRET_KEY</code>{" "}
              in <code className={s.configWarningCode}>backend/.env</code>,
              then restart the backend.
            </span>
          </div>
        )}

        {error && <div className={s.errorBox}>{error}</div>}

        {packagesQuery.isPending ? (
             <PackageGridSkeleton />
        ) : packagesQuery.isError ? (
          <div className={s.loadError}>
            Couldn't load packages: {apiError(packagesQuery.error)}
          </div>
        ) : (
          <div className={s.packageGrid}>
            {packages.map((p) => (
              <PackageCard
                key={p.id}
                pkg={p}
                onBuy={() => handleBuy(p)}
                purchasing={purchasingId === p.id}
                disabled={Boolean(purchasingId) || (!configured && isAuthed)}
                authed={isAuthed}
              />
            ))}
          </div>
        )}

        <p className={s.packageFooter}>
          Secure payments by Stripe · One-time purchase · Cards accepted
          worldwide
        </p>
      </div>
    </section>
  );
}

// Banner promoting the 20 free signup credits; hidden once the user is logged in.
function FreeBanner({
  onCta,
  authed,
}: {
  onCta: () => void;
  authed: boolean;
}) {
  if (authed) return null;
  return (
    <div className={s.freeBanner}>
      <div className={s.freeBannerLeft}>
        <div className={s.freeBannerIconBox}>
          <Sparkles className={s.freeBannerIcon} />
        </div>
        <div>
          <p className={s.freeBannerTitle}>
            Get 20 free credits when you sign up
          </p>
          <p className={s.freeBannerSub}>
            No card needed. Try the full builder before buying anything.
          </p>
        </div>
      </div>
      <button onClick={onCta} className={s.freeBannerButton}>
        Sign up free
      </button>
    </div>
  );
}

// Format the package amount using its own currency (Stripe sends `usd`).
function formatPrice(pkg: PaymentPackage): string {
  const code = (pkg.currency || "usd").toUpperCase();
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: code,
    maximumFractionDigits: 2,
  }).format(pkg.amount / 100);
}

const CARD_FEATURES = [
  "Unlimited project edits",
  "Publish to Community",
  "Export HTML",
  "Credits never expire",
];

// One credit-pack card showing price, features, and a buy button.
function PackageCard({
  pkg,
  onBuy,
  purchasing,
  disabled,
  authed,
}: {
  pkg: PaymentPackage;
  onBuy: () => void;
  purchasing: boolean;
  disabled: boolean;
  authed: boolean;
}) {
  const price = formatPrice(pkg);
  const buttonLabel = !authed
    ? "Sign up to buy"
    : purchasing
      ? "Processing..."
      : `Buy ${pkg.credits} credits`;
  const isHighlighted = pkg.highlighted;
  const cardClass = `${s.cardBase} ${
    isHighlighted ? s.cardHighlighted : s.cardNormal
  }`;
  const buttonClass = `${s.buyButton} ${
    isHighlighted ? s.buyButtonHighlighted : s.buyButtonNormal
  }`;

  return (
    <div className={cardClass}>
      {isHighlighted && (
        <span className={s.popularBadge}>Popular</span>
      )}
      <h3 className={s.packageName}>{pkg.name}</h3>
      <p className={s.packageTagline}>{pkg.tagline}</p>
      <div className={s.priceRow}>
        <span className={s.price}>{price}</span>
        <span className={s.priceSuffix}>one-time</span>
      </div>
      <p className={s.perCredit}>{pkg.perCredit} / credit</p>
      <ul className={s.featureList}>
        <li className={s.featureItem}>
          <Zap className={s.featureIcon} />
          <span>
            <span className={s.featureText}>{pkg.credits}</span> AI
            generations
          </span>
        </li>
        {CARD_FEATURES.map((f) => (
          <li key={f} className={s.featureItem}>
            <Check className={s.featureIcon} />
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={onBuy}
        disabled={disabled || purchasing}
        className={buttonClass}
      >
        {purchasing && <Loader2 className={s.buySpinner} />}
        {buttonLabel}
      </button>
    </div>
  );
}