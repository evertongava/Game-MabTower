/**
 * renderer.js - WebGL Renderer e Batcher Orientado a Objetos para SimTower
 * Gerencia buffers de vértices, textura e o pipeline de renderização.
 */

// Altere a importação de 'tile' para 'Segment'
import { Segment } from './Segment.js';
import { ShaderProgram } from './ShaderProgram.js';

export class Renderer {
    constructor(canvas, vertexShaderSource, fragmentShaderSource) {
        // ... (código anterior mantido)
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl', { alpha: true, antialias: false });

        if (!this.gl) {
            throw new Error('WebGL não é suportado neste navegador/dispositivo.');
        }

        this.shaderProgram = new ShaderProgram(this.gl, vertexShaderSource, fragmentShaderSource);
        this.shaderProgram.use();

        this.locations = {
            attributes: {
                position: this.shaderProgram.getAttributeLocation('a_position'),
                texCoord: this.shaderProgram.getAttributeLocation('a_texCoord'),
            },
            uniforms: {
                resolution: this.shaderProgram.getUniformLocation('u_resolution'),
                cameraOffset: this.shaderProgram.getUniformLocation('u_cameraOffset'),
                zoom: this.shaderProgram.getUniformLocation('u_zoom'),
                texture: this.shaderProgram.getUniformLocation('u_texture'),
            }
        };

        this.maxQuads = 10000;
        this.floatsPerVertex = 4;
        this.verticesPerQuad = 6;
        this.bufferData = new Float32Array(this.maxQuads * this.verticesPerQuad * this.floatsPerVertex);
        this.quadCount = 0;

        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.bufferData.byteLength, this.gl.DYNAMIC_DRAW);

        // Instancia a classe renomeada 'Segment'
        this.tileGenerator = new Segment();
        this.texture = this.tileGenerator.createWebGLTexture(this.gl);

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    }

    // ... (restante dos métodos do Renderer.js continuam iguais)
    resize() {
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;

        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    beginFrame(cameraX = 0, cameraY = 0, zoom = 1.0) {
        this.resize();
        this.gl.clearColor(0.08, 0.09, 0.12, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.shaderProgram.use();

        this.gl.uniform2f(this.locations.uniforms.resolution, this.canvas.width, this.canvas.height);
        this.gl.uniform2f(this.locations.uniforms.cameraOffset, cameraX, cameraY);
        this.gl.uniform1f(this.locations.uniforms.zoom, zoom);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.uniform1i(this.locations.uniforms.texture, 0);

        this.quadCount = 0;
    }

    drawTile(x, y, width, height, tileInfo) {
        if (!tileInfo) return;
        if (this.quadCount >= this.maxQuads) {
            this.flush();
        }

        const atlasSize = 256.0;
        const tileSize = 32.0;
        
        const u0 = (tileInfo.col * tileSize) / atlasSize;
        const v0 = (tileInfo.row * tileSize) / atlasSize;
        const u1 = u0 + (tileSize / atlasSize);
        const v1 = v0 + (tileSize / atlasSize);

        const x1 = x;
        const y1 = y;
        const x2 = x + width;
        const y2 = y + height;

        const offset = this.quadCount * 24;

        this.bufferData[offset + 0]  = x1; this.bufferData[offset + 1]  = y1; this.bufferData[offset + 2]  = u0; this.bufferData[offset + 3]  = v0;
        this.bufferData[offset + 4]  = x2; this.bufferData[offset + 5]  = y1; this.bufferData[offset + 6]  = u1; this.bufferData[offset + 7]  = v0;
        this.bufferData[offset + 8]  = x1; this.bufferData[offset + 9]  = y2; this.bufferData[offset + 10] = u0; this.bufferData[offset + 11] = v1;

        this.bufferData[offset + 12] = x1; this.bufferData[offset + 13] = y2; this.bufferData[offset + 14] = u0; this.bufferData[offset + 15] = v1;
        this.bufferData[offset + 16] = x2; this.bufferData[offset + 17] = y1; this.bufferData[offset + 18] = u1; this.bufferData[offset + 19] = v0;
        this.bufferData[offset + 20] = x2; this.bufferData[offset + 21] = y2; this.bufferData[offset + 22] = u1; this.bufferData[offset + 23] = v1;

        this.quadCount++;
    }

    flush() {
        if (this.quadCount === 0) return;

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.bufferData.subarray(0, this.quadCount * 24));

        const stride = 4 * Float32Array.BYTES_PER_ELEMENT;

        this.gl.enableVertexAttribArray(this.locations.attributes.position);
        this.gl.vertexAttribPointer(this.locations.attributes.position, 2, this.gl.FLOAT, false, stride, 0);

        this.gl.enableVertexAttribArray(this.locations.attributes.texCoord);
        this.gl.vertexAttribPointer(this.locations.attributes.texCoord, 2, this.gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.quadCount * 6);
        this.quadCount = 0;
    }

    endFrame() {
        this.flush();
    }
}