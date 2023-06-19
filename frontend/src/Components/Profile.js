import React, { useEffect } from 'react';
import Bin from './Bin';
import { Table, Loading } from '@web3uikit/core';
import { useContractReads } from 'wagmi';

function Profile({ uid, userData, setUserData, isConnected, contract }) {
  const zoom = 20;
  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        ...contract,
        functionName: 'users',
        args:[uid]
      },
      {
        ...contract,
        functionName: 'getUserRank',
        args:[uid]
      },
    ],
  })
  async function getUser() {
    if(!isError && !isLoading){
      setUserData(data);
    }
    // const li = api + 'uidParams';
    // const resp = await axios.get(li, {
    //   params: {
    //     uid: uid
    //   }
    // });
    // console.log(resp.data);
    // setUserData(resp.data);
  }

  useEffect(() => {
    if (!uid) return;

    getUser();
  }, [uid, isConnected, userData]);

  if (!userData && isConnected && isLoading) {
    // Render a loading state if userData is undefined
    return (
      <div style={{ padding: '19rem 39rem' }}>
        <Loading size={12} spinnerColor="#2E7DAF" spinnerType="wave" />
      </div>
    );
  }

  return (
    <>
      {userData && !isLoading && (
        <Table
          columnsConfig="6fr 9fr"
          data={[
            ['userRank', Number(userData[1])],
            ['userAddress', userData[0].userAddress],
            ['uid', Number(userData[0].uid)],
            ['latitude', Number(userData[0].latitude)],
            ['longitude', Number(userData[0].longitude)],
            ['points', Number(userData[0].points)],
            ['totalWaste', Number(userData[0].totalWaste)],
            ['rewards', (Number(userData[0].rewards) / 1e18).toFixed(2) + ' Link'],
            ['allPoints', Number(userData[0].allPoints)],
            ['allWaste', Number(userData[0].allWaste)]
          ]}
          header={[]}
          noPagination
          isLoading={false}
        />
      )}
      <br />
      {userData && (
        <iframe
          src={`https://maps.google.com/maps?q=${userData.latitude},${userData.longitude}&z=${zoom}&output=embed`}
          width="600"
          height="450"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="google map"
        ></iframe>
      )}
      <br />
      <br />
      <Bin />
      <br />
    </>
  );
}

export default Profile;
