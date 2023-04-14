import { fileURLToPath } from 'node:url'
import { getRollupCommonLibBuildConfig } from './src/utils/rollupCommonConfig'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default getRollupCommonLibBuildConfig({ __dirname })
