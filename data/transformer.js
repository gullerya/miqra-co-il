import fs from 'node:fs/promises';
import bz2 from 'bz2';

try {
	const buffer = await fs.readFile('./data/source/etcbc-2021/bhsa.mql.bz2');
	const decompressed = bz2.decompress(buffer);
	console.log(decompressed.length);
} catch (error) {
	console.error(error);
}