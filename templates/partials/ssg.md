# Static Site Generator in < 100 lines of code

Just like every dev writing a blog, my first question was:  
&nbsp;&nbsp;&nbsp;&nbsp; *What is the minimum set of features to maintain it comfortably?*  
<br>
For me, the worst part of writing plain HTML is to manage the layout on all pages.  
If I change the navigation menu, I don't want to copy/paste the changes on every page of my website.  
I also don't want to spend days reading a static site generator documentation.  
<br>
What if I could write `about.html` like this

```html
<partial src="partials/layout.html" page="about">
  <h1>About me</h1>
  <p>I am awesome!</p>
</partial>
```

And the browser concatenates `partials/layout.html`

```html
<html>
  <head>
    <title>My Blog</title>
    <link href="assets/css/{{ page }}.css" rel="stylesheet">
  </head>
  <body>
	<partial src="nav.html" />
	{{ content }}
  </body>
</html>
```

Giving a final result

```html
<html>
  <head>
    <title>My Blog</title>
    <link href="assets/css/about.css" rel="stylesheet">
  </head>
  <body>
    <nav></nav>
    <h1>About me</h1>
    <p>I am awesome!</p>
  </body>
</html>
```

What if you could write your website title, description, and static texts like this:

```yaml
author: John Doe
description: This is a personal blog
keywords: HTML, CSS, JavaScript
```

And render them like this

```html
<meta name="author" content="{{ author }}">
<meta name="description" content="{{ description }}">
<meta name="keywords" content="{{ keywords }}">
```

Most web frameworks implement variations of this pattern to help you create your web apps using reusable components.  
But we don't want to learn a new framework, we just want to write HTML/CSS/JS without any configuration or learning curve.  
<br>
So here is a small snippet to accomplish **partials with attributes**.  
Save it to `publish.js` and follow the instructions.

```
// Publishes all html files in templates/*.html to public/*.html.
// Place each page in `templates/`. Each one will become a page of your website.
// Place each partial in subfolders, for example `templates/partials`.
// Files in subfolders aren't published to `public/` but can be used in `<partial>` tags:
//
// - Use `<partial src="foo/bar.html" />` inside a template and run `node publish.js`
//   to replace by the content of templates/partials/foo/bar.html
// - Use `<partial src="foo/bar.html">your content</p>`
//   to replace by the content of templates/partials/foo/bar.html
//   where `{{ content }}` inside the partial defines where "your content" is placed
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
	const fileContent = maybeReadFile(inputPath + key);
	return fileContent || dictionary[key] || '';
}

function log_error(msg) {
	return err => { if (err) { console.error(msg); console.error(err); } };
}
```
