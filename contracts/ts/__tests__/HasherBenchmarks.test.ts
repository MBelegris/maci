require('module-alias/register')
import {
    genRandomSalt,
} from 'maci-crypto'

import { deployPoseidonContracts } from '../deploy'
import { linkPoseidonLibraries, deployAnemoiContracts, linkHashingLibraries } from '../'

let hasherContract

describe('Hasher', () => {
    beforeAll(async () => {
        const { PoseidonT3Contract, PoseidonT4Contract, PoseidonT5Contract, PoseidonT6Contract } = await deployPoseidonContracts()
        const { AnemoiT2Contract, AnemoiT4Contract, AnemoiT6Contract } = await deployAnemoiContracts()
        // Link Poseidon contracts
        // const hasherContractFactory = await linkPoseidonLibraries(
        //     'HasherBenchmarks',
        //     PoseidonT3Contract.address,
        //     PoseidonT4Contract.address,
        //     PoseidonT5Contract.address,
        //     PoseidonT6Contract.address,
        // )

        const hasherContractFactory = await linkHashingLibraries(
            'HasherBenchmarks',
            PoseidonT3Contract.address,
            PoseidonT4Contract.address,
            PoseidonT5Contract.address,
            PoseidonT6Contract.address,
            AnemoiT2Contract.address,
            AnemoiT4Contract.address,
            AnemoiT6Contract.address
        )

        console.log('Deploying Hasher')
        hasherContract = await hasherContractFactory.deploy()
    	await hasherContract.deployTransaction.wait()
    })

    it('hashLeftRight', async () => {
        const left = genRandomSalt()
        const right = genRandomSalt()

        const tx = await hasherContract.hashLeftRightBenchmark(left.toString(), right.toString())
        const receipt = await tx.wait()
        console.log('hashLeftRight:', receipt.gasUsed.toString())
    })

    it('hash5', async () => {
        const values: string[] = []
        for (let i = 0; i < 5; i++) {
            values.push(genRandomSalt().toString())
        }

        const tx = await hasherContract.hash5Benchmark(values)
        const receipt = await tx.wait()
        console.log('hash5:', receipt.gasUsed.toString())
    })

    it('anemoiHashLeftRight', async () => {
        const left = genRandomSalt()
        const right = genRandomSalt()

        const tx = await hasherContract.anemoiHashLeftRightBenchmark(left.toString(), right.toString())
        const receipt = await tx.wait()
        console.log('hashLeftRight:', receipt.gasUsed.toString())
    })

    it('anemoiHash5', async () => {
        const values: string[] = []
        for (let i = 0; i < 5; i++) {
            values.push(genRandomSalt().toString())
        }

        const tx = await hasherContract.anemoiHash5Benchmark(values)
        const receipt = await tx.wait()
        console.log('hash5:', receipt.gasUsed.toString())
    })

    //it('hash11', async () => {
        //const values: string[] = []
        //for (let i = 0; i < 11; i++) {
            //values.push(genRandomSalt().toString())
        //}

        //const tx = await hasherContract.hash11Benchmark(values)
        //const receipt = await tx.wait()
        //console.log('hash11:', receipt.gasUsed.toString())
    //})
})

