# CMC Desktop App
CMC is an inofficial desktop client for [coinmarketcap].

## Features
- Keep track of your favorite cryptocurrencies right from your desktop
- Use the blazing fast search function to find a specific cryptocurrency
- Analyze trends and market development with the built-in growth indicators
- Convert all data to any of the supported currencies (there are plenty!)
- No need to refresh, data is updated automagically! <- worst pun

## Screenshots
<p float="left">
    <img src="preview_one.png" width="400" alt="CMC Screenshot One">
    <img src="preview_two.png" width="400" alt="CMC Screenshot Two">
</p>

## Download
[Prebuilt binaries][prebuilt] are available for Windows, Linux, and macOS (Darwin).

Building from source:
```bash
# Clone and enter repository
git clone git@github.com:SplittyDev/cmc.git
cd cmc
# Install dependencies
npm i
# Start cmc directly, with live-reload support
npm run live
# Prebuild cmc binaries for all supported platforms
npm run pack
```

Node 8.1.2+ is highly recommended for building.

[coinmarketcap]: https://coinmarketcap.com
[prebuilt]: https://github.com/SplittyDev/cmc/releases/latest
