const { Keypair, PublicKey } = require("@solana/web3.js");
const { fileURLToPath } = require('url');
const { dirname } = require('path');
const path = require('path');
const fcsv = require('fast-csv');
const fs = require('fs');

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

const rawArgs = process.argv;
const { length, out, amount, note } = parseArgs(rawArgs);

//Validate
if(!length) {
   console.log("[ERROR]: Please spetific -length");
   process.exit(0);
}

if(!out) {
   console.log("[ERROR]: Please spetific -out");
   process.exit(0);
}

const outputPath = out || path.resolve(__dirname, "address.csv");

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