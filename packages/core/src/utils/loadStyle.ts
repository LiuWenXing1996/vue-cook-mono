export async function loadStyle(config: {
  src: string
  dataset?: Record<string, any>
}): Promise<HTMLLinkElement> {
  const { src, dataset } = config
  return new Promise((resolve, reject) => {
    const head = document.head || document.getElementsByTagName('head')[0]
    const link = document.createElement('link')
    if (dataset) {
      Object.keys(dataset).map((key) => {
        link.dataset[key] = dataset[key]
      })
    }
    link.type = 'text/css'
    link.href = src
    link.rel = 'stylesheet'
    link.onload = () => resolve(link)
    link.onerror = (e) => {
      link.remove()
      console.log(e)
      reject(false)
    }
    head.appendChild(link)
  })
}

export async function loadStyleByContent(config: {
  content: string
  dataset?: Record<string, any>
}): Promise<HTMLStyleElement> {
  const { content, dataset } = config
  return new Promise((resolve, reject) => {
    const head = document.head || document.getElementsByTagName('head')[0]
    const style = document.createElement('style')
    if (dataset) {
      Object.keys(dataset).map((key) => {
        style.dataset[key] = dataset[key]
      })
    }
    style.type = 'text/css'
    style.textContent = content
    style.onload = () => resolve(style)
    style.onerror = (e) => {
      style.remove()
      console.log(e)
      reject(false)
    }
    head.appendChild(style)
  })
}
