/*
 * UI TEXT — interface copy that isn't dialogue (welcome screen, quest tracker, onboarding tip).
 * Objectives stay English-only on purpose: no Chinese hints here.
 */
(function (MSC) {
  MSC.data = MSC.data || {};
  MSC.data.ui = {
    startingSpare: [4, 6, 8, 10], // extra money on top of the first café order

    onboardingTip: {
      title: 'Quick tip',
      body: 'Tap a Chinese word to hear it. Press and hold it to see the meaning. Use 🔊 to hear the whole sentence, and tap a blurred line to see the translation.',
    },

    welcome: {
      kicker: 'Today’s quest',
      title: 'Lunch at the street-corner café',
    },

    quest: [
      { id: 'menu', text: 'Check the café menu' },
      { id: 'order', text: 'Order a drink and a meal from Barista Lin' },
    ],

    destinations: [
      { id: 'menu', title: 'Café Menu', subtitle: 'See what’s on today and what it costs' },
      { id: 'barista', title: 'Barista Lin', subtitle: 'Order and pay for your lunch' },
      { id: 'signpost', title: 'Signpost', subtitle: 'Find your way around the corner' },
      { id: 'wang', title: 'Master Wang', subtitle: 'Learn to write characters' },
      { id: 'friend', title: 'Xiao Li', subtitle: 'Chat — a new conversation every time' },
      { id: 'cart', title: 'Fruit Stall', subtitle: 'Buy some fruit for later' },
      { id: 'passerby', title: 'Lost Traveler', subtitle: 'Someone looks lost — help them out' },
    ],
  };
})(window.MSC = window.MSC || {});
