import { api, asDynamic } from '@/lib/supabaseQuery'
import { unwrap } from '@/lib/supabaseQuery'
import type { PmReminder, Product, RevisionRequest } from '@/lib/types'
import { enrichProductRowsWithBoardFields } from '@/domain/products/enrich'
import { supabaseProductToProduct, type SupabaseProductRow } from '@/domain/products/supabaseAdapter'
import type { BusinessUnit } from '@/domain/products/types'

export async function fetchMyWorkPage(userId:string,roleId:string|null,businessUnit:BusinessUnit,cursor?:string|null):Promise<{products:Product[];nextCursor:string|null}> {
  void userId // the RPC derives the signed-in profile; never accepts another user's id
  const after=cursor?JSON.parse(atob(cursor)) as {updatedAt:string;id:string}:null
  const { data, error } = await asDynamic(api()).rpc('pm_my_work_page', {
    p_business_unit: businessUnit,
    p_role_id: roleId,
    p_after_updated_at: after?.updatedAt??null,
    p_after_id: after?.id??null,
    p_limit: 101,
  })
  const raw=unwrap<SupabaseProductRow[]>({data,error}),visible=raw.slice(0,100)
  const rows=await enrichProductRowsWithBoardFields(visible)
  const last=visible.at(-1)
  return {products:rows.map((row)=>supabaseProductToProduct(row)),nextCursor:raw.length>100&&last?btoa(JSON.stringify({updatedAt:last.updated_at,id:last.id})):null}
}
export async function fetchMyWorkProducts(userId:string,roleId:string|null,businessUnit:BusinessUnit):Promise<Product[]>{return(await fetchMyWorkPage(userId,roleId,businessUnit)).products}

export async function fetchMyRevisionWork(userId: string,businessUnit:BusinessUnit): Promise<RevisionRequest[]> {
  void userId
  const {data,error}=await asDynamic(api()).rpc('pm_my_revision_page',{p_business_unit:businessUnit,p_limit:100})
  return unwrap<RevisionRequest[]>({data,error})
}

export async function fetchMyReminders(userId: string,businessUnit:BusinessUnit): Promise<PmReminder[]> {
  void userId
  const {data,error}=await asDynamic(api()).rpc('pm_my_reminder_page',{p_business_unit:businessUnit,p_limit:100})
  return unwrap<PmReminder[]>({ data, error })
}
