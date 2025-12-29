import { io, Socket } from 'socket.io-client'
import { API_BASE } from './api'

export type WsStatus = 'connected' | 'disconnected'

export type ActivityEvent = {
  type: 'bot' | 'task' | 'market' | 'system' | string
  level?: 'info' | 'warn' | 'error' | 'success'
  message: string
  ts?: string | number
  payload?: any
}

let socket: Socket | null = null
let listeners = 0

export function connectActivity(opts: {
  onEvent: (evt: ActivityEvent) => void
  onStatusChange?: (s: WsStatus) => void
}) {
  if (!socket) {
    socket = io(API_BASE, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      opts.onStatusChange?.('connected')
    })
    socket.on('disconnect', () => {
      opts.onStatusChange?.('disconnected')
    })

    const forward = (type: ActivityEvent['type']) => (data: any) => {
      const evt: ActivityEvent = {
        type,
        message: typeof data === 'string' ? data : data?.message || type,
        payload: data,
        ts: Date.now(),
      }
      opts.onEvent(evt)
    }

    socket.on('activity', forward('system'))
    socket.on('bot_event', forward('bot'))
    socket.on('task_event', forward('task'))
    socket.on('market_event', forward('market'))
  }

  listeners += 1

  return () => {
    listeners = Math.max(0, listeners - 1)
    if (listeners === 0 && socket) {
      socket.removeAllListeners()
      socket.disconnect()
      socket = null
    }
  }
}
