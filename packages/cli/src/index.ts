import { program } from 'commander'
import { version, description } from '../package.json'
import build from './build'

program.name('vue-cook-cli').description(description).version(version)

program
  .command('build')
  .description('构建命令')
  .option('-c,--config <string>', '配置文件路径')
  .action(options => {
    const { config = '' } = options
    build({
      configPath: config
    })
  })

program.parse()
