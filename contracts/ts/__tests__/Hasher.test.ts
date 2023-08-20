require('module-alias/register')
import {
    sha256Hash,
    hashLeftRight,
    hash3,
    hash4,
    hash5,    
    anemoiHash3,
    anemoiHash4,
    anemoiHash5,
    anemoiHashLeftRight,
    genRandomSalt,
} from 'maci-crypto'


import { deployPoseidonContracts, linkPoseidonLibraries, deployAnemoiContracts, linkHashingLibraries, linkAnemoiLibraries } from '../'

let hasherContract
let anemoiHasherContract

describe('Hasher', () => {
    beforeAll(async () => {
        const { PoseidonT3Contract, PoseidonT4Contract, PoseidonT5Contract, PoseidonT6Contract } = await deployPoseidonContracts()
        const hasherContractFactory = await linkPoseidonLibraries(
			'Hasher',
			PoseidonT3Contract.address,
			PoseidonT4Contract.address,
			PoseidonT5Contract.address,
			PoseidonT6Contract.address,
        )

        // const hasherContractFactory = await linkHashingLibraries(
        //     'Hasher',
        //     PoseidonT3Contract.address,
        //     PoseidonT4Contract.address,
        //     PoseidonT5Contract.address,
        //     PoseidonT6Contract.address,
        //     AnemoiT2Contract.address,
        //     AnemoiT4Contract.address,
        //     AnemoiT6Contract.address
        // )

        hasherContract = await hasherContractFactory.deploy()
		await hasherContract.deployTransaction.wait()

        const { AnemoiT2Contract, AnemoiT4Contract, AnemoiT6Contract } = await deployAnemoiContracts()
        const anemoiHasherContractFactory = await linkAnemoiLibraries (
            'AnemoiHasher',
            AnemoiT2Contract.address,
            AnemoiT4Contract.address,
            AnemoiT6Contract.address
        )
        anemoiHasherContract = await anemoiHasherContractFactory.deploy()
        await anemoiHasherContract.deployTransaction.wait()
    })

    it('maci-crypto.sha256Hash should match hasher.sha256Hash', async () => {
        expect.assertions(5)
        const values: string[] = []
        for (let i = 0; i < 5; i++) {
            values.push(genRandomSalt().toString())
            const hashed = sha256Hash(values.map(BigInt))

            const onChainHash = await hasherContract.sha256Hash(values)
            expect(onChainHash.toString()).toEqual(hashed.toString())
        }
    })

    it('maci-crypto.hashLeftRight should match hasher.hashLeftRight', async () => {
        const left = genRandomSalt()
        const right = genRandomSalt()
        const hashed = hashLeftRight(left, right)

        const onChainHash = await hasherContract.hashLeftRight(left.toString(), right.toString())
        expect(onChainHash.toString()).toEqual(hashed.toString())
    })

    it('maci-crypto.hash3 should match hasher.hash3', async () => {
        const values: string[] = []
        for (let i = 0; i < 3; i++) {
            values.push(genRandomSalt().toString())
        }
        const hashed = hash3(values.map(BigInt))

        const onChainHash = await hasherContract.hash3(values)
        expect(onChainHash.toString()).toEqual(hashed.toString())
    })

    it('maci-crypto.hash4 should match hasher.hash4', async () => {
        const values: string[] = []
        for (let i = 0; i < 4; i++) {
            values.push(genRandomSalt().toString())
        }
        const hashed = hash4(values.map(BigInt))

        const onChainHash = await hasherContract.hash4(values)
        expect(onChainHash.toString()).toEqual(hashed.toString())
    })

    it('maci-crypto.hash5 should match hasher.hash5', async () => {
        const values: string[] = []
        for (let i = 0; i < 5; i++) {
            values.push(genRandomSalt().toString())
        }
        const hashed = hash5(values.map(BigInt))

        const onChainHash = await hasherContract.hash5(values)
        expect(onChainHash.toString()).toEqual(hashed.toString())
    })

    it('maci-crypto.anemoiHashLeftRight should match AnemoiHasher.hashLeftRight', async () => {
        const left = genRandomSalt()
        const right = genRandomSalt()
        const hashed = anemoiHashLeftRight(left, right)

        const onChainHash = await anemoiHasherContract.anemoiHashLeftRight(left.toString(), right.toString())
        expect(onChainHash.toString()).toEqual(hashed.toString())
    })

    it('maci-crypto.anemoiHash3 should match AnemoiHasher.hash3', async () => {
        const values: string[] = []
        for (let i = 0; i < 3; i++) {
            values.push(genRandomSalt().toString())
        }
        const hashed = anemoiHash3(values.map(BigInt))

        const onChainHash = await anemoiHasherContract.anemoiHash3(values)
        expect(onChainHash.toString()).toEqual(hashed.toString())
    })

    it('maci-crypto.anemoiHash4 should match AnemoiHasher.hash4', async () => {
        const values: string[] = []
        for (let i = 0; i < 4; i++) {
            values.push(genRandomSalt().toString())
        }
        const hashed = anemoiHash4(values.map(BigInt))

        const onChainHash = await anemoiHasherContract.anemoiHash4(values)
        expect(onChainHash.toString()).toEqual(hashed.toString())
    })

    it('maci-crypto.anemoiHash5 should match AnemoiHasher.hash5', async () => {
        const values: string[] = []
        for (let i = 0; i < 5; i++) {
            values.push(genRandomSalt().toString())
        }
        const hashed = anemoiHash5(values.map(BigInt))

        const onChainHash = await anemoiHasherContract.anemoiHash5(values)
        expect(onChainHash.toString()).toEqual(hashed.toString())
    })


})
