#!/usr/bin/env node
import { LightningAddress } from "@getalby/lightning-tools";
import { fetchFundingInfo } from "@getalby/pkgzap";
import { nwc } from "@getalby/sdk";
import { input, password, select } from "@inquirer/prompts";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import chalk from "chalk";
import fs from "fs/promises";
import * as crypto from "node:crypto";
import { generateSecretKey, getPublicKey } from "nostr-tools";
import os from "os";
import qrcode from "qrcode-terminal";
import "websocket-polyfill";

if (typeof global.crypto === "undefined") {
  global.crypto = crypto;
}

process.on("SIGINT", () => {
  console.info("👋 until next time!");
  process.exit();
});

process.on("uncaughtException", (error) => {
  if (error instanceof Error && error.name === "ExitPromptError") {
    console.info("👋 until next time!");
    process.exit();
  } else {
    // Rethrow unknown errors
    throw error;
  }
});

export async function cli() {
  console.info(
    chalk.yellow("Pkgzap / Send sats to your project's dependencies!")
  );

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
    console.info(chalk.yellow("No dependencies with lightning details found."));
    console.info(
      chalk.cyan(
        "Learn how to add funding info: https://getalby.github.io/pkgzap/#developer"
      )
    );
    process.exit();
  }

  console.info(
    chalk.cyan(
      `\nFound ${deps} ${
        deps === 1 ? "dependency" : "dependencies"
      } with lightning details.`
    )
  );

  const amount = await input({
    message: "Total amount to send (in sats): ",
    validate: (value) => {
      if (!value) {
        return "Please enter a valid amount";
      }
      const n = Number(value);
      if (isNaN(n) || n <= 0) {
        return "Please enter a valid amount";
      }
      return true;
    },
  });

  const satsPerDep = Math.floor(amount / deps);
  console.info(
    `Supporting ${deps} ${
      deps === 1 ? "package" : "packages"
    } with ${satsPerDep} ${
      satsPerDep === 1 ? "sat" : "sats"
    }${deps > 1 ? " each..." : "..."}`
  );

  for (const [pkgName, lnAddress] of Object.entries(fundingInfo)) {
    await zapPackage(nwcClient, pkgName, lnAddress, Math.floor(amount / deps));
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
    console.info(
      chalk.yellow(`${packageName}: `) + chalk.green(`Payment Successful!`)
    );
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
    if (err.code !== "ENOENT") {
      console.error(chalk.red("Could not read stored NWC url."), err.message);
    }
  }

  if (enc) {
    while (true) {
      const action = await select({
        message: "Stored NWC url found. What would you like to do?",
        choices: ["Enter password", "Forgot password"],
      });
      if (action === "Forgot password") {
        await fs.unlink(nwcPath).catch(() => {});
        console.info(chalk.yellow("Stored url removed, please reconnect."));
        break;
      }
      const pwd = await password({
        message: "Enter password to decrypt stored NWC url:",
      });
      const url = decryptData(enc, pwd);
      if (!url) {
        console.info(chalk.red("Incorrect password. Try again or reset."));
        continue;
      }
      console.info(chalk.green("Decrypted succesfully!"));
      const client = new nwc.NWCClient({ nostrWalletConnectUrl: url });
      try {
        await client.getInfo();
      } catch (error) {
        console.info(chalk.red("Invalid NWC url, please reconnect."));
        break;
      }
      return client;
    }
  }

  // connection logic
  let url;
  const method = await select({
    message: "How would you like to connect to pkgzap?",
    choices: ["Alby Hub", "CoinOS", "Nostr Wallet Connect", "LN Link"],
  });
  switch (method) {
    case "Alby Hub": {
      const hubOption = await select({
        message: "Select Alby Hub option:",
        choices: ["Alby Cloud", "Alby Go", "Connection Secret"],
      });
      if (hubOption === "Alby Cloud") {
        url = await getCloudNwcUrl(true);
      } else if (hubOption === "Alby Go") {
        url = await getAlbyGoNwcUrl();
      } else {
        url = await password({
          message: "Enter Connection Secret:",
        });
      }
      break;
    }
    case "CoinOS": {
      url = await getCloudNwcUrl();
      break;
    }
    case "Nostr Wallet Connect": {
      url = await password({
        message: "Enter your Connection Secret: ",
      });
      break;
    }
    case "LN Link": {
      console.info(
        "Add a new Wallet Connection from LN Node => Generate NWC and copy the Connection Secret"
      );
      url = await password({
        message: "Paste the Connection Secret: ",
      });
      break;
    }
  }

  let client;
  try {
    client = new nwc.NWCClient({ nostrWalletConnectUrl: url });
    await client.getInfo();
  } catch (error) {
    console.error(chalk.red("Invalid NWC url, please try again."));
    return getNWCClient();
  }

  const pwd = await password({
    message: "Set a password to encrypt your connection url:",
  });

  try {
    await fs.writeFile(nwcPath, encryptData(url, pwd), "utf8");
    console.info(chalk.green(`Saved encrypted url to ${nwcPath}`));
  } catch (error) {
    console.error(chalk.red("Couldn't save NWC url."));
  }

  return client;
}

function encryptData(data, password) {
  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(password, salt, 10000, 32, "sha256");
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return salt.toString("hex") + iv.toString("hex") + encrypted.toString("hex");
}

function decryptData(cipher, password) {
  try {
    const salt = Buffer.from(cipher.slice(0, 32), "hex");
    const iv = Buffer.from(cipher.slice(32, 64), "hex");
    const key = crypto.pbkdf2Sync(password, salt, 10000, 32, "sha256");
    const encryptedText = Buffer.from(cipher.slice(64), "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    return false;
  }
}

async function getCloudNwcUrl(isAlbyHub) {
  const secret = bytesToHex(generateSecretKey());
  const pubkey = getPublicKey(hexToBytes(secret));
  const authUrl = nwc.NWCClient.getAuthorizationUrl(
    isAlbyHub ? "https://my.albyhub.com/apps/new" : "https://coin.os/apps/new",
    {
      name: "pkgzap",
      requestMethods: ["pay_invoice"],
      maxAmount: 50_000_000,
      budgetRenewal: "monthly",
    },
    pubkey
  );
  console.info(`Approve the connection: ${chalk.blue.underline(authUrl)}`);

  const nwaClient = new nwc.NWAClient({
    appSecretKey: secret,
    relayUrl: isAlbyHub
      ? "wss://relay.getalby.com/v1"
      : "wss://relay.coinos.io",
    requestMethods: [],
  });
  const url = await new Promise((resolve) => {
    nwaClient.subscribe({
      onSuccess: async (client) => {
        console.info(chalk.green("Successfully connected!"));
        resolve(client.nostrWalletConnectUrl);
      }
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
    budgetRenewal: "monthly",
    icon: "https://raw.githubusercontent.com/getAlby/pkgzap/refs/heads/main/docs/pkgzap.png",
  });

  console.info("Scan or enter the following NWA connection URI in your wallet:");
  qrcode.generate(nwaClient.connectionUri, { small: true });
  console.info(`NWA URI: ${nwaClient.connectionUri}\n`);
  console.info("Waiting for connection...\n");

  const url = await new Promise((resolve) => {
    nwaClient.subscribe({
      onSuccess: async (client) => {
        console.info(chalk.green("Successfully connected!"));
        resolve(client.nostrWalletConnectUrl);
      }
    });
  });

  return url;
}
