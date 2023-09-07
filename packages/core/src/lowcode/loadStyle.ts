export async function loadStyle (
  src: string,
  dataset?: Record<string, any>
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const head = document.head || document.getElementsByTagName('head')[0]
    const link = document.createElement('link')
    if (dataset) {
      Object.keys(dataset).map(key => {
        link.dataset[key] = dataset[key]
      })
    }
    link.type = 'text/css'
    link.href = src
    link.rel = 'stylesheet'
    link.onload = () => resolve(true)
    link.onerror = e => {
      link.remove()
      console.log(e)
      reject(false)
    }
    head.appendChild(link)
  })
}
