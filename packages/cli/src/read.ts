import { program } from 'commander'
import { version, description } from '../package.json'
import dev from './dev'
import build from './command/build'

export const read = () => {
  program.name('vue-cook-cli').description(description).version(version)

  program
    .command('build')
    .description('构建命令')
    .option('-c,--config <string>', 'cook.config.json配置文件路径')
    .option('-p,--pkgJson <string>', 'package.json文件路径')
    .action(options => {
      const { config = '', pkgJson = '' } = options
      build({
        configPath: config,
        pkgJsonPath: pkgJson
      })
    })

  program
    .command('dev')
    .description('开发命令')
    .option('-c,--config <string>', '配置文件路径')
    .action(options => {
      const { config = '' } = options
      dev({
        configPath: config
      })
    })

  program.parse()
}
