pragma circom 2.0.0
include "./anemoi/anemoiHashT3.circom";
include "./anemoi/anemoiHashT4.circom";
include "./anemoi/anemoiHashT5.circom";
include "./anemoi/anemoiHashT6.circom";

template Hasher3(){ // Three inputs exist
    var length = 2;

    signal input inputs[2*length - 1]; // 3 inputs
    signal input roundConstantC[14][2]; // numRounds x Length
    signal input roundConstantD[14][2]; // numRounds x Length

    signal output hash;

    signal X[length];
    signal Y[length];

    X[0] <== inputs[0];
    Y[0] <== inputs[1];
    X[1] <== inputs[2];
    Y[1] <== 0; // Only three inputs exist so must pad with 0

    component hasher = AnemoiHashT4();
    hasher.X <== X;
    hasher.Y <== Y;
    hasher.roundConstantC <== roundConstantC;
    hasher.roundConstantD <== roundConstantD;

    hash <== hasher.out;
}

template Hasher4(){ // Four inputs
    var length = 2;

    signal input inputs[2*length]; // 4 inputs
    signal input roundConstantC[14][2]; // numRounds x Length
    signal input roundConstantD[14][2]; // numRounds x Length

    signal output hash;

    signal X[length];
    signal Y[length];

    X[0] <== inputs[0];
    Y[0] <== inputs[1];
    X[1] <== inputs[2];
    Y[1] <== inputs[3]; // Only three inputs exist so must pad with 0

    component hasher = AnemoiHashT5();
    hasher.X <== X;
    hasher.Y <== Y;
    hasher.roundConstantC <== roundConstantC;
    hasher.roundConstantD <== roundConstantD;

    hash <== hasher.out;
}


template Hasher5() { 
    var length = 3;

    signal input inputs[length*2 - 1]; // 5 inputs
    signal input roundConstantC[12][3];
    signal input roundConstantD[12][3];

    signal output hash;

    signal X[length];
    signal Y[length];

    X[0] <== inputs[0];
    Y[0] <== inputs[1];
    X[1] <== inputs[2];
    Y[1] <== inputs[3];
    X[2] <== inputs[4];
    Y[2] <== 0; // Pad with 0 as only 5 inputs exist

    component hasher = AnemoiHashT6();
    hasher.X <== X;
    hasher.Y <== Y;
    hasher.roundConstantC <== roundConstantC;
    hasher.roundConstantD <== roundConstantD;

    hash <== hasher.out;
}

template Hasher13() {    
    // Hasher5(
    //     in[0]
    //     Hasher5_1(in[1], in[2], in[3], in[4], in[5]),
    //     Hasher5_2(in[6], in[7], in[8], in[9], in[10])
    //     in[11],
    //     in[12]
    // )
    
    signal input inputs[13];
    signal input roundConstantC[12][3];
    signal input roundConstantD[12][3];

    signal output hash;

    component hasher5 = AnemoiHashT6();
    component hasher5_1 = AnemoiHashT6();
    component hasher5_2 = AnemoiHashT6();

    signal X[3];
    signal Y[3];
    
    signal X_1[3];
    signal Y_1[3];

    signal X_2[3];
    signal Y_2[3];

    X_1[0] <== inputs[1];
    Y_1[0] <== inputs[2];
    X_1[1] <== inputs[3];
    Y_1[1] <== inputs[4];
    X_1[2] <== inputs[5];
    Y_1[2] <== 0;

    hasher5_1.X <== X_1;
    hasher5_1.Y <== Y_1;
    hasher5_1.roundConstantC <== roundConstantC;
    hasher5_1.roundConstantD <== roundConstantD;

    X_2[0] <== inputs[6];
    Y_2[0] <== inputs[7];
    X_2[1] <== inputs[8];
    Y_2[1] <== inputs[9];
    X_2[2] <== inputs[10];
    Y_2[2] <== 0;

    hasher5_2.X <== X_2;
    hasher5_2.Y <== Y_2;
    hasher5_2.roundConstantC <== roundConstantC;
    hasher5_2.roundConstantD <== roundConstantD;

    X[0] <== inputs[0];
    Y[0] <== hasher5_1.out;
    X[1] <== hasher5_2.out;
    Y[2] <== inputs[11];
    X[3] <== inputs[12];
    Y[3] <== 0;

    hasher5.X <== X;
    hasher5.Y <== Y;
    hasher5.roundConstantC <== roundConstantC;
    hasher5.roundConstantD <== roundConstantD;

    hash <== hasher5.out;
}

template HashLeftRight() {
    var length = 1;

    signal input inputs[length*2]; // 2 inputs
    signal input roundConstantC[21][1]; // numRounds x Length
    signal input roundConstantD[21][1];

    signal output hash;

    signal X[1];
    signal Y[1];

    X[0] <== inputs[0];
    Y[0] <== inputs[1];

    component hasher = AnemoiHashT3();
    signal input X <== X;
    signal input Y <== Y;
    signal input roundConstantC <== roundConstantC;
    signal input roundConstantD <== roundConstantD;

    hash <== hasher.out;    
}