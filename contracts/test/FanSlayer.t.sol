// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {FanSlayerArtists} from "../src/FanSlayer.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

contract FanSlayerArtistsTest is Test {
    FanSlayerArtists internal nft;
    address internal owner = makeAddr("owner");
    address internal fan = makeAddr("fan");

    function setUp() public {
        vm.prank(owner);
        nft = new FanSlayerArtists();
        vm.deal(fan, 1 ether);
    }

    function test_Metadata() public view {
        assertEq(nft.name(), "FanSlayer Artists");
        assertEq(nft.symbol(), "FSART");
        assertEq(nft.owner(), owner);
        assertEq(nft.mintPrice(), 0.01 ether);
    }

    function test_MintArtist() public {
        vm.prank(fan);
        nft.mintArtist{value: 0.01 ether}("Bad Bany");

        assertEq(nft.ownerOf(0), fan);
        assertEq(nft.balanceOf(fan), 1);
        assertEq(nft.artistName(0), "Bad Bany");
        assertEq(address(nft).balance, 0.01 ether);
    }

    function test_MintIncrementsTokenId() public {
        vm.startPrank(fan);
        nft.mintArtist{value: 0.01 ether}("Bad Bany");
        nft.mintArtist{value: 0.01 ether}("Michel Jackson");
        vm.stopPrank();

        assertEq(nft.ownerOf(1), fan);
        assertEq(nft.artistName(1), "Michel Jackson");
    }

    function test_RevertWhen_NotEnoughValue() public {
        vm.prank(fan);
        vm.expectRevert(bytes("Not enough MON"));
        nft.mintArtist{value: 0.009 ether}("Bad Bany");
    }

    function test_WithdrawSendsBalanceToOwner() public {
        vm.prank(fan);
        nft.mintArtist{value: 0.01 ether}("Bad Bany");

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
