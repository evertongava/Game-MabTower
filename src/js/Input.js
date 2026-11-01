/**
 * input.js - Gerenciamento de Eventos de Entrada para SimTower (Mouse e Touch)
 * Focado exclusivamente em cliques no canvas.
 */

export class InputHandler {
    /**
     * @param {HTMLCanvasElement} canvas - Elemento canvas HTML onde os eventos de entrada serão escutados
     * @param {Object} callbacks - Objeto contendo as funções de callback para as ações do usuário
     */
    constructor(canvas, callbacks = {}) {
        // Armazena a referência para o elemento canvas
        this.canvas = canvas;
        // Inicializa o objeto de callbacks, garantindo uma função vazia padrão caso onClick não seja fornecido
        this.callbacks = {
            onClick: callbacks.onClick || (() => {})
        };

        // Inicializa os ouvintes de eventos (event listeners) de entrada
        this.initListeners();
    }

    /**
     * Configura os ouvintes de eventos de mouse e toque no canvas.
     */
    initListeners() {
        // Previne a abertura do menu de contexto padrão do navegador ao clicar com o botão direito no canvas
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Escuta o evento de clique simples para seleção ou construção de blocos na grade do jogo
        this.canvas.addEventListener('click', (e) => {
            // Obtém as coordenadas e o retângulo delimitador do canvas na tela
            const rect = this.canvas.getBoundingClientRect();
            // Calcula a posição X relativa do clique dentro da área útil do canvas
            const x = e.clientX - rect.left;
            // Calcula a posição Y relativa do clique dentro da área útil do canvas
            const y = e.clientY - rect.top;
            // Dispara o callback de clique externo repassando as coordenadas relativas (x, y)
            this.callbacks.onClick(x, y);
        });
    }
}