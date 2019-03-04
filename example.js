module.exports = function run (w, step) {
  var toFreq = require('notes-to-frequencies')

  function Sequencer(notes, s, osc) {
    var stepTime = step
    notes.forEach(function (v) {
      osc.noteOn(toFreq(v.note), s)
      s+=v.length*step
    })
  }

  function noteOn (freq, time) {
    this.frequency.setValueAtTime(freq, time)
  }

  /////////////////////////////////////////////////////

  function decay(para, time, start, end, length) {
    para.setValueAtTime(start, time)
    para.exponentialRampToValueAtTime(end, time+length)
  }

  var c = w(
    w.osc({type: 'sawtooth', noteOn: noteOn}),
    w.osc({type: 'sawtooth', detune: -7, noteOn: noteOn}),
    w.filter({
      type:'lowpass', Q: 15,
//      frequency: 500,
      noteOn: function (freq, time) {
        decay(this.frequency, time, freq*5, freq*2, 1.8)
      }
    }),
    w.gain({
      noteOn: function (_, time) {
        decay(this.gain,  time, 5, 0.001, 1)
      }
    }),
    w.reverb({dry: 1, wet: 0.8, time: 0.5})
  )

//  c.connect(w.context.destination)

  var notes = [
    {note: 'c2', length: 3},
    {note: 'd#2', length: 3},
    {note: 'f2', length: 3},
    {note: 'c2', length: 3},
    {note: 'd#2', length: 4}

//    {note: 'c2', length: 3},
//    {note: 'd#2', length: 2},
//    {note: 'f3', length: 3},
//    {note: 'c2', length: 2},
//    {note: 'd#3', length: 3},
//    {note: 'g#3', length: 3},
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
      this.frequency.exponentialRampToValueAtTime(freq/2, time+0.01)
    }}),
    w.gain({noteOn: function (_, time) {
      this.gain.setValueAtTime(0.1, time)
      this.gain.linearRampToValueAtTime(0, time+0.01)
    }})
  )

//  d.connect(w.context.destination)
//  e.connect(w.context.destination)

  var start = w.context.currentTime

var g =      w.gain({gain: 1, 
  noteOn: function (_, time) {
    Sequencer(notes, time, c)
    Sequencer(beats, time, d)
    var N = 16
    for(var i = 0; i < N; i++) {
      if(i%2) e.noteOn(1600, time+bar*2 + (i/N)*2 + 1/N/8)
      else e.noteOn(1600, time+bar*2 + (i/N)*2)
    }
  }
})

w(c, g)
w(d, g)
w(e, g)

  c.start()
  d.start()
  e.start()

//  g.connect(w.context.destination)

  var bar = 0
  e.noteOn(1600, start)
    var N = 16
    for(var i = 0; i < N; i++) {
      if(i%2) e.noteOn(1600, start+bar*2 + (i/N)*2 + 1/N/8)
      else e.noteOn(1600, start+bar*2 + (i/N)*2)
    }

  return g

  return function (start) {
    Sequencer(notes, start, c)
    Sequencer(beats, start, d)

//    bar++
//    Sequencer(notes, start+(bar)*2, c)
//    Sequencer(beats, start+(bar)*2, d)
  }

}














