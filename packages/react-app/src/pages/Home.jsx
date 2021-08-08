import React, {useState} from 'react';
import { Body, Button, Image, Div } from "../components";
import logo from "../ethereumLogo.png";

import * as CryptoJS from "crypto-js";

export default function Home ({provider, publicKey, aesKey, documentContract, documentId}) {
  const [originalMessage, setOriginalMessage] = useState("");
  const [encryptedMessage, setEncryptedMessage] = useState("");
  const [decryptedMessage, setDecryptedMessage] = useState("");

    return (
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
    );
}