# hyperaudio

composable web audio, inspired by hyperscript.

The basic idea is to take web audio componests and make them composable.
The main thing is a function to `connect` components, while also treating
them as a single object.

For example, we might make simple bass synth like this:
``` js
var ctx =new AudioContext()
var w = require('hyperaudio')(ctx)

//set the osc to the correct frequency
function noteOn (freq, time) {
  this.frequency.setValueAtTime(freq, time)
}
function decay(para, time, start, end, length) {
  para.setValueAtTime(start, time)
  para.exponentialRampToValueAtTime(end, time+length)
}

var c = w(
  //use two saws, slightly detuned to give a cool phasing sound
  w.osc({type: 'sawtooth', noteOn: noteOn}),
  w.osc({type: 'sawtooth', detune: -7, noteOn: noteOn}),
  //lowpass filter with some resonance and exponential envelope
  w.filter({
    type:'lowpass', Q: 10,
    frequency: 1000,
    noteOn: function (freq, time) {
      decay(this.frequency, time, freq*10, freq, 1)
    }
  }),
  //also exponential decay amplitude, for punchyness
  w.gain({
    noteOn: function (_, time) {
      decay(this.gain, time, 1, 0.001, 0.2)
    }
  })
)
```

The `hyperaudio` "w" function combines the webaudio nodes,
and returns a proxy which can control all the nodes.

so we can now trigger notes using the combined object.
``` js
//play one note
c.noteOn(440, ctx.currentTime)
c.start()
```
the proxy also calls the `noteOn` function which was added to all the nodes,
allowing the entire sound making assemblage to be easily triggered by a sequencer!


## License

MIT








