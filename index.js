var argv = require('yargs').argv
var fs = require('fs')
var path = require('path')
var glob = require('glob')
var xtend = require('xtend')
var matter = require('gray-matter')
var marked = require('marked')
var mustache = require('mustache')
var moment = require('moment-timezone')

var date_format = 'ddd, MMM Do YYYY, h:mm:ss a (z)'

var cached_items = {}

var revsort = function(arr,key) {
  return arr.sort(function(a,b) {
    return (a[key] > b[key]) ? -1 : ((a[key] < b[key]) ? 1 : 0)
  })
}

var load_items_from = function(directory, ending) {
  cached_items = {}
  var search_path = directory + '/**/*.' + ending
  var files = glob.sync(search_path)
  files.forEach(function(v,i,a) {
    var m = matter.read(v)
    var slug = path.basename(v, '.' + ending)
    cached_items[slug] = m.data
    cached_items[slug].filename = v
  })
  return cached_items
}


var list_posts = function() {
  var items = []
  for (var i in cached_items) {
    items.push(cached_items[i])
  }
  return revsort(items, 'publish')
}

var list_tags = function() {
  var tags = {}
  
  for(var i in cached_items) {
    cached_items[i].tags.forEach(function(t) {
      if (tags[t]) tags[t] += 1
      else tags[t] = 1
    })
  }
  return tags
}

var render = function(filename, template, data, partials) {
  var dformat = date_format
  if (arguments['4']) {
    dformat = arguments['4']
  }
  var parsed = matter.read(filename)
  var jsonData = xtend(parsed.data, data)
  var publishdate = moment.tz(jsonData.publish, 'UTC').format(dformat)
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

module.exports.load_items_from = load_items_from
module.exports.load_templates = load_templates
module.exports.render = render
module.exports.list_posts = list_posts
module.exports.list_tags = list_tags
