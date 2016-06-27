var publish = require('../index')
var fs = require('fs')
var test = require('tape')

publish.load_items_from('testfiles', 'md')

test('load templates', function(t) {
  t.plan(2)
  var templates = publish.load_templates('testfiles', 'mustache')
  t.ok(templates, 'got an object')
  t.ok(templates.head, 'found header template')
})

test('partials', function(t) {
  t.plan(2)
  var templates = publish.load_templates('testfiles/templates', 'mustache')
  var output = publish.render('testfiles/postdir/start-a-blog.md', templates.index, {}, templates)
  var outputFile = fs.readFileSync('testfiles/output.html', 'utf8')
  t.equals(outputFile, output, 'correct output')
  var output2 = publish.render('testfiles/postdir/start-a-blog.md', templates.index, {}, templates, 'YYYY')
  var outputFile2 = fs.readFileSync('testfiles/output2.html', 'utf8')
  t.equals(outputFile2, output2, 'custom date format')
})

test('post list', function(t) {
  t.plan(4)
  var list = publish.list_posts(10)
  t.equals(2, list.length, 'found 2 items')
  t.equals('I Started A Blog', list[0].title, 'check first title')
  t.equals('Start A Blog, They Said', list[1].title, 'check second title')
  list = publish.list_posts(1)
  t.equals(1, list.length, 'truncate to 1 item')
})

test('tag list', function(t) {
  t.plan(3)
  var list = publish.list_tags()
  t.equals(Object.keys(list).length, 2, 'found 2 tags')
  t.equals(list.blog, 2, 'check "blog" tag')
  t.equals(list.first, 1, 'check "first" tag')
})

test('post list by tag', function(t) {
  t.plan(2)
  var list = publish.list_by_tag('blog')
  t.equals(list.length, 2, 'check "blog" tag has 2 items')
  list = publish.list_by_tag('first')
  t.equals(list.length, 1, 'check "first" tag has 1 item')
})
