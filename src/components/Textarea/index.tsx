'use client'

import styles from './index.module.css'

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
}

export function Textarea({ label, error, id, className = '', rows = 5, ...rest }: Props) {
  return (
    <div className={styles.field}>
      <div className={styles.inputWrap}>
        <textarea
          id={id}
          rows={rows}
          placeholder=" "
          {...rest}
          suppressHydrationWarning
          className={`${styles.input} ${error ? styles.inputError : ''} ${label ? styles.hasLabel : ''} ${className}`}
        />
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
        )}
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}
