export async function loadScript(config: {
  src: string
  dataset?: Record<string, any>
}): Promise<boolean> {
  const { src, dataset } = config
  return new Promise((resolve, reject) => {
    const head = document.head || document.getElementsByTagName('head')[0]
    const script = document.createElement('script')
    if (dataset) {
      Object.keys(dataset).map((key) => {
        script.dataset[key] = dataset[key]
      })
    }
    script.type = 'text/javascript'
    script.async = true
    script.src = src
    script.onload = () => resolve(true)
    script.onerror = (e) => {
      script.remove()
      console.log(e)
      reject(false)
    }
    head.appendChild(script)
  })
}
