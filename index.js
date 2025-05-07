const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Set the folder to scan for images
const imageFolder = path.resolve(__dirname, 'assets'); // Path to the assets folder

// Define the image extensions to look for (case-insensitive)
const imageExtensions = ['.jpg', '.jpeg', '.png', '.tiff'];

// Function to check if a file is an image based on its extension
function isImageFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return imageExtensions.includes(ext);
}

// Function to create a temp folder if it doesn't exist
function createTempFolder(originalFolderPath) {
    const dirName = path.basename(originalFolderPath);
    const parentDir = path.dirname(originalFolderPath);
    const tempFolderName = `Temp${dirName}`;
    const tempFolderPath = path.join(parentDir, tempFolderName);
    
    if (!fs.existsSync(tempFolderPath)) {
        fs.mkdirSync(tempFolderPath, { recursive: true });
        console.log(`Created new temp folder: ${tempFolderPath}`);
    }
    
    return tempFolderPath;
}

// Function to process an image file
async function processImage(filePath) {
    try {
        const fileDir = path.dirname(filePath);
        const fileName = path.basename(filePath, path.extname(filePath));
        const webpPath = path.join(fileDir, `${fileName}.webp`);
        
        // Skip if webp version already exists
        if (fs.existsSync(webpPath)) {
            console.log(`Skipped: ${filePath} - WebP version already exists`);
            return;
        }
        
        // Convert to webp
        await sharp(filePath)
            .webp({ quality: 75 })
            .toFile(webpPath);
        
        console.log(`Converted: ${filePath} -> ${webpPath}`);
        
        // Move original file to temp folder
        const tempFolder = createTempFolder(fileDir);
        const originalFileName = path.basename(filePath);
        const tempFilePath = path.join(tempFolder, originalFileName);
        
        fs.renameSync(filePath, tempFilePath);
        console.log(`Moved original: ${filePath} -> ${tempFilePath}`);
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
    }
}

// Function to recursively scan a directory for images
async function scanDirectory(directory) {
    try {
        const items = fs.readdirSync(directory);
        
        for (const item of items) {
            const itemPath = path.join(directory, item);
            const stats = fs.statSync(itemPath);
            
            // Skip temp folders 
            if (stats.isDirectory() && item.startsWith('Temp')) {
                continue;
            }
            
            if (stats.isDirectory()) {
                // Recursively scan subdirectories
                await scanDirectory(itemPath);
            } else if (stats.isFile() && isImageFile(itemPath)) {
                // Process image files
                await processImage(itemPath);
            }
        }
    } catch (error) {
        console.error(`Error scanning directory ${directory}:`, error);
    }
}

// Main execution
async function main() {
    console.log(`Starting image conversion in: ${imageFolder}`);
    
    try {
        if (!fs.existsSync(imageFolder)) {
            console.error(`Error: The folder "${imageFolder}" does not exist.`);
            return;
        }
        
        await scanDirectory(imageFolder);
        console.log('Image conversion process completed.');
    } catch (error) {
        console.error('Error in main execution:', error);
    }
}

main(); 