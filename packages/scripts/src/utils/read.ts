import { program } from 'commander'
import { version, description } from '../../package.json'
import { build } from '../command/build'
import { dev } from '../command/dev'
import { clean } from '../command/clean'

export const read = () => {
  program.name('vue-cook-cli').description(description).version(version)

  program
    .command('build')
    .description('构建命令')
    .action(() => {
      build()
    })

  program
    .command('dev')
    .description('开发命令，将会启动多个watch服务')
    .action(() => {
      dev()
    })

  program
    .command('clean')
    .description('清除构建产物')
    .option('--libName <string>', '库名称')
    .action(() => {
      clean()
    })

  program.parse()
}
