import { http, HttpResponse } from 'msw'
import { setupWorker } from 'msw'
import { ApiErrorCode } from '../../types/api/common'
import { createMockUser, createMockTemplate, createMockVideo, createMockVideoSegment } from './factories'

// Define handlers
const handlers = [
  // Auth handlers
  http.post('*/auth/login', () => {
    return HttpResponse.json({
      data: {
        user: createMockUser(),
        token: 'mock-token'
      }
    })
  }),

  // Template handlers
  http.get('*/templates', () => {
    return HttpResponse.json({
      data: [createMockTemplate()]
    })
  }),

  // Video handlers
  http.get('*/videos', () => {
    return HttpResponse.json({
      data: [createMockVideo()]
    })
  }),

  http.get('*/videos/:id/segments', () => {
    return HttpResponse.json({
      data: [createMockVideoSegment()]
    })
  })
]

// Create and export worker
export const worker = setupWorker(...handlers)

// Start worker if in browser environment
if (typeof window !== 'undefined') {
  worker.start()
}