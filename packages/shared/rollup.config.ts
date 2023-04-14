import { fileURLToPath } from 'node:url'
import { getRollupCommonLibBuildConfig } from '@vue-cook/scripts'
import { defineConfig } from 'rollup'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const config = getRollupCommonLibBuildConfig({ __dirname })
export default defineConfig({
  ...config
})
