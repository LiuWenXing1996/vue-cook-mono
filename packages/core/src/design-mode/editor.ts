import { fetchDeps, resolveDepVar, type IDep, type IDepsEntry, type IDeps } from '@/utils/fetchDeps'
import { v4 as uuidv4 } from 'uuid'
import type { ISchemaData } from './editor-renderer-context'

export interface IEditor {
  name: string
  packageName: string
  varName: string
}

export const defineEditor = (editor: IEditor) => editor

export interface IEditorWithDep {
  editor: IEditor
  dep: IDep
}

const getEditorListInternal = (params: {
  depsEntry: IDepsEntry
  callback: (editors: IEditorWithDep[]) => void
}) => {
  const { depsEntry, callback } = params
  const iframeEl = document.createElement('iframe')
  iframeEl.style.display = 'none'
  document.body.append(iframeEl)
  const contentWindow = iframeEl.contentWindow as Window

  const prefix = '__vue__cook__inject__method__'
  const uid = `${prefix}_${uuidv4()}`
  // @ts-ignore
  const oldValue = contentWindow[uid]
  // @ts-ignore
  contentWindow[uid] = async () => {
    const editorLibList: IEditorWithDep[] = []
    // @ts-ignore
    contentWindow[uid] = oldValue
    const deps = await fetchDeps({ entry: depsEntry, targetWindow: contentWindow })
    await Promise.all(
      Array.from(deps?.values() || []).map(async (dep) => {
        const editorsVarName = dep.meta.cookMeta?.editorsVarName
        if (!editorsVarName) {
          return
        }
        const editorsVar = resolveDepVar<IEditor[]>({
          dep,
          varName: editorsVarName
        })
        if (!editorsVar) {
          return
        }
        editorsVar.forEach((editor) => {
          editorLibList.push({
            editor,
            dep
          })
        })
      })
    )
    callback(editorLibList)
  }
  contentWindow.document.write(`
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>getEditorListInternal</title>
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

export const getEditorList = async (params: { depsEntry: IDepsEntry }) => {
  return new Promise<IEditorWithDep[]>((resolve, reject) => {
    getEditorListInternal({
      ...params,
      callback: (data) => {
        resolve(data)
      }
    })
  })
}
