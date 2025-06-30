import { Point3D } from './Point3D.js';
import { Point2D } from './Point2D.js';
import { Obj3D } from './Obj3D.js';
import { Rota3D } from './Rota3D.js';

class Punto3D {
    constructor(public x: number, public y: number, public z: number) {}
    
    // Rotación alrededor del eje X
    rotarX(angulo: number): Punto3D {
        const cos = Math.cos(angulo);
        const sin = Math.sin(angulo);
        return new Punto3D(
            this.x,
            this.y * cos - this.z * sin,
            this.y * sin + this.z * cos
        );
    }
    
    // Rotación alrededor del eje Y
    rotarY(angulo: number): Punto3D {
        const cos = Math.cos(angulo);
        const sin = Math.sin(angulo);
        return new Punto3D(
            this.x * cos + this.z * sin,
            this.y,
            -this.x * sin + this.z * cos
        );
    }
    
    // Rotación alrededor del eje Z
    rotarZ(angulo: number): Punto3D {
        const cos = Math.cos(angulo);
        const sin = Math.sin(angulo);
        return new Punto3D(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos,
            this.z
        );
    }
    
    // Proyección a 2D
    proyectar(distancia: number, centroX: number, centroY: number, zoom: number): {x: number, y: number} {
        const escala = (distancia / (distancia + this.z)) * zoom;
        return {
            x: centroX + this.x * escala,
            y: centroY - this.y * escala
        };
    }
}

class Cara {
    constructor(public vertices: number[], public color: string) {}
}

// Clase principal del destornillador 
class DestornilladorElectrico3DES {
    protected canvas: HTMLCanvasElement;
    protected ctx: CanvasRenderingContext2D;
    private vertices: Punto3D[] = [];
    private caras: Cara[] = [];
    private rotacionX = 20;
    private rotacionY = 30;
    private rotacionZ = 0;
    private zoom = 1;
    private animando = false;
    private frameAnimacion = 0;
    private desplazamientoGatillo = -5;
    private gatilloPresionado = false;
    private indicesGatillo: number[] = [];
    private indicesPunta: number[] = [];
    private anguloPunta: number = 0;
    private indicesChuck: number[] = [];
    private anguloChuck: number = 0;
    private encendido: boolean = false;
    private idGiro: number | null = null;
    
    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        // Configuración inicial para ver el destornillador 
        this.rotacionX = 0;  // Vista frontal
        this.rotacionY = 0;  // Sin rotación lateral
        this.rotacionZ = 0;  // Sin inclinación
        this.zoom = 0.65;     // Zoom ajustado para ver la figura más pequeña
        this.inicializarGeometria();
        this.escalarYCentrarModelo(); 
        this.configurarControles();
        this.renderizar();
    }
    
    private inicializarGeometria(): void {
        this.vertices = [];
        this.caras = [];
        
        // Crear la geometría del destornillador eléctrico piezas
        this.crearCuerpoAmarilloNaranja();
        this.crearMangoNegroTexturizado();
        this.crearChuckNegro();
        this.crearPuntaMetalica();
        this.crearGatilloRojo();
        this.crearBaseCubica3D();
        this.crearDetallesModelo();
        this.crearTapasCompletas();
    }
    
    private crearCuerpoAmarilloNaranja(): void {
        const indiceInicio = this.vertices.length;
        const segmentos = 24;
        const longitud = 160;
        // Crear el cuerpo horizontal 
        for (let i = 0; i <= segmentos; i++) {
            for (let j = 0; j <= 14; j++) {
                const angulo = (i / segmentos) * Math.PI * 2;
                const x = -80 + (j / 14) * longitud;
                // Forma más complejas del cuerpo
                let radio = 32;
                if (j < 2) radio = 28; // Parte trasera
                else if (j < 4) radio = 30 + j * 1; // Crecimiento inicial
                else if (j < 6) radio = 34; // Sección de la batería integrada
                else if (j < 9) radio = 36; // Cuerpo principal más ancho
                else if (j < 11) radio = 34; // Reducción gradual
                else if (j < 13) radio = 30; // Hacia el chuck
                else radio = 26; // Conexión con chuck
                const y = Math.cos(angulo) * radio;
                const z = Math.sin(angulo) * radio;
                this.vertices.push(new Punto3D(x, y, z));
            }
        }
        // Caras del cuerpo con amarillo/naranja vibrante
        for (let i = 0; i < segmentos; i++) {
            for (let j = 0; j < 14; j++) {
                const actual = indiceInicio + i * 15 + j;
                const siguiente = indiceInicio + ((i + 1) % (segmentos + 1)) * 15 + j;
                // Colores amarillo DeWalt exactos de la imagen de referencia
                let color;
                if (j < 3) {
                    color = 'rgb(234, 176, 1)';
                } else if (j < 8) {
                    color = 'rgb(240, 196, 0)';
                } else if (j < 11) {
                    color = 'rgb(218, 188, 13)';
                } else {
                    color = 'rgb(255, 220, 50)';
                }
                this.caras.push(new Cara([actual, siguiente, siguiente + 1, actual + 1], color));
            }
        }
    }
    
    private crearMangoNegroTexturizado(): void {
        const indiceInicio = this.vertices.length;
        const segmentos = 18;
        const altura = 100;
        
        // Crear mango negro 
        for (let i = 0; i <= segmentos; i++) {
            for (let j = 0; j <= 12; j++) {
                const angulo = (i / segmentos) * Math.PI * 2;
                const y = -15 - (j / 12) * altura;
                const x = -20; // Posición en el cuerpo
                
                // Forma ergonómica del mango
                let radio = 16;
                if (j < 2) radio = 28; // Conexión con el cuerpo
                else if (j < 4) radio = 20; // Transición
                else if (j < 8) radio = 18; // Agarre principal
                else if (j < 10) radio = 16; // Parte estrecha
                else radio = 14; // Parte inferior
                
                const localX = Math.cos(angulo) * radio;
                const z = Math.sin(angulo) * radio;
                
                this.vertices.push(new Punto3D(x + localX, y, z));
            }
        }
        
        // Caras del mango negro con textura
        for (let i = 0; i < segmentos; i++) {
            for (let j = 0; j < 12; j++) {
                const actual = indiceInicio + i * 13 + j;
                const siguiente = indiceInicio + ((i + 1) % (segmentos + 1)) * 13 + j;
                
                // Negro DeWalt exacto como en la imagen de referencia
                let color;
                if (j < 3) {
                    color = 'rgb(54, 53, 53)'; // Conexión - negro grisáceo
                } else if (j < 8) {
                    // Agarre principal - negro DeWalt uniforme
                    color = 'rgb(30, 30, 30)';
                } else {
                    color = 'rgb(20, 20, 20)'; // Negro muy oscuro
                }
                
                this.caras.push(new Cara([actual, siguiente, siguiente + 1, actual + 1], color));
            }
        }
    }
    
    private crearChuckNegro(): void {
        const indiceInicio = this.vertices.length;
        const segmentos = 16;
        const longitud = 30;
        
        // Chuck negro
        for (let i = 0; i <= segmentos; i++) {
            for (let j = 0; j <= 8; j++) {
                const angulo = (i / segmentos) * Math.PI * 2;
                const x = 80 + (j / 8) * longitud;
                
                let radio = 26;
                if (j < 2) radio = 26; // Conexión del cuerpo
                else if (j < 4) radio = 24; // Transición
                else if (j < 6) radio = 22; // Cuerpo del chuck
                else radio = 20; // Hacia la punta
                
                // Textura estriada del chuck
                if (j >= 2 && j <= 5) {
                    radio += Math.sin(angulo * 8) * 1.2;
                }
                
                const y = Math.cos(angulo) * radio;
                const z = Math.sin(angulo) * radio;
                
                this.vertices.push(new Punto3D(x, y, z));
            }
        }
        
        const totalVertices = (segmentos + 1) * (8 + 1);
        this.indicesChuck = [];
        for (let i = 0; i < totalVertices; i++) {
            this.indicesChuck.push(indiceInicio + i);
        }
        
        // Caras del chuck negro
        for (let i = 0; i < segmentos; i++) {
            for (let j = 0; j < 8; j++) {
                const actual = indiceInicio + i * 9 + j;
                const siguiente = indiceInicio + ((i + 1) % (segmentos + 1)) * 9 + j;

                let color;
                if (j < 2) {
                    color = 'rgb(51, 50, 50)';
                } else if (j < 6) {
                
                    color = 'rgb(25, 25, 25)';
                } else {
                    color = 'rgb(15, 15, 15)';
                }
                
                this.caras.push(new Cara([actual, siguiente, siguiente + 1, actual + 1], color));
            }
        }
    }
    
    private crearPuntaMetalica(): void {
        const indiceInicio = this.vertices.length;
        const segmentos = 12;
        const longitud = 35;
        
        // Punta metálica plateada
        for (let i = 0; i <= segmentos; i++) {
            for (let j = 0; j <= 8; j++) {
                const angulo = (i / segmentos) * Math.PI * 2;
                const x = 110 + (j / 8) * longitud;
                
                let radio = 6;
                if (j < 2) radio = 18 - j * 6; 
                else if (j < 4) radio = 6; // Cuerpo de la broca
                else if (j > 6) radio = 6 - (j - 6) * 3; 
                
                const y = Math.cos(angulo) * radio;
                const z = Math.sin(angulo) * radio;
                
                this.vertices.push(new Punto3D(x, y, z));
            }
        }

        const totalVertices = (segmentos + 1) * (8 + 1);
        this.indicesPunta = [];
        for (let i = 0; i < totalVertices; i++) {
            this.indicesPunta.push(indiceInicio + i);
        }
        
        // Caras metálicas 
        for (let i = 0; i < segmentos; i++) {
            for (let j = 0; j < 8; j++) {
                const actual = indiceInicio + i * 9 + j;
                const siguiente = indiceInicio + ((i + 1) % (segmentos + 1)) * 9 + j;
                const color = 'rgb(192, 192, 192)';            
                this.caras.push(new Cara([actual, siguiente, siguiente + 1, actual + 1], color));
            }
        }
    }
    
    private crearGatilloRojo(): void {
        const indiceInicio = this.vertices.length;
        
        const ancho = 15; // eje Z
        const alto = 25;  // eje Y
        const grosor = 10; // eje X - AUMENTADO
        const xGatillo = -10; //  X (frontal)
        const xGatillo2 = xGatillo - grosor; // parte trasera del gatillo
        const ySup = -40; // parte superior del gatillo
        const yInf = ySup - alto; // parte inferior
        const zIzq = 6; // borde izquierdo (menor Z)
        const zDer = zIzq + ancho; // borde derecho (mayor Z)

        // Vértices principales del gatillo 
        const verticesGatillo = [
            // Cara frontal
            new Punto3D(xGatillo, ySup, zIzq),    
            new Punto3D(xGatillo, ySup, zDer),    
            new Punto3D(xGatillo, yInf, zDer),    
            new Punto3D(xGatillo, yInf, zIzq),   
            // Cara trasera
            new Punto3D(xGatillo2, ySup, zIzq),   
            new Punto3D(xGatillo2, ySup, zDer),   
            new Punto3D(xGatillo2, yInf, zDer),   
            new Punto3D(xGatillo2, yInf, zIzq)   
        ];
        verticesGatillo.forEach(v => this.vertices.push(v));

        // Cara principal (frontal, visible en vista Z)
        this.caras.push(new Cara([
            indiceInicio,    
            indiceInicio + 1, 
            indiceInicio + 2, 
            indiceInicio + 3  
        ], 'rgb(255, 0, 0)'));

        // Cara trasera
        this.caras.push(new Cara([
            indiceInicio + 4, 
            indiceInicio + 5, 
            indiceInicio + 6, 
            indiceInicio + 7  
        ], 'rgb(180, 0, 0)'));

        // Laterales Z (izquierdo y derecho)
        this.caras.push(new Cara([
            indiceInicio, indiceInicio + 3, indiceInicio + 7, indiceInicio + 4
        ], 'rgb(220, 0, 0)'));
        this.caras.push(new Cara([
            indiceInicio + 1, indiceInicio + 2, indiceInicio + 6, indiceInicio + 5
        ], 'rgb(200, 0, 0)'));

        // Laterales X (superior e inferior)
        this.caras.push(new Cara([
            indiceInicio, indiceInicio + 1, indiceInicio + 5, indiceInicio + 4
        ], 'rgb(200, 0, 0)'));
        this.caras.push(new Cara([
            indiceInicio + 3, indiceInicio + 2, indiceInicio + 6, indiceInicio + 7
        ], 'rgb(220, 0, 0)'));
        this.indicesGatillo = [];
        for (let i = 0; i < 8; i++) {
            this.indicesGatillo.push(indiceInicio + i);
        }
    }
    
    private crearBaseCubica3D(): void {
        // creacion de la base cúbica 3D
        this.crearCuerpoBasePrincipal();
        this.crearPlatafromaSuperior();
    }
    
    private crearCuerpoBasePrincipal(): void {
        const indiceInicio = this.vertices.length;
        const ancho = 90;  
        const largo = 70;  
        const alto = 50;   
        const x = -20;     
        const y = -115;    
        const nivel1Alto = 15;
        this.vertices.push(new Punto3D(x - ancho/2, y, -largo/2));
        this.vertices.push(new Punto3D(x + ancho/2, y, -largo/2));
        this.vertices.push(new Punto3D(x + ancho/2, y, largo/2));
        this.vertices.push(new Punto3D(x - ancho/2, y, largo/2));
        this.vertices.push(new Punto3D(x - ancho/2, y - nivel1Alto, -largo/2));
        this.vertices.push(new Punto3D(x + ancho/2, y - nivel1Alto, -largo/2));
        this.vertices.push(new Punto3D(x + ancho/2, y - nivel1Alto, largo/2));
        this.vertices.push(new Punto3D(x - ancho/2, y - nivel1Alto, largo/2));
        
        // Caras del nivel inferior
        this.caras.push(new Cara([indiceInicio, indiceInicio + 3, indiceInicio + 2, indiceInicio + 1], 'rgb(20, 20, 20)'));
        this.caras.push(new Cara([indiceInicio, indiceInicio + 1, indiceInicio + 5, indiceInicio + 4], 'rgb(25, 25, 25)'));
        this.caras.push(new Cara([indiceInicio + 1, indiceInicio + 2, indiceInicio + 6, indiceInicio + 5], 'rgb(30, 30, 30)'));
        this.caras.push(new Cara([indiceInicio + 2, indiceInicio + 3, indiceInicio + 7, indiceInicio + 6], 'rgb(25, 25, 25)'));
        this.caras.push(new Cara([indiceInicio + 3, indiceInicio, indiceInicio + 4, indiceInicio + 7], 'rgb(30, 30, 30)'));
        this.caras.push(new Cara([indiceInicio + 4, indiceInicio + 5, indiceInicio + 6, indiceInicio + 7], 'rgb(35, 35, 35)'));
        
        // Nivel medio (un poco más pequeño)
        const inicioNivel2 = this.vertices.length;
        const ancho2 = 80;
        const largo2 = 60;
        const nivel2Alto = 25;
        
        this.vertices.push(new Punto3D(x - ancho2/2, y - nivel1Alto, -largo2/2));
        this.vertices.push(new Punto3D(x + ancho2/2, y - nivel1Alto, -largo2/2));
        this.vertices.push(new Punto3D(x + ancho2/2, y - nivel1Alto, largo2/2));
        this.vertices.push(new Punto3D(x - ancho2/2, y - nivel1Alto, largo2/2));
        this.vertices.push(new Punto3D(x - ancho2/2, y - nivel1Alto - nivel2Alto, -largo2/2));
        this.vertices.push(new Punto3D(x + ancho2/2, y - nivel1Alto - nivel2Alto, -largo2/2));
        this.vertices.push(new Punto3D(x + ancho2/2, y - nivel1Alto - nivel2Alto, largo2/2));
        this.vertices.push(new Punto3D(x - ancho2/2, y - nivel1Alto - nivel2Alto, largo2/2));
        
        // Caras del nivel medio
        this.caras.push(new Cara([inicioNivel2, inicioNivel2 + 1, inicioNivel2 + 5, inicioNivel2 + 4], 'rgb(30, 30, 30)'));
        this.caras.push(new Cara([inicioNivel2 + 1, inicioNivel2 + 2, inicioNivel2 + 6, inicioNivel2 + 5], 'rgb(35, 35, 35)'));
        this.caras.push(new Cara([inicioNivel2 + 2, inicioNivel2 + 3, inicioNivel2 + 7, inicioNivel2 + 6], 'rgb(30, 30, 30)'));
        this.caras.push(new Cara([inicioNivel2 + 3, inicioNivel2, inicioNivel2 + 4, inicioNivel2 + 7], 'rgb(35, 35, 35)'));
        this.caras.push(new Cara([inicioNivel2 + 4, inicioNivel2 + 5, inicioNivel2 + 6, inicioNivel2 + 7], 'rgb(40, 40, 40)'));
        
        // Nivel superior (más pequeño)
        const inicioNivel3 = this.vertices.length;
        const ancho3 = 70;
        const largo3 = 50;
        const nivel3Alto = 10;
        
        this.vertices.push(new Punto3D(x - ancho3/2, y - nivel1Alto - nivel2Alto, -largo3/2));
        this.vertices.push(new Punto3D(x + ancho3/2, y - nivel1Alto - nivel2Alto, -largo3/2));
        this.vertices.push(new Punto3D(x + ancho3/2, y - nivel1Alto - nivel2Alto, largo3/2));
        this.vertices.push(new Punto3D(x - ancho3/2, y - nivel1Alto - nivel2Alto, largo3/2));
        this.vertices.push(new Punto3D(x - ancho3/2, y - alto, -largo3/2));
        this.vertices.push(new Punto3D(x + ancho3/2, y - alto, -largo3/2));
        this.vertices.push(new Punto3D(x + ancho3/2, y - alto, largo3/2));
        this.vertices.push(new Punto3D(x - ancho3/2, y - alto, largo3/2));
        
        // Caras del nivel superior
        this.caras.push(new Cara([inicioNivel3, inicioNivel3 + 1, inicioNivel3 + 5, inicioNivel3 + 4], 'rgb(35, 35, 35)'));
        this.caras.push(new Cara([inicioNivel3 + 1, inicioNivel3 + 2, inicioNivel3 + 6, inicioNivel3 + 5], 'rgb(40, 40, 40)'));
        this.caras.push(new Cara([inicioNivel3 + 2, inicioNivel3 + 3, inicioNivel3 + 7, inicioNivel3 + 6], 'rgb(35, 35, 35)'));
        this.caras.push(new Cara([inicioNivel3 + 3, inicioNivel3, inicioNivel3 + 4, inicioNivel3 + 7], 'rgb(40, 40, 40)'));
        this.caras.push(new Cara([inicioNivel3 + 4, inicioNivel3 + 5, inicioNivel3 + 6, inicioNivel3 + 7], 'rgb(45, 45, 45)'));
    }
    
    private crearPlatafromaSuperior(): void {
        const indiceInicio = this.vertices.length;
        const x = -20;
        const y = -165; 

        const plataformaVertices = [
            // Plataforma principal
            new Punto3D(x - 30, y, -20),
            new Punto3D(x + 30, y, -20),
            new Punto3D(x + 30, y + 5, 20),
            new Punto3D(x - 30, y + 5, 20),

            // Bordes elevados laterales
            new Punto3D(x - 35, y - 3, -25),
            new Punto3D(x - 30, y - 3, -25),
            new Punto3D(x - 30, y + 7, 25),
            new Punto3D(x - 35, y + 7, 25),

            new Punto3D(x + 30, y - 3, -25),
            new Punto3D(x + 35, y - 3, -25),
            new Punto3D(x + 35, y + 7, 25),
            new Punto3D(x + 30, y + 7, 25),

            // Borde trasero elevado
            new Punto3D(x - 35, y - 3, -30),
            new Punto3D(x + 35, y - 3, -30),
            new Punto3D(x + 35, y - 1, -25),
            new Punto3D(x - 35, y - 1, -25)
        ];
        plataformaVertices.forEach(v => this.vertices.push(v));
        
        // Caras de la plataforma principal
        this.caras.push(new Cara([indiceInicio, indiceInicio + 1, indiceInicio + 2, indiceInicio + 3], 'rgb(50, 50, 50)'));
        
        // Bordes laterales
        this.caras.push(new Cara([indiceInicio + 4, indiceInicio + 5, indiceInicio + 6, indiceInicio + 7], 'rgb(45, 45, 45)'));
        this.caras.push(new Cara([indiceInicio + 8, indiceInicio + 9, indiceInicio + 10, indiceInicio + 11], 'rgb(45, 45, 45)'));
        
        // Borde trasero
        this.caras.push(new Cara([indiceInicio + 12, indiceInicio + 13, indiceInicio + 14, indiceInicio + 15], 'rgb(40, 40, 40)'));
    }
    
    private crearSistemaVentilacion(): void {
        const indiceInicio = this.vertices.length;
        const x = -20;
        const y = -115;
        
        //Laterales del destornillador
        for (let lado = 0; lado < 2; lado++) {
            const offsetX = lado === 0 ? -40 : 40;
            for (let i = 0; i < 8; i++) {
                const offsetZ = -30 + (i * 8);
                const offsetY = -10 - (i * 3);

                this.vertices.push(new Punto3D(x + offsetX + 1, y + offsetY + 2, offsetZ));
                this.vertices.push(new Punto3D(x + offsetX - 1, y + offsetY + 2, offsetZ));
                this.vertices.push(new Punto3D(x + offsetX - 1, y + offsetY + 2, offsetZ + 6));
                this.vertices.push(new Punto3D(x + offsetX + 1, y + offsetY + 2, offsetZ + 6));

                this.vertices.push(new Punto3D(x + offsetX + 0.5, y + offsetY - 1, offsetZ + 0.5));
                this.vertices.push(new Punto3D(x + offsetX - 0.5, y + offsetY - 1, offsetZ + 0.5));
                this.vertices.push(new Punto3D(x + offsetX - 0.5, y + offsetY - 1, offsetZ + 5.5));
                this.vertices.push(new Punto3D(x + offsetX + 0.5, y + offsetY - 1, offsetZ + 5.5));
                
                const baseIndice = indiceInicio + (lado * 8 + i) * 8;
                this.caras.push(new Cara([baseIndice, baseIndice + 1, baseIndice + 2, baseIndice + 3], 'rgb(25, 25, 25)'));
                this.caras.push(new Cara([baseIndice + 4, baseIndice + 5, baseIndice + 6, baseIndice + 7], 'rgb(5, 5, 5)'));

                this.caras.push(new Cara([baseIndice, baseIndice + 4, baseIndice + 5, baseIndice + 1], 'rgb(15, 15, 15)'));
                this.caras.push(new Cara([baseIndice + 1, baseIndice + 5, baseIndice + 6, baseIndice + 2], 'rgb(15, 15, 15)'));
                this.caras.push(new Cara([baseIndice + 2, baseIndice + 6, baseIndice + 7, baseIndice + 3], 'rgb(15, 15, 15)'));
                this.caras.push(new Cara([baseIndice + 3, baseIndice + 7, baseIndice + 4, baseIndice], 'rgb(15, 15, 15)'));
            }
        }
        for (let esquina = 0; esquina < 4; esquina++) {
            const xEsq = esquina < 2 ? x - 35 : x + 35;
            const zEsq = (esquina % 2 === 0) ? -25 : 25;
            
            for (let i = 0; i < 3; i++) {
                const offsetY = y - 20 - (i * 8);
                
                this.vertices.push(new Punto3D(xEsq, offsetY, zEsq));
                this.vertices.push(new Punto3D(xEsq + 3, offsetY, zEsq + 3));
                this.vertices.push(new Punto3D(xEsq + 3, offsetY - 2, zEsq + 3));
                this.vertices.push(new Punto3D(xEsq, offsetY - 2, zEsq));
                
                const baseIndice = indiceInicio + (2 * 8 * 8) + (esquina * 3 + i) * 4;
                this.caras.push(new Cara([baseIndice, baseIndice + 1, baseIndice + 2, baseIndice + 3], 'rgb(10, 10, 10)'));
            }
        }
    }
    
    private crearBordesRedondeados(): void {
        const indiceInicio = this.vertices.length;
        const x = -20;
        const y = -115;
        const segmentos = 8;
        
        // Arista redondeada frontal
        const radio = 4;
        
        // Borde frontal redondeado
        for (let i = 0; i <= segmentos; i++) {
            const angulo = (i / segmentos) * Math.PI / 2;
            const xPos = x + 35 + Math.cos(angulo) * radio;
            const yPos = y - Math.sin(angulo) * radio;
            
            for (let j = 0; j < 3; j++) {
                const zPos = -30 + (j * 30);
                this.vertices.push(new Punto3D(xPos, yPos, zPos));
            }
        }
        
        // Crear caras para los bordes redondeados
        for (let i = 0; i < segmentos; i++) {
            for (let j = 0; j < 2; j++) {
                const actual = indiceInicio + i * 3 + j;
                const siguiente = indiceInicio + (i + 1) * 3 + j;
                
                this.caras.push(new Cara([actual, siguiente, siguiente + 1, actual + 1], 'rgb(40, 40, 40)'));
            }
        }
    }
    
      private crearPiesDeApoyo(): void {
        const indiceInicio = this.vertices.length;
        const x = -20;
        const y = -115;

        const posicionesPies = [
            [x - 40, y + 5, -30],
            [x + 40, y + 5, -30],
            [x + 40, y + 5, 30],
            [x - 40, y + 5, 30]
        ];
        
        posicionesPies.forEach(([px, py, pz], index) => {
            const inicioPie = this.vertices.length;
            
            // Pie cilíndrico con superficie 
            const segmentos = 8;
            const radio = 6;
            const altura = 8;
            
            // Centro superior
            this.vertices.push(new Punto3D(px, py - altura, pz));
            
            // Centro inferior
            this.vertices.push(new Punto3D(px, py, pz));
            
            // Perímetro superior
            for (let i = 0; i <= segmentos; i++) {
                const angulo = (i / segmentos) * Math.PI * 2;
                const xPie = px + Math.cos(angulo) * radio;
                const zPie = pz + Math.sin(angulo) * radio;
                this.vertices.push(new Punto3D(xPie, py - altura, zPie));
            }
            
            // Perímetro inferior
            for (let i = 0; i <= segmentos; i++) {
                const angulo = (i / segmentos) * Math.PI * 2;
                const xPie = px + Math.cos(angulo) * (radio + 1); 
                const zPie = pz + Math.sin(angulo) * (radio + 1);
                this.vertices.push(new Punto3D(xPie, py, zPie));
            }

            // Tapa superior
            for (let i = 0; i < segmentos; i++) {
                const centro = inicioPie;
                const actual = inicioPie + 2 + i;
                const siguiente = inicioPie + 2 + ((i + 1) % (segmentos + 1));
                this.caras.push(new Cara([centro, actual, siguiente], 'rgb(25, 25, 25)'));
            }
            
            // Tapa inferior
            for (let i = 0; i < segmentos; i++) {
                const centro = inicioPie + 1;
                const actual = inicioPie + 2 + segmentos + 1 + i;
                const siguiente = inicioPie + 2 + segmentos + 1 + ((i + 1) % (segmentos + 1));
                this.caras.push(new Cara([centro, siguiente, actual], 'rgb(20, 20, 20)'));
            }
            
            // Laterales del pie
            for (let i = 0; i < segmentos; i++) {
                const sup1 = inicioPie + 2 + i;
                const sup2 = inicioPie + 2 + ((i + 1) % (segmentos + 1));
                const inf1 = inicioPie + 2 + segmentos + 1 + i;
                const inf2 = inicioPie + 2 + segmentos + 1 + ((i + 1) % (segmentos + 1));
                
                this.caras.push(new Cara([sup1, sup2, inf2, inf1], 'rgb(30, 30, 30)'));
            }
        });
    }
       
    private crearConexionConMango(): void {
        const indiceInicio = this.vertices.length;
        const x = -20;
        const y = -115;
        const segmentos = 12;
        for (let i = 0; i <= segmentos; i++) {
            for (let j = 0; j <= 3; j++) {
                const angulo = (i / segmentos) * Math.PI * 2;
                const altura = y + (j * 8);
                let radioX = 14 - (j * 2); 
                let radioZ = 14 - (j * 2);
                
                if (j === 3) {
                    radioX = 25;
                    radioZ = 20;
                }
                
                const localX = Math.cos(angulo) * radioX;
                const localZ = Math.sin(angulo) * radioZ;
                
                this.vertices.push(new Punto3D(x + localX, altura, localZ));
            }
        }
        for (let i = 0; i < segmentos; i++) {
            for (let j = 0; j < 3; j++) {
                const actual = indiceInicio + i * 4 + j;
                const siguiente = indiceInicio + ((i + 1) % (segmentos + 1)) * 4 + j;
                let color;
                if (j === 0) color = 'rgb(30, 30, 30)'; 
                else if (j === 1) color = 'rgb(25, 25, 25)'; 
                else color = 'rgb(20, 20, 20)'; 
                
                this.caras.push(new Cara([actual, siguiente, siguiente + 1, actual + 1], color));
            }
        }
    }
    
    private crearDetallesModelo(): void {
        // Solo crear el anillo metálico del chuck 
        const inicioAnillo = this.vertices.length;
        const segmentosAnillo = 16;
        
        for (let i = 0; i <= segmentosAnillo; i++) {
            const angulo = (i / segmentosAnillo) * Math.PI * 2;
            const x = 85;
            const y1 = Math.cos(angulo) * 26;
            const z1 = Math.sin(angulo) * 26;
            const y2 = Math.cos(angulo) * 28;
            const z2 = Math.sin(angulo) * 28;
            
            this.vertices.push(new Punto3D(x, y1, z1));
            this.vertices.push(new Punto3D(x + 2, y2, z2));
        }
        
        // Caras del anillo metálico
        for (let i = 0; i < segmentosAnillo; i++) {
            const actual = inicioAnillo + i * 2;
            const siguiente = inicioAnillo + ((i + 1) % (segmentosAnillo + 1)) * 2;
            
            this.caras.push(new Cara([actual, siguiente, siguiente + 1, actual + 1], 'rgb(180, 180, 190)'));
        }
    }
    
    private crearTapasCompletas(): void {
        // Crear todas las tapas para cerrar el modelo
        this.crearTapaTrasera();
        this.crearTapaChuck();
        this.crearTapaPunta();
        this.crearTapasMango();
    }
    
    private crearTapaTrasera(): void {
        const indiceInicio = this.vertices.length;
        const segmentos = 24;
        const x = -80; // Posición trasera del cuerpo
        
        // Centro de la tapa trasera
        this.vertices.push(new Punto3D(x, 0, 0));
        
        // Perímetro de la tapa trasera
        for (let i = 0; i <= segmentos; i++) {
            const angulo = (i / segmentos) * Math.PI * 2;
            const radio = 28;
            const y = Math.cos(angulo) * radio;
            const z = Math.sin(angulo) * radio;
            this.vertices.push(new Punto3D(x, y, z));
        }
        
        // Crear caras triangulares desde el centro
        for (let i = 0; i < segmentos; i++) {
            const centro = indiceInicio;
            const actual = indiceInicio + 1 + i;
            const siguiente = indiceInicio + 1 + ((i + 1) % (segmentos + 1));
            
            this.caras.push(new Cara([centro, actual, siguiente], 'rgb(255, 204, 0)'));
        }
    }
    
    private crearTapaChuck(): void {
        const indiceInicio = this.vertices.length;
        const segmentos = 16;
        const x = 110; // Posición del chuck
        
        // Centro de la tapa 
        this.vertices.push(new Punto3D(x, 0, 0));
        
        // Perímetro
        for (let i = 0; i <= segmentos; i++) {
            const angulo = (i / segmentos) * Math.PI * 2;
            const radio = 20;
            const y = Math.cos(angulo) * radio;
            const z = Math.sin(angulo) * radio;
            
            this.vertices.push(new Punto3D(x, y, z));
        }
        
        // Caras triangulares
        for (let i = 0; i < segmentos; i++) {
            const centro = indiceInicio;
            const actual = indiceInicio + 1 + i;
            const siguiente = indiceInicio + 1 + ((i + 1) % (segmentos + 1));
            
            this.caras.push(new Cara([centro, actual, siguiente], 'rgb(15, 15, 15)'));
        }
    }
    
    private crearTapaPunta(): void {
        const indiceInicio = this.vertices.length;
        const segmentos = 12;
        const x = 145; // Posición de la punta
        this.vertices.push(new Punto3D(x, 0, 0));
        
        // Perímetro pequeño
        for (let i = 0; i <= segmentos; i++) {
            const angulo = (i / segmentos) * Math.PI * 2;
            const radio = 1;
            const y = Math.cos(angulo) * radio;
            const z = Math.sin(angulo) * radio;
            
            this.vertices.push(new Punto3D(x, y, z));
        }
        
        // Caras triangulares
        for (let i = 0; i < segmentos; i++) {
            const centro = indiceInicio;
            const actual = indiceInicio + 1 + i;
            const siguiente = indiceInicio + 1 + ((i + 1) % (segmentos + 1));
            
            this.caras.push(new Cara([centro, actual, siguiente], 'rgb(192, 192, 192)'));
        }
    }
    
    private crearTapasMango(): void {
        const indiceInicio = this.vertices.length;
        const segmentos = 18;
        const x = -20;
        
        // Tapa superior del mango
        this.vertices.push(new Punto3D(x, -15, 0));
        
        for (let i = 0; i <= segmentos; i++) {
            const angulo = (i / segmentos) * Math.PI * 2;
            const radio = 28;
            const localX = Math.cos(angulo) * radio;
            const z = Math.sin(angulo) * radio;
            
            this.vertices.push(new Punto3D(x + localX, -15, z));
        }
        
        // Caras triangulares superiores
        for (let i = 0; i < segmentos; i++) {
            const centro = indiceInicio;
            const actual = indiceInicio + 1 + i;
            const siguiente = indiceInicio + 1 + ((i + 1) % (segmentos + 1));
            
            this.caras.push(new Cara([centro, actual, siguiente], 'rgb(25, 25, 25)'));
        }
        
        // Tapa inferior del mango
        const inicioInferior = this.vertices.length;
        this.vertices.push(new Punto3D(x, -115, 0));
        
        for (let i = 0; i <= segmentos; i++) {
            const angulo = (i / segmentos) * Math.PI * 2;
            const radio = 14;
            const localX = Math.cos(angulo) * radio;
            const z = Math.sin(angulo) * radio;
            
            this.vertices.push(new Punto3D(x + localX, -115, z));
        }
        
        // Caras triangulares inferiores
        for (let i = 0; i < segmentos; i++) {
            const centro = inicioInferior;
            const actual = inicioInferior + 1 + i;
            const siguiente = inicioInferior + 1 + ((i + 1) % (segmentos + 1));
            
            this.caras.push(new Cara([centro, actual, siguiente], 'rgb(20, 20, 25)'));
        }
    }
    //Rotaciones
    private moverVista(dRotX: number, dRotY: number, dRotZ: number = 0): void {
        this.rotacionX += dRotX;
        this.rotacionY += dRotY;
        this.rotacionZ += dRotZ;
        this.renderizar();
    }
    private acercar(): void {
        this.zoom = Math.min(this.zoom + 0.1, 2.0);
        this.renderizar();
    }
    private alejar(): void {
        this.zoom = Math.max(this.zoom - 0.1, 0.5);
        this.renderizar();
    }
    private vp(dTheta: number, dPhi: number, fRho: number): void {
        // dTheta: rotación Y (izq-der), dPhi: rotación X (arriba-abajo), fRho: factor de zoom
        this.rotacionY += dTheta * 180 / Math.PI; // conversion de radianes a grados
        this.rotacionX += dPhi * 180 / Math.PI;
        this.zoom *= fRho;
        this.zoom = Math.max(0.5, Math.min(2.0, this.zoom));
        this.renderizar();
    }

    private configurarControles(): void {
        // Control de animación para modelar destornillador lo puse opcional
        const animate = document.getElementById('animate');
        if (animate) {
            animate.addEventListener('click', (e) => {
                e.preventDefault();
                this.animando = !this.animando;
                animate.textContent = this.animando ? 'Detener Animación' : 'Iniciar Animación';
                if (this.animando) {
                    this.frameAnimacion = 0;
                    this.animar();
                }
            });
        }
        const reset = document.getElementById('reset');
        if (reset) {
            reset.addEventListener('click', (e) => {
                e.preventDefault();
                this.rotacionX = 20;
                this.rotacionY = 30;
                this.rotacionZ = 0;
                this.zoom = 1;
                this.renderizar();
            });
        }

        // Agregar controles de mouse para rotación
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        if (!this.canvas) return;
        // Mouse controls
        this.canvas.addEventListener('mousedown', (e: MouseEvent) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        this.canvas.addEventListener('mousemove', (e: MouseEvent) => {
            if (!isDragging) return;
            const deltaMove = {
                x: e.clientX - previousMousePosition.x,
                y: e.clientY - previousMousePosition.y
            };
            if (!this.animando) {
                this.rotacionY += deltaMove.x * 0.5;
                this.rotacionX += deltaMove.y * 0.5;
                this.renderizar();
            }
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        this.canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });

        this.canvas.addEventListener('wheel', (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this.zoom = Math.max(0.5, Math.min(2.0, this.zoom + delta));
            this.renderizar();
        });
        // Controles 
        const eyeDown = document.getElementById('eyeDown');
        if (eyeDown) eyeDown.addEventListener('click', () => this.vp(0, -0.1, 1));
        const eyeUp = document.getElementById('eyeUp');
        if (eyeUp) eyeUp.addEventListener('click', () => this.vp(0, 0.1, 1));
        const eyeLeft = document.getElementById('eyeLeft');
        if (eyeLeft) eyeLeft.addEventListener('click', () => this.vp(0.1, 0, 1));
        const eyeRight = document.getElementById('eyeRight');
        if (eyeRight) eyeRight.addEventListener('click', () => this.vp(-0.1, 0, 1));
        const incrDist = document.getElementById('incrDist');
        if (incrDist) incrDist.addEventListener('click', () => this.vp(0, 0, 2));
        const decrDist = document.getElementById('decrDist');
        if (decrDist) decrDist.addEventListener('click', () => this.vp(0, 0, 0.5));
    }
    
    private ajustarZoomParaEncajar(): void {
        const radX = (this.rotacionX * Math.PI) / 180;
        const radY = (this.rotacionY * Math.PI) / 180;
        const radZ = (this.rotacionZ * Math.PI) / 180;
        let zoom = this.zoom;
        let verticesProyectados = this.vertices.map(vertice =>
            vertice.rotarX(radX).rotarY(radY).rotarZ(radZ)
                .proyectar(800, this.canvas.width / 2, this.canvas.height / 2, zoom * 2.5)
        );
        let minX = Math.min(...verticesProyectados.map(v => v.x));
        let maxX = Math.max(...verticesProyectados.map(v => v.x));
        let minY = Math.min(...verticesProyectados.map(v => v.y));
        let maxY = Math.max(...verticesProyectados.map(v => v.y));
        const margen = 20;
        const escalaX = (this.canvas.width - margen) / (maxX - minX);
        const escalaY = (this.canvas.height - margen) / (maxY - minY);
        const nuevaEscala = Math.min(escalaX, escalaY, 2.0);
        this.zoom = this.zoom * nuevaEscala;
        this.zoom = Math.max(0.5, Math.min(2.0, this.zoom));
    }

    protected animar(): void {
        if (!this.animando) return;
        
        this.frameAnimacion++;
        this.rotacionY = (this.frameAnimacion) % 360;
        this.rotacionX = Math.sin(this.frameAnimacion * 0.02) * 20;
        
        this.renderizar();
        requestAnimationFrame(() => this.animar());
    }
    
    protected renderizar(): void {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Convertir ángulos a radianes
        const radX = (this.rotacionX * Math.PI) / 180;
        const radY = (this.rotacionY * Math.PI) / 180;
        const radZ = (this.rotacionZ * Math.PI) / 180;
        // Transformar vértices para centrar
        const verticesTransformados = this.vertices.map(vertice => {
            const v = vertice
                .rotarX(radX)
                .rotarY(radY)
                .rotarZ(radZ);
            return v;
        });
        const verticesProyectados = verticesTransformados.map(vertice => 
            vertice.proyectar(800, this.canvas.width / 2, this.canvas.height / 2, this.zoom * 2.5)
        );
        // Ordenar caras por profundidad
        const profundidadCaras = this.caras.map((cara, indice) => {
            const promedioZ = cara.vertices.reduce((suma, indiceVertice) => 
                suma + verticesTransformados[indiceVertice].z, 0) / cara.vertices.length;
            return { indice, profundidad: promedioZ };
        });
        profundidadCaras.sort((a, b) => a.profundidad - b.profundidad);
        // Dibujar caras
        profundidadCaras.forEach(({ indice }) => {
            const cara = this.caras[indice];
            this.ctx.beginPath();
            const primerVertice = verticesProyectados[cara.vertices[0]];
            this.ctx.moveTo(primerVertice.x, primerVertice.y);
            for (let i = 1; i < cara.vertices.length; i++) {
                const vertice = verticesProyectados[cara.vertices[i]];
                this.ctx.lineTo(vertice.x, vertice.y);
            }
            this.ctx.closePath();
            this.ctx.fillStyle = cara.color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#fcf8f7';
            this.ctx.lineWidth = 0.5;
            this.ctx.stroke();
        });
    }
    
    private escalarYCentrarModelo(): void {
        if (this.vertices.length === 0) return;
        // Calcular centroide
        let sumX = 0, sumY = 0, sumZ = 0;
        this.vertices.forEach(v => {
            sumX += v.x;
            sumY += v.y;
            sumZ += v.z;
        });
        const n = this.vertices.length;
        const cx = sumX / n;
        const cy = sumY / n;
        const cz = sumZ / n;
        // Trasladar al origen
        this.vertices.forEach(v => {
            v.x -= cx;
            v.y -= cy;
            v.z -= cz;
        });
        // Escalar globalmente
        const factor = 1.0; 
        this.vertices.forEach(v => {
            v.x *= factor;
            v.y *= factor;
            v.z *= factor;
        });
       
        const offsetVisualY = 40; 
        this.vertices.forEach(v => {
            v.y += offsetVisualY;
        });
    }

    private obtenerIndicesGatillo(): number[] {
         return this.indicesGatillo;
    }

    public presionarGatillo(): void {
        if (this.gatilloPresionado) return;
        const indices = this.obtenerIndicesGatillo();
        indices.forEach(i => {
            this.vertices[i].x += this.desplazamientoGatillo;
        });
        this.gatilloPresionado = true;
        this.renderizar();
    }

    public soltarGatillo(): void {
        if (!this.gatilloPresionado) return;
        const indices = this.obtenerIndicesGatillo();
        indices.forEach(i => {
            this.vertices[i].x -= this.desplazamientoGatillo;
        });
        this.gatilloPresionado = false;
        this.renderizar();
    }
    
    public girarPuntaIzquierda(): void {
        // Gira la punta metálica 
        const centro = this.calcularCentroPunta();
        const angulo = Math.PI / 12; // 15 grados por clic
        this.anguloPunta += angulo;
        this.indicesPunta.forEach(idx => {
            const v = this.vertices[idx];
            // Trasladar al origen de la punta
            const x0 = v.x - centro.x;
            const y0 = v.y - centro.y;
            const z0 = v.z - centro.z;
            // Rotar alrededor del eje X
            const y1 = y0 * Math.cos(angulo) - z0 * Math.sin(angulo);
            const z1 = y0 * Math.sin(angulo) + z0 * Math.cos(angulo);
            // Volver a trasladar
            v.x = centro.x + x0;
            v.y = centro.y + y1;
            v.z = centro.z + z1;
        });
        this.renderizar();
    }

    private calcularCentroPunta(): { x: number, y: number, z: number } {
        // Calcula el centro geométrico de la punta metálica
        let sumX = 0, sumY = 0, sumZ = 0;
        this.indicesPunta.forEach(idx => {
            sumX += this.vertices[idx].x;
            sumY += this.vertices[idx].y;
            sumZ += this.vertices[idx].z;
        });
        const n = this.indicesPunta.length;
        return { x: sumX / n, y: sumY / n, z: sumZ / n };
    }

    public girarMandril(): void {
        // Gira el mandril 
        const centro = this.calcularCentroChuck();
        const angulo = Math.PI / 12; // 15 grados por clic
        this.anguloChuck += angulo;
        this.indicesChuck.forEach(idx => {
            const v = this.vertices[idx];
            // Trasladar al origen del mandril
            const x0 = v.x - centro.x;
            const y0 = v.y - centro.y;
            const z0 = v.z - centro.z;
            // Rotar alrededor del eje X
            const y1 = y0 * Math.cos(angulo) - z0 * Math.sin(angulo);
            const z1 = y0 * Math.sin(angulo) + z0 * Math.cos(angulo);
            // Volver a trasladar
            v.x = centro.x + x0;
            v.y = centro.y + y1;
            v.z = centro.z + z1;
        });
        this.renderizar();
    }

    private calcularCentroChuck(): { x: number, y: number, z: number } {
        // Calcula el centro geométrico del mandril
        let sumX = 0, sumY = 0, sumZ = 0;
        this.indicesChuck.forEach(idx => {
            sumX += this.vertices[idx].x;
            sumY += this.vertices[idx].y;
            sumZ += this.vertices[idx].z;
        });
        const n = this.indicesChuck.length;
        return { x: sumX / n, y: sumY / n, z: sumZ / n };
    }

    public encenderDestornillador(): void {
        if (this.encendido) return;
        if (!this.gatilloPresionado) {
            this.presionarGatillo();
        }
        this.encendido = true;
        this.girarMientrasEncendido();
    }

    public apagarDestornillador(): void {
        this.encendido = false;
        if (this.idGiro !== null) {
            this.detenerGiro();
            this.idGiro = null;
        }
        this.soltarGatillo();
    }

    private girarMientrasEncendido(): void {
        if (!this.encendido) return;
        const angulo = Math.PI / 18; // 10 grados por ciclo
        this.girarChuckYBroca(angulo);
        this.idGiro = this.siguienteCicloGiro(() => this.girarMientrasEncendido());
    }

    private siguienteCicloGiro(callback: () => void): number {
        return window.setTimeout(callback, 16); 
    }

    private detenerGiro(): void {
        if (this.idGiro !== null) {
            clearTimeout(this.idGiro);
        }
    }

    private girarChuckYBroca(angulo: number): void {
        // Gira ChuckNegro y PuntaMetalica el mismo ángulo 
        const centroChuck = this.calcularCentroChuck();
        this.indicesChuck.forEach(idx => {
            const v = this.vertices[idx];
            const x0 = v.x - centroChuck.x;
            const y0 = v.y - centroChuck.y;
            const z0 = v.z - centroChuck.z;
            const y1 = y0 * Math.cos(angulo) - z0 * Math.sin(angulo);
            const z1 = y0 * Math.sin(angulo) + z0 * Math.cos(angulo);
            v.x = centroChuck.x + x0;
            v.y = centroChuck.y + y1;
            v.z = centroChuck.z + z1;
        });

        const centroPunta = this.calcularCentroPunta();
        this.indicesPunta.forEach(idx => {
            const v = this.vertices[idx];
            const x0 = v.x - centroPunta.x;
            const y0 = v.y - centroPunta.y;
            const z0 = v.z - centroPunta.z;
            const y1 = y0 * Math.cos(angulo) - z0 * Math.sin(angulo);
            const z1 = y0 * Math.sin(angulo) + z0 * Math.cos(angulo);
            v.x = centroPunta.x + x0;
            v.y = centroPunta.y + y1;
            v.z = centroPunta.z + z1;
        });

        this.renderizar();
    }
}

class DestornilladorAvanzadoIntegrado extends DestornilladorElectrico3DES {
    private modoVisualizacion: 'estudiante' | 'avanzado' = 'estudiante';
    constructor(canvasId: string) {
        super(canvasId);
        this.configurarControlesAvanzados();
    }
    
    private configurarControlesAvanzados(): void {
        const toggleModo = document.getElementById('toggleModo');
        if (toggleModo) {
            toggleModo.addEventListener('click', (e) => {
                e.preventDefault();
                this.alternarModoVisualizacion();
            });
        }
        const eyeDown = document.getElementById('eyeDown');
        const eyeUp = document.getElementById('eyeUp');
        const eyeLeft = document.getElementById('eyeLeft');
        const eyeRight = document.getElementById('eyeRight');
        const incrDist = document.getElementById('incrDist');
        const decrDist = document.getElementById('decrDist');
        
        if (eyeDown) {
            eyeDown.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (this.modoVisualizacion === 'avanzado') {
                    this.renderizarModoAvanzado();
                }
            });
        }
        
        if (eyeUp) {
            eyeUp.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (this.modoVisualizacion === 'avanzado') {
                    this.renderizarModoAvanzado();
                }
            });
        }
        
        if (eyeLeft) {
            eyeLeft.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (this.modoVisualizacion === 'avanzado') {
                    this.renderizarModoAvanzado();
                }
            });
        }
        
        if (eyeRight) {
            eyeRight.addEventListener('click', (e) => {
                e.preventDefault();
               
                if (this.modoVisualizacion === 'avanzado') {
                    this.renderizarModoAvanzado();
                }
            });
        }
        
        if (incrDist) {
            incrDist.addEventListener('click', (e) => {
                e.preventDefault();
               
                if (this.modoVisualizacion === 'avanzado') {
                    this.renderizarModoAvanzado();
                }
            });
        }
        
        if (decrDist) {
            decrDist.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (this.modoVisualizacion === 'avanzado') {
                    this.renderizarModoAvanzado();
                }
            });
        }
    }
    
    private alternarModoVisualizacion(): void {
        this.modoVisualizacion = this.modoVisualizacion === 'estudiante' ? 'avanzado' : 'estudiante';
        console.log(`Modo cambiado a: ${this.modoVisualizacion}`);
        
        if (this.modoVisualizacion === 'avanzado') {

            this.renderizarModoAvanzado();
        } else {
            this.renderizar(); //método 1
        }
    }
    
    private renderizarModoAvanzado(): void {
        // Limpiar canvas
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

     }
    
    public renderizar(): void {
        if (this.modoVisualizacion === 'avanzado') {
            this.renderizarModoAvanzado();
        } else {
            super.renderizar();
        }
    }
}

function mostrarContenidoDestornillador() {
    fetch('./destornillador3d.txt')
        .then(response => {
            if (!response.ok) throw new Error('No se pudo cargar el archivo.');
            return response.text();
        })
        .then(texto => {
            const pre = document.getElementById('contenido-archivo');
            if (pre) {
                pre.textContent = texto;
            }
        })
        .catch(() => {
            const pre = document.getElementById('contenido-archivo');
            if (pre) {
                pre.textContent = 'No se pudo cargar el archivo.';
            }
        });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando destornillador 3D con sistema avanzado...');
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (!canvas) {
        console.error('No se encontró el elemento canvas');
        return;
    }
    console.log('Canvas encontrado, dimensiones:', canvas.width, 'x', canvas.height);
    
    const destornillador = new DestornilladorAvanzadoIntegrado('canvas');
    console.log('Destornillador con funcionalidades avanzadas inicializado');

    (window as any).destornillador = destornillador;

    // para el botón con id="presionarGatillo"
    const btnGatillo = document.getElementById('presionarGatillo');
    if (btnGatillo) {
        btnGatillo.addEventListener('click', function () {
            (window as any).destornillador.presionarGatillo();
        });
    }

    //  para girar la punta a la izquierda
    const btnGirarPuntaIzq = document.getElementById('girarBroca');
    if (btnGirarPuntaIzq) {
        btnGirarPuntaIzq.addEventListener('click', function () {
            (window as any).destornillador.girarPuntaIzquierda();
        });
    }

    //  para girar el mandril (chuck)
    const btnGirarMandril = document.getElementById('girarMandril');
    if (btnGirarMandril) {
        btnGirarMandril.addEventListener('click', function () {
            (window as any).destornillador.girarMandril();
        });
    }

    // para soltar el gatillo:
    const btnSoltar = document.getElementById('soltarGatillo');
    if (btnSoltar) {
         btnSoltar.addEventListener('click', function () {
            (window as any).destornillador.soltarGatillo();
        });
     }

    // encender el destornillador (gatillo y giro continuo de chuck+punta)
    const btnEncenderDest = document.getElementById('encender');
    if (btnEncenderDest) {
        btnEncenderDest.addEventListener('click', function () {
            (window as any).destornillador.encenderDestornillador();
        });
    }
    // apagar el destornillador (detener giro y soltar gatillo)
    const btnApagarDest = document.getElementById('apagar');
    if (btnApagarDest) {
        btnApagarDest.addEventListener('click', function () {
            (window as any).destornillador.apagarDestornillador();
        });
    }

    mostrarContenidoDestornillador();
});