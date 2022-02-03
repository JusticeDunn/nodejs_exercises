import { EventEmitter } from 'events'
import { readFile } from 'fs'
class FindRegex extends EventEmitter {
    constructor (regex) {
        super()
        this.regex = regex
        this.files = []
    }

    addFile (file) {
        this.files.push(file)
        return this
    }

    find () {
        // Added this line for exercise 3.1
        process.nextTick(() => this.emit('finding', this.files), 0);

        for (const file of this.files) {
            readFile(file, 'utf8', (err, content) => {
                if (err) {
                    return this.emit('error', err)
                }
                this.emit('fileread', file)
                const match = content.match(this.regex)
                if (match) {
                    match.forEach(elem => this.emit('found', file, elem))
                }
            })
        }
        return this
    }
}

const findRegexInstance = new FindRegex(/hello \w+/)
findRegexInstance
    .addFile('fileA.txt')
    .find()
    // this listener is invoked
    .on('found', (file, match) => console.log(`Matched "${match}"`))
    .on('finding', (returned) => console.log(`Woah: ${returned}`))
    .on('error', err => console.error(`Error emitted ${err.message}`))

// created function for exercise 3.2
let tick = (number, callback) => {
    let ticker = new EventEmitter()
    // added this line for exercise 3.3
    process.nextTick(() => ticker.emit('start'), 0)
    let count = 0

    while (count < number) {
        setTimeout(() => ticker.emit('tick'), 50)
        count += 1
    }
    callback(count)

    return ticker
}

// created function with inentional errors for exercise 3.4
let brokenTick = (number, callback) => {
    let ticker = new EventEmitter()
    // added this line for exercise 3.3
    process.nextTick(() => ticker.emit('start'), 0)
    let count = 0

    while (count < number) {
        setTimeout(() => ticker.emit('tick'), 50)
        count += 1
        if (count % 5 == 0) {
            process.nextTick(() => ticker.emit('error'))
        }
    }
    callback(count)

    return ticker
}

// tick(10, (val) => console.lrs

brokenTick(10, (val) => console.log(val))
    .on('start', () => console.log('start'))
    .on('tick', () => console.log('tick!'))
    .on('error', () => console.error())