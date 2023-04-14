import { fileURLToPath } from 'url'
import { getRollupCommonDtsBuildConfig } from '@vue-cook/scripts'
import { defineConfig } from 'rollup'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const config = getRollupCommonDtsBuildConfig({ __dirname })
export default defineConfig({
  ...config
})
