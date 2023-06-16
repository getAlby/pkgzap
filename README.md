<p align="center">
  <img width="100%" src="docs/npm-fund-ln.png">
</p>

# npm-fund-ln

An easy way to get the funding details of all the dependencies used in your project and send satoshis. Uses the metadata provided by package registries to fetch information about each dependency's funding sources.

## 🚀 Quick Start
### fund-ln-cli

Install the package by running
```bash
npm i fund-ln-cli
```
and run it in your project's folder with
```bash
npx fund-ln
```

[See more here](/cli/README.md)

### fund-ln-lib

```
npm install fund-ln-lib
```
### `getFundingDetails`

```js
import { getFundingDetails } from "fund-ln-lib";

const fundingInfo = getFundingDetails();

console.log(JSON.stringify(fundingInfo, null, 2))
```

### `fetchFundingInfo`
 
```js
import { fetchFundingInfo } from "npm-fund-ln";

const fundingInfo = fetchFundingInfo(packageJsonData); // depth is defaulted to 1

console.log(JSON.stringify(fundingInfo, null, 2))
```

[See more here](/lib/README.md)

## 🛠 Development

### Landing Page
```
yarn install
yarn run dev
```

And for styling:
```
npx tailwindcss -i ./src/input.css -o ./src/index.css --watch
```

### lib and cli
```
yarn install
yarn run build
```
