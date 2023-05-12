<p align="center">
  <img width="100%" src="docs/Header.png">
</p>

# npm-fund-ln

An easy way to get the funding details of all the dependencies used in your project and send satoshis. Uses the metadata provided by package registries to fetch information about each dependency's funding sources.

## 🚀 Quick Start

```
npm install npm-fund-ln
```

## 🤙 Usage
### getFundingDetails
```js
import { getFundingDetails } from "npm-fund-ln";

const fundingInfo = getFundingDetails();

console.log(JSON.stringify(fundingInfo, null, 2))

```

#### 💡 `includeIndirectDeps`
If you need all the dependencies, i.e. deps being used by the deps you use, you can set the `includeIndirectDeps` to true
```js
import { getFundingDetails } from "npm-fund-ln";

const fundingInfo = getFundingDetails({includeIndirectDeps: true});

console.log(JSON.stringify(fundingInfo, null, 2))

```

### In the CLI
Install the package by running
```bash
npm install -g npm-fund-ln
```
and run it with
```bash
npm fund-ln
```

## 🛠 Development

```
yarn install
yarn run build
```
