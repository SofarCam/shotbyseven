import sharp from 'sharp'
import { readdir, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const INPUT_DIR = './public/photos'
const OUTPUT_DIR = './public/photos/webp'
const QUALITY = 82

async function run() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true })
  }

  const files = await readdir(INPUT_DIR)
  const images = files.filter(f => /\.(jpg|jpeg|JPG|JPEG|png|PNG)$/.test(f))

  console.log(`Converting ${images.length} images to WebP...`)

  let saved = 0
  for (const file of images) {
    const input = path.join(INPUT_DIR, file)
    const outputName = file.replace(/\.(jpg|jpeg|JPG|JPEG|png|PNG)$/, '.webp')
    const output = path.join(OUTPUT_DIR, outputName)

    if (existsSync(output)) {
      process.stdout.write('.')
      continue
    }

    try {
      const info = await sharp(input)
        .webp({ quality: QUALITY })
        .toFile(output)
      saved++
      process.stdout.write('✓')
    } catch (e) {
      process.stdout.write('✗')
    }
  }

  console.log(`\nDone! Converted ${saved} new images.`)

  // Show size comparison
  const { execSync } = await import('child_process')
  const origSize = execSync(`du -sh ${INPUT_DIR}/*.{jpg,JPG,jpeg,JPEG} 2>/dev/null | awk '{sum += $1} END {print sum}'`).toString().trim()
  const webpSize = execSync(`du -sh ${OUTPUT_DIR} 2>/dev/null | awk '{print $1}'`).toString().trim()
  console.log(`Original: ~37MB → WebP folder: ${webpSize}`)
}

run().catch(console.error)
