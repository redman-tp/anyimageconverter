document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const uploadBox = document.getElementById('upload-box');
  const fileInput = document.getElementById('file-input');
  const folderInput = document.getElementById('folder-input');
  const qualitySlider = document.getElementById('quality-slider');
  const qualityValue = document.getElementById('quality-value');
  const organizeOriginals = document.getElementById('organize-originals');
  const skipExisting = document.getElementById('skip-existing');
  const filesList = document.getElementById('files-list');
  const fileCount = document.getElementById('file-count');
  const clearAllBtn = document.getElementById('clear-all');
  const convertAllBtn = document.getElementById('convert-all');
  const progressSection = document.getElementById('progress-section');
  const progressBar = document.getElementById('progress-bar');
  const progressPercentage = document.getElementById('progress-percentage');
  const progressCount = document.getElementById('progress-count');
  const resultsSection = document.getElementById('results-section');
  const convertedCount = document.getElementById('converted-count');
  const skippedCount = document.getElementById('skipped-count');
  const failedCount = document.getElementById('failed-count');
  const spaceSaved = document.getElementById('space-saved');
  const downloadAllBtn = document.getElementById('download-all');
  const convertedFilesList = document.getElementById('converted-files-list');
  
  // File storage
  let selectedFiles = [];
  let convertedFiles = [];
  
  // Event listeners
  uploadBox.addEventListener('dragover', handleDragOver);
  uploadBox.addEventListener('dragleave', handleDragLeave);
  uploadBox.addEventListener('drop', handleDrop);
  uploadBox.addEventListener('click', () => fileInput.click());
  
  fileInput.addEventListener('change', handleFileSelect);
  folderInput.addEventListener('change', handleFileSelect);
  
  qualitySlider.addEventListener('input', () => {
    qualityValue.textContent = `${qualitySlider.value}%`;
  });
  
  clearAllBtn.addEventListener('click', clearAll);
  convertAllBtn.addEventListener('click', convertFiles);
  downloadAllBtn.addEventListener('click', downloadAllFiles);
  
  // Drag and drop handlers
  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadBox.classList.add('drag-over');
  }
  
  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadBox.classList.remove('drag-over');
  }
  
  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadBox.classList.remove('drag-over');
    
    if (e.dataTransfer.items) {
      processDroppedItems(e.dataTransfer.items);
    } else {
      addFilesToList(e.dataTransfer.files);
    }
  }
  
  // Process dropped items (files or folders)
  function processDroppedItems(items) {
    const files = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (isImageFile(file)) {
          files.push(file);
        }
      }
    }
    
    addFilesToList(files);
  }
  
  // File selection handler
  function handleFileSelect(e) {
    const files = Array.from(e.target.files).filter(file => isImageFile(file));
    addFilesToList(files);
    e.target.value = null; // Clear the input
  }
  
  // Check if file is an image
  function isImageFile(file) {
    const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/tiff'];
    const isAccepted = acceptedTypes.includes(file.type);
    console.log(`File ${file.name} is ${isAccepted ? 'an accepted' : 'not an accepted'} image type: ${file.type}`);
    return isAccepted;
  }
  
  // Add files to the list
  function addFilesToList(files) {
    console.log(`Attempting to add ${files.length} files to the list`);
    
    if (!files.length) return;
    
    // Add files to the array
    for (const file of files) {
      if (!selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
        selectedFiles.push(file);
        console.log(`Added file: ${file.name} (${file.type})`);
      } else {
        console.log(`Skipped duplicate file: ${file.name}`);
      }
    }
    
    // Update UI
    updateFileList();
  }
  
  // Update the file list in the UI
  function updateFileList() {
    filesList.innerHTML = '';
    fileCount.textContent = `(${selectedFiles.length})`;
    
    selectedFiles.forEach((file, index) => {
      const row = document.createElement('tr');
      
      // File name
      const nameCell = document.createElement('td');
      nameCell.textContent = file.name;
      row.appendChild(nameCell);
      
      // File size
      const sizeCell = document.createElement('td');
      sizeCell.textContent = formatFileSize(file.size);
      row.appendChild(sizeCell);
      
      // File type
      const typeCell = document.createElement('td');
      typeCell.textContent = file.type;
      row.appendChild(typeCell);
      
      // Status
      const statusCell = document.createElement('td');
      const statusBadge = document.createElement('span');
      statusBadge.className = 'status-badge pending';
      statusBadge.textContent = 'Pending';
      statusCell.appendChild(statusBadge);
      row.appendChild(statusCell);
      
      // Actions
      const actionsCell = document.createElement('td');
      const removeButton = document.createElement('button');
      removeButton.innerHTML = '&times;';
      removeButton.className = 'btn secondary';
      removeButton.style.padding = '0.25rem 0.5rem';
      removeButton.addEventListener('click', () => {
        selectedFiles.splice(index, 1);
        updateFileList();
      });
      actionsCell.appendChild(removeButton);
      row.appendChild(actionsCell);
      
      filesList.appendChild(row);
    });
    
    // Enable/disable convert button
    convertAllBtn.disabled = selectedFiles.length === 0;
  }
  
  // Clear all selected files
  function clearAll() {
    selectedFiles = [];
    updateFileList();
    hideResults();
  }
  
  // Convert files
  function convertFiles() {
    if (selectedFiles.length === 0) return;
    
    const formData = new FormData();
    
    // Dump formData contents for debugging
    console.log('Creating FormData for', selectedFiles.length, 'files');
    
    // Append each file individually
    selectedFiles.forEach((file, index) => {
      // Use a consistent field name for each file
      formData.append(`file`, file);
      console.log(`Appended file[${index}]:`, file.name, file.type, file.size);
    });
    
    // Add form settings
    formData.append('quality', qualitySlider.value);
    formData.append('moveOriginals', organizeOriginals.checked);
    formData.append('skipExisting', skipExisting.checked);
    
    console.log('FormData created with settings:', {
      quality: qualitySlider.value,
      moveOriginals: organizeOriginals.checked,
      skipExisting: skipExisting.checked
    });
    
    // Update the status of files in the table to "Processing"
    updateFileStatusInTable('all', 'processing', 'Processing...');
    
    // Show progress
    progressSection.style.display = 'block';
    progressBar.style.width = '0%';
    progressPercentage.textContent = '0%';
    progressCount.textContent = `0/${selectedFiles.length}`;
    
    // Hide results
    hideResults();
    
    // Track processed files
    let processedFiles = 0;
    
    // Make API request
    console.log('Sending request to /convert endpoint');
    fetch('/convert', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      console.log('Response status:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('Response data:', data);
      
      if (data.success) {
        // Update progress to 100%
        progressBar.style.width = '100%';
        progressPercentage.textContent = '100%';
        progressCount.textContent = `${selectedFiles.length}/${selectedFiles.length}`;
        
        // Update file statuses in the table
        data.results.files.forEach(fileResult => {
          const index = selectedFiles.findIndex(file => file.name === fileResult.originalName);
          if (index !== -1) {
            updateFileStatusInTable(index, fileResult.status, fileResult.message);
          }
        });
        
        // Show results
        showResults(data.results, data.spaceSaved);
        convertedFiles = data.results.files.filter(file => file.status === 'converted');
        populateConvertedFilesList();
      } else {
        alert('Error: ' + data.message);
        updateFileStatusInTable('all', 'failed', data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred during conversion. Please try again.');
      updateFileStatusInTable('all', 'failed', 'Connection error');
      
      // Update progress to show failure
      progressBar.style.width = '100%';
      progressBar.style.backgroundColor = 'var(--error-color)';
      progressPercentage.textContent = 'Failed';
      progressCount.textContent = `0/${selectedFiles.length}`;
    });
  }
  
  // Update the status of a file in the table
  function updateFileStatusInTable(index, status, message) {
    const rows = filesList.querySelectorAll('tr');
    
    if (index === 'all') {
      // Update all rows
      rows.forEach(row => {
        const statusCell = row.querySelector('td:nth-child(4)');
        if (statusCell) {
          updateStatusBadge(statusCell, status, message);
        }
      });
    } else if (rows[index]) {
      // Update specific row
      const statusCell = rows[index].querySelector('td:nth-child(4)');
      if (statusCell) {
        updateStatusBadge(statusCell, status, message);
      }
    }
  }
  
  // Update a status badge element
  function updateStatusBadge(cell, status, message) {
    let badge = cell.querySelector('.status-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'status-badge';
      cell.appendChild(badge);
    }
    
    // Remove all status classes
    badge.classList.remove('pending', 'processing', 'converted', 'skipped', 'failed');
    
    // Add appropriate class
    badge.classList.add(status);
    
    // Update text
    badge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    
    // Add title with more details
    if (message) {
      badge.title = message;
    }
  }
  
  // Show results
  function showResults(results, spaceSavedBytes) {
    resultsSection.style.display = 'block';
    convertedCount.textContent = results.converted;
    skippedCount.textContent = results.skipped;
    failedCount.textContent = results.failed;
    spaceSaved.textContent = formatFileSize(spaceSavedBytes);
  }
  
  // Hide results
  function hideResults() {
    resultsSection.style.display = 'none';
    convertedFilesList.innerHTML = '';
    convertedFiles = [];
  }
  
  // Populate converted files list
  function populateConvertedFilesList() {
    convertedFilesList.innerHTML = '';
    
    if (convertedFiles.length === 0) {
      convertedFilesList.innerHTML = '<p>No files were converted.</p>';
      return;
    }
    
    const list = document.createElement('ul');
    list.className = 'converted-files';
    
    convertedFiles.forEach(file => {
      const listItem = document.createElement('li');
      
      const fileInfo = document.createElement('span');
      fileInfo.textContent = `${file.originalName} (${formatFileSize(file.originalSize)} → ${formatFileSize(file.webpSize)})`;
      
      const downloadLink = document.createElement('a');
      downloadLink.href = `/download/${file.webpName}`;
      downloadLink.textContent = 'Download';
      downloadLink.className = 'btn primary';
      downloadLink.style.padding = '0.25rem 0.5rem';
      downloadLink.style.marginLeft = '1rem';
      
      listItem.appendChild(fileInfo);
      listItem.appendChild(downloadLink);
      list.appendChild(listItem);
    });
    
    convertedFilesList.appendChild(list);
  }
  
  // Download all files
  function downloadAllFiles() {
    if (convertedFiles.length === 0) return;
    
    // In real app, this would trigger a ZIP download
    window.location.href = '/download-all';
  }
  
  // Format file size
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }
}); 