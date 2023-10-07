// import sandbox, { globalModulesMapName } from './sandbox'
// import { extname } from '../utils/path'
// import { loadStyle, loadStyleByContent } from './loadStyle'
// import { loadScript } from './loadScript'
// import { v4 as uuidv4 } from 'uuid'
// import * as Vue from 'vue'
// import { h, createApp as createVueApp, ref } from 'vue'
// import * as VueRouter from 'vue-router'
// import { RouterView, createRouter, createWebHistory, type Router } from 'vue-router'
// import { createCoreLibOnceGetterId } from '@/utils'
// import { version } from '@/../package.json'
// import { listenEditorWindowSchemaChange, type ISchemaChanegeData } from './schemaChange'

// export type IDeps = Record<string, any>
// export const ElementDataLowcodeContextIdKey = 'cookContextId'
// export const ElementDataCoreLibOnceGetterIdIdKey = 'coreLibOnceGetterId'

// export interface IInternalLowcodeContext<T = any> {
//   id: string
//   getSchemaData: () => T
//   getExternalLibs: () => Record<string, any>
// }

// export type ILowcodeContext = Pick<IInternalLowcodeContext, 'id'>

// const contextMap = new Map<string, ILowcodeContext>()

// export const getLowcodeContext = (id: string) => {
//   return contextMap.get(id)
// }

// const setLowcodeContext = (context: ILowcodeContext) => {
//   contextMap.set(context.id, context)
// }

// export const exportDeps = (deps: IDeps) => {
//   const script = document.currentScript
//   const uid = script?.dataset?.cookContextId || ''
//   if (uid) {
//     const context = getLowcodeContext(uid)
//     if (context) {
//       context.setDeps(deps)
//     }
//   }
// }

// export function addLowcodePages(router: Router, res: any) {
//   let redirectTag = false
//   router.beforeEach(async (to, from) => {
//     if (!redirectTag) {
//       let { Pages } = res.value || {}
//       Pages = Pages || {}
//       console.log('pages', Pages)
//       Vue.watch(res, () => {
//         console.log('===ssss>')
//       })
//       Object.keys(Pages).map((pageName) => {
//         const pageRef = Vue.computed(() => {
//           let { Pages } = res.value || {}
//           Pages = Pages || {}
//           return Pages[pageName]
//         })
//         const page = Pages[pageName]
//         router.addRoute({
//           path: page.path,
//           component: () => {
//             console.log('....???')
//             return h(pageRef.value)
//           }
//         })
//       })
//       redirectTag = true
//       return to.fullPath
//     }
//     redirectTag = false
//   })
// }

// const linkMsg = JSON.stringify({
//   type: 'viewLinked',
//   cookCoreVersion: version
// })

// export const tryLinkToViewWindow = async (viewWindow: Window): Promise<Window | undefined> => {
//   return new Promise((resolve, reject) => {
//     try {
//       let hasLinked = false
//       const reSend = () => {
//         if (!hasLinked) {
//           viewWindow.postMessage(linkMsg, '*')
//           setTimeout(() => {
//             reSend()
//           }, 500)
//         }
//       }
//       reSend()
//       window.addEventListener('message', (event) => {
//         try {
//           const { data } = event
//           if (data === linkMsg) {
//             if (event.source) {
//               hasLinked = true
//               resolve(event.source as Window)
//             }
//           }
//         } catch (error) {
//           reject(error)
//         }
//       })
//     } catch (error) {
//       reject(error)
//     }
//   })
// }

// export const tryLinkToEditorWindow = async (): Promise<Window | undefined> => {
//   return new Promise((resolve, reject) => {
//     try {
//       window.addEventListener('message', (event) => {
//         try {
//           const { data } = event
//           if (data === linkMsg) {
//             if (event.source) {
//               event.source.postMessage(linkMsg, {
//                 targetOrigin: event.origin
//               })
//               resolve(event.source as Window)
//             }
//           }
//         } catch (error) {
//           reject(error)
//         }
//       })
//     } catch (error) {
//       reject(error)
//     }
//   })
// }

// export interface ISchemaData {
//   timestamp: number
//   schema: {
//     js: string
//     css: string
//   }
// }

// export interface ILowcodeContextConfig<T = any> {
//   depsEntryList: string[]
//   schemaEntryList: string[]
//   onDataChange?: (data: T | undefined) => void
//   externalLibs?: Record<string, any>
// }

// export const exportLowcodeContext = (internalContext:IInternalLowcodeContext)=>{
//   const context = {
//     id:internalContext.id,
    
//   }

//   return context
// }

// const createInternalLowcodeContext = <T = any>(config: ILowcodeContextConfig<T>)=>{

// }

// export const createLowcodeContext = async <T = any>(config: ILowcodeContextConfig<T>) => {
//   const { depsEntryList, schemaEntryList, onDataChange, externalLibs } = config
//   const id = uuidv4()
//   let currentDeps: IDeps = {}
//   let currentData: T | undefined = undefined
//   let currentSchemaData: ISchemaData | undefined = undefined
//   let currentStyleEl: HTMLStyleElement | undefined = undefined
//   let currentExternalLibs = externalLibs || {}

//   await Promise.all(
//     depsEntryList.map(async (depEntry) => {
//       const ext = extname(depEntry)
//       if (ext === '.css') {
//         try {
//           await loadStyle(depEntry, {
//             [ElementDataLowcodeContextIdKey]: id
//           })
//         } catch (error) {}
//       }
//       if (ext === '.js') {
//         const coreLibOnceGetterId = createCoreLibOnceGetterId()
//         await loadScript(depEntry, {
//           [ElementDataLowcodeContextIdKey]: id,
//           [ElementDataCoreLibOnceGetterIdIdKey]: coreLibOnceGetterId
//         })
//       }
//     })
//   )

//   {
//     let cssContent = ''
//     let jsContent = ''
//     await Promise.all(
//       schemaEntryList.map(async (schemaEntry) => {
//         const ext = extname(schemaEntry)
//         const content = await fetch(schemaEntry).then((res) => {
//           return res.text()
//         })
//         if (ext === '.css') {
//           cssContent = content
//         }
//         if (ext === '.js') {
//           jsContent = content
//         }
//       })
//     )

//     currentSchemaData = {
//       timestamp: Date.now(),
//       schema: {
//         css: cssContent,
//         js: jsContent
//       }
//     }
//   }

//   const refresh = async () => {
//     if (!currentSchemaData) {
//       return
//     }
//     const { js = '', css = '' } = currentSchemaData.schema
//     await Promise.all([
//       async () => {
//         currentStyleEl?.remove()
//         currentStyleEl = await loadStyleByContent(css, { [ElementDataLowcodeContextIdKey]: id })
//       },
//       async () => {
//         currentData = await sandbox(js, {
//           [globalModulesMapName]: currentDeps
//         })
//       }
//     ])
//     onDataChange?.(currentData)
//   }

//   listenEditorWindowSchemaChange((data) => {
//     if (currentSchemaData) {
//       if (currentSchemaData.timestamp > data.timestamp) {
//         return
//       }
//     }
//     currentSchemaData = data
//     refresh()
//   })

//   const initDeps = async () => {
//     await Promise.all(
//       deps.map(async (dep) => {
//         const ext = extname(dep)
//         if (ext === '.css') {
//           try {
//             await loadStyle(dep, {
//               [ElementDataLowcodeContextIdKey]: id
//             })
//           } catch (error) {}
//         }
//         if (ext === '.js') {
//           const coreLibOnceGetterId = createCoreLibOnceGetterId()
//           await loadScript(dep, {
//             [ElementDataLowcodeContextIdKey]: id,
//             [ElementDataCoreLibOnceGetterIdIdKey]: coreLibOnceGetterId
//           })
//         }
//       })
//     )
//   }
//   const run = async () => {
//     await Promise.all(
//       schemaEntryList.map(async (schemaEntry) => {
//         const ext = extname(schemaEntry)
//         const content = await fetch(schemaEntry).then((res) => {
//           return res.text()
//         })
//         if (ext === '.css') {
//           await loadStyleByContent(content, { [ElementDataLowcodeContextIdKey]: id })
//         }
//         if (ext === '.js') {
//           res.value = await sandbox(content, {
//             [globalModulesMapName]: currentDeps
//           })
//         }
//       })
//     )
//     return res
//   }

//   const reRunByInjectSchema = async (config: { js: string; css: string }) => {
//     const { js = '', css = '' } = config
//     await Promise.all([
//       async () => {
//         await loadStyleByContent(css, { [ElementDataLowcodeContextIdKey]: id })
//       },
//       async () => {
//         res.value = await sandbox(js, {
//           [globalModulesMapName]: currentDeps
//         })
//       }
//     ])
//     return res
//   }

//   Vue.watch(res, () => {
//     console.log('===>')
//   })

//   const createApp = async () => {
//     const router = createRouter({
//       history: createWebHistory('/page-servers'),
//       routes: []
//     })
//     let { Pages } = res.value || {}
//     Pages = Pages || {}
//     Object.keys(Pages).map((pageName) => {
//       // const pageRef = Vue.computed(() => {
//       //   let { Pages } = res.value || {}
//       //   Pages = Pages || {}
//       //   return Pages[pageName]
//       // })
//       const page = Pages[pageName]
//       router.addRoute({
//         path: page.path,
//         component: Vue.defineComponent((props) => {
//           const pageRef = Vue.computed(() => {
//             let { Pages } = res.value || {}
//             Pages = Pages || {}
//             return Pages[pageName]
//           })
//           // Vue.watch(res, () => {
//           //   console.log('===>ddddd')
//           // })
//           return () => h(pageRef.value, props)
//         })
//       })
//     })
//     // addLowcodePages(router, res)
//     const app = createVueApp(h(RouterView))
//     app.use(router)
//     return app
//   }

//   const context = {
//     id,
//     // TODO:可否对外部私有这个方法
//     setDeps: (deps: IDeps) => {
//       currentDeps = deps
//     },
//     reRunByInjectSchema,
//     run,
//     createApp,
//     getInjectLibs: (varName: string) => {
//       return externalLibs[varName]
//     }
//   }
//   setLowcodeContext(context)

//   return context
// }

// export const createVueRenderContext = () => {
//   // TODO:使用vue-router创建一个vue app
// }

// // TODO:createRenderContext?

// export const autoRun = async (config: ILowcodeContextConfig) => {
//   const script = document.currentScript
//   const configVarName = script?.dataset?.configVarName || ''
//   if (configVarName) {
//     // @ts-ignore
//     const _config = window[configVarName] as ILowcodeContextConfig
//     config = {
//       ...config,
//       ..._config
//     }
//   }
//   const context = await createLowcodeContext(config)
//   await context.initDeps()
//   await context.run()
//   const app = await context.createApp()
//   app.mount('#app')
//   setTimeout(async () => {
//     console.log('开始重新获取schema')
//     let now = Date.now()
//     await context.run()
//     console.log('完成重新获取schema', Date.now() - now)
//   }, 10000)
// }
