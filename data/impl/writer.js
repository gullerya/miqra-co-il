import fs from 'node:fs/promises';
import os from 'node:os';

export {
	writeParagraphs
};

async function writeParagraphs(paragraphs) {
	console.log(`${os.EOL}writing ${paragraphs.length} paragraphs...`);
	const started = performance.now();

	//	prepare folder
	await fs.rm('data/output', { recursive: true });
	await fs.mkdir('data/output', { recursive: true });

	const writePromises = paragraphs.map((p, i) => {
		return fs.writeFile(`data/output/${i}.json`, JSON.stringify(p), { encoding: 'utf-8' });
	});
	await Promise.all(writePromises);

	console.log(`... writing done in ${Math.floor(performance.now() - started)}ms${os.EOL}`);
}