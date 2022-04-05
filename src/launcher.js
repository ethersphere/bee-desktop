const fetch = require('node-fetch')
const { existsSync, readFileSync, writeFileSync, mkdirSync } = require('fs')
const { exit } = require('process')
const { spawn } = require('child_process')
const { BeeManager } = require('./lifecycle')
const { resolvePath } = require('./path')

async function createConfigFileAndAddress() {
    writeFileSync(resolvePath('config.yaml'), createStubConfiguration())
    await initializeBee()
}

async function createInitialTransaction() {
    const config = readFileSync(resolvePath('config.yaml'), 'utf-8')
    if (!config.includes('block-hash')) {
        const { address } = JSON.parse(readFileSync(resolvePath('data-dir/keys/swarm.key')))
        console.log('Sending transaction to address', address)
        const { transaction, blockHash } = await sendTransaction(address)
        writeFileSync(resolvePath('config.yaml'), createConfiguration(transaction, blockHash))
    }
}

async function main() {
    const { rebuildElectronTray } = require('./electron')
    const abortController = new AbortController()
    if (!existsSync(resolvePath('bee'))) {
        console.error(`Please compile bee and place it as follows: ${resolvePath('bee')}`)
        exit(1)
    }
    if (!existsSync(resolvePath('data-dir'))) {
        mkdirSync(resolvePath('data-dir'))
    }
    if (!existsSync(resolvePath('config.yaml'))) {
        writeFileSync(resolvePath('config.yaml'), createStubConfiguration())
    }
    if (!existsSync(resolvePath('data-dir/keys/swarm.key'))) {
        await launchBee().catch(() => {})
    }
    const config = readFileSync(resolvePath('config.yaml'), 'utf-8')
    if (!config.includes('block-hash')) {
        const { address } = JSON.parse(readFileSync(resolvePath('data-dir/keys/swarm.key')))
        console.log('Sending transaction to address', address)
        const { transaction, blockHash } = await sendTransaction(address)
        writeFileSync(resolvePath('config.yaml'), createConfiguration(transaction, blockHash))
    }
    const subprocess = launchBee(abortController).catch(reason => {
        console.error(reason)
    })
    BeeManager.signalRunning(abortController, subprocess)
    rebuildElectronTray()
    await subprocess
    console.log('Bee subprocess finished running')
    abortController.abort()
    BeeManager.signalStopped()
    rebuildElectronTray()
}

async function sendTransaction(address) {
    const response = await fetch(`http://getxdai.co/${address}/0`, { method: 'POST' })
    const json = await response.json()
    return { transaction: json.transactionHash, blockHash: json.nextBlockHashBee }
}

function createStubConfiguration() {
    return `api-addr: 127.0.0.1:1633
debug-api-addr: 127.0.0.1:1635
debug-api-enable: true
password: Test
swap-enable: false
swap-initial-deposit: 0
mainnet: true
full-node: false
chain-enable: false
cors-allowed-origins: '*'
use-postage-snapshot: true
data-dir: ${resolvePath('data-dir')}`
}

function createConfiguration(transaction, blockHash) {
    return `${createStubConfiguration()}
transaction: ${transaction}
block-hash: ${blockHash}`
}

async function initializeBee() {
    const configPath = resolvePath('config.yaml')
    return runProcess(resolvePath('bee'), ['init', `--config=${configPath}`], onStdout, onStderr, new AbortController())
}

async function launchBee(abortController) {
    if (!abortController) {
        abortController = new AbortController()
    }
    const configPath = resolvePath('config.yaml')
    return runProcess(resolvePath('bee'), ['start', `--config=${configPath}`], onStdout, onStderr, abortController)
}

function onStdout(data) {
    process.stdout.write(data)
}

function onStderr(data) {
    process.stderr.write(data)
}

async function runProcess(command, args, onStdout, onStderr, abortController) {
    console.log(`Spawning subprocess ${command}...`)
    return new Promise((resolve, reject) => {
        const subprocess = spawn(command, args, { signal: abortController.signal, killSignal: 'SIGINT' })
        subprocess.stdout.on('data', onStdout)
        subprocess.stderr.on('data', onStderr)
        subprocess.on('close', code => {
            if (code === 0) {
                resolve(code)
            } else {
                reject(code)
            }
        })
        subprocess.on('error', error => {
            reject(error)
        })
    })
}

module.exports = {
    createConfigFileAndAddress,
    createInitialTransaction,
    runLauncher: main
}
