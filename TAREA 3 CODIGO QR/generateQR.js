function generateQR(input) {
    const canvasSize = 21; // Tamaño del "QR"
    const qrMatrix = Array.from({ length: canvasSize }, () =>
        Array.from({ length: canvasSize }, () => Math.random() > 0.5 ? 1 : 0)
    );

    // Agregar patrones de detección (esquinas)
    const addFinderPattern = (x, y) => {
        for (let i = -1; i <= 7; i++) {
            for (let j = -1; j <= 7; j++) {
                const isBorder = i === -1 || i === 7 || j === -1 || j === 7;
                const isInner = i >= 2 && i <= 4 && j >= 2 && j <= 4;
                if (x + i >= 0 && x + i < canvasSize && y + j >= 0 && y + j < canvasSize) {
                    qrMatrix[x + i][y + j] = isBorder || isInner ? 1 : 0;
                }
            }
        }
    };

    addFinderPattern(0, 0); // Esquina superior izquierda
    addFinderPattern(0, canvasSize - 8); // Esquina superior derecha
    addFinderPattern(canvasSize - 8, 0); // Esquina inferior izquierda

    // Convertir la matriz en un string visual
    return qrMatrix.map(row => row.map(cell => (cell ? "█" : " ")).join("")).join("\n");
}

// Ejemplo de uso
console.log(generateQR("Texto de ejemplo"));
