// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {FanSlayerArtists} from "../src/FanSlayer.sol";

contract DeployFanSlayer is Script {
    function run() external returns (FanSlayerArtists deployed) {
        // Deben coincidir exactamente con `name` en frontend/src/config.js (ARTISTS).
        string[] memory artists = new string[](2);
        artists[0] = "Bad Bany";
        artists[1] = "Michel Jackson";

        vm.startBroadcast();
        deployed = new FanSlayerArtists(artists);
        vm.stopBroadcast();
    }
}
