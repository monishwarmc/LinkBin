import React, { useEffect } from 'react';
import axios from 'axios';
import Bin from './Bin';
import { Table, Loading } from '@web3uikit/core';

function Profile({ uid, userData, setUserData, isConnected, api }) {
  const zoom = 20;

  async function getUser() {
    const li = api + 'uidParams';
    const resp = await axios.get(li, {
      params: {
        uid: uid
      }
    });
    console.log(resp.data);
    setUserData(resp.data);
  }

  useEffect(() => {
    if (!uid) return;

    getUser();
  }, []);

  if (!userData && isConnected) {
    // Render a loading state if userData is undefined
    return (
      <div style={{ padding: '19rem 39rem' }}>
        <Loading size={12} spinnerColor="#2E7DAF" spinnerType="wave" />
      </div>
    );
  }

  return (
    <>
      {userData && (
        <Table
          columnsConfig="6fr 9fr"
          data={[
            ['userRank', userData.userRank],
            ['userAddress', userData.userAddress],
            ['uid', userData.uid],
            ['latitude', userData.latitude],
            ['longitude', userData.longitude],
            ['points', userData.points],
            ['totalWaste', userData.totalWaste],
            ['rewards', (userData.rewards / 1e18).toFixed(2) + ' Link'],
            ['allPoints', userData.allPoints],
            ['allWaste', userData.allWaste]
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
