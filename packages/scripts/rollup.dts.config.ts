import { fileURLToPath } from 'url'
import { getRollupCommonDtsBuildConfig } from './src/utils/rollupCommonConfig'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default getRollupCommonDtsBuildConfig({ __dirname })
