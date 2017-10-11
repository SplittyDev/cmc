class CoinMarketCapHtmlBuilder {

    /**
     * Creates an instance of CoinMarketCapHtmlBuilder.
     *
     * @param {any} options
     * @memberof CoinMarketCapHtmlBuilder
     */
    constructor (options) {
        this.options = options || {};
    }

    build (data, options) {

        // Merge options
        options = Object.assign ({
            currency: null,
            trunc_info_block: false,
        }, this.options || {}, options || {});

        // Sanitize: Make currency an uppercase string.
        options.currency = String (options.currency || 'USD').toUpperCase ();

        // Sanitize: Make trunc_info_block a boolean.
        options.trunc_info_block = Boolean (options.trunc_info_block);

        // Create html string
        let html = String ();

        // Iterate over cryptocurrencies
        for (const cc of data) {
            html += `
            <li class="coin">
                <div class="header">
                    <span class"coin-name">${cc.name}</span>
                    <span class="coin-symbol">${cc.symbol}</span>
                </div>
                <div class="market">
                    <div class="cat cat-price">
                        <span class="title">Price</span>
                        <div class="elem">
                            <span class="label">Fiat</span>
                            <span class="value">${cc.price_usd}</span>
                            <span class="currency">${options.currency}</span>
                        </div>
                        <div class="elem">
                            <span class="label">Crypto</span>
                            <span class="value">${cc.price_btc}</span>
                            <span class="currency">BTC</span>
                        </div>
                    </div>
                    <div class="cat cat-market">
                        <span class="title">Market</span>
                        <div class="elem">
                            <span class="label">24h Volume</span>
                            <span class="value">${cc['24h_volume_usd']}</span>
                            <span class="currency">${options.currency}</span>
                        </div>
                        <div class="elem">
                            <span class="label">Market Cap</span>
                            <span class="value">${cc.market_cap_usd}</span>
                            <span class="currency">${options.currency}</span>
                        </div>
                        <div class="elem">
                            <span class="label">Available Supply</span>
                            <span class="value">${cc.available_supply}</span>
                            <span class="currency">${cc.symbol}</span>
                        </div>
                        <div class="elem">
                            <span class="label">Total Supply</span>
                            <span class="value">${cc.total_supply}</span>
                            <span class="currency">${cc.symbol}</span>
                        </div>
                    </div>
                    <div class="cat cat-change">
                        <span class="title">Change</span>
                        <div class="elem">
                            <span class="label">1h</span>
                            <span class="value">${cc.percent_change_1h}</span>
                            <span class="unit">%</span>
                            <span class="arrow arrow-${cc.percent_change_1h > 0 ? 'up' : 'down'}">
                                ${(cc.percent_change_1h > 0) ? '&uarr;' : '&darr;'}
                            </span>
                        </div>
                        <div class="elem">
                            <span class="label">24h</span>
                            <span class="value">${cc.percent_change_24h}</span>
                            <span class="unit">%</span>
                            <span class="arrow arrow-${cc.percent_change_24h > 0 ? 'up' : 'down'}">
                            ${(cc.percent_change_24h > 0) ? '&uarr;' : '&darr;'}
                        </span>
                        </div>
                        <div class="elem">
                            <span class="label">7d</span>
                            <span class="value">${cc.percent_change_7d}</span>
                            <span class="unit">%</span>
                            <span class="arrow arrow-${cc.percent_change_7d > 0 ? 'up' : 'down'}">
                                ${(cc.percent_change_7d > 0) ? '&uarr;' : '&darr;'}
                            </span>
                        </div>
                    </div>
                </div>
            </li>
            `;
        }

        // Test if truncation info block should be included
        if (options.trunc_info_block === true) {
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

        // Wrap li elements in ul element
        html = `<ul class="coins">${html}</ul>`;

        // Return built html structure
        return html;
    }
}

module.exports = {
    HtmlBuilder: CoinMarketCapHtmlBuilder,
};
