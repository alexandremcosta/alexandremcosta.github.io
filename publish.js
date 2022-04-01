// Publishes all html files in templates/*.html to public/*.html.
// Write the website HTML in `templates/`. Each file will become a page of your website.
// Write partial templates in subfolders, for example `templates/partials`.
// Files in subfolders aren't published to `public/` but can be used in `<partial>` tags:
//
// - Use `<partial src="foo/bar.html" />` inside a template and run `node publish.js`
//   to replace this tag by the contents of the source file
// - Use `<partial src="foo/bar.html">your content</p>`
//   to replace by the contents of the file and `{{ content }}` inside the partial
//   to define where "your content" is placed
// - When `<partial src="foo/bar.html" key="value" />`
//   use `{{ key }}` inside the partial to define where "value" is placed
// - Use `{{ any yaml key }}` on any file to replace by text.yml values
// - Use `<partial src="any yaml key" foo="bar">` on any file to replace by text.yml values
//   where `{{ foo }}` inside the yaml defines where "bar" is placed
//
// Creates one html file in public/ for each html file in templates/ that doesn't start with `_`.
// Supports markdown partials.
//
// Run `npm install`, then you can `node publish.js` and inspect public/ files.

const fs = require('fs');
const parser = require('node-html-parser');
const beautify_html = require('js-beautify').html;
const yaml = require('js-yaml');
const showdown = require('showdown');
const markdown = new showdown.Converter();

// config
const inputPath = __dirname + '/templates/';
const outputPath = __dirname + '/public/';
const dictionary = yaml.load(maybeReadFile(__dirname + '/text.yml')) || {};
const inputFilenameRegex = new RegExp('\.html$');

// main
fs.readdirSync(inputPath)
	.filter(filename => filename.match(inputFilenameRegex))
	.forEach(filename => {
		const outputFilename = outputPath + filename;
		const outputError = `Cannot write output (${outputFilename})`;
		let html = maybeReadFile(inputPath + filename);

		console.log(`Processing ${filename}...`)
		html = replaceSnippets(html, inputPath, dictionary);
		html = beautify_html(html, {indent_size: 2});

		fs.writeFile(outputFilename, html, log_error(outputError));
});

// helpers
function maybeReadFile(filename) {
	try {
		const isMarkdown = (filename.substring(filename.length - 3, filename.length) == '.md');
		const content = fs.readFileSync(filename, 'utf8').toString();
		return isMarkdown ? markdown.makeHtml(content) : content;
	}
	catch(err) {
		console.error(`Missing file (${err.path})`);
		return '';
	}
}

function replaceSnippets(html, inputPath, dictionary) {
	const tag = 'partial', attr = 'src';
	let elem, doc = parser.parse(replaceBraces(html, dictionary));

	while(elem = doc.querySelector(tag + '[' + attr + ']')) {
		const {[attr]: source, ...tagDictionary} = elem.attributes;
		const partialDictionary = {...dictionary, ...tagDictionary, content: elem.innerHTML};
		const rawPartial = readPartial(source, inputPath, dictionary);
		const parsedPartial = replaceBraces(rawPartial, partialDictionary);

		elem.replaceWith(parsedPartial);
	}

	return doc.toString();
}

function replaceBraces(text, dictionary) {
	const regexp = /{{\s*([\w\s]+)\s*}}/g;
	let key;

	return text.replace(regexp, replacement => {
		key = replacement.substring(2, replacement.length - 2).trim()
		return dictionary[key] || replacement;
	});
}

function readPartial(key, inputPath, dictionary) {
	console.log(`|_ Processing ${key}...`)
	const fileContent = maybeReadFile(inputPath + key);
	return fileContent || dictionary[key] || '';
}

function log_error(msg) {
	return err => { if (err) { console.error(msg); console.error(err); } };
}
