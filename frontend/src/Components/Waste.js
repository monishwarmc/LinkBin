import React, { useState } from 'react'
import abi from '../abi.json';
import {usePrepareContractWrite, useContractWrite} from 'wagmi';
import useDebounce from '../Hooks/useDebounce';
import { Input, Button } from '@web3uikit/core';

function Update({contractAddress, chainId}) {



    const [uid, setUid] = useState('');
    const [wasteAmount, setWasteAmount] = useState('');

    const debouncedUid = useDebounce(parseInt(uid), 500);
    const debouncedWasteAmount = useDebounce(parseInt(wasteAmount), 500);
    const { config} = usePrepareContractWrite({
        address: contractAddress,
        abi: abi,
        chainId: chainId,
        functionName: 'updateTotalWaste',
        args: [debouncedUid, debouncedWasteAmount],
        enabled: Boolean(debouncedUid && debouncedWasteAmount)
    })
    const { write } = useContractWrite(config);


  return (
    <>
    <div>
        <h2>update waste amount of user</h2>
        <form>
            <Input
            label="uid"
            name="uid"
            placeholder="enter uid"
            onChange={function noRefCheck(e){setUid(e.target.value)}}
            type='number'
            />
            <br/>
            <Input
            label="waste amount"
            name="wasteAmount"
            placeholder="enter waste Amount"
            onChange={function noRefCheck(e){setWasteAmount(e.target.value)}}
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
    </>
  )
}

export default Update