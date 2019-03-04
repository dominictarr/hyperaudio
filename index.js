var Reverb = require('soundbank-reverb')
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

var A = module.exports = function (ctx) {

  function _setup(fn) {
    if(!fn) throw new Error('expected function')
    return function (opts) { return setup(fn.call(ctx), opts) }
  }

  w = combine

  w.osc = _setup(ctx.createOscillator)
  w.gain = _setup(ctx.createGain)
  w.filter = _setup(ctx.createBiquadFilter)

  w.reverb = function (opts) {
    return setup(Reverb(ctx), opts)
  }

  w.context = ctx
  return w
}


