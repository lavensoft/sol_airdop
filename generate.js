import { Keypair, PublicKey } from "@solana/web3.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as path from 'path';
import * as fcsv from 'fast-csv';
import * as fs from 'fs';

const parseArgs = (args) => {
   const parsedArgs = {};
 
   for (let i = 2; i < args.length; i++) {
     const arg = args[i];
     const [key, value] = arg.split('=');
     if (key && value) {
       parsedArgs[key.replace(/^-+/, '')] = value.replace(/(^")|("$)/g, '');
     }
   }
 
   return parsedArgs;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rawArgs = process.argv;
const { length, output, amount, note } = parseArgs(rawArgs);

const outputPath = output || path.resolve(__dirname, "address.csv");

const main = async () => {
   const data = [];

   console.log("[INFO]: Generating public key...");
   for(var i = 1; i <= length; i++) {
      const keypair = Keypair.generate();

      data.push({
         address: keypair.publicKey.toBase58(),
         amount: amount || 0,
         note: note || ""
      });
   }

   const ws = fs.createWriteStream(outputPath);
   fcsv.write(data, { headers: true })
      .pipe(ws)
      .on('finish', () => {
         console.log('[SUCCESS]: CSV file saved successfully!');
      })
      .on('error', (err) => {
         console.error(`[ERROR]: ${err.message}`);
      });
}

main();