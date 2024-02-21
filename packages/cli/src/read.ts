import { program } from 'commander'
import { version, description } from '../package.json'
import buildDeps from './command/build-deps'
import buildSchema from './command/build-schema'
import buildAuto from './command/build-auto'
import buildDesign from './command/build-design'
import buildRuntime from './command/build-runtime'
import buildDev from './command/build-dev'
import transformToCode from './command/transform-code'

export const read = () => {
  program.name('vue-cook-cli').description(description).version(version)

  program
    .command('build-dev')
    .description('构建命令')
    .option('-c,--config <string>', 'cook.config.json配置文件路径')
    .option('-p,--pkgJson <string>', 'package.json文件路径')
    .action((options) => {
      const { config = '', pkgJson = '' } = options
      buildDev({
        configPath: config,
        pkgJsonPath: pkgJson
      })
    })
  program
    .command('transform-to-code')
    .description('构建命令')
    .option('-c,--config <string>', 'cook.config.json配置文件路径')
    .option('-p,--pkgJson <string>', 'package.json文件路径')
    .action((options) => {
      const { config = '', pkgJson = '' } = options
      transformToCode({
        configPath: config,
        pkgJsonPath: pkgJson
      })
    })
  program
    .command('build-deps')
    .description('构建命令')
    .option('-c,--config <string>', 'cook.config.json配置文件路径')
    .option('-p,--pkgJson <string>', 'package.json文件路径')
    .option('-d,--dirname <string>', 'dirname路径')
    .action((options) => {
      const { config = '', pkgJson = '', dirname = '' } = options
      buildDeps({
        configPath: config,
        pkgJsonPath: pkgJson,
        __dirname: dirname
      })
    })

  program
    .command('build-design')
    .description('构建命令')
    .option('-c,--config <string>', 'cook.config.json配置文件路径')
    .option('-p,--pkgJson <string>', 'package.json文件路径')
    .action((options) => {
      const { config = '', pkgJson = '' } = options
      buildDesign({
        configPath: config,
        pkgJsonPath: pkgJson
      })
    })

  program
    .command('build-runtime')
    .description('构建命令')
    .option('-c,--config <string>', 'cook.config.json配置文件路径')
    .option('-p,--pkgJson <string>', 'package.json文件路径')
    .action((options) => {
      const { config = '', pkgJson = '' } = options
      buildRuntime({
        configPath: config,
        pkgJsonPath: pkgJson
      })
    })
  program
    .command('build-schema')
    .description('构建命令')
    .option('-c,--config <string>', 'cook.config.json配置文件路径')
    .option('-p,--pkgJson <string>', 'package.json文件路径')
    .option('-d,--dirname <string>', 'dirname路径')
    .action((options) => {
      const { config = '', pkgJson = '', dirname = '' } = options
      buildSchema({
        configPath: config,
        pkgJsonPath: pkgJson,
        __dirname: dirname
      })
    })

  program
    .command('build-auto')
    .description('构建命令')
    .option('-c,--config <string>', 'cook.config.json配置文件路径')
    .option('-p,--pkgJson <string>', 'package.json文件路径')
    .option('-d,--dirname <string>', 'dirname路径')
    .action((options) => {
      const { config = '', pkgJson = '', dirname = '' } = options
      buildAuto({
        configPath: config
      })
    })

  program.parse()
}
