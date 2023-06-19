const express = require("express");
const cors = require("cors");
const Moralis = require("moralis").default;
require("dotenv").config();
const app = express();
const { EvmChain } = require("@moralisweb3/common-evm-utils");
const abi = require("./abi.json");
const port = 4000;
const axios = require('axios');


app.use(cors());

// gets the token balance
app.get("/balance", async (req, res) => {
  try{
    const { query } = req;
    const address = query.address;
    const response = await Moralis.EvmApi.token.getWalletTokenBalances({
        address,
        chain: 11155111
    });


    const bal = response.raw[0]?.balance / 1E18;

    if(bal){
        res.send({balance: bal.toFixed(2)});
    }else{
        res.send({balance: "0.00"})
    }
  }
  catch(error) {
    console.log(error);
    res.send(error);
  }

  
});

// get the contract logs
app.get("/logs", async(req, res) => {
try{
    const response = await Moralis.EvmApi.events.getContractLogs({
      "chain": "0xaa36a7",
      "address": "0xc039998296F4FfccB319428E7327dd4f9a76c470"
    });
  
    console.log(response.raw);
    res.send(response);
  } catch (e) {
    console.error(e);
  }
});


// gets the history of transaction of the account
app.get("/history", async(req, res) => {
  const {query} = req;
  const userAddress = query.userAddress;
  const headers = { accept: 'application/json', 'X-API-Key': process.env.MORALIS_KEY };
  const chain = '0xaa36a7';

  (async () => {
    try {
      const nativeTransactions = await (
        await axios.get(
          'https://deep-index.moralis.io/api/v2/' + userAddress + '?chain=' + chain + '&limit=3',
          { headers }
        )
      ).data;
  
      const erc20Transactions = await (
        await axios.get(
          'https://deep-index.moralis.io/api/v2/' + userAddress + '/erc20/transfers?chain=' + chain + '&limit=3',
          { headers }
        )
      ).data;
  
      const nftTransactions = await (
        await axios.get(
          'https://deep-index.moralis.io/api/v2/' + userAddress + '/nft/transfers?chain=' + chain + '&limit=3',
          { headers }
        )
      ).data;
  
      let result = [];
  
      nativeTransactions.result.forEach((tx) => {
        const { from_address, to_address, value, hash, block_timestamp } = tx;
        const type =
          from_address.toUpperCase() === userAddress.toUpperCase()
            ? 'sent'
            : 'received';
        const tokenType = 'native';
        result.push({
          type,
          from: from_address,
          to: to_address,
          valueEth: value,
          hash,
          date: block_timestamp,
          tokenType,
          chain,
        });
      });
  
      erc20Transactions.result.forEach((tx) => {
        const {
          from_address,
          to_address,
          value,
          transaction_hash,
          block_timestamp,
          address,
        } = tx;
        const type =
          from_address.toUpperCase() === userAddress.toUpperCase()
            ? 'sent'
            : 'received';
        const tokenType = 'erc20';
        result.push({
          type,
          from: from_address,
          to: to_address,
          valueEth: value,
          hash: transaction_hash,
          date: block_timestamp,
          tokenType,
          chain,
          tokenAddress: address,
        });
      });
  
      const erc20Addresses = [...new Set(erc20Transactions.result.map((r) => r.address))];
      if (erc20Addresses.length > 0) {
        const s = '&addresses=' + erc20Addresses.join('&addresses=');
        const erc20Metadata = await (
          await axios.get(
            'https://deep-index.moralis.io/api/v2/erc20/metadata?chain=' + chain + s,
            { headers }
          )
        ).data;
  
        for (let i = 0; i < result.length; i++) {
          const item = result[i];
          if (item.tokenType === 'erc20') {
            const metadata = erc20Metadata.find((m) => m.address === item.tokenAddress);
            if (metadata) {
              item.name = metadata.symbol;
              if (metadata.decimals) {
                item.valueEth = String(formatNumber(item.valueEth / 10 ** metadata.decimals));
              }
            }
          }
        }
      }
  
  
  
      nftTransactions.result.forEach((tx) => {
        const {
          from_address,
          to_address,
          amount,
          block_timestamp,
          contract_type,
          transaction_hash,
          token_id,
          token_address,
        } = tx;
        const type =
          from_address.toUpperCase() === userAddress.toUpperCase()
            ? 'sent'
            : 'received';
  
        result.push({
          type,
          from: from_address,
          to: to_address,
          valueEth: amount,
          hash: transaction_hash,
          date: block_timestamp,
          tokenType: contract_type,
          chain: chain,
          tokenId: token_id,
          tokenAddress: token_address,
        });
      });
  
      const filteredResult = result.filter(
        (tx) =>
          tx.tokenType.toLowerCase() === 'erc721' ||
          tx.tokenType.toLowerCase() === 'erc1155',
      );
  
      const nftMetadata = [];
  
      for (const tx of filteredResult) {
        const response = await axios.get(
          'https://deep-index.moralis.io/api/v2/nft/' + tx.tokenAddress + '/' + tx.tokenId + '?chain=' + chain,
          { headers }
        )
        const metadata = await response.data;
  
        nftMetadata.push({
          name: metadata.name,
          address: metadata.token_address,
        });
      }
      
  
      result.forEach((data, index) => {
        if (
          data.tokenType.toLowerCase() === 'erc721' ||
          data.tokenType.toLowerCase() === 'erc1155'
        ) {
          const nft = nftMetadata.find(
            (nft) => nft.address === data.tokenAddress,
          );
          result[index].name = nft.name;
        }
      });
  
      console.log(result);
      res.send(result);
  
    } catch (error) {
      console.error(error);
    }
  })();

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number ?? 0);
  };
  
});



// get thes contract readables without params
app.get("/contract", async (req, res) => {
  try{
  
    const chain = EvmChain.SEPOLIA;
  
    const address = "0xc039998296F4FfccB319428E7327dd4f9a76c470";
  
    let response = await Moralis.EvmApi.utils.runContractFunction({
      address,
      functionName: "getLinkPrice",
      abi,
      chain,
    });
    const linkPrice = parseInt(response.raw);
  
    response = await Moralis.EvmApi.utils.runContractFunction({
      address,
      functionName: "getLatestRequestId",
      abi,
      chain,
    });
    const latestRandomNumber = (response.raw);

    response = await Moralis.EvmApi.utils.runContractFunction({
      address,
      functionName: "uidCounter",
      abi,
      chain,
    });
    const uidCounter = parseInt(response.raw);

    response = await Moralis.EvmApi.utils.runContractFunction({
      address,
      functionName: "dataConsumer",
      abi,
      chain,
    });
    const linkPriceContract = (response.raw);

    response = await Moralis.EvmApi.utils.runContractFunction({
      address,
      functionName: "vrfConsumer",
      abi,
      chain,
    });
    const vrfContract = (response.raw);

    response = await Moralis.EvmApi.utils.runContractFunction({
      address,
      functionName: "owner",
      abi,
      chain,
    });
    const owner = (response.raw);

    response = await Moralis.EvmApi.utils.runContractFunction({
      address,
      functionName: "poolIdCounter",
      abi,
      chain,
    });
    const poolIdCounter = parseInt(response.raw);
  
    const result = {
      "linkPrice": linkPrice,
      "latestRandomNumber": latestRandomNumber,
      "uidCounter": uidCounter,
      "linkPriceContract": linkPriceContract,
      "owner": owner,
      "poolIdCounter": poolIdCounter,
      "vrfContract": vrfContract,
    }
  
    res.send(result);
    console.log(result);
  }
  catch(error){
    console.log(error);
    res.send(error);
  }
});


// get thes contract readables with uid params
app.get("/uidParams", async(req, res)=>{
  try{
    const {query} = req;
    const uid = query.uid;
    const chain = EvmChain.SEPOLIA;
    const address = "0xc039998296F4FfccB319428E7327dd4f9a76c470";
    // let response = await Moralis.EvmApi.utils.runContractFunction({
    //   address,
    //   functionName: "getUserPoints",
    //   abi,
    //   chain,
    //   params: {
    //     uid
    //   },
    // });
    // const userPoints = parseInt(response.raw);

    // response = await Moralis.EvmApi.utils.runContractFunction({
    //   address,
    //   functionName: "getUserWaste",
    //   abi,
    //   chain,
    //   params: {
    //     uid
    //   },
    // });
    // const userWaste = parseInt(response.raw);

    // response = await Moralis.EvmApi.utils.runContractFunction({
    //   address,
    //   functionName: "getUserAllPoints",
    //   abi,
    //   chain,
    //   params: {
    //     uid
    //   },
    // });
    // const userAllPoints = parseInt(response.raw);

    // response = await Moralis.EvmApi.utils.runContractFunction({
    //   address,
    //   functionName: "getUserAllWaste",
    //   abi,
    //   chain,
    //   params: {
    //     uid
    //   },
    // });
    // const userAllwaste = parseInt(response.raw);

    response = await Moralis.EvmApi.utils.runContractFunction({
      address,
      functionName: "getUserRank",
      abi,
      chain,
      params: {
        uid
      },
    });
    const userRank = parseInt(response.raw);

    response = await Moralis.EvmApi.utils.runContractFunction({
      address,
      functionName: "users",
      abi,
      chain,
      params: {
        "": uid,
      },
    });
    const user = (response.raw);

    const result = {
        "userRank": userRank,
        "userAddress": user.userAddress,
        "uid": parseInt(user.uid),
        "latitude": parseInt(user.latitude),
        "longitude": parseInt(user.longitude),
        "points": parseInt(user.points),
        "totalWaste": parseInt(user.totalWaste),
        "rewards": parseInt(user.rewards),
        "allPoints": parseInt(user.allPoints),
        "allWaste": parseInt(user.allWaste),
    }
    res.send(result);
    console.log(response.raw);
  }
  catch(error){
    console.log(error);
    res.send(error);
  }
})


// get contract variables from pool uids
app.get("/pool", async(req, res) => {
  try{

    const chain = EvmChain.SEPOLIA;
    const address = "0xc039998296F4FfccB319428E7327dd4f9a76c470";
    //const {poolId} = req.query;

    const {query} = req;
    const poolId = query.poolId;
    let response = await Moralis.EvmApi.utils.runContractFunction({
      address,
      functionName: "giveawayPools",
      abi,
      chain,
      params: {
        "": poolId,
      },
    });
    const giveAwayPools = (response.raw);

    const result ={
        "poolId": parseInt(giveAwayPools.poolId),
        "entryPoints": parseInt(giveAwayPools.entryPoints),
        "giveawayAmount": parseInt(giveAwayPools.giveawayAmount),
        "numberOfParticipants": parseInt(giveAwayPools.numberOfParticipants),
        "winnerUid": parseInt(giveAwayPools.winnerUid),
        "joined": parseInt(giveAwayPools.joined),
        "closed": giveAwayPools.closed,
    }
    console.log(result);
    res.send(result);
  }
  catch(error){
    console.log(error);
    res.send(error);
  }
});



//get sorted pools
app.get("/sortPool", async(req, res) => {
  try{
    const response = await axios.get('http://localhost:4000/contract');
    const nos = response.data.poolIdCounter;
    const open = [];
    const close = [];
    for (let i = 1; i <= nos; i++){
      const resp = await axios.get('http://localhost:4000/pool',{
      params: {
        poolId: i,
      }
      });
      if(!resp.data.closed){
        open.push(i);
      }
      else{
        close.push(i);
      }
    }
    const result = {
      "nos":nos,
      "open": open,
      "close": close
    };
    console.log(result);
    res.send(result);
  }
  catch(error){
    console.log(error);;
    res.send(error);
  }
});





// getting uid of the user
app.get("/uid", async(req, res) => {
  try{
    const chain = EvmChain.SEPOLIA;
    const address = "0xc039998296F4FfccB319428E7327dd4f9a76c470";
    //const {address} = req.query;
    const {query} = req;
    const userAddress = query.userAddress;
    let response = await Moralis.EvmApi.utils.runContractFunction({
      address,
      functionName: "addressToUid",
      abi,
      chain,
      params: {
        "": userAddress,
      },
    });
    const uid = parseInt(response.raw);
    
    const result = {
      "uid": uid
    };
    console.log(result);
    res.send(result);

  }
  catch(error){
    console.log(error);;
    res.send(error);
  }
});


app.get("/pools", async(req, res) => {
  let nos = 0;
  try{
    const response = await axios.get('http://localhost:4000/sortPool');
    nos = response.data.nos;
  }
    catch(error){
      console.log(error)
  }
  let resul = [];
  await Promise.all(
    Array.from({ length: nos }, async (_, index) => {
      const poolId = index + 1;

      try {
        const response = await axios.get('http://localhost:4000/pool', {
          params: {
            poolId: poolId,
          },
        });

        const res = response.data;
        const result = {
          poolId: res.poolId,
          entryPoints: Number(res.entryPoints),
          giveawayAmount: res.giveawayAmount / 100000000,
          numberOfParticipants: res.numberOfParticipants,
          winnerUid: res.winnerUid,
          joined: res.joined,
          closed: res.closed,
        };

        resul.push(result);
        console.log(result);
      } catch (error) {
        console.log(error);
      }
    })

  );
  res.send(resul);
});


app.get("/leader", async(req, res) => {
  let nos = 0;
  try{
    const response = await axios.get('http://localhost:4000/contract');
    nos = response.data.uidCounter;
  }
    catch(error){
      console.log(error)
  }
  let resul = [];
  await Promise.all(
    Array.from({ length: nos }, async (_, index) => {
      const uid = index + 1;

      try {
        const response = await axios.get('http://localhost:4000/uidParams', {
          params: {
            uid: uid,
          },
        });

        const res = response.data;
        const result = {
          UID: res.uid,
          userRank: res.userRank,
          userAddress: res.userAddress,
          points: res.points,
          totalWaste: res.totalWaste,
          allPoints: res.allPoints,
          allWaste: res.allWaste,
          rewards:res.rewards/1e18
        };

        resul.push(result);
        console.log(result);
      } catch (error) {
        console.log(error);
      }
    })

  );
  res.send(resul);
});

app.get("/", async(req, res) => {
  try{

    const result = {
      'status': 'ok',
    };
    console.log(result);
    res.send(result);

  }
  catch(error){
    console.log(error);;
    res.send(error);
  }
});


Moralis.start({
  apiKey: process.env.MORALIS_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log(`Listening for reqs`);
  });
});


