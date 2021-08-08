import React, { useState, useEffect } from "react";
import { Contract } from "@ethersproject/contracts";
import { useQuery } from "@apollo/react-hooks";
import * as sigUtil from "eth-sig-util";
import * as CryptoJS from "crypto-js";
import { ethers } from "ethers";
import useWeb3Modal from "./hooks/useWeb3Modal";

import { Body, Button, Image, Div } from "./components";
import { TopBar } from "./components/header";
import logo from "./ethereumLogo.png";

import { addresses, abis } from "@project/contracts";
import GET_TRANSFERS from "./graphql/subgraph";

function App() {
  const { loading, error, data } = useQuery(GET_TRANSFERS);
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal({
    autoLoad: false,
  });
  const [aesKey, setAesKey] = useState();
  const [publicKey, setPublicKey] = useState("");
  const [originalMessage, setOriginalMessage] = useState("");
  const [encryptedMessage, setEncryptedMessage] = useState("");
  const [decryptedMessage, setDecryptedMessage] = useState("");
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
    <div>
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
      <Body>
        <Image src={logo} alt="react-logo" />
        <p>Start typing your message!</p>
        <p>{publicKey}</p>
        <label>Original Message</label>
        <textarea
          id="origMessage"
          name="orig-message"
          value={originalMessage}
          onChange={(event) => {
            setOriginalMessage(event.target.value);
          }}
        />
        <br />
        <Div>
          <Button
            onClick={() => {
              try {
                console.log("encrypting original message");
                console.log(originalMessage);
                console.log(aesKey);

                const encrypted = CryptoJS.AES.encrypt(originalMessage, aesKey);
                setEncryptedMessage(encrypted);
              } catch (e) {
                console.error(e);
              }
            }}
          >
            Encrypt Message!
          </Button>
        </Div>
        <label>Encrypted Message</label>
        <textarea
          id="encrMessage"
          name="enc-message"
          value={encryptedMessage}
          readOnly
        />
        <br />
        <Div>
          <Button
            onClick={async () => {
              try {
                // Get AES key from document
                const res = await documentContract.getDocumentKey(documentId);
                // Decrypt key using private eth key
                const accounts = await provider.listAccounts();
                console.log(accounts);
                const ret = await provider.provider.request({
                  method: "eth_decrypt",
                  params: [res, accounts[0]],
                });
                const retAesKey = JSON.parse(ret).data;
                console.log("Decrypting message");
                const decrypted = CryptoJS.AES.decrypt(
                  encryptedMessage,
                  retAesKey
                );
                setDecryptedMessage(decrypted.toString(CryptoJS.enc.Utf8));
              } catch (e) {
                console.error(e);
              }
            }}
          >
            Decrypt Message
          </Button>
        </Div>

        <label>Decrypted Message</label>
        <textarea
          id="encrMessage"
          name="enc-message"
          value={decryptedMessage}
          readOnly
        />
      </Body>
    </div>
  );
}

export default App;
