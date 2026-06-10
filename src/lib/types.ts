// Minimal slice of the shared Directus schema that poppim-web reads.
// Backend collections live in the `directus` repo (pm-system/apply-schema.mjs).

export interface Stage {
  id: string
  name: string
  stage_order: number | null
  category: string | null
  business_unit: string | null
}

export interface Retailer {
  id: string
  name: string
}

export interface Product {
  id: string
  code: string | null
  name: string | null
  business_unit: string | null
  stage: string | Stage | null
  retailer: string | Retailer | null
  on_shelf_date: string | null
  pi_status: string | null
}

export interface DirectusUser {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  avatar: string | null
  role: { id: string; name: string } | null
}

export interface Schema {
  product: Product[]
  stage: Stage[]
  retailer: Retailer[]
}
