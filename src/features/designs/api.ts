import { api, asDynamic } from '@/lib/supabaseQuery'
import type { BusinessUnit } from '@/domain/products/types'
import { unwrap } from '@/lib/supabaseQuery'
import type { Design, DesignCollection } from '@/lib/types'

export interface FetchDesignOpts { search?:string;businessUnit?:BusinessUnit;limit?:number;cursor?:string|null }
interface DesignRow {id:string;title:string;status:string|null;nas_path:string|null;thumbnail_url:string|null;metadata:Record<string,unknown>;updated_at:string;product_count:number}
interface CollectionRow {id:string;name:string;season:string|null;status:string|null;company_id:string|null;metadata:Record<string,unknown>;updated_at:string;project_count:number}
function unit(value?:BusinessUnit){if(!value||value==='Unknown')throw new Error('Choose a department before loading designs.');return value}
function after(cursor?:string|null){return cursor?JSON.parse(atob(cursor)) as {updatedAt:string;id:string}:null}
function cursor(raw:{updated_at:string;id:string}[],limit:number){const last=raw.slice(0,limit).at(-1);return raw.length>limit&&last?btoa(JSON.stringify({updatedAt:last.updated_at,id:last.id})):null}

export async function fetchDesignPage(opts:FetchDesignOpts={}){
  const limit=opts.limit??100,a=after(opts.cursor)
  const {data,error}=await asDynamic(api()).rpc('pm_design_page',{p_business_unit:unit(opts.businessUnit),p_search:opts.search?.trim()||null,p_after_updated_at:a?.updatedAt??null,p_after_id:a?.id??null,p_limit:limit+1})
  const raw=unwrap<DesignRow[]>({data,error}),visible=raw.slice(0,limit)
  return {designs:visible.map((row):Design=>({id:row.id,name:row.title,business_unit:String(row.metadata.business_unit??'')||null,status:row.status,theme:String(row.metadata.theme??'')||null,nas_path:row.nas_path,thumbnail_url:row.thumbnail_url,licensor:null,property:null,product_type:null,season:null,first_offered_to:null})),counts:new Map(visible.map(row=>[row.id,Number(row.product_count)])),nextCursor:cursor(raw,limit)}
}
export async function fetchCollectionPage(opts:FetchDesignOpts={}){
  const limit=opts.limit??100,a=after(opts.cursor)
  const {data,error}=await asDynamic(api()).rpc('pm_design_collection_page',{p_business_unit:unit(opts.businessUnit),p_search:opts.search?.trim()||null,p_after_updated_at:a?.updatedAt??null,p_after_id:a?.id??null,p_limit:limit+1})
  const raw=unwrap<CollectionRow[]>({data,error}),visible=raw.slice(0,limit)
  return {collections:visible.map((row):DesignCollection=>({id:row.id,name:row.name,format:String(row.metadata.format??'')||null,theme:String(row.metadata.theme??'')||null,business_unit:String(row.metadata.business_unit??'')||null,version_date:row.updated_at,account_specific_for:row.company_id})),counts:new Map(visible.map(row=>[row.id,Number(row.project_count)])),nextCursor:cursor(raw,limit)}
}
export async function fetchDesigns(opts:FetchDesignOpts={}):Promise<Design[]>{return(await fetchDesignPage(opts)).designs}
export async function fetchDesignCollections(opts:FetchDesignOpts={}):Promise<DesignCollection[]>{return(await fetchCollectionPage(opts)).collections}
export async function fetchProductCountsByDesign(opts:FetchDesignOpts={}):Promise<Map<string,number>>{return(await fetchDesignPage(opts)).counts}
export async function fetchProjectCountsByDesignCollection(opts:FetchDesignOpts={}):Promise<Map<string,number>>{return(await fetchCollectionPage(opts)).counts}
