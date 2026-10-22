import { expect, test } from 'claude-code/testing'

const PANE = {
  plugin: 'session-meter',
  component: 'Pane',
  requestId: 'session-meter',
  props: {
    title: 'Session meter',
    isFocused: false,
    bodyColumns: 44,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 40 },
    view: {},
  },
} as const

test('the meter draws, crosses its limit and hands over, on every surface', async ($, on) => {
  let usd = 1
  let tokens = 60_000
  const prompts: string[] = []
  on('command.register', () => ({ value: { command: 'meter' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.notify', () => ({ value: { isDelivered: true } }) as never)
  on('store.get', () => ({ value: undefined }))
  on('clock.now', () => ({ value: Date.parse('2026-10-22T15:30:00Z') }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('session.turns', () => ({ value: 3 }))
  on('session.usage', () => ({
    value: {
      startedAt: 0,
      context: { tokens, window: 1_000_000, percent: Math.round(tokens / 10_000) },
      rateLimits: [{ kind: 'five_hour', percentUsed: 42, resetsAt: '2026-10-22T18:00:00Z' }],
      cost: { usd },
    },
  }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('turn.complete', () => ({ text: '' }))
  on('prompt.submit', (_, e) => (prompts.push(e.text), { text: e.text }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  let ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /Healthy/ }))?.text).toContain('Healthy')
  await ui.unmount()

  for (const step of [2, 6, 10]) {
    usd += step
    tokens += 100_000
    await $.turn.complete({ reason: 'answer', answer: '', turnId: 't' } as never)
  }

  for (const surface of ['terminal', 'desktop', 'mobile'] as const) {
    ui = await $.ui.mount({ ...PANE, surface })
    expect((await ui.find({ type: 'Text', text: /Too expensive/ }))?.text).toContain('Too expensive')
    await ui.unmount()
  }

  ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.press({ key: 'handover' })
  expect(prompts[0]).toContain('handover note')
  await ui.unmount()
})
