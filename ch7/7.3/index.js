class Queue {
    constructor(executor) {
        this.queue = [];

        function enqueue(item) {
            const resolve = this.pending.shift();
            if (resolve) {
                return resolve(item);
            }
            this.queue.push(item)
        }
        executor(enqueue.bind(this));
    }

    dequeue() {
        return new Promise((resolve) => {
            if (this.queue.length === 0) {
                return this.pending.push(resolve);
            }
            resolve(this.queue.shift());
        });
    }
}