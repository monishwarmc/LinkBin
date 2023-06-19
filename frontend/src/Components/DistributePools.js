import React, { useState } from 'react'
import useDebounce from '../Hooks/useDebounce';
import {usePrepareContractWrite, useContractWrite} from 'wagmi';
import abi from '../abi.json';
import {Input, Button} from '@web3uikit/core'

function DistributePools({contractAddress, chainId}) {


    const [poolId, setPoolId] = useState('');
    const debouncedPoolId = useDebounce(parseInt(poolId), 500);

    const { config } = usePrepareContractWrite({
        address: contractAddress,
        abi: abi,
        chainId: chainId,
        functionName: 'distributePoolRewards',
        args: [debouncedPoolId],
        enabled: Boolean(debouncedPoolId)
    })
    const { write } = useContractWrite(config);

  return (
    <div>
        <h2>Distribute rewards</h2>
        <form>
            <Input
            label="pool Id"
            name="poolId"
            placeholder="enter number pool id"
            onChange={function noRefCheck(e){setPoolId(e.target.value)}}
            type='number'
            />
            <br/>
            <Button
            onClick={function noRefCheck(e){
                e.preventDefault();
                write?.()}}
            text="reward"
            disabled={!write}
            />
        </form>
    </div>
  )
}

export default DistributePools