import { defineConfig } from 'rollup'
import path from 'node:path'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  input: path.resolve(__dirname, 'src/index.ts'),
  plugins: [
    typescript({
      tsconfig: path.resolve(__dirname, 'tsconfig.json')
    }),
    json()
  ],
  output: {
    file: path.resolve(__dirname, 'dist', 'cli.js'),
    sourcemap: true,
    sourcemapPathTransform (relativeSourcePath) {
      return path.basename(relativeSourcePath)
    },
    sourcemapIgnoreList () {
      return true
    }
  }
})
