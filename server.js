var http = require('http')
var parse = require('url').parse
var fs = require('fs')
var mime = require('mime')
var publish = require('./index')

var argv = require('yargs')
  .usage('Usage: $0 [options]')
  .help('h')
  .describe('d', 'where to find the markdown blog posts')
  .describe('t', 'where to find the mustache templates')
  .describe('p', 'port to use')
  .default('d', 'posts')
  .default('t', 'templates')
  .default('p', 8888)
  .argv

publish.load_items_from(argv.d, 'md')
var templates = publish.load_templates(argv.t, 'mustache')

var get_slug = function(p) {
  var slug = p.substring(p.lastIndexOf('/')+1)
  if (!slug) {
    var tmp = p.slice(0, p.lastIndexOf('/'))
    slug = tmp.substring(tmp.lastIndexOf('/')+1)
  }
  return slug
}

var server = http.createServer(function(req,res) {
  var p = parse(req.url).pathname
  if (p.startsWith('/static/')) {
    var pname = '.' + p
    res.setHeader('Content-Type', mime.lookup(pname))
    var stream = fs.createReadStream(pname)
    stream.pipe(res)
  } else {
    var slug = get_slug(p)
    var output
    if (slug) {
      var item = publish.item_by_slug(slug)
      if (item) {
        output = publish.render(item.filename, templates.article, {}, templates)
      } else {
        output = "Not Found"
      }
    } else {
      output = publish.render_index(templates.index, templates)
    }
    res.end(output)
  }
})

server.listen(8888)
