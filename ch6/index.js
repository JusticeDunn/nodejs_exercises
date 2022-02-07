// exercise 6.1
import { createGzip, createBrotliCompress, createDeflate } from "zlib"
import { PassThrough, pipeline, Transform } from "stream"
import { createReadStream, createWriteStream } from "fs"
import { hrtime } from "process";


const filename = process.argv[2]
const algorithmList = [
    {
        name: "Gzip",
        method: createGzip
    },
    {
        name: "Brotli",
        method: createBrotliCompress
    },
    {
        name: "Deflate",
        method: createDeflate
    }
]

function algorithmMeasurement(algorithm, file, algorithmName) {
        let startTimer
        let totalBytes = 0
        let endTimer
        const monitor = new PassThrough()
        monitor.on('data', (chunk) => {
            totalBytes += chunk.length
        })
        monitor.on('finish', () => {
            endTimer = hrtime.bigint()
            console.log(`${algorithmName}: ${totalBytes} Bytes in ${hrtime.bigint() - startTimer} nano seconds`)
        })
        
        pipeline(
            createReadStream(file),
            new Transform({
                defaultEncoding: 'utf8',
                transform (chunk, encoding, cb) {
                  startTimer = hrtime.bigint()
                  cb()
                },
                flush (cb) {
                  cb()
                }
              }),
            algorithm(),
            monitor,
            (err)=>{
                console.log(err)
            }
        )

}

async function main(){
    for(const algorithm of algorithmList){
        await algorithmMeasurement(algorithm.method,filename,algorithm.name)
    }
}

// exercise 6.2
import { parse } from "csv-parse"

const csvParser = parse({ columns: true })
const FILE = "london_crime_by_lsoa.csv"

//filter by location
class FilterByLocation extends Transform {
    constructor(borough, options = {}){
        options.objectMode = true
        super(options)
        this.borough = borough
    }

    _transform(record,enc,cb){
        if(record.borough === this.borough){
            this.push(record)
        }
        cb()
    }
}

//filter by year
class FilterByYear extends Transform {
    constructor(year, options = {}){
        options.objectMode = true
        super(options)
        this.year = year
    }

    _transform(record,enc,cb){
        if(record.year === this.year){
            this.push(record)
        }
        cb()
    }
}

function main2(){
    const yearSet = new Set()
    const crimeMajorCategorySet = new Set()
    const locationSet = new Set()
    pipeline(
        createReadStream(FILE),
        csvParser,
        new Transform({ //Collect set Transforms
            objectMode: true,
            transform(record, enc,cb){
                console.log(record)
                yearSet.add(record.year)
                crimeMajorCategorySet.add(record.major_category)
                locationSet.add(record.borough)
                cb()
            }
        }),

        new FilterByYear("2010"),
        new FilterByLocation("Lambeth"),

        (err)=>{
            console.log(err)
        }
    )
}

// exercise 6.3


// exercise 6.4