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

var obj_filter = function( obj, p ) {
  var result = {}
  for (var key in obj) {
    if (obj.hasOwnProperty(key) && p(obj[key])) {
      result[key] = obj[key]
    }
  }
  return result
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

var item_by_slug = function(slug) {
  return cached_items[slug]
}

var list_posts = function(max) {
  var items = []
  for (var i in cached_items) {
    items.push(cached_items[i])
  }
  return revsort(items, 'publish').slice(0, max)
}

var list_by_tag = function(tag) {
  var result = obj_filter( cached_items, function(o) {
    return (o.tags && o.tags.contains(tag))
  })
  var items = []
  for (var i in result) {
    items.push(result[i])
  }
  return revsort(items, 'publish').slice(0, 10)  
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

var get_render_data = function(filename, data, dformat) {
  if (!dformat) dformat = date_format
  var parsed = matter.read(filename)
  var jsonData = xtend(parsed.data, data)
  jsonData.content = marked(parsed.content)
  if (jsonData.publish) {
    var publishdate = moment.tz(jsonData.publish, 'UTC').format(dformat)
    jsonData.publish = publishdate
  }
  return jsonData
}

var render = function(filename, template, data, partials) {
  var dformat = date_format
  if (arguments['4']) {
    dformat = arguments['4']
  }
  var jsonData = get_render_data(filename, data, dformat)
  return mustache.render(template, jsonData, partials)
}

var render_index = function(template, data, partials) {
  var p = list_posts(10)
  data.posts = []
  p.forEach(function(v,i,a) {
    var jsonData = get_render_data(v.filename, {}, date_format)
    data.posts.push(jsonData)
  })
  return mustache.render(template, data, partials)
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
module.exports.item_by_slug = item_by_slug
module.exports.load_templates = load_templates
module.exports.render = render
module.exports.render_index = render_index
module.exports.list_posts = list_posts
module.exports.list_tags = list_tags
module.exports.list_by_tag = list_by_tag
