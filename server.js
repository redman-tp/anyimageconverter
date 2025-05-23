const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const sharp = require('sharp');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    console.log(`Setting destination for file: ${file.originalname} to ${uploadDir}`);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    console.log(`Setting filename for upload: ${uniqueName}`);
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept image files - allow additional formats
  const filetypes = /jpeg|jpg|png|tiff|webp|gif|bmp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  console.log(`Filtering file: ${file.originalname}, mimetype: ${file.mimetype}, valid: ${mimetype && extname}`);
  
  if (mimetype && extname) {
    return cb(null, true);
  }
  
  cb(new Error(`Only image files are allowed. Received: ${file.mimetype}`));
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Routes
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'WebP Image Converter',
    description: 'Convert your images to WebP format for better web performance'
  });
});

// Handle file upload and conversion
app.post('/convert', (req, res) => {
  console.log('Received request to /convert endpoint');
  console.log('Content-Type:', req.headers['content-type']);
  
  // Use single field name 'file' to match client
  upload.array('file')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ 
        success: false, 
        message: err.message || 'Error uploading files',
        code: err.code
      });
    }
    
    try {
      console.log('Files received:', req.files?.length || 0);
      
      const files = req.files;
      const quality = parseInt(req.body.quality) || 75;
      const moveOriginals = req.body.moveOriginals === 'true';
      const skipExisting = req.body.skipExisting === 'true';
      
      console.log('Settings:', { quality, moveOriginals, skipExisting });
      
      if (!files || files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
      }
      
      const results = {
        converted: 0,
        skipped: 0,
        failed: 0,
        files: [],
        totalOriginalSize: 0,
        totalWebpSize: 0
      };
      
      const outputDir = path.join(__dirname, 'outputs');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const tempDir = path.join(__dirname, 'temp');
      if (moveOriginals && !fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Process each file
      for (const file of files) {
        console.log('Processing file:', file.originalname);
        
        const fileName = path.basename(file.originalname, path.extname(file.originalname));
        const webpPath = path.join(outputDir, `${fileName}.webp`);
        
        // Check if WebP version already exists
        if (skipExisting && fs.existsSync(webpPath)) {
          console.log('Skipping existing file:', fileName);
          results.skipped++;
          results.files.push({
            originalName: file.originalname,
            status: 'skipped',
            message: 'WebP version already exists'
          });
          continue;
        }
        
        try {
          // Get original file size
          const originalStats = fs.statSync(file.path);
          results.totalOriginalSize += originalStats.size;
          
          // Convert to WebP
          console.log('Converting to WebP:', fileName);
          await sharp(file.path)
            .webp({ quality: quality })
            .toFile(webpPath);
          
          // Get WebP file size
          const webpStats = fs.statSync(webpPath);
          results.totalWebpSize += webpStats.size;
          
          // Move original file if requested
          if (moveOriginals) {
            console.log('Moving original file to temp folder');
            const tempPath = path.join(tempDir, file.originalname);
            fs.renameSync(file.path, tempPath);
          }
          
          results.converted++;
          results.files.push({
            originalName: file.originalname,
            webpName: `${fileName}.webp`,
            originalSize: originalStats.size,
            webpSize: webpStats.size,
            status: 'converted',
            message: 'Successfully converted to WebP'
          });
        } catch (err) {
          console.error('Error processing file:', err);
          results.failed++;
          results.files.push({
            originalName: file.originalname,
            status: 'failed',
            message: err.message
          });
        }
      }
      
      console.log('Conversion results:', {
        converted: results.converted,
        skipped: results.skipped,
        failed: results.failed
      });
      
      res.json({
        success: true,
        results: results,
        spaceSaved: results.totalOriginalSize - results.totalWebpSize
      });
    } catch (error) {
      console.error('Error processing files:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
});

// Download converted images
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'outputs', filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

// Download all as zip
app.get('/download-all', (req, res) => {
  // TO DO: Implement zip download functionality
  res.status(501).send('Not implemented yet');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Open your browser and navigate to the above URL to use the WebP Image Converter`);
}); 