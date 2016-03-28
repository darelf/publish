var argv = require('yargs').argv
var fs = require('fs')
var path = require('path')
var glob = require('glob')
var xtend = require('xtend')
var matter = require('gray-matter')
var marked = require('marked')
var mustache = require('mustache')

var revsort = function(arr,key) {
  return arr.sort(function(a,b) {
    return (a[key] > b[key]) ? -1 : ((a[key] < b[key]) ? 1 : 0)
  })
}

var list_posts = function(directory, ending, size) {
  var search_path = directory + '/**/*.' + ending
  var files = glob.sync(search_path)
  var items = []
  files.forEach(function(v,i,a) {
    var m = matter.read(v)
    items.push(m.data)
  })
  return revsort(items, 'publish')
}

var render = function(filename, template, data, partials) {
  var parsed = matter.read(filename)
  var jsonData = xtend(parsed.data, data)
  jsonData.content = marked(parsed.content)
  return mustache.render(template, jsonData, partials)
}

var load_templates = function(baseDir, ending) {
  var search_path = baseDir + '/**/*.' + ending
  var files = glob.sync(search_path)
  var templates = {}
  files.forEach(function(v,i,a) {
    var s = fs.readFileSync(v, 'utf8')
    var base = path.basename(v)
    var name = base.substr(0, base.length - (ending.length + 1))
    templates[name] = s
  })
  return templates
}

module.exports.load_templates = load_templates
module.exports.render = render
module.exports.list_posts = list_posts
