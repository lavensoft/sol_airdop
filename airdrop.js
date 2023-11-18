import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction, clusterApiUrl, sendAndConfirmTransaction } from "@solana/web3.js";
import pkg from 'bs58';
import * as fs from 'fs';
import * as path from 'path';
import * as fcsv from 'fast-csv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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
const { secrectKey, programId, amount, note, mul, csv, network } = parseArgs(rawArgs);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { decode } = pkg;
const connection = new Connection(clusterApiUrl(network || "mainnet-beta")); //!TODO GET FROM ARGS || DEFAULT: mainnet

const secrectDecoded = decode(secrectKey)
const fromKeypair = Keypair.fromSecretKey(secrectDecoded);

const airdrop = async (toPubKey, lamports, note="", mul=false) => {
   try {
      console.log(`[INFO]: Starting airdrop to ${toPubKey}...`);
      const accountInfo = await connection.getAccountInfo(fromKeypair.publicKey);

      console.log(accountInfo);

      if(!accountInfo) {
         throw new Error(`${!mul ? "└──" : ""}[ERROR${mul ? ` - ${toPubKey}` : ""}]: Account not found!`);
      }

      if((accountInfo?.lamports || 0) < lamports) {
         throw new Error(`${!mul ? "└──" : ""}[ERROR${mul ? ` - ${toPubKey}` : ""}]: Your account not have enough token!`);
      }

      if(!mul) console.log(`└──[INFO]: Generate transaction...`);
      let transaction = new Transaction();

      transaction.add(
         SystemProgram.transfer({
            fromPubkey: fromKeypair.publicKey,
            toPubkey: new PublicKey(toPubKey),
            lamports: lamports
         })
      )

      if(note && programId) {
         transaction.add(
            new TransactionInstruction({
            keys: [{ pubkey: fromKeypair.publicKey, isSigner: true, isWritable: true }],
            data: Buffer.from(note, "utf-8"),
            programId: new PublicKey(programId),
            })
         );
      }

      if(!mul) console.log(`└──[INFO]: Sending transaction...`);
      await sendAndConfirmTransaction(connection, transaction, [fromKeypair]);

      console.log(`${!mul ? "└──" : ""}[SUCCESS]: Airdrop successfully to ${toPubKey}!`);
   }catch(e) {
      console.log(e.message);
   }
}

const main = async () => {
   //CSV read
   const transactions = [];

   await new Promise((res, rej) => 
      fs.createReadStream(path.resolve(__dirname, csv))
         .pipe(fcsv.parse({ headers: true }))
         .on('error', error => rej(error))
         .on('data', row => transactions.push(row))
         .on("end", () => res(transactions))
   );

   if(mul) {
      let transPromises = transactions.map((trans) => {
         return airdrop(
            trans.address, 
            (Number(amount) || Number(trans.amount)) * LAMPORTS_PER_SOL, 
            note || trans.note,
            true
         );
      });

      await Promise.all(transPromises);
   }else{
      for(const trans of transactions) {
         await airdrop(
            trans.address, 
            (Number(amount) || Number(trans.amount)) * LAMPORTS_PER_SOL, 
            note || trans.note
         );
      }
   }
}

main();