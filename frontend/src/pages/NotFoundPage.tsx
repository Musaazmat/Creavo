// 404 page — friendly "page not found" screen with links back home.
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Logo, PageBackdrop } from "../assets/ui";
import { notFoundPageStyles as s } from "../assets/dummyStyles";

// Renders the 404 "page not found" screen with a home link and a go-back button.
export default function NotFoundPage() {
  return (
    <div className={s.container}>
      <PageBackdrop grid />

      <div className={s.logoWrapper}>
        <Logo />
      </div>

      <div className={s.content}>
        <p className={s.badge}>Error 404</p>
        <h1 className={s.number}>404</h1>
        <h2 className={s.title}>This page wandered off.</h2>
        <p className={s.description}>
          The page you're looking for doesn't exist — but we can build something
          better.
        </p>

        <div className={s.buttonGroup}>
          <Link
            to="/"
            className={s.primaryButton}
          >
            <Home className={s.icon} /> Back home
          </Link>
          <button
            onClick={() => window.history.back()}
            className={s.secondaryButton}
          >
            <ArrowLeft className={s.icon} /> Go back
          </button>
        </div>
      </div>
    </div>
  );
}