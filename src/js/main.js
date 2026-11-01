/**
 * main.js - Ponto de entrada principal para o SimTower WebGL + Wasm
 * Carrega o módulo WebAssembly da simulação, inicializa os componentes de UI,
 * WebGL (Renderer) e gerencia o Game Loop principal (requestAnimationFrame).
 */

import { Renderer } from './Renderer.js';
import { InputHandler } from './Input.js';
import { SEGMENT_MAP } from './Segment.js';

// Importa a função de fábrica gerada pelo Emscripten para carregar o módulo WebAssembly da simulação C++
import createSimulationModule from '../../build/simulation.js';

/**
 * Função principal assíncrona responsável por inicializar todos os subsistemas do jogo.
 */
async function init() {
    // Obtém o elemento canvas principal do DOM onde o WebGL será renderizado
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas principal não encontrado!');
        return;
    }

    // Carrega os códigos fonte dos Shaders (Vertex e Fragment) assincronamente através de requisições fetch
    let vertexShaderSource, fragmentShaderSource;
    try {
        const [vsRes, fsRes] = await Promise.all([
            fetch('src/shaders/vertex.glsl'),
            fetch('src/shaders/fragment.glsl')
        ]);
        vertexShaderSource = await vsRes.text();
        fragmentShaderSource = await fsRes.text();
    } catch (err) {
        console.error('Erro ao carregar os arquivos de shader:', err);
        return;
    }

    // Inicializa o Renderer WebGL utilizando os shaders carregados
    let renderer;
    try {
        renderer = new Renderer(canvas, vertexShaderSource, fragmentShaderSource);
    } catch (err) {
        console.error('Erro ao inicializar o Renderer WebGL:', err);
        return;
    }

    // Inicializa o módulo WebAssembly (C++) da lógica de simulação do jogo
    let simulation = null;
    try {
        const simModule = await createSimulationModule();
        // Cria uma instância da classe de simulação C++ com uma grade de 100 colunas x 100 andares/linhas
        simulation = new simModule.Simulation(100, 100);
        console.log('Módulo WebAssembly (Simulação) carregado com sucesso! Fundos iniciais:', simulation.getFunds());
    } catch (err) {
        console.error('Erro ao carregar o módulo WebAssembly:', err);
    }

    // Estado da Câmera (Zoom fixo em 1.0, atuando como deslocamento de scroll)
    const camera = {
        x: 0,
        y: 0,
        zoom: 1.0
    };

    // Conecta as barras de rolagem do HTML para movimentar a câmera do jogo
    const hScrollbar = document.getElementById('h-scrollbar');
    const vScrollbar = document.getElementById('v-scrollbar');

    if (hScrollbar) {
        hScrollbar.addEventListener('scroll', () => {
            camera.x = hScrollbar.scrollLeft;
        });
    }

    if (vScrollbar) {
        vScrollbar.addEventListener('scroll', () => {
            camera.y = vScrollbar.scrollTop;
        });
    }

    // Ferramenta ativa selecionada atualmente na interface
    let activeTool = 'OFFICE';
    window.setSimTool = (toolName) => {
        activeTool = toolName;
        console.log(`Ferramenta selecionada: ${activeTool}`);
    };

    // Configuração dos Eventos de Entrada (Cliques na grade)
    const input = new InputHandler(canvas, {
        onClick: (x, y) => {
            const worldX = x + camera.x;
            const worldY = y + camera.y;
            
            const tileSize = 32;
            const gridX = Math.floor(worldX / tileSize);
            const gridY = Math.floor(worldY / tileSize);

            console.log(`Clique na grade [Ferramenta: ${activeTool}] -> X: ${gridX}, Y: ${gridY}`);

            // Executa a ação de construção estrutural baseada na ferramenta ativa se o Wasm estiver pronto
            if (simulation && typeof simulation.buildRoom === 'function') {
                let typeInt = 1; // 1 = LOBBY por padrão
                if (activeTool === 'OFFICE') typeInt = 2;
                if (activeTool === 'CONDOMINIUM') typeInt = 3;

                // Chama o método nativo em C++ para construir a sala na grade informada
                const success = simulation.buildRoom(gridX, gridY, 2, 1, typeInt);
                if (success) {
                    console.log('Construção realizada com sucesso via Wasm! Fundos restantes:', simulation.getFunds());
                } else {
                    console.warn('Falha na construção (verifique fundos ou colisão).');
                }
            }
        }
    });

    // Variável de controle temporal para cálculo do deltaTime no loop de animação
    let lastTime = performance.now();

    /**
     * Game Loop principal executado a 60 FPS utilizando requestAnimationFrame.
     */
    function gameLoop(currentTime) {
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        if (simulation && typeof simulation.update === 'function') {
            simulation.update(deltaTime);
        }

        // Inicia o frame de renderização WebGL aplicando o deslocamento atual da câmera
        renderer.beginFrame(camera.x, camera.y, camera.zoom);

        // Exemplo de desenho procedural de tiles de teste na tela usando SEGMENT_MAP
        const tileSize = 32;
        renderer.drawTile(0, 0, tileSize, tileSize, SEGMENT_MAP.LOBBY);
        renderer.drawTile(32, 0, tileSize, tileSize, SEGMENT_MAP.OFFICE);
        renderer.drawTile(64, 0, tileSize, tileSize, SEGMENT_MAP.CONDOMINIUM);
        renderer.drawTile(0, -32, tileSize, tileSize, SEGMENT_MAP.ELEVATOR);
        renderer.drawTile(0, -64, tileSize, tileSize, SEGMENT_MAP.SHAFT);

        // Finaliza o frame descarregando o lote para a GPU
        renderer.endFrame();

        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
}

// Dispara a inicialização assim que o DOM estiver carregado
window.addEventListener('DOMContentLoaded', init);