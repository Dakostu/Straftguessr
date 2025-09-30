// @ts-nocheck
/**
 * Script that executes in the pre-build step that obfuscates asset file names (the JSON-JPG pairs).
 * This prevents any easy lookups in the repo using the file name while playing the game.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const assetsRoot = path.join(process.cwd(), 'src/lib/assets');

function getFilesRecursively(dir) {
	let results = [];
	const list = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of list) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			results = results.concat(getFilesRecursively(fullPath));
		} else {
			results.push(fullPath);
		}
	}
	return results;
}

const allFiles = getFilesRecursively(assetsRoot);
const jpgFiles = allFiles.filter((f) => f.endsWith('.jpg'));
const jsonFiles = allFiles.filter((f) => f.endsWith('.json'));

jpgFiles.forEach((jpgPath) => {
	const base = path.basename(jpgPath, '.jpg');
	const jsonPath = jsonFiles.find((f) => path.basename(f, '.json') === base);

	const jpgContent = fs.readFileSync(jpgPath);
	const hash = crypto.createHash('sha256').update(jpgContent).digest('hex').slice(0, 10);

	const newJpgPath = path.join(path.dirname(jpgPath), `${hash}.jpg`);
	fs.renameSync(jpgPath, newJpgPath);

	const newJsonPath = path.join(path.dirname(jsonPath), `${hash}.json`);
	fs.renameSync(jsonPath, newJsonPath);
});
