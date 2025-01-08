document.getElementById('fileUpload').addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
    const files = event.target.files;
    const fileList = document.getElementById('fileList');
    const downloadButtons = document.getElementById('downloadButtons');
    
    // Clear previous file list and download buttons
    fileList.innerHTML = '';
    downloadButtons.innerHTML = '';

    // Display uploaded files
    Array.from(files).forEach((file) => {
        const fileItem = document.createElement('div');
        fileItem.textContent = `File: ${file.name}`;
        fileList.appendChild(fileItem);

        // Create a dummy button for each file for download purposes
        const downloadBtn = document.createElement('button');
        downloadBtn.classList.add('download-btn');
        downloadBtn.textContent = `Download ${file.name}`;

        downloadBtn.addEventListener('click', () => {
            processFile(file);
        });

        downloadButtons.appendChild(downloadBtn);
    });
}

function processFile(file) {
    // Here, you will process the file as per the types (VCF, Excel, DOCX)
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'vcf') {
        convertVCFToTXT(file);
    } else if (fileExtension === 'txt') {
        convertTXTToTXT(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xlsm' || fileExtension === 'xls') {
        convertExcelToTXT(file);
    } else if (fileExtension === 'docx') {
        convertDOCXToTXT(file);
    } else {
        alert('File type not supported');
    }
}

function convertVCFToTXT(file) {
    // Placeholder for actual VCF to TXT conversion
    alert(`Converting VCF file: ${file.name}`);
    // Simulate the file conversion
    simulateDownload(file, 'vcf');
}

function convertTXTToTXT(file) {
    // Placeholder for actual TXT to TXT conversion
    alert(`Converting TXT file: ${file.name}`);
    simulateDownload(file, 'txt');
}

function convertExcelToTXT(file) {
    // Placeholder for actual Excel to TXT conversion
    alert(`Converting Excel file: ${file.name}`);
    simulateDownload(file, 'excel');
}

function convertDOCXToTXT(file) {
    // Placeholder for actual DOCX to TXT conversion
    alert(`Converting DOCX file: ${file.name}`);
    simulateDownload(file, 'docx');
}

function simulateDownload(file, type) {
    // Simulate file download with the name adjusted based on type
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = `${file.name.split('.')[0]}_converted.${type}`;
    link.click();
}
