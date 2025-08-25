<p align="center">
  <img width="100%" src="../docs/pkgzap-banner.png">
</p>

# ⚡️ PkgZap

Get bitcoin tips from projects using your packages and support devs of your project's dependencies.

## 🫰 How It Works? (For Supporters)

### 1) Run this command in your project's root folder:

```bash
npx @getalby/pkgzap-cli
```

### 2) Connect a Wallet

Securely connect any [NWC wallet](https://nwc.dev/) from the options.

### 3) Choose Amount and Pay

Enter desired total amount you want to split among all supported dependencies and enjoy the sats flowing!

## 🧑‍💻 How It Works? (For Developers)

### 1) Add wallet info to `package.json`

As a package developer you only have to add your lightning address to your `package.json` file:

```json
"funding": {
  "type": "lightning",
  "url": "lightning:yourname@getalby.com"
}
```

### 2) Publish Package

Push your latest version to npm like you always do using `npm publish`.

### 3) That’s it! You’re fundable.

People can now tip your package!

# 🧐 Troubleshooting

If you run into the following error:
```
file:///Users/satoshi/your-project/node_modules/pkgzap-cli/bin/index.js:12
global.crypto = crypto;
              ^

TypeError: Cannot set property crypto of #<Object> which has only a getter
    at file:///Users/satoshi/Coding/your-project/node_modules/pkgzap-cli/bin/index.js:12:15
    at ModuleJob.run (node:internal/modules/esm/module_job:193:25)
    at async Promise.all (index 0)
    at async ESMLoader.import (node:internal/modules/esm/loader:518:24)
    at async loadESM (node:internal/process/esm_loader:102:5)
    at async handleMainPromise (node:internal/modules/run_main:66:12)
```

Make sure you're NOT using Node.js v19 as `pkgzap-cli` is not supported in node versions >19.
