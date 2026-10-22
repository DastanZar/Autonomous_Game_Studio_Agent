import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Handover, Level, Limits, Snapshot } from '../types'

const PANE = 'session-meter'
const TITLE = 'Session meter'
const DEFAULT_LIMITS: Limits = { contextK: 250, turnUsd: 3, totalUsd: 60 }

const snap = atom({ plugin: 'session-meter', key: 'snap' } as const, null)
const turnCosts = atom({ plugin: 'session-meter', key: 'turnCosts' } as const, [])
const limits = atom({ plugin: 'session-meter', key: 'limits' } as const, DEFAULT_LIMITS)
const alerted = atom({ plugin: 'session-meter', key: 'alerted' } as const, 'calm')
const handover = atom({ plugin: 'session-meter', key: 'handover' } as const, { status: 'idle' })
const lastUsd = atom({ plugin: 'session-meter', key: 'lastUsd' } as const, -1)
const announced = atom({ plugin: 'session-meter', key: 'announced' } as const, 'calm')
const panelVersion = atom({ plugin: 'session-meter', key: 'panelVersion' } as const, 0)
const handledRequest = atom({ plugin: 'session-meter', key: 'handledRequest' } as const, 0)
const isBandHidden = atom({ plugin: 'session-meter', key: 'isBandHidden' } as const, false)

const COLORS = { calm: '#3fb68b', warm: '#e0a03a', over: '#e5534b', track: '#8b8b8b33', ink: '#9aa0a6' }

const HANDOVER_PROMPT = `This session has become expensive to keep running (its context is re-read on every turn). Hand it over to a fresh session:

1. Write a handover note: the goal, what is done (with commit hashes and file paths), decisions made and why, what is in progress, the exact next step, open questions, and anything the next session must not redo. Keep it under 150 lines. If the repository already has a handover file or convention (for example docs/HANDOVER.md, or a closeout step in AGENTS.md), use it; otherwise write docs/handover/<YYYY-MM-DD>-<topic>.md (or a scratchpad file if there is no repository). Follow the repository's own rules (logs, decision records) as usual.
2. Commit and push it, with any finished work, to the current branch.
3. If the create_session tool (claude-code-remote) is available, create a new session on the same repository and branch, with the same model, whose prompt is: "Read <handover path> on branch <branch> and continue from its next step." Reply with the new session's id and its link (https://claude.ai/code/<session id>).
   If it is not available, tell me to run /clear and then send: "Read <handover path> and continue from its next step."
4. Then stop: do no further work in this session.`

const fmtK = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : `${n}`)
const fmtUsd = (n: number) => (n >= 100 ? `$${n.toFixed(0)}` : `$${n.toFixed(2)}`)
const worstOf = <T extends { ratio: number }>(ps: T[]) => ps.reduce((a, b) => (b.ratio > a.ratio ? b : a))
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)

function fmtAge(ms: number) {
  const m = Math.max(0, Math.round(ms / 60000))
  return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`
}

function fmtReset(iso: string | undefined, now: number) {
  if (!iso) return ''
  const left = Date.parse(iso) - now
  return Number.isFinite(left) ? `resets in ${fmtAge(left)}` : ''
}

// The three pressures, each as a fraction of its limit. The worst one sets the level.
function pressures(s: Snapshot, costs: number[], l: Limits) {
  const recent = avg(costs.slice(-3))
  return [
    { id: 'context', label: 'Context', ratio: s.tokens / (l.contextK * 1000), detail: `${fmtK(s.tokens)} of ${l.contextK}K` },
    { id: 'turn', label: 'Cost per turn', ratio: costs.length ? recent / l.turnUsd : 0, detail: `${fmtUsd(recent)} of ${fmtUsd(l.turnUsd)}` },
    { id: 'total', label: 'Session total', ratio: s.usd / l.totalUsd, detail: `${fmtUsd(s.usd)} of ${fmtUsd(l.totalUsd)}` },
  ]
}

function levelOf(ratio: number): Level {
  return ratio >= 1 ? 'over' : ratio >= 0.7 ? 'warm' : 'calm'
}

function bar(ratio: number, width: number) {
  const filled = Math.max(0, Math.min(width, Math.round(Math.min(1, ratio) * width)))
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

function ringSvg(percent: number, level: Level, center: string, sub: string) {
  const r = 46
  const c = 2 * Math.PI * r
  const dash = (Math.min(100, percent) / 100) * c
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
<circle cx="60" cy="60" r="${r}" fill="none" stroke="${COLORS.track}" stroke-width="10"/>
<circle cx="60" cy="60" r="${r}" fill="none" stroke="${COLORS[level]}" stroke-width="10" stroke-linecap="round"
 stroke-dasharray="${dash.toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 60 60)"/>
<text x="60" y="60" text-anchor="middle" font-family="system-ui,sans-serif" font-size="22" font-weight="600" fill="${COLORS[level]}">${center}</text>
<text x="60" y="80" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="${COLORS.ink}">${sub}</text>
</svg>`
}

function sparkSvg(costs: number[], cap: number) {
  const w = 240
  const h = 44
  const xs = costs.slice(-24)
  if (xs.length < 2) return ''
  const top = Math.max(cap, ...xs) * 1.1
  const pts = xs.map((v, i) => `${((i / (xs.length - 1)) * (w - 4) + 2).toFixed(1)},${(h - 2 - (v / top) * (h - 6)).toFixed(1)}`)
  const capY = (h - 2 - (cap / top) * (h - 6)).toFixed(1)
  const last = xs[xs.length - 1] ?? 0
  const [lx, ly] = (pts[pts.length - 1] ?? '0,0').split(',')
  const color = COLORS[levelOf(avg(xs.slice(-3)) / cap)]
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<line x1="0" x2="${w}" y1="${capY}" y2="${capY}" stroke="${COLORS.over}" stroke-opacity="0.45" stroke-dasharray="3 3"/>
<polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="${lx}" cy="${ly}" r="3" fill="${color}"><title>${fmtUsd(last)}</title></circle>
</svg>`
}

async function measure($: EngineInterface) {
  const u = await $.session.usage()
  const next: Snapshot = {
    tokens: u.context.tokens ?? 0,
    window: u.context.window,
    percent: u.context.percent ?? 0,
    usd: u.cost?.usd ?? 0,
    rateLimits: u.rateLimits.map(r => ({ kind: r.kind, percentUsed: r.percentUsed, resetsAt: r.resetsAt })),
    startedAt: u.startedAt,
    model: await $.session.model(),
    turns: await $.session.turns(),
  }
  await update($, snap, () => next)
  return next
}

async function judge($: EngineInterface, s: Snapshot) {
  const l = await read($, limits)
  const costs = await read($, turnCosts)
  const worst = worstOf(pressures(s, costs, l))
  const level = levelOf(worst.ratio)
  const before = await read($, alerted)
  if (level === before) return
  await update($, alerted, () => level)
  $.ui.status(level === 'calm' ? undefined : `${level === 'over' ? '●' : '◐'} ${worst.label} ${Math.round(worst.ratio * 100)}%`)
  if (level === 'over' && before !== 'over') {
    await update($, isBandHidden, () => false)
    void $.ui.notify(`${worst.label} is past its limit (${worst.detail}). Hand over to a fresh session to keep turns cheap.`, {
      title: 'Session getting expensive',
    }).catch(() => undefined)
  } else if (level === 'warm' && before === 'calm') {
    $.ui.toast(`Session meter: ${worst.label.toLowerCase()} at ${Math.round(worst.ratio * 100)}% of its limit`)
  }
}

async function startHandover($: EngineInterface) {
  if ((await read($, handover)).status === 'writing') return
  await update($, handover, (): Handover => ({ status: 'writing' }))
  $.ui.toast('Writing the handover; a new session follows')
  await $.prompt.submit({ text: HANDOVER_PROMPT })
}

// The meter as text: what /meter prints, for clients that draw no pane (the claude.ai web and mobile views).
async function report($: EngineInterface) {
  const s = await read($, snap)
  if (!s) return 'Session meter: no response measured yet.'
  const l = await read($, limits)
  const costs = await read($, turnCosts)
  const now = await $.clock.now()
  const ps = pressures(s, costs, l)
  const level = levelOf(worstOf(ps).ratio)
  const icon = (lv: Level) => (lv === 'over' ? '🔴' : lv === 'warm' ? '🟡' : '🟢')
  const verdict = level === 'over' ? 'Too expensive to keep going' : level === 'warm' ? 'Getting heavy' : 'Healthy'
  const row = (label: string, ratio: number, detail: string) =>
    `${icon(levelOf(ratio))} ${label.padEnd(14)} ${bar(ratio, 20)} ${String(Math.round(ratio * 100)).padStart(3)}%  ${detail}`
  const lines = [
    `${icon(level)} ${verdict}  ·  ${s.model} · ${s.turns} turns · ${fmtAge(now - s.startedAt)}`,
    '',
    `Context window   ${fmtK(s.tokens)} of ${fmtK(s.window)} (${s.percent}%)`,
    `Spent so far     ${fmtUsd(s.usd)}${costs.length ? `  ·  last turn ${fmtUsd(costs[costs.length - 1] ?? 0)}  ·  average ${fmtUsd(avg(costs))}` : ''}`,
    costs.length >= 2
      ? `Cost per turn    ${costs.slice(-30).map(c => '▁▂▃▄▅▆▇█'[Math.min(7, Math.floor((c / Math.max(l.turnUsd, ...costs)) * 8))]).join('')}`
      : '',
    '',
    'Against your limits',
    ...ps.map(p => row(p.label, p.ratio, p.detail)),
    ...(s.rateLimits.length
      ? ['', 'Plan limits', ...s.rateLimits.map(r =>
          row(r.kind === 'five_hour' ? '5-hour' : r.kind === 'seven_day' ? 'Weekly' : r.kind, r.percentUsed / 100, fmtReset(r.resetsAt, now)))]
      : []),
    '',
    level === 'over'
      ? 'Run /meter handover to write the handover and continue in a new session.'
      : 'Commands: /meter handover · /meter limits <contextK> <turnUsd> <totalUsd>',
  ].filter((x, i, a) => !(x === '' && a[i - 1] === ''))
  return '```\n' + lines.join('\n') + '\n```'
}

const PANEL = 'https://claude.ai/artifact/DJi4GZJYZrKox92i9cqdCx'
const PANEL_LOG = '/tmp/claude-0/-home-user/a0c53fe4-4e70-5b3c-a4fb-23fcabbfce94/scratchpad/meter-diag/panel.json'

// Reports this session's figures to the Session Meter page (its "sessions" collection), which claude.ai shows beside the chat.
async function report2panel($: EngineInterface, s: Snapshot) {
  const cse = await $.env.get('CLAUDE_CODE_REMOTE_SESSION_ID')
  const id = cse ? cse.replace(/^cse_/, 'session_') : `local_${await $.session.id()}`
  const five = s.rateLimits.find(r => r.kind === 'five_hour') ?? s.rateLimits[0]
  const repo = await $.session.repo().catch(() => null)
  const data = {
    title: (repo ? `${repo.name ?? ''}` : '') || (await $.session.cwd()).split('/').pop() || 'Claude Code session',
    model: s.model, tokens: s.tokens, window: s.window, usd: s.usd, turns: s.turns,
    updated: await $.clock.now(), startedAt: s.startedAt,
    rate: five ? { kind: five.kind, percentUsed: five.percentUsed, status: five.percentUsed >= 100 ? 'limited' : 'allowed', resetsAt: five.resetsAt ? Date.parse(five.resetsAt) / 1000 : 0 } : null,
  }
  const send = (version: number) =>
    $.tool.call({ tool: 'ArtifactData', action: 'set', url: PANEL, collection: 'sessions', doc_id: id, data, ...(version > 0 ? { if_version: version } : {}) } as never)
  const versionIn = (r: { text?: string; result?: unknown }) => Number((r.text ?? JSON.stringify(r.result ?? '')).match(/version (?:is )?(\d+)/)?.[1] ?? 0)
  let ran = await send(await read($, panelVersion))
  if (ran.deny || ran.isError) {
    // Unknown or stale version: read the document's current one and try once more.
    const got = await $.tool.call({ tool: 'ArtifactData', action: 'get', url: PANEL, collection: 'sessions', doc_id: id } as never)
    ran = await send(versionIn(got))
  }
  const version = versionIn(ran)
  if (version) await update($, panelVersion, () => version)
  await $.fs.write(PANEL_LOG, JSON.stringify({ at: data.updated, id, ok: !ran.deny && !ran.isError, deny: ran.deny, text: ran.text?.slice(0, 400) }, null, 2)).catch(() => undefined)
}

// The page's "Continue in a new session" button leaves {handover: <ms>} in requests/<session id>; a session picks it up here.
async function checkHandover($: EngineInterface) {
  const cse = await $.env.get('CLAUDE_CODE_REMOTE_SESSION_ID')
  if (!cse) return
  const got = await $.tool.call({ tool: 'ArtifactData', action: 'get', url: PANEL, collection: 'requests', doc_id: cse.replace(/^cse_/, 'session_') } as never)
  if (got.deny || got.isError) return
  const asked = Number((got.text ?? JSON.stringify(got.result ?? '')).match(/handover\\?"?\s*:\s*(\d+)/)?.[1] ?? 0)
  if (asked > (await read($, handledRequest))) {
    await update($, handledRequest, () => asked)
    await startHandover($)
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const stored = (await $.store.get('limits')) as Limits | undefined
    if (stored) await update($, limits, () => ({ ...DEFAULT_LIMITS, ...stored }))
    await $.command.register({
      name: 'meter',
      description: 'Session meter: show the figures, set limits (/meter limits <contextK> <turnUsd> <totalUsd>), or hand over now (/meter handover)',
    })
    const first = await measure($)
    if ((await read($, lastUsd)) < 0) await update($, lastUsd, () => first.usd)
    void $.ui.open({ id: PANE, title: TITLE })
    $.clock.every(60_000, () => void checkHandover($).catch(() => undefined))
    return next(e)
  })

  // A surface that attaches later (desktop app, terminal, IDE) gets the pane.
  on('session.attach', async ($, e, next) => {
    const done = await next(e)
    void $.ui.open({ id: PANE, title: TITLE })
    return done
  })

  // No pane reaches the web and mobile views, so the alert goes through the conversation: once per level, Claude says it.
  on('prompt.submit', async ($, e, next) => {
    if (e.origin.kind === 'plugin') return next(e)
    const level = await read($, alerted)
    const said = await read($, announced)
    if (level === 'calm' || level === said || (level === 'warm' && said === 'over')) return next(e)
    await update($, announced, () => level)
    const s = await read($, snap)
    const note =
      level === 'over'
        ? `[session-meter] This session is past its cost limits (${s ? `${fmtK(s.tokens)} context, ${fmtUsd(s.usd)} spent` : ''}). Before anything else in your reply, tell the user in one line that the session has become expensive to continue, and that /meter shows the figures and /meter handover moves the work to a fresh session. Then answer their message as usual.`
        : `[session-meter] This session is at 70% of a cost limit. At the end of your reply, add one short line telling the user, and that /meter shows the figures.`
    return next({ ...e, context: [...(e.context ?? []), note] })
  })

  on('session.measure', async ($, e, next) => {
    const s = await measure($)
    await judge($, s)
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    const s = await measure($)
    const before = await read($, lastUsd)
    if (before >= 0 && s.usd > before) await update($, turnCosts, xs => [...xs, s.usd - before].slice(-48))
    await update($, lastUsd, () => s.usd)
    await judge($, s)
    await report2panel($, s).catch(() => undefined)
    return done
  })

  on('tool.call', { tool: 'mcp__claude-code-remote__create_session' }, async ($, e, next) => {
    const ran = await next(e)
    if ((await read($, handover)).status === 'writing' && !ran.isError && !ran.deny) {
      const id = JSON.stringify(ran.result ?? ran.text ?? '').match(/session_[A-Za-z0-9]+/)?.[0]
      if (id) {
        await update($, handover, (): Handover => ({ status: 'ready', sessionId: id }))
        void $.ui.notify('The new session is ready with the handover. Open it from the session meter.', { title: 'Handover done' }).catch(() => undefined)
      }
    }
    return ran
  })

  on('command.run', { command: 'meter' }, async ($, e) => {
    const [verb, ...rest] = (e.args ?? '').trim().split(/\s+/)
    if (verb === 'handover') {
      await startHandover($)
      return { text: 'Handover started.' }
    }
    if (verb === 'limits') {
      const [contextK = NaN, turnUsd = NaN, totalUsd = NaN] = rest.map(Number)
      if (![contextK, turnUsd, totalUsd].every(n => Number.isFinite(n) && n > 0)) {
        return { text: 'Usage: /meter limits <contextK> <turnUsd> <totalUsd>, e.g. /meter limits 250 3 60' }
      }
      const l = { contextK, turnUsd, totalUsd }
      await update($, limits, () => l)
      await $.store.set('limits', l)
      await judge($, await measure($))
      return { text: `Limits set: context ${contextK}K tokens, ${fmtUsd(turnUsd)} per turn, ${fmtUsd(totalUsd)} per session.` }
    }
    void $.ui.open({ id: PANE, title: TITLE, focus: true })
    return { text: await report($) }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const s = await read($, snap)
    if (!s) return <Text dimColor>Waiting for the first response…</Text>
    const l = await read($, limits)
    const costs = await read($, turnCosts)
    const ho = await read($, handover)
    const now = await $.clock.now()
    const ps = pressures(s, costs, l)
    const worst = worstOf(ps)
    const level = levelOf(worst.ratio)
    const cols = Math.max(24, e.props.bodyColumns ?? 40)
    const barW = Math.max(10, Math.min(28, cols - 18))
    const isRich = e.surface !== 'terminal'
    const els = $.ui.resolve(e)
    const Svg = 'Svg' in els ? els.Svg : null
    const Link = els.Link
    const verdict = level === 'over' ? 'Too expensive to keep going' : level === 'warm' ? 'Getting heavy' : 'Healthy'

    return (
      <Box flexDirection="column" gap={1} paddingX={1}>
        <Box flexDirection="column">
          <Text size="title" weight="semibold" bold color={COLORS[level]}>
            {level === 'over' ? '●' : level === 'warm' ? '◐' : '○'} {verdict}
          </Text>
          <Text dimColor size="footnote">
            {s.model} · {s.turns} turns · {fmtAge(now - s.startedAt)}
          </Text>
        </Box>

        {isRich && Svg ? (
          <Box flexDirection="row" gap={2} alignItems="center">
            <Svg
              source={ringSvg(s.percent, levelOf(s.tokens / (l.contextK * 1000)), `${s.percent}%`, `of ${fmtK(s.window)}`)}
              alt={`Context window ${s.percent}% full`}
              width={120}
              height={120}
            />
            <Box flexDirection="column">
              <Text size="caption" dimColor>CONTEXT</Text>
              <Text size="heading" weight="semibold" tabular>{fmtK(s.tokens)}</Text>
              <Text size="caption" dimColor>SPENT</Text>
              <Text size="heading" weight="semibold" tabular>{fmtUsd(s.usd)}</Text>
            </Box>
          </Box>
        ) : (
          <Box flexDirection="column">
            <Text>
              <Text dimColor>Context </Text>
              <Text bold>{fmtK(s.tokens)}</Text>
              <Text dimColor> / {fmtK(s.window)} ({s.percent}%)</Text>
            </Text>
            <Text>
              <Text dimColor>Spent   </Text>
              <Text bold>{fmtUsd(s.usd)}</Text>
            </Text>
          </Box>
        )}

        <Box flexDirection="column">
          <Text size="caption" dimColor>AGAINST YOUR LIMITS</Text>
          {ps.map(p => (
            <Box key={p.id} flexDirection="column">
              <Text>
                <Text>{p.label.padEnd(14)}</Text>
                <Text dimColor tabular>{p.detail}</Text>
              </Text>
              <Text color={COLORS[levelOf(p.ratio)]} mono>
                {bar(p.ratio, barW)} {Math.round(p.ratio * 100)}%
              </Text>
            </Box>
          ))}
        </Box>

        {costs.length >= 2 && (
          <Box flexDirection="column">
            <Text size="caption" dimColor>
              COST PER TURN · last {fmtUsd(costs[costs.length - 1] ?? 0)} · avg {fmtUsd(avg(costs))}
            </Text>
            {isRich && Svg ? (
              <Svg source={sparkSvg(costs, l.turnUsd)} alt="Cost of each recent turn" width={240} height={44} />
            ) : (
              <Text color={COLORS[levelOf(avg(costs.slice(-3)) / l.turnUsd)]} mono>
                {costs
                  .slice(-barW)
                  .map(c => '▁▂▃▄▅▆▇█'[Math.min(7, Math.floor((c / Math.max(l.turnUsd, ...costs)) * 8))])
                  .join('')}
              </Text>
            )}
          </Box>
        )}

        {s.rateLimits.length > 0 && (
          <Box flexDirection="column">
            <Text size="caption" dimColor>PLAN LIMITS</Text>
            {s.rateLimits.map(r => (
              <Box key={r.kind} flexDirection="column">
                <Text>
                  <Text>{r.kind === 'five_hour' ? '5-hour' : r.kind === 'seven_day' ? 'Weekly' : r.kind}</Text>
                  <Text dimColor> · {fmtReset(r.resetsAt, now)}</Text>
                </Text>
                <Text color={COLORS[levelOf(r.percentUsed / 100)]} mono>
                  {bar(r.percentUsed / 100, barW)} {r.percentUsed}%
                </Text>
              </Box>
            ))}
          </Box>
        )}

        <Box flexDirection="column" gap={1}>
          {ho.status === 'ready' && ho.sessionId ? (
            <Box flexDirection="column">
              <Text color={COLORS.calm}>Handover done. The new session has the notes.</Text>
              <Link href={`https://claude.ai/code/${ho.sessionId}`} label="Open the new session →" />
            </Box>
          ) : ho.status === 'writing' ? (
            <Text dimColor>Writing the handover…</Text>
          ) : (
            <Button
              key="handover"
              label="Continue in a new session"
              variant={level === 'over' ? 'primary' : 'secondary'}
              onPress={() => startHandover($)}
            />
          )}
          <Text dimColor size="footnote">
            Limits: {l.contextK}K context · {fmtUsd(l.turnUsd)}/turn · {fmtUsd(l.totalUsd)} total. Change with /meter limits.
          </Text>
        </Box>
      </Box>
    )
  })

  // A one-line summary that is always on, for surfaces that seat no pane; the alert and its buttons join it past a limit.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const s = await read($, snap)
    if (e.props.hasSurvey || !s) return next(e)
    const l = await read($, limits)
    const costs = await read($, turnCosts)
    const ho = await read($, handover)
    const level = levelOf(worstOf(pressures(s, costs, l)).ratio)
    const isAlerting = level === 'over' && ho.status === 'idle' && !(await read($, isBandHidden))
    const five = s.rateLimits.find(r => r.kind === 'five_hour')
    const { Box, Text, Button } = $.ui.resolve(e)
    return (
      <Box flexDirection="row" gap={1} alignItems="center" flexWrap="wrap">
        <Text color={COLORS[level]}>{level === 'over' ? '●' : level === 'warm' ? '◐' : '○'}</Text>
        <Text>
          <Text dimColor>context </Text>
          <Text bold>{fmtK(s.tokens)}</Text>
          <Text dimColor> ({s.percent}%) · spent </Text>
          <Text bold>{fmtUsd(s.usd)}</Text>
          {costs.length > 0 && <Text dimColor> · {fmtUsd(avg(costs.slice(-3)))}/turn</Text>}
          {five && <Text dimColor> · 5h {five.percentUsed}%</Text>}
        </Text>
        {isAlerting && <Text color={COLORS.over}>Too expensive to keep going.</Text>}
        {isAlerting && <Button key="go" label="Continue in a new session" variant="primary" onPress={() => startHandover($)} />}
        {isAlerting && <Button key="later" label="Later" onPress={() => update($, isBandHidden, () => true)} />}
        {ho.status === 'writing' && <Text dimColor>Writing the handover…</Text>}
      </Box>
    )
  })
}
