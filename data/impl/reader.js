import fs from 'node:fs';
import * as readline from 'node:readline';

export {
	readNextMonadBHS
};

async function* readNextMonadBHS() {
	const fileStream = fs.createReadStream('data/source/etcbc-2021/bhsa.mql');
	const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

	let startLine = 0;
	let currentObjectLines = null;
	for await (const line of rl) {
		if (line === 'CREATE OBJECT') {
			currentObjectLines = [];
		} else if (line === ']' && Array.isArray(currentObjectLines)) {
			yield {
				lines: currentObjectLines,
				startLine
			};
			currentObjectLines = null;
		} else if (currentObjectLines) {
			currentObjectLines.push(line);
		}

		startLine++;

		if (startLine % 1000000 === 0) {
			console.log(`\t${startLine} lines processed...`);
		}
	}
}
