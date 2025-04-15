export class CanvasLocal {
  // Atributos
  protected graphics: CanvasRenderingContext2D;
  protected rWidth: number;
  protected rHeight: number;
  protected maxX: number;
  protected maxY: number;
  protected pixelSize: number;
  protected centerX: number;
  protected centerY: number;

  public constructor(g: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    this.graphics = g;
    this.rWidth = 6;
    this.rHeight = 4;
    this.maxX = canvas.width - 1;
    this.maxY = canvas.height - 1;
    this.pixelSize = Math.max(this.rWidth / this.maxX, this.rHeight / this.maxY);
    this.centerX = this.maxX / 2;
    this.centerY = this.maxY / 2;
  }

  protected drawLine(x1: number, y1: number, x2: number, y2: number) {
    this.graphics.beginPath();
    this.graphics.moveTo(x1, y1);
    this.graphics.lineTo(x2, y2);
    this.graphics.closePath();
    this.graphics.stroke();
  }

  public paint() {
    
    // Parámetros del cuadrado que contiene los puntos
    let lado = 450;
    let side = 0.95 * lado;
    let sideHalf = 0.5 * side;
    let xCenter = 320;
    let yCenter = 240;

    // Coordenadas iniciales 
    let xA = xCenter - sideHalf;
    let yA = yCenter - sideHalf;
    let xB = xCenter + sideHalf;
    let yB = yCenter - sideHalf;
    let xC = xCenter + sideHalf;
    let yC = yCenter + sideHalf;
    let xD = xCenter - sideHalf;
    let yD = yCenter + sideHalf;

    let q = 0.05;
    let p = 1 - q;

    for (let i = 0; i < 20; i++) {
      // para cada iteracion
      this.drawLine(xA, yA, xB, yB);
      this.drawLine(xB, yB, xC, yC);
      this.drawLine(xC, yC, xD, yD);
      this.drawLine(xD, yD, xA, yA);

      // se calculan nuevos puntos
      let xA1 = p * xA + q * xB;
      let yA1 = p * yA + q * yB;
      let xB1 = p * xB + q * xC;
      let yB1 = p * yB + q * yC;
      let xC1 = p * xC + q * xD;
      let yC1 = p * yC + q * yD;
      let xD1 = p * xD + q * xA;
      let yD1 = p * yD + q * yA;
      
      xA = xA1; xB = xB1; xC = xC1; xD = xD1; yA = yA1; yB = yB1; yC = yC1; yD = yD1;
    }
  }
}
