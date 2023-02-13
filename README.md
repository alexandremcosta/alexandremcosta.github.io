# Markdown-to-HTML Converter

This script converts all Markdown files from a input directory to HTML and applies a `layout.html` file.

Additionally:

1. replaces `{{ partial_filename }}` in the generated output by the contents the partial file
2. non-markdown files in input directory are copied to output directory
3. supports subdirectories

## Usage

```shell
sh script.sh layout.html input_dir output_dir
```

### Parameters
- **layout.html**: the layout file that will be applied to the generated HTML files.
- **input_dir**: the directory that contains the markdown files that need to be converted.
- **output_dir**: the directory where the generated HTML files will be saved.

### Requirements
The script requires pandoc to be installed on the system.

### Examples

```
sh script.sh layout.html ~/markdown-files ~/html-files
```

This command will convert all Markdown files in the ~/markdown-files directory and any subdirectories to HTML files, while applying the layout.html template, and will place the generated files in ~/html-files directory.

## Contribution

If you find a bug or want to suggest a feature, please open an issue on GitHub.  
If you want to contribute to the code, please submit a pull request.

## Note

- This script was tested on MacOS 12.5.1 but should work on any system with minimal adjustments
- It was developed mostly by ChatGPT since I suck at bash scripting in an astronomic level
- ChatGPT also wrote this file
- Read [this blog post](http://alexandremcosta.github.io/chat-gpt-site-generator.html) for a bit of history
