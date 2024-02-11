import { Controller, Get, Inject, Param } from '@nestjs/common';
import { template } from 'lodash';
import { PageAssetsModule } from './page-assets.module';

@Controller('page')
export class PageController {
  @Inject(PageAssetsModule)
  private pageAssetsModule: PageAssetsModule;

  @Get('plugin/:projectName/:pluginName')
  plugin(
    @Param('projectName') projectName: string,
    @Param('pluginName') pluginName: string,
  ) {
    const compiled = template(
      `
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>remote-plugin:{{pluginName}}</title>
    <script>
    var autoRunConfig = {
        mountedEl:"#app",
        packageName:"{{pluginName}}",
        projectName:"{{projectName}}"
    }
    </script>
    <script src="{{auto.jsUrl}}" data-config-var-name="autoRunConfig"></script>
    <link href="{{auto.cssUrl}}"></link>
</head>

<body>
    <div id="app"></div>
</body>

</html>
    `,
      {
        interpolate: /{{([\s\S]+?)}}/g,
      },
    );
    const entry = this.pageAssetsModule.getPluginAutoEntry(projectName);
    return compiled({
      pluginName,
      projectName,
      auto: {
        jsUrl: entry.js,
        cssUrl: entry.css,
      },
    });
  }
  @Get('dev/:projectName')
  dev(@Param('projectName') projectName: string) {
    const compiled = template(
      `
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>dev-page:{{projectName}}</title>
    <script>
    var autoRunConfig = {
        routerBase:"/page-servers",
        dev:true
    }
    </script>
    <script src="{{auto.jsUrl}}" data-config-var-name="autoRunConfig"></script>
    <link href="{{auto.cssUrl}}"></link>
</head>

<body>
    <div id="app"></div>
    {{ message }}
</body>

</html>
      `,
      {
        interpolate: /{{([\s\S]+?)}}/g,
      },
    );
    return compiled({
      message: 'Hello world!',
      projectName,
      auto: {
        jsUrl: `/page/asserts/${projectName}/dist/auto/index.js`,
        cssUrl: `/page/asserts/${projectName}/dist/auto/index.css`,
      },
    });
  }
  @Get('preview/:projectName/**')
  preview(@Param('projectName') projectName: string) {
    const compiled = template(
      `
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>dev-page:{{projectName}}</title>
    <script>
    var autoRunConfig = {
        loadSchemaConfig:{
          depsEntryList: {
            jsUrl: "{{deps.jsUrl}}",
            cssUrl: "{{deps.cssUrl}}"
          },
          schemaEntryList: {
            jsUrl: "{{schema.jsUrl}}",
            cssUrl: "{{schema.cssUrl}}"
          }
        },
        onSucess(schemaModules){
          const { mountApp } = schemaModules;
          mountApp({
            routerBase:"/page/preview/{{projectName}}",
            contaienr:"#app"
          })
          debugger;
          console.log("schemaModules",schemaModules)
        },
        onFail(error){
          console.log("error",error)
        }
    }
    </script>
    <script src="{{auto.jsUrl}}" data-config-var-name="autoRunConfig"></script>
    <link href="{{auto.cssUrl}}"></link>
</head>

<body>
    <div id="app"></div>
</body>

</html>
      `,
      {
        interpolate: /{{([\s\S]+?)}}/g,
      },
    );
    const devEntry = this.pageAssetsModule.getDevEntry(projectName);
    return compiled({
      projectName,
      auto: {
        jsUrl: devEntry.auto.js,
        cssUrl: devEntry.auto.css,
      },
      deps: {
        jsUrl: devEntry.deps.js,
        cssUrl: devEntry.deps.css,
      },
      schema: {
        jsUrl: devEntry.schema.js,
        cssUrl: devEntry.schema.css,
      },
    });
  }
}
