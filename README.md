# WebP Image Converter

A Node.js utility that automatically converts image files to WebP format and organizes the originals in a structured way.

## Overview

This tool recursively scans folders for images and converts them to the more efficient WebP format. It preserves your original files by moving them to separate temp folders, making it safe and organized.

## Features

- **Automatic scanning**: Recursively finds all images in a directory and its subdirectories
- **Smart conversion**: Converts JPG, JPEG, PNG, and TIFF files to WebP format with customizable quality
- **Organization**: Automatically moves original files to temp folders after conversion
- **Skip existing**: Avoids duplicate work by skipping images that already have WebP versions
- **Console feedback**: Detailed logging of all operations

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/webp-image-converter.git
   cd webp-image-converter
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Usage

### Folder Structure Setup

1. Create an `assets` folder in the project root if it doesn't exist
2. Place your images or image folders inside the `assets` directory
3. The script will process all images recursively through subfolders

```
webp-image-converter/
├── assets/              # Create this folder for your images
│   ├── images/          # You can organize in subfolders 
│   │   ├── photo1.jpg   # Source images to convert
│   │   └── photo2.png   
│   └── more-images/     
└── index.js             # The conversion script
```

### Running the Converter

1. Edit the `index.js` file to customize settings if needed:
   ```javascript
   // Line 5: Change the image folder path if necessary
   const imageFolder = path.resolve(__dirname, 'assets');
   
   // Line 8: Add or remove supported image extensions
   const imageExtensions = ['.jpg', '.jpeg', '.png', '.tiff'];
   
   // Line 42: Modify the WebP quality (1-100)
   .webp({ quality: 75 })
   ```

2. Run the script:
   ```
   npm start
   ```

3. The script will:
   - Convert all found images to WebP format
   - Move originals to temp folders (e.g., `Tempassets/`, `Tempimages/`)
   - Skip any images that already have WebP versions

### Example Output

```
Starting image conversion in: C:/path/to/assets
Converted: C:/path/to/assets/photo1.jpg -> C:/path/to/assets/photo1.webp
Created new temp folder: C:/path/to/Tempassets
Moved original: C:/path/to/assets/photo1.jpg -> C:/path/to/Tempassets/photo1.jpg
Skipped: C:/path/to/assets/photo2.jpg - WebP version already exists
Image conversion process completed.
```

## How It Works

1. The script uses the Sharp library to efficiently convert images
2. For each image file with a supported extension:
   - It checks if a WebP version already exists (to avoid duplicating work)
   - It converts the image to WebP format with 75% quality (configurable)
   - It creates a "Temp" folder at the same level as the image's folder
   - It moves the original file to this temp folder
3. The script skips all temp folders during its scan to avoid processing the same images twice

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

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 