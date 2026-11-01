attribute vec2 a_position;
attribute vec2 a_texCoord;

uniform vec2 u_resolution;
uniform vec2 u_cameraOffset;
uniform float u_zoom;

varying vec2 v_texCoord;

void main() {
    // Aplica o deslocamento da câmera (scroll) e o zoom nas posições dos pixels
    vec2 positionAfterCamera = (a_position - u_cameraOffset) * u_zoom;

    // Converte de pixels [0, resolution] para coordenadas de clip space [-1, 1]
    vec2 zeroToOne = positionAfterCamera / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;

    // Inverte o eixo Y para corresponder ao sistema de coordenadas web (origem no topo-esquerdo)
    gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}