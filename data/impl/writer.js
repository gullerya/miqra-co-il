import fs from 'node:fs/promises';
import os from 'node:os';

export {
	writeParagraphs
};

async function writeParagraphs(paragraphs) {
	console.log(`${os.EOL}writing ${paragraphs.length} paragraphs...`);
	const started = performance.now();

	//	prepare folder
	await fs.rm('src/data/paragraphs', { recursive: true, force: true });
	await fs.mkdir('src/data/paragraphs', { recursive: true });

	const writePromises = paragraphs.map((p, i) => {
		return fs.writeFile(`src/data/paragraphs/${i}.json`, JSON.stringify(p), { encoding: 'utf-8' });
	});
	await Promise.all(writePromises);

	console.log(`... writing done in ${Math.floor(performance.now() - started)}ms${os.EOL}`);
}