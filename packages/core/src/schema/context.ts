import { ReactiveStore } from '@/utils/reactive'
import { stateSchemaToCode, type IStateSchema } from './state'
import { importSchemaListToCode, type IImportSchema } from './import'

export interface IContextSchema {
  imports?: IImportSchema[]
  states?: {
    name: string
    schema: IStateSchema
  }[]
  actions?: {
    name: string
    schema: string
  }[]
}

export interface IContextStates {
  [stateName: string]: any
}

export interface IContextActions {
  [actionName: string]: Function
}

export type IContextOptions<
  S extends IContextStates = IContextStates,
  A extends IContextActions = IContextActions
> = {
  states: () => S
  actions: () => A
} & ThisType<{
  ctx: Context<S, A>
}>

export class Context<
  S extends IContextStates = IContextStates,
  A extends IContextActions = IContextActions
> {
  #states: ReactiveStore<S>
  #actions: ReactiveStore<A>
  constructor(options: IContextOptions<S, A>) {
    const states = options.states.apply({
      ctx: this
    })
    const actions = options.actions.apply({
      ctx: this
    })
    this.#states = new ReactiveStore<S>({ data: states })
    this.#actions = new ReactiveStore<A>({ data: actions })
  }
  get getAllStates() {
    return this.#states.getAll
  }
  get getState() {
    return this.#states.get
  }
  get setState() {
    return this.#states.set
  }
  get resetStates() {
    return this.#states.reset
  }
  get onStateChange() {
    return this.#states.on
  }
  get watchState() {
    return this.#states.watch
  }
  get watchAllStates() {
    return this.#states.watchAll
  }
  get getAllActions() {
    return this.#actions.getAll
  }
  get getAction() {
    return this.#actions.get
  }
  get setAction() {
    return this.#actions.set
  }
  get onActionChange() {
    return this.#actions.on
  }
  get watchAction() {
    return this.#actions.watch
  }
  get watchAllActions() {
    return this.#actions.watchAll
  }
}

export type IContext = Context

export const defineContext = <
  S extends IContextStates = IContextStates,
  A extends IContextActions = IContextActions
>(
  options: IContextOptions<S, A>
) => options

export const contextSchemaToCode = async (schema: IContextSchema) => {
  const { imports = [], states = [], actions = [] } = schema
  imports.push({
    path: '@vue-cook/core',
    type: 'destructuring',
    names: [
      {
        exportName: 'defineContext'
      }
    ]
  })
  let content = `
${importSchemaListToCode(imports)}
export default defineContext({
  states() {
    const { ctx } = this;
    return {
      ${states
        .map((state) => {
          return `${state.name}:${stateSchemaToCode(state.schema)}`
        })
        .join(',\n')}
    };
  },
  actions() {
    const { ctx } = this;
    return {
      ${actions
        .map((action) => {
          return `${action.name}:${action.schema}`
        })
        .join(',\n')}
    };
  },
});
`

  return content
}
