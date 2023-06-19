import React, { useEffect, useState } from 'react';
import { Table, Loading } from '@web3uikit/core';
import axios from 'axios';


function LeaderBoard({api}) {
    const[leader, setLeader] = useState();
 
    const li = api + 'leader';
    const getleader = async() => {axios.get(li)
    .then(response => response.data)
    .then(data => {
    console.log(data);
    setLeader(data);
    })
    .catch(error => {
    console.error('Error:', error);
    });}
    useEffect(()=>{
      getleader();
  
    }, [leader]);


  return (
    <>
        <div>
          {leader != null ? 
          <Table
            pageSize={10}
            noPagination={false}
            style={{ width: "90vw" }}
            columnsConfig="1fr 1fr 1fr 1fr 1fr 1fr 1fr"
            data={leader.map((e) => [
              e.UID,
              e.userRank,
              e.points,
              e.totalWaste,
              e.rewards,
              e.allPoints,
              e.allWaste
            ])}
            header={[
              <span>UID</span>,
              <span>Rank</span>,
              <span>Points</span>,
              <span>Waste</span>,
              <span>Rewards</span>,
              <span>OverAll points</span>,
              <span>OverAll waste</span>
            ]}
            isColumnSortable={
                [
                    true,
                    true,
                    true,
                    true,
                    true,
                    true,
                    true
                  ]
            }
          />: <div style={{padding:'19rem 39rem'}}><Loading
        size={12}
        spinnerColor="#2E7DAF"
        spinnerType="wave"
      /></div> }
      </div>
    </>
  )
}

export default LeaderBoard