/**
 * shader_program.js - Gerenciador de compilação de Shaders e Programas WebGL
 * Responsável por compilar shaders de vértice e fragmento e vincular o programa WebGL.
 */
export class ShaderProgram {
    /**
     * @param {WebGLRenderingContext} gl - Contexto de renderização WebGL
     * @param {string} vertexSource - Código fonte do shader de vértices (Vertex Shader)
     * @param {string} fragmentSource - Código fonte do shader de fragmentos (Fragment Shader)
     */
    constructor(gl, vertexSource, fragmentSource) {
        // Armazena a referência para o contexto de renderização WebGL
        this.gl = gl;
        // Cria e vincula o programa WebGL a partir dos códigos fonte fornecidos
        this.program = this.createProgram(vertexSource, fragmentSource);
    }

    /**
     * Compila um shader individual (vértice ou fragmento) a partir do seu código fonte.
     * @param {number} type - Tipo do shader (ex: gl.VERTEX_SHADER ou gl.FRAGMENT_SHADER)
     * @param {string} source - Código fonte GLSL do shader
     * @returns {WebGLShader} O objeto shader compilado
     */
    compileShader(type, source) {
        // Cria um novo objeto shader na API do WebGL
        const shader = this.gl.createShader(type);
        // Associa o código fonte GLSL ao objeto shader criado
        this.gl.shaderSource(shader, source);
        // Compila o código fonte do shader no contexto WebGL
        this.gl.compileShader(shader);

        // Verifica se a operação de compilação foi bem-sucedida
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            // Obtém o log de erro detalhado gerado pelo driver gráfico
            const info = this.gl.getShaderInfoLog(shader);
            // Remove o shader corrompido da memória da GPU para evitar vazamentos
            this.gl.deleteShader(shader);
            // Lança um erro descritivo contendo o log de falha de compilação
            throw new Error(`Erro na compilação do Shader: ${info}`);
        }
        // Retorna o shader compilado com sucesso
        return shader;
    }

    /**
     * Cria e vincula o programa WebGL combinando um vertex shader e um fragment shader.
     * @param {string} vertexSrc - Código fonte do vertex shader
     * @param {string} fragmentSrc - Código fonte do fragment shader
     * @returns {WebGLProgram} O programa WebGL vinculado e pronto para uso
     */
    createProgram(vertexSrc, fragmentSrc) {
        // Compila o shader de vértices utilizando o método auxiliar de compilação
        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexSrc);
        // Compila o shader de fragmentos utilizando o método auxiliar de compilação
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentSrc);

        // Cria um novo objeto de programa vazio no contexto WebGL
        const program = this.gl.createProgram();
        // Anexa o shader de vértices ao programa principal
        this.gl.attachShader(program, vertexShader);
        // Anexa o shader de fragmentos ao programa principal
        this.gl.attachShader(program, fragmentShader);
        // Executa a linkagem (linking) de todos os shaders anexados ao programa
        this.gl.linkProgram(program);

        // Verifica se o processo de linkagem do programa foi bem-sucedido
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            // Obtém o log detalhado de erro de linkagem do programa
            const info = this.gl.getProgramInfoLog(program);
            // Remove o programa com falha da memória da GPU
            this.gl.deleteProgram(program);
            // Lança um erro descritivo com o log da falha de linkagem
            throw new Error(`Erro ao vincular o Programa WebGL: ${info}`);
        }

        // Retorna o programa WebGL linkado com sucesso
        return program;
    }

    /**
     * Ativa este programa de shader para ser utilizado nas próximas chamadas de desenho.
     */
    use() {
        // Define o programa atual no contexto de renderização WebGL
        this.gl.useProgram(this.program);
    }

    /**
     * Obtém a localização de um atributo (attribute) dentro do programa de shader.
     * @param {string} name - Nome do atributo definido no código GLSL
     * @returns {number} Índice de localização do atributo
     */
    getAttributeLocation(name) {
        // Consulta o contexto WebGL para recuperar o índice de localização do atributo especificado
        return this.gl.getAttribLocation(this.program, name);
    }

    /**
     * Obtém a localização de uma variável uniform (uniform) dentro do programa de shader.
     * @param {string} name - Nome da variável uniform definida no código GLSL
     * @returns {WebGLUniformLocation} Referência de localização da uniform
     */
    getUniformLocation(name) {
        // Consulta o contexto WebGL para recuperar a localização da uniform especificada
        return this.gl.getUniformLocation(this.program, name);
    }
}