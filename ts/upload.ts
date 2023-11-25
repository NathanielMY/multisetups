import { ArgumentParser } from 'argparse'
import * as shelljs from 'shelljs'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import * as clc from 'cli-color'

import {
    countDirents,
    SUCCINCT_S3_BUCKET,
    WORKSPACE_DIR,
    generateDirName,
    getDirNamePrefix
} from './utils'

const configureSubparsers = (subparsers: ArgumentParser) => {
    const parser = subparsers.add_parser(
        'upload',
        { add_help: true },
    )

    parser.add_argument(
        '--contributorNum',
        {
            required: true,
            action: 'store',
            type: 'int',
            help: 'The participant number that you received from the coordinator.'
        }
    )

    parser.add_argument(
        '--contributorHandle',
        {
            required: true,
            action: 'store',
            type: 'str',
            help: "The contributor's handle (e.g. from github or twitter)"
        }
    )

    parser.add_argument(
        '--s3bucket',
        {
            required: true,
            action: 'store',
            type: 'str',
            help: 'The trusted setup s3 bucket',
            default: SUCCINCT_S3_BUCKET
        }
    )

}

const upload = async (
    contributorNum: number,
    contributorHandle: string,
    s3bucket: string
) => {
    const dirname = `${WORKSPACE_DIR}/${getDirNamePrefix(contributorNum)}`;

    if (!fs.existsSync(dirname)) {
        console.log(`Error: ${dirname} does not exist`)
    }

    // The directory must not be empty
    const numFiles = countDirents(dirname)
    if (numFiles === 0) {
        console.error(`Error: ${dirname} should not be empty`)
        return 1
    }

    // Generate the S3 dirname
    const s3dirname = generateDirName(contributorNum, contributorHandle)

    console.log(`uploading your contribution ${s3dirname} ...`);

    // Upload files
    const cmd = `aws s3 cp --recursive ${dirname} ${s3bucket}/${s3dirname} --region us-east-1 --endpoint-url https://s3-accelerate.amazonaws.com`
    const out = shelljs.exec(cmd, { silent: false })
    if (out.code !== 0 || out.stderr) {
        console.error(`Error: could not add ${dirname} to ${s3bucket}/${s3dirname}.`)
        console.error(out.stderr)
        return 1
    }


    let rotateContribHash = '0x';
    let stepContribHash = '0x';
    let parsingRotateHash = false;
    let parsingStepHash = false;
    let contribHashLineNum = -1;

    const transcriptPath = path.join(dirname, `transcript.${contributorNum}.txt`)

    fs.readFileSync(transcriptPath, 'utf8').split('\n').forEach((line) => {
        if (line.includes("Circuit Hash")) {
            parsingRotateHash = true;
            return;
        } else if (line.includes("Contribution Hash")) {
            parsingStepHash = true;
            return;
        }

        if (parsingRotateHash || parsingStepHash) {
            const re = /\s+/gi;  // This will match any white-space characters
            const cleanedLine = line.trim().replace(re, '');
            if (cleanedLine) {  // Check if the cleaned line is not empty
                if (parsingRotateHash) {
                    rotateContribHash += cleanedLine;
                } else if (parsingStepHash) {
                    stepContribHash += cleanedLine;
                }
            }

            contribHashLineNum++;
            if (contribHashLineNum >= 3) {  // 4 lines for each hash (0, 1, 2, 3)
                parsingRotateHash = false;
                parsingStepHash = false;
                contribHashLineNum = -1;
            }
            return;
        }
    });

    console.log(`rotateContribHash: ${rotateContribHash}`);
    console.log(`stepContribHash: ${stepContribHash}`);

    console.log(`successfully uploaded contribution: ${s3bucket}/${s3dirname}`)

    const tweet = `🤫@ZephyrExchange\n\nhttps://zephyr-trusted-setup.s3.amazonaws.com/${s3dirname}/transcript.${contributorNum}.txt`
    const encodedTweet = encodeURIComponent(tweet)

    const twitterURl = clc.bold(`https://twitter.com/intent/tweet?text=${encodedTweet}`)
    console.log(`\n\n\n\nPlease post a public attestation of your contribution by tweeting the following message:\n\n${twitterURl}`)

    return 0
}

export {
    upload,
    configureSubparsers,
}
