import { api } from '../api/client'
import type { ActivityEvent, Dashboard, ListActivityParams } from '../api/types'

export const activityService = {
  /** Newest first. For the next page pass the last event's `createdAt` as `before`. */
  list(params: ListActivityParams = {}) {
    return api.get<ActivityEvent[]>('/activity', { params })
  },

  getDashboard() {
    return api.get<Dashboard>('/dashboard')
  },
}
