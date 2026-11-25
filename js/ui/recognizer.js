/*
 * Speech recognition (browser) — one small wrapper shared by every "Speak" mode (Barista Lin, Xiao Li).
 *   MSC.recognizer.start({ onInterim(text), onFinal(text), onError(code), onEnd() })
 * The recogniser rarely gets tones right, so callers compare by syllable bases first (see pinyin.sameBases).
 */
(function (MSC) {
  let rec = null;
  const R = (MSC.recognizer = {});
  R.supported = () => !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  R.active = () => !!rec;
  R.stop = () => { if (rec) { try { rec.stop(); } catch (e) { /* already stopped */ } } };
  /** Returns false when recognition cannot start here (the caller shows a message). */
  R.start = (h) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { h.onError('unsupported'); return false; }
    try {
      const r = (rec = new SR());
      r.lang = 'zh-CN'; r.interimResults = true; r.maxAlternatives = 3;
      r.onresult = (ev) => {
        let fin = '', interim = '';
        for (let i = ev.resultIndex; i < ev.results.length; i++) (ev.results[i].isFinal ? (fin += ev.results[i][0].transcript) : (interim += ev.results[i][0].transcript));
        if (interim && h.onInterim) h.onInterim(interim);
        if (fin) h.onFinal(fin);
      };
      r.onerror = (err) => h.onError((err && err.error) || 'error');
      r.onend = () => { rec = null; if (h.onEnd) h.onEnd(); };
      r.start();
      return true;
    } catch (e) { rec = null; h.onError('start-failed'); return false; }
  };
})(window.MSC = window.MSC || {});
