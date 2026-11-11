import { AnimatePresence, motion } from 'motion/react'
import { ArrowClockwise, CheckCircle, Info, Moon, Sun, WarningCircle, X } from '@phosphor-icons/react'
import { usePrefs } from '../prefs'
import { useT } from '../i18n'
import './ui.css'

/*
 * Componentes base (v6 brutalism + cybercore). Los colores de hover cambian al instante
 * (rasgo brutalista); Motion solo da respuesta física al presionar y transiciones de
 * entrada/salida. Los estados se distinguen por texto e ícono, no solo por color.
 */
const press = { type: 'spring', stiffness: 400, damping: 22 }
const enter = { duration: 0.22, ease: [0.16, 1, 0.3, 1] }

/** Botón con variantes primary | secondary | ghost, tamaños md | sm y estado de carga. */
export function Button({ variant = 'primary', size = 'md', loading = false, icon = null, children, className = '', disabled, href, ...rest }) {
  const Comp = href ? motion.a : motion.button
  const isDisabled = disabled || loading
  return (
    <Comp
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      transition={press}
      href={href}
      type={href ? undefined : 'button'}
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={href ? undefined : isDisabled}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      {...rest}
    >
      {(icon || loading) && (
        <span className="btn-icon" aria-hidden="true">
          {loading ? <span className="btn-spinner" /> : icon}
        </span>
      )}
      <span className="btn-label">{children}</span>
    </Comp>
  )
}

/** Botón de solo ícono: siempre con aria-label y área táctil de 44 px. */
export function IconButton({ label, children, className = '', ...rest }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      className={`icon-btn ${className}`}
      whileTap={{ scale: 0.92 }}
      transition={press}
      {...rest}
    >
      {children}
    </motion.button>
  )
}

/** Selector de idioma (ES/EN) y tema (claro/oscuro), compartido por landing y app. */
export function PrefsControls() {
  const { theme, toggleTheme, lang, setLang } = usePrefs()
  const t = useT()
  const isDark = theme === 'dark'
  return (
    <div className="prefs">
      <div className="prefs-lang" role="group" aria-label={t.langGroup}>
        {['es', 'en'].map((code) => (
          <button key={code} type="button" className="prefs-lang-btn" aria-pressed={lang === code} onClick={() => setLang(code)} lang={code}>
            {code.toUpperCase()}
          </button>
        ))}
      </div>
      <IconButton label={isDark ? t.toLight : t.toDark} onClick={toggleTheme} className="prefs-theme">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            className="prefs-theme-icon"
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {isDark ? <Sun size={20} weight="bold" aria-hidden="true" /> : <Moon size={20} weight="bold" aria-hidden="true" />}
          </motion.span>
        </AnimatePresence>
      </IconButton>
    </div>
  )
}

/** Bloque con la forma del contenido real mientras carga. */
export function Skeleton({ className = '', style }) {
  return <span className={`skeleton ${className}`} style={style} aria-hidden="true" />
}

/** Estado vacío: dice qué pasa y qué hacer. */
export function EmptyState({ icon, title, children, action }) {
  return (
    <motion.div className="state" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={enter}>
      {icon && <span className="state-icon" aria-hidden="true">{icon}</span>}
      <h2 className="state-title">{title}</h2>
      {children && <p className="t-body">{children}</p>}
      {action}
    </motion.div>
  )
}

/** Estado de error: causa, solución y reintentar. */
export function ErrorState({ title, children, onRetry }) {
  const t = useT()
  return (
    <motion.div className="state state-error" role="alert" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={enter}>
      <span className="state-icon" aria-hidden="true">
        <WarningCircle size={24} weight="bold" />
      </span>
      <h2 className="state-title">{title}</h2>
      {children && <p className="t-body">{children}</p>}
      {onRetry && (
        <Button variant="secondary" size="sm" icon={<ArrowClockwise size={16} weight="bold" />} onClick={onRetry}>
          {t.app.retry}
        </Button>
      )}
    </motion.div>
  )
}

const TOAST_ICONS = {
  error: <WarningCircle size={20} weight="bold" />,
  success: <CheckCircle size={20} weight="bold" />,
  info: <Info size={20} weight="bold" />,
}

/** Toast: aviso anclado abajo. tone = success | error | info | loading */
export function Toast({ toast, onClose }) {
  const t = useT()
  const tone = toast?.tone ?? 'info'
  return (
    <div className="toast-region" aria-live="polite">
      <AnimatePresence>
        {toast && (
        <motion.div
          key={toast.id}
          className={`toast toast-${tone}`}
          role={tone === 'error' ? 'alert' : 'status'}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16, transition: { duration: 0.15 } }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        >
          <span className="toast-icon" aria-hidden="true">
            {tone === 'loading' ? <span className="btn-spinner" /> : TOAST_ICONS[tone]}
          </span>
          <div className="toast-body">
            <p className="toast-title">{toast.title}</p>
            {toast.detail && <p className="toast-detail">{toast.detail}</p>}
          </div>
          <IconButton label={t.app.closeToast} className="toast-close" onClick={onClose}>
            <X size={16} weight="bold" />
          </IconButton>
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Dirección truncada en medio con fuente mono. */
export function Address({ value, className = '' }) {
  if (!value) return null
  return (
    <span className={`t-mono address ${className}`} title={value}>
      {value.slice(0, 6)}…{value.slice(-4)}
    </span>
  )
}
