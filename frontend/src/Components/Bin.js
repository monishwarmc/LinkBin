import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Slider, Typography } from '@web3uikit/core';

function Bin() {
    
    const [lvl, setLvl] = useState(0);
    const getLvl = async() => {
        const response = await axios.get('https://ex2sqntzd4.execute-api.us-east-1.amazonaws.com/69DynamoApi/data');
        console.log(response.data.binLvl);
        setLvl(response.data.binLvl);
    }
    let bgColor = '#b9ff0f'
    const color = () => {
      if(lvl < 20){
        bgColor = '#b9ff0f';
      }
      else if(lvl < 40){
        bgColor = '#0fff3d';
      }
      else if(lvl < 60){
        bgColor = '#0fbeff';
      }
      else if(lvl < 80){
        bgColor = '#2a0fff';
      }
      else{
        bgColor = '#ff0f0f';
      }
    }

    // useEffect(() => {
    //     const interval = setInterval(getLvl, 1000); // Fetch bin level every 1 sec

    //     return () => {
    //       clearInterval(interval); // Clean up the interval on component unmount
    //     };

    // }, [])

    useEffect(() => {
      getLvl();
    }, [lvl])

  return (
    <div 
    style={{
      textAlign:'center',
      width: '80vw'
    }}
    >
        <h3
        style={{
          alignSelf:'center',
        }}
        >Bin Level : {lvl} %</h3>
        <br/>
        <Slider
          className={'lvl'}
          bgColor={bgColor}
          bgColorTrack="black"
          boxShadowOfThumb="0px 5px 5px rgba(0, 0, 0,  0.2)"
          id="one"
          labelBgColor="red"
          max={100}
          min={0}
          value={lvl}
          disabled={false}
          markers={[
            '',
            <Typography>20%</Typography>,
            <Typography>40%</Typography>,
            <Typography>60%</Typography>,
            <Typography>80%</Typography>,
            <Typography>Full</Typography>
          ]}
        
        />
    </div>
  )
}

export default Bin