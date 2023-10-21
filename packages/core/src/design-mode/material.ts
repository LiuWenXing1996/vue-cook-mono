import { fetchDeps, type IDep, type IDepsEntry } from '@/utils/fetchDeps'
import { v4 as uuidv4 } from 'uuid'

export interface IMaterial {
  name: string
  group: string
}

export const defineMaterial = (material: IMaterial) => material

export interface IMaterialWithDep {
  material: IMaterial
  dep: IDep
}

const getMaterialListInternal = (params: {
  depsEntry: IDepsEntry
  callback: (materials: IMaterialWithDep[]) => void
}) => {
  const { depsEntry, callback } = params
  const iframeEl = document.createElement('iframe')
  iframeEl.style.display = 'none'
  document.body.append(iframeEl)
  const contentWindow = iframeEl.contentWindow as Window
  const prefix = '__vue__cook__inject__method__'
  const uid = `${prefix}_${uuidv4()}`
  // @ts-ignore
  const oldValue = window[uid]
  // @ts-ignore
  contentWindow[uid] = async () => {
    const materialLibList: IMaterialWithDep[] = []
    // @ts-ignore
    window[uid] = oldValue
    const deps = await fetchDeps({ entry: depsEntry })
    await Promise.all(
      Array.from(deps?.values() || []).map(async (dep) => {
        const materialsVarName = dep.meta.cookMeta?.materialsVarName
        if (!materialsVarName) {
          return
        }
        const materialsVar = dep.value?.[materialsVarName] as IMaterial[] | undefined
        if (!materialsVar) {
          return
        }
        materialsVar.forEach((material) => {
          materialLibList.push({
            material,
            dep
          })
        })
      })
    )
    callback(materialLibList)
  }
  contentWindow.document.write(`
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>getMaterialListInternal</title>
    <script>
    (function () {
      window["${uid}"]()
    })();
    </script>
  </head>
  <body>
  </body>
  </html>
    `)
}

export const getMaterialList = async (params: { depsEntry: IDepsEntry }) => {
  return new Promise<IMaterialWithDep[]>((resolve, reject) => {
    getMaterialListInternal({
      ...params,
      callback: (data) => {
        resolve(data)
      }
    })
  })
}
