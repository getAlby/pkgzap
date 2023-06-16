<p align="center">
  <img width="100%" src="docs/fund-ln-lib.png">
</p>

# fund-ln-lib

Fetch funding details of all the dependencies used in your project and send satoshis. Uses the metadata provided by package registries to fetch information about each dependency's funding sources.

## 🤙 Usage

```
npm install fund-ln-lib
```
### `getFundingDetails`

```js
import { getFundingDetails } from "fund-ln-lib";

const fundingInfo = getFundingDetails();

console.log(JSON.stringify(fundingInfo, null, 2))
```

This defaults to fetching details in `package.json` of your current directory with a depth of 1. However you can customize this as follows:

```js
const path = "path-to-your/package.json"
const levels = 2 // depth i.e. dependencies of dependencies
const fundingInfo = getFundingDetails(path, levels);

console.log(JSON.stringify(fundingInfo, null, 2))
```


### `fetchFundingInfo`

If you want to fetch the funding data from some arbitrary JSON retrieved from an API or some other source instead of a file, you can use this function

```js
import { fetchFundingInfo } from "npm-fund-ln";

const fundingInfo = fetchFundingInfo(packageJsonData); // depth is defaulted to 1

console.log(JSON.stringify(fundingInfo, null, 2))
```

You can also use this method to fetch the funding info from a file:

```js
import { fetchFundingInfo } from "npm-fund-ln";

const packageJsonData = await fs.promises.readFile('package.json', 'utf8');
const fundingInfo = fetchFundingInfo(JSON.parse(packageJsonData), 2);

console.log(JSON.stringify(fundingInfo, null, 2))
```

## How to add funding info to your dependencies?

In your `package.json` file, add the following:
```
"funding": {
  "type": "lightning",
  "url": "lightning:satoshi@getalby.com"
}
```
This would help `fund-ln-lib` methods to pick your lightning address when your dependency users boost you!
