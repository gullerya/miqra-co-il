import fs from 'node:fs/promises';

//	remove the out folder
await fs.rm('out', { recursive: true, force: true });

//	copy src to the out
await fs.cp('src', 'out', { recursive: true });
