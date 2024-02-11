import { loadScript } from './loadScript'
import { v4 as uuidv4 } from 'uuid'

const moduleMap = new Map<string, any>()
export const CjsWrapperHelperGetterIdKey = 'cjsWrapperHelperGetterId'
export const cjsWrapperLoadWrapperJs = async <T = any>(params: {
  url: string
  modules?: {
    [name: string]: any
  }
}) => {
  const { url, modules = {} } = params
  const prefix = '__cjs__wrapper__helper__getter__'
  const uid = `${prefix}_${uuidv4()}`
  const getter = () => {
    return {
      import: (moduleName: string) => {
        // debugger;
        return modules[moduleName]
      },
      export: (module: any) => {
        moduleMap.set(uid, module)
      }
    }
  }
  // @ts-ignore
  window[uid] = getter
  await loadScript({
    src: url,
    dataset: {
      [CjsWrapperHelperGetterIdKey]: uid
    }
  })
  return moduleMap.get(uid) as T | undefined
}

export interface IExternal {
  packageName: string
  injectName: string
}

export const CjsWrapperBanner = `
(function () {
    var module = {
        exports: undefined,
    };
    var require;

    (function () {
        var script = document.currentScript;
        var helperGetterId = script.dataset.${CjsWrapperHelperGetterIdKey};
        helper = window[helperGetterId]();
        require = function (moduleName) {
            return helper.import(moduleName);
        };
    })();
`

export const CjsWrapperFooter = `
    (function () {
        var script = document.currentScript;
        var helperGetterId = script.dataset.${CjsWrapperHelperGetterIdKey};
        helper = window[helperGetterId]();
        helper.export(module.exports);
    })();
})();
`


