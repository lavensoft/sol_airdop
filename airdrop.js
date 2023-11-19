const { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction, clusterApiUrl, sendAndConfirmTransaction } = require("@solana/web3.js");
const splToken = require('@solana/spl-token');
const pkg = require('bs58');
const fs = require('fs');
const path = require('path');
const fcsv = require('fast-csv');

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
const { secretKey, programId, amount, note, mul, csv, network, spl } = parseArgs(rawArgs);

//Validate
if(!secretKey) {
   console.log("[ERROR]: Please spetific -secretKey");
   process.exit(0);
}

if(!csv) {
   console.log("[ERROR]: Please spetific -csv");
   process.exit(0);
}

const { decode } = pkg;
const connection = new Connection(clusterApiUrl(network || "mainnet-beta")); //!TODO GET FROM ARGS || DEFAULT: mainnet

const secrectDecoded = decode(secretKey)
const fromKeypair = Keypair.fromSecretKey(secrectDecoded);
const resUid = Date.now();
const failRes = [];
const sucRes = [];

const isNumber = (n) => { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }

const airdrop = async (toPubKey, lamports, note="", mul=false) => {
   try {
      let amount = 0;
      let decimals = 0;

      console.log(`[INFO]: Starting airdrop to ${toPubKey}...`);
      let senderTokenAccount;
      let accountInfo = await connection.getAccountInfo(fromKeypair.publicKey);

      //Validate
      if(!isNumber(lamports)) {
         throw new Error(`${!mul ? "└──" : ""}[ERROR${mul ? ` - ${toPubKey}` : ""}]: Ammount not anumber!`);
      }

      if(!accountInfo) {
         throw new Error(`${!mul ? "└──" : ""}[ERROR${mul ? ` - ${toPubKey}` : ""}]: Account not found!`);
      }

      if(spl) {
         senderTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
            connection,
            fromKeypair,
            new PublicKey(spl),
            fromKeypair.publicKey
        );
         accountInfo = await connection.getTokenAccountBalance(senderTokenAccount.address);
         const currentAmount = Number(accountInfo.value.amount);
         decimals = accountInfo.value.decimals;

         amount = lamports * Math.pow(10, decimals);

         if(currentAmount < amount) {
            throw new Error(`${!mul ? "└──" : ""}[ERROR${mul ? ` - ${toPubKey}` : ""}]: Your account not have enough token!`);
         }
      }else{
         amount = lamports * LAMPORTS_PER_SOL;
         if((accountInfo?.lamports || 0) < amount) {
            throw new Error(`${!mul ? "└──" : ""}[ERROR${mul ? ` - ${toPubKey}` : ""}]: Your account not have enough token!`);
         }
      }

      if(!mul) console.log(`└──[INFO]: Generate transaction...`);
      let transaction = new Transaction();

      if(spl) {
        const toTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
            connection, 
            fromKeypair, 
            new PublicKey(spl), 
            new PublicKey(toPubKey),
         );

         if(!mul) console.log(`└──[INFO]: Sending transaction...`);
         await splToken.transfer(
            connection,
            fromKeypair,
            senderTokenAccount.address,
            toTokenAccount.address,
            fromKeypair.publicKey,
            amount
         )
      }else{
         transaction.add(
            SystemProgram.transfer({
               fromPubkey: fromKeypair.publicKey,
               toPubkey: new PublicKey(toPubKey),
               lamports: amount
            })
         )

         if(note) {
            transaction.add(
               new TransactionInstruction({
               keys: [{ pubkey: fromKeypair.publicKey, isSigner: true, isWritable: true }],
               data: Buffer.from(note, "utf-8"),
               programId: new PublicKey(programId || "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
               })
            );
         }

         if(!mul) console.log(`└──[INFO]: Sending transaction...`);
         await sendAndConfirmTransaction(connection, transaction, [fromKeypair]);
      }

      //save result
      sucRes.push({
         address: toPubKey,
         amount: lamports || 0,
         note: note || ""
      });
      console.log(`${!mul ? "└──" : ""}[SUCCESS]: Airdrop successfully to ${toPubKey}!`);
   }catch(e) {
      //save result
      failRes.push({
         address: toPubKey,
         amount: lamports || 0,
         note: note || ""
      });
      console.log(e.message);
   }
}

const main = async () => {
   //CSV read
   const transactions = [];

   await new Promise((res, rej) => 
      fs.createReadStream(csv)
         .pipe(fcsv.parse({ headers: true }))
         .on('error', error => rej(error))
         .on('data', row => transactions.push(row))
         .on("end", () => res(transactions))
   );

   //Start transaction
   if(mul) {
      let transPromises = transactions.map((trans) => {
         return airdrop(
            trans.address, 
            (Number(amount) || Number(trans.amount)), 
            note || trans.note,
            true
         );
      });

      await Promise.all(transPromises);
   }else{
      for(const trans of transactions) {
         await airdrop(
            trans.address, 
            (Number(amount) || Number(trans.amount)), 
            note || trans.note
         );
      }
   }

   //Save result
   console.log(`[INFO]: Saving result ${resUid}-successs.csv`);
   const ws = fs.createWriteStream(`${resUid}-successs.csv`);
   fcsv.write(sucRes, { headers: true })
      .pipe(ws)
      .on('finish', () => {
         console.log(`└──[SUCCESS]: Result saved successfully!`);
      })
      .on('error', (err) => {
         console.log(`└──[ERROR]: Can not save result!`);
      });

   console.log(`[INFO]: Saving result ${resUid}-fail.csv`);
   const ws2 = fs.createWriteStream(`${resUid}-fail.csv`);
   fcsv.write(failRes, { headers: true })
      .pipe(ws2)
      .on('finish', () => {
         console.log(`└──[SUCCESS]: Result saved successfully!`);
      })
      .on('error', (err) => {
         console.log(`└──[ERROR]: Can not save result!`);
      });
}

main();