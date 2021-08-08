import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Home from './pages/Home';
import { Contract } from "@ethersproject/contracts";
import { useQuery } from "@apollo/react-hooks";
import * as sigUtil from "eth-sig-util";
import { ethers } from "ethers";
import useWeb3Modal from "./hooks/useWeb3Modal";

import { TopBar } from "./components/header";

import { addresses, abis } from "@project/contracts";
import GET_TRANSFERS from "./graphql/subgraph";

function App() {
  const { loading, error, data } = useQuery(GET_TRANSFERS);
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal({
    autoLoad: false,
  });
  const [aesKey, setAesKey] = useState();
  const [publicKey, setPublicKey] = useState("");
  const [documentId, setDocumentId] = useState();
  const [documentContract, setDocumentContract] = useState({});

  useEffect(() => {
    if (!loading && !error && data && data.transfers) {
      console.log({ transfers: data.transfers });
    }
  }, [loading, error, data]);

  useEffect(() => {
    (async function() {
      if (provider) {
        // Get public key
        const accounts = await provider.listAccounts();
        const publicKey = await provider.provider.request({
          method: "eth_getEncryptionPublicKey",
          params: [accounts[0]],
        });
        console.log(`Got public key ${publicKey}`);
        setPublicKey(publicKey);

        // Hook into new document events
        const document = new Contract(
          addresses.document,
          abis.document,
          provider.getSigner(0)
        );
        const startBlockNumber = await provider.getBlockNumber();
        document.on(document.filters.NewDocument(null), (...args) => {
          const event = args[args.length - 1];
          if (event.blockNumber <= startBlockNumber) return;

          console.log(`docId ${ethers.BigNumber.from(event.data)}`);
          setDocumentId(ethers.BigNumber.from(event.data));
        });

        setDocumentContract(document);
      }
    })();
  }, [provider]);

  return (
    <Router>
      <TopBar
        provider={provider}
        loadWeb3Modal={loadWeb3Modal}
        logoutOfWeb3Modal={logoutOfWeb3Modal}
        onCreateNewDocument={async (aesKey) => {
          // Encrypt AES key with public Eth key
          const buf = Buffer.from(
            JSON.stringify(
              sigUtil.encryptSafely(
                publicKey,
                { data: aesKey },
                "x25519-xsalsa20-poly1305"
              )
            ),
            "utf-8"
          );

          // Create new document on-chain
          const createDocumentTx = await documentContract.createDocument(
            buf.toString("hex")
          );

          await createDocumentTx.wait();
          setAesKey(aesKey);
        }}
      />
      <Route path="/">
        <Home provider={provider} publicKey={publicKey} aesKey={aesKey} documentContract={documentContract} documentId={documentId} />
      </Route>
    </Router>
  );
}

export default App;
