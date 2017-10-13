/*
 * Interface for fetching information from the coinmarketcap.com API.
 * Author: Marco Quinten (SplittyDev)
 */

// Constants
const SUPPORTED_CURRENCIES = [
  'USD', // special case
  'AUD', 'BRL', 'CAD',
  'CHF', 'CLP', 'CNY',
  'CZK', 'DKK', 'EUR',
  'GBP', 'HKD', 'HUF',
  'IDR', 'ILS', 'INR',
  'JPY', 'KRW', 'MXN',
  'MYR', 'NOK', 'NZD',
  'PHP', 'PKR', 'PLN',
  'RUB', 'SEK', 'SGD',
  'THB', 'TRY', 'TWD',
  'ZAR',
];

// CoinMarketCap Connector class.
// Provides basic functionality.
class CoinMarketCapConnector {
  /**
   * Creates an instance of CoinMarketCapAPI.
   *
   * @param {object} options
   * @memberof CoinMarketCapAPI
   */
  constructor(options) {
    // Set class-level options
    this.options = options || {};
  }

  /**
   * Send an API request according to the specified options.
   *
   * @param {object} options
   * @param {any} next
   * @memberof CoinMarketCapAPI
   */
  sendRequest(options) {
    // Promise wrapper function
    function promiseWrapper(resolve, reject) {
      // Build options
      // eslint-disable-next-line no-underscore-dangle
      const finalOptions = this.buildOptions(options);

      // Build API request URL from options
      // eslint-disable-next-line no-underscore-dangle
      const url = CoinMarketCapConnector.buildRequestUrl(finalOptions);

      // Create request
      fetch(url)

        // Grab response
        .then(response => response.json())

        // Grab json data
        .then(json => resolve(json))

        // Catch any errors
        .catch(err => reject(err));
    }

    // Return promise
    return new Promise(promiseWrapper.bind(this));
  }

  buildOptions(options) {
    // Create default options
    const defaultOptions = {
      // Max amount of fetched cryptocurrencies.
      // A value of zero means no limit.
      limit: 0,
      // Currency to be used for fiat money based stats.
      // Anything else than 'USD' will trigger a conversion.
      currency: 'USD',
      // Id of the cryptocurrency to fetch.
      // A truthy value will try to fetch a specific cryptocurrency.
      id: null,
      // Internal: Fetch custom cryptocurrency.
      _fetch_custom: false,
      // Internal: Do currency conversion.
      _convert_currency: false,
    };

    // Merge options correctly
    const finalOptions = Object.assign(
      // empty object to merge into
      {},
      // merge default options first
      defaultOptions,
      // merge class-level options second
      this.options || {},
      // merge argument options last
      // eslint-disable-next-line comma-dangle
      options || {}
    );

    // Sanitize: Force limit to be a positive integer.
    // eslint-disable-next-line no-bitwise
    finalOptions.limit = Math.abs(finalOptions.limit | 0);

    // Sanitize: Make currency an uppercase string.
    finalOptions.currency = String(finalOptions.currency || 'USD').toUpperCase();

    // Test currency against supported currencies
    if (!SUPPORTED_CURRENCIES.includes(finalOptions.currency)) {
      throw new Error(`Unsupported currency: ${finalOptions.currency}`);
    }

    // If the id is truthy, we want to fetch a single currency
    if (finalOptions.id) {
      // eslint-disable-next-line no-underscore-dangle
      finalOptions._fetch_custom = true;
    }

    // If the currency is not USD, we want to do a conversion
    if (finalOptions.currency !== 'USD') {
      // eslint-disable-next-line no-underscore-dangle
      finalOptions._convert_currency = true;
    }

    // Return valid and sanitized options
    return finalOptions;
  }

  static buildRequestUrl(options) {
    // Start with base url
    let url = 'https://api.coinmarketcap.com/v1/ticker/';

    // Test if a specific cryptocurrency should be fetched
    // eslint-disable-next-line no-underscore-dangle
    if (options._fetch_custom) {
      // Add cryptocurrency id to url
      url += `${options.id}/`;
    }

    // Add ? symbol to url
    url += '?';

    // Test if a limit should be added
    // eslint-disable-next-line no-underscore-dangle, no-bitwise
    if ((options.limit | 0) > 0) {
      url += `&limit=${options.limit}`;
    }

    // Test if a currency conversion should be done
    // eslint-disable-next-line no-underscore-dangle
    if (options._convert_currency) {
      url += `&convert=${options.currency}`;
    }

    // Return API request url
    return url;
  }
}

// CoinMarketCap Provider class.
// Provides abstractions such as caching.
class CoinMarketCapProvider {
  /**
   * Creates an instance of CoinMarketCapProvider.
   *
   * @param {CoinMarketCapConnector} connector
   * @memberof CoinMarketCapProvider
   */
  constructor(connector) {
    // Set class-level connector
    this.connector = connector || new CoinMarketCapConnector();

    // Create cache and last cache
    this.cache = [];
    this.last_cache = [];
  }

  // TODO
  // static cache_diff(options) {
  // }

  /**
   * Queries the cached data.
   * Retrieves new data in case nothing is cached.
   *
   * @param {any} options
   * @memberof CoinMarketCapProvider
   */
  query(options) {
    // TODO: Add more sophisticated logic here

    // For now, just return the __retrieve_cached promise
    // eslint-disable-next-line no-underscore-dangle
    return this.__retrieveCached(options);
  }

  /**
   * Fills the cache by retrieving all cryptocurrencies.
   *
   * @memberof CoinMarketCapProvider
   */
  fillCache(options) {
    // Promise wrapper function
    function promiseWrapper(resolve, reject) {
      // Build options
      const finalOptions = Object.assign(options || {}, {
        cache: true, // cache request
      });
      // Send request
      this.sendRequest(finalOptions)
        .then(data => resolve(data))
        .catch(err => reject(err));
    }

    // Return promise
    return new Promise(promiseWrapper.bind(this));
  }

  __retrieveCached(options) {
    // Promise wrapper function
    function promiseWrapper(resolve, reject) {
      // Test if cache is empty
      if (this.cache.length === 0) {
        return reject(new Error('Cache is empty!'));
      }

      // Merge options
      const finalOptions = Object.assign({
        display_limit: 0,
      }, options);

      // Sanitize: Force display limit to be a non-negative integer.
      // eslint-disable-next-line no-bitwise
      finalOptions.display_limit = Math.max(0, finalOptions.display_limit | 0);

      // Create data slice
      const data = (
        finalOptions.display_limit > 0
          ? this.cache.slice(0, finalOptions.display_limit)
          : this.cache
      );

      // Resolve the promise
      return resolve(data);
    }

    // Return promise
    return new Promise(promiseWrapper.bind(this));
  }

  /**
   * Sends an API request according to the specified options.
   * Optionally, caches results.
   *
   * @param {any} options
   * @returns
   * @memberof CoinMarketCapProvider
   */
  sendRequest(options) {
    // Promise wrapper function
    function promiseWrapper(resolve, reject) {
      // Merge options
      const finalOptions = Object.assign({
        /*
         * Provider options.
         */
        // Whether the result should be cached.
        cache: false,
        /*
         * Connector options.
         * No sanitation needed here.
         */
        limit: 0,
        currency: null,
        id: null,
      }, options);

      // Sanitize: Make cache a boolean
      finalOptions.cache = Boolean(options.cache);

      // Send request
      this.connector.sendRequest(finalOptions)
        .then((data) => {
          // Test if result should be cached
          if (finalOptions.cache === true) {
            // Cache result
            // eslint-disable-next-line no-underscore-dangle
            this.__cacheResult(data);
          }

          // Resolve promise with data
          return resolve(data);
        })
        .catch(err => reject(err));
    }

    // Return promise
    return new Promise(promiseWrapper.bind(this));
  }

  /**
   * Cache the result of an API request.
   *
   * @param {any} data
   * @memberof CoinMarketCapProvider
   */
  __cacheResult(data) {
    // Update last cache
    this.last_cache = this.cache;

    // Override old data
    this.cache = data;
  }
}

// Exports
module.exports = {
  Connector: CoinMarketCapConnector,
  Provider: CoinMarketCapProvider,
  SupportedCurrencies: SUPPORTED_CURRENCIES,
};
