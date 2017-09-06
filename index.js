/*
  oscilator
  filter
  gain

  buffer
  panner
  periodic
  script
  wave
*/

function isObject (o) {
  return o && 'object' === typeof o
}

function setup (node, opts) {
  for(var k in opts) {
    //AudioParam
    if(isObject(node[k]))
      node[k].value = opts[k]
    //normal value, i.e. type
    else
      node[k] = opts[k]
  }
  return node
}

function _all (ary, method) {
  return function (value, time) { ary.forEach(function (v) { v[method] && v[method](value, time) })}
}

function combine () {
  var args = [].slice.call(arguments)
  var last

  function connect (dest) {
    if(last) last.forEach(function (source) {
      source.connect(dest)
    })
  }

  args.forEach(function (node) {
    if(!last) last = [node]
    else if(node.numberOfInputs) {
      connect(node)
      last = [node]
    }
    else
      last.push(node)
  })

  var obj = {
    connect: connect
  }
  return new Proxy(obj, {get: function (_, property) {
    return obj[property] ? obj[property] : obj[property] = _all(args, property)
  }})
}

var A = module.exports = function () {
  var audioContext = (window.AudioContext || window.webkitAudioContext);
  var ctx = new audioContext();

  function _setup(fn) {
    if(!fn) throw new Error('expected function')
    return function (opts) { return setup(fn.call(ctx), opts) }
  }

  w = combine

  w.osc = _setup(ctx.createOscillator)
  w.gain = _setup(ctx.createGain)
  w.filter = _setup(ctx.createBiquadFilter)


  w.context = ctx
  return w
}

function connect (a, b) {
  a.connect(b)
  return combine(a, b)
}

/// ------------------------

var toFreq = require('notes-to-frequencies')

function Sequencer(notes, s, osc) {
  var stepTime = 0.125
  notes.forEach(function (v) {
    osc.noteOn(toFreq(v.note), s)
    s+=v.length*stepTime
  })
}

function noteOn (freq, time) {
  this.frequency.setValueAtTime(freq, time)
}

/////////////////////////////////////////////////////

var w = A()
var c = w(
  w.osc({type: 'sawtooth', noteOn: noteOn}),
  w.osc({type: 'sawtooth', detune: -7, noteOn: noteOn}),
  w.filter({
    type:'lowpass', Q: 10,
    frequency: 1000,
    noteOn: function (freq, time) {
      this.frequency.setValueAtTime(freq*10, time)
      this.frequency.exponentialRampToValueAtTime(freq, time+1)
    }
  }),
  w.gain({
    noteOn: function (_, time) {
      this.gain.setValueAtTime(1, time)
      this.gain.exponentialRampToValueAtTime(0.01, time+0.2)
    }
  })
)

c.connect(w.context.destination)

var notes = [
  {note: 'c2', length: 3},
  {note: 'd#2', length: 3},
  {note: 'f2', length: 3},
  {note: 'c2', length: 3},
  {note: 'd#2', length: 4},
]

var beats = [
  {note: 'c3', length: 4},
  {note: 'c3', length: 4},
  {note: 'c3', length: 4},
  {note: 'c3', length: 4}
]

var d = w.osc({noteOn: function (_, time) {
  this.frequency.setValueAtTime(400, time)
  this.frequency.exponentialRampToValueAtTime(1, time+0.3)
}})

var e = w(
  w.osc({noteOn: function (freq, time) {
    this.frequency.setValueAtTime(freq, time)
    this.frequency.exponentialRampToValueAtTime(freq/2, time+0.02)
  }}),
  w.gain({noteOn: function (_, time) {
    this.gain.setValueAtTime(0.1, time)
    this.gain.linearRampToValueAtTime(0, time+0.01)
  }})
)

d.connect(w.context.destination)
e.connect(w.context.destination)

var start = w.context.currentTime
Sequencer(notes, start, c)
Sequencer(beats, start, d)

c.start()
d.start()
e.start()

var bar = 0
e.noteOn(1600, start)
  var N = 16
  for(var i = 0; i < N; i++) {
    if(i%2) e.noteOn(1600, start+bar*2 + (i/N)*2 + 1/N/8)
    else e.noteOn(1600, start+bar*2 + (i/N)*2)
  }

setInterval(function () {
  bar++
  Sequencer(notes, start+(bar)*2, c)
  Sequencer(beats, start+(bar)*2, d)
  var N = 16
  for(var i = 0; i < N; i++) {
    if(i%2) e.noteOn(1600, start+bar*2 + (i/N)*2 + 1/N/8)
    else e.noteOn(1600, start+bar*2 + (i/N)*2)
  }
}, 2000)

