/*
  Publishes all html files from templates/*.html to public/*.html.

  Write the website HTML in `templates/`.
  Each file in the root of `templates/` becomes a page of your website.
  Each file in subfolders of `templates/` can be reused as a partial template.

  Examples:

  1. `{{ foo/bar.html }}` or `<partial src="foo/bar.html" />`
     Is replaced by the contents of `foo/bar.html`.

  2. `<partial src="foo/bar.html">your content</partial>`
     Is replaced by the contents of `foo/bar.html`.
     Use `{{ content }}` inside the partial to define placement of `your content`.

  3. `<partial src="foo/bar.html" key="value" />`
    Use `{{ key }}` inside the partial to define placement of `value`

  4. `{{ any yaml key }}`
    Is replaced by text.yml value.

  5. `<partial src="any yaml key" foo="bar">`
    Is replaced by text.yml value.
    Use `{{ foo }}` inside the yaml to define placement of `bar`.

  Setup:
  - Write an HTML file in `templates/`
  - Run `npm install`
  - Run `node publish.js`
  - Inspect `public/` folder

  Bonus: support markdown partials, beautify generated HTML
*/

// dependencies
const FS = require('fs');
const parse = require('node-html-parser').parse;
const beautify = require('js-beautify').html;
const loadYaml = require('js-yaml').load;
const showdown = require('showdown');
const markdown = new showdown.Converter();

// config
const config = {
	tag: 'ssgen',
	attr: 'src',
	inputPath: __dirname + '/in/',
	outputPath: __dirname + '/out/',
	dictionary: loadYaml(maybeReadFile(__dirname + '/text.yml')) || {},
	inputFilenameRegex: new RegExp('\.html$')
};


// main
FS.readdirSync(config.inputPath)
	.filter(filename => filename.match(config.inputFilenameRegex) )
	.forEach(filename => {
		console.log(`Processing page ${filename}...`)

		const uglyHtml = processPage(filename)
		const beautifulHtml = beautify(uglyHtml, {indent_size: 2});
		const outputFilename = config.outputPath + filename;

		FS.writeFile(outputFilename, beautifulHtml, (error) => {
			if (error)
				console.error(`Cannot write output (${outputFilename})`);
		});
});

// helpers
function processPage(filename) {
	let rawHtml = maybeReadFile(config.inputPath + filename);
	const replacedHtml = replaceCurlyBrackets(rawHtml, config.dictionary, config.inputPath)
	let elem, doc = parse(replacedHtml);

	// for each partial tag, read source from file or yaml, replace its curly brackets
	// and replace the html tag by the final content of source.
	while(elem = doc.querySelector(config.tag + '[' + config.attr + ']')) {
		const {[config.attr]: source, ...tagDictionary} = elem.attributes;
		const partialDictionary = {...config.dictionary, ...tagDictionary, content: elem.innerHTML};
		const rawPartial = readDictionaryOrFile(source, partialDictionary, config.inputPath);
		const replacedPartial = replaceCurlyBrackets(rawPartial, partialDictionary, config.inputPath);

		elem.replaceWith(replacedPartial);
	}

	return doc.toString();
}

function maybeReadFile(filename) {
	try {
		const isMarkdown = (filename.substring(filename.length - 3, filename.length) == '.md');
		const content = FS.readFileSync(filename, 'utf8').toString();
		return isMarkdown ? markdown.makeHtml(content) : content;
	}
	catch(err) {
		console.error(`Missing file (${err.path})`);
		return '';
	}
}

function replaceCurlyBrackets(text, dictionary) {
	// match {{ any thing }} or {{ any/file.txt }}
	const regexp = /{{\s*[\w\.\/\s]+\s*}}/g;

	text = text.replace(regexp, replacement => {
		const key = replacement.substring(2, replacement.length - 2).trim();
		return readDictionaryOrFile(key, dictionary, config.inputPath);
	});

	// support escaped backslashes, for example \{\{ is replaced by {{
	const escapedOpenBraces = /\\\{\\\{/g;
	const escapedCloseBraces = /\\\}\\\}/g;
	return text.replace(escapedOpenBraces, "{{").replace(escapedCloseBraces, "}}");
}

function readDictionaryOrFile(key, dictionary) {
	console.log(`|_ Processing partial "${key}"`)
	return dictionary[key] || maybeReadFile(config.inputPath + key) || `{{ ${key} }}`;
}
