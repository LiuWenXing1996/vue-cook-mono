/**
 * fork from https://github.com/jcubic/wayne/blob/master/index.js
 */

/// <reference lib="WebWorker" />
declare var self: ServiceWorkerGlobalScope
export {}

// import type { IVirtulFileSystem } from '@/index'
// import type { TDataOut } from 'memfs/lib/node/types/misc'
type IVirtulFileSystem =any
type TDataOut =any

const root_url = location.pathname.replace(/\/[^\/]+$/, '')
const root_url_re = new RegExp('^' + escape_re(root_url))

function normalize_url(url: string) {
  return url.replace(root_url_re, '')
}

function escape_re(str: string) {
  if (typeof str == 'string') {
    var special = /([\^\$\[\]\(\)\{\}\+\*\.\|\?])/g
    return str.replace(special, '\\$1')
  }
}

function is_function(arg: any) {
  return typeof arg === 'function'
}

function is_promise(arg: Promise<any>) {
  return arg && typeof arg === 'object' && is_function(arg.then)
}

// taken from Isomorphic-git MIT license
function isPromiseFs(fs: IFs) {
  const test = (targetFs: any): any => {
    try {
      // If readFile returns a promise then we can probably assume the other
      // commands do as well
      return targetFs.readFile().catch((e: any) => e)
    } catch (e) {
      return e
    }
  }
  return is_promise(test(fs))
}

export class HTTPResponse {
  _resolve: any
  _reject: any
  constructor(resolve: (value: unknown) => void, reject: { (reason?: any): void; (): void }) {
    this._resolve = resolve
    this._reject = reject
  }
  html(data: any, init: { type?: string | undefined } | undefined) {
    this.send(data, { type: 'text/html', ...init })
  }
  text(data: any, init: { type?: string | undefined } | undefined) {
    this.send(data, init)
  }
  json(data: any, init: { type?: string | undefined } | undefined) {
    this.send(JSON.stringify(data), { type: 'application/json', ...init })
  }
  blob(blob: BodyInit | null | undefined, init = {}) {
    this._resolve(new Response(blob, init))
  }
  send(data: BlobPart | null | undefined, { type = 'text/plain', ...init } = {}) {
    if (![undefined, null].includes(data as any)) {
      data = new Blob([data as any], {
        type
      })
    }
    this.blob(data, init)
  }
  async fetch(arg: RequestInfo | URL) {
    if (typeof arg === 'string') {
      const _res = await fetch(arg)
      const type = _res.headers.get('Content-Type') ?? 'application/octet-stream'
      this.send(await _res.arrayBuffer(), { type })
    } else if (arg instanceof Request) {
      return fetch(arg).then(this._resolve).catch(this._reject)
    }
  }
  download(content: any, { filename = 'download', type = 'text/plain', ...init } = {}) {
    const headers = {
      'Content-Disposition': `attachment; filename="${filename}"`
    }
    // @ts-ignore
    this.send(content, { type, headers, ...init })
  }
  redirect(code: number | string | undefined, url: string | undefined) {
    if (url === undefined) {
      url = code as string | undefined
      code = 302
    }
    if (typeof code === 'string') {
      url = code
      code = 302
    }
    if (!url?.match(/https?:\/\//)) {
      url = root_url + url
    }
    this._resolve(Response.redirect(url, code))
  }
  sse({ onClose } = {} as any) {
    let send, close, stream, defunct: boolean
    stream = new ReadableStream({
      cancel() {
        defunct = true
        trigger(onClose)
      },
      start: (controller) => {
        send = function (event: { data: any; event: any; retry: any; id: any }) {
          if (!defunct) {
            const chunk = createChunk(event)
            const payload = new TextEncoder().encode(chunk)
            controller.enqueue(payload)
          }
        }
        close = function close() {
          controller.close()
          stream = null
          trigger(onClose)
        }
      }
    })
    this._resolve(
      new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Transfer-Encoding': 'chunked',
          Connection: 'keep-alive'
        }
      })
    )
    return {
      send,
      close
    }
  }
}

// code based on https://github.com/jcubic/route.js
// Copyright (C) 2014-2017 Jakub T. Jankiewicz <https://jcubic.pl/me>
export function RouteParser(this: any) {
  const name_re = '[a-zA-Z_][a-zA-Z_0-9]*'
  const self = this
  const open_tag = '{'
  const close_tag = '}'
  const glob = '*'
  const number = '\\d'
  const optional = '?'
  const open_group = '('
  const close_group = ')'
  const plus = '+'
  const dot = '.'
  self.route_parser = function (open: any, close: any) {
    const routes = {}
    const tag_re = new RegExp('(' + escape_re(open) + name_re + escape_re(close) + ')', 'g')
    const tokenizer_re = new RegExp(
      [
        '(',
        escape_re(open),
        name_re,
        escape_re(close),
        '|',
        escape_re(glob),
        '|',
        escape_re(number),
        '|',
        escape_re(dot),
        '|',
        escape_re(optional),
        '|',
        escape_re(open_group),
        '|',
        escape_re(close_group),
        '|',
        escape_re(plus),
        ')'
      ].join(''),
      'g'
    )
    const clear_re = new RegExp(escape_re(open) + '(' + name_re + ')' + escape_re(close), 'g')
    return function (str: string) {
      const result: (number | string)[] = []
      let index = 0
      let parentheses = 0
      str = str
        .split(tokenizer_re)
        .map(function (chunk: string, i: any, chunks: any) {
          if (chunk === open_group) {
            parentheses++
          } else if (chunk === close_group) {
            parentheses--
          }
          if ([open_group, plus, close_group, optional, dot, number].includes(chunk)) {
            return chunk
          } else if (chunk === glob) {
            result.push(index++)
            return '(.*?)'
          } else if (chunk.match(tag_re)) {
            result.push(chunk.replace(clear_re, '$1'))
            return '([^\\/]+)'
          } else {
            return chunk
          }
        })
        .join('')
      if (parentheses !== 0) {
        throw new Error(`Wayne: Unbalanced parentheses in an expression: ${str}`)
      }
      return { re: str, names: result }
    }
  }
  const parse = self.route_parser(open_tag, close_tag)
  self.parse = parse
  self.pick = function (routes: any[], url: string) {
    let input
    let keys
    if (routes instanceof Array) {
      input = {}
      keys = routes
      routes.map(function (route) {
        input[route] = route
      })
    } else {
      keys = Object.keys(routes)
      input = routes
    }
    const results = []
    for (let i = keys.length; i--; ) {
      const pattern = keys[i]
      const parts = parse(pattern)
      const m = url.match(new RegExp('^' + parts.re + '$'))
      if (m) {
        const matched = m.slice(1)
        const data: any = {}
        if (matched.length) {
          parts.names.forEach((name: string | number, i: number) => {
            data[name] = matched[i]
          })
        }
        results.push({
          pattern,
          data
        })
      }
    }
    return results
  }
}

function html(content: any[]) {
  return [
    '<!DOCTYPE html>',
    '<html>',
    '<head>',
    '<meta charset="UTF-8">',
    '<title>Wayne Service Worker</title>',
    '</head>',
    '<body>',
    ...content,
    '</body>',
    '</html>'
  ].join('\n')
}

function error500(error: any) {
  var output = html([
    '<h1>Wayne: 500 Server Error</h1>',
    '<p>Service worker give 500 error</p>',
    `<p>${error.message || error}</p>`,
    `<pre>${error.stack || ''}</pre>`
  ])
  return [
    output,
    {
      status: 500,
      statusText: '500 Server Error'
    }
  ]
}

function dir(prefix: any, path: any, list: any[]) {
  var output = html([
    '<h1>Wayne</h1>',
    `<p>Content of ${path}</p>`,
    '<ul>',
    ...list.map((name: any) => {
      return `<li><a href="${root_url}${prefix}${path}${name}">${name}</a></li>`
    }),
    '</ul>'
  ])
  return [
    output,
    {
      status: 404,
      statusText: '404 Page Not Found'
    }
  ]
}

function error404(path: any) {
  var output = html(['<h1>Wayne: 404 File Not Found</h1>', `<p>File ${path} not found`])
  return [
    output,
    {
      status: 404,
      statusText: '404 Page Not Found'
    }
  ]
}

function createChunk({ data, event, retry, id } = {} as any) {
  return (
    Object.entries({ event, id, data, retry })
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n') + '\n\n'
  )
}

function trigger(maybeFn: any, ...args: any[]) {
  if (typeof maybeFn === 'function') {
    maybeFn(...args)
  }
}

function chain_handlers(
  handlers: string | any[],
  callback: {
    (fn: any, next: any): any
    (fn: any, next: any): any
    (handler: any, next: any): void
    (arg0: any, arg1: () => void): any
  }
) {
  if (handlers.length) {
    return new Promise<void>((resolve, reject) => {
      let i = 0
      ;(async function recur() {
        const handler = handlers[i]
        if (!handler) {
          return resolve()
        }
        try {
          await callback(handler, function next() {
            i++
            recur()
          })
        } catch (error) {
          reject(error)
        }
      })()
    })
  }
}

async function list_dir({ fs, path }: { fs: IFs; path: any }, path_name: any) {
  const names = await fs.readdir(path_name)
  return Promise.all(
    names.map(async (name: any) => {
      const fullname = path.join(path_name, name)
      const isDirectory = await fs.isDirectory(fullname)
      if (isDirectory) {
        return `${name}/`
      }
      return name
    })
  )
}

export function FileSystem({ prefix, path, fs, mime }: { [key: string]: any; fs: IFs }) {
  if (!isPromiseFs(fs)) {
    throw new Error('Wayne: only promise based FS accepted')
  }
  if (!prefix.startsWith('/')) {
    prefix = `/${prefix}`
  }
  return async function (
    req: { method: string; url: string | URL },
    res: {
      send: (arg0: TDataOut, arg1: { status?: number; type?: any }) => void
      html: (arg0: string | { status: number; statusText: string }) => void
    },
    next: () => void
  ) {
    const method = req.method
    const url = new URL(req.url)
    let path_name = normalize_url(decodeURIComponent(url.pathname))
    if (path_name.startsWith(prefix)) {
      if (req.method !== 'GET') {
        return res.send('Method Not Allowed', { status: 405 })
      }
      path_name = path_name.substring(prefix.length)
      if (!path_name) {
        path_name = '/'
      }
      try {
        const isExits = await fs.exists(path_name)
        if (!isExits) {
          throw new Error('404')
        }
        const isFile = await fs.isFile(path_name)
        const isDirectory = await fs.isDirectory(path_name)

        if (isFile) {
          const ext = path.extname(path_name)
          const type = mime.getType(ext)
          const data = await fs.readFile(path_name)
          res.send(data, { type })
        } else if (isDirectory) {
          const args = dir(prefix, path_name, await list_dir({ fs, path }, path_name)) as [any]
          res.html(...args)
        }
      } catch (e: any) {
        if (e.message === '404') {
          const args = error404(path_name) as [any]
          res.html(...args)
        } else {
          const args = error500(path_name) as [any]
          res.html(...args)
        }
      }
    } else {
      next()
    }
  }
}

export class Wayne {
  _er_handlers: any[]
  _middlewares: any[]
  _routes: any
  _timeout: number
  _parser: any
  constructor() {
    this._er_handlers = []
    this._middlewares = []
    this._routes = {}
    this._timeout = 5 * 60 * 1000 // 5 minutes
    this._parser = new (RouteParser as any)()
    self.addEventListener('fetch', (event) => {
      const promise = new Promise(async (resolve, reject) => {
        const req = event.request
        try {
          const res = new HTTPResponse(resolve, reject)
          await chain_handlers(
            this._middlewares,
            function (fn: (arg0: any, arg1: HTTPResponse, arg2: any) => any, next: any) {
              return fn(req, res, next)
            }
          )
          const method = req.method
          const url = new URL(req.url)
          const path = normalize_url(url.pathname)
          const routes = this._routes[method]
          if (routes) {
            const match = this._parser.pick(routes, path)
            if (match.length) {
              const [first_match] = match
              const fns = [...this._middlewares, ...routes[first_match.pattern]]
              ;(req as any).params = first_match.data
              setTimeout(function () {
                reject('Timeout Error')
              }, this._timeout)
              await chain_handlers(
                fns,
                (fn: (arg0: any, arg1: HTTPResponse, arg2: any) => any, next: any) => {
                  return fn(req, res, next)
                }
              )
              return
            }
          }
          if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
            return
          }
          //request = credentials: 'include'
          fetch(event.request).then(resolve).catch(reject)
        } catch (error) {
          this._handle_error(resolve, req, error)
        }
      })
      event.respondWith(promise.catch(() => {}) as any)
    })
    ;['GET', 'POST', 'DELETE', 'PATCH', 'PUT'].forEach((method) => {
      //@ts-ignore
      this[method.toLowerCase()] = this.method(method)
    })
  }
  _handle_error(resolve: (value: unknown) => void, req: any, error: unknown) {
    const res = new HTTPResponse(resolve, () => {})
    if (this._er_handlers.length) {
      chain_handlers(
        this._er_handlers,
        function (
          handler: (arg0: any, arg1: any, arg2: HTTPResponse, arg3: any) => void,
          next: any
        ) {
          handler(error, req, res, next)
        }
      )
    } else {
      res.html(...(error500(error) as [any, any]))
    }
  }
  use(...fns: Function[]) {
    fns.forEach((fn) => {
      if (typeof fn === 'function') {
        if (fn.length === 4) {
          this._er_handlers.push(fn)
        } else if (fn.length === 3) {
          this._middlewares.push(fn)
        }
      }
    })
  }
  method(method: string) {
    return (url: string | number, fn: any) => {
      if (!this._routes[method]) {
        this._routes[method] = {}
      }
      const routes = this._routes[method]
      if (!routes[url]) {
        routes[url] = []
      }
      routes[url].push(fn)
      return this
    }
  }
}

let rpc_id = 0

export function send(
  channel: {
    addEventListener: (arg0: string, arg1: (message: any) => void) => void
    removeEventListener: (arg0: string, arg1: (message: any) => void) => void
    postMessage: (arg0: { id: number; method: any; args: any }) => void
  },
  method: any,
  args: any
) {
  return new Promise((resolve, reject) => {
    const id = ++rpc_id
    const payload = { id, method, args }
    channel.addEventListener('message', function handler(message: any) {
      if (id == message.data.id) {
        const data = message.data
        channel.removeEventListener('message', handler)
        if (data.error) {
          reject(data.error)
        } else {
          resolve(message.data)
        }
      }
    })
    channel.postMessage(payload)
  })
}

export interface IFs {
  readFile: IVirtulFileSystem['readFile']
  exists: IVirtulFileSystem['exists']
  isFile: IVirtulFileSystem['isFile']
  readdir: IVirtulFileSystem['readdir']
  isDirectory: IVirtulFileSystem['isDirectory']
}
