/**
 * ============================================================================
 * PORTAL DO ALUNO
 * ============================================================================
 * Arquivo: aluno.js
 * Descrição: Funções específicas para o portal do aluno
 */

// Obter nome do usuário do DOM ou da session
const nomeUsuarioAtual = document.body.getAttribute('data-user-name') || 
                         document.querySelector('[data-user-name]')?.getAttribute('data-user-name') || 
                         'Aluno';

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
            carregarProfessores();
            break;
        case 'detalhe':
            document.getElementById('view-detalhe-projeto').classList.remove('hidden');
            projetoAtualId = Number(projId); // corrige comparação string vs number
            await carregarProjetoDetalhe(projetoAtualId);
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
 * Carrega os projetos do usuário a partir do servidor
 */
async function carregarProjetos() {
    try {
        const response = await fetchWithCSRF('/tcc/api/projetos/', { method: 'GET' });
        if (response.ok) {
            projetos = await response.json();
        } else {
            // Se não tiver API, mantém dados vazios
            projetos = [];
        }
    } catch (error) {
        console.warn('Erro ao carregar projetos:', error);
        projetos = [];
    }
    navigate('painel');
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
 * Busca a lista de orientadores e popula o <select> do formulário de novo projeto.
 */
async function carregarProfessores() {
    const select = document.getElementById('select-orientador');
    if (!select) return;

    select.innerHTML = '<option value="" disabled selected>Carregando professores...</option>';

    try {
        const response = await fetchWithCSRF('/tcc/api/professores/', { method: 'GET' });
        if (!response.ok) throw new Error('Falha ao buscar professores');

        const professores = await response.json();

        if (professores.length === 0) {
            select.innerHTML = '<option value="" disabled selected>Nenhum orientador disponível</option>';
            return;
        }

        select.innerHTML = '<option value="" disabled selected>Selecione um orientador</option>';
        professores.forEach(p => {
            const option = document.createElement('option');
            option.value = p.username;
            option.textContent = `${p.nome} (${p.username})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar professores:', error);
        select.innerHTML = '<option value="" disabled selected>Erro ao carregar professores</option>';
    }
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
    document.getElementById('detalhe-orientador').textContent = proj.orientador_nome; // nome completo
    document.getElementById('equipe-orientador-nome').textContent = proj.orientador_nome;
    document.getElementById('orientador-avatar').textContent = proj.orientador_nome.charAt(0).toUpperCase();

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

    const statusMap = {
        pendente: { badge: 'bg-yellow-100 text-yellow-800 border-yellow-200', dot: 'bg-yellow-400', text: 'Aguardando Avaliação' },
        aprovado: { badge: 'bg-green-100 text-green-800 border-green-200',  dot: 'bg-green-500',  text: 'Aprovado' },
        correcao: { badge: 'bg-red-100 text-red-800 border-red-200',        dot: 'bg-red-500',    text: 'Requer Correções' },
    };

    container.innerHTML = '';
    proj.entregas.forEach(ent => {
        const s = statusMap[ent.status] || statusMap.pendente;
        container.innerHTML += `
            <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-8">
                <div class="p-6 md:p-8">
                    <div class="flex items-center gap-4 mb-4 flex-wrap">
                        <span class="${s.badge} text-sm px-3 py-1.5 rounded flex items-center gap-2 font-medium border">
                            <div class="w-2 h-2 rounded-full ${s.dot}"></div> ${s.text}
                        </span>
                        <span class="text-sm text-gray-500 flex items-center gap-2">
                            <i data-lucide="calendar" class="w-4 h-4"></i>
                            ${ent.data_envio ? new Date(ent.data_envio).toLocaleDateString('pt-BR') : 'N/A'}
                        </span>
                    </div>
                    <h4 class="text-xl font-medium text-gray-900">${ent.titulo}</h4>
                    <p class="text-base text-gray-600 mt-2">${ent.descricao}</p>
                </div>
                <div class="bg-gray-50 p-6 md:p-8 border-t border-gray-100">
                    <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Notas para o orientador</p>
                    <div id="comments-${ent.id}" class="space-y-1 mb-4">
                        ${renderComentarios(ent.comentarios)}
                    </div>
                    <form onsubmit="handleComment(event, ${ent.id})" class="relative mt-3">
                        <input type="text" placeholder="Escreva uma nota para o orientador..."
                            class="w-full border border-gray-300 rounded-md px-4 py-3 pr-28 text-base focus:outline-none focus:border-blue-500 bg-white">
                        <button type="submit" class="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-sm font-medium transition-colors">
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
 * Exclui o projeto atual via API
 */
async function excluirProjetoAtual() {
    if (!confirm("Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.")) {
        return;
    }
    
    try {
        const response = await fetchWithCSRF(`/tcc/api/projetos/${projetoAtualId}/deletar/`, {
            method: 'POST'
        });
        
        if (response.ok) {
            projetos = projetos.filter(p => p.id !== projetoAtualId);
            showToast('Projeto excluído com sucesso!');
            navigate('projetos');
        } else {
            const error = await response.json();
            showToast(error.error || 'Erro ao excluir projeto', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao excluir projeto', 'error');
    }
}

/**
 * Trata o envio de comentários (não implementado no backend)
 * @param {Event} e - Evento do formulário
 * @param {number} entregaIndex - Índice da entrega
 */
async function handleComment(e, entregaId) {
    e.preventDefault();
    const input = e.target.querySelector('input');
    const texto = input.value.trim();

<<<<<<< HEAD
    const comentario = input.value;
    input.value = '';
    
    showToast('Comentário publicado');
    
    // TODO: Enviar comentário ao servidor
=======
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

            const proj = projetos.find(p => p.id === projetoAtualId);
            const entrega = proj?.entregas.find(en => en.id === entregaId);
            if (entrega) {
                if (!entrega.comentarios) entrega.comentarios = [];
                entrega.comentarios.push(novoComentario);
            }

            const div = document.getElementById(`comments-${entregaId}`);
            if (div) div.innerHTML = renderComentarios(entrega?.comentarios || []);

            input.value = '';
            showToast('Nota enviada!');
        } else {
            const error = await response.json();
            showToast(error.error || 'Erro ao enviar nota', 'error');
        }
    } catch (error) {
        console.error('Erro ao comentar:', error);
        showToast('Erro ao enviar nota', 'error');
    }
>>>>>>> alteracoes_model
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
        formNovoProjeto.addEventListener('submit', async function(e) {
            e.preventDefault();
            await criarProjetoViaAjax(this);
        });
    }

    // Event listener para nova entrega
    const formNovaEntrega = document.getElementById('form-nova-entrega');
    if (formNovaEntrega) {
        formNovaEntrega.addEventListener('submit', async function(e) {
            e.preventDefault();
            await criarEntregaViaAjax(this);
        });
    }
});

/**
 * Cria um novo projeto via AJAX
 * @param {HTMLFormElement} form - Formulário com os dados
 */
async function criarProjetoViaAjax(form) {
    try {
        const titulo = form.querySelector('input[name="titulo"]')?.value?.trim();
        const descricao = form.querySelector('textarea[name="descricao"]')?.value?.trim();
        const orientador = form.querySelector('select[name="orientador"]')?.value; // agora é select

        if (!titulo || !descricao || !orientador) {
            showToast('Todos os campos são obrigatórios', 'error');
            return;
        }

        const response = await fetchWithCSRF('/tcc/api/projetos/criar/', {
            method: 'POST',
            body: JSON.stringify({ titulo, descricao, orientador })
        });

        if (response.ok) {
            const novoProjeto = await response.json();
            projetos.push(novoProjeto);
            showToast('Projeto criado com sucesso!');
            form.reset();
            navigate('projetos');
        } else {
            const error = await response.json();
            showToast(error.error || 'Erro ao criar projeto', 'error');
        }
    } catch (error) {
        console.error('Erro ao criar projeto:', error);
        showToast('Erro ao criar projeto', 'error');
    }
}

/**
 * Cria uma nova entrega via AJAX
 * @param {HTMLFormElement} form - Formulário com os dados
 */
async function criarEntregaViaAjax(form) {
    try {
        if (!projetoAtualId) {
            showToast('Nenhum projeto selecionado', 'error');
            return;
        }

        const titulo = form.querySelector('input[name="ent-titulo"]')?.value;
        const descricao = form.querySelector('textarea[name="ent-descricao"]')?.value;
        const arquivo = form.querySelector('input[type="file"]')?.files[0];

        if (!titulo || !arquivo) {
            showToast('Título e arquivo são obrigatórios', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('descricao', descricao || '');
        formData.append('arquivo', arquivo);

        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';

        const response = await fetch(`/tcc/api/projetos/${projetoAtualId}/entregas/criar/`, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': csrftoken
            }
        });

        if (response.ok) {
            const novaEntrega = await response.json();
            
            // Atualizar a entrega no projeto local
            const proj = projetos.find(p => p.id === projetoAtualId);
            if (proj && proj.entregas) {
                proj.entregas.push(novaEntrega);
            }

            showToast('Entrega adicionada com sucesso!');
            form.reset();
            fecharModalEntrega();
            renderDetalheProjeto();
        } else {
            const error = await response.json();
            showToast(error.error || 'Erro ao criar entrega', 'error');
        }
    } catch (error) {
        console.error('Erro ao criar entrega:', error);
        showToast('Erro ao criar entrega', 'error');
    }
}
