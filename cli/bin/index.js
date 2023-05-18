#!/usr/bin/env node
import {webln} from 'alby-js-sdk'
import { LightningAddress } from 'alby-tools'
import chalk from 'chalk'
import fs from 'fs'
import readline from 'readline'
import 'websocket-polyfill';
import * as crypto from 'node:crypto';
import { fetchFundingInfo } from "fund-ln-lib";
import os from 'os';

global.crypto = crypto;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const homedir = os.homedir();
const nwcPath = `${homedir}/.fund-ln`;

function waitForInput(question) {
  return new Promise(resolve => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function authenticate() {
  const nwc = webln.NostrWebLNProvider.withNewSecret();
  const url = await nwc.getAuthorizationUrl({ name: 'npm-fund-ln' });
  console.log(chalk.green(`Please approve the NWC connection: ${chalk.blue.underline(url)}`))
  await waitForInput(`And press enter/return to continue...`);

  const nwcData = nwc.getNostrWalletConnectUrl();
  console.log("Saving the NostrWalletConnect URL...");
  fs.writeFile(nwcPath, nwcData, (err) => {
    if (err) {
      console.error(chalk.red("Error saving NostrWalletConnect URL"));
      console.error(chalk.red(err.error || err));
      return;
    }
    console.log(chalk.green(`Saved in ${nwcPath}`));
  });
  return nwc;
}

async function payLNDependencyOwner(nwc, packageName, lnAddress, amount) {
  try {
    const ln = new LightningAddress(lnAddress);
    await ln.fetch();
    const invoice = await ln.requestInvoice({satoshi: amount});

    await nwc.sendPayment(invoice.paymentRequest);
    console.info(chalk.yellow(packageName + ": ") + chalk.green(`Payment Successful!`));
  }
  catch (e) {
    console.error(chalk.red(e.error || e));
    if (e.error === 'The public key does not have a wallet connected.') {
      console.error(chalk.yellow("Try again to authenticate."));
      fs.writeFile(nwcPath, "", (err) => {
        if (err) {
          console.error(chalk.red("Error removing NostrWalletConnect URL"));
          console.error(chalk.red(err.error || err));
          return;
        }
      });
    }
    console.error(chalk.red("Aborting..."));
    process.exit(1);
  }
  return;
}

export async function cli() {
  const amount = await waitForInput(chalk.magenta(`Enter an amount: `));

  let nwc;
  try {
    const nwcURL = await fs.promises.readFile(nwcPath, 'utf8');
    if (!nwcURL) throw new Error();
    console.log(chalk.cyan('Trying to fetch NWC with the provided URL...'));
    nwc = new webln.NostrWebLNProvider({ nostrWalletConnectUrl: nwcURL });
  } catch (e) {
    nwc = await authenticate();
  }

  await nwc.enable();
  const packageJsonData = await fs.promises.readFile('package.json', 'utf8');
  const fundingInfo = await fetchFundingInfo(JSON.parse(packageJsonData));
  const deps = Object.keys(fundingInfo).length;
  console.log(chalk.cyan(`Found ${deps} dependencies with lightning details.`))
  for (const [pkgName, lnAddress] of Object.entries(fundingInfo)) {
    await payLNDependencyOwner(nwc, pkgName, lnAddress, Math.floor(amount/deps));
  }

  process.exit();

}

cli()