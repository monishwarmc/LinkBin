import React, { useState } from 'react';
import abi from '../abi.json';
import useDebounce from "../Hooks/useDebounce";
import {usePrepareContractWrite, useContractWrite} from 'wagmi';
import { Input, Button} from '@web3uikit/core';

function GiveawayPool({ contractAddress, chainId}) {

    const [giveawayAmount, setGiveawayAmount] = useState(null);
    const [entryPoints, setEntryPoints] = useState(null);
    const [noOfParticipants, setNoOfParticipants] = useState(null);

    const debouncedGiveawayAmount = useDebounce(giveawayAmount*1e8, 500);
    const debouncedEntryPoints = useDebounce(entryPoints, 500);
    const debouncednoOfParticipants = useDebounce(noOfParticipants, 500);
    const { config } = usePrepareContractWrite({
        address: contractAddress,
        abi: abi,
        chainId: chainId,
        functionName: 'createGiveawayPool',
        args: [debouncedGiveawayAmount, debouncedEntryPoints, debouncednoOfParticipants],
        enabled: Boolean(debouncedGiveawayAmount && debouncedEntryPoints && debouncednoOfParticipants)
    })

    const { write } = useContractWrite(config);



    return (
        <>
                    <div>
                        <h2>Create giveaway poll</h2>
                        <form>
                            <Input
                            label="giveawayAmount"
                            name="giveawayAmount"
                            placeholder="enter amount in dollar"
                            onChange={function noRefCheck(e){setGiveawayAmount(e.target.value)}}
                            type='number'
                            />
                            <br/>
                            <Input
                            label="entryPoints"
                            name="entryPoints"
                            placeholder="enter points"
                            onChange={function noRefCheck(e){setEntryPoints(e.target.value)}}
                            type='number'
                            />
                            <br/>
                            <Input
                            label="noOfParticipants"
                            name="noOfParticipants"
                            placeholder="enter number of participants"
                            onChange={function noRefCheck(e){setNoOfParticipants(e.target.value)}}
                            type='number'
                            />
                            <br/>
                            <Button
                            onClick={function noRefCheck(e){
                                e.preventDefault();
                                write?.()}}
                            text="create"
                            disabled={!write}
                            />
                        </form>
                    </div>
                    
        </>
)};

export default GiveawayPool