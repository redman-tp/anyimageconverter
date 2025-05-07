# WebP Image Converter

A Node.js application that converts image files to WebP format with both a web interface and command-line functionality.

## Overview

This tool helps you convert your images to the WebP format, which offers superior compression and quality characteristics compared to traditional formats like JPEG and PNG. Whether you prefer a user-friendly web interface or a powerful command-line tool, this application has you covered.

## Features

- **Web Interface**: Easy-to-use drag-and-drop interface for converting individual files or folders
- **Command-Line Tool**: Batch process entire directories recursively
- **Smart Conversion**: Converts JPG, JPEG, PNG, and TIFF files to WebP format with customizable quality
- **Organization**: Automatically moves original files to temp folders after conversion
- **Skip Existing**: Avoids duplicate work by skipping images that already have WebP versions
- **Visual Feedback**: Detailed logging of all operations with conversion statistics

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/redman-tp/anyimageconverter.git
   cd anyimageconverter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Web Interface

1. Start the web server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to http://localhost:3000

3. Use the web interface to:
   - Drag and drop images or folders
   - Select images with the file picker
   - Adjust WebP quality
   - Configure conversion options
   - Download converted images

### Command-Line

For batch processing directories, you can use the included command-line script:

1. Edit the `index.js` file to set your source directory:
   ```javascript
   const imageFolder = 'path/to/your/images';
   ```

2. Run the script:
   ```bash
   node index.js
   ```

## Configuration

### Web Interface Options

- **WebP Quality**: Adjust the quality/compression ratio (1-100)
- **Move Originals**: Choose whether to move original files to a temp folder
- **Skip Existing**: Skip conversion if WebP version already exists

### Command-Line Options

Edit these variables in `index.js`:

```javascript
const imageFolder = 'path/to/your/images'; // Directory to scan
const quality = 75; // WebP quality (1-100)
```

## How It Works

### Web Interface

1. The application uses Express.js and EJS templates to provide a responsive web interface
2. Users can upload images through drag-and-drop or file selection
3. Images are processed server-side using the Sharp library
4. Converted images are available for download individually or as a batch

### Command-Line Tool

1. The script recursively scans the specified folder hierarchy
2. For each image file (JPG, JPEG, PNG, TIFF):
   - Converts it to WebP format using the specified quality
   - Saves the new file alongside the original
   - Moves the original to a Temp folder

## Development

To run the application in development mode with automatic reloading:

```bash
npm run dev
```

## Dependencies

- **express**: Web server framework
- **ejs**: Templating engine
- **multer**: File upload handling
- **sharp**: Image processing library
- **body-parser**: Request body parsing

## License

ISC

## Author

Redman (Wordsworth)

## Customization

### Change Quality Settings

Modify the quality value in line 42 of `index.js`:
```javascript
.webp({ quality: 75 }) // Change 75 to your preferred value (1-100)
```

### Add Support for More Image Types

Extend the imageExtensions array in line 8 of `index.js`:
```javascript
const imageExtensions = ['.jpg', '.jpeg', '.png', '.tiff', '.gif', '.bmp'];
```

### Change Temp Folder Naming

Modify the temp folder name format in line 18 of `index.js`:
```javascript
const tempFolderName = `Temp${dirName}`; // Change to your preferred format
```

## Requirements

- Node.js 14.0 or higher
- Sharp library (automatically installed with npm install)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 