// Exercise 5.1
async function promiseAll (iterable) {
    let results = []
    for (const promise of iterable) {
        results.push(await promise)
    }
    console.log(`Promises: ${results}`)
}

const promise1 = Promise.resolve(3);
const promise2 = 42;
const promise3 = new Promise((resolve, reject) => {
  setTimeout(resolve, 100, 'foo');
});

promiseAll([promise1, promise2, promise3])

// Exercise 5.2
class TaskQueue {
    constructor (concurrency) {
        this.concurrency = concurrency
        this.running = 0
        this.queue = []
    }
  
    runTask (task) {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    return resolve(await task())
                } catch (err) {
                    return reject(err)
                }
            })
            process.nextTick(this.next.bind(this))
        })
    }
  
    async next () {
        while (this.running < this.concurrency && this.queue.length) {
            const task = this.queue.shift()
            await task()
            this.running--
            this.next()
            this.running++
        }
    }
}
// Test came from https://github.com/levanchien/Node.js-Design-Patterns-Exercise/blob/master/chap-05/5.2/test.mjs

const delay = (time) =>
new Promise((resolve, reject) => setTimeout(() => resolve(time), time));

const queue = new TaskQueue(2);

for (let i = 1; i <= 10; i += 1) {
    queue
        .runTask(() => {
            return delay(2 * 1000);
        })
        .then((t) => console.log(t));
}

// Exercise 5.3
class TaskQueuePC {
    constructor (concurrency) {
        this.taskQueue = []
        this.consumerQueue = []
    
        // spawn consumers
        for (let i = 0; i < concurrency; i++) {
            this.consumer()
        }
    }
  
    consumer () {
        return new Promise((resolve, reject) => {
            try {
                const task = this.getNextTask()
                resolve(task)
            } catch(err) {
                reject(err)
            }
        })
            .then(task => task())
            .then(() => consumer())
    }
  
    getNextTask () {
        return new Promise((resolve) => {
            if (this.taskQueue.length !== 0) {
                return resolve(this.taskQueue.shift())
            }
    
            this.consumerQueue.push(resolve)
        })
    }
  
    runTask (task) {
        return new Promise((resolve, reject) => {
            const taskWrapper = () => {
                const taskPromise = task()
                taskPromise.then(resolve, reject)
                return taskPromise
            }
    
            if (this.consumerQueue.length !== 0) {
                // there is a sleeping consumer available, use it to run our task
                const consumer = this.consumerQueue.shift()
                consumer(taskWrapper)
            } else {
                // all consumers are busy, enqueue the task
                this.taskQueue.push(taskWrapper)
            }
        })
    }
}

// Exercise 5.4
async function mapAsync(iterable, callback, concurrency) {
    let id = 0
    let running = 0
    let resolved = 0
    const results = []
    
    return new Promise((resolve, reject) => {
        const run = () => {
            while (running < concurrency && id < iterable.length) {
                running++
                const currentId = id
                callback(iterable[id])
                    .then((result) => {
                        results[currentId] = result
                        running--
                        resolved++
                        run()
                    })
                    .catch(reject)
                id++
            }

            if (resolved == iterable.length) return resolve(results)
        }

        run()
    })
}