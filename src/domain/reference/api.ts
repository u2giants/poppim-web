import { readItems } from '@directus/sdk'
import { directus } from '@/lib/directus'
import type { Licensor, Retailer, Stage } from '@/lib/types'

export async function fetchLicensors(): Promise<Licensor[]> {
  return directus.request(
    readItems('licensor', {
      fields: ['id', 'name', 'turnaround_days_min', 'turnaround_days_max', 'requires_pi', 'prohibits_resale'],
      sort: ['name'],
      limit: -1,
    }),
  ) as Promise<Licensor[]>
}

export async function fetchRetailers(): Promise<Retailer[]> {
  return directus.request(
    readItems('retailer', {
      fields: ['id', 'name', 'resale_restriction', 'notes'],
      sort: ['name'],
      limit: -1,
    }),
  ) as Promise<Retailer[]>
}

export async function fetchStages(): Promise<Stage[]> {
  return directus.request(
    readItems('stage', { sort: ['stage_order'], limit: -1 }),
  ) as Promise<Stage[]>
}

