import { createReadStream, createWriteStream } from 'fs'
import { createGzip, createGunzip } from 'zlib'
import { createServer } from 'http'
import { basename, join } from 'path'

const filename = process.argv[2]
createReadStream(filename)
    .pipe(createGzip())
    .pipe(createWriteStream(`${filename}.gz`))
    .on('finish', () => console.log('File successfuly compressed!'))
