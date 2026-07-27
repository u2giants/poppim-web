import { api, asDynamic } from '@/lib/supabaseQuery'
import type { BusinessUnit } from '@/domain/products/types'
import { unwrap } from '@/lib/supabaseQuery'
import type { Order } from '@/lib/types'

export interface FetchOrdersOpts { search?: string; businessUnit?: BusinessUnit; limit?: number }
interface OrderRow { id:string;order_number:string|null;order_date:string|null;company_id:string|null;product_id:string|null;metadata:{quantity?:number|null};updated_at:string }

export async function fetchOrderPage(opts: FetchOrdersOpts & {cursor?:string|null} = {}): Promise<{orders:Order[];nextCursor:string|null}> {
  if (!opts.businessUnit || opts.businessUnit === 'Unknown') throw new Error('Choose a department before loading orders.')
  const limit=opts.limit??100
  const after=opts.cursor?JSON.parse(atob(opts.cursor)) as {updatedAt:string;id:string}:null
  const { data, error } = await asDynamic(api()).rpc('pm_order_page', {
    p_business_unit: opts.businessUnit, p_search: opts.search?.trim() || null,
    p_after_updated_at: after?.updatedAt??null, p_after_id: after?.id??null, p_limit: limit+1,
  })
  const raw=unwrap<OrderRow[]>({data,error}),visible=raw.slice(0,limit)
  const orders=visible.map((row) => ({
    id:row.id,order_number:row.order_number,order_date:row.order_date,quantity:row.metadata?.quantity ?? null,
    retailer:row.company_id,buyer:null,product:row.product_id,
  })) as Order[]
  const last=visible.at(-1)
  return {orders,nextCursor:raw.length>limit&&last?btoa(JSON.stringify({updatedAt:last.updated_at,id:last.id})):null}
}
export async function fetchOrders(opts:FetchOrdersOpts={}):Promise<Order[]>{return(await fetchOrderPage(opts)).orders}
