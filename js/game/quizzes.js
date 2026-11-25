/*
 * Object encounters: menu board, signpost, fruit stall, lost traveler.
 * Each factory returns a quiz { prompt, board, items[], wrong, success, grammarHint, clue, xp, onSolved, … }
 * built from data/quests.js + data/menu.js. State per quiz lives in S.quizzes[key].
 */
(function (MSC) {
  const U = MSC.util, S = MSC.state;
  const Q = MSC.data.quests;
  const M = MSC.data.menu;
  const QZ = {};

  const factories = {
    menu() {
      const q = Q.menu;
      const target = U.pick(MSC.economy.menu());
      const others = U.shuffle(MSC.economy.menu().filter((i) => i.id !== target.id)).slice(0, 2);
      const vars = { item: target.hanzi, itemEn: target.english, price: U.priceHanzi(target.price), priceNum: target.price };
      return {
        key: 'menu', title: q.title, hanzi: q.hanzi, badge: q.badge, instruction: q.instruction, board: 'menu',
        prompt: U.fillLine(q.customer, vars),
        items: U.shuffle([target, ...others]).map((i) => ({ hanzi: i.hanzi, english: i.english, correct: i.id === target.id })),
        wrong: q.wrong, success: U.fillLine(q.success, vars),
        grammarHint: q.grammarHint, clue: U.fill(q.clue, { item: target.hanzi, pinyin: MSC.dict.sentencePinyin(target.hanzi) }),
        xp: q.xp, xpLabel: 'Checked the café menu', repeatLabel: q.repeatLabel,
        onSolved() { if (!S.story.menuChecked) { S.story.menuChecked = true; MSC.log.say('✅ Menu checked — now you can order from Barista Lin.'); } },
      };
    },

    signpost() {
      const q = Q.signpost;
      const places = U.shuffle(q.landmarks).slice(0, 3);
      const rows = q.directions.map((d, i) => ({ ...d, place: places[i] }));
      const target = U.pick(rows);
      const vars = { place: target.place.hanzi, placeEn: target.place.english };
      return {
        key: 'signpost', title: q.title, hanzi: q.hanzi, badge: q.badge, instruction: q.instruction,
        board: 'sign',
        signLines: rows.map((r) => ({ hanzi: U.fill(q.signLine, { arrow: r.arrow, dir: r.hanzi, place: r.place.hanzi }) })),
        prompt: U.fillLine(q.question, vars),
        items: U.shuffle(rows).map((r) => ({
          ...U.fillLine(q.option, { dir: r.hanzi, dirEn: U.capitalize(r.english) }), correct: r === target,
        })),
        wrong: q.wrong, success: U.fillLine(q.success, vars),
        grammarHint: q.grammarHint, clue: U.fill(q.clue, { place: target.place.hanzi }),
        xp: q.xp, xpLabel: 'Read the signpost', repeatLabel: q.repeatLabel,
      };
    },

    cart() {
      const q = Q.cart;
      const f = U.pick(M.fruits);
      const total = f.unitPrice * 2;
      const wrongTotal = total + U.pick([2, 3, 4]);
      const vars = {
        fruit: f.hanzi, plural: f.plural, pluralEn: f.plural, unit: U.priceHanzi(f.unitPrice), unitNum: f.unitPrice,
        total: U.priceHanzi(total), totalNum: total, wrongTotal: U.priceHanzi(wrongTotal), wrongTotalNum: wrongTotal,
        wrongMeasure: f.wrongMeasure, wrongMeasureEn: f.wrongMeasureEnglish,
      };
      const o = q.options;
      const opt = (spec, correct) => ({ ...U.fillLine(spec, vars), correct, why: spec.why ? U.fill(spec.why, vars) : '' });
      return {
        key: 'cart', title: q.title, hanzi: q.hanzi, badge: q.badge, instruction: q.instruction,
        prompt: U.fillLine(q.greeting, vars),
        items: U.shuffle([opt(o.correct, true), opt(o.er, false), opt(o.measure, false), opt(o.math, false)]),
        wrong: q.wrong,
        success: U.fillLine(q.success, vars),
        successBroke: U.fillLine(q.successBroke, vars),
        grammarHint: q.grammarHint, clue: U.fill(q.clue, vars),
        xp: q.xp, xpLabel: `Bought two ${f.plural}`, repeatLabel: q.repeatLabel,
        total, what: `two ${f.plural}`,
      };
    },

    passerby() {
      const q = Q.passerby;
      const prev = S.quizzes.passerby && S.quizzes.passerby.quiz && S.quizzes.passerby.quiz.prompt.hanzi;
      const enc = U.pick(q.encounters.filter((e) => e.question.hanzi !== prev).concat(q.encounters.length === 1 ? q.encounters : []));
      return {
        key: 'passerby', title: q.title, hanzi: q.hanzi, badge: U.fill(q.badge, { tip: q.tip }), instruction: q.instruction,
        prompt: enc.question,
        items: U.shuffle([{ ...enc.correct, correct: true }, ...enc.distractors.map((d) => ({ ...d, correct: false }))]),
        wrong: q.wrong, success: q.success,
        grammarHint: q.grammarHint, clue: enc.clue,
        xp: q.xp, xpLabel: 'Helped the traveler', repeatLabel: q.repeatLabel,
        onSolved() { MSC.economy.earn(q.tip, 'tip from the traveler'); },
      };
    },
  };

  const fresh = (key) => ({ quiz: factories[key](), selected: null, attempts: 0, solved: false, hint: 0, reaction: null });
  QZ.state = (key) => (S.quizzes[key] = S.quizzes[key] || fresh(key));
  QZ.renew = (key) => { S.quizzes[key] = fresh(key); return S.quizzes[key]; };
  QZ.has = (key) => !!factories[key];

  /** Submit the selected option. Returns { ok, first }. */
  QZ.submit = (key) => {
    const st = QZ.state(key), quiz = st.quiz;
    const item = quiz.items[st.selected];
    if (!item) return null;
    if (item.correct) {
      const first = !st.solved;
      st.solved = true;
      if (first) {                                                    // picking the right reply: a recognition use of its words
        const f = MSC.stage.find(key);
        const words = MSC.dict.segment(item.hanzi).flatMap((t) => (t.kind === 'word' ? [t.hanzi] : t.kind === 'number' ? t.parts : []));
        MSC.mastery.record(words, MSC.mastery.quality({ hint: st.hint, mistakes: st.attempts, recognition: true }), f ? f.stage : key);
      }
      let reply = quiz.success;
      if (first) {
        if (key === 'cart') {
          if (S.money >= quiz.total) { MSC.economy.spend(quiz.total, quiz.what); }
          else reply = quiz.successBroke;
        }
        MSC.addXP(quiz.xp, quiz.xpLabel);
        if (quiz.onSolved) quiz.onSolved();
      }
      st.reaction = { type: 'success', ...reply };
      return { ok: true, first };
    }
    st.attempts++;
    st.hint = Math.max(st.hint, Math.min(st.attempts, 2));
    st.reaction = { type: 'retry', hanzi: quiz.wrong.hanzi, english: quiz.wrong.english + (item.why ? ` ${item.why}` : '') };
    return { ok: false, first: false };
  };

  MSC.quizzes = QZ;
})(window.MSC = window.MSC || {});
