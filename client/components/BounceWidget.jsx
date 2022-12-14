import React, { useState, useEffect } from "react";
import { Radio } from "@material-tailwind/react";
import Web3Modal from "web3modal";
import { ethers, BigNumber } from "ethers";

import { DropdownWidget } from "./index";
import { validChains, bounceTo, LPAddresses, VaultAddresses, chainDomainID } from "../utils/index";
import { BOUNCE_CONSTANTS_ADDRESS, BOUNCE_CONSTANTS_ABI } from "../config";

const BounceWidget = ({ constantsContract }) => {
    const [contract, setContract] = useState();
    const [inputTokensList, setInputTokensList] = useState([]);
    const [outputTokensList, setOutputTokensList] = useState([]);

    const [inputValue, setInputValue] = useState(0);
    const [srcToken, setSrcToken] = useState("");
    const [targetChain, setTargetChain] = useState("");
    const [slippage, setSlippage] = useState(0);
    const [bounceToType, setBounceToType] = useState("");
    const [contractTo, setContractTo] = useState("");
    const [destToken, setDestToken] = useState("");

    // contracts used in a protocol/lp/vault
    const [useAddress, setUseAddress] = useState([]);

    //
    const [protocolAddresses, setProtocolAddresses] = useState([]);

    // prevent infinite render
    useEffect(() => {
        async function getContract() {
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();

            const provider = new ethers.providers.Web3Provider(window.ethereum);

            let _contract = new ethers.Contract(BOUNCE_CONSTANTS_ADDRESS, BOUNCE_CONSTANTS_ABI, provider);

            setContract(_contract);
        }

        getContract();
    }, [contract]);

    // helper function to populate all the protocols to be bounced into
    async function protocols() {
        const ProtocolAddresses = [];

        const addresses = await contract.getAllProtocols();
        const names = await contract.getProtocolNames();
        for (let i = 0; i < names.length; i++) {
            ProtocolAddresses.push({
                type: names[i],
                key: addresses[i],
            });
        }

        setUseAddress(ProtocolAddresses);
    }

    // helper function to populate all the LPs to be bounced into
    async function lps() {
        const ProtocolAddresses = [];

        const addresses = await contract.getAllLPs();
        const names = await contract.getLPNames();
        for (let i = 0; i < names.length; i++) {
            ProtocolAddresses.push({
                type: names[i],
                key: addresses[i],
            });
        }

        setUseAddress(ProtocolAddresses);
    }

    // helper function to populate all the vaultss to be bounced into
    async function vaults() {
        const ProtocolAddresses = [];

        const addresses = await contract.getAllVaults();
        const names = await contract.getVaultNames();
        for (let i = 0; i < names.length; i++) {
            ProtocolAddresses.push({
                type: names[i],
                key: addresses[i],
            });
        }

        setUseAddress(ProtocolAddresses);
    }

    async function inputTokens() {
        //                     get input tokens list
        const InputTokens = [];

        const chainID = window.ethereum.chainId;
        const domainID = BigNumber.from(chainDomainID[chainID]);

        const addresses = await contract.getApprovedTokens(domainID);
        const names = await contract.getApprovedTokenSymbols(domainID);

        for (let i = 0; i < names.length; i++) {
            InputTokens.push({
                type: names[i],
                key: addresses[i],
            });
        }

        setInputTokensList(InputTokens);
    }

    async function outputTokens() {
        if (!targetChain) {
            window.alert("Please select a target chain");
        } else {
            const OutputTokens = [];

            const domainID = BigNumber.from(chainDomainID[targetChain]);

            const addresses = await contract.getApprovedTokens(domainID);
            const names = await contract.getApprovedTokenSymbols(domainID);

            for (let i = 0; i < names.length; i++) {
                OutputTokens.push({
                    type: names[i],
                    key: addresses[i],
                });
            }

            setOutputTokensList(OutputTokens);
        }
    }

    const handleInputChange = (e) => {
        // handle input chaage
        setInputValue(e.target.value);
    };

    const handleSlippageChange = (e) => {
        setSlippage(e.target.value);
    };

    const getInputTokenData = (data) => {
        setSrcToken(data.anchorKey);
    };

    const getChainData = async (data) => {
        setTargetChain(data.anchorKey);
    };

    const getBounceToData = (data) => {
        setBounceToType(data.anchorKey);
    };

    const getContractAddressData = (data) => {
        setContractTo(data.anchorKey);
    };

    const getOutputTokenData = (data) => {
        setDestToken(data.anchorKey);
    };

    const bounce = () => {
        {
            /*
             * when sending data crosschain
             *
             *  IBounce.Order memory _order = IBounce.Order(
             *
             *   weth_goerli,                       (inputToken)
             *   tWeth_mumbai,                      (outputToken)
             *   address(mockReceiver_mumbai),      (contractTo)
             *   address(bounceReceiver_mumbai),    (import - hardcode receiver address)
             *   amount2Send,                       (inputValue)
             *   minAmount2Send,                    (inputValue - slippage*inputValue)
             *   0,                                 (cointract function to computre relayer fee)
             *   20,                                (slippage)
             *   domainID_mumbai                    (chainDomainID.chainID   -> chainID = window.ethereum.chainId)
             *);
             *
             * to be fetched from constants contract, getProtocol/LP/VaultCallData(address)
             *string memory _payloadString = "deposit(uint256)";
             */
        }

        // create an order tuple
        //
    };

    return (
        <div className="rounded-lg bg-orange-100 shadow-md p-4 grid grid-cols-1 grid-rows-6 place-items-center">
            <div className="flex">
                <button onClick={inputTokens} className="bg-orange-100 p-6 shadow-lg shadow-slate-300 rounded-lg text-orange-400 mx-6">
                    Get src approved tokens
                </button>

                <DropdownWidget menuItems={inputTokensList} sendData={getInputTokenData} />
                <input name="inputValue" type="number" value={inputValue} onChange={handleInputChange} className="mx-5" />
            </div>

            <div className="grid grid-cols-1 grid-rows-5 justify-items-center items-start place-content-start">
                <div className="flex items-center">
                    <p className="mx-6">Destination chain</p>
                    <DropdownWidget menuItems={validChains} sendData={getChainData} />
                </div>
                <div className="flex my-6">
                    <button onClick={outputTokens} className="bg-orange-100 p-6 shadow-lg shadow-slate-300 rounded-lg text-orange-400 mx-6">
                        Get dest approved tokens
                    </button>
                    <div className="mx-3">
                        <p>Final token</p>
                        <DropdownWidget menuItems={outputTokensList} sendData={getOutputTokenData} />
                    </div>
                </div>
                <div className="flex items-center">
                    <p>slippage(%)</p>
                    <input name="slippage" type="number" value={slippage} onChange={handleSlippageChange} className="mx-5" />
                </div>
                <div className="grid grid-rows-1 grid-cols-3 gap-x-5 justify-items-center">
                    <Radio id="protocol" name="type" label="Protocol" onClick={protocols} />
                    <Radio id="lp" name="type" label="LP" onClick={lps} />
                    <Radio id="vault" name="type" label="Vault" onClick={vaults} />
                </div>
                <div className="my-6 flex">
                    <div className="mx-3">
                        <p>Destination</p>
                        <DropdownWidget menuItems={useAddress} sendData={getContractAddressData} />
                    </div>
                </div>{" "}
                <div>
                    <button className="bg-black p-6 shadow-lg shadow-slate-300 rounded-lg text-orange-400 mx-6">Bounce</button>
                </div>
            </div>
        </div>
    );
};

export default BounceWidget;
