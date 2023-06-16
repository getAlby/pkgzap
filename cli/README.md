<p align="center">
  <img width="100%" src="../docs/fund-ln-cli.png">
</p>

# fund-ln-cli

⚡️ Boost your project dependencies via lightning!

## How to boost?

Install the package by running
```bash
npm i fund-ln-cli
```
and run it with
```bash
npx fund-ln
```


#### ⌛ It will start analyzing your dependencies using your package.json file:
```
Send sats to your project's dependencies!
Analyzing your package.json...
Found 21 dependencies with lightning details.
```

#### 🚀 Specify the amount you want to send to these dependencies:
```
How much do you want to send in total? Amount (in sats): 2100
```

#### ✅ Approve the connection request to connect your wallet:
```
Please approve the NWC connection: https://nwc.getalby.com/apps/new?c=npm-fund-ln&pubkey=g3tal6yf3a42c15883c68e623dfe653515506dd945e29386c46e3832d6212121
And press enter/return to continue...
```

#### 💾 The NWC URL would be encrypted and saved in your device for future use.
```
Authentication Successful. Saving the NostrWalletConnect URL...
Enter a password to encrypt the NWC URL: g3tal6y
Saved in /Users/satoshi/.fund-ln
```

#### ⚡️ Sit back and watch NWC do the rest!
```
Supporting 21 packages with 100 sats each...
crazy-ln-tools: Payment Successful!
fund-ln-cli: Payment Successful!
fund-ln-lib: Payment Successful!
ln-zapper: Payment Successful!
...
```

## How to receive sats to your dependencies?
In your `package.json` file, add the following:
```
"funding": {
  "type": "lightning",
  "url": "lightning:satoshi@getalby.com"
}
```
This would help `fund-ln-cli` to pick your lightning address when your dependency users boost you!


## 🧐 Troubleshooting

If you run into the following error:
```
file:///Users/satoshi/your-project/node_modules/fund-ln-cli/bin/index.js:12
global.crypto = crypto;
              ^

TypeError: Cannot set property crypto of #<Object> which has only a getter
    at file:///Users/satoshi/Coding/your-project/node_modules/fund-ln-cli/bin/index.js:12:15
    at ModuleJob.run (node:internal/modules/esm/module_job:193:25)
    at async Promise.all (index 0)
    at async ESMLoader.import (node:internal/modules/esm/loader:518:24)
    at async loadESM (node:internal/process/esm_loader:102:5)
    at async handleMainPromise (node:internal/modules/run_main:66:12)

```

Make sure you're NOT using Node.js v19 as `fund-ln-cli` is not supported in node versions >19.