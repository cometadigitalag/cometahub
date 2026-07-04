// Upload de fotos de perfil para o S3 (servido via CloudFront app.cometahub.com/fotos/).
// Na AWS (ECS) usa a role da task; localmente usa o perfil default do AWS CLI.
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const REGION = process.env.AWS_REGION || 'us-east-1'
const BUCKET = process.env.PHOTO_BUCKET || 'app.cometahub.com'
const URL_BASE = process.env.PHOTO_URL_BASE || 'https://app.cometahub.com'
const PREFIX = 'fotos'

const client = new S3Client({ region: REGION })

const EXT = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export function isImage(mimetype) {
  return !!EXT[mimetype]
}

// Sobe o buffer da imagem e devolve a URL pública (CloudFront).
export async function uploadPhoto(userId, buffer, mimetype, stamp) {
  const ext = EXT[mimetype] || 'jpg'
  // Chave versionada (stamp) para invalidar cache do CloudFront ao trocar a foto.
  const key = `${PREFIX}/${userId}-${stamp}.${ext}`
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      CacheControl: 'public,max-age=31536000,immutable',
    }),
  )
  return `${URL_BASE}/${key}`
}
