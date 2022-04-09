# Static Site Generator in < 100 lines of code
Most web frameworks implement this to help you create your web apps using reusable templates.
But we don't want to learn a new framework. We prefer a simple snippet than a huge documentation.
So here is a small snippet to accomplish partial templates with attributes.

# How does it work?
### the ```about.html``` you write:
```html
<partial src="partials/layout.html" page="about">
  <h1>About me</h1>
  <p>I am awesome!</p>
</partial>
```

### the tool reads ```partials/layout.html```
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
### and outputs
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
### it also has simple varibles
```html
author: John Doe
description: This is a personal blog
keywords: HTML, CSS, JavaScript
```
### that are rendered like -
```html
<meta name="author" content="{{ author }}">
<meta name="description" content="{{ description }}">
<meta name="keywords" content="{{ keywords }}">
```
