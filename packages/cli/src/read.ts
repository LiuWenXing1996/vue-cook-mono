import { program } from 'commander'
import { version, description } from '../package.json'
import buildDeps from './command/build-deps'
import buildSchema from './command/build-schema'

export const read = () => {
  program.name('vue-cook-cli').description(description).version(version)

  program
    .command('build-deps')
    .description('构建命令')
    .option('-c,--config <string>', 'cook.config.json配置文件路径')
    .option('-p,--pkgJson <string>', 'package.json文件路径')
    .option('-d,--dirname <string>', 'dirname路径')
    .action(options => {
      const { config = '', pkgJson = '', dirname = '' } = options
      buildDeps({
        configPath: config,
        pkgJsonPath: pkgJson,
        __dirname: dirname
      })
    })

  program
    .command('build-schema')
    .description('构建命令')
    .option('-c,--config <string>', 'cook.config.json配置文件路径')
    .option('-p,--pkgJson <string>', 'package.json文件路径')
    .option('-d,--dirname <string>', 'dirname路径')
    .action(options => {
      const { config = '', pkgJson = '', dirname = '' } = options
      buildSchema({
        configPath: config,
        pkgJsonPath: pkgJson,
        __dirname: dirname
      })
    })

  program.parse()
}
