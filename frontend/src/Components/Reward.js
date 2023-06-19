import React, { useState } from 'react'
import abi from '../abi.json';
import {usePrepareContractWrite, useContractWrite} from 'wagmi';
import useDebounce from '../Hooks/useDebounce';
import {Input, Button} from '@web3uikit/core'


function Reward({contractAddress, chainId}) {


    const [amount, setAmount] = useState('');
    const debouncedAmount= useDebounce(parseInt(amount)*1e8, 500);

    const { config } = usePrepareContractWrite({
        address: contractAddress,
        abi: abi,
        chainId: chainId,
        functionName: 'rewardUsers',
        args: [debouncedAmount],
        enabled: Boolean(debouncedAmount)
    })
    const { write } = useContractWrite(config);

  return ( 
    <div>
        <h2>Reward user</h2>
        <form>
            <Input
            label="Amount"
            name="Amount"
            placeholder="enter amount in usd"
            onChange={function noRefCheck(e){setAmount(e.target.value)}}
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

export default Reward