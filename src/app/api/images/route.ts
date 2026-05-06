import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.bradsingley.com'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const treeId = formData.get('tree_id') as string | null
  const caption = formData.get('caption') as string | null
  const angle = formData.get('angle') as string | null
  const takenAt = formData.get('taken_at') as string | null

  if (!file || !treeId) {
    return NextResponse.json({ error: 'file and tree_id are required' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `File type not allowed. Accepted: ${ALLOWED_TYPES.join(', ')}` },
      { status: 400 },
    )
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File size must be under 10 MB' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join('; ')

  // 1. Get a signed upload URL from lab-api
  const uploadUrlRes = await fetch(`${API_BASE}/treefolio/upload-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({ treeId, filename: file.name, contentType: file.type }),
  })

  if (!uploadUrlRes.ok) {
    const text = await uploadUrlRes.text()
    return NextResponse.json({ error: `Failed to get upload URL: ${text}` }, { status: 502 })
  }

  const { uploadUrl, storagePath } = await uploadUrlRes.json()

  // 2. Upload directly to Azure Blob via the SAS URL
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'x-ms-blob-type': 'BlockBlob',
      'Content-Type': file.type,
    },
    body: file,
  })

  if (!uploadRes.ok) {
    return NextResponse.json({ error: 'Upload to storage failed' }, { status: 502 })
  }

  // 3. Create the image record in the database via lab-api
  const imageRes = await fetch(`${API_BASE}/treefolio/trees/${treeId}/images`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({
      url: storagePath,
      caption: caption || null,
      angle: angle || null,
      takenAt: takenAt ? (takenAt.length === 7 ? takenAt + '-01' : takenAt) : null,
    }),
  })

  if (!imageRes.ok) {
    return NextResponse.json({ error: 'Failed to save image record' }, { status: 500 })
  }

  const imageData = await imageRes.json()

  revalidatePath('/')
  revalidatePath(`/tree/${treeId}`)

  return NextResponse.json({ image: imageData.image }, { status: 201 })
}
