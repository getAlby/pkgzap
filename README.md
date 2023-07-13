<p align="center">
  <img width="100%" src="docs/pkgzap.png">
</p>

# pkgzap

An easy way to get the funding details of all the dependencies used in your project and send satoshis. Uses the metadata provided by package registries to fetch information about each dependency's funding sources.

## 🚀 Quick Start
### pkgzap-cli

Run it in your project's root directory with
```bash
npx pkgzap-cli
```

[See more here](/cli/README.md)

### pkgzap

```
npm install pkgzap
```
### `getFundingDetails`

```js
import { getFundingDetails } from "pkgzap";

const fundingInfo = getFundingDetails();

console.log(JSON.stringify(fundingInfo, null, 2))
```

### `fetchFundingInfo`
 
```js
import { fetchFundingInfo } from "pkgzap";

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
