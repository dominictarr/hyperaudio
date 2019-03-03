var path = require('path')

var loop = require('./example'), _loop
var id = require.resolve('./example')
var _c
require('fs').watch(path.join(__dirname, 'example.js'), {recursive: true}, function (e, filename) {
  require('module')._cache[id] = null
  _loop = require('./example')
})

function Context () {
  return require('./')(new (window.AudioContext || window.webkitAudioContext)())
}

var c = Context()
var play = loop(c, 0.125)

play.connect(c.context.destination)
//play(c.context.currentTime)
play.noteOn(null, c.context.currentTime)

setInterval(function () {
  if(_loop) {
    play = _loop(c, 0.125)
    loop = _loop
    _loop = null
  }
  play.noteOn(null, c.context.currentTime)
}, 1000*(0.125*16))

