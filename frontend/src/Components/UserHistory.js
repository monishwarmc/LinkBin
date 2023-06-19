import React, { useEffect, useState } from 'react';
import { Table, Loading } from '@web3uikit/core';
import axios from 'axios';


const UserHistory = ({address, isConnected, api}) => {
  const[transfers, setTransfers] = useState(null);

  const date = (arg) => {
    const dateTime = new Date(arg);
    const formattedDate = dateTime.toLocaleDateString();
    return formattedDate;
  }
  const time = (arg) => {
    const dateTime = new Date(arg);
    const formattedTime = dateTime.toLocaleTimeString();
    return formattedTime;
  }
  
  const li = api + 'history?userAddress=' + address;
  const getTokenTransfers = async() => {axios.get(li)
  .then(response => response.data)
  .then(data => {
  console.log(data);
  setTransfers(data);
  })
  .catch(error => {
  console.error('Error:', error);
  });}
  useEffect(()=>{
    getTokenTransfers();

  }, [address]);

  return (
    <>

      <div>
          {transfers != null && isConnected ? 
          <Table
            pageSize={10}
            noPagination={false}
            style={{ width: "90vw" }}
            columnsConfig="1fr 1fr 3fr 1fr 1fr"
            data={transfers.map((e) => [
              e.type,
              (e.tokenType=='native'?(Number(e.valueEth)/1e18 + " eth"):(e.tokenType=='erc20'?(Number(e.valueEth) + " Link"):null)),
              (e.type=='received' ? `${e.from}` : `${e.to}`),
              date(e.date),
              time(e.date)
            ])}
            header={[
              <span>Type</span>,
              <span>Amount</span>,
              <span>Address</span>,
              <span>Date</span>,
              <span>Time</span>
            ]}
          />: <div style={{padding:'19rem 39rem'}}><Loading
        size={12}
        spinnerColor="#2E7DAF"
        spinnerType="wave"
      /></div> }
      </div>
    </>
  )
};

export default UserHistory;
