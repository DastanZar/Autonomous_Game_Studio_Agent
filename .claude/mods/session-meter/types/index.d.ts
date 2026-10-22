export type Limits = { contextK: number; turnUsd: number; totalUsd: number }

export type RateWindow = { kind: string; percentUsed: number; resetsAt?: string }

export type Snapshot = {
  tokens: number
  window: number
  percent: number
  usd: number
  rateLimits: RateWindow[]
  startedAt: number
  model: string
  turns: number
}

export type Orchestration = { reads: number; denied: number; agents: Record<string, number>; edited: string[] }

export type Level = 'calm' | 'warm' | 'over'

export type Handover = {
  status: 'idle' | 'writing' | 'ready'
  sessionId?: string
}

declare module 'claude-code' {
  interface PluginState {
    'session-meter': {
      snap: Snapshot | null
      turnCosts: number[]
      limits: Limits
      alerted: Level
      handover: Handover
      isBandHidden: boolean
      lastUsd: number
      announced: Level
      panelVersion: number
      handledRequest: number
      sessionTitle: string
      orchestration: Orchestration
    }
  }
}
