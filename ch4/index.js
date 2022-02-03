import { readFile, appendFile, unlink, readdir } from "fs"
import { join } from "path"

// exercise 4.1
function concatFiles (destFile, cb, ...srcFiles) {
    let fileCount = 0
    
    function concatFile () {
        readFile(srcFiles[fileCount], { encoding: "utf-8" }, (readErr, data) => {
            if (readErr) {
                return cb(readErr)
            }
            if (fileCount === 0) {
                unlink(destFile, () => cb(`Old ${destFile} removed!`))
            }
            appendFile(destFile, data, (writeErr) => {
                if (writeErr) {
                    return cb(writeErr)
                }
                if (++fileCount === srcFiles.length) {
                    return cb("All files appended!")
                }
                concatFile()
            })
        })
    }

    concatFile()
}

concatFiles("dir/dest.txt", (message) => {console.log(message)}, "dir/one.txt", "dir/two.txt")

// exercise 4.2
function listNestedFiles (dir, cb) {
    let allFiles = []

    function search(curDir) {
        readdir(curDir, {}, (err, files) => {
            if (err) {
                return cb(err)
            }
            for (const file of files) {
                allFiles.push(file)
                search(join(curDir, file))
            }
        })
    }

    search(dir)
    setTimeout(() => {cb(allFiles)}, 50)
    return allFiles
}

// listNestedFiles("dir", (message) => {console.log(message)})

// exercise 4.3
function checkKeywordInFile (filePath, keyword, cb) {
    readFile(filePath, 'utf-8', (readErr, data) => {
        if (readErr) {
            return cb(fileReadErr)
        }
        if (!data) {
            return cb(null, false)
        }

        return cb(null, data.includes(keyword))
    })
}

function findFileMatches (dir, keyword, matches, cb) {
    readdir(dir, { withFileTypes: true }, (readDirErr, files) => {
        if (readDirErr) {
            return cb(readDirErr)
        }

        let completed = 0

        const { dirFiles, subDirs } = files.reduce((acc, curr) => {
            acc[curr.isFile() ? 'dirFiles' : 'subDirs'].push(curr)
            return acc
        }, { dirFiles: [], subDirs: [] })

        function iterate(index) {
            if (index === subDirs.length) {
                return cb(null, matches)
            }

            const newDirPath = join(dir, subDirs[index].name)
            findFileMatches(newDirPath, keyword, matches, () => {
                iterate(index + 1)
            })
        }

        function doneCheck() {
            // when finished searching for a match in the current files continue with the next directory
            if (++completed === dirFiles.length) {
                return iterate(0)
            }
        }

        dirFiles.forEach(file => {
            const filePath = join(dir, file.name)

            checkKeywordInFile(filePath, keyword, (_, matching) => {
                if (matching) {
                    matches.push(filePath)
                }
                doneCheck()
            })
        })
    })
}

function recursiveFind (dirPath, keyword, cb) {
    findFileMatches(dirPath, keyword, [], (err, matches) => {
        if (err) {
            return cb(err)
        }
        cb(matches)
    })
}

recursiveFind("dir", "foo", (message) => {console.log(message)})