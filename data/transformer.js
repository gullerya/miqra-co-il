import fs from 'node:fs';
import * as readline from 'node:readline';

const fileStream = fs.createReadStream('data/source/etcbc-2021/bhsa.mql');

const rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity
});

let words = [];
let currentObjectLines = null;
const suffixes = {
	"00 ": "׃",
	"&": "־",
	"05 ": "׀",
	"00_P ": "׃פ",
	"00_S ": "׃ס",
	"_P ": "פ",
	"00_N_S ": "׃נס",
	"00_N_P ": "׃נפ",
	"_S ": "ס",
	" 05 ": "׀",
	"00_N ": "׃׆"
};

const startTime = performance.now();

let lineNumber = 0;
for await (const line of rl) {
	if (line === 'CREATE OBJECT') {
		currentObjectLines = [];
	} else if (line === ']' && Array.isArray(currentObjectLines)) {
		const currentWord = processObject(currentObjectLines, lineNumber);
		if (currentWord.word) {
			words.push(currentWord);
		}
		currentObjectLines = null;
	} else if (currentObjectLines) {
		currentObjectLines.push(line);
	}

	lineNumber++;

	// if (words.length > 100) {
	// 	break;
	// }
}

fs.rmSync('data/output', { recursive: true });
fs.mkdirSync('data/output', { recursive: true });
fs.writeFileSync('data/output/words.json', JSON.stringify(words, null, 4), { encoding: 'utf-8' });
fs.writeFileSync('data/output/suffixes.json', JSON.stringify(suffixes, null, 4), { encoding: 'utf-8' });

console.log(`done in ${Math.floor(performance.now() - startTime)}ms`);

//	PROCESSORS

function processObject(inputLines, startingLineNumber) {
	const result = {};

	let suffixPlain;
	inputLines.forEach((line, lineNumber) => {
		if (line.includes('ID_D')) {
			// result.id = parseInt(line.split('=').pop());
		} else if (line.startsWith('g_word_utf8')) {
			result.word = asciiToUtf(line.split(':=').pop());
		} else if (line.startsWith('g_voc_lex_utf8')) {
			result.lex = asciiToUtf(line.split(':=').pop());
		} else if (line.startsWith('distributional_parent')) {
			// result.distParent = parseInt(line.split(':=').pop());
		} else if (line.startsWith('functional_parent')) {
			// result.funcParent = parseInt(line.split(':=').pop());
		}

		if (line.startsWith('g_suffix_utf8')) {
			const utfSuffix = asciiToUtf(line.split(':=').pop());
			if (utfSuffix && utfSuffix !== ' ') {
				if (!suffixPlain) throw new Error(`suffixes are mixed up, line: ${lineNumber + startingLineNumber}, suffix plain: [${suffixPlain}], word: ${JSON.stringify(result)}`);
				suffixes[suffixPlain] = utfSuffix;
				suffixPlain = null;
			}
		} else if (line.startsWith('g_suffix')) {
			suffixPlain = line.split(':=').pop().replace(/[\";]/g, '');
		}
	});

	//	validations
	//if (!result.id) throw new Error(`ID is missing on ${JSON.stringify(result)}`);

	return result;
}

function asciiToUtf(asciiInput) {
	asciiInput = asciiInput.replace(/[\";]/g, '');
	let chars = asciiInput.split('\\x');
	chars.shift();
	chars = chars.map(char => parseInt(char, 16));
	const ab = new Uint8Array(chars);
	return new TextDecoder().decode(ab);
}

// CREATE OBJECT
// FROM MONADS= { 672 } 
// WITH ID_D=2130 [					//	handled
// number:=672;
// lexeme_count:=30386;				//	handled
// kq_hybrid:="";
// qere_utf8:="";
// qere:="";
// kq_hybrid_utf8:="";
// g_word:="HA-";
// g_word_utf8:="\xd7\x94\xd6\xb7";	//	handled
// g_cons_utf8:="\xd7\x94";
// g_cons:="H";
// g_suffix:="";					//	handled
// g_suffix_utf8:="";				//	handled
// g_pfm:="";
// g_pfm_utf8:="";
// g_vbs:="";
// g_vbs_utf8:="";
// lex:="H";
// lex_utf8:="\xd7\x94";
// g_lex:="HA-";
// g_lex_utf8:="\xd7\x94\xd6\xb7";
// g_voc_lex:="HA";
// g_voc_lex_utf8:="\xd7\x94\xd6\xb7";		//	handled
// g_prs_utf8:="";
// g_prs:="";
// g_vbe:="";
// g_uvf_utf8:="";
// g_uvf:="";
// g_vbe_utf8:="";
// g_nme:="";
// g_nme_utf8:="";
// nme:="n/a";
// distributional_parent:=2123;		//	handled
// functional_parent:=2125;			//	handled
// prs:="n/a";
// vbe:="n/a";
// vbs:="n/a";
// pfm:="n/a";
// uvf:="absent";
// language:=Hebrew;
// ls:=none;
// vs:=NA;
// vt:=NA;
// prs_ps:=NA;
// ps:=NA;
// suffix_person:=NA;
// prs_nu:=NA;
// nu:=NA;
// suffix_number:=NA;
// gn:=NA;
// suffix_gender:=NA;
// prs_gn:=NA;
// st:=NA;
// sp:=art;
// pdp:=art;
// ]
