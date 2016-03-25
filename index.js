var argv = require('yargs').argv
var fs = require('fs')
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
  var files = fs.readdirSync(directory)
  var items = []
  files.forEach(function(v,i,a) {
    if (v.endsWith(ending)) {
      var m = matter.read(directory + '/' + v)
      items.push(m.data)
    }
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
  var files = fs.readdirSync(baseDir)
  var templates = {}
  files.forEach(function(v,i,a) {
    if (v.endsWith(ending)) {
      var s = fs.readFileSync(baseDir + '/' + v, 'utf8')
      var name = v.substr(0, v.length - ending.length)
      templates[name] = s
    }
  })
  return templates
}

module.exports.load_templates = load_templates
module.exports.render = render
module.exports.list_posts = list_posts
