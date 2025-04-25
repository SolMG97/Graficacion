<template>
  <div class="container">
    <div class="input-container">
      <input v-model="text" type="text" placeholder="Ingrese una URL o un texto" class="textfield" />
      <button @click="generateQRCode" class="button">Generar QR</button>
    </div>
    <canvas ref="qrCanvas" class="canvas"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import "./index.css"; // Importo los estilos CSS

export default defineComponent({
  name: "IndexPage",
  setup() {
    const text = ref(""); // almacena el texto que el usuario ingresa
    const qrCanvas = ref<HTMLCanvasElement | null>(null); // Referencia al canvas donde dibujo el QR

    const generateQRCode = () => {
      if (!qrCanvas.value) return; // Si no hay canvas, no hace nada

      const canvas = qrCanvas.value;
      const ctx = canvas.getContext("2d");
      if (!ctx) return; 

      const size = 200; // Tamaño del QR en el canvas
      canvas.width = size;
      canvas.height = size;

      const data = text.value; // Obtengo el texto ingresado
      const modules = generateQRMatrix(data); // Genero la matriz del QR

      const moduleSize = size / modules.length; // Tamaño de cada módulo del QR

      // Fondo negro del QR
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, size, size);

      // Dibujo los módulos del QR
      modules.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          const x = colIndex * moduleSize;
          const y = rowIndex * moduleSize;

          if (!cell) {
            ctx.fillStyle = "#fff"; // Módulos blancos
            ctx.fillRect(x, y, moduleSize, moduleSize);
          } else {
            ctx.fillStyle = "#000"; // Módulos negros
            ctx.fillRect(x, y, moduleSize, moduleSize);
          }
        });
      });

      // Dibujo las líneas de la cuadrícula para guiarme y rellenar 
      ctx.strokeStyle = "  #8b8d76  "; 
      ctx.lineWidth = 0.1;
      modules.forEach((row, rowIndex) => {//para recorrer filas y columnas de la matriz
        row.forEach((_, colIndex) => {
          const x = colIndex * moduleSize;
          const y = rowIndex * moduleSize;
          ctx.strokeRect(x, y, moduleSize, moduleSize);//esto se usa para dibujar las líneas de la cuadrícula
        });
      });
    };

    const generateQRMatrix = (data: string): number[][] => {
      const size = 25; // Tamaño fijo de la matriz del QR
      const matrix = Array.from({ length: size }, () => Array(size).fill(0)); // Inicializo la matriz vacía

      // Agrego los patrones de posición
      addFinderPattern(matrix, 0, 0);
      addFinderPattern(matrix, 0, size - 7);
      addFinderPattern(matrix, size - 7, 0);

      // Agrego los separadores
      addSeparator(matrix, 0, 0);
      addSeparator(matrix, 0, size - 7);
      addSeparator(matrix, size - 7, 0);

      // Agrego los patrones de temporización
      addTimingPatterns(matrix);

      // Agrego el cuadro pequeño
      addSmallSquare(matrix, size - 9, size - 9);

      // Agrego un píxel fijo que es especial que aparece en todos los QR
      matrix[17][8] = 1;

      // Codifico el texto en bits
      const bitStream = stringToBits(data);

      // Inserto los bits en la matriz siguiendo el patrón zigzag
      let bitIndex = 0;
      for (let col = size - 1; col > 0; col -= 2) {
        if (col === 6) col--; // Salto la columna de temporización

        for (let row = size - 1; row >= 0; row--) { //Recorre las filas de la matriz desde la última fila
          for (let offset = 0; offset < 2; offset++) {/*Recorre dos columnas a la vez (una columna y su columna adyacente a la izquierda)
            el bit mas significativo a la derecha y el menos significativo a la izquierda*/
            const currentCol = col - offset;
            if (
              currentCol >= 0 &&
              matrix[row][currentCol] === 0 &&
              !isInReservedArea(row, currentCol, size) &&
              !isInSmallSquare(row, currentCol, size)
            ) {
              matrix[row][currentCol] =
                bitIndex < bitStream.length ? parseInt(bitStream[bitIndex++], 10) : 0;
            }
          }
        }
      }

      return matrix; // Devuelvo la matriz del QR
    };

    const stringToBits = (data: string): string[] => {
      // Convierto el texto a su representación binaria en ASCII
      return data
        .split("") //Divide la cadena en un arreglo de caracteres, por ejemplo "hola" ["h", "o", "l", "a"]
        .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))//segura que todos los binarios tengan 8 bits 
        .join("") // Une todos los binarios en una sola cadena
        .split("");
    };

    const isInReservedArea = (row: number, col: number, size: number): boolean => {
      // Verifico si la celda está en un área reservada
      const inTopLeft = row < 8 && col < 8;
      const inTopRight = row < 8 && col >= size - 8;
      const inBottomLeft = row >= size - 8 && col < 8;
      return inTopLeft || inTopRight || inBottomLeft;
    };

    const isInSmallSquare = (row: number, col: number, size: number): boolean => {
      const startRow = size - 9;
      const startCol = size - 9;
      return row >= startRow && row < startRow + 5 && col >= startCol && col < startCol + 5;
    };

    const addFinderPattern = (matrix: number[][], row: number, col: number) => {
      // Agrego un patrón de posición
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (
            i === 0 || i === 6 || j === 0 || j === 6 || // Bordes exteriores
            (i >= 2 && i <= 4 && j >= 2 && j <= 4) // Cuadrado interno
          ) {
            matrix[row + i][col + j] = 1;
          }
        }
      }
    };

    const addSeparator = (matrix: number[][], row: number, col: number) => {
      // Agrego un separador alrededor de un patrón de posición
      for (let i = -1; i <= 7; i++) {
        for (let j = -1; j <= 7; j++) {
          if (
            row + i >= 0 &&
            row + i < matrix.length &&
            col + j >= 0 &&
            col + j < matrix.length &&
            (i === -1 || i === 7 || j === -1 || j === 7)
          ) {
            matrix[row + i][col + j] = 0;
          }
        }
      }
    };

    const addTimingPatterns = (matrix: number[][]) => {
      // Agrego los patrones de temporización
      const size = matrix.length;
      for (let i = 8; i < size - 8; i++) {
        if (matrix[6][i] === 0) matrix[6][i] = i % 2 === 0 ? 1 : 0; // Horizontal
        if (matrix[i][6] === 0) matrix[i][6] = i % 2 === 0 ? 1 : 0; // Vertical
      }
    };

    const addSmallSquare = (matrix: number[][], row: number, col: number) => {
      // Agrego el cuadro pequeño
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          if (
            i === 0 || i === 4 || j === 0 || j === 4 || // Bordes exteriores
            (i === 2 && j === 2) // Centro negro
          ) {
            matrix[row + i][col + j] = 1;
          }
        }
      }
    };

    return {
      text,
      qrCanvas,
      generateQRCode,
    };
  },
});
</script>

