// Navbar — top navigation bar with links and the signed-in account menu.
import { LogOut, Menu, Plus, Settings, X, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { navbarStyles as s } from "../assets/dummyStyles";
import { Logo } from "../assets/ui";
import { useAuth } from "../context/AuthContext";

const links = [
  { label: "Home", to: "/" },
  { label: "My Projects", to: "/dashboard", protected: true },
  { label: "Community", to: "/community" },
  { label: "Pricing", to: "/pricing" },
];

// Account links shared by the desktop dropdown and the mobile menu.
const accountLinks = [
  { label: "Buy credits", icon: Zap, to: "/pricing", iconClass: s.accountIconIndigo },
  { label: "Settings", icon: Settings, to: "/settings" },
];

// Main navigation bar: logo, page links, and sign-in buttons or account menu.
export default function Navbar() {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();
  const isAuthed = Boolean(user);
  const [open, setOpen] = useState(false);
  const visibleLinks = links.filter((l) => !l.protected || isAuthed);

  return (
    <nav className={s.root}>
      <div className={s.container}>
        <Logo />

        {/* Center links (desktop) */}
        <div className={s.centerLinks}>
          {visibleLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `${s.navLinkBase} ${isActive ? s.navLinkActive : s.navLinkInactive}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Right side (desktop) */}
        <div className={s.desktopRight}>
          {isAuthed ? (
            <UserMenu />
          ) : (
            <>
              <Link to="/login" className={s.signInLink}>
                Sign in
              </Link>
              <button
                onClick={() => navigate("/register")}
                className={`${s.btnPrimary} text-[13px] px-4 py-2`}
              >
                Get started
              </button>
            </>
          )}
        </div>

        {/* Hamburger (mobile) */}
        <button
          className={s.hamburger}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className={s.hamburgerIcon} /> : <Menu className={s.hamburgerIcon} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className={s.mobileMenu}>
          {visibleLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={s.mobileLink}
            >
              {l.label}
            </Link>
          ))}

          <div className={s.mobileDivider}>
            {isAuthed ? (
              <>
                {accountLinks.map(({ label, icon: Icon, to, iconClass }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    className={s.mobileAccountLink}
                  >
                    <Icon className={`${s.iconSm} ${iconClass || ""}`} /> {label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    logoutUser();
                    setOpen(false);
                    navigate("/");
                  }}
                  className={s.mobileSignOut}
                >
                  <LogOut className={s.iconSm} /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className={s.mobileLink}
                >
                  Sign in
                </Link>
                <button
                  onClick={() => {
                    navigate("/register");
                    setOpen(false);
                  }}
                  className={`${s.btnPrimary} ${s.mobileGetStarted}`}
                >
                  Get started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

// The signed-in account dropdown (credits pill + avatar + menu), desktop only.
function UserMenu() {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close the dropdown when you click outside it.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        ref.current &&
        e.target instanceof Node &&
        !ref.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return null;

  const initials = (user.name || user.email || "U")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div ref={ref} className={s.userMenuWrapper}>
      {/* Credits pill */}
      <button
        onClick={() => navigate("/pricing")}
        title="Buy more credits"
        className={s.creditsPill}
      >
        <Zap className={s.creditsIcon} />
        <span className={s.creditsLabel}>Credits :</span>
        <span className={s.creditsNumber}>{user.credits ?? 0}</span>
        <Plus className={s.plusIcon} />
      </button>

      {/* Avatar */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        className={s.avatar}
      >
        {initials}
      </button>

      {/* Dropdown */}
      {open && (
        <div className={s.dropdown}>
          <div className={s.dropdownHeader}>
            <div className={s.avatar}>{initials}</div>
            <div className={s.dropdownUserInfo}>
              <p className={s.dropdownUserName}>{user.name}</p>
              <p className={s.dropdownUserEmail}>{user.email}</p>
            </div>
          </div>
          <div className={s.dropdownBody}>
            {accountLinks.map(({ label, icon: Icon, to, iconClass }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={s.dropdownItem}
              >
                <Icon className={`${s.iconMd} ${iconClass || ""}`} /> {label}
              </Link>
            ))}
            <button
              onClick={() => {
                logoutUser();
                setOpen(false);
                navigate("/");
              }}
              className={s.dropdownSignOut}
            >
              <LogOut className={s.iconMd} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}