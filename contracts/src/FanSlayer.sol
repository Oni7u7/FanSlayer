// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

/// @title FanSlayer Artists
/// @notice Cada token es un artista jugable. Una wallet puede tener como
///         máximo un NFT de cada artista (al mintear y al recibir transferencias).
contract FanSlayerArtists is ERC721, Ownable {
    error NotEnoughMON();
    error UnknownArtist(string name);
    error ArtistAlreadyOwned(address wallet, string name);
    error TransferFailed();

    event ArtistAdded(string name);

    uint256 private _nextTokenId;
    uint256 public mintPrice = 0.01 ether;

    /// @notice Nombre del artista de cada token.
    mapping(uint256 => string) public artistName;

    /// @notice Artistas que se pueden mintear, por keccak256 del nombre.
    mapping(bytes32 => bool) public isArtist;

    mapping(address => mapping(bytes32 => bool)) private _ownsArtist;

    constructor(string[] memory initialArtists) ERC721("FanSlayer Artists", "FSART") Ownable(msg.sender) {
        for (uint256 i = 0; i < initialArtists.length; i++) {
            _addArtist(initialArtists[i]);
        }
    }

    /// @notice Agrega un artista al catálogo (solo el dueño del contrato).
    function addArtist(string calldata name) external onlyOwner {
        _addArtist(name);
    }

    /// @notice Mintea el artista `name` a quien llama. Revierte si ya tiene uno.
    function mintArtist(string calldata name) external payable {
        if (msg.value < mintPrice) revert NotEnoughMON();
        if (!isArtist[_key(name)]) revert UnknownArtist(name);

        uint256 tokenId = _nextTokenId++;
        artistName[tokenId] = name;
        _safeMint(msg.sender, tokenId);
    }

    /// @notice true si `wallet` ya tiene un NFT del artista `name`.
    function hasArtist(address wallet, string calldata name) external view returns (bool) {
        return _ownsArtist[wallet][_key(name)];
    }

    /// @notice Cantidad de tokens minteados. Los ids van de 0 a totalMinted() - 1.
    function totalMinted() external view returns (uint256) {
        return _nextTokenId;
    }

    function withdraw() external onlyOwner {
        (bool success,) = payable(owner()).call{value: address(this).balance}("");
        if (!success) revert TransferFailed();
    }

    /// @dev Punto único por el que pasan mint, transfer y burn: aquí se
    ///      mantiene el registro de qué artistas tiene cada wallet.
    function _update(address to, uint256 tokenId, address auth) internal override returns (address from) {
        bytes32 key = _key(artistName[tokenId]);
        if (to != address(0) && to != _ownerOf(tokenId) && _ownsArtist[to][key]) {
            revert ArtistAlreadyOwned(to, artistName[tokenId]);
        }

        from = super._update(to, tokenId, auth);

        if (from != address(0)) _ownsArtist[from][key] = false;
        if (to != address(0)) _ownsArtist[to][key] = true;
    }

    function _addArtist(string memory name) private {
        isArtist[_key(name)] = true;
        emit ArtistAdded(name);
    }

    function _key(string memory name) private pure returns (bytes32) {
        return keccak256(bytes(name));
    }
}
