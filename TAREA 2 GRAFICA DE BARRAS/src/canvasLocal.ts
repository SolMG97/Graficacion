export class CanvasLocal {
 
  protected graphics: CanvasRenderingContext2D; 
  protected rWidth: number; 
  protected rHeight: number; 
  protected maxX: number; 
  protected maxY: number; 
  protected pixelSize: number; 
  protected centerX: number; 
  protected centerY: number; 
  protected fontSize: number; 
      
  public constructor(g: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    this.graphics = g; 
    this.rWidth = 12; // ancho lógico del área de dibujo
    this.rHeight = 8; // altura lógica del área de dibujo
    this.maxX = canvas.width - 1; 
    this.maxY = canvas.height - 1; 
    this.pixelSize = Math.max(this.rWidth / this.maxX, this.rHeight / this.maxY); // Calculo el tamaño de un píxel lógico
    this.centerX = this.maxX / 12; // Calculo el centro lógico en X
    this.centerY = (this.maxY / 8) * 7; // Calculo el centro lógico en Y
    this.fontSize = 18; // esto es para definir el tamaño de las letras y mis numeros 
  }

  iX(x: number): number {
    return Math.round(this.centerX + x / this.pixelSize); // Convierto coordenadas lógicas a píxeles en X
  }

  iY(y: number): number {
    return Math.round(this.centerY - y / this.pixelSize); // Convierto coordenadas lógicas a píxeles en Y
  }

  drawLine(x1: number, y1: number, x2: number, y2: number): void { 
    this.graphics.beginPath(); // Inicio el trazo de una línea
    this.graphics.moveTo(x1, y1); // Muevo el lápiz al punto inicial
    this.graphics.lineTo(x2, y2); // Dibujo una línea hasta el punto final
    this.graphics.closePath(); // Cierro el trazo
    this.graphics.stroke(); // Dibujo la línea en el canvas
  }

  maxH(h: number[]): number {
    let max = Math.max(...h); // Encuentro el valor más alto en el arreglo
    let pot = 10;

    while (pot < max) {
      pot *= 10; // Ajusto la potencia de 10 para redondear
    }
    pot /= 10;

    return Math.ceil(max / pot) * pot; // Redondeo el máximo a la escala más cercana
  }

  miColor(color: string, percent: number): string {
    const colorValues: Record<string, string> = {
      'limegreen': 'rgb(73, 173, 73)',     
      'hotpink': 'rgb(178, 31, 80)',  
      'orange': 'rgb(194, 108, 4)',     
      'turquoise': 'rgb(5, 151, 170)',  
      'lightgray': 'rgb(128, 128, 128)' 
    };
    
    return colorValues[color.toLowerCase()] || color; // Devuelvo el color correspondiente o el original
  }

  pintar(
    x1: number, y1: number, x2: number, y2: number, 
    x3: number, y3: number, x4: number, y4: number, //son las coordenadas de los cuatro puntos que forman el polígono.
    color: string, strokeColor: string 
  ): void {
    const rellenoStryleActual = this.graphics.fillStyle; // Guardo el color de relleno actual
    const trazoStryleActual = this.graphics.strokeStyle; // Guardo el color de trazo actual
    
    this.graphics.fillStyle = color;  // Cambio al nuevo color de relleno
    this.graphics.strokeStyle = strokeColor; // Cambio al nuevo color de trazo
    
    this.graphics.beginPath(); // Inicio el trazo de un polígono
    this.graphics.moveTo(x1, y1); // Muevo al primer punto
    this.graphics.lineTo(x2, y2); // Trazo al segundo punto
    this.graphics.lineTo(x3, y3); // Trazo al tercer punto
    this.graphics.lineTo(x4, y4); // Trazo al cuarto punto
    this.graphics.closePath(); // Cierro el polígono
    this.graphics.fill(); // Relleno el polígono
    this.graphics.stroke(); // Dibujo el contorno del polígono

    this.graphics.fillStyle = rellenoStryleActual; // Restaura el color de relleno original
    this.graphics.strokeStyle = trazoStryleActual; // Restaura el color de trazo original
  }

  grafiBarra(x: number, y: number, alt: number, color: string, porcentaje: number): void {
    /*Este método calcula los vertices para definir las caras de la barra 
    y luego las dibuja utilizando el método pintar.*/
    const p1 = {x: this.iX(x), y: this.iY(0)}; 
    const p2 = {x: this.iX(x - 0.5), y: this.iY(y + 0.3)}; 
    const p3 = {x: this.iX(x - 0.5), y: this.iY(y + alt)}; 
    const p4 = {x: this.iX(x), y: this.iY(y + alt - 0.3)}; 
    const p5 = {x: this.iX(x + 0.5), y: this.iY(y + alt)}; 
    const p6 = {x: this.iX(x + 0.5), y: this.iY(0.3)}; 
    const p7 = {x: this.iX(x - 0.5), y: this.iY(this.rHeight - 1)};
    const p8 = {x: this.iX(x), y: this.iY(this.rHeight - 0.7)};
    const p9 = {x: this.iX(x + 0.5), y: this.iY(this.rHeight - 1)};
    const p10 = {x: this.iX(x), y: this.iY(this.rHeight - 1.3)};

    this.pintar(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y, this.miColor(color, 30), 'rgba(200, 200, 200, 0.5)'); // Pinto la cara frontal
    this.pintar(p1.x, p1.y, p4.x, p4.y, p5.x, p5.y, p6.x, p6.y, color, color); // Pinto la cara superior
    this.pintar(p3.x, p3.y, p4.x, p4.y, p9.x, p9.y, p7.x, p7.y, 'rgb(128, 128, 128)', 'rgba(200, 200, 200, 0.5)'); // Pinto la cara lateral
    this.pintar(p4.x, p4.y, p10.x, p10.y, p9.x, p9.y, p5.x, p5.y, 'white', 'rgba(200, 200, 200, 0.5)');

    const quintaAreaColor = porcentaje === 100 ? this.miColor(color, 30) : 'lightgray';
    this.pintar(p7.x, p7.y, p8.x, p8.y, p9.x, p9.y, p10.x, p10.y, quintaAreaColor, 'rgba(200, 200, 200, 0.5)');
  }

  Area(): void {
    const actualStyle = this.graphics.strokeStyle; // Guardo el estilo de trazo actual
    const actualStyleLinea = this.graphics.lineWidth; // Guardo el grosor de línea actual
    
    this.graphics.strokeStyle = 'rgba(180, 180, 180, 0.7)'; // Cambio a un color gris claro para las líneas de la cuadrícula
    this.graphics.lineWidth = 1; // Defino el grosor de las líneas de la cuadrícula
    
    for (let x = -0.2; x <= this.rWidth - 2; x += 1) { 
      this.drawLine(this.iX(x), this.iY(0), this.iX(x), this.iY(this.rHeight - 1)); // Dibujo líneas verticales
    }
    
    for (let y = 0; y <= this.rHeight - 1; y += 1) { 
      this.drawLine(this.iX(0), this.iY(y), this.iX(this.rWidth - 2), this.iY(y)); // Dibujo líneas horizontales
    }

    this.graphics.strokeStyle = actualStyle; // Restaura el estilo de trazo original
    this.graphics.lineWidth = actualStyleLinea; // Restaura el grosor de línea original
  }

  paint(): void {
    this.graphics.strokeStyle = 'gray'; // Defino el color de las líneas principales
    this.graphics.lineWidth = 1.5; // Defino el grosor de las líneas principales

    const ejeXPosY = this.iY(0) + 10; // Calculo la posición del eje X en píxeles
    this.drawLine(this.iX(0), ejeXPosY, this.iX(this.rWidth - 2), ejeXPosY); // Dibujo el eje X
    this.drawLine(this.iX(0), ejeXPosY, this.iX(0), this.iY(this.rHeight - 1)); // Dibujo el eje Y

    this.graphics.beginPath(); // Inicio el trazo de la flecha del eje X
    this.graphics.moveTo(this.iX(this.rWidth - 2), ejeXPosY); // Muevo al punto final del eje X
    this.graphics.lineTo(this.iX(this.rWidth - 2) - 10, ejeXPosY - 5); // Dibujo el lado superior de la flecha
    this.graphics.lineTo(this.iX(this.rWidth - 2) - 10, ejeXPosY + 5); // Dibujo el lado inferior de la flecha
    this.graphics.closePath(); // Cierro el trazo de la flecha
    this.graphics.fill(); // Relleno la flecha del eje X

    this.graphics.beginPath(); // Inicio el trazo de la flecha del eje Y
    this.graphics.moveTo(this.iX(0), this.iY(this.rHeight - 1)); // Muevo al punto final del eje Y
    this.graphics.lineTo(this.iX(0) - 5, this.iY(this.rHeight - 1) + 10); // Dibujo el lado izquierdo de la flecha
    this.graphics.lineTo(this.iX(0) + 5, this.iY(this.rHeight - 1) + 10); // Dibujo el lado derecho de la flecha
    this.graphics.closePath(); // Cierro el trazo de la flecha
    this.graphics.fill(); // Relleno la flecha del eje Y

    this.graphics.fillStyle = 'red'; 
    this.graphics.font = `${this.fontSize}px Arial`; 

    this.graphics.fillText('Y', this.iX(0) - 5, this.iY(this.rHeight - 1) - 15); // Escribo la etiqueta del eje Y
    this.graphics.fillText('X', this.iX(this.rWidth - 2) + 10, ejeXPosY + 5); // Escribo la etiqueta del eje X

    const h = [1150, 1780, 860, 1260]; // Defino las alturas de las barras
    const colors = ['turquoise', 'limegreen', 'hotpink', 'orange']; 
    const porcentajes = [10, 30, 80, 50]; // porcentajes de las barras

    const maxEsc = this.maxH(h); // Calculo el valor máximo ajustado para la escala
    const fuenteActual = this.graphics.font; // Guardo la fuente actual para restaurarla después

    const totalBarras = h.length; // Calculo el número total de barras
    const anchoDisponible = this.rWidth - 2; // Calculo el ancho disponible para las barras
    const anchoBarra = 1; // Defino el ancho de cada barra
    const separacion = (anchoDisponible - (totalBarras * anchoBarra)) / (totalBarras + 1); // Calculo la separación entre las barras

    for (let i = 0; i < totalBarras; i++) {
        const x = separacion + i * (anchoBarra + separacion); // Calculo la posición X de cada barra
        this.graphics.strokeStyle = 'lightgray'; // Defino el color del contorno de las barras
        const porcentaje = porcentajes[i]; // Obtengo el porcentaje de la barra actual

        this.graphics.fillStyle = colors[i % 4]; // Asigno el color correspondiente a la barra
        this.graphics.font = `bold ${this.fontSize + 2}px Arial`; // Aumento el tamaño de la fuente
        this.graphics.fillText(
            `${Math.round(porcentaje)}%`, 
            this.iX(x + (anchoBarra / 2) - 0.3), // Calculo la posición X del texto
            this.iY(-0.8) // Calculo la posición Y del texto
        );

        this.grafiBarra(
            x + anchoBarra / 2, // Posición X de la barra
            0, // Posición Y inicial de la barra
            (porcentaje / 100) * (this.rHeight - 1), // Altura de la barra basada en el porcentaje
            colors[i % 4], // Color de la barra
            porcentaje // Porcentaje de la barra
        );
    }

    this.graphics.font = fuenteActual; // Restaura la fuente original
}
}