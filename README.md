# Image Conversion to WebP

A Node.js utility that automatically converts image files (JPG, JPEG, PNG, TIFF) to WebP format and organizes the original files.

## Features

- Recursively scans folders for images
- Converts images to WebP format with 75% quality
- Moves original images to temporary folders
- Skips images that have already been converted

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```
   npm install
   ```

## Usage

1. Edit the `index.js` file and set the `imageFolder` variable to your target folder path:
   ```javascript
   const imageFolder = 'C:/Your/Image/Folder/Path';
   ```

2. Run the script:
   ```
   npm start
   ```

## How it works

- The script scans the specified folder and its subfolders
- For each image file found:
  - If a WebP version already exists, it skips the file
  - Otherwise, it converts the image to WebP format
  - After conversion, it moves the original file to a `Temp` folder at the same level as the original folder

## Requirements

- Node.js
- Sharp library (automatically installed with npm install) 