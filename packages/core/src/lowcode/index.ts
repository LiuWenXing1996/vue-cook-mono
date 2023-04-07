import { defineAsyncComponent } from 'vue'
import sandbox from './sandbox'
import { defineState } from '../schema/state/defineState'
import { useState } from '../schema/state/useState'
import { defineMethod } from '../schema/method/defineMethod'
import { defineBase } from '../schema/base/defineBase'
import * as Vue from 'vue'

export type IGlobalInject = ReturnType<typeof getGlobalInject>

const libMap: Record<string, any> = {
  vue: Vue
}

const getGlobalInject = () => {
  return {
    defineState,
    useState,
    defineMethod,
    defineBase,
    useLib: (key: string) => {
      return libMap[key]
    }
  }
}

export interface ILowcodeConfig {
  entryJs: string
}

export const run = async (config: ILowcodeConfig) => {
  const { entryJs } = config
  const lowcodeJS = await fetch(entryJs).then(res => {
    return res.text()
  })
  const globalInject = getGlobalInject()
  const res = sandbox(lowcodeJS, globalInject)
  return res
}
