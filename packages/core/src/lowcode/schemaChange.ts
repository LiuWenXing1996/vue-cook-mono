import type { MaybePromise } from '@/utils'
import type { ISchemaData } from '.'

export const SchemaChanegeDataType = 'SchemaChanegeDataType'

export interface ISchemaChanegeData {
  type: typeof SchemaChanegeDataType
  data: ISchemaData
}

export const isSchemaChanegeData = (data: any): data is ISchemaChanegeData => {
  if (!data) {
    return false
  }

  if (data.type !== SchemaChanegeDataType) {
    return false
  }

  return true
}

export const emitEditorWindowSchemaChange = (viewWindow: Window, data: ISchemaChanegeData) => {
  viewWindow.postMessage(data, '*')
}

export const listenEditorWindowSchemaChange = (
  success: (data: ISchemaData) => MaybePromise<void>
) => {
  const okCallback = (event: any) => {
    if (!isSchemaChanegeData(event.data)) {
      return
    }
    success(event.data.data)
  }
  window.addEventListener('message', okCallback)
  const cancel = () => {
    window.removeEventListener('message', okCallback)
  }
  return cancel
}
