// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script} from "forge-std/Script.sol";
import {FanSlayerArtists} from "../src/FanSlayer.sol";

contract DeployFanSlayer is Script {
function run() external {
vm.startBroadcast();
new FanSlayerArtists();
vm.stopBroadcast();
}
}