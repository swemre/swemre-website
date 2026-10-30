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

// Select (V4-Comp-Field, kind select): the site's own dropdown in place of the browser's. A button
// shows the choice (or the empty option's label as a placeholder) and opens a listbox under it.
// Keyboard: arrows and Home/End move, Enter or Space picks, Esc or Tab closes, typing jumps to the
// first option starting with that letter. A click outside closes it.
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type Ref,
} from 'react'
import {Icon} from './Icon.tsx'
import {cx} from './util.ts'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  id: string
  name: string
  value: string
  options: SelectOption[]
  onChange?(value: string): void
  onBlur?(): void
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  buttonRef?: Ref<HTMLButtonElement>
}

export function Select({
  id,
  name,
  value,
  options,
  onChange,
  onBlur,
  disabled,
  invalid,
  describedBy,
  buttonRef,
}: SelectProps) {
  const listId = useId()
  const root = useRef<HTMLSpanElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const [open, setOpen] = useState(false)
  const selected = Math.max(
    0,
    options.findIndex(o => o.value === value),
  )
  const [active, setActive] = useState(selected)
  const current = options.find(o => o.value === value)
  const empty = !value

  useEffect(() => {
    if (!open) return
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [open])

  useEffect(() => {
    if (open)
      list.current
        ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
        ?.scrollIntoView({block: 'nearest'})
  }, [open, active])

  const show = () => {
    setActive(selected)
    setOpen(true)
  }
  const pick = (i: number) => {
    const o = options.at(i)
    if (o) onChange?.(o.value)
    setOpen(false)
  }
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = options.length - 1
    const move = (i: number) => {
      e.preventDefault()
      if (!open) show()
      setActive(Math.min(last, Math.max(0, i)))
    }
    if (e.key === 'ArrowDown') move(open ? active + 1 : selected)
    else if (e.key === 'ArrowUp') move(open ? active - 1 : selected)
    else if (e.key === 'Home') move(0)
    else if (e.key === 'End') move(last)
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (open) pick(active)
      else show()
    } else if (e.key === 'Escape' && open) {
      e.preventDefault()
      setOpen(false)
    } else if (e.key === 'Tab') setOpen(false)
    else if (e.key.length === 1) {
      const k = e.key.toLowerCase()
      const i = options.findIndex(
        (o, n) => n > 0 && o.label.toLowerCase().startsWith(k),
      )
      if (i >= 0) move(i)
    }
  }

  return (
    <span className={cx('a2-select', open && 'is-open')} ref={root}>
      <button
        type="button"
        id={id}
        name={name}
        ref={buttonRef}
        className={cx('pf-in', 'a2-select-btn', empty && 'is-empty')}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKey}
        onBlur={onBlur}
      >
        <span className="a2-select-val">{current?.label ?? ''}</span>
        <span className="a2-chev" aria-hidden="true">
          <Icon name="chevron-down" />
        </span>
      </button>
      {open && (
        <ul className="a2-select-pop" role="listbox" id={listId} ref={list}>
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${listId}-${i}`}
              data-index={i}
              role="option"
              aria-selected={o.value === value}
              className={cx(
                'a2-select-opt',
                i === active && 'is-active',
                !o.value && 'is-empty',
              )}
              onPointerEnter={() => setActive(i)}
              onPointerDown={e => e.preventDefault()}
              onClick={e => {
                e.preventDefault()
                pick(i)
              }}
            >
              <span>{o.label}</span>
              {o.value === value && o.value && <Icon name="check" size={16} />}
            </li>
          ))}
        </ul>
      )}
    </span>
  )
}
