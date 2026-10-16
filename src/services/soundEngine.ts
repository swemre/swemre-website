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

import type {SoundName, SoundTone} from '../types/type'

const MASTER_GAIN = 0.18
const MIN_GAP_MS = 28

const recipes: Record<SoundName, SoundTone[]> = {
  tap: [{type: 'triangle', from: 880, to: 620, duration: 0.05, gain: 0.5}],
  key: [{type: 'square', from: 1900, to: 1500, duration: 0.018, gain: 0.12}],
  nav: [{type: 'sine', from: 1200, duration: 0.025, gain: 0.25}],
  enter: [
    {type: 'triangle', from: 660, duration: 0.05, gain: 0.4},
    {type: 'triangle', from: 990, duration: 0.07, delay: 0.045, gain: 0.35},
  ],
  back: [{type: 'square', from: 1100, to: 700, duration: 0.03, gain: 0.12}],
  'toggle-on': [
    {type: 'sine', from: 520, duration: 0.05, gain: 0.45},
    {type: 'sine', from: 780, duration: 0.07, delay: 0.05, gain: 0.45},
  ],
  'toggle-off': [
    {type: 'sine', from: 780, duration: 0.05, gain: 0.45},
    {type: 'sine', from: 520, duration: 0.07, delay: 0.05, gain: 0.45},
  ],
  open: [{type: 'sine', from: 420, to: 840, duration: 0.12, gain: 0.4}],
  close: [{type: 'sine', from: 760, to: 380, duration: 0.11, gain: 0.35}],
  cancel: [
    {type: 'triangle', from: 520, to: 300, duration: 0.07, gain: 0.35},
    {
      type: 'triangle',
      from: 300,
      to: 200,
      duration: 0.09,
      delay: 0.06,
      gain: 0.25,
    },
  ],
  send: [{type: 'triangle', from: 600, to: 1400, duration: 0.14, gain: 0.35}],
  success: [
    {type: 'sine', from: 660, duration: 0.08, gain: 0.4},
    {type: 'sine', from: 880, duration: 0.08, delay: 0.08, gain: 0.4},
    {type: 'sine', from: 1320, duration: 0.16, delay: 0.16, gain: 0.35},
  ],
  error: [
    {type: 'sawtooth', from: 220, duration: 0.09, gain: 0.18},
    {type: 'sawtooth', from: 180, duration: 0.14, delay: 0.1, gain: 0.18},
  ],
}

let context: AudioContext | null = null
let master: GainNode | null = null
let muted = false
const lastPlayed = new Map<SoundName, number>()

function output(): {ctx: AudioContext; out: GainNode} | null {
  if (!context) {
    if (typeof AudioContext === 'undefined') return null
    context = new AudioContext()
    master = context.createGain()
    master.gain.value = MASTER_GAIN
    master.connect(context.destination)
  }
  // Browsers start the context suspended until a user gesture.
  if (context.state === 'suspended') void context.resume()
  return master ? {ctx: context, out: master} : null
}

function schedule(ctx: AudioContext, out: GainNode, tone: SoundTone) {
  const start = ctx.currentTime + (tone.delay ?? 0)
  const end = start + tone.duration
  const oscillator = ctx.createOscillator()
  const envelope = ctx.createGain()
  oscillator.type = tone.type
  oscillator.frequency.setValueAtTime(tone.from, start)
  if (tone.to) oscillator.frequency.exponentialRampToValueAtTime(tone.to, end)
  envelope.gain.setValueAtTime(0.0001, start)
  envelope.gain.exponentialRampToValueAtTime(tone.gain, start + 0.005)
  envelope.gain.exponentialRampToValueAtTime(0.0001, end)
  oscillator.connect(envelope).connect(out)
  oscillator.start(start)
  oscillator.stop(end + 0.02)
}

export const soundEngine = {
  setMuted(value: boolean) {
    muted = value
  },
  play(name: SoundName) {
    if (muted) return
    const now = performance.now()
    if (now - (lastPlayed.get(name) ?? -Infinity) < MIN_GAP_MS) return
    lastPlayed.set(name, now)
    try {
      const target = output()
      if (!target) return
      for (const tone of recipes[name]) schedule(target.ctx, target.out, tone)
    } catch {
      // Audio unavailable (blocked or unsupported): stay silent.
    }
  },
}
