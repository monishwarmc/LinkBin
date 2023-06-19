import React from 'react';
import {MetaMaskConnector} from 'wagmi/connectors/metaMask';
import { useConnect } from 'wagmi';
import { Button, Badge, Credentials} from '@web3uikit/core';
import logo from '../assets/linkbin-veri-logo.png';


function Wallet({isConnected, address, tokenBalance, uid, disconnect}) {
    const uidT = "uid:"+uid;
    const {connect} = useConnect({
        connector: new MetaMaskConnector(),
    });
    return (
        <div className='header'>
            <a href='#'><img src={logo} className='App-logo' alt='logo'/></a>
            <h1 style={{
                textDecoration:'0',
                color: 'blue',
                fontSize:'3.9rem',
                margin: '0.6vh 1vw',
                borderRadius: '0.6rem',
                padding:'0.3vh 0.6vw',
                backgroundColor: 'rgba(30, 60, 90, 0.7)',
            }}>LinkBin</h1>
            <div className='walletInputs'>

            {isConnected ? <>
                <Badge text={uidT}  />
                <Badge text={tokenBalance}  />
                <Credentials
                customize={{
                    backgroundColor: 'darkblue',
                    color: 'white',
                    fontSize: '16px',
                    margin: '16px',
                    padding: '8px 12px'
                  }}
                //textColor='rgba(60,0,255,0.6)'
                text={address}
                isHidden={false}
                />
                <Button onClick={disconnect} type='button' text='disconnect wallet'/>
            </>
            :
                <Button onClick={connect} type='button' text='connect wallet'/>}
            </div>
        </div>
            /* <div>
            {isConnected ? 
          <h2>uid : {uid}</h2>
          <h3>{address}</h3>
          {tokenBalance && <p>Token Balance : {tokenBalance} link</p>}
        </div>
        :<>
        
        <br/>
        </>}
        </div> */
    );
}

export default Wallet