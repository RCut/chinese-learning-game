/*
 * Barista Lin's café orders. A "round" is: order a drink → order food → ask the total (and pay).
 * Every round is built from the current menu prices and the player's actual wallet, so a second visit
 * reflects what was already spent. Accepted answers and tile decks are derived from data/quests.js + data/menu.js.
 */
(function (MSC) {
  const U = MSC.util, D = MSC.dict, P = MSC.pinyin, S = MSC.state;
  const Q = MSC.data.quests.barista;
  const B = {};

  const orderHanzi = (item) => `${U.qtyHanzi(item.qty)}${item.measure}${item.hanzi}`;

  function tilesFor(targetHanzi) {
    const core = D.segment(targetHanzi).filter((t) => t.kind === 'word').map((t) => t.hanzi);
    const own = new Set(core);
    const pool = S.vocab.filter((h) => {
      const e = D.get(h);
      return e && !own.has(h) && e.pos !== 'phrase' && e.pos !== 'particle' && h.length <= 3;
    });
    const clutter = U.shuffle(pool).slice(0, 5);
    return U.shuffle([...core, ...clutter]);
  }

  function makeStep(spec) {
    const target = D.segment(spec.targetHanzi);
    return {
      ...spec,
      targetTokens: target,
      accepted: spec.acceptedHanzi.map((h) => D.syllables(h)).filter(Boolean).map((arr) => arr.map(P.fromNum)),
      tiles: tilesFor(spec.targetHanzi),
      state: { tray: [], recall: '', eval: null, attempts: 0, solved: false, hint: 0, reaction: null },
    };
  }

  /** Builds the next order from what the player can afford right now. Returns null when nothing is affordable. */
  B.newRound = () => {
    const pairs = MSC.economy.affordablePairs();
    if (!pairs.length) { S.round = null; return null; }
    const [drink, food] = U.pick(pairs);
    const otherFood = U.pick(MSC.economy.items('food').filter((f) => f.id !== food.id));
    const total = drink.price + food.price;
    const firstRound = !S.round && !S.story.questDone;
    const drinkOrder = orderHanzi(drink), foodOrder = orderHanzi(food);
    const vars = {
      order: drinkOrder, orderEn: drink.orderEnglish, food: food.hanzi, foodEn: food.english,
      other: otherFood.hanzi, otherEn: otherFood.english,
    };
    const patterns = (kind) => Q.orderPatterns[kind].map((p) => U.fill(p, { order: kind === 'drink' ? drinkOrder : foodOrder }));
    const steps = [
      makeStep({
        id: 'drink', item: drink,
        npc: firstRound ? drink.greeting : MSC.data.menu.againGreeting,
        goal: U.fill(Q.goals.drink, vars),
        targetHanzi: `我要${drinkOrder}`, acceptedHanzi: patterns('drink'),
        grammarHint: drink.grammarHint,
        success: U.fillLine(Q.drinkSuccess, { order: drinkOrder, orderEn: drink.orderEnglish }),
      }),
      makeStep({
        id: 'food', item: food,
        npc: U.fillLine(Q.foodPrompt, vars),
        goal: U.fill(Q.goals.food, { orderEn: food.orderEnglish }),
        targetHanzi: `我要${foodOrder}`, acceptedHanzi: patterns('food'),
        grammarHint: food.grammarHint,
        success: U.fillLine(Q.foodSuccess, { order: foodOrder, orderEn: food.orderEnglish }),
      }),
      makeStep({
        id: 'price', item: null,
        npc: U.fillLine(Q.pricePrompt, { orders: `${drinkOrder}，${foodOrder}`, ordersEn: `${drink.orderEnglish} and ${food.orderEnglish}` }),
        goal: Q.goals.price,
        targetHanzi: Q.priceTarget, acceptedHanzi: Q.priceAccepted,
        grammarHint: Q.priceGrammarHint,
        success: U.fillLine(Q.priceSuccess, { total: U.priceHanzi(total), totalNum: total }),
      }),
    ];
    S.round = { drink, food, total, steps, step: 0, paid: false };
    return S.round;
  };

  B.step = () => (S.round ? S.round.steps[S.round.step] : null);

  /** "我 (wǒ) = I + 要 (yào) = to want …" — the on-demand word-by-word clue. */
  B.clue = (step) => U.fill(Q.clue, {
    tokens: step.targetTokens.filter((t) => t.kind !== 'text')
      .map((t) => `${t.hanzi} (${D.tokenPinyin(t)}) = ${D.tokenEnglish(t)}`).join(' + '),
  });

  const joinBases = (syls) => ` ${syls.map((s) => s.base).join(' ')} `;

  function mistake(step, user) {
    const R = Q.reactions;
    const ub = joinBases(user);
    // another item the player named — but not one hidden inside the ordered item (茶 in 热茶), and the longest match wins
    const want = step.item ? joinBases(D.syllables(step.item.hanzi).map(P.fromNum)) : '';
    const wrongItem = S.menuItems.filter((it) => {
      if (step.item && it.id === step.item.id) return false;
      const jb = joinBases(D.syllables(it.hanzi).map(P.fromNum));
      return ub.includes(jb) && !want.includes(jb);
    }).sort((x, y) => y.hanzi.length - x.hanzi.length)[0];
    if (wrongItem && step.item) {
      if (wrongItem.price > S.money) {
        return U.fillLine(R.notEnoughMoney, { item: wrongItem.hanzi, itemEn: wrongItem.english, price: U.priceHanzi(wrongItem.price), priceNum: wrongItem.price, money: U.priceHanzi(S.money), moneyNum: S.money });
      }
      return U.fillLine(R.otherItem, { item: wrongItem.hanzi, itemEn: wrongItem.english });
    }
    const hasTone = (base, tone) => user.some((s) => s.base === base && s.tone === tone);
    if (hasTone('bei', 4)) return R.beiTone;
    if (hasTone('wo', 4)) return R.woTone;
    if (hasTone('wan', 4)) return R.wanTone;
    if (/ er (wan|ge|bei) /.test(ub)) return R.erBeforeMeasure;
    if (step.accepted.some((alt) => P.sameBases(alt, user))) return R.tonesOff;
    return R.notUnderstood;
  }

  /** Check an answer (array of syllables). Mutates the step state; returns { ok, firstSolve }. */
  B.check = (step, user, withEval) => {
    const st = step.state;
    if (withEval) st.eval = P.evaluate(user, step.targetTokens);
    if (step.accepted.some((alt) => P.sameSentence(alt, user))) {
      const first = !st.solved;
      st.solved = true;
      st.reaction = { type: 'success', ...step.success };
      return { ok: true, first };
    }
    st.attempts++;
    st.hint = Math.max(st.hint, Math.min(st.attempts, 2));   // a failed answer opens the next hint level
    st.reaction = { type: 'retry', ...mistake(step, user) };
    return { ok: false, first: false };
  };

  /** Called the first time the price step is solved. */
  B.settle = () => {
    const r = S.round;
    if (!r || r.paid) return;
    r.paid = true;
    MSC.economy.spend(r.total, 'your café order');
    if (!S.story.questDone) { S.story.questDone = true; MSC.log.say('✅ Quest complete: you ordered lunch!'); }
    if (MSC.levels) MSC.levels.flag('ordered');
  };

  MSC.barista = B;
})(window.MSC = window.MSC || {});
