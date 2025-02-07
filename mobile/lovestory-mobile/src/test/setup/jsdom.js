const { TextEncoder, TextDecoder } = require('node:util');
const { ReadableStream } = require('node:stream/web');
const { Response, Request, Headers, fetch } = require('node-fetch');

class BroadcastChannel {
  constructor(channel) {
    this.channel = channel;
  }
  postMessage(message) {}
  close() {}
}

Object.defineProperties(globalThis, {
  TextEncoder: { value: TextEncoder },
  TextDecoder: { value: TextDecoder },
  ReadableStream: { value: ReadableStream },
  Response: { value: Response },
  Request: { value: Request },
  Headers: { value: Headers },
  fetch: { value: fetch },
  BroadcastChannel: { value: BroadcastChannel }
}); 