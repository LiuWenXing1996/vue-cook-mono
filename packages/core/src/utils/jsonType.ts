type JsonTypePrimitive = string | number | boolean | null
export type JsonTypeArray = Array<JsonType>
export type JsonTypeObject = {
  [key: string]: JsonType | undefined
}

export type JsonType = JsonTypeObject | JsonTypePrimitive | JsonTypeArray

function isJsonTypePrimitive(value: any): boolean {
  const types = ['string', 'number', 'boolean']
  if (types.includes(typeof value)) {
    return true
  }
  if (value === null) {
    return true
  }
  return false
}
function isJsonTypeArray(value: any): boolean {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const e = value[i]
      if (!isJsonTypePrimitive(e)) {
        return false
      }
    }
    return true
  }
  return false
}

function isJsonTypeObject(value: any): boolean {
  if (value && typeof value === 'object') {
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        const e = value[key]
        if (!isJsonTypePrimitive(e)) {
          return false
        }
      }
    }
    return true
  }
  return false
}

export function isJsonType(value: any): boolean {
  if (isJsonTypePrimitive(value)) {
    return true
  }
  if (isJsonTypeArray(value)) {
    return true
  }
  if (isJsonTypeObject(value)) {
    return true
  }
  return false
}
