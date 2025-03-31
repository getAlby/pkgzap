import { webln } from 'alby-js-sdk';
import chalk from 'chalk';
import fs from 'fs';
import * as crypto from 'node:crypto';
import { NWC_PATH } from './config.js';
import { waitForInput } from './utils.js';

global.crypto = crypto;

export function encryptWithAES(data, password) {
  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256');
  const iv = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return salt.toString('hex') + iv.toString('hex') + encrypted.toString('hex');
}

export function decryptWithAES(cipher, password) {
  const salt = Buffer.from(cipher.slice(0, 32), 'hex');
  const iv = Buffer.from(cipher.slice(32, 64), 'hex');
  const key = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256');
  let encryptedText = Buffer.from(cipher.slice(64), 'hex');

  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

export async function setupNWCAuthentication() {
  const nwc = webln.NostrWebLNProvider.withNewSecret();
  const url = await nwc.getAuthorizationUrl({ name: 'pkgzap' });
  console.log(chalk.green(`Please approve the NWC connection: ${chalk.blue.underline(url)}`));
  await waitForInput(`And press enter/return to continue...`);

  const nwcData = nwc.getNostrWalletConnectUrl();
  console.log("Authentication Successful. Saving the NostrWalletConnect URL...");
  const password = await waitForInput(chalk.magenta(`Enter a password to encrypt the NWC URL: `));

  await fs.promises.writeFile(NWC_PATH, encryptData(nwcData, password));

  console.log(chalk.green(`Saved in ${NWC_PATH}`));
  return nwc;
}
