import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import stream from 'node:stream';
import util from 'node:util';

const BASE_ETCBC_URL = 'https://github.com/ETCBC/bhsa/raw/refs/heads/master/source';
const files = [
	'bhsa.mql.bz2',
	'ketivqere.txt',
	'lexicon_arc.txt',
	'lexicon_hbo.txt',
	'paragraphs.txt.bz2'
];
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
const folderTmp = './data/tmp'
await fs.rm(folderTmp, { recursive: true, force: true });
await fs.mkdir(folderTmp, { recursive: true });

//	download and write to tmp
for (const file of files) {
	const ws = createWriteStream(`${folderTmp}/${file}`, { flush: true });
	const response = await fetch(`${folderUrl}/${file}`);
	stream.Readable
		.fromWeb(response.body)
		.pipe(ws, { end: true });
}

//	extract archives
