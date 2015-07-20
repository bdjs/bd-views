'use strict';

/**
 * Module dependencies.
 */

var debug = require('debug')('bd-views');
var dirname = require('path').dirname;
var assign = require('object-assign');
var fmt = require('util').format;
var join = require('path').join;
var cons = require('co-views');
var send = require('koa-send');

/**
 * Add `render` method.
 *
 * @param {Object} opts (optional)
 * @api public
 */
var configs = {};
var renders = {};
module.exports = function (options) {
  var base = dirname(process.mainModule.filename);
  var defaultOptions = {
    key: 'index',
    default: 'html',
    path: base
  }
  options = assign(defaultOptions, options);

  debug('options: %j', options);

  configs[options.key] = options;

  return function *views (next) {
    renders[options.key] = cons(options.path, options);
    this.state = this.state || {};
    if (this.render) return yield next;

    /**
     * Render `view` with `locals` and `koa.ctx.state`.
     *
     * @param {String} view
     * @param {Object} locals
     * @return {GeneratorFunction}
     * @api public
     */

    this.render = function *(view, locals) {
      var key = this.path.split('/')[1] || 'index';
      var opts = configs[key] || defaultOptions;
      var ext = opts.default;

      if(view[view.length - 1] === '/'){
        view += 'index';
      }
      locals = locals || {};
      var state = assign(locals, this.state);
      if (ext == 'html' && (!opts.map || (opts.map && !opts.map.html))) {
        var file = fmt('%s.%s', view, ext);
        debug('render `%s` with %j', file, state);
        yield send(this, join(opts.path, file));
      } else {
        this.body = yield renders[key](view, state);
      }

      this.type = 'text/html';
    }

    yield next;
  }
}
