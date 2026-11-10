// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {FanSlayerArtists} from "../src/FanSlayer.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

contract FanSlayerArtistsTest is Test {
    FanSlayerArtists internal nft;
    address internal owner = makeAddr("owner");
    address internal fan = makeAddr("fan");
    address internal other = makeAddr("other");

    string internal constant BAD_BANY = "Bad Bany";
    string internal constant MJ = "Michel Jackson";

    function setUp() public {
        string[] memory artists = new string[](2);
        artists[0] = BAD_BANY;
        artists[1] = MJ;

        vm.prank(owner);
        nft = new FanSlayerArtists(artists);

        vm.deal(fan, 1 ether);
        vm.deal(other, 1 ether);
    }

    function _mint(address who, string memory name) internal {
        vm.prank(who);
        nft.mintArtist{value: 0.01 ether}(name);
    }

    function test_Metadata() public view {
        assertEq(nft.name(), "FanSlayer Artists");
        assertEq(nft.symbol(), "FSART");
        assertEq(nft.owner(), owner);
        assertEq(nft.mintPrice(), 0.01 ether);
        assertEq(nft.totalMinted(), 0);
    }

    function test_MintArtist() public {
        _mint(fan, BAD_BANY);

        assertEq(nft.ownerOf(0), fan);
        assertEq(nft.balanceOf(fan), 1);
        assertEq(nft.artistName(0), BAD_BANY);
        assertTrue(nft.hasArtist(fan, BAD_BANY));
        assertFalse(nft.hasArtist(fan, MJ));
        assertEq(nft.totalMinted(), 1);
        assertEq(address(nft).balance, 0.01 ether);
    }

    function test_MintDifferentArtists() public {
        _mint(fan, BAD_BANY);
        _mint(fan, MJ);

        assertEq(nft.balanceOf(fan), 2);
        assertEq(nft.artistName(1), MJ);
        assertTrue(nft.hasArtist(fan, MJ));
    }

    function test_RevertWhen_MintSameArtistTwice() public {
        _mint(fan, BAD_BANY);

        vm.prank(fan);
        vm.expectRevert(abi.encodeWithSelector(FanSlayerArtists.ArtistAlreadyOwned.selector, fan, BAD_BANY));
        nft.mintArtist{value: 0.01 ether}(BAD_BANY);
    }

    function test_DifferentWalletsCanOwnSameArtist() public {
        _mint(fan, BAD_BANY);
        _mint(other, BAD_BANY);

        assertEq(nft.ownerOf(1), other);
    }

    function test_RevertWhen_UnknownArtist() public {
        vm.prank(fan);
        vm.expectRevert(abi.encodeWithSelector(FanSlayerArtists.UnknownArtist.selector, "Kendrick"));
        nft.mintArtist{value: 0.01 ether}("Kendrick");
    }

    function test_RevertWhen_NotEnoughValue() public {
        vm.prank(fan);
        vm.expectRevert(FanSlayerArtists.NotEnoughMON.selector);
        nft.mintArtist{value: 0.009 ether}(BAD_BANY);
    }

    function test_RevertWhen_TransferToWalletThatAlreadyHasArtist() public {
        _mint(fan, BAD_BANY);
        _mint(other, BAD_BANY);

        vm.prank(fan);
        vm.expectRevert(abi.encodeWithSelector(FanSlayerArtists.ArtistAlreadyOwned.selector, other, BAD_BANY));
        nft.transferFrom(fan, other, 0);
    }

    function test_TransferMovesOwnershipOfArtist() public {
        _mint(fan, BAD_BANY);

        vm.prank(fan);
        nft.transferFrom(fan, other, 0);

        assertFalse(nft.hasArtist(fan, BAD_BANY));
        assertTrue(nft.hasArtist(other, BAD_BANY));

        // Al quedarse sin el artista, puede volver a comprarlo.
        _mint(fan, BAD_BANY);
        assertTrue(nft.hasArtist(fan, BAD_BANY));
    }

    function test_SelfTransferDoesNotRevert() public {
        _mint(fan, BAD_BANY);

        vm.prank(fan);
        nft.transferFrom(fan, fan, 0);

        assertTrue(nft.hasArtist(fan, BAD_BANY));
    }

    function test_OwnerCanAddArtist() public {
        vm.prank(owner);
        nft.addArtist("Kendrick");

        _mint(fan, "Kendrick");
        assertTrue(nft.hasArtist(fan, "Kendrick"));
    }

    function test_RevertWhen_NonOwnerAddsArtist() public {
        vm.prank(fan);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, fan));
        nft.addArtist("Kendrick");
    }

    function test_WithdrawSendsBalanceToOwner() public {
        _mint(fan, BAD_BANY);

        vm.prank(owner);
        nft.withdraw();

        assertEq(owner.balance, 0.01 ether);
        assertEq(address(nft).balance, 0);
    }

    function test_RevertWhen_NonOwnerWithdraws() public {
        vm.prank(fan);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, fan));
        nft.withdraw();
    }
}
