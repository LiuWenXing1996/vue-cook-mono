import { computed, ref, watch } from 'vue'

export default function useControlledState<
  IProps extends Record<string, any>,
  IKey extends keyof IProps,
  IValue = IProps[IKey]
>(params: { key: IKey; props: IProps; emit: (value: IValue | undefined) => void }) {
  const { key, props, emit } = params
  const isControlled = props[key] !== undefined
  const localValue = ref<IValue>()
  const unControlledValue = ref<IValue>()
  if (isControlled) {
    watch(
      () => props[key],
      (value) => {
        localValue.value = value
      },
      {
        immediate: true
      }
    )
  }

  watch(unControlledValue, (value) => {
    emit(value)
    if (!isControlled) {
      localValue.value = value
    }
  })

  return {
    isControlled,
    state: computed(() => localValue.value),
    set: (value: IValue | undefined) => {
      unControlledValue.value = value
    }
  }
}
