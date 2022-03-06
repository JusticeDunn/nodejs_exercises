// Create ColorConsole and subclasses
// Create Factory function to create appropriate class

class ColorConsole {
    log() {}
}

class RedConsole extends ColorConsole {
    log(string) {
        console.log('\x1b[31m', string)
    }
}

class BlueConsole extends ColorConsole {
    log(string) {
        console.log('\x1b[34m', string)
    }
}

class GreenConsole extends ColorConsole {
    log(string) {
        console.log('\x1b[32m', string)
    }
}

function createColorConsole(color) {
    switch (color) {
        case 'red':
            return new RedConsole()
        case 'blue':
            return new BlueConsole()
        case 'green':
            return new GreenConsole()
        default:
            console.log("Only accepts 'red', 'green', or 'blue'.")
    }
}

let colorConsole = createColorConsole('red')
colorConsole.log('this is red')

colorConsole = createColorConsole('blue')
colorConsole.log('this is blue')

colorConsole = createColorConsole('green')
colorConsole.log('this is green')