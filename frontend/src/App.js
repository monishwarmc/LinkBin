import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import axios from 'axios';
import UserRegister from './Components/UserRegister';
import Wallet from './Components/Wallet';
import CreateGiveawayPool from './Components/CreateGiveawayPool';
import JoinGiveawayPool from './Components/JoinGiveawayPool';
import Waste from './Components/Waste';
import Points from './Components/Points';
import Profile from './Components/Profile';
import DistributePools from './Components/DistributePools';
import Reward from './Components/Reward';
import './App.css';
import { TabList, Tab } from "@web3uikit/core";
import UserHistory from './Components/UserHistory';
import ContractLogs from './Components/ContractLogs';
import LeaderBoard from './Components/LeaderBoard';

function App() {

  const {address, isConnected} = useAccount();
  const [userData, setUserData] = useState();
  const [tokenBalance, setTokenBalance] = useState();
  const contractAddress = '0xc039998296F4FfccB319428E7327dd4f9a76c470';
  const [uid, setUid] = useState(0);
  const api = 'http://localhost:4000/';
  const chainId = 0xaa36a7;
  const owner = '0xdbb63C9be17cE82713849f9680Bb08Ca48893610';
  const isOwner = address === owner;

  async function getBalance() {
    const li = api + 'balance'
    const response = await axios.get(li, {
      params:{
        address: address,
      }
    });
    setTokenBalance(response.data.balance);
  };

  async function getUid() {
    const li = api + 'uid';
    const resp = await axios.get(li, {
      params:{
        userAddress: address,
      }
    });
    setUid(resp.data.uid);
    console.log(resp.data.uid);
  };

  useEffect(() => {
    if(!isConnected) return
    
    getBalance();
    getUid();
  }, [isConnected, address]);



  return (
    <div className="App">
      <Wallet
      uid={uid}
      isConnected={isConnected}
      address={address}
      tokenBalance={tokenBalance}
      />

      <div className='content'>
        <TabList className={'TabList'}>
          
          <Tab className={'tab'} tabKey={1} tabName={"Profile"}>
            <Profile
            uid={uid}
            userData={userData}
            setUserData={setUserData}
            isConnected={isConnected}
            api={api}
            />
          </Tab>
          {uid===0 ?
          <Tab className={'tab'} tabKey={2} tabName={"Register"}>
            <UserRegister
            contractAddress={contractAddress}
            chainId={chainId}
            />
          </Tab>
          : <></>
          }
          <Tab className={'tab'} tabKey={3} tabName={"giveawayPool"}>
            <JoinGiveawayPool
            contractAddress={contractAddress}
            chainId= {chainId}
            api={api}
            />
          </Tab>
          {isOwner ? 
          <Tab className={'tab'} tabKey={4} tabName={"onlyOwner"}>
            <div 
            style={{
              alignItems:'center'
            }}
            >
            <TabList
            className={'TabList'}
            isWidthAuto
            tabStyle='bulbUnion'
            >
              <Tab className={'tab'} tabKey={1} tabName={"Create Giveaway Pool"}>
                <CreateGiveawayPool
                contractAddress= {contractAddress}
                chainId= {chainId}
                />
              </Tab>
              <Tab className={'tab'} tabKey={2} tabName={"Distribute Pool"}>
                <DistributePools
                contractAddress= {contractAddress}
                chainId= {chainId}
                />
              </Tab>
              <Tab className={'tab'} tabKey={3} tabName={"Waste update"}>
                <Waste
                  contractAddress={contractAddress}
                  chainId= {chainId}
                />
              </Tab>
              <Tab className={'tab'} tabKey={4} tabName={"Points update"}>
                <Points
                contractAddress={contractAddress}
                chainId= {chainId}
                />
              </Tab>
              <Tab className={'tab'} tabKey={5} tabName={"Reward"}>
                <Reward
                contractAddress={contractAddress}
                chainId= {chainId}
                />
              </Tab>
            </TabList>
            </div>
          </Tab>
          : <></>
          }
          <Tab className={'tab'} tabKey={5} tabName={"history"}>
            <UserHistory
            address={address}
            isConnected={isConnected}
            api={api}
            />
          </Tab>
          <Tab className={'tab'} tabKey={6} tabName={"contract logs"}>
            <ContractLogs
            api={api}
            />
          </Tab>
          <Tab className={'tab'} tabKey={7} tabName={"Leader Board"}>
            <LeaderBoard
            api={api}
            />
          </Tab>
        </TabList>
        
      </div>

    </div>
  );
}

export default App;