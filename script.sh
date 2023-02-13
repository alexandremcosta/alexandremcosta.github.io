#!/usr/bin/env bash

if [[ $1 == "-h" || $1 == "--help" ]]; then
  echo "Usage: ./script.sh layout.html input_dir output_dir"
  echo
  echo "Convert all Markdown files from input_dir to HTML and apply layout.html."
  echo "Replace {{ partial_filename }} in the generated output by the contents the partial file."
  echo "Support subdirectories."
  echo "Non-Markdown files in input_dir are copied to output_dir."
  exit 0
fi

layout=$1
input_dir=$2
output_dir=$3

# Show help if number of params are incorrect, or if they don't exist
[ $# != 3 ] && { sh "$0" -h; exit 1; }
[[ -f "$layout" ]] || { echo "Error: Layout does not exist"; exit 1; }
[[ -d "$input_dir" ]] || { echo "Error: Input directory does not exist"; exit 1; }
[[ -d "$output_dir" ]] || { echo "Error: Output directory does not exist"; exit 1; }

# Check if pandoc is installed
hash pandoc 2>/dev/null || { echo >&2 "Error: pandoc is not installed. Please install it to use this script."; exit 1; }

# Iterate through all files in input directory or its subdirectories
find "$input_dir" -type f | while read -r file; do
  # Get the relative path to the file: remove input_dir from prefix
  relative_path=${file#"$input_dir"/}

  # Ensure the same directory structure exists in output directory
  file_dir=$(dirname "$output_dir/$relative_path")
  [ -d "$file_dir" ] || mkdir -p "$file_dir"

  if [[ "$file" == *.md ]]; then
    # Convert Markdown to HTML and apply layout
    pandoc --highlight-style tango --quiet "$file" --template "$layout" -o "$output_dir/${relative_path%.md}.html"
  else
    # Copy non-Markdown files to the output directory
    cp "$file" "$output_dir/$relative_path"
  fi
done

# Iterate through all HTML files in output directory or its subdirectories
find "$output_dir" -name '*.html' | while read -r file; do
  tmp_file="${file}.tmp"

  # Iterate through each line of the input file
  while read -r line; do
    # Check if the line contains the string {{ file_name }}, also capture its prefix and suffix
    if [[ $line =~ ^([^{{]*){{([^}]*)}}(.*)$ ]]; then
      # Get file_name from regex, strip whitespaces and prefix with output_dir
      file_name=$output_dir/$(echo "${BASH_REMATCH[2]}" | tr -d " ")
      # Substitute by the contents of the file, keeping prefix and suffix
      [ -f "$file_name" ] && line="${BASH_REMATCH[1]}$(cat "$file_name")${BASH_REMATCH[3]}"
    fi
    # Append the line to the output file
    printf "%s\n" "$line" >> "$tmp_file"
  done < "$file"
  mv "$tmp_file" "$file"
done
