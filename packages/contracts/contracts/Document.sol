//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Document is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping(uint256 => string) private _documentKeys;

    event NewDocument(uint256 documentId);

    constructor() ERC721("Document", "DOC") {}

    function createDocument(string memory key) public returns (uint256) {
        _tokenIds.increment();

        uint256 newDocId = _tokenIds.current();
        _safeMint(msg.sender, newDocId);

        _documentKeys[newDocId] = key;

        emit NewDocument(newDocId);
        return newDocId;
    }

    function rotateDocumentKey(uint256 tokenId, string memory key) public {
        require(msg.sender == ownerOf(tokenId));
        console.log("Rotating document key!");

        _documentKeys[tokenId] = key;
    }

    function getDocumentKey(uint256 tokenId)
        public
        view
        returns (string memory)
    {
        console.log("Getting key for %s", msg.sender);
        require(msg.sender == ownerOf(tokenId));

        return _documentKeys[tokenId];
    }
}
