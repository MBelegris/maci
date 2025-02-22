import * as ethers from 'ethers'
import * as fs from 'fs'
import * as path from 'path'

import { hashLeftRight } from 'maci-crypto'
import {
    formatProofForVerifierContract,
    getDefaultSigner,
    parseArtifact,
} from 'maci-contracts'

import {
    validateEthAddress,
    contractExists,
    delay,
} from './utils'

import {readJSONFile} from 'maci-common'
import {contractFilepath} from './config'

const configureSubparser = (subparsers: any) => {
    const parser = subparsers.addParser(
        'proveOnChain',
        { addHelp: true },
    )

    parser.addArgument(
        ['-x', '--contract'],
        {
            type: 'string',
            help: 'The MACI contract address',
        }
    )

    parser.addArgument(
        ['-o', '--poll-id'],
        {
            action: 'store',
            required: true,
            type: 'string',
            help: 'The Poll ID',
        }
    )

    parser.addArgument(
        ['-q', '--ppt'],
        {
            type: 'string',
            help: 'The PollProcessorAndTallyer contract address',
        }
    )

    parser.addArgument(
        ['-f', '--proof-dir'],
        {
            required: true,
            type: 'string',
            help: 'The proof output directory from the genProofs subcommand',
        }
    )
}

const proveOnChain = async (args: any) => {

    try {
        const signer = await getDefaultSigner()
        const pollId = Number(args.poll_id)
    
        // check existence of MACI and ppt contract addresses
        let contractAddrs = readJSONFile(contractFilepath)
        if ((!contractAddrs||!contractAddrs["MACI"]) && !args.contract) {
            console.error('Error: MACI contract address is empty') 
            return 1
        }
        if ((!contractAddrs||!contractAddrs["PollProcessorAndTally-"+pollId]) && !args.ppt) {
            console.error('Error: PollProcessorAndTally contract address is empty') 
            return 1
        }
    
        const maciAddress = args.contract ? args.contract: contractAddrs["MACI"]
        const pptAddress = args.ppt ? args.ppt: contractAddrs["PollProcessorAndTally-"+pollId]
    
        // MACI contract
        if (!validateEthAddress(maciAddress)) {
            console.error('Error: invalid MACI contract address')
            return {}
        }
    
        // PollProcessorAndTallyer contract
        if (!validateEthAddress(pptAddress)) {
            console.error('Error: invalid PollProcessorAndTallyer contract address')
            return {}
        }
    
        if (! (await contractExists(signer.provider, pptAddress))) {
            console.error('Error: there is no contract deployed at the specified address')
            return {}
        }
    
        const [ maciContractAbi ] = parseArtifact('MACI')
        const [ pollContractAbi ] = parseArtifact('Poll')
        const [ pptContractAbi ] = parseArtifact('PollProcessorAndTallyer')
        const [ messageAqContractAbi ] = parseArtifact('AccQueue')
        const [ vkRegistryContractAbi ] = parseArtifact('VkRegistry')
        const [ verifierContractAbi ] = parseArtifact('Verifier')
    
        const maciContract = new ethers.Contract(
            maciAddress,
            maciContractAbi,
            signer,
        )
    
        const pollAddr = await maciContract.polls(pollId)
        if (! (await contractExists(signer.provider, pollAddr))) {
            console.error('Error: there is no Poll contract with this poll ID linked to the specified MACI contract.')
            return 1
        }
    
        const pollContract = new ethers.Contract(
            pollAddr,
            pollContractAbi,
            signer,
        )
    
        const pptContract = new ethers.Contract(
            pptAddress,
            pptContractAbi,
            signer,
        )
    
        const messageAqContract = new ethers.Contract(
            (await pollContract.extContracts()).messageAq,
            messageAqContractAbi,
            signer,
        )
    
        const vkRegistryContract = new ethers.Contract(
            (await pollContract.extContracts()).vkRegistry,
            vkRegistryContractAbi,
            signer,
        )
    
        const verifierContractAddress = await pptContract.verifier()
        const verifierContract = new ethers.Contract(
            verifierContractAddress,
            verifierContractAbi,
            signer,
        )
    
        let data = {
            processProofs: {},
            tallyProofs: {},
            subsidyProofs: {},
        }
    
        let numProcessProofs = 0
    
        if (typeof args.proof_file === 'object' && args.proof_file !== null) {
            // Argument is a javascript object
            data = args.proof_file
        } else {
            // Read the proof directory
            const filenames = fs.readdirSync(args.proof_dir)
            for (let i = 0; i < filenames.length; i ++) {
                const filename = filenames[i]
                const filepath = path.join(args.proof_dir, filename)
                let match = filename.match(/process_(\d+)/)
                // console.log("Process Messages filename:", match);
                if (match != null) {
                    data.processProofs[Number(match[1])] = JSON.parse(fs.readFileSync(filepath).toString())
                    numProcessProofs ++
                    continue
                }
    
                match = filename.match(/tally_(\d+)/)
                // console.log("Tally filename:", match);

                if (match != null) {
                    data.tallyProofs[Number(match[1])] = JSON.parse(fs.readFileSync(filepath).toString())
                    continue
                }
                match = filename.match(/subsidy_(\d+)/)
                if (match != null) {
                    data.subsidyProofs[Number(match[1])] = JSON.parse(fs.readFileSync(filepath).toString())
                    continue
                }
            }
        }
    
        const numSignUpsAndMessages = await pollContract.numSignUpsAndMessages()
        const numSignUps = Number(numSignUpsAndMessages[0])
        const numMessages = Number(numSignUpsAndMessages[1])
        const batchSizes = await pollContract.batchSizes()
        const messageBatchSize = Number(batchSizes.messageBatchSize)
        const tallyBatchSize = Number(batchSizes.tallyBatchSize)
        const subsidyBatchSize = Number(batchSizes.subsidyBatchSize)
        let totalMessageBatches = numMessages <= messageBatchSize ?
            1
            : 
            Math.floor(numMessages / messageBatchSize)
    
        if (numMessages > messageBatchSize && numMessages % messageBatchSize > 0) {
            totalMessageBatches ++
        }
    
        if (numProcessProofs !== totalMessageBatches) {
            console.error(
                `Error: ${args.proof_file} does not have the correct ` +
                `number of message processing proofs ` +
                `(expected ${totalMessageBatches}, got ${numProcessProofs}.`,
            )
        }
    
        const treeDepths = await pollContract.treeDepths()
    
        let numBatchesProcessed = Number(await pptContract.numBatchesProcessed())
        const messageRootOnChain = await messageAqContract.getMainRoot(
            Number(treeDepths.messageTreeDepth),
        )
    
        const stateTreeDepth = Number(await maciContract.stateTreeDepth())
        const onChainProcessVk = await vkRegistryContract.getProcessVk(
            stateTreeDepth,
            treeDepths.messageTreeDepth,
            treeDepths.voteOptionTreeDepth,
            messageBatchSize,
        )
    
    
        const dd = await pollContract.getDeployTimeAndDuration()
        const pollEndTimestampOnChain = BigInt(dd[0]) + BigInt(dd[1])
    
        if (numBatchesProcessed < totalMessageBatches) {
            console.log('Submitting proofs of message processing...')
        }
    
        for (let i = numBatchesProcessed; i < totalMessageBatches; i ++) {
            //const currentMessageBatchIndex = Number(await pptContract.currentMessageBatchIndex())
            let currentMessageBatchIndex
            if (numBatchesProcessed === 0) {
                const r = numMessages % messageBatchSize
                if (r === 0) {
                    currentMessageBatchIndex = Math.floor(numMessages / messageBatchSize) * messageBatchSize
                } else {
                    currentMessageBatchIndex = numMessages
                }
    
                if (currentMessageBatchIndex > 0) {
                    if (r === 0) {
                        currentMessageBatchIndex -= messageBatchSize
                    } else {
                        currentMessageBatchIndex -= r
                    }
                }
            } else {
                currentMessageBatchIndex = (totalMessageBatches - numBatchesProcessed) * messageBatchSize
            }
    
            if (numBatchesProcessed > 0 && currentMessageBatchIndex > 0) {
                currentMessageBatchIndex -= messageBatchSize
            }
    
            const txErr = 'Error: processMessages() failed'
            const { proof, circuitInputs, publicInputs } = data.processProofs[i]
            // console.log("Circuit inputs:",circuitInputs);
    
            // Perform checks
            if (circuitInputs.pollEndTimestamp !== pollEndTimestampOnChain.toString()) {
                console.error('Error: pollEndTimestamp mismatch.')
                return 1
            }
    
            if (BigInt(circuitInputs.msgRoot).toString() !== messageRootOnChain.toString()) {
                console.error('Error: message root mismatch.')
                return 1
            }
    
            let currentSbCommitmentOnChain
    
            if (numBatchesProcessed === 0) {
                // console.log("Num batches processed = 0")
                currentSbCommitmentOnChain = BigInt(await pollContract.currentSbCommitment())
            } else {
                // console.log("Num batches processed not 0");
                currentSbCommitmentOnChain = BigInt(await pptContract.sbCommitment())
            }
            // console.log("Poll contract merged state root:", (await pollContract.mergedStateRoot()).toString());
            // console.log("Circuit merged state root:", circuitInputs.mergedStateRoot);
            if (currentSbCommitmentOnChain.toString() !== circuitInputs.currentSbCommitment) {        
                console.error('Error: currentSbCommitment mismatch.')
                return 1
            }
    
            const coordPubKeyHashOnChain = BigInt(await pollContract.coordinatorPubKeyHash())
            if (
                hashLeftRight(
                    BigInt(circuitInputs.coordPubKey[0]),
                    BigInt(circuitInputs.coordPubKey[1]),
                ).toString() !== coordPubKeyHashOnChain.toString()
            ) {
                console.error('Error: coordPubKey mismatch.')
                return 1
            }
    
            const packedValsOnChain = BigInt(await pptContract.genProcessMessagesPackedVals(
                pollContract.address,
                currentMessageBatchIndex,
                numSignUps,
            )).toString()
    
            if (circuitInputs.packedVals !== packedValsOnChain) {
                console.error('Error: packedVals mismatch.')
                return 1
            }
    
            const formattedProof = formatProofForVerifierContract(proof)
    
            const publicInputHashOnChain = BigInt(await pptContract.genProcessMessagesPublicInputHash(
                pollContract.address,
                currentMessageBatchIndex,
                messageRootOnChain.toString(),
                numSignUps,
                circuitInputs.currentSbCommitment,
                circuitInputs.newSbCommitment,
            ))
    
            if (publicInputHashOnChain.toString() !== publicInputs[0].toString()) {
                console.error('Public input mismatch.')
                return 1
            }
    
            const isValidOnChain = await verifierContract.verify(
                formattedProof,
                onChainProcessVk,
                publicInputHashOnChain.toString(),
            )
    
            if (!isValidOnChain) {
                console.error('Error: the verifier contract found the proof invalid.')
                return 1
            }
    
            let tx
            try {
                tx = await pptContract.processMessages(
                    pollContract.address,
                    '0x' + BigInt(circuitInputs.newSbCommitment).toString(16),
                    formattedProof,
                )
            } catch (e) {
                console.error(txErr)
                console.error(e)
            }
    
            const receipt = await tx.wait()
    
            if (receipt.status !== 1) {
                console.error(txErr)
                return 1
            }
    
            console.log(`Transaction hash: ${tx.hash}`)
    
            // Wait for the node to catch up
            numBatchesProcessed = Number(await pptContract.numBatchesProcessed())
            let backOff = 1000
            let numAttempts = 0
            while (numBatchesProcessed !== i + 1) {
                await delay(backOff)
                backOff *= 1.2
                numAttempts ++
                if (numAttempts >= 100) {
                    break
                }
            }
            console.log(`Progress: ${numBatchesProcessed} / ${totalMessageBatches}`)
        }
    
        if (numBatchesProcessed === totalMessageBatches) {
            console.log('All message processing proofs have been submitted.')
        }
    
        // ------------------------------------------------------------------------
        // subsidy calculation proofs
        if (Object.keys(data.subsidyProofs).length !== 0) {
            let rbi = Number(await pptContract.rbi())
            let cbi = Number(await pptContract.cbi())
            let numLeaves = numSignUps + 1
            let num1DBatches = Math.ceil(numLeaves/subsidyBatchSize)
            let subsidyBatchNum = rbi * num1DBatches + cbi
            let totalBatchNum = num1DBatches * (num1DBatches + 1)/2
            console.log(`number of subsidy batch processed: ${subsidyBatchNum}, numleaf=${numLeaves}`)
    
            for (let i = subsidyBatchNum; i < totalBatchNum; i++) {
                const { proof, circuitInputs, publicInputs } = data.subsidyProofs[i]
        
                const subsidyCommitmentOnChain = await pptContract.subsidyCommitment()
                if (subsidyCommitmentOnChain.toString() !== circuitInputs.currentSubsidyCommitment) {
                    console.error(`Error: subsidycommitment mismatch`)
                    return 1
                }
                const packedValsOnChain = BigInt(
                    await pptContract.genSubsidyPackedVals(numSignUps)
                )
                if (circuitInputs.packedVals !== packedValsOnChain.toString()) {
                    console.error('Error: subsidy packedVals mismatch.')
                    return 1
                }
                const currentSbCommitmentOnChain = await pptContract.sbCommitment()
                if (currentSbCommitmentOnChain.toString() !== circuitInputs.sbCommitment) {
                    console.error('Error: currentSbCommitment mismatch.')
                    return 1
                }
                const publicInputHashOnChain = await pptContract.genSubsidyPublicInputHash(
                    numSignUps,
                    circuitInputs.newSubsidyCommitment,
                )
                
                if (publicInputHashOnChain.toString() !== publicInputs[0]) {
                    console.error('Error: public input mismatch.')
                    return 1
                }
        
                const txErr = 'Error: updateSubsidy() failed...'
                const formattedProof = formatProofForVerifierContract(proof)
                let tx
                try {
                    tx = await pptContract.updateSubsidy(
                        pollContract.address,
                        circuitInputs.newSubsidyCommitment,
                        formattedProof,
                    )
                } catch (e) {
                    console.error(txErr)
                    console.error(e)
                }
        
                const receipt = await tx.wait()
        
                if (receipt.status !== 1) {
                    console.error(txErr)
                    return 1
                }
        
                console.log(`Progress: ${subsidyBatchNum + 1} / ${totalBatchNum}`)
                console.log(`Transaction hash: ${tx.hash}`)
        
                // Wait for the node to catch up
                let nrbi = Number(await pptContract.rbi())
                let ncbi = Number(await pptContract.cbi())
                let backOff = 1000
                let numAttempts = 0
                while (nrbi === rbi && ncbi === cbi) {
                    await delay(backOff)
                    backOff *= 1.2
                    numAttempts ++
                    if (numAttempts >= 100) {
                        break
                    }
                }
        
                rbi = nrbi
                cbi = ncbi
                subsidyBatchNum = rbi * num1DBatches + cbi
            }
        
            if (subsidyBatchNum === totalBatchNum) {
                console.log('All subsidy calculation proofs have been submitted.')
                console.log()
                console.log('OK')
            }
        }
    
        // ------------------------------------------------------------------------
        // Vote tallying proofs
        const totalTallyBatches = numSignUps < tallyBatchSize ?
            1
            :
            Math.floor(numSignUps / tallyBatchSize) + 1
    
        let tallyBatchNum = Number(await pptContract.tallyBatchNum())
    
        console.log()
        if (tallyBatchNum < totalTallyBatches) {
            console.log('Submitting proofs of vote tallying...')
        }
    
        for (let i = tallyBatchNum; i < totalTallyBatches; i ++) {
    
            const batchStartIndex = i * tallyBatchSize
    
            const txErr = 'Error: tallyVotes() failed'
            const { proof, circuitInputs, publicInputs } = data.tallyProofs[i]
    
            const currentTallyCommitmentOnChain = await pptContract.tallyCommitment()
            if (currentTallyCommitmentOnChain.toString() !== circuitInputs.currentTallyCommitment) {
                console.error('Error: currentTallyCommitment mismatch.')
                return 1
            }
    
            const packedValsOnChain = BigInt(
                await pptContract.genTallyVotesPackedVals(
                    numSignUps,
                    batchStartIndex,
                    tallyBatchSize,
                )
            )
            if (circuitInputs.packedVals !== packedValsOnChain.toString()) {
                console.error('Error: packedVals mismatch.')
                return 1
            }
    
            const currentSbCommitmentOnChain = await pptContract.sbCommitment()
            if (currentSbCommitmentOnChain.toString() !== circuitInputs.sbCommitment) {
                console.error('Error: currentSbCommitment mismatch.')
                return 1
            }
    
            const publicInputHashOnChain = await pptContract.genTallyVotesPublicInputHash(
                numSignUps,
                batchStartIndex,
                tallyBatchSize,
                circuitInputs.newTallyCommitment,
            )
            if (publicInputHashOnChain.toString() !== publicInputs[0]) {
                console.error('Error: public input mismatch.')
                return 1
            }
    
            const formattedProof = formatProofForVerifierContract(proof)
            let tx
            try {
                tx = await pptContract.tallyVotes(
                    pollContract.address,
                    '0x' + BigInt(circuitInputs.newTallyCommitment).toString(16),
                    formattedProof,
                )
            } catch (e) {
                console.error(txErr)
                console.error(e)
            }
    
            const receipt = await tx.wait()
    
            if (receipt.status !== 1) {
                console.error(txErr)
                return 1
            }
    
            console.log(`Progress: ${tallyBatchNum + 1} / ${totalTallyBatches}`)
            console.log(`Transaction hash: ${tx.hash}`)
    
            // Wait for the node to catch up
            tallyBatchNum = Number(await pptContract.tallyBatchNum())
            let backOff = 1000
            let numAttempts = 0
            while (tallyBatchNum !== i + 1) {
                await delay(backOff)
                backOff *= 1.2
                numAttempts ++
                if (numAttempts >= 100) {
                    break
                }
            }
        }
    
        if (tallyBatchNum === totalTallyBatches) {
            console.log('All vote tallying proofs have been submitted.')
            console.log()
            console.log('OK')
        }
    } catch (e) {
        console.log(e.message);
        throw e;
    }

    return 0
}

export {
    proveOnChain,
    configureSubparser,
}
