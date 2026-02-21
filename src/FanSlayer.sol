// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";

import "openzeppelin-contracts/contracts/access/Ownable.sol";

contract FanSlayerArtists is ERC721, Ownable {
    uint256 private _nextTokenId;
    uint256 public mintPrice = 0.01 ether;
    mapping(uint256 => string) public artistName;

    constructor() ERC721("FanSlayer Artists", "FSART") Ownable(msg.sender) {}

    function mintArtist(string calldata _name) external payable {
        require(msg.value >= mintPrice, "Not enough MON");
        uint256 tokenId = _nextTokenId++;
        artistName[tokenId] = _name;
        _mint(msg.sender, tokenId);
    }

        function withdraw() external onlyOwner {
        // payable(owner()).transfer(address(this).balance);

        // ✅ Correcto
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }
}