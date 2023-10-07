import { inject, toRefs, type ToRef, type ToRefs } from 'vue'
import type { IStudioState } from '..'
import { toRenameRefs } from '@/utils/toRenameRefs'

export const useInjectSudioState = () => {
  const studioState = inject<IStudioState>('studioState') as IStudioState
  return toRenameRefs(studioState)
}

