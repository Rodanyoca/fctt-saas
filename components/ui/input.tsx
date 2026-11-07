"use client"

import * as React from 'react'
import { formatCompactDateInput, parseCompactDate } from '@/lib/compact-date'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  const [dateError, setDateError] = React.useState("")
  const errorId = React.useId()
  const isDate = props.inputMode === "numeric" && props.maxLength === 10 && props.placeholder === "JJMMAAAA"
  const checkDate = (input: HTMLInputElement, completeOnly: boolean) => {
    const raw = formatCompactDateInput(input.value)
    const message = raw && (!completeOnly || raw.length === 10) && !parseCompactDate(raw) ? "Saisissez une date calendaire réelle (JJ/MM/AAAA)." : ""
    input.setCustomValidity(message)
    setDateError(message)
  }
  return (
    <><input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className,
      )}
      {...props}
      aria-invalid={dateError ? true : props["aria-invalid"]}
      aria-describedby={dateError ? `${props["aria-describedby"] ?? ""} ${errorId}`.trim() : props["aria-describedby"]}
      onChange={(event) => { props.onChange?.(event); if (isDate) checkDate(event.currentTarget, true) }}
      onBlur={(event) => { props.onBlur?.(event); if (isDate) checkDate(event.currentTarget, false) }}
    />{isDate && dateError ? <p id={errorId} role="alert" className="text-xs text-destructive">{dateError}</p> : null}</>
  )
}

export { Input }
