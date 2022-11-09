import fs from 'node:fs';
import * as readline from 'node:readline';

const fileStream = fs.createReadStream('data/source/etcbc-2021/bhsa.mql');

const rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity
});

let words = [];
let lexemeCounts = {};
let currentObjectLines = null;
for await (const line of rl) {
	if (line === 'CREATE OBJECT') {
		currentObjectLines = [];
	} else if (line === ']' && Array.isArray(currentObjectLines)) {
		const currentWord = processObject(currentObjectLines);
		words.push(currentWord);
		currentObjectLines = null;
	} else if (currentObjectLines) {
		currentObjectLines.push(line);
	}

	if (words.length > 100) {
		break;
	}
}

fs.writeFileSync('data/words.json', JSON.stringify(words, null, 4), { encoding: 'utf-8' });
fs.writeFileSync('data/lexes.json', JSON.stringify(lexemeCounts, null, 4), { encoding: 'utf-8' });

//	PROCESSORS

function processObject(inputLines) {
	const result = {};

	let lexemeCount;
	for (const line of inputLines) {
		if (line.includes('ID_D')) {
			result.id = parseInt(line.split('=').pop());
		} else if (line.startsWith('g_word_utf8')) {
			result.word = asciiToUtf(line.split(':=').pop());
		} else if (line.startsWith('g_voc_lex_utf8')) {
			result.lex = asciiToUtf(line.split(':=').pop());
			collectLexemeCount(result.lex, lexemeCount);
		} else if (line.startsWith('lexeme_count')) {
			lexemeCount = parseInt(line.split(':=').pop());
			collectLexemeCount(result.lex, lexemeCount);
		} else if (line.startsWith('distributional_parent')) {
			result.distParent = parseInt(line.split(':=').pop());
		} else if (line.startsWith('functional_parent')) {
			result.funcParent = parseInt(line.split(':=').pop());
		}
	}

	//	validations
	//if (!result.id) throw new Error(`ID is missing on ${JSON.stringify(result)}`);

	return result;
}

function collectLexemeCount(lexeme, count) {
	if (!lexeme || !count) {
		return;
	}
	if (lexeme in lexemeCounts) {
		if (lexemeCounts[lexeme] !== count) {
			throw new Error(`for lexeme ${lexeme} found counts contradiction: ${lexemeCounts[lexeme]} vs ${count}`);
		}
	} else {
		lexemeCounts[lexeme] = count;
	}
}

function asciiToUtf(asciiInput) {
	asciiInput = asciiInput.replace(/[\";]/g, '');
	let chars = asciiInput.split('\\x');
	chars.shift();
	chars = chars.map(char => parseInt(char, 16));
	const ab = new Uint8Array(chars);
	return new TextDecoder().decode(ab);
}

function extractMonad(rawLines) {
	//lex_utf8:="\xd7\x91\xd7\xa8\xd7\x90";
	for (const rawLine of rawLines) {
		const parts = rawLine.split(':=');
		if (parts[0].endsWith('utf8') && parts[1] && parts[1] !== '"";') {
			let chars = parts[1].split('\\x');
			chars = chars.map(char => parseInt(char, 16));
			console.log(`${parts[0]}: ${new TextDecoder().decode(new Uint8Array(chars))}`);
		}
	}
	return {};
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
// g_suffix:="";
// g_suffix_utf8:="";
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
