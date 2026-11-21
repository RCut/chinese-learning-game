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

  E.items = (kind) => S.menuItems.filter((i) => i.kind === kind);

  /** All drink + food pairs the player can currently pay for. */
  E.affordablePairs = () => {
    const out = [];
    E.items('drink').forEach((d) => E.items('food').forEach((f) => { if (d.price + f.price <= S.money) out.push([d, f]); }));
    return out;
  };

  E.spend = (amount, what) => {
    MSC.setMoney(S.money - amount);
    MSC.toast.show(`💳 Paid ¥${amount} for ${what}. You have ¥${S.money} left.`, 4500);
  };
  E.earn = (amount, what) => {
    MSC.setMoney(S.money + amount);
    MSC.toast.show(`💰 +¥${amount} — ${what}. You now have ¥${S.money}.`, 4500);
  };

  MSC.economy = E;
})(window.MSC = window.MSC || {});
