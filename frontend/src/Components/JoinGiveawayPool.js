import React, { useEffect, useState } from 'react';
import abi from '../abi.json';
import {usePrepareContractWrite, useContractWrite} from 'wagmi';
import useDebounce from '../Hooks/useDebounce';
import { Input, Button, Card, Grid} from '@web3uikit/core';
import axios from 'axios';

function JoinGiveawayPool({contractAddress, chainId, api}) {
    const [poolId, setPoolId] = useState(null);
    const debouncedPoolId = useDebounce(parseInt(poolId), 500);
    const [nos, setNos] = useState();
    const [arr, setArr] = useState();
    let open;
    let close;

    const get = async() => {
      try{
        const li = api + 'sortPool';
      const response = await axios.get(li);
      open = response.data.open;
      close = response.data.close;
      setNos(response.data.nos);}
      catch(error){
        console.log(error)
      }
    };

    const gets = async() => {
      try{
      const li = api + 'pools';
      const response = await axios.get(li);
        setArr(response.data);
        console.log(arr);
    }
      catch(error){
        console.log(error)
      }
    };
    


    useEffect(()=>{
      get();
      gets();
      console.log(nos);
      console.log(open);
      console.log(close);
    }, []);


    let sponsor = ['amazon', 'chainlink', 'google', 'facebook'];
    const { config } = usePrepareContractWrite({
        address: contractAddress,
        abi: abi,
        chainId: chainId,
        functionName: 'joinGiveawayPool',
        args: [debouncedPoolId],
        enabled: Boolean(debouncedPoolId)
    })
    const { write } = useContractWrite(config);



    return(
      <>
      <h2>Join pool</h2>
        <form>
            <Input
            label="poolId"
            name="poolId"
            placeholder="enter poolId"
            onChange={function noRefCheck(e){setPoolId(e.target.value)}}
            type='number'
            value={poolId}
            />
            <br/>
            <Button
            onClick={function noRefCheck(e){
                e.preventDefault();
                write?.()}}
            text="join"
            disabled={!write}
            />
        </form>
        <br/>
        <Grid
            alignItems="flex-start"
            justifyContent="flex-start"
            spacing={12}
            style={{
              height: '400px',
              backgroundColor: 'rgba(0,0,239, 0.3)',
              borderRadius: '2rem'
            }}
            type="container"
          >
            <React.Fragment key=".0">
              {arr && arr.map((i)=>{
                if(!i.closed){
                  return <Grid
                  key={i.poolId}
                  lg={3}
                  md={4}
                  sm={6}
                  type="item"
                  xs={12}
                  >
                    <div className='card'>
                  <Card
                    description="Click to join the pool"
                    onClick={function noRefCheck(){
                      setPoolId(i.poolId);
                    }}
                    setIsSelected={function noRefCheck(){}}
                    title="Clean Country"
                    tooltipText={<span style={{width: 200}}>'Sponsored by {sponsor[i.poolId-1]}'</span>}
                  >
                    <h2>Pool ID : {i.poolId}</h2>
                    <h1>Amount : $ {i.giveawayAmount}</h1>
                    <p>number Of Participants : {i.numberOfParticipants + i.joined}</p>
                    <p>no of joined : {i.joined}</p>
                    <h2>entry points : {i.entryPoints}</h2>
                  </Card>
                  </div>
                </Grid>
                }
              })
              }
            </React.Fragment>
          </Grid>
        <br/>
        <h1>Closed</h1>
        <Grid
            alignItems="flex-start"
            justifyContent="flex-start"
            spacing={12}
            style={{
              height: '400px',
              backgroundColor: 'rgba(255,0,0, 0.3)',
              borderRadius: '2rem'
            }}
            type="container"
          >
            <React.Fragment key=".0">
              {arr && arr.map((i)=>{
                if(i.closed){
                  return <Grid
                  key={i.poolId}
                  lg={3}
                  md={4}
                  sm={6}
                  type="item"
                  xs={12}
                  >
                    <div className='card'>
                  <Card
                    description={sponsor[i.poolId-1]}
                    onClick={function noRefCheck(){
                    }}
                    setIsSelected={function noRefCheck(){}}
                    title="Clean Country"
                    tooltipText={<span style={{width: 200}}>'Sponsored by {sponsor[i.poolId-1]}'</span>}
                  >
                    <h2>Pool ID : {i.poolId}</h2>
                    <h1>Amount : $ {i.giveawayAmount}</h1>
                    <p>number Of Participants : {i.numberOfParticipants + i.joined}</p>
                    <p>no of joined : {i.joined}</p>
                    <h2>Winner UID : {i.winnerUid}</h2>
                  </Card>
                  </div>
                </Grid>
                }
              })
              }
            </React.Fragment>
          </Grid>
      </>
    )
}

export default JoinGiveawayPool