/* Text-to-speech (Web Speech API) with Mandarin voice selection and a flash-on-play helper. */
(function (MSC) {
  const S = MSC.state;
  const sp = {};
  let requestId = 0;

  const zhVoices = () => {
    if (!('speechSynthesis' in window)) return [];
    return (speechSynthesis.getVoices() || []).filter((v) => {
      const lang = (v.lang || '').toLowerCase();
      const name = (v.name || '').toLowerCase();
      return lang.startsWith('zh') || lang.includes('cmn') || /chinese|mandarin|tingting|meijia|sinji|普通话|國語/.test(name);
    });
  };

  sp.initVoices = () => {
    const select = document.getElementById('voice-select');
    if (!('speechSynthesis' in window)) { select.innerHTML = '<option>Speech unsupported</option>'; return; }
    const populate = () => {
      const voices = zhVoices();
      if (!voices.length) { select.innerHTML = '<option value="">Default Mandarin</option>'; return; }
      if (!voices.some((v) => v.voiceURI === S.voiceURI)) {
        const pick = voices.find((v) => /google/i.test(v.name) && /cn/i.test(v.lang))
          || voices.find((v) => /tingting/i.test(v.name)) || voices.find((v) => /zh-cn/i.test(v.lang)) || voices[0];
        S.voiceURI = pick.voiceURI;
      }
      select.innerHTML = voices.map((v) => `<option value="${MSC.util.esc(v.voiceURI)}" ${v.voiceURI === S.voiceURI ? 'selected' : ''}>${MSC.util.esc(v.name)} (${MSC.util.esc(v.lang)})</option>`).join('');
    };
    populate();
    speechSynthesis.onvoiceschanged = populate;
    select.addEventListener('change', () => { S.voiceURI = select.value; sp.say('你好'); });
  };

  sp.flash = (el) => {
    if (!el || !el.classList) return;
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
  };

  const clean = (text) => {
    const t = String(text || '').replace(/[^㐀-鿿0-9，。！？、；：“”‘’（）…\s]/g, '').replace(/\s+/g, '');
    return /[㐀-鿿]/.test(t) ? t : '';
  };

  /** Speak Chinese text (a word or a whole sentence). */
  sp.say = (text, el) => {
    sp.flash(el);
    const out = clean(text);
    if (!out || !('speechSynthesis' in window)) return;
    const id = ++requestId;
    try {
      const synth = speechSynthesis;
      const busy = synth.speaking || synth.pending;
      if (busy) synth.cancel();
      const voice = zhVoices().find((v) => v.voiceURI === S.voiceURI) || zhVoices()[0] || null;
      const macTingting = /Mac/i.test(navigator.platform || '') && voice && /tingting/i.test(voice.name || '');
      const start = () => {
        if (id !== requestId) return;
        const u = new SpeechSynthesisUtterance(out);
        if (voice && !macTingting) { u.voice = voice; u.lang = voice.lang || 'zh-CN'; } else { u.lang = 'zh-CN'; }
        u.rate = S.rate;
        u.onerror = (evt) => {
          if (evt && (evt.error === 'canceled' || evt.error === 'interrupted')) return;
          if (id !== requestId) return;
          const f = new SpeechSynthesisUtterance(out); f.lang = 'zh-CN'; f.rate = S.rate; synth.speak(f);
        };
        synth.speak(u);
      };
      busy ? setTimeout(start, 55) : start();
    } catch (err) { console.warn('Speech error', err); }
  };

  sp.toggleRate = () => {
    S.rate = S.rate === 0.85 ? 0.65 : 0.85;
    document.getElementById('rate-btn').textContent = `${S.rate}×`;
    MSC.toast.show(`Voice speed: ${S.rate}×`);
  };

  MSC.speech = sp;
})(window.MSC = window.MSC || {});
