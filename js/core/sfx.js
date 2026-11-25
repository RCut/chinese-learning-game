/*
 * Tiny synthesised sound effects (no audio files): the sound of arriving somewhere new.
 *   MSC.sfx.enter('street')   a short, soft burst of street ambience (traffic hush + a distant bike bell)
 *   MSC.sfx.enter('shop' | 'cafe' | 'market')   a soft door jingle (each a little different)
 * All of it is quiet and under half a second. If audio isn't available it silently does nothing.
 */
(function (MSC) {
  let ctx = null;
  const SFX = (MSC.sfx = { muted: false });
  const ac = () => {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch (e) { ctx = null; }
    return ctx;
  };

  const tone = (c, t, freq, dur, gain, type = 'sine') => {
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t); o.stop(t + dur + 0.05);
  };

  const hush = (c, t, dur, gain, lo, hi) => {                    // filtered noise = distant traffic / crowd
    const n = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(); src.buffer = buf;
    const band = c.createBiquadFilter(); band.type = 'bandpass'; band.frequency.value = (lo + hi) / 2; band.Q.value = 0.6;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + dur * 0.3);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    src.connect(band).connect(g).connect(c.destination);
    src.start(t);
  };

  const SOUNDS = {
    street(c, t) { hush(c, t, 0.7, 0.05, 150, 900); tone(c, t + 0.22, 1568, 0.18, 0.02); tone(c, t + 0.3, 1568, 0.18, 0.015); },
    shop(c, t) { tone(c, t, 1175, 0.45, 0.05); tone(c, t + 0.11, 1568, 0.5, 0.04); tone(c, t + 0.22, 1976, 0.55, 0.025); },
    cafe(c, t) { tone(c, t, 988, 0.4, 0.045); tone(c, t + 0.13, 1319, 0.5, 0.04); },
    school(c, t) { tone(c, t, 784, 0.5, 0.045); tone(c, t + 0.18, 659, 0.5, 0.04); tone(c, t + 0.36, 523, 0.7, 0.035); },
    home(c, t) { tone(c, t, 659, 0.35, 0.04); tone(c, t + 0.12, 880, 0.4, 0.035); tone(c, t + 0.24, 1047, 0.5, 0.025); },
    market(c, t) { hush(c, t, 0.55, 0.035, 300, 1800); tone(c, t + 0.05, 784, 0.3, 0.03); tone(c, t + 0.15, 988, 0.3, 0.03); tone(c, t + 0.25, 1175, 0.4, 0.03); },
  };

  SFX.enter = (kind) => {
    if (SFX.muted || !SOUNDS[kind]) return;
    const c = ac();
    if (!c) return;
    try {
      if (c.state === 'suspended') c.resume();
      SOUNDS[kind](c, c.currentTime + 0.02);
    } catch (e) { /* audio is a nicety, never a problem */ }
  };
})(window.MSC = window.MSC || {});
