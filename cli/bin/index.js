#!/usr/bin/env node
import {webln} from 'alby-js-sdk'
import { LightningAddress } from 'alby-tools'
import chalk from 'chalk'
import fs from 'fs'
import readline from 'readline'
import 'websocket-polyfill';
import * as crypto from 'node:crypto';
import { fetchFundingInfo } from 'fund-ln-lib';
import os from 'os';

global.crypto = crypto;

function encryptData(data, password) {
  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256');
  const iv = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return salt.toString('hex') + iv.toString('hex') + encrypted.toString('hex')
}

function decryptData(cipher, password) {
  const salt = Buffer.from(cipher.slice(0, 32), 'hex');
  const iv = Buffer.from(cipher.slice(32, 64), 'hex');
  const key = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256');
  let encryptedText = Buffer.from(cipher.slice(64), 'hex');

  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

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
  console.log("Authentication Successful. Saving the NostrWalletConnect URL...");
  const password = await waitForInput(chalk.magenta(`Enter a password to encrypt the NWC URL: `));
  fs.writeFile(nwcPath, encryptData(nwcData, password), (err) => {
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
  console.log(chalk.yellow(`Send sats to your project's dependencies!`))

  let packageJsonData
  try {
    packageJsonData = await fs.promises.readFile('package.json', 'utf8');
  } catch (e) {
    console.error(chalk.red("Error reading package.json, does it exist?"));
    console.error(chalk.red("Aborting..."));
    process.exit(1);
  }

  const fundingInfo = await fetchFundingInfo(JSON.parse(packageJsonData), 1, process);
  const deps = Object.keys(fundingInfo).length;
  process.stdout.clearLine(0);
  if (!deps) {
    console.log(chalk.yellow(`\rNo dependencies with lightning details found :(`))
    console.log(chalk.cyan(`Let them developers know how they can receive sats: https://getalby.github.io/npm-fund-ln/#developer`))
    process.exit();
  }
  console.log(chalk.cyan(`\rFound ${deps} dependencies with lightning details.`))

  const amount = await waitForInput(chalk.magenta(`How much do you want to send in total? Amount (in sats): `));

  let nwc;
  try {
    const nwcData = await fs.promises.readFile(nwcPath, 'utf8');
    if (!nwcData) throw new Error("no nwc data");
    console.log(chalk.cyan('Trying to fetch NWC with the provided URL...'));
    const password = await waitForInput(chalk.magenta(`Enter your password to decrypt the NWC URL: `));
    nwc = new webln.NostrWebLNProvider({ nostrWalletConnectUrl: decryptData(nwcData, password) });
  } catch (e) {
    if (e.message.indexOf("bad decrypt") !== -1) {
      console.log(chalk.red('Invalid password, authenticate again.'));
    }
    nwc = await authenticate();
  }

  await nwc.enable();

  const satsPerDep = Math.floor(amount/deps);
  console.log(`Supporting ${deps} packages with ${satsPerDep} sats each...`);

  for (const [pkgName, lnAddress] of Object.entries(fundingInfo)) {
    await payLNDependencyOwner(nwc, pkgName, lnAddress, Math.floor(amount/deps));
  }

  process.exit();

}

cli()