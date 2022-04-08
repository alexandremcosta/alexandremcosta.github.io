# Static Site Generator in < 100 lines of code

Just like every dev writing a blog, my first question was:  
&nbsp;&nbsp;&nbsp;&nbsp; *What is the minimum set of features to maintain it comfortably?*  
<br>
For me, the worst part of writing plain HTML is to manage the layout on all pages.  
If I change the navigation menu, I don't want to copy/paste the changes on every page of my website.  
I also don't want to spend days reading a static site generator documentation.  
<hr>
#### What if you could write in `about.html`

```html
<partial src="partials/layout.html" page="about">
  <h1>About me</h1>
  <p>I am awesome!</p>
</partial>
```

#### Run a tool that reads `partials/layout.html`

```html
<html>
  <head>
    <title>My Blog</title>
    <link href="assets/css/\{\{ page \}\}.css" rel="stylesheet">
  </head>
  <body>
	<partial src="nav.html" />
	\{\{ content \}\}
  </body>
</html>
```

#### And output

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

#### And have simple variables

```yaml
author: John Doe
description: This is a personal blog
keywords: HTML, CSS, JavaScript
```

#### That can be rendered like this

```html
<meta name="author" content="\{\{ author \}\}">
<meta name="description" content="\{\{ description \}\}">
<meta name="keywords" content="\{\{ keywords \}\}">
```
<hr>
#### My Simple Static Site Generator
Most web frameworks implement this to help you create your web apps using reusable templates.  
But we don't want to learn a new framework. We prefer a simple snippet than a huge documentation.
<br>
So here is a small snippet to accomplish **partial templates with attributes**.  
Save it to `publish.js` and follow the instructions.

This is also [available on GitHub](https://github.com/alexandremcosta/alexandremcosta.github.io), together with the rest of this blog.
<script src="https://emgithub.com/embed.js?target=https%3A%2F%2Fgithub.com%2Falexandremcosta%2Falexandremcosta.github.io%2Fblob%2Fmain%2Fpublish.js&style=github&showBorder=on&showLineNumbers=on&showFileMeta=on&showCopy=on"></script>
