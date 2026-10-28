import fs from 'fs/promises'
import path from 'path'

const STATIC_DIR = 'listing-images'

export async function removeFilesByFilenames(filenames: string[]): Promise<void> {
  for (const name of filenames) {
    const filePath = path.resolve(process.cwd(), STATIC_DIR, name)
    try {
      await fs.unlink(filePath)
    } catch {}
  }
}
