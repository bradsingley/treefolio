import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
const BUCKET = 'treefolio'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const treeId = formData.get('tree_id') as string | null
  const caption = formData.get('caption') as string | null
  const angle = formData.get('angle') as string | null
  const takenAt = formData.get('taken_at') as string | null

  if (!file || !treeId) {
    return NextResponse.json(
      { error: 'file and tree_id are required' },
      { status: 400 },
    )
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `File type not allowed. Accepted: ${ALLOWED_TYPES.join(', ')}` },
      { status: 400 },
    )
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'File size must be under 10 MB' },
      { status: 400 },
    )
  }

  // Generate a unique path: treeId/timestamp-filename
  const ext = file.name.split('.').pop() ?? 'jpg'
  const fileName = `${treeId}/${Date.now()}.${ext}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json(
      { error: `Upload failed: ${uploadError.message}` },
      { status: 502 },
    )
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(fileName)

  // Store metadata in tf_tree_images
  const { data: image, error: dbError } = await supabase
    .from('tf_tree_images')
    .insert({
      tree_id: treeId,
      url: urlData.publicUrl,
      caption: caption || null,
      angle: angle || null,
      taken_at: takenAt || null,
    })
    .select()
    .single()

  if (dbError) {
    // Clean up the uploaded file if DB insert fails
    await supabase.storage.from(BUCKET).remove([fileName])
    return NextResponse.json(
      { error: `Failed to save image record: ${dbError.message}` },
      { status: 500 },
    )
  }

  revalidatePath('/')
  revalidatePath(`/tree/${treeId}`)

  return NextResponse.json({ image }, { status: 201 })
}
