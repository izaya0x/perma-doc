import React from "react";
import { Button, Header } from "./index";
import { generateKey } from "../utils/crypto";

export function TopBar({
  provider,
  loadWeb3Modal,
  logoutOfWeb3Modal,
  onCreateNewDocument,
}) {
  return (
    <Header>
      {provider ? (
        <Button
          onClick={() => {
            // Create new AES Key
            console.log("generating AES key");
            const key = generateKey();

            onCreateNewDocument("my-pwd");
          }}
        >
          Create New Document
        </Button>
      ) : null}
      <Button
        onClick={() => {
          // Load provider
          if (!provider) {
            loadWeb3Modal();
          } else {
            logoutOfWeb3Modal();
          }
        }}
      >
        {!provider ? "Login" : "Logout"}
      </Button>
    </Header>
  );
}
