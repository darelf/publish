var publish = require('../index')
var fs = require('fs')
var test = require('tape')

test('load templates', function(t) {
  t.plan(1)
  var templates = publish.load_templates('testfiles', 'mustache')
  t.ok(templates, 'got an object')
})

test('partials', function(t) {
  t.plan(1)
  var templates = publish.load_templates('testfiles', 'mustache')
  var output = publish.render('testfiles/start-a-blog.md', templates.index, {}, templates)
  var outputFile = fs.readFileSync('testfiles/output.html', 'utf8')
  t.equals(outputFile, output, 'correct output')
})

test('post list', function(t) {
  t.plan(2)
  var list = publish.list_posts('testfiles', 'md', 5)
  t.equals(2, list.length, 'found 2 items')
  t.equals('I Started A Blog', list[0].title, 'check first title')
})
