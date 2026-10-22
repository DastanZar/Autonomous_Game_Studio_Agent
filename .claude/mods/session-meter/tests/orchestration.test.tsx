import { expect, test } from 'claude-code/testing'

test('three reads pass, the fourth is denied, a subagent read passes', async ($, on) => {
  on('command.register', () => ({ value: { command: 'meter' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  const kv = new Map<string, unknown>()
  on('session.id', () => ({ value: 's1' }) as never)
  on('store.get', (_, e) => ({ value: kv.get((e as { key: string }).key) }))
  on('store.set', (_, e) => (kv.set((e as { key: string }).key, (e as { value: unknown }).value), { value: undefined }) as never)
  on('clock.now', () => ({ value: 0 }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('session.turns', () => ({ value: 1 }))
  on('session.usage', () => ({ value: { startedAt: 0, context: { tokens: 1, window: 1_000_000, percent: 0 }, rateLimits: [], cost: { usd: 0 } } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('tool.call', () => ({ result: 'ok', text: 'ok' }) as never)

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  for (const f of ['a', 'b', 'c']) {
    expect((await $.tool.call({ tool: 'Read', file_path: `/x/${f}.md` })).deny).toBeUndefined()
  }
  expect((await $.tool.call({ tool: 'Read', file_path: '/x/d.md' })).deny).toContain('Explore')
  expect((await $.tool.call({ tool: 'Read', file_path: '/x/.claude/mods/m.md' })).deny).toBeUndefined()
  expect((await $.tool.call({ tool: 'Read', file_path: '/x/e.md', agentId: 'sub' } as never)).deny).toBeUndefined()
  expect((await $.tool.call({ tool: 'WebSearch', query: 'q' } as never)).deny).toContain('researcher')

  expect((await $.command.run({ command: 'meter', args: 'orchestration' })).text).toContain('denied (sent to Haiku): 2')
})
