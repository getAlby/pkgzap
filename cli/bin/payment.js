import { LightningAddress } from 'alby-tools';
import chalk from 'chalk';
import fs from 'fs';
import { authenticate, decryptData } from './auth.js';
import { waitForInput } from './utils.js';
import { NWC_PATH } from './config.js';

export async function payLNDependencyOwner(nwc, packageName, lnAddress, amount) {
  try {
    const ln = new LightningAddress(lnAddress);
    await ln.fetch();
    const invoice = await ln.requestInvoice({ satoshi: amount });

    await nwc.sendPayment(invoice.paymentRequest);
    console.info(chalk.yellow(`${packageName}: `) + chalk.green(`Payment Successful!`));
  } catch (e) {
    console.error(chalk.red(e.error || e));
    if (e.error === 'The public key does not have a wallet connected.') {
      console.error(chalk.yellow("Try again to authenticate."));
      await fs.promises.writeFile(NWC_PATH, "");
    }
    console.error(chalk.red("Aborting..."));
    process.exit(1);
  }
}

export async function getAuthenticatedNWC() {
  try {
    const nwcData = await fs.promises.readFile(NWC_PATH, 'utf8');
    if (!nwcData) throw new Error("no nwc data");
    
    console.log(chalk.cyan('Trying to fetch NWC with the provided URL...'));
    const password = await waitForInput(chalk.magenta(`Enter your password to decrypt the NWC URL: `));

    return new webln.NostrWebLNProvider({ nostrWalletConnectUrl: decryptData(nwcData, password) });
  } catch (e) {
    if (e.message.includes("bad decrypt")) {
      console.log(chalk.red('Invalid password, authenticate again.'));
    }
    return await authenticate();
  }
}
