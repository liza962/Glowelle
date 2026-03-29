export default function AuthPageShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <header className="auth-card-header mb-4">
          <p className="auth-card-eyebrow mb-2">{eyebrow}</p>
          <h1 className="auth-card-title h3 mb-2">{title}</h1>
          {subtitle ? (
            <p className="auth-card-subtitle text-muted small mb-0">{subtitle}</p>
          ) : null}
        </header>
        {children}
        {footer ? <div className="auth-card-footer">{footer}</div> : null}
      </div>
    </div>
  );
}
