var argv = require('yargs').argv
var fs = require('fs')
var path = require('path')
var glob = require('glob')
var xtend = require('xtend')
var matter = require('gray-matter')
var marked = require('marked')
var mustache = require('mustache')
var moment = require('moment')

var date_format = 'ddd, MMM Do YYYY, h:mm:ss a'

var revsort = function(arr,key) {
  return arr.sort(function(a,b) {
    return (a[key] > b[key]) ? -1 : ((a[key] < b[key]) ? 1 : 0)
  })
}

var list_items = function(directory, ending) {
  var search_path = directory + '/**/*.' + ending
  var files = glob.sync(search_path)
  var items = []
  files.forEach(function(v,i,a) {
    var m = matter.read(v)
    items.push(m.data)
  })
  return items
}

var list_posts = function(directory, ending, size) {
  var items = list_items(directory, ending)
  return revsort(items, 'publish').slice(0,size+1)
}

var list_tags = function(directory, ending) {
  var tags = {}
  var items = list_items(directory, ending)
  items.forEach(function(v,i,a) {
    v.tags.forEach(function(t) {
      if (tags[t]) tags[t] += 1
      else tags[t] = 1
    })
  })
  return tags
}

var render = function(filename, template, data, partials) {
  var dformat = date_format
  if (arguments['4']) {
    dformat = arguments['4']
  }
  var parsed = matter.read(filename)
  var jsonData = xtend(parsed.data, data)
  var publishdate = moment(jsonData.publish).format(dformat)
  jsonData.content = marked(parsed.content)
  jsonData.publish = publishdate
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
module.exports.list_tags = list_tags
