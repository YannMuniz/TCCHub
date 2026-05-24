/**
 * ============================================================================
 * PORTAL DO ALUNO
 * ============================================================================
 * Arquivo: aluno.js
 * Descrição: Funções específicas para o portal do aluno
 */

const nomeUsuarioAtual = document.querySelector('[data-user-name]')?.dataset.userName || 'Aluno';

// Dados dos projetos (será substituído por fetch ao backend)
let projetos = [];
let projetoAtualId = null;

/**
 * ────────────────────────────────────────────────────────────────────
 * NAVEGAÇÃO SPA (Single Page Application)
 * ────────────────────────────────────────────────────────────────────
 */

/**
 * Navega entre as diferentes visualizações (painel, projetos, detalhe, etc.)
 * @param {string} viewName - Nome da view a ser exibida
 * @param {string} projId - ID do projeto (quando necessário)
 */
function navigate(viewName, projId = null) {
    // Oculta todas as views
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    
    // Remove estilo ativo de todos os botões de navegação
    document.querySelectorAll('.nav-btn').forEach(el => {
        el.classList.remove('bg-blue-800', 'text-white', 'font-medium');
        el.classList.add('text-blue-100');
    });

    const ativar = (id) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.classList.add('bg-blue-800', 'text-white', 'font-medium');
            btn.classList.remove('text-blue-100');
        }
    };

    switch (viewName) {
        case 'painel':
            document.getElementById('view-painel').classList.remove('hidden');
            ativar('nav-painel');
            document.getElementById('stat-tccs').textContent = projetos.length;
            break;
        case 'projetos':
            document.getElementById('view-projetos').classList.remove('hidden');
            ativar('nav-projetos');
            renderProjetos();
            break;
        case 'novo-projeto':
            document.getElementById('view-novo-projeto').classList.remove('hidden');
            ativar('nav-novo');
            document.getElementById('form-novo-projeto').reset();
            break;
        case 'detalhe':
            document.getElementById('view-detalhe-projeto').classList.remove('hidden');
            projetoAtualId = projId;
            renderDetalheProjeto();
            break;
    }

    renderSidebarProjects();

    // Fecha sidebar em dispositivos móveis
    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar.classList.contains('-translate-x-full')) {
            toggleMobileSidebar();
        }
    }
}

/**
 * ────────────────────────────────────────────────────────────────────
 * CARREGAMENTO DE DADOS
 * ────────────────────────────────────────────────────────────────────
 */

/**
 * Carrega os projetos do usuário a partir do servidor
 */
async function carregarProjetos() {
    try {
        const response = await fetchWithCSRF('/api/projetos/', { method: 'GET' });
        if (response.ok) {
            projetos = await response.json();
        } else {
            // Se não tiver API, mantém dados vazios ou mock
            projetos = [];
        }
    } catch (error) {
        console.warn('Erro ao carregar projetos:', error);
        projetos = [];
    }
    navigate('painel');
}

/**
 * ────────────────────────────────────────────────────────────────────
 * RENDERIZAÇÃO
 * ────────────────────────────────────────────────────────────────────
 */

/**
 * Renderiza a lista de projetos no painel
 */
function renderProjetos() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (projetos.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i data-lucide="inbox" class="w-16 h-16 text-gray-300 mx-auto mb-4"></i>
                <p class="text-gray-500 text-lg">Nenhum projeto ainda. Crie um novo para começar!</p>
            </div>`;
        lucide.createIcons();
        return;
    }

    projetos.forEach(proj => {
        grid.innerHTML += `
            <div onclick="navigate('detalhe', '${proj.id}')"
                class="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                <h3 class="text-xl font-bold text-gray-900 mb-3">${proj.titulo}</h3>
                <p class="text-base text-gray-600 line-clamp-3 mb-6">${proj.descricao}</p>
                <p class="text-sm text-gray-500 mb-6">Orientador: <span class="font-medium text-gray-700">${proj.orientador}</span></p>
                <div class="flex items-center gap-5 text-sm text-gray-500 border-t border-gray-100 pt-5">
                    <span class="flex items-center gap-2">
                        <i data-lucide="file-text" class="w-4 h-4"></i> ${proj.entregas ? proj.entregas.length : 0} entregas
                    </span>
                </div>
            </div>`;
    });
    lucide.createIcons();
}

/**
 * Renderiza a lista de projetos na sidebar
 */
function renderSidebarProjects() {
    const list = document.getElementById('sidebar-projects-list');
    if (!list) return;

    list.innerHTML = '';
    projetos.forEach(proj => {
        const isActive = projetoAtualId === proj.id
            && !document.getElementById('view-detalhe-projeto').classList.contains('hidden');
        
        list.innerHTML += `
            <button onclick="navigate('detalhe', '${proj.id}')"
                class="w-full flex items-center gap-4 px-4 py-3 text-sm rounded-md transition-colors text-left
                       ${isActive ? 'bg-blue-800 text-white font-medium' : 'text-blue-100 hover:bg-blue-800'}">
                <i data-lucide="folder" class="w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-300' : 'text-blue-400'}"></i>
                <span class="sidebar-text truncate">${proj.titulo}</span>
            </button>`;
    });

    if (isMinimized) {
        document.querySelectorAll('.sidebar-text').forEach(t => t.classList.add('hidden'));
    }
    lucide.createIcons();
}

/**
 * Renderiza os detalhes de um projeto específico
 */
function renderDetalheProjeto() {
    const proj = projetos.find(p => p.id === projetoAtualId);
    if (!proj) return;

    document.getElementById('detalhe-titulo').textContent = proj.titulo;
    document.getElementById('detalhe-resumo').textContent = proj.descricao;
    document.getElementById('detalhe-orientador').textContent = proj.orientador;
    document.getElementById('equipe-orientador-nome').textContent = proj.orientador;
    document.getElementById('orientador-avatar').textContent = proj.orientador.charAt(0).toUpperCase();

    renderTimeline(proj);
}

/**
 * Renderiza a linha do tempo de entregas
 * @param {object} proj - Objeto do projeto
 */
function renderTimeline(proj) {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    if (!proj.entregas || proj.entregas.length === 0) {
        container.innerHTML = `
            <div class="border-2 border-dashed border-gray-200 bg-white rounded-xl p-12 text-center text-lg text-gray-500">
                Nenhuma entrega cadastrada ainda. Crie sua primeira entrega clicando no botão acima.
            </div>`;
        return;
    }

    container.innerHTML = '';
    proj.entregas.forEach((ent, index) => {
        const statusMap = {
            'pendente': {
                badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                icon: 'bg-yellow-400',
                text: 'Aguardando Correção'
            },
            'aprovado': {
                badge: 'bg-green-100 text-green-800 border-green-200',
                icon: 'bg-green-500',
                text: 'Aprovado'
            },
            'correcao': {
                badge: 'bg-red-100 text-red-800 border-red-200',
                icon: 'bg-red-500',
                text: 'Requer Correções'
            }
        };

        const status = statusMap[ent.status] || statusMap['pendente'];

        container.innerHTML += `
            <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-8">
                <div class="p-6 md:p-8">
                    <div class="flex items-center gap-4 mb-4 flex-wrap">
                        <span class="${status.badge} text-sm px-3 py-1.5 rounded flex items-center gap-2 font-medium border">
                            <div class="w-2 h-2 rounded-full ${status.icon}"></div> ${status.text}
                        </span>
                        <span class="text-sm text-gray-500 flex items-center gap-2">
                            <i data-lucide="calendar" class="w-4 h-4"></i> 
                            Prazo: ${ent.data_envio ? new Date(ent.data_envio).toLocaleDateString('pt-BR') : 'N/A'}
                        </span>
                    </div>
                    <h4 class="text-xl font-medium text-gray-900">${ent.titulo}</h4>
                    <p class="text-base text-gray-600 mt-2">${ent.descricao}</p>
                </div>
                <div class="bg-gray-50 p-6 md:p-8 border-t border-gray-100">
                    <form onsubmit="handleComment(event, ${index})" class="relative">
                        <input type="text" required placeholder="Escreva uma nota para o orientador..."
                            class="w-full border border-gray-300 rounded-md px-4 py-3 pr-28 text-base focus:outline-none focus:border-blue-500 bg-white">
                        <button type="submit" class="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-sm font-medium transition-colors">
                            Comentar
                        </button>
                    </form>
                </div>
            </div>`;
    });
    lucide.createIcons();
}

/**
 * ────────────────────────────────────────────────────────────────────
 * MODAIS E FORMULÁRIOS
 * ────────────────────────────────────────────────────────────────────
 */

/**
 * Abre o modal de nova entrega
 */
function abrirModalEntrega() {
    const modal = document.getElementById('modal-entrega');
    if (modal) {
        modal.classList.remove('hidden');
        const form = document.getElementById('form-nova-entrega');
        if (form) form.reset();
        const datePicker = document.getElementById('ent-prazo');
        if (datePicker) {
            datePicker.valueAsDate = new Date();
        }
    }
}

/**
 * Fecha o modal de nova entrega
 */
function fecharModalEntrega() {
    const modal = document.getElementById('modal-entrega');
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * ────────────────────────────────────────────────────────────────────
 * AÇÕES
 * ────────────────────────────────────────────────────────────────────
 */

/**
 * Exclui o projeto atual
 */
function excluirProjetoAtual() {
    if (confirm("Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.")) {
        projetos = projetos.filter(p => p.id !== projetoAtualId);
        showToast('Projeto excluído com sucesso!');
        navigate('projetos');
    }
}

/**
 * Trata o envio de comentários
 * @param {Event} e - Evento do formulário
 * @param {number} entregaIndex - Índice da entrega
 */
function handleComment(e, entregaIndex) {
    e.preventDefault();
    const input = e.target.querySelector('input');
    const proj = projetos.find(p => p.id === projetoAtualId);
    if (!proj) return;

    const comentario = input.value;
    input.value = '';
    
    showToast('Comentário publicado');
    
    // TODO: Enviar comentário ao servidor
    // await fetchWithCSRF(`/api/projetos/${proj.id}/comentarios/`, {
    //     method: 'POST',
    //     body: JSON.stringify({ entrega_id: proj.entregas[entregaIndex].id, texto: comentario })
    // });
}

/**
 * ────────────────────────────────────────────────────────────────────
 * INICIALIZAÇÃO
 * ────────────────────────────────────────────────────────────────────
 */

document.addEventListener('DOMContentLoaded', function() {
    // Carrega dados do servidor
    carregarProjetos();

    // Event listener para criar novo projeto
    const formNovoProjeto = document.getElementById('form-novo-projeto');
    if (formNovoProjeto) {
        formNovoProjeto.addEventListener('submit', function(e) {
            e.preventDefault();
            // TODO: Implementar criação de projeto via API
            showToast('Projeto criado com sucesso!');
            navigate('projetos');
        });
    }

    // Event listener para nova entrega
    const formNovaEntrega = document.getElementById('form-nova-entrega');
    if (formNovaEntrega) {
        formNovaEntrega.addEventListener('submit', function(e) {
            e.preventDefault();
            // TODO: Implementar criação de entrega via API
            showToast('Entrega adicionada com sucesso!');
            fecharModalEntrega();
        });
    }
});
