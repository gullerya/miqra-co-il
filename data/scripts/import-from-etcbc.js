import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import stream from 'node:stream';
import util from 'node:util';

const BASE_ETCBC_URL = 'https://github.com/ETCBC/bhsa/raw/refs/heads/master/source';
const args = util.parseArgs({
	options: {
		version: {
			type: 'string',
			short: 'v',
			default: '2021'
		}
	},
	strict: true
});

const folderUrl = `${BASE_ETCBC_URL}/${args.values.version}`;

//	prepare tmp folder
await fs.rm('./data/tmp', { recursive: true, force: true });
await fs.mkdir('./data/tmp', { recursive: true });

//	download and write to tmp
const ws = createWriteStream('./data/tmp/bhsa.mql.bz2', { flush: true });
const response = await fetch(folderUrl + '/' + 'bhsa.mql.bz2');

console.log(folderUrl + '/' + 'bhsa.mql.bz2');
console.log(response.status);

stream.Readable
	.fromWeb(response.body)
	.pipe(ws, { end: true });