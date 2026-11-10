import { AnimatePresence, motion } from 'motion/react'
import { ArrowClockwise, CheckCircle, WarningCircle, X } from '@phosphor-icons/react'
import './ui.css'

const press = { type: 'spring', stiffness: 400, damping: 22 }

/** Botón con variantes primary | secondary | ghost, tamaños md | sm y estado de carga. */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon = null,
  children,
  className = '',
  disabled,
  href,
  ...rest
}) {
  const Comp = href ? motion.a : motion.button
  const isDisabled = disabled || loading
  return (
    <Comp
      href={href}
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={href ? undefined : isDisabled}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      whileHover={isDisabled ? undefined : { scale: 1.03 }}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      transition={press}
      {...rest}
    >
      <span className="btn-icon" aria-hidden="true">
        {loading ? <span className="btn-spinner" /> : icon}
      </span>
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
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      transition={press}
      {...rest}
    >
      {children}
    </motion.button>
  )
}

/** Bloque con la forma del contenido real mientras carga. */
export function Skeleton({ className = '', style }) {
  return <span className={`skeleton ${className}`} style={style} aria-hidden="true" />
}

/** Estado vacío: dice qué pasa y qué hacer. */
export function EmptyState({ icon, title, children, action }) {
  return (
    <motion.div
      className="state state-empty"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      {icon && <span className="state-icon" aria-hidden="true">{icon}</span>}
      <h3 className="state-title">{title}</h3>
      {children && <p className="t-body">{children}</p>}
      {action}
    </motion.div>
  )
}

/** Estado de error: causa, solución y reintentar. */
export function ErrorState({ title, children, onRetry }) {
  return (
    <motion.div
      className="state state-error"
      role="alert"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="state-icon" aria-hidden="true">
        <WarningCircle size={28} weight="bold" />
      </span>
      <h3 className="state-title">{title}</h3>
      {children && <p className="t-body">{children}</p>}
      {onRetry && (
        <Button variant="secondary" size="sm" icon={<ArrowClockwise size={16} weight="bold" />} onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </motion.div>
  )
}

/** Toast: aviso temporal anclado abajo. tone = success | error | info */
export function Toast({ toast, onClose }) {
  return (
    <div className="toast-region" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className={`toast toast-${toast.tone ?? 'info'}`}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            <span className="toast-icon" aria-hidden="true">
              {toast.tone === 'error' ? (
                <WarningCircle size={20} weight="bold" />
              ) : toast.tone === 'loading' ? (
                <span className="btn-spinner" />
              ) : (
                <CheckCircle size={20} weight="bold" />
              )}
            </span>
            <div className="toast-body">
              <p className="toast-title">{toast.title}</p>
              {toast.detail && <p className="toast-detail">{toast.detail}</p>}
            </div>
            <IconButton label="Cerrar aviso" className="toast-close" onClick={onClose}>
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
