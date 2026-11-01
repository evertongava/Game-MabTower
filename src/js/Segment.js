/**
 * tile.js - Gerador procedural de texturas/spritesheet para SimTower (POO)
 * Desenha tiles (Lobby, Escritório, Condomínio, Elevador, etc.) via Canvas 2D
 * e compila como uma textura WebGL.
 */

/**
 * Mapeamento das coordenadas UV dentro do atlas de texturas.
 * Cada entrada indica [coluna, linha] na grade de tiles.
 */
export const SEGMENT_MAP = {
    EMPTY:       { col: 0, row: 0 },
    LOBBY:       { col: 1, row: 0 },
    OFFICE:      { col: 2, row: 0 },
    CONDOMINIUM: { col: 3, row: 0 },
    ELEVATOR:    { col: 0, row: 1 },
    SHAFT:       { col: 1, row: 1 },
    STAIRS:      { col: 2, row: 1 },
    BACKGROUND:  { col: 3, row: 1 }
};

export class Segment {

    constructor(tileSize = 32, atlasWidth = 256, atlasHeight = 256) {
        this.tileSize = tileSize;
        this.atlasWidth = atlasWidth;
        this.atlasHeight = atlasHeight;
    }

    drawTile(ctx, tilePos, drawCallback) {
        const x = tilePos.col * this.tileSize;
        const y = tilePos.row * this.tileSize;
        
        ctx.save();
        drawCallback(x, y);
        
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.strokeRect(x, y, this.tileSize, this.tileSize);
        ctx.restore();
    }

    generateSpritesheetCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = this.atlasWidth;
        canvas.height = this.atlasHeight;
        const ctx = canvas.getContext('2d');
        const s = this.tileSize;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // --- 1. Tile Vazio / Fundo Padrão ---
        this.drawTile(ctx, SEGMENT_MAP.EMPTY, function(x, y) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0)';
            ctx.fillRect(x, y, s, s);
        });

        // --- 2. Lobby ---
        this.drawTile(ctx, SEGMENT_MAP.LOBBY, function(x, y) {
            ctx.fillStyle = '#4a5568';
            ctx.fillRect(x, y, s, s);
            ctx.fillStyle = '#cbd5e0';
            ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
            ctx.fillStyle = '#63b3ed';
            ctx.fillRect(x + 6, y + 6, s - 12, s - 12);
            ctx.fillStyle = '#2d3748';
            ctx.fillRect(x + 2, y, 4, s);
            ctx.fillRect(x + s - 6, y, 4, s);
        });

        // --- 3. Escritório (Office) ---
        this.drawTile(ctx, SEGMENT_MAP.OFFICE, function(x, y) {
            ctx.fillStyle = '#2b6cb0';
            ctx.fillRect(x, y, s, s);
            ctx.fillStyle = '#bee3f8';
            ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
            ctx.fillStyle = '#744210';
            ctx.fillRect(x + 6, y + 18, 14, 8);
            ctx.fillStyle = '#1a202c';
            ctx.fillRect(x + 10, y + 10, 6, 8);
            ctx.fillStyle = '#3182ce';
            ctx.fillRect(x + 11, y + 11, 4, 5);
        });

        // --- 4. Condomínio ---
        this.drawTile(ctx, SEGMENT_MAP.CONDOMINIUM, function(x, y) {
            ctx.fillStyle = '#975a16';
            ctx.fillRect(x, y, s, s);
            ctx.fillStyle = '#feebc8';
            ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
            ctx.fillStyle = '#ecc94b';
            ctx.fillRect(x + 6, y + 6, 10, 12);
            ctx.strokeStyle = '#d69e2e';
            ctx.strokeRect(x + 6, y + 6, 10, 12);
            ctx.fillStyle = '#c53030';
            ctx.fillRect(x + 18, y + 18, 10, 8);
        });

        // --- 5. Cabine do Elevador ---
        this.drawTile(ctx, SEGMENT_MAP.ELEVATOR, function(x, y) {
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(x, y, s, s);
            ctx.fillStyle = '#a0aec0';
            ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
            ctx.fillStyle = '#4a5568';
            ctx.fillRect(x + 4, y + 4, 11, s - 8);
            ctx.fillRect(x + 17, y + 4, 11, s - 8);
            ctx.fillStyle = '#e53e3e';
            ctx.fillRect(x + 13, y + 1, 6, 3);
        });

        // --- 6. Poço do Elevador (Shaft) ---
        this.drawTile(ctx, SEGMENT_MAP.SHAFT, function(x, y) {
            ctx.fillStyle = '#1a202c';
            ctx.fillRect(x, y, s, s);
            ctx.fillStyle = '#718096';
            ctx.fillRect(x + 10, y, 2, s);
            ctx.fillRect(x + 20, y, 2, s);
        });

        return canvas;
    }

    createWebGLTexture(gl) {
        const canvas = this.generateSpritesheetCanvas();
        const texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        return texture;
    }
}