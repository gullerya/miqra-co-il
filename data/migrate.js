import fs from 'node:fs';
import * as readline from 'node:readline';

const fileStream = fs.createReadStream('data/source/etcbc-2021/bhsa.mql');

const rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity
});

let paragraphs = [];

let currentObjectLines = null;
const suffixes = {
	'&': asciiToUtf('\\xd6\\xbe'),				//	joining maqaf
	'05 ': asciiToUtf('\\xd7\\x80'),				//	joining pipe
	' 05 ': asciiToUtf('\\xc2\\xa0\\xd7\\x80'),		//	joining pipe but with non-breaking space before it
	'_P ': "פ",									//	opened paragraph
	'_S ': "ס",									//	closed paragraph
	'00 ': "׃",				//	end of verse
	'00_P ': "׃פ",			//	end of verse + opened paragraph
	'00_S ': "׃ס",			//	end of verse + closed paragraph
	'00_N_P ': "׃נפ",		//	end of verse + nun ragila + opened paragraph
	'00_N_S ': "׃נס",		//	end of verse + nun ragila + closed paragraph
	'00_N ': "׃׆"			//	end of verse + non haphukka (in this case should agree with BHS and move this meta to the next verse)
};

const END_OF_VERSE = asciiToUtf('\\xd7\\x83');
const NUN_RAGILA = asciiToUtf('\\xd7\\xa0');
const NUN_HAPHUKHA = asciiToUtf('\\xd7\\x86');

const startTime = performance.now();

let lineNumber = 0;
for await (const line of rl) {
	if (line === 'CREATE OBJECT') {
		currentObjectLines = [];
	} else if (line === ']' && Array.isArray(currentObjectLines)) {
		const currentWord = processObject(currentObjectLines, lineNumber);
		if (currentWord.word) {
			words.push(currentWord);
		} else if (currentWord.lex) {
			words[words.length - 1].lexE = currentWord.lex;
		}
		currentObjectLines = null;
	} else if (currentObjectLines) {
		currentObjectLines.push(line);
	}

	lineNumber++;

	if (lineNumber % 1000000 === 0) {
		console.log(`${lineNumber} processed...`);
	}

	// if (words.length > 100) {
	// 	break;
	// }
}

fs.rmSync('data/output', { recursive: true });
fs.mkdirSync('data/output', { recursive: true });
fs.writeFileSync('data/output/words.json', JSON.stringify(words, null, 4), { encoding: 'utf-8' });

console.log(`done in ${Math.floor(performance.now() - startTime)}ms`);

//	PROCESSORS
//
function processObject(inputLines, startingLineNumber) {
	const result = {};

	let kqHybrid = null;
	inputLines.forEach((line, lineNumber) => {
		if (line.includes('ID_D')) {
			// result.id = parseInt(line.split('=').pop());
		} else if (line.startsWith('g_word_utf8')) {
			const word = asciiToUtf(line.split(':=').pop());
			result.word = word || kqHybrid;
		} else if (line.startsWith('g_voc_lex_utf8')) {
			result.lex = asciiToUtf(line.split(':=').pop());
		} else if (line.startsWith('qere_utf8') && !line.endsWith('"";')) {
			result.qere = asciiToUtf(line.split(':=').pop());
		} else if (line.startsWith('kq_hybrid_utf8') && !line.endsWith('"";')) {
			kqHybrid = asciiToUtf(line.split(':=').pop());
		} else if (line.startsWith('distributional_parent')) {
			// result.distParent = parseInt(line.split(':=').pop());
		} else if (line.startsWith('functional_parent')) {
			// result.funcParent = parseInt(line.split(':=').pop());
		}

		if (line.startsWith('g_suffix')) {
			const suffixPlain = line.split(':=').pop().replace(/[\";]/g, '');
			processSuffix(suffixPlain, result, startingLineNumber + lineNumber);
		}
	});

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

function processSuffix(suffix, monad, lineNumber) {
	let nunHandled = false;

	if (suffix === '&' || suffix.includes('05')) {
		if (!monad.word) {
			throw new Error(`can't append suffix to an empty word in ${JSON.stringify(monad)}`);
		}
		monad.word += suffixes[suffix];
		return;
	}

	//	handle end of verse
	if (suffix.includes('00')) {
		if (!monad.word) {
			throw new Error(`can't append end of verse to an empty word in ${JSON.stringify(monad)}; line: ${lineNumber}`);
		}
		monad.word += END_OF_VERSE;
	}

	//	handle closed pragraph
	if (suffix.includes('_S')) {
		if (suffix.includes('_N')) {
			if (!monad.word) {
				throw new Error(`can't append NUN RAGILA to an empty word in ${JSON.stringify(monad)}`);
			}
			monad.word += NUN_RAGILA;
			nunHandled = true;
		}
		processClosedParagraph();
	}

	//	handle opened pragraph
	if (suffix.includes('_P')) {
		if (suffix.includes('_N')) {
			if (!monad.word) {
				throw new Error(`can't append NUN RAGILA to an empty word in ${JSON.stringify(monad)}`);
			}
			monad.word += NUN_RAGILA;
			nunHandled = true;
		}
		processOpenedParagraph();
	}

	//	handle NUN HAPHUKHA
	if (suffix.includes('_N') && !nunHandled) {
		if (!monad.word) {
			throw new Error(`can't append NUN HAPHUKHA to an empty word in ${JSON.stringify(monad)}`);
		}
		monad.word += NUN_HAPHUKHA;
	}
}

function processClosedParagraph() {

}

function processOpenedParagraph() {

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

// CREATE OBJECT
// FROM MONADS= { 164664 } 
// WITH ID_D=537519 [
// number:=4196;
// lexeme_count:=19;
// kq_hybrid:=":@7500";
// qere_utf8:="\xd7\xa4\xd6\xbc\xd6\xb0\xd7\xa8\xd6\xb8\xd6\xbd\xd7\xaa";
// qere:="P.:R@75T";
// kq_hybrid_utf8:="\xd6\xb3\xd6\xbd\xd7\x83";
// g_word:="*";
// g_word_utf8:="";
// g_cons_utf8:="";
// g_cons:="";
// g_suffix:="00 ";
// g_suffix_utf8:="\xd7\x83 ";
// g_pfm:="";
// g_pfm_utf8:="";
// g_vbs:="";
// g_vbs_utf8:="";
// lex:="PRT/";
// lex_utf8:="\xd7\xa4\xd7\xa8\xd7\xaa\xd6\x9c";
// g_lex:="";
// g_lex_utf8:="";
// g_voc_lex:="P.:R@T";
// g_voc_lex_utf8:="\xd7\xa4\xd6\xbc\xd6\xb0\xd7\xa8\xd6\xb8\xd7\xaa";
// g_prs_utf8:="";
// g_prs:="";
// g_vbe:="";
// g_uvf_utf8:="";
// g_uvf:="";
// g_vbe_utf8:="";
// g_nme:="/";
// g_nme_utf8:="\xd6\x9c";
// nme:="";
// distributional_parent:=537515;
// functional_parent:=537516;
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
// nu:=sg;
// suffix_number:=NA;
// gn:=unknown;
// suffix_gender:=NA;
// prs_gn:=NA;
// st:=a;
// sp:=nmpr;
// pdp:=nmpr;
// ]