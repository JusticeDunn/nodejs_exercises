import { randomBytes } from 'crypto'

function delay (milliseconds) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(new Date())
        }, milliseconds)
    })
}

console.log(`Delaying...${new Date().getSeconds()}s`)
delay(1000)
    .then(newDate => {
        console.log(`Done ${newDate.getSeconds()}s`)
    })

function promisify (callbackBasedApi) {
    return function promisified (...args) {
        return new Promise((resolve, reject) => {
        const newArgs = [
            ...args,
            function (err, result) {
            if (err) {
                return reject(err)
            }
            resolve(result)
            }
        ]
        callbackBasedApi(...newArgs)
        })
    }
}

const randomBytesP = promisify(randomBytes)
randomBytesP(32)
    .then(buffer => {
        console.log(`Random bytes: ${buffer.toString()}`)
    })

async function playingWithDelays() {
    console.log('Delaying..', new Date())
    const dateAfterOneSecond = await delay(1000)
    console.log(dateAfterOneSecond)
    const dateAfterThreeSeconds = await delay(3000)
    console.log(dateAfterThreeSeconds)
    return 'done'
}

playingWithDelays()
    .then(result => {
        console.log(`After 4 seconds: ${result}`)
    })