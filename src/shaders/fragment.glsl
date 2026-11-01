// Define a precisão dos números de ponto flutuante na GPU
precision mediump float;

// Variável recebida do Vertex Shader contendo a coordenada UV atual
varying vec2 v_texCoord;

// Uniforme que recebe a textura (o spritesheet gerado proceduralmente via Canvas 2D)
uniform sampler2D u_texture;

void main() {
    // Amostra a cor da textura na coordenada UV correspondente
    vec4 texColor = texture2D(u_texture, v_texCoord);

    // Descarta pixels transparentes (espaços vazios ou áreas não utilizadas do grid)
    if (texColor.a < 0.1) {
        discard;
    }

    gl_FragColor = texColor;
}