/* Menu prices and the wallet. Prices are fixed for the session so the menu, the orders and the wallet always agree. */
(function (MSC) {
  const U = MSC.util, S = MSC.state;
  const M = MSC.data.menu;
  const E = {};

  E.init = () => {
    const mk = (kind) => (it) => ({ ...it, kind, price: U.pick(it.prices) });
    S.menuItems = [...M.drinks.map(mk('drink')), ...M.foods.map(mk('food'))];
    const drink = U.pick(S.menuItems.filter((i) => i.kind === 'drink'));
    const food = U.pick(S.menuItems.filter((i) => i.kind === 'food'));
    // Enough for a first meal plus a little spare change.
    S.money = drink.price + food.price + U.pick(MSC.data.ui.startingSpare);
  };

  /** the café items of the player's level (an item's level: `level` in data/menu.js, else 1) */
  E.menu = () => S.menuItems.filter((i) => !MSC.levels || i.level === undefined || i.level <= MSC.state.level);
  E.items = (kind) => E.menu().filter((i) => i.kind === kind);

  /** All drink + food pairs the player can currently pay for. */
  E.affordablePairs = () => {
    const out = [];
    E.items('drink').forEach((d) => E.items('food').forEach((f) => { if (d.price + f.price <= S.money) out.push([d, f]); }));
    return out;
  };

  E.spend = (amount, what) => {
    MSC.setMoney(S.money - amount);
    MSC.log.say(`💳 Paid ¥${amount} for ${what}. You have ¥${S.money} left.`);
  };
  E.earn = (amount, what) => {
    MSC.setMoney(S.money + amount);
    MSC.log.say(`💰 +¥${amount} — ${what}. You now have ¥${S.money}.`);
  };

  MSC.economy = E;
})(window.MSC = window.MSC || {});
