import { useEffect, useState } from 'react'
import type { MouseEvent } from 'react'
import { Paperclip } from 'lucide-react'
import { listProductFiles } from '@/features/board/collab'
import { reportOptionalDataError } from '@/lib/uiError'
import type { ProductFile } from '@/lib/types'
import { fileSize, formatDate } from './formatters'

function fileHref(file: ProductFile): string | null {
  return file.stored_url || file.source_url || null
}

function filePreviewUrl(file: ProductFile): string | null {
  if (file.thumbnail_url?.includes('digitaloceanspaces.com')) return file.thumbnail_url
  if (file.mime_type?.startsWith('image/') && file.stored_url) return file.stored_url
  if (file.thumbnail_url) return file.thumbnail_url
  if (file.mime_type?.startsWith('image/')) return fileHref(file)
  return null
}

type FileInteractionProps = {
  onLightbox: (url: string) => void
  onContextMenu: (event: MouseEvent, coverUrl: string | null, previewUrl: string | null) => void
}

function useProductFiles(productId: string, label: string) {
  const [files, setFiles] = useState<ProductFile[]>([])
  useEffect(() => {
    let current = true
    listProductFiles(productId)
      .then((rows) => { if (current) setFiles(rows) })
      .catch((error) => reportOptionalDataError(`productDetail.load${label}`, label, error))
    return () => { current = false }
  }, [label, productId])
  return files
}

export function AttachmentGallery({ productId, fallbackCoverUrl, onCoverError, onLightbox, onContextMenu }: FileInteractionProps & {
  productId: string
  fallbackCoverUrl?: string
  onCoverError: () => void
}) {
  const files = useProductFiles(productId, 'Attachments')
  const previewFiles = files.filter(filePreviewUrl)
  if (previewFiles.length === 0 && !fallbackCoverUrl) return null
  return (
    <div className="grid grid-cols-2 gap-3 px-6 pt-5">
      {previewFiles.length > 0 ? previewFiles.map((file) => {
        const href = fileHref(file)
        const preview = filePreviewUrl(file)
        return (
          <div key={file.id} className="group cursor-pointer overflow-hidden rounded-xl border" style={{ borderColor: '#EAEEF5', background: '#F6F8FC' }} onClick={() => preview && onLightbox(preview)} onContextMenu={(event) => onContextMenu(event, href, preview)}>
            <img src={preview || ''} alt="" className="h-48 w-full object-contain transition-transform group-hover:scale-[1.02]" />
            <div className="border-t px-3 py-2" style={{ borderColor: '#EAEEF5', background: '#fff' }}>
              <div className="truncate text-[12.5px] font-semibold" style={{ color: '#1B2840' }}>{file.title || 'Untitled file'}</div>
            </div>
          </div>
        )
      }) : <img src={fallbackCoverUrl} alt="" className="col-span-2 max-h-[420px] w-full cursor-pointer rounded-xl object-contain transition-transform hover:scale-[1.01]" style={{ background: '#F6F8FC' }} onError={onCoverError} onClick={() => fallbackCoverUrl && onLightbox(fallbackCoverUrl)} onContextMenu={(event) => onContextMenu(event, fallbackCoverUrl ?? null, fallbackCoverUrl ?? null)} />}
    </div>
  )
}

export function FilesPane({ productId, onLightbox, onContextMenu }: FileInteractionProps & { productId: string }) {
  const files = useProductFiles(productId, 'Files')
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      {files.length === 0 && <p className="text-[13px]" style={{ color: '#94A0B5' }}>No files yet.</p>}
      <div className="space-y-2">
        {files.map((file) => {
          const href = fileHref(file)
          const preview = filePreviewUrl(file)
          const inner = <>
            {preview ? <img src={preview} alt="" className="size-14 shrink-0 rounded-lg object-cover" style={{ background: '#F6F8FC' }} /> : <div className="flex size-9 shrink-0 items-center justify-center rounded-lg" style={{ background: '#F6F8FC', color: '#5A6883' }}><Paperclip className="size-4" /></div>}
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold" style={{ color: '#1B2840' }}>{file.title || 'Untitled file'}</div>
              <div className="mt-0.5 text-[12px]" style={{ color: '#94A0B5' }}>{[file.file_type?.toUpperCase(), fileSize(file.size), formatDate(file.uploaded_at)].filter(Boolean).join(' · ')}</div>
            </div>
          </>
          if (preview) return <div key={file.id} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors hover:bg-[#F6F8FC]" style={{ borderColor: '#EAEEF5' }} onClick={() => onLightbox(preview)} onContextMenu={(event) => onContextMenu(event, href, preview)}>{inner}</div>
          return <a key={file.id} href={href || undefined} target="_blank" rel="noreferrer" className="flex min-h-14 items-center gap-3 rounded-lg border px-3 py-2 transition-colors hover:bg-[#F6F8FC]" style={{ borderColor: '#EAEEF5' }}>{inner}</a>
        })}
      </div>
    </div>
  )
}
