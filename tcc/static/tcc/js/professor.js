/**
 * ============================================================================
 * PORTAL DO PROFESSOR/ORIENTADOR
 * ============================================================================
 * Arquivo: professor.js
 * Descrição: Funções específicas para o portal do professor
 */

// Obter nome do usuário do DOM ou da session
const nomeUsuarioAtual = document.body.getAttribute('data-user-name') || 
                         document.querySelector('[data-user-name]')?.getAttribute('data-user-name') || 
                         'Professor';

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
async function navigate(viewName, projId = null) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(el => {
        el.classList.remove('bg-indigo-800', 'text-white', 'font-medium');
        el.classList.add('text-indigo-100');
    });

    const ativar = (id) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.classList.add('bg-indigo-800', 'text-white', 'font-medium');
            btn.classList.remove('text-indigo-100');
        }
    };

    switch (viewName) {
        case 'painel':
            document.getElementById('view-painel').classList.remove('hidden');
            ativar('nav-painel');
            atualizarEstatisticas();
            break;
        case 'projetos':
            document.getElementById('view-projetos').classList.remove('hidden');
            ativar('nav-projetos');
            renderProjetos();
            break;
        case 'detalhe':
            document.getElementById('view-detalhe-projeto').classList.remove('hidden');
            projetoAtualId = Number(projId); // garante number — era string vinda do onclick
            await carregarProjetoDetalhe(projetoAtualId); // dados frescos + comentários
            renderDetalheProjeto();
            break;
    }

    renderSidebarProjects();

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
 * Carrega os projetos orientados pelo professor
 */
async function carregarProjetos() {
    try {
        const response = await fetchWithCSRF('/tcc/api/projetos/', { method: 'GET' });
        if (response.ok) {
            projetos = await response.json();
        } else {
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
 * Atualiza as estatísticas do dashboard
 */
function atualizarEstatisticas() {
    const statTccs = document.getElementById('stat-tccs');
    const statPendentes = document.getElementById('stat-pendentes');

    if (statTccs) {
        statTccs.textContent = projetos.length;
    }

    if (statPendentes) {
        const pendentes = projetos.reduce((acc, p) => {
            const entregasPendentes = p.entregas ? p.entregas.filter(e => e.status === 'pendente').length : 0;
            return acc + entregasPendentes;
        }, 0);
        statPendentes.textContent = pendentes;
    }
}

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
                <p class="text-gray-500 text-lg">Nenhum aluno orientado ainda.</p>
            </div>`;
        lucide.createIcons();
        return;
    }

    projetos.forEach(proj => {
        grid.innerHTML += `
            <div onclick="navigate('detalhe', '${proj.id}')"
                class="bg-white border-l-4 border-indigo-500 rounded-xl p-8 shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                <h3 class="text-xl font-bold text-gray-900 mb-3">${proj.titulo}</h3>
                <p class="text-base text-gray-600 line-clamp-3 mb-6">${proj.descricao}</p>
                <p class="text-sm text-gray-500 mb-6">Aluno: <span class="font-medium text-gray-700">${proj.aluno}</span></p>
                <div class="flex items-center gap-5 text-sm text-gray-500 border-t border-gray-100 pt-5">
                    <span class="flex items-center gap-2">
                        <i data-lucide="file-text" class="w-4 h-4"></i> 
                        ${proj.entregas ? proj.entregas.length : 0} entregas
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
                       ${isActive ? 'bg-indigo-800 text-white font-medium' : 'text-indigo-100 hover:bg-indigo-800'}">
                <i data-lucide="folder" class="w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-300' : 'text-indigo-400'}"></i>
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
    // Usa aluno_nome (nome completo) em vez de username
    document.getElementById('detalhe-aluno').textContent = proj.aluno_nome;
    document.getElementById('equipe-aluno-nome').textContent = proj.aluno_nome;

    const alunoAvatar = document.getElementById('aluno-avatar');
    if (alunoAvatar) {
        alunoAvatar.textContent = proj.aluno_nome.charAt(0).toUpperCase();
    }

    renderTimeline(proj);
}

/**
 * Renderiza a linha do tempo de entregas para avaliação
 * @param {object} proj - Objeto do projeto
 */
function renderTimeline(proj) {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    if (!proj.entregas || proj.entregas.length === 0) {
        container.innerHTML = `
            <div class="border-2 border-dashed border-gray-200 bg-white rounded-xl p-12 text-center text-lg text-gray-500">
                O aluno ainda não enviou entregas.
            </div>`;
        return;
    }

    container.innerHTML = '';
    proj.entregas.forEach(ent => {
        let statusBadge = '';
        let botoesAcao = '';

        if (ent.status === 'pendente') {
            statusBadge = `
                <span class="bg-yellow-100 text-yellow-800 text-sm px-3 py-1.5 rounded flex items-center gap-2 font-medium border border-yellow-200">
                    <div class="w-2 h-2 rounded-full bg-yellow-400"></div> Requer Avaliação
                </span>`;
            botoesAcao = `
                <div class="flex gap-3 mt-6 border-t border-gray-100 pt-5 flex-wrap">
                    <button onclick="avaliarEntrega(${ent.id}, 'aprovado')"
                        class="bg-green-600 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
                        <i data-lucide="check-circle" class="w-4 h-4"></i> Aprovar Entrega
                    </button>
                    <button onclick="avaliarEntrega(${ent.id}, 'correcao')"
                        class="bg-red-50 text-red-600 border border-red-200 px-5 py-2.5 rounded-md text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-2">
                        <i data-lucide="x-circle" class="w-4 h-4"></i> Exigir Correção
                    </button>
                </div>`;
        } else if (ent.status === 'aprovado') {
            statusBadge = `
                <span class="bg-green-100 text-green-800 text-sm px-3 py-1.5 rounded flex items-center gap-2 font-medium border border-green-200">
                    <div class="w-2 h-2 rounded-full bg-green-500"></div> Aprovado
                </span>`;
        } else {
            statusBadge = `
                <span class="bg-red-100 text-red-800 text-sm px-3 py-1.5 rounded flex items-center gap-2 font-medium border border-red-200">
                    <div class="w-2 h-2 rounded-full bg-red-500"></div> Devolvido para Ajustes
                </span>`;
        }

        // Botão de download — aparece sempre que houver arquivo
        const downloadBtn = ent.arquivo_url ? `
            <a href="${ent.arquivo_url}" download="${ent.arquivo_nome || 'entrega'}"
                class="inline-flex items-center gap-2 mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                <i data-lucide="download" class="w-4 h-4"></i> Baixar arquivo (${ent.arquivo_nome || 'download'})
            </a>` : '';

        container.innerHTML += `
            <div class="bg-white border ${ent.status === 'pendente' ? 'border-indigo-300 ring-2 ring-indigo-50' : 'border-gray-200'} rounded-xl shadow-sm overflow-hidden mb-8">
                <div class="p-6 md:p-8">
                    <div class="flex items-center gap-4 mb-4 flex-wrap">
                        ${statusBadge}
                        <span class="text-sm text-gray-500 flex items-center gap-2">
                            <i data-lucide="calendar" class="w-4 h-4"></i>
                            Entregue: ${ent.data_envio ? new Date(ent.data_envio).toLocaleDateString('pt-BR') : 'N/A'}
                        </span>
                    </div>
                    <h4 class="text-xl font-medium text-gray-900">${ent.titulo}</h4>
                    <p class="text-base text-gray-600 mt-2">${ent.descricao}</p>
                    ${downloadBtn}
                    ${botoesAcao}
                </div>
                <div class="bg-gray-50 p-6 md:p-8 border-t border-gray-100">
                    <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Notas e feedback</p>
                    <div id="comments-${ent.id}" class="space-y-1 mb-4">
                        ${renderComentarios(ent.comentarios)}
                    </div>
                    <form onsubmit="handleComment(event, ${ent.id})" class="relative mt-3">
                        <input type="text" placeholder="Deixe um feedback para o aluno..."
                            class="w-full border border-gray-300 rounded-md px-4 py-3 pr-28 text-base focus:outline-none focus:border-indigo-500 bg-white">
                        <button type="submit" class="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded text-sm font-medium transition-colors">
                            Enviar
                        </button>
                    </form>
                </div>
            </div>`;
    });
    lucide.createIcons();
}

/**
 * ────────────────────────────────────────────────────────────────────
 * AÇÕES
 * ────────────────────────────────────────────────────────────────────
 */

/**
 * Remove a orientação da lista (deleta o projeto)
 */
async function excluirProjetoAtual() {
    if (!confirm("Tem certeza que deseja remover esta orientação da sua lista?")) {
        return;
    }
    
    try {
        const response = await fetchWithCSRF(`/tcc/api/projetos/${projetoAtualId}/deletar/`, {
            method: 'POST'
        });
        
        if (response.ok) {
            projetos = projetos.filter(p => p.id !== projetoAtualId);
            showToast('Orientação removida com sucesso!');
            navigate('projetos');
        } else {
            const error = await response.json();
            showToast(error.error || 'Erro ao remover orientação', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao remover orientação', 'error');
    }
}

/**
 * Avalia uma entrega (aprova ou solicita correção) via AJAX
 * @param {number} index - Índice da entrega
 * @param {string} novoStatus - Novo status ('aprovado' ou 'correcao')
 */
async function avaliarEntrega(entregaId, novoStatus) {
    const proj = projetos.find(p => p.id === projetoAtualId);
    if (!proj) return;

    const entrega = proj.entregas.find(e => e.id === entregaId);
    if (!entrega) {
        showToast('Entrega não encontrada', 'error');
        return;
    }

    let observacao = '';
    if (novoStatus === 'correcao') {
        observacao = prompt('Descreva quais correções são necessárias:');
        if (observacao === null) return; // cancelado
    }

    try {
        const response = await fetchWithCSRF(`/tcc/api/entregas/${entregaId}/avaliar/`, {
            method: 'POST',
            body: JSON.stringify({ status: novoStatus, observacao })
        });

        if (response.ok) {
            entrega.status = novoStatus; // atualiza estado local
            const msg = novoStatus === 'aprovado'
                ? 'Entrega aprovada com sucesso!'
                : 'Entrega devolvida para correção.';
            showToast(msg);
            renderDetalheProjeto();
            atualizarEstatisticas();
        } else {
            const error = await response.json();
            showToast(error.error || 'Erro ao avaliar entrega', 'error');
        }
    } catch (error) {
        console.error('Erro ao avaliar:', error);
        showToast('Erro ao avaliar entrega', 'error');
    }
}

async function carregarProjetoDetalhe(projId) {
    try {
        const response = await fetchWithCSRF(`/tcc/api/projetos/${projId}/`, { method: 'GET' });
        if (!response.ok) return;

        const atualizado = await response.json();
        const idx = projetos.findIndex(p => p.id === Number(projId));
        if (idx !== -1) {
            projetos[idx] = atualizado;
        } else {
            projetos.push(atualizado);
        }
    } catch (error) {
        console.warn('Erro ao atualizar detalhe do projeto:', error);
    }
}

/**
 * Trata o envio de comentários/feedback (não implementado no backend)
 * @param {Event} e - Evento do formulário
 * @param {number} entregaIndex - Índice da entrega
 */
async function handleComment(e, entregaId) {
    e.preventDefault();
    const input = e.target.querySelector('input');
    const texto = input.value.trim();

    if (!texto) {
        showToast('Comentário não pode estar vazio', 'info');
        return;
    }

    try {
        const response = await fetchWithCSRF(`/tcc/api/entregas/${entregaId}/comentarios/`, {
            method: 'POST',
            body: JSON.stringify({ texto })
        });

        if (response.ok) {
            const novoComentario = await response.json();

            // Atualiza estado local
            const proj = projetos.find(p => p.id === projetoAtualId);
            const entrega = proj?.entregas.find(en => en.id === entregaId);
            if (entrega) {
                if (!entrega.comentarios) entrega.comentarios = [];
                entrega.comentarios.push(novoComentario);
            }

            // Atualiza só o bloco de comentários, sem re-renderizar a timeline inteira
            const div = document.getElementById(`comments-${entregaId}`);
            if (div) div.innerHTML = renderComentarios(entrega?.comentarios || []);

            input.value = '';
            showToast('Nota adicionada!');
        } else {
            const error = await response.json();
            showToast(error.error || 'Erro ao adicionar nota', 'error');
        }
    } catch (error) {
        console.error('Erro ao comentar:', error);
        showToast('Erro ao adicionar nota', 'error');
    }
}

/**
 * ────────────────────────────────────────────────────────────────────
 * INICIALIZAÇÃO
 * ────────────────────────────────────────────────────────────────────
 */

document.addEventListener('DOMContentLoaded', function() {
    // Carrega dados do servidor
    carregarProjetos();
});
