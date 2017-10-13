// Constants
const DISPLAY_LIMIT = 20;
const FETCH_INTV = 20000;

// Require electron remote
// eslint-disable-next-line import/no-extraneous-dependencies
const { remote } = require('electron');

// Require new and shiny API.
const { Connector, Provider } = require('../js/coinmarketcap.api.js');
const { HtmlBuilder } = require('../js/htmlbuilder.js');

// Create instances
const connector = new Connector();
const provider = new Provider(connector);
const builder = new HtmlBuilder();

// Grab HTML elements
const container = document.getElementsByClassName('container')[0];
const searchBar = document.querySelector('.search-bar-input');

const getRemoteState = () => Object.assign({}, remote.getGlobal('cmcstate'));

const updateDom = async () => {
  // Get cached data
  // eslint-disable-next-line no-underscore-dangle
  const data = await provider.__retrieveCached({
    display_limit: DISPLAY_LIMIT,
    currency: getRemoteState().currency,
  });

  // Build html representation
  container.innerHTML = builder.build(data, {
    trunc_info_block: true,
    currency: getRemoteState().currency,
  });
};

const fetchInitialize = async () => {
  // Fill cache
  await provider.fillCache({
    currency: getRemoteState().currency,
  });

  // Update DOM
  updateDom();
};

const updateDomDynamic = async () => {
  // Test if search-bar is empty
  if (searchBar.value.length === 0) {
    // Update DOM from cache
    updateDom();
    return;
  }

  // Initialize variables
  let match = false;
  const altMatches = [];

  // Grab cached data
  // eslint-disable-next-line no-underscore-dangle
  const data = await provider.__retrieveCached({
    currency: getRemoteState().currency,
  });

  // Iterate over cached coins
  data.forEach((coin) => {
    // Get lowercase search term
    const value = searchBar.value.toLowerCase();

    // Test if search term matches any coins
    if (
      coin.symbol.toLowerCase() === value
      || coin.id.toLowerCase() === value
      || coin.name.toLowerCase() === value
    ) {
      // We found a match
      match = true;

      // Update DOM with cached data
      container.innerHTML = builder.build([coin], {
        currency: getRemoteState().currency,
      });
    } else if (true // Test if alternative cryptocurrency matches
      && coin.name.toLowerCase().includes(value)
      && altMatches.length < DISPLAY_LIMIT
    ) altMatches.push(coin); // Add cryptocurrency to match list
  });

  // Test if alternative matches were found
  if (!match && altMatches.length > 0) {
    // Update DOM with matched data
    container.innerHTML = builder.build(altMatches, {
      currency: getRemoteState().currency,
    });
  } else if (!match) {
    container.innerHTML = '<div class="placeholder">Cryptocurrency not found :(</div>';
  }
};

// Initialize cache and update DOM
fetchInitialize();

// Set update interval
setInterval(() => {
  // Update cache
  provider.fillCache({
    currency: getRemoteState().currency,
  }).then(() => {
    // Update DOM dynamically
    updateDomDynamic();
    // eslint-disable-next-line no-console
  }).catch(err => console.error(err));
}, FETCH_INTV);

// Periodically check for currency-conversion change
let oldRemoteState = getRemoteState();
setInterval(() => {
  const newRemoteState = getRemoteState();
  if (oldRemoteState.currency !== newRemoteState.currency) {
    provider.fillCache({
      currency: newRemoteState.currency,
    }).then(() => updateDomDynamic());
  }
  oldRemoteState = newRemoteState;
}, 500);

// Handle search functionality
searchBar.oninput = updateDomDynamic;
