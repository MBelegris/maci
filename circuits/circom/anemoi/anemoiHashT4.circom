pragma circom 2.0.0;
include "./jive.circom";

template AnemoiHashT4(){ // 3 inputs so size of X, Y = 2
    var nInputs = 2;
    var numRounds = 14;
    var exp = 8755297148735710088898562298102910035419345760166413737479281674630323398247;
    var inv_exp = 5;

    signal input X[nInputs];
    signal input Y[nInputs]; // Must add a zero when having 3 inputs
    signal input roundConstantC[numRounds][nInputs];
    signal input roundConstantD[numRounds][nInputs];

    signal q = 21888242871839275222246405745257275088548364400416034343698204186575808495617; // The field over which the hash function is described (either an odd prime field or 2^n where n is odd)
    signal isPrime = "true";
    signal g = 5; // g is the generator found in Fq
    signal inv_g = 8755297148735710088898562298102910035419345760166413737479281674630323398247; // The multiplicative inverse of g in Fq

    // jive_mode(b, numRounds, exp, inv_exp)
    component jive = jive_mode(nInputs, numRounds, exp, inv_exp);
    jive.X <== X;
    jive.Y <== Y;
    jive.q <== q;
    jive.g <== g;
    jive.inv_g <== inv_g;
    jive.roundConstantC <== roundConstantC;
    jive.roundConstantD <== roundConstantD;
}