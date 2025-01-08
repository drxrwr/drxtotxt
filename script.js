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
            const baseName = file.name.replace(/\.[^/.]+$/, ''); // Nama tanpa ekstensi

            if (fileType === 'txt') {
                // File TXT tidak diubah
                createDownloadButton(`${baseName}.txt`, event.target.result);

            } else if (fileType === 'vcf') {
                // File VCF: Ekstrak nomor telepon
                const lines = event.target.result.split('\n');
                const numbers = lines
                    .filter((line) => line.startsWith('TEL'))
                    .map((line) => line.split(':')[1].trim());
                createDownloadButton(`${baseName}.txt`, numbers.join('\n'));

            } else if (['xlsx', 'xlsm'].includes(fileType)) {
                processExcel(file, baseName);

            } else if (fileType === 'docx') {
                processDocx(file, baseName);

            } else {
                alert(`Format file ${fileType} tidak didukung.`);
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

function processExcel(file, baseName) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        workbook.SheetNames.forEach((sheetName) => {
            const sheet = workbook.Sheets[sheetName];
            const range = XLSX.utils.decode_range(sheet['!ref']); // Mendapatkan range data di sheet

            let hasData = false; // Flag untuk cek jika kolom memiliki data

            // Untuk setiap kolom dalam sheet, kita akan membuat file terpisah
            for (let colIndex = range.s.c; colIndex <= range.e.c; colIndex++) {
                const colLetter = XLSX.utils.encode_col(colIndex); // Mendapatkan nama kolom (A, B, C, ...)
                const columnData = [];

                // Ambil data dari kolom
                for (let rowIndex = range.s.r; rowIndex <= range.e.r; rowIndex++) {
                    const cell = sheet[XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })];
                    if (cell && cell.v !== undefined) {
                        columnData.push(cell.v);
                    }
                }

                // Jika kolom memiliki data, buat file dan tombol download
                if (columnData.length > 0) {
                    const fileContent = columnData.join('\n');
                    const fileName = `${baseName}_${sheetName}_Kolom_${colLetter}.txt`;

                    // Buat tombol untuk mendownload file yang baru
                    createDownloadButton(fileName, fileContent);
                    hasData = true; // Menandakan ada kolom dengan data
                }
            }

            // Jika tidak ada kolom yang memiliki data, jangan tampilkan tombol download
            if (!hasData) {
                console.log(`Sheet "${sheetName}" tidak memiliki data untuk dikonversi.`);
            }
        });
    };
    reader.readAsArrayBuffer(file);
}

function processDocx(file, baseName) {
    const reader = new FileReader();
    reader.onload = function (event) {
        mammoth
            .extractRawText({ arrayBuffer: event.target.result })
            .then((result) => {
                const fileName = `${baseName}.txt`;
                createDownloadButton(fileName, result.value.trim());
            })
            .catch((err) => console.error(err));
    };
    reader.readAsArrayBuffer(file);
}
