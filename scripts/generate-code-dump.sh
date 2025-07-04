#!/bin/bash

# Create or clear the output file
echo "" > app-code-dump.txt

# Find all TypeScript and JavaScript files in the specified directories and root
find app components lib store drizzle hooks . -type f \( -name '*.tsx' -o -name '*.ts' -o -name '*.js' -o -name '*.jsx' -o -name 'middleware.ts' \) -not -path '*/node_modules/*' -not -path '*/.next/*' | sort | while read -r file; do
  # Add file header
  echo "" >> app-code-dump.txt
  echo "// File: $file" >> app-code-dump.txt
  echo "" >> app-code-dump.txt
  
  # Append file content
  cat "$file" >> app-code-dump.txt
  
  # Add trailing newline
  echo "" >> app-code-dump.txt
done

echo "Code dump generated to app-code-dump.txt"
