/*
 * DO NOT USE THIS MODULE!
 * 
 * This was my first attempt at fetching the coin data from coinmarketcap.com.
 * It lacks proper error checking and is not very flexible.
 * 
 * Use the new and maintained ./coinmarketcap.api.js
 */

// Constants
const DEFAULT_CURRENCY = 'USD';

function build_html_from_data (arr, currency, truncation_notice) {
    currency = currency || DEFAULT_CURRENCY;
    let html = String ();
    for (const coin of arr) {
        html += `
        <li class="coin">
            <div class="header">
                <span class"coin-name">${coin.name}</span>
                <span class="coin-symbol">${coin.symbol}</span>
            </div>
            <div class="market">
                <div class="cat cat-price">
                    <span class="title">Price</span>
                    <div class="elem">
                        <span class="label">Fiat</span>
                        <span class="value">${coin.price_usd}</span>
                        <span class="currency">${currency}</span>
                    </div>
                    <div class="elem">
                        <span class="label">Crypto</span>
                        <span class="value">${coin.price_btc}</span>
                        <span class="currency">BTC</span>
                    </div>
                </div>
                <div class="cat cat-market">
                    <span class="title">Market</span>
                    <div class="elem">
                        <span class="label">24h Volume</span>
                        <span class="value">${coin['24h_volume_usd']}</span>
                        <span class="currency">${currency}</span>
                    </div>
                    <div class="elem">
                        <span class="label">Market Cap</span>
                        <span class="value">${coin.market_cap_usd}</span>
                        <span class="currency">${currency}</span>
                    </div>
                    <div class="elem">
                        <span class="label">Available Supply</span>
                        <span class="value">${coin.available_supply}</span>
                        <span class="currency">${coin.symbol}</span>
                    </div>
                    <div class="elem">
                        <span class="label">Total Supply</span>
                        <span class="value">${coin.total_supply}</span>
                        <span class="currency">${coin.symbol}</span>
                    </div>
                </div>
                <div class="cat cat-change">
                    <span class="title">Change</span>
                    <div class="elem">
                        <span class="label">1h</span>
                        <span class="value">${coin.percent_change_1h}</span>
                        <span class="unit">%</span>
                    </div>
                    <div class="elem">
                        <span class="label">24h</span>
                        <span class="value">${coin.percent_change_24h}</span>
                        <span class="unit">%</span>
                    </div>
                    <div class="elem">
                        <span class="label">7d</span>
                        <span class="value">${coin.percent_change_7d}</span>
                        <span class="unit">%</span>
                    </div>
                </div>
            </div>
        </li>
        `;
    }
    if (truncation_notice) {
        html += `
        <li class="coin">
            <div class="truncation-notice">
                <span class="question">
                    <abbr title="Results are truncated for performance reasons.">
                        Think we're missing something?
                    </abbr>
                </span><br>
                <span class="hint">
                    <abbr title="Use the search function.">
                        Seek and you shall find.
                    </abbr>
                </span>
            </div>
        </li>
        `;
    }
    html = `<ul class="coins">${html}</ul>`;
    return html;
}

function fetch_coins (limit, filter, currency, no_htmlgen, callback) {
    const url_base = `https://api.coinmarketcap.com/v1/ticker/${filter ? filter.concat('/') : String ()}`;
    const url_params = `limit=${limit || 0}&convert=${currency || String()}`;
    const url = `${url_base}?${url_params}`;
    fetch (url)
        .then (response => {
            return response.json ();
        })
        .then (json => {
            console.log (json);
            const html = no_htmlgen ? undefined : build_html_from_data (json, currency);
            callback (json, html);
        })
        .catch (err => {
            console.log (`ERR: ${err}`);
        });
}

module.exports = {
    build_html_from_data: build_html_from_data,
    fetch_coins: fetch_coins,
};