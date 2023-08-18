jest.setTimeout(90000)

import { 
    genWitness,
    getSignalByName,
} from './utils'

import {
    PCommand,
    Keypair,
} from 'maci-domainobjs'

import {
    stringifyBigInts,
    genRandomSalt,
    sha256Hash,
    anemoiHashLeftRight,
    anemoiHash13,
    anemoiHash5,
    anemoiHash4,
    anemoiHash3,
    hashLeftRight,
    hash13,
    hash5,
    hash4,
    hash3,
} from 'maci-crypto'

function modPow(base, exponent, modulus) {
    if (modulus === 1) return BigInt(0);
    let result = BigInt(1);
    base = base % modulus;
  
    while (exponent > 0) {
      if (exponent % BigInt(2) === BigInt(1)) {
        result = (result * base) % modulus;
      }
      exponent = exponent / BigInt(2);
      base = (base * base) % modulus;
    }
  
    return BigInt(result);
}

describe('Poseidon hash circuits', () => {
    describe('SHA256', () => {
        describe('Sha256HashLeftRight', () => {
            it('correctly hashes two random values', async () => {
                const circuit = 'sha256HashLeftRight_test'

                const left = genRandomSalt()
                const right = genRandomSalt()

                const circuitInputs = stringifyBigInts({ left, right })

                const witness = await genWitness(circuit, circuitInputs)
                const output = await getSignalByName(circuit, witness, 'main.hash')

                const outputJS = sha256Hash([left, right])

                expect(output.toString()).toEqual(outputJS.toString())
            })
        })

        describe('Sha256Hasher4', () => {
            const circuit = 'sha256Hasher4_test'
            it('correctly hashes 4 random values', async () => {
                const preImages: any = []
                for (let i = 0; i < 4; i++) {
                    preImages.push(genRandomSalt())
                }

                const circuitInputs = stringifyBigInts({
                    in: preImages,
                })

                const witness = await genWitness(circuit, circuitInputs)
                const output = await getSignalByName(circuit, witness, 'main.hash')

                const outputJS = sha256Hash(preImages)

                expect(output.toString()).toEqual(outputJS.toString())
            })
        })

        describe('Sha256Hasher6', () => {
            const circuit = 'sha256Hasher6_test'
            it('correctly hashes 6 random values', async () => {
                const preImages: any = []
                for (let i = 0; i < 6; i++) {
                    preImages.push(genRandomSalt())
                }

                const circuitInputs = stringifyBigInts({
                    in: preImages,
                })

                const witness = await genWitness(circuit, circuitInputs)
                const output = await getSignalByName(circuit, witness, 'main.hash')

                const outputJS = sha256Hash(preImages)

                expect(output.toString()).toEqual(outputJS.toString())
            })
        })
    })

    describe('Poseidon', () => {
        describe('Hasher5', () => {
            const circuit = 'hasher5_test'
            it('correctly hashes 5 random values', async () => {
                const preImages: any = []
                for (let i = 0; i < 5; i++) {
                    preImages.push(genRandomSalt())
                }

                const circuitInputs = stringifyBigInts({
                    in: preImages,
                })

                const witness = await genWitness(circuit, circuitInputs)
                const output = await getSignalByName(circuit, witness, 'main.hash')

                const outputJS = hash5(preImages)

                expect(output.toString()).toEqual(outputJS.toString())
            })
        })

        describe('Hasher4', () => {
            const circuit = 'hasher4_test'
            it('correctly hashes 4 random values', async () => {
                const preImages: any = []
                for (let i = 0; i < 4; i++) {
                    preImages.push(genRandomSalt())
                }

                const circuitInputs = stringifyBigInts({
                    in: preImages,
                })

                const witness = await genWitness(circuit, circuitInputs)
                const output = await getSignalByName(circuit, witness, 'main.hash')

                const outputJS = hash4(preImages)

                expect(output.toString()).toEqual(outputJS.toString())
            })
        })

        describe('Hasher3', () => {
            const circuit = 'hasher3_test'
            it('correctly hashes 3 random values', async () => {
                const preImages: any = []
                for (let i = 0; i < 3; i++) {
                    preImages.push(genRandomSalt())
                }

                const circuitInputs = stringifyBigInts({
                    in: preImages,
                })

                const witness = await genWitness(circuit, circuitInputs)
                const output = await getSignalByName(circuit, witness, 'main.hash')

                const outputJS = hash3(preImages)

                expect(output.toString()).toEqual(outputJS.toString())
            })
        })

        describe('Hasher13', () => {
            it('correctly hashes 13 random values', async () => {
                const circuit =  'hasher13_test'
                const preImages: any = []
                for (let i = 0; i < 13; i++) {
                    preImages.push(genRandomSalt())
                }
                const circuitInputs = stringifyBigInts({
                    in: preImages,
                })

                const witness = await genWitness(circuit, circuitInputs)
                const output = await getSignalByName(circuit, witness, 'main.hash')

                const outputJS = hash13(preImages)

                expect(output.toString()).toEqual(outputJS.toString())
            })
        })

        describe('HashLeftRight', () => {

            it('correctly hashes two random values', async () => {
                const circuit = 'hashleftright_test'

                const left = genRandomSalt()
                const right = genRandomSalt()

                const circuitInputs = stringifyBigInts({ left, right })

                const witness = await genWitness(circuit, circuitInputs)
                const output = await getSignalByName(circuit, witness, 'main.hash')

                const outputJS = hashLeftRight(left, right)

                expect(output.toString()).toEqual(outputJS.toString())
            })
        })
    })

    describe('Anemoi', () => {
        describe('Anemoi Hasher5', () => {
            const circuit = "anemoiHasher5_test"

            let roundConstantC: BigInt[][] = []
            let roundConstantD: BigInt[][] = []

            let prime_field = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");

            beforeEach(function() {
                const pi_0 = BigInt("1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679") % prime_field
                const pi_1 = BigInt("8214808651328230664709384460955058223172535940812848111745028410270193852110555964462294895493038196") % prime_field
            
                const inv_alpha = BigInt("8755297148735710088898562298102910035419345760166413737479281674630323398247")

                for (var r = 0; r < 12; r++){
                    roundConstantC[r] = []
                    roundConstantD[r] = []
                    var pi_0_r = modPow(pi_0, BigInt(r), prime_field)

                    for (var i = 0; i < 3; i++){
                        var pi_1_i = modPow(pi_1, BigInt(i), prime_field)

                        var pow_alpha = modPow(pi_0_r+pi_1_i, inv_alpha, prime_field)
                        var constC = ((BigInt(5)*modPow(pi_0_r, BigInt(2), prime_field)) + pow_alpha) % prime_field
                        var constD = ((BigInt(5)*modPow(pi_1_i, BigInt(2), prime_field)) + pow_alpha + inv_alpha) % prime_field
                    
                        roundConstantC[r].push(constC)
                        roundConstantD[r].push(constD)
                    }
                }
            })

            it('Correctly hashes 5 random values',async () => {
                const preImages: any = []
                
                for (let i= 0; i < 5; i++) {
                    preImages.push(genRandomSalt())
                }

                const circuitInputs = stringifyBigInts({
                    inputs: preImages,
                    roundConstantC: roundConstantC,
                    roundConstantD: roundConstantD,
                })

                const witness = await genWitness(circuit, circuitInputs)
                const output = await getSignalByName(circuit, witness, 'main.hash')

                const outputJS = anemoiHash5(preImages);

                expect(output.toString()).toEqual(outputJS.toString())
            })
        })

        describe('Anemoi Hasher4', () => {
            const circuit = 'anemoiHasher4_test'

            let roundConstantC: BigInt[][] = []
            let roundConstantD: BigInt[][] = []

            let prime_field = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");

            beforeEach(function() {
                const pi_0 = BigInt("1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679") % prime_field
                const pi_1 = BigInt("8214808651328230664709384460955058223172535940812848111745028410270193852110555964462294895493038196") % prime_field
            
                const inv_alpha = BigInt("8755297148735710088898562298102910035419345760166413737479281674630323398247")

                for (var r = 0; r < 14; r++){
                    roundConstantC[r] = []
                    roundConstantD[r] = []
                    var pi_0_r = modPow(pi_0, BigInt(r), prime_field)

                    for (var i = 0; i < 2; i++){
                        var pi_1_i = modPow(pi_1, BigInt(i), prime_field)

                        var pow_alpha = modPow(pi_0_r+pi_1_i, inv_alpha, prime_field)
                        var constC = ((BigInt(5)*modPow(pi_0_r, BigInt(2), prime_field)) + pow_alpha) % prime_field
                        var constD = ((BigInt(5)*modPow(pi_1_i, BigInt(2), prime_field)) + pow_alpha + inv_alpha) % prime_field
                    
                        roundConstantC[r].push(constC)
                        roundConstantD[r].push(constD)
                    }
                }
            })

            it('correctly hashes 4 random values', async () => {
                const preImages: any = []
                for (let i = 0; i < 4; i++) {
                    preImages.push(genRandomSalt())
                }

                const circuitInputs = stringifyBigInts({
                    inputs: preImages,
                    roundConstantC: roundConstantC,
                    roundConstantD: roundConstantD,
                })

                const witness = await genWitness(circuit, circuitInputs)
                const output = await getSignalByName(circuit, witness, 'main.hash')

                const outputJS = anemoiHash4(preImages)

                expect(output.toString()).toEqual(outputJS.toString())
            })
        })    

        describe('Anemoi Hasher3', () => {
            const circuit = 'anemoiHasher3_test'

            var roundConstantC: BigInt[][] = []
            var roundConstantD: BigInt[][] = []

            let prime_field = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");

            const pi_0 = BigInt("1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679") % prime_field
            const pi_1 = BigInt("8214808651328230664709384460955058223172535940812848111745028410270193852110555964462294895493038196") % prime_field
        
            const inv_alpha = BigInt("8755297148735710088898562298102910035419345760166413737479281674630323398247")

            for (var r = 0; r < 14; r++){
                roundConstantC[r] = []
                roundConstantD[r] = []
                var pi_0_r = modPow(pi_0, BigInt(r), prime_field)

                for (var i = 0; i < 2; i++){
                    var pi_1_i = modPow(pi_1, BigInt(i), prime_field)

                    var pow_alpha = modPow(pi_0_r+pi_1_i, inv_alpha, prime_field)
                    var constC = ((BigInt(5)*modPow(pi_0_r, BigInt(2), prime_field)) + pow_alpha) % prime_field
                    var constD = ((BigInt(5)*modPow(pi_1_i, BigInt(2), prime_field)) + pow_alpha + inv_alpha) % prime_field
                    
                    roundConstantC[r].push(constC)
                    roundConstantD[r].push(constD)
                }
            }

            it('correctly hashes 3 random values', async () => {
                const preImages: any = []
                for (let i = 0; i < 3; i++) {
                    preImages.push(genRandomSalt())
                }

                const circuitInputs = stringifyBigInts({
                    inputs: preImages,
                    roundConstantC: roundConstantC,
                    roundConstantD: roundConstantD,
                })
                console.log(roundConstantC)

                const witness = await genWitness(circuit, circuitInputs)
                const output = await getSignalByName(circuit, witness, 'main.hash')

                const outputJS = anemoiHash3(preImages)

                expect(output.toString()).toEqual(outputJS.toString())
            })
        })    

        describe('Anemoi Hasher13', () => {
            const circuit = 'anemoiHasher13_test'

            let roundConstantC: BigInt[][] = []
            let roundConstantD: BigInt[][] = []

            let prime_field = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");

            beforeEach(function() {
                const pi_0 = BigInt("1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679") % prime_field
                const pi_1 = BigInt("8214808651328230664709384460955058223172535940812848111745028410270193852110555964462294895493038196") % prime_field
            
                const inv_alpha = BigInt("8755297148735710088898562298102910035419345760166413737479281674630323398247")

                for (var r = 0; r < 12; r++){
                    roundConstantC[r] = []
                    roundConstantD[r] = []
                    var pi_0_r = modPow(pi_0, BigInt(r), prime_field)

                    for (var i = 0; i < 3; i++){
                        var pi_1_i = modPow(pi_1, BigInt(i), prime_field)

                        var pow_alpha = modPow(pi_0_r+pi_1_i, inv_alpha, prime_field)
                        var constC = ((BigInt(5)*modPow(pi_0_r, BigInt(2), prime_field)) + pow_alpha) % prime_field
                        var constD = ((BigInt(5)*modPow(pi_1_i, BigInt(2), prime_field)) + pow_alpha + inv_alpha) % prime_field
                        
                        roundConstantC[r].push(constC)
                        roundConstantD[r].push(constD)
                    }
                }
            })

            it('correctly hashes 13 random values', async () => {
                const preImages: any = []
                for (let i = 0; i < 13; i++) {
                    preImages.push(genRandomSalt())
                }

                const circuitInputs = stringifyBigInts({
                    inputs: preImages,
                    roundConstantC: roundConstantC,
                    roundConstantD: roundConstantD,
                })

                const witness = await genWitness(circuit, circuitInputs)
                const output = await getSignalByName(circuit, witness, 'main.hash')

                const outputJS = anemoiHash13(preImages)

                expect(output.toString()).toEqual(outputJS.toString())
            })
        })    

        describe('Hasher Left Right', () => {
            const circuit = "anemoiHasherLeftRight_test"

            let roundConstantC: BigInt[][] = []
            let roundConstantD: BigInt[][] = []

            let prime_field = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");

            beforeEach(function() {
                const pi_0 = BigInt("1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679") % prime_field
                const pi_1 = BigInt("8214808651328230664709384460955058223172535940812848111745028410270193852110555964462294895493038196") % prime_field
            
                const inv_alpha = BigInt("8755297148735710088898562298102910035419345760166413737479281674630323398247")

                for (var r = 0; r < 21; r++){
                    roundConstantC[r] = []
                    roundConstantD[r] = []
                    var pi_0_r = modPow(pi_0, BigInt(r), prime_field)

                    for (var i = 0; i < 1; i++){
                        var pi_1_i = modPow(pi_1, BigInt(i), prime_field)

                        var pow_alpha = modPow(pi_0_r+pi_1_i, inv_alpha, prime_field)
                        var constC = ((BigInt(5)*modPow(pi_0_r, BigInt(2), prime_field)) + pow_alpha) % prime_field
                        var constD = ((BigInt(5)*modPow(pi_1_i, BigInt(2), prime_field)) + pow_alpha + inv_alpha) % prime_field
                    
                        roundConstantC[r].push(constC)
                        roundConstantD[r].push(constD)
                    }
                }
            })

            it('Correctly hashes 2 random values',async () => {
                const left = genRandomSalt()
                const right = genRandomSalt()

                const circuitInputs = stringifyBigInts({
                    inputs: [left, right],
                    roundConstantC: roundConstantC,
                    roundConstantD: roundConstantD,
                })
                console.log(roundConstantC);

                const witness = await genWitness(circuit, circuitInputs)
                const output = await getSignalByName(circuit, witness, 'main.hash')

                const outputJS = anemoiHashLeftRight(left, right)

                expect(output.toString()).toEqual(outputJS.toString())
            })
        })

    }) 
    
    describe('MessageHasher', () => {
        const circuit = 'messageHasher_test'
        it('correctly hashes a message', async () => {
            const k = new Keypair()
            const random50bitBigInt = (): BigInt => {
                return (
                    (BigInt(1) << BigInt(50)) - BigInt(1)
                ) & BigInt(genRandomSalt().toString())
            }

            const command: PCommand = new PCommand(
                random50bitBigInt(),
                k.pubKey,
                random50bitBigInt(),
                random50bitBigInt(),
                random50bitBigInt(),
                random50bitBigInt(),
                genRandomSalt(),
            )

            const { privKey, pubKey } = new Keypair()
            const ecdhSharedKey = Keypair.genEcdhSharedKey(privKey, k.pubKey)
            const signature = command.sign(privKey)
            const message = command.encrypt(signature, ecdhSharedKey)
            const messageHash = message.hash(k.pubKey)
            const circuitInputs = stringifyBigInts({
                in: message.asCircuitInputs(),
                encPubKey: k.pubKey.asCircuitInputs(),
            })
            const witness = await genWitness(circuit, circuitInputs)
            const output = await getSignalByName(circuit, witness, 'main.hash')
            expect(output.toString()).toEqual(messageHash.toString())
        })
    })
})
