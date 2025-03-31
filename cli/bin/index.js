#!/usr/bin/env node
import chalk from 'chalk';
import fs from 'fs';
import { fetchFundingInfo } from '@getalby/pkgzap';
import { getAuthenticatedNWC, payLNDependencyOwner } from './payment.js';
import { waitForInput } from './utils.js';

console.log(chalk.yellow(`Send sats to your project's dependencies!`));

let packageJsonData;
try {
  packageJsonData = await fs.promises.readFile('package.json', 'utf8');
} catch (e) {
  console.error(chalk.red("Error reading package.json, does it exist?"));
  process.exit(1);
}

const fundingInfo = await fetchFundingInfo(JSON.parse(packageJsonData), 1, process);
const deps = Object.keys(fundingInfo).length;
if (!deps) {
  console.log(chalk.yellow("No dependencies with lightning details found :("));
  console.log(chalk.cyan("Let developers know how they can receive sats: https://getalby.github.io/pkgzap/#developer"));
  process.exit();
}

console.log(chalk.cyan(`Found ${deps} dependencies with lightning details.`));

const amount = await waitForInput(chalk.magenta(`How much do you want to send in total? Amount (in sats): `));

const nwc = await getAuthenticatedNWC();
await nwc.enable();

const satsPerDep = Math.floor(amount / deps);
console.log(`Supporting ${deps} packages with ${satsPerDep} sats each...`);

for (const [pkgName, lnAddress] of Object.entries(fundingInfo)) {
  await payLNDependencyOwner(nwc, pkgName, lnAddress, satsPerDep);
}

process.exit();
