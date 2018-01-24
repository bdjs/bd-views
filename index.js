'use strict'

/**
 * Module dependencies.
 */

const dirname = require('path').dirname
const consolidate = require('consolidate')
const send = require('koa-send')
const getPaths = require('get-paths')
const pretty = require('pretty')
const path = require('path')
const {resolve} = path
const base = dirname(process.mainModule.filename)
const defaultOptions = {
  key: 'index',
  default: 'html',
  path: base
}

/**
 * Add `render` method.
 *
 * @param {Object} opts (optional)
 * @api public
 */
let configs = {}
// let renders = {}
module.exports = function (app) {
  let apps = Object.keys(app.apps)
  apps.forEach(key => {
    if (!app.configs.views) {
      return
    }
    let config = app.configs.views[key]
    if (!config) {
      return
    }

    let options = {
      ...defaultOptions,
      ...config,
      key: key,
      path: path.join(app.apps[key], 'views')
    }

    // 获取所有的config
    configs[options.key] = options
  })

  app.use(async function views (ctx, next) {
    ctx.state = ctx.state || {}
    let key = ctx.path.split('/')[1] || 'index'
    let {
      path,
      engineSource = consolidate,
      extension = 'html',
      options = {},
      map
    } = configs[key] || {}

    if (ctx.render) return next()

    ctx.render = function (relPath, locals = {}) {
      return getPaths(path, relPath, extension).then(paths => {
        const suffix = paths.ext
        const state = Object.assign(locals, options, ctx.state || {})
        // deep copy partials
        state.partials = Object.assign({}, options.partials || {})
        ctx.type = 'text/html'

        // html文件直接输出
        if (isHtml(suffix) && !map) {
          return send(ctx, paths.rel, {
            root: path
          })
        } else {
          const engineName = map && map[suffix] ? map[suffix] : suffix

          const render = engineSource[engineName]

          if (!engineName || !render) {
            return Promise.reject(
              new Error(`Engine not found for the ".${suffix}" file extension`)
            )
          }

          return render(resolve(path, paths.rel), state).then(html => {
            // since pug has deprecated `pretty` option
            // we'll use the `pretty` package in the meanwhile
            if (locals.pretty) {
              html = pretty(html)
            }
            ctx.body = html
          })
        }
      })
    }

    return next()
  })
}

function isHtml (ext) {
  return ext === 'html'
}
