import React, { useEffect, useState } from 'react';
import { Table, Loading } from '@web3uikit/core';


const ContractLogs = ({api}) => {
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

  const li = api + 'logs';
  const getTokenTransfers = async() => {fetch(li)
  .then(response => response.json())
  .then(data => {
  console.log(data.result);
  setTransfers(data.result);
  })
  .catch(error => {
  console.error('Error:', error);
  });}
  useEffect(()=>{
    getTokenTransfers();

  }, []);

  return (
    <>

      <div>
          {transfers != null ? 
          <Table
            pageSize={10}
            noPagination={false}
            style={{ width: "90vw" }}
            columnsConfig="1.3fr 3.7fr 1fr 1fr"
            data={transfers.map((e) => [
              e.block_number,
              (e.block_hash),
              date(e.block_timestamp),
              time(e.block_timestamp)
            ])}
            header={[
              <span>Block number</span>,
              <span>Block hash</span>,
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

export default ContractLogs;