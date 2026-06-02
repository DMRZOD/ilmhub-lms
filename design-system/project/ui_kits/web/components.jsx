/* global React */
// IlmHub UI kit — shared primitives.
// Components are attached to window so the per-screen scripts can use them.

// (Don't destructure React hooks at top level — sibling script tags share scope under Babel standalone.)

/* ---------- Lucide ---------- */
function Icon({ name, size = 20, stroke = 2, color, className = "", style }) {
  // Render a placeholder <i data-lucide="..."> that Lucide replaces with an SVG.
  const ref = React.useRef(null);
  const dashName = String(name).replace(/[A-Z]/g, m => "-" + m.toLowerCase()).replace(/^-/, "");
  React.useEffect(() => {
    if (!ref.current || !window.lucide) return;
    // Reset to a fresh placeholder, then ask lucide to swap it.
    ref.current.innerHTML = `<i data-lucide="${dashName}" style="display:inline-flex;line-height:0"></i>`;
    const target = ref.current.firstElementChild;
    if (!target) return;
    target.setAttribute("width", size);
    target.setAttribute("height", size);
    target.setAttribute("stroke-width", stroke);
    if (color) target.setAttribute("color", color);
    window.lucide.createIcons({ icons: window.lucide.icons, nameAttr: "data-lucide", attrs: {} });
  }, [name, size, stroke, color]);
  return <span ref={ref} className={"icon " + className} style={{ display: "inline-flex", lineHeight: 0, width: size, height: size, color: color || undefined, ...style }} aria-hidden="true" />;
}

/* ---------- Button ---------- */
function Button({ variant = "primary", size, icon, iconAfter, children, ...rest }) {
  const cn = `btn btn--${variant}` + (size ? ` btn--${size}` : "") + (rest.className ? " " + rest.className : "");
  return (
    <button {...rest} className={cn}>
      {icon && <Icon name={icon} size={size === "sm" ? 14 : 18} />}
      {children}
      {iconAfter && <Icon name={iconAfter} size={size === "sm" ? 14 : 18} />}
    </button>
  );
}
function IconButton({ icon, variant = "ghost", size = "md", ...rest }) {
  return (
    <button {...rest} className={`btn btn--${variant} btn--icon ${size === "sm" ? "btn--sm" : ""} ${rest.className||""}`}>
      <Icon name={icon} size={size === "sm" ? 16 : 20} />
    </button>
  );
}

/* ---------- Pill ---------- */
function Pill({ tone = "neutral", icon, children, style }) {
  const cls = `pill ${tone === "neutral" ? "" : "pill--" + tone}`;
  return <span className={cls} style={style}>{icon && <Icon name={icon} size={12} />}{children}</span>;
}

/* ---------- Avatar ---------- */
function Avatar({ initials, size = "md", img, ink }) {
  const style = ink ? { background: "var(--ilm-ink)", color: "#fff" } : undefined;
  return (
    <span className={`avatar avatar--${size}`} style={style}>
      {img ? <img src={img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} /> : initials}
    </span>
  );
}

/* ---------- Tile ---------- */
function Tile({ size = "md", ink, color, text, icon, children, style, ...rest }) {
  const s = { ...(color ? { background: color, color: text || "#0A0A0A" } : {}), ...style };
  return (
    <div className={`tile tile--${size} ${ink ? "tile--ink" : ""}`} style={s} {...rest}>
      {icon ? <Icon name={icon} size={size === "lg" ? 28 : size === "sm" ? 18 : 22} /> : children}
    </div>
  );
}

/* ---------- Field ---------- */
function Field({ icon, pill, placeholder, value, onChange, type = "text", ...rest }) {
  return (
    <label className={`field ${pill ? "field--pill" : ""}`} {...rest}>
      {icon && <Icon name={icon} size={18} color="var(--ilm-muted)" />}
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} />
    </label>
  );
}

/* ---------- Progress ---------- */
function Progress({ value = 0, thin }) {
  return (
    <div className={`progress ${thin ? "progress--thin" : ""}`}>
      <div style={{ width: Math.max(0, Math.min(100, value)) + "%" }} />
    </div>
  );
}

/* ---------- Card ---------- */
function Card({ surface, hoverable, padding, children, style, onClick, ...rest }) {
  const cn = `card ${surface ? "card--surface" : ""} ${hoverable ? "card--hoverable" : ""} ${rest.className||""}`;
  return <div {...rest} className={cn} onClick={onClick} style={{ ...(padding ? { padding } : {}), ...style }}>{children}</div>;
}

/* ---------- Mascot (placeholder waving character: simple line-art via Lucide) ---------- */
function Mascot({ size = 120 }) {
  // Placeholder mascot built from a Lucide hand-wave-like icon combined with a head circle.
  return (
    <div style={{ width: size, height: size, position: "relative", display: "inline-block" }}>
      <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
        <g fill="none" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* head */}
          <circle cx="60" cy="34" r="14" />
          {/* glasses */}
          <circle cx="55" cy="34" r="3.5" />
          <circle cx="65" cy="34" r="3.5" />
          <path d="M58.5 34h3" />
          {/* smile */}
          <path d="M56 40q4 3 8 0" />
          {/* hair tuft */}
          <path d="M50 24q5 -6 14 -4" />
          {/* shoulders / torso */}
          <path d="M36 78q4 -16 24 -16t24 16" />
          <path d="M36 78v18a4 4 0 0 0 4 4h40a4 4 0 0 0 4 -4v-18" />
          {/* waving arm */}
          <path d="M84 70q12 -2 14 -16" />
          <path d="M98 54q1 -3 -2 -5" />
        </g>
      </svg>
    </div>
  );
}

/* ---------- Misc helpers ---------- */
function useScreen() {
  const [s, setS] = React.useState(() => (window.location.hash || "#home").slice(1));
  React.useEffect(() => {
    const h = () => setS((window.location.hash || "#home").slice(1));
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  const go = (name, params) => {
    window.location.hash = name + (params ? ":" + params : "");
  };
  const [route, param] = s.split(":");
  return { route, param, go };
}

Object.assign(window, {
  Icon, Button, IconButton, Pill, Avatar, Tile, Field, Progress, Card, Mascot, useScreen,
});
