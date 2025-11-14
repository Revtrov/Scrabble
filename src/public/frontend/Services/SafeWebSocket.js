const websocket = 'ws://localhost:3000'
import { generateUUID } from "./lib.js"
export default class SafeWebSocket {
  constructor() {
    this.ws = new WebSocket(websocket)
    this.queue = []
    this.pending = new Map()
    this.listeners = new Map()

    this.ws.addEventListener('open', () => this.flush())
    this.ws.addEventListener('message', (event) => {
      let msg
      try {
        msg = JSON.parse(event.data)
      } catch (e) {
        console.warn('Invalid JSON:', event.data)
        return
      }

      // Resolve pending requests
      if (msg.requestId && this.pending.has(msg.requestId)) {
        this.pending.get(msg.requestId)(msg)
        this.pending.delete(msg.requestId)
        return
      }

      // Call listeners for this type
      if (msg.type && this.listeners.has(msg.type)) {
        this.listeners.get(msg.type).forEach((cb) => cb(msg))
      }
    })
  }

  send(data) {
    const msg = JSON.stringify(data)
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(msg)
    } else {
      this.queue.push(msg)
    }
  }

  flush() {
    while (this.queue.length > 0 && this.ws.readyState === WebSocket.OPEN) {
      const msg = this.queue.shift()
      if (msg) this.ws.send(msg)
    }
  }

  request(data, timeout = 5000) {
    const requestId = generateUUID() // unique ID
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(requestId)
        reject(new Error('Request timed out'))
      }, timeout)

      this.pending.set(requestId, (msg) => {
        clearTimeout(timer)
        resolve(msg)
      })

      this.send({ ...data, requestId })
    })
  }
  on(type, callback) {
    if (!this.listeners.has(type)) this.listeners.set(type, [])
    this.listeners.get(type).push(callback)
  }
}
