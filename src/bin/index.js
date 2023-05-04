import {webln} from 'alby-js-sdk'
import { LightningAddress } from 'alby-tools'
import chalk from 'chalk'
import fs from 'fs'
import readline from 'readline'
import dotenv from 'dotenv'
import 'websocket-polyfill';
import * as crypto from 'node:crypto';
import { getFundingDetails } from "../index";

global.crypto = crypto;

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function waitForInput(question) {
  return new Promise(resolve => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
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
    console.error(chalk.yellow(packageName + ": ") + chalk.red(e.error || e));
    console.error(chalk.red("Aborting..."));
    process.exit(1);
  }
  return;
}

export async function cli() {
  const amount = await waitForInput(chalk.magenta(`Enter an amount: `));
  const ans = await waitForInput(`Do you wish to include indirect dependencies (deps of deps)? (Y/N): `);
  const includeIndirectDeps = (ans.toLowerCase() === "y" || ans.toLowerCase() === "yes") ? true : false;

  if (!includeIndirectDeps) {
    console.log(chalk.yellow(`Excluding indirect dependencies...`))
  }
  const nwcURL = process.env.NWC_URL || '';

  let nwc;
  try {
    if (nwcURL) {
      console.log(chalk.cyan('Trying to fetch NWC with the provided URL...'));
      nwc = new webln.NostrWebLNProvider({ nostrWalletConnectUrl: nwcURL });
    } else {
      nwc = webln.NostrWebLNProvider.withNewSecret();
      const url = await nwc.getAuthorizationUrl({ name: 'npm-ln' });
      console.log(chalk.green(`Please approve the NWC connection: ${chalk.blue.underline(url)}`))
      await waitForInput(`And press enter/return to continue...`);
      const envData = `NWC_URL=${nwc.getNostrWalletConnectUrl()}`;
      console.log("Saving the NostrWalletConnect URL...");
      fs.writeFile('.env', envData, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log('Saved!');
      });
    }
    await nwc.enable();
  } catch (e) {
    console.error(chalk.red(e.error || e));
    process.exit(1);
  }

  const fundingInfo = await getFundingDetails({includeIndirectDeps});
  const deps = Object.keys(fundingInfo).length;
  console.log(chalk.cyan(`Found ${deps} dependencies with lightning details.`))
  for (const [pkgName, fundInfo] of Object.entries(fundingInfo)) {
    await payLNDependencyOwner(nwc, pkgName, fundInfo.funding.url, Math.floor(amount/deps));
  }

  process.exit();

}