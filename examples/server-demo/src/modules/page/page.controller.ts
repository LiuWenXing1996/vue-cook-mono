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
  @Get('preview/:projectName')
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
        onContextCreated(context){
          console.log("context",context)
        },
        // TODO:先暂时使用design的auto来预览，后面会换成runtime的auto
        mainViewFilePath:"/src/pages/foo/view.json",
        mountElementId:"#app"
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
    const autoEntry = this.pageAssetsModule.getDesignAutoEntry(projectName);
    return compiled({
      projectName,
      auto: {
        jsUrl: autoEntry.js,
        cssUrl: autoEntry.css,
      },
    });
  }
}
