import type { IDataMapSchema, IDataSchema } from "@/schema/data"
import { createReactiveStore } from "@/utils/reactive"

export class ViewData<V = any> {
  #store = createReactiveStore<{
    value?: V
    schema?: IDataSchema
  }>(
    {},
    {
      get: (key, value) => {
        if (key === 'schema') {
          return value ? { ...(value as any) } : undefined
        }
        return value
      }
    }
  )
  get getValue() {
    return this.#store.getHandler('value').get
  }
  get setValue() {
    return this.#store.getHandler('value').set
  }
  get onValueChange() {
    return this.#store.getHandler('value').on
  }
  get setSchema() {
    return this.#store.getHandler('schema').set
  }
  get getSchema() {
    return this.#store.getHandler('schema').get
  }
  get onSchemaChange() {
    return this.#store.getHandler('schema').on
  }
}
export type IViewData<V = any> = ViewData<V>

export interface IViewDataMapValue {
  [dataName: string]: any
}

export class ViewDataMap<V extends IViewDataMapValue> {
  #store = createReactiveStore<{
    value?: V
    schema?: IDataMapSchema
  }>(
    {},
    {
      get: (key, value) => {
        if (key === 'schema') {
          return value ? ({ ...(value as IDataMapSchema) } as any) : undefined
        }
        return value
      }
    }
  )
  get getValue() {
    return this.#store.getHandler('value').get
  }
  get setValue() {
    return this.#store.getHandler('value').set
  }
  get onValueChange() {
    return this.#store.getHandler('value').on
  }
  get setSchema() {
    return this.#store.getHandler('schema').set
  }
  get getSchema() {
    return this.#store.getHandler('schema').get
  }
  get onSchemaChange() {
    return this.#store.getHandler('schema').on
  }
}
