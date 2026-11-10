// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {FanSlayerArtists} from "../src/FanSlayer.sol";

contract DeployFanSlayer is Script {
    function run() external returns (FanSlayerArtists deployed) {
        vm.startBroadcast();
        deployed = new FanSlayerArtists();
        vm.stopBroadcast();
    }
}
