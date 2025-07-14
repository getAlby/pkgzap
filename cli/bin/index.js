#!/usr/bin/env node
import { nwc } from "@getalby/sdk";
import { LightningAddress } from "@getalby/lightning-tools";
import chalk from "chalk";
import fs from "fs/promises";
import "websocket-polyfill";
import * as crypto from "node:crypto";
// TODO: add types in pkgzap
import { fetchFundingInfo } from "@getalby/pkgzap";
import os from "os";
import qrcode from "qrcode-terminal";
import enquirer from 'enquirer';
import { generateSecretKey, getPublicKey } from 'nostr-tools';
import { hexToBytes, bytesToHex } from "@noble/hashes/utils";
const { Select, Input, Password } = enquirer;

if (typeof global.crypto === "undefined") {
  global.crypto = crypto;
}

export async function cli() {
  console.log(chalk.yellow("Pkgzap / Send sats to your project's dependencies!"));

  const nwcClient = await getNWCClient();

  let pkg;
  try {
    const json = await fs.readFile("package.json", "utf8");
    pkg = JSON.parse(json);
  } catch (err) {
    console.error(chalk.red("Error reading package.json:"), err.message);
    console.error("Aborting...");
    process.exit(1);
  }

  const fundingInfo = await fetchFundingInfo(pkg, 1, process);
  const deps = Object.keys(fundingInfo).length;

  if (!deps) {
    console.log(chalk.yellow("No dependencies with lightning details found."));
    console.log(chalk.cyan("Learn how to add funding info: https://getalby.github.io/pkgzap/#developer"));
    process.exit();
  }

  console.log(chalk.cyan(
    `\nFound ${deps} ${
      deps === 1 ? "dependency" : "dependencies"
    } with lightning details.`
  ));

  let amount;
  try {
    amount = await new Input({
    name: "sats",
    message: "Total amount to send (in sats): ",
    validate: (value) => (!isNaN(value) ? true : "Please enter a number"),
  }).run();
  } catch {
    console.error("Aborting...");
    process.exit(1);
  }

  const satsPerDep = Math.floor(amount / deps);
  console.log(
    `Supporting ${deps} ${
      deps === 1 ? "package" : "packages"
    } with ${satsPerDep} ${
      satsPerDep === 1 ? "sat" : "sats"
    }${deps > 1 ? " each..." : "..."}`
  );

  for (const [pkgName, lnAddress] of Object.entries(fundingInfo)) {
    await zapPackage(
      nwcClient,
      pkgName,
      lnAddress,
      Math.floor(amount / deps),
    );
  }

  process.exit();
}

cli();

async function zapPackage(nwcClient, packageName, lnAddress, amount) {
  try {
    const ln = new LightningAddress(lnAddress);
    await ln.fetch();
    const invoice = await ln.requestInvoice({ satoshi: amount });
    await nwcClient.payInvoice({ invoice: invoice.paymentRequest });
    console.log(chalk.yellow(`${packageName}: `) + chalk.green(`Payment Successful!`),);
  } catch (err) {
    console.error(chalk.red(`Failed to zap ${packageName}:`), err.message);
  }
  return;
}

async function getNWCClient() {
  const homedir = os.homedir();
  const nwcPath = `${homedir}/.pkgzap`;

  // retrieval logic
  let enc;
  try {
    enc = await fs.readFile(nwcPath, "utf8");
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(chalk.red('Could not read stored NWC url.'), err.message);
    }
  }

  try {
    if (enc) {
      while (true) {
        const action = await new Select({
          name: "action",
          message: "Stored NWC url found. What would you like to do?",
          choices: [
            "Enter password",
            "Forgot password",
          ],
        }).run();
        if (action === "Forgot password") {
          await fs.unlink(nwcPath).catch(() => {});
          console.log(chalk.yellow("Stored url removed, please reconnect."));
          break;
        }
        const password = await new Password({
          name: "decryptPassword",
          message: "Enter password to decrypt stored NWC url:",
        }).run();
        const url = decryptData(enc, password);
        if (!url) {
          console.log(chalk.red("Incorrect password. Try again or reset."));
          continue;
        }
        console.log(chalk.green("Decrypted succesfully!"));
        const client = new nwc.NWCClient({ nostrWalletConnectUrl: url });
        try {
          await client.getInfo();
        } catch (error) {
          console.log(chalk.red("Invalid NWC url, please reconnect."));
          break;
        } 
        return client;
      }
    }
  } catch (err) {
    console.error("Aborting...");
    process.exit(1);
  }

  // connection logic
  let method;
  let url;
  try {
    method = await new Select({
      name: "method",
      message: "How would you like to connect to pkgzap?",
      choices: [
        "Alby Hub",
        "CoinOS",
        "Nostr Wallet Connect",
        "LN Link",
      ],
    }).run();
    switch (method) {
      case "Alby Hub": {
        const hubOption = await new Select({
          name: "hubOption",
          message: "Select Alby Hub option:",
          choices: ["Alby Cloud", "Alby Go", "Connection Secret"],
        }).run();
        if (hubOption === "Alby Cloud") {
          url = await getCloudNwcUrl(true);
        } else if (hubOption === "Alby Go") {
          url = await getAlbyGoNwcUrl();
        } else {
          url = await new Password({
            name: "secret",
            message: "Enter Connection Secret:",
          }).run();
        }
        break;
      }
      case "CoinOS": {
        url = await getCloudNwcUrl();
        break;
      }
      case "Nostr Wallet Connect": {
        url = await new Password({
          name: "nwcUrl",
          message: "Enter your Connection Secret: ",
        }).run();
        break;
      }
      case "LN Link":{
        console.log("Add a new Wallet Connection from LN Node => Generate NWC and copy the Connection Secret");
        url = await new Password({
          name: "lnLinkUrl",
          message: "Paste the Connection Secret: ",
        }).run();
        break;
      }
    }
  } catch (err) {
    console.error("Aborting...");
    process.exit(1);
  }

  let client;
  try {
    client = new nwc.NWCClient({ nostrWalletConnectUrl: url });
    await client.getInfo();
  } catch (error) {
    console.error(chalk.red("Invalid NWC url, please try again."));
    return getNWCClient();
  }

  let password;
  try {
    password = await new Password({
      name: "encryptPassword",
      message: "Set a password to encrypt your connection url:",
    }).run();
  } catch {
    console.error("Aborting...");
    process.exit(1);
  }

  try {
    await fs.writeFile(nwcPath, encryptData(url, password), "utf8");
    console.log(chalk.green(`Saved encrypted url to ${nwcPath}`));
  } catch (error) {
    console.error(chalk.red("Couldn't save NWC url."));
  }

  return client;
}

function encryptData(data, password) {
  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(password, salt, 10000, 32, "sha256");
  const iv = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return salt.toString("hex") + iv.toString("hex") + encrypted.toString("hex");
}

function decryptData(cipher, password) {
  try {
    const salt = Buffer.from(cipher.slice(0, 32), "hex");
    const iv = Buffer.from(cipher.slice(32, 64), "hex");
    const key = crypto.pbkdf2Sync(password, salt, 10000, 32, "sha256");
    let encryptedText = Buffer.from(cipher.slice(64), "hex");

    let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  } catch (error) {
    return false
  }
}

async function getCloudNwcUrl(isAlbyHub) {
  const secret = bytesToHex(generateSecretKey())
  const pubkey = getPublicKey(hexToBytes(secret))
  const authUrl = nwc.NWCClient.getAuthorizationUrl(
    isAlbyHub ? "https://my.albyhub.com/apps/new" : "https://coin.os/apps/new",
    {
      name: "pkgzap",
      requestMethods: ["pay_invoice"],
      maxAmount: 50_000_000,
      budgetRenewal: 'monthly',
    },
    pubkey
  );
  console.log(`Approve the connection: ${chalk.blue.underline(authUrl)}`)

  const nwaClient = new nwc.NWAClient({
    appPubkey: pubkey,
    appSecretKey: secret,
    relayUrl: isAlbyHub ? "wss://relay.getalby.com/v1" : "wss://relay.coinos.io",
    requestMethods: [],
  })
  const url = await new Promise((resolve, reject) => {
    nwaClient.subscribe({
      onSuccess: async (client) => {
        resolve(client.nostrWalletConnectUrl);
      },
      onError: (err) => {
        console.error(chalk.red("NWA subscription error:"), err.message);
        reject(err);
      },
    });
  });

  return url;
}

async function getAlbyGoNwcUrl() {
  const nwaClient = new nwc.NWAClient({
    relayUrl: "wss://relay.getalby.com/v1",
    name: "pkgzap",
    requestMethods: ["pay_invoice"],
    maxAmount: 50_000_000,
    budgetRenewal: 'monthly',
    // TODO: change link
    icon: "https://raw.githubusercontent.com/getAlby/pkgzap/refs/heads/main/assets/pkgzap.png"
  });

  console.log("Scan or enter the following NWA connection URI in your wallet:");
  qrcode.generate(nwaClient.connectionUri, { small: true });
  console.log(`NWA URI: ${nwaClient.connectionUri}\n`);
  console.log("Waiting for connection...\n");

  const url = await new Promise((resolve, reject) => {
    nwaClient.subscribe({
      onSuccess: async (client) => {
        resolve(client.nostrWalletConnectUrl);
      },
      onError: (err) => {
        console.error(chalk.red("NWA subscription error:"), err.message);
        reject(err);
      },
    });
  });

  return url;
}
