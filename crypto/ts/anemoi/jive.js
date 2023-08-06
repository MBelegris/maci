const Scalar = require("ffjavascript").Scalar;

const anemoiPerm = require("./anemoi.js");

function getNumRounds(alpha, length){
    // length = {1,2,3,4,6,8} & alpha = {3, 5, 7, 11}
    let rounds = [[21, 21, 20, 19],[14, 14, 13, 13],[12, 12, 12, 11],[12, 12, 11, 11],[10, 10, 10, 10],[10, 10, 9, 9]]; // taken from paper for s = 128

    if (length < 5) {
        if (alpha == 3){
            return rounds[length-1][0];
        }
        if (alpha == 5){
            return rounds[length-1][1];
        }
        if (alpha == 7){
            return rounds[length-1][2];
        } else {
            return rounds[length-1][3];
        }
    } else {
        if (length == 6){
            if (alpha == 3){
                return rounds[4][0];
            }
            if (alpha == 5){
                return rounds[4][1];
            }
            if (alpha == 7){
                return rounds[4][2];
            } else {
                return rounds[4][3];
            }
        } else {
            if (alpha == 3){
                return rounds[5][0];
            }
            if (alpha == 5){
                return rounds[5][1];
            }
            if (alpha == 7){
                return rounds[5][2];
            } else {
                return rounds[5][3];
            }
        }
    }
}

const jive_mode = (inputs) => {

    // prime_field, nInputs, numRounds, generator, inverse_generator, alpha, inverse_alpha, beta, gamma, delta, stateX, stateY
    let prime_field = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
    let nInputs = Math.floor(inputs.length / 2) + (inputs.length % 2);
    let alpha = 5;
    let inverse_alpha = BigInt("8755297148735710088898562298102910035419345760166413737479281674630323398247")
    let numRounds = getNumRounds(alpha, nInputs);
    let generator = 5;
    let inverse_generator = inverse_alpha;
    let beta = generator;
    let gamma = inverse_generator;
    let delta = BigInt("0");

    let stateX = [];
    let stateY = [];

    if (inputs.length % 2 == 0){
        for (var i = 0; i < nInputs; i++){
            stateX.push(inputs[2*i]);
            stateY.push(inputs[(2*i)+1]);
        }
    } else {
        for (var i = 0; i < nInputs; i++){
            stateX.push(inputs[2*i]);
            if ((2*i) + 1 > nInputs){
                stateY.push(BigInt("0"));
            } else {
                stateY.push(inputs[(2*i)+1]);
            }
        }
    }

    anemoi = anemoiPerm(prime_field, nInputs, numRounds, BigInt(generator), inverse_generator, BigInt(alpha), inverse_alpha,
        BigInt(beta), gamma, delta, stateX, stateY);
        
    hash = 0;

    outX = anemoi[0];
    outY = anemoi[1];

    for (var i = 0; i < nInputs; i++){
        hash = Scalar.mod(
            Scalar.add(
                Scalar.add(
                    Scalar.add(stateX[i], outX[i]), 
                    Scalar.add(stateY[i], outY[i])), 
                    hash), 
                prime_field);
    }

    return hash;
}

module.exports = jive_mode;