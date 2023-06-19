import { useState , useEffect} from "react";
import useDebounce from "../Hooks/useDebounce";
import {usePrepareContractWrite, useContractWrite} from 'wagmi';
import ABI from '../abi.json';
import { Input, Button} from '@web3uikit/core';


function UserRegister({contractAddress, chainId}){
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const zoom = 100;
    const debouncedLatitude = useDebounce(Math.floor(latitude), 500);
    const debouncedLongitude = useDebounce(Math.floor(longitude), 500);
    const { config } = usePrepareContractWrite({
        address: contractAddress,
        abi: ABI,
        chainId: chainId,
        functionName: 'registerUser',
        args: [debouncedLatitude, debouncedLongitude],
        enabled: Boolean(debouncedLatitude && debouncedLongitude)
    })

    const { write } = useContractWrite(config);

    useEffect(()=>{
        navigator.geolocation.getCurrentPosition((postion)=>{
            setLatitude(postion.coords.latitude)
            setLongitude(postion.coords.longitude)
        })
    })

    return(
        <>
        <form>
            <Input
            label="latitude"
            name="latitude"
            placeholder="enter latitude"
            onChange={function noRefCheck(e){setLatitude(e.target.value)}}
            value={latitude}
            openByDefault
            type="number"
            />
            <br/>
            <Input
            label="longitude"
            name="longitude"
            placeholder="enter longitude"
            onChange={function noRefCheck(e){setLongitude(e.target.value)}}
            openByDefault
            type="number"
            value={longitude}
            />
            <br/>
            <Button
            onClick={function noRefCheck(e){
                e.preventDefault();
                write?.()}}
            text="register"
            disabled={!write}
            />
        </form>
        <br/>
        <iframe
                src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=${zoom}&output=embed`}
                width="600"
                height="450"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="google map"
            ></iframe>

        </>
    );
};

export default UserRegister;
