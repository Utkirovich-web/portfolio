/**
 * Generates the favicon set and the Open Graph image from SVG sources.
 *
 *   npm run generate:icons
 *
 * Outputs (committed to /public):
 *   favicon.ico (16/32/48), apple-touch-icon.png, icon-192.png, icon-512.png,
 *   icon-maskable-512.png, og-image.png (1200x630)
 */
import { readFile, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const PUBLIC_DIR = new URL('../public/', import.meta.url)

// "SA" monogram strokes in a 64x64 box (same paths as src/components/LogoMark.vue)
const S_PATH =
  'M29.5 23.5C28 20.6 25.4 19 21.8 19 17.3 19 14 21.4 14 25.2c0 3.8 3.2 5.4 7.9 6.5 5 1.2 8.1 3 8.1 6.9 0 4-3.4 6.4-8.1 6.4-4 0-7-1.7-8.5-4.7'
const A_PATH = 'M34.5 45 43 19l8.5 26M37.6 36h10.8'

const BG = '#06141B'
const GRADIENT = `
  <linearGradient id="sa" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#5EEAD4"/>
    <stop offset="1" stop-color="#A78BFA"/>
  </linearGradient>`

/** Full-bleed square icon; `scale` shrinks the glyph to keep it inside the maskable safe zone. */
function squareIcon(scale = 1) {
  const offset = 32 - 32 * scale
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs>${GRADIENT}</defs>
    <rect width="64" height="64" fill="${BG}"/>
    <g transform="translate(${offset} ${offset}) scale(${scale})" fill="none" stroke="url(#sa)"
       stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <path d="${S_PATH}"/><path d="${A_PATH}"/>
    </g>
  </svg>`
}

function ogImage() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      ${GRADIENT}
      <radialGradient id="g1" cx="0.85" cy="0.1" r="0.6">
        <stop offset="0" stop-color="#2DD4BF" stop-opacity="0.45"/>
        <stop offset="1" stop-color="#2DD4BF" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="g2" cx="0.15" cy="1" r="0.6">
        <stop offset="0" stop-color="#A78BFA" stop-opacity="0.35"/>
        <stop offset="1" stop-color="#A78BFA" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="g3" cx="0.55" cy="0.65" r="0.45">
        <stop offset="0" stop-color="#34D399" stop-opacity="0.18"/>
        <stop offset="1" stop-color="#34D399" stop-opacity="0"/>
      </radialGradient>
      <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M48 0H0V48" fill="none" stroke="#5EEAD4" stroke-opacity="0.07"/>
      </pattern>
      <linearGradient id="title" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#E6F4F1"/>
        <stop offset="0.55" stop-color="#2DD4BF"/>
        <stop offset="1" stop-color="#A78BFA"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="${BG}"/>
    <rect width="1200" height="630" fill="url(#grid)"/>
    <rect width="1200" height="630" fill="url(#g1)"/>
    <rect width="1200" height="630" fill="url(#g2)"/>
    <rect width="1200" height="630" fill="url(#g3)"/>

    <g transform="translate(88 88)">
      <rect width="88" height="88" rx="20" fill="#0B1F27" stroke="#5EEAD4" stroke-opacity="0.25"/>
      <g transform="translate(4 4) scale(1.25)" fill="none" stroke="url(#sa)" stroke-width="4.5"
         stroke-linecap="round" stroke-linejoin="round">
        <path d="${S_PATH}"/><path d="${A_PATH}"/>
      </g>
    </g>

    <g font-family="Inter, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
      <rect x="88" y="232" width="222" height="44" rx="22" fill="#5EEAD4" fill-opacity="0.08" stroke="#5EEAD4" stroke-opacity="0.25"/>
      <circle cx="114" cy="254" r="6" fill="#34D399"/>
      <text x="132" y="261" font-size="20" font-weight="600" fill="#C3DDD8">Open to offers</text>

      <text x="84" y="378" font-size="84" font-weight="800" letter-spacing="-3" fill="#E6F4F1">Shohjahon</text>
      <text x="84" y="470" font-size="84" font-weight="800" letter-spacing="-3" fill="url(#title)">Abdusamadov</text>
      <text x="88" y="540" font-size="30" font-weight="500" fill="#8FB5AE">Frontend Developer · Vue 3 · TypeScript · Tashkent</text>
    </g>
  </svg>`
}

/** Packs PNG buffers into a .ico container (PNG-compressed entries are valid since Windows Vista). */
function toIco(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)
  let offset = 6 + images.length * 16
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0)
    entry.writeUInt8(size >= 256 ? 0 : size, 1)
    entry.writeUInt8(0, 2)
    entry.writeUInt8(0, 3)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(data.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += data.length
    return entry
  })
  return Buffer.concat([header, ...entries, ...images.map((image) => image.data)])
}

const png = (svg, size) =>
  sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer()

async function main() {
  const favicon = await readFile(new URL('favicon.svg', PUBLIC_DIR), 'utf8')
  const square = squareIcon(1)
  const maskable = squareIcon(0.72)

  const icoImages = await Promise.all(
    [16, 32, 48].map(async (size) => ({ size, data: await png(favicon, size) })),
  )

  const outputs = {
    'favicon.ico': toIco(icoImages),
    'apple-touch-icon.png': await png(square, 180),
    'icon-192.png': await png(favicon, 192),
    'icon-512.png': await png(favicon, 512),
    'icon-maskable-512.png': await png(maskable, 512),
    'og-image.png': await sharp(Buffer.from(ogImage())).png({ compressionLevel: 9 }).toBuffer(),
  }

  for (const [name, data] of Object.entries(outputs)) {
    await writeFile(new URL(name, PUBLIC_DIR), data)
    console.log(`✓ public/${name} (${(data.length / 1024).toFixed(1)} KB)`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
