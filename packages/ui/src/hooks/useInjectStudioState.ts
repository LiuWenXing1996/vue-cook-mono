import { inject, toRefs } from 'vue'
import type { IStudioState } from '@/components/studio/types'

export const useInjectSudioState = () => {
  const studioState = inject<IStudioState>('studioState') as IStudioState
  return toRefs(studioState)
}
