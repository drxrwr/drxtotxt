document.getElementById('processButton').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;

    if (!files.length) {
        alert('Pilih file terlebih dahulu!');
        return;
    }

    const downloadContainer = document.getElementById('downloadButtons');
    downloadContainer.innerHTML = ''; // Bersihkan hasil sebelumnya

    Array.from(files).forEach((file) => {
        const fileReader = new FileReader();
        fileReader.onload = function (event) {
            const fileType = file.name.split('.').pop().toLowerCase();
            let resultContent = '';

            if (fileType === 'txt') {
                resultContent = event.target.result; // Tidak diubah
                createDownloadButton(file.name, resultContent);

            } else if (fileType === 'vcf') {
                const lines = event.target.result.split('\n');
                const numbers = lines
                    .filter((line) => line.startsWith('TEL'))
                    .map((line) => line.split(':')[1].trim());
                resultContent = numbers.join('\n');
                createDownloadButton('kontak.txt', resultContent);

            } else if (['xlsx', 'xlsm'].includes(fileType)) {
                processExcel(file, file.name);

            } else if (fileType === 'docx') {
                processDocx(file, file.name);
            }
        };

        if (['txt', 'vcf'].includes(file.name.split('.').pop().toLowerCase())) {
            fileReader.readAsText(file);
        } else {
            fileReader.readAsArrayBuffer(file);
        }
    });
});

function createDownloadButton(fileName, content) {
    const downloadContainer = document.getElementById('downloadButtons');
    const button = document.createElement('button');
    button.textContent = fileName;
    button.addEventListener('click', () => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
    });
    downloadContainer.appendChild(button);
}

function processExcel(file, originalName) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        workbook.SheetNames.forEach((sheetName) => {
            const sheet = workbook.Sheets[sheetName];
            const csv = XLSX.utils.sheet_to_csv(sheet);
            const rows = csv.split('\n');
            rows.forEach((row, index) => {
                const fileName = `${originalName}_${sheetName}_Kolom_${index + 1}.txt`;
                createDownloadButton(fileName, row);
            });
        });
    };
    reader.readAsArrayBuffer(file);
}

function processDocx(file, originalName) {
    const reader = new FileReader();
    reader.onload = function (event) {
        mammoth
            .extractRawText({ arrayBuffer: event.target.result })
            .then((result) => {
                const fileName = originalName.replace(/\.[^/.]+$/, '.txt');
                createDownloadButton(fileName, result.value);
            })
            .catch((err) => console.error(err));
    };
    reader.readAsArrayBuffer(file);
}
