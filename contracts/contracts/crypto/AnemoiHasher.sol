// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { SnarkConstants } from "./SnarkConstants.sol";
import "./Jive.sol";


library AnemoiT3 {
    function anemoi(uint256[2] memory input) public view returns (uint256) {
        return Jive2.Jive(input[0], input[1]);
    }
}

library AnemoiT4 {
    function anemoi(uint256[3] memory input) public view returns (uint256) {
        uint256[2] memory in0;
        uint256[2] memory in1;
        in0[0] = input[0];
        in1[0] = input[1];
        in0[1] = input[2];
        in1[1] = 0;// padding
        return Jive4.Jive(in0, in1);
    }
}


library AnemoiT5 {
    function anemoi(uint256[4] memory input) public view returns (uint256) {
        uint256[2] memory in0;
        uint256[2] memory in1;
        in0[0] = input[0];
        in1[0] = input[1];
        in0[1] = input[2];
        in1[1] = input[3];
        return Jive4.Jive(in0, in1);
    }
}


library AnemoiT6 {
    function anemoi(uint256[5] memory input) public view returns (uint256) {
        uint256[3] memory in0;
        uint256[3] memory in1;
        in0[0] = input[0];
        in1[0] = input[1];
        in0[1] = input[2];
        in1[1] = input[3];
        in0[2] = input[4];
        in1[2] = 0;// padding
        return Jive6.Jive(in0, in1);
    }
}

contract AnemoiHasher is SnarkConstants {
    function hash2(uint256[2] memory array) public view returns (uint256) {
        return AnemoiT3.anemoi(array);
    }

    function hash3(uint256[3] memory array) public view returns (uint256) {
        return AnemoiT4.anemoi(array);
    }

    function hash4(uint256[4] memory array) public view returns (uint256) {
        return AnemoiT5.anemoi(array);
    }

    function hash5(uint256[5] memory array) public view returns (uint256) {
        return AnemoiT6.anemoi(array);
    }

    function hashLeftRight(uint256 _left, uint256 _right) public view returns (uint256) {
        uint256[2] memory input;
        input[0] = _left;
        input[1] = _right;

        return hash2(input);
    }
}