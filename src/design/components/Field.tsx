/**
 * Copyright 2026 swemre (emre@swemre.com). All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 with the Commons Clause
 * License Condition v1.0 (the "License"). Personal use of this code and
 * content is permitted; any commercial gain requires prior written
 * permission from the copyright holder. See the LICENSE file for full terms.
 *
 * Contact: emre@swemre.com
 */

// Field (V4-Comp-Field) and Checkbox (V4-Comp-Checkbox). Every field keeps its fixed 20px message
// slot (a2-msg) so errors never move anything. States: focus (from the browser, or forced for
// specimens), error, busy (read-only while sending), disabled. Browser autofill and password
// manager suggestions are off on every field; selects use the site's own dropdown (Select).
import {useId, type ChangeEvent, type ReactNode, type Ref} from 'react'
import {Icon, type IconName} from './Icon.tsx'
import {Select} from './Select.tsx'
import {cx} from './util.ts'
import {t} from '../../i18n/index.ts'

export type FieldState = 'focus' | 'error' | 'disabled' | 'busy'

export interface FieldProps {
  label: ReactNode
  name: string
  kind?: 'text' | 'email' | 'tel' | 'area' | 'select'
  value?: string
  onChange?(value: string): void
  onBlur?(): void
  placeholder?: string
  state?: FieldState
  /** Shown in the message slot when state is 'error'. */
  error?: string
  hint?: ReactNode
  optional?: boolean
  required?: boolean
  /** Select options; the first empty one is the placeholder ("Choose one"). */
  options?: {value: string; label: string}[]
  icon?: IconName
  id?: string
  inputRef?: Ref<HTMLInputElement & HTMLTextAreaElement>
  className?: string
}

export function Field({
  label,
  name,
  kind = 'text',
  value = '',
  onChange,
  onBlur,
  placeholder,
  state,
  error,
  hint,
  optional,
  required,
  options = [],
  icon,
  id,
  inputRef,
  className,
}: FieldProps) {
  const auto = useId()
  const fieldId = id ?? `f-${name}-${auto}`
  const msgId = `${fieldId}-msg`
  const isError = state === 'error'
  const busy = state === 'busy'
  const disabled = state === 'disabled'
  const msg =
    isError && error ? (
      <span className="a2-err">
        <Icon name="alert" size={14} />
        {error}
      </span>
    ) : hint ? (
      <span className="a2-hint">{hint}</span>
    ) : null
  const common = {
    id: fieldId,
    name,
    className: 'pf-in',
    value,
    onChange: (e: ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) =>
      onChange?.(e.target.value),
    onBlur,
    disabled,
    readOnly: busy || undefined,
    required,
    'aria-invalid': isError || undefined,
    'aria-describedby': msg ? msgId : undefined,
    'aria-busy': busy || undefined,
    ref: inputRef,
    autoComplete: 'off',
    autoCorrect: 'off',
    spellCheck: kind === 'area',
    'data-1p-ignore': true,
    'data-lpignore': 'true',
    'data-form-type': 'other',
  }
  let control: ReactNode
  if (kind === 'area')
    control = <textarea {...common} placeholder={placeholder} />
  else if (kind === 'select')
    control = (
      <Select
        id={fieldId}
        name={name}
        value={value}
        options={options}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled || busy}
        invalid={isError}
        describedBy={msg ? msgId : undefined}
      />
    )
  else
    control = (
      <input
        {...common}
        type={kind}
        placeholder={placeholder}
        inputMode={
          kind === 'email' ? 'email' : kind === 'tel' ? 'tel' : undefined
        }
      />
    )
  return (
    <label
      className={cx('a2-field', state && `is-${state}`, className)}
      htmlFor={fieldId}
    >
      <span className="a2-label">
        {label}
        {optional && <em>{t('form.optional')}</em>}
      </span>
      <span className={cx('a2-ctl', kind === 'area' && 'is-area')}>
        {icon && <Icon name={icon} />}
        {control}
      </span>
      <span className="a2-msg" id={msgId}>
        {msg}
      </span>
    </label>
  )
}

export interface CheckboxProps {
  label: ReactNode
  name?: string
  checked?: boolean
  onChange?(checked: boolean): void
  state?: 'error' | 'busy'
  error?: string
  hint?: ReactNode
  /** Leave out the message slot (only outside forms). */
  noSlot?: boolean
  required?: boolean
  inputRef?: Ref<HTMLInputElement>
}

export function Checkbox({
  label,
  name,
  checked,
  onChange,
  state,
  error,
  hint,
  noSlot,
  required,
  inputRef,
}: CheckboxProps) {
  const id = useId()
  const isError = state === 'error'
  const msg =
    isError && error ? (
      <span className="a2-err">
        <Icon name="alert" size={14} />
        {error}
      </span>
    ) : hint ? (
      <span className="a2-hint">{hint}</span>
    ) : null
  return (
    <div>
      <label
        className={cx(
          'a2-check',
          checked && 'is-checked',
          state && `is-${state}`,
        )}
      >
        <input
          type="checkbox"
          name={name}
          checked={!!checked}
          ref={inputRef}
          required={required}
          onChange={e => state !== 'busy' && onChange?.(e.target.checked)}
          aria-invalid={isError || undefined}
          aria-describedby={msg ? `${id}-msg` : undefined}
        />
        <span className="a2-box">
          {checked && <Icon name="check" size={12} strokeWidth={3} />}
        </span>
        <span>{label}</span>
      </label>
      {noSlot ? (
        msg && (
          <span
            id={`${id}-msg`}
            style={{display: 'flex', marginTop: 8, marginLeft: 26}}
          >
            {msg}
          </span>
        )
      ) : (
        <span
          className="a2-msg"
          id={`${id}-msg`}
          style={{marginTop: 8, marginLeft: 26}}
        >
          {msg}
        </span>
      )}
    </div>
  )
}
