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
  constructor (options) {

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
  send_request (options) {

    const argument_options = options;

    // Promise wrapper function
    function promiseWrapper (resolve, reject) {

      // Build options
      const options = this.__build_options (argument_options);

      // Build API request URL from options
      const url = this.__build_request_url (options);

      // Create request
      fetch (url)

        // Grab response
        .then (response => {

          // Turn JSON response into array
          return response.json ();
        })

        // Grab json data
        .then (json => {

          // Resolve promise with fetched data
          return resolve (json);
        })

        // Catch any errors
        .catch (err => {

          // Reject promise with error
          return reject (err);
        });
    };

    // Return promise
    return new Promise (promiseWrapper.bind (this));
  }

  __build_options (argument_options) {

    // Create default options
    const default_options = {
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
    let options = Object.assign (
      {},                     // empty object to merge into
      default_options,        // merge default options first
      this.options     || {}, // merge class-level options second
      argument_options || {}  // merge argument options last
    );

    // Sanitize: Force limit to be a positive integer.
    options.limit = Math.abs (options.limit|0);

    // Sanitize: Make currency an uppercase string.
    options.currency = String (options.currency || 'USD').toUpperCase ();

    // Test currency against supported currencies
    if (!SUPPORTED_CURRENCIES.includes (options.currency)) {
      throw new Error (`Unsupported currency: ${options.currency}`);
    }

    // If the id is truthy, we want to fetch a single currency
    if (options.id) {
      options._fetch_custom = true;
    }

    // If the currency is not USD, we want to do a conversion
    if (options.currency !== 'USD') {
      options._convert_currency = true;
    }

    return options;
  }

  __build_request_url (options) {

    // Start with base url
    let url = 'https://api.coinmarketcap.com/v1/ticker/';

    // Test if a specific cryptocurrency should be fetched
    if (options._fetch_custom) {

      // Add cryptocurrency id to url
      url += `${options.id}/`;
    }

    // Add ? symbol to url
    url += '?';

    // Test if a limit should be added
    if ((options.limit|0) > 0) {
      url += `&limit=${options.limit}`;
    }

    // Test if a currency conversion should be done
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
  constructor (connector) {

    // Set class-level connector
    this.connector = connector || new CoinMarketCapConnector ();

    // Create cache and last cache
    this.cache = [];
    this.last_cache = [];
  }

  cache_diff (options) {
  }

  /**
   * Queries the cached data.
   * Retrieves new data in case nothing is cached.
   *
   * @param {any} options
   * @memberof CoinMarketCapProvider
   */
  query (options) {

    // TODO: Add more sophisticated logic here

    // For now, just return the __retrieve_cached promise
    return this.__retrieve_cached (options);
  }

  /**
   * Fills the cache by retrieving all cryptocurrencies.
   *
   * @memberof CoinMarketCapProvider
   */
  fill_cache () {

    // Promise wrapper function
    function promiseWrapper (resolve, reject) {

      // Send request
      this.send_request ({
        cache: true, // cache request
      }).then (data => {

        // Resolve with cached data
        return resolve (data);
      }).catch (err => {

        // Reject with error
        return reject (err);
      });
    }

    // Return promise
    return new Promise (promiseWrapper.bind (this));
  }

  __retrieve_cached (options) {

    // Promise wrapper function
    function promiseWrapper (resolve, reject) {

      // Test if cache is empty
      if (this.cache.length === 0) {
        return reject (new Error ('Cache is empty!'));
      }

      // Merge options
      options = Object.assign ({
        display_limit: 0,
      }, options);

      // Sanitize: Force display limit to be a non-negative integer.
      options.display_limit = Math.max (0, options.display_limit|0);

      // Create data slice
      const data = (
        options.display_limit > 0
        ? this.cache.slice (0, options.display_limit)
        : this.cache
      );

      // Resolve the promise
      return resolve (data);
    }

    // Return promise
    return new Promise (promiseWrapper.bind (this));
  }

  /**
   * Sends an API request according to the specified options.
   * Optionally, caches results.
   *
   * @param {any} options
   * @returns
   * @memberof CoinMarketCapProvider
   */
  send_request (options) {

    // Promise wrapper function
    function promiseWrapper (resolve, reject) {

      // Merge options
      options = Object.assign ({
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
      options.cache = Boolean (options.cache);

      // Send request
      this.connector.send_request (options)
        .then (data => {

          // Test if result should be cached
          if (options.cache === true) {

            // Cache result
            this.__cache_result (data);
          }

          // Resolve promise with data
          return resolve (data);
        })
        .catch (err => {

          // Reject promise with error
          return reject (err);
        });
    }

    // Return promise
    return new Promise (promiseWrapper.bind (this));
  }

  /**
   * Cache the result of an API request.
   *
   * @param {any} data
   * @memberof CoinMarketCapProvider
   */
  __cache_result (data) {

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
};
