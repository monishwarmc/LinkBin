import React, { useState } from 'react'
import abi from '../abi.json';
import {usePrepareContractWrite, useContractWrite} from 'wagmi';
import useDebounce from '../Hooks/useDebounce';
import { Input, Button } from '@web3uikit/core';

function Points({contractAddress, chainId}) {

    const [uid, setUid] = useState('');
    const debouncedUid = useDebounce(parseInt(uid), 500);
    const [points, setPoints] = useState('');
    const debouncedPoints = useDebounce(parseInt(points), 500);
    const { config } = usePrepareContractWrite({
        address: contractAddress,
        abi: abi,
        chainId: chainId,
        functionName: 'updateUserPoints',
        args: [debouncedUid, debouncedPoints],
        enabled: Boolean(debouncedUid && debouncedPoints)
    })
    const { write } = useContractWrite(config);

  return (
    
    <div>
        <h2>update points of the user</h2>
        <form>
            <Input
            label="poolId"
            name="poolId"
            placeholder="enter poolId"
            onChange={function noRefCheck(e){setUid(e.target.value)}}
            type='number'
            />
            <br/>
            <Input
            label="Points"
            name="Points"
            placeholder="enter Points"
            onChange={function noRefCheck(e){setPoints(e.target.value)}}
            type='number'
            />
            <br/>
            <Button
            onClick={function noRefCheck(e){
                e.preventDefault();
                write?.()}}
            text="update"
            disabled={!write}
            />
          </form>
    </div>
  )
}

export default Points