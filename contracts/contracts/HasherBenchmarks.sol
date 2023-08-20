// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { Hasher } from "./crypto/Hasher.sol";
import { AnemoiHasher } from "./crypto/AnemoiHasher.sol";

contract HasherBenchmarks is Hasher, AnemoiHasher {
    function hash5Benchmark(uint256[5] memory array) public {
        hash5(array);
    }

    function hashLeftRightBenchmark(uint256 _left, uint256 _right) public {
        hashLeftRight(_left, _right);
    }

    function anemoiHash5Benchmark(uint256[5] memory array) public {
        anemoiHash5(array);
    }
    
    function anemoiHashLeftRightBenchmark(uint256 _left, uint256 _right) public {
        anemoiHashLeftRight(_left, _right);
    }
}
