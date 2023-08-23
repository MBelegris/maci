// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

abstract contract EmptyBallotRoots {
    // emptyBallotRoots contains the roots of Ballot trees of five leaf
    // configurations.
    // Each tree has a depth of 10, which is the hardcoded state tree depth.
    // Each leaf is an empty ballot. A configuration refers to the depth of the
    // voice option tree for that ballot.

    // The leaf for the root at index 0 contains hash(0, root of a VO tree with
    // depth 1 and zero-value 0)

    // The leaf for the root at index 1 contains hash(0, root of a VO tree with
    // depth 2 and zero-value 0)

    // ... and so on.

    // The first parameter to the hash function is the nonce, which is 0.

    uint256[5] internal emptyBallotRoots;

    constructor() {
        emptyBallotRoots[0] = uint256(6410612793846899225520810651045067181838956894575600760268528881070304220495);
        emptyBallotRoots[1] = uint256(11415869390778752596929396527655314289561990856184276159209674988366864242031);
        emptyBallotRoots[2] = uint256(19504695403221883872042480570301390903254589381112580091645104340700712403381);
        emptyBallotRoots[3] = uint256(15186397892014300457760784679521469796317246960743697890347032661791647559982);
        emptyBallotRoots[4] = uint256(15262633678041667043970111911056424649793363045287668223107629773703367180614);

    }
}

