/**
 * ============================================================================
 * FUNÇÕES COMPARTILHADAS - ALUNO E PROFESSOR
 * ============================================================================
 * Arquivo: common.js
 * Descrição: Funções comuns utilizadas nos portais de aluno e professor
 */

// Inicializar ícones Lucide
lucide.createIcons();

let isMinimized = false;

/**
 * ────────────────────────────────────────────────────────────────────
 * AUTENTICAÇÃO
 * ────────────────────────────────────────────────────────────────────
 */

/**
 * Realiza logout do usuário
 */
function logout() {
    document.getElementById('logout-form').submit();
}

/**
 * ────────────────────────────────────────────────────────────────────
 * SIDEBAR
 * ────────────────────────────────────────────────────────────────────
 */

/**
 * Alterna entre sidebar minimizada/expandida (desktop)
 */
function toggleMinimize() {
    const sidebar = document.getElementById('sidebar');
    const texts = document.querySelectorAll('.sidebar-text');
    const icon = document.getElementById('icon-minimize');
    isMinimized = !isMinimized;

    if (isMinimized) {
        sidebar.classList.replace('w-96', 'w-20');
        icon.setAttribute('data-lucide', 'chevrons-right');
        texts.forEach(t => t.classList.add('hidden'));
    } else {
        sidebar.classList.replace('w-20', 'w-96');
        icon.setAttribute('data-lucide', 'chevrons-left');
        texts.forEach(t => t.classList.remove('hidden'));
    }
    lucide.createIcons();
}

/**
 * Alterna a visibilidade da sidebar em dispositivos móveis
 */
function toggleMobileSidebar() {
    document.getElementById('sidebar').classList.toggle('-translate-x-full');
    document.getElementById('sidebar-overlay').classList.toggle('hidden');
}

/**
 * ────────────────────────────────────────────────────────────────────
 * NOTIFICAÇÕES (Toast)
 * ────────────────────────────────────────────────────────────────────
 */

/**
 * Exibe uma notificação flutuante (toast)
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo de notificação ('success', 'error', 'info')
 */
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    const colorMap = {
        'success': 'bg-green-500',
        'error': 'bg-red-500',
        'info': 'bg-blue-500'
    };
    
    const color = colorMap[type] || colorMap['success'];
    
    toast.className = 'bg-gray-900 text-white px-5 py-4 rounded-lg shadow-lg flex items-center gap-3 text-base font-medium toast-enter';
    toast.innerHTML = `
        <div class="${color} rounded-full p-1 flex-shrink-0">
            <i data-lucide="check" class="w-4 h-4 text-white"></i>
        </div>${message}`;
    
    container.appendChild(toast);
    lucide.createIcons();
    
    setTimeout(() => {
        toast.classList.replace('toast-enter', 'toast-leave');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * ────────────────────────────────────────────────────────────────────
 * REQUISIÇÕES AJAX
 * ────────────────────────────────────────────────────────────────────
 */

/**
 * Realiza uma requisição fetch com CSRF token
 * @param {string} url - URL da requisição
 * @param {object} options - Opções do fetch
 * @returns {Promise}
 */
async function fetchWithCSRF(url, options = {}) {
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
    
    const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken,
        ...options.headers
    };
    
    return fetch(url, {
        ...options,
        headers
    });
}

/**
 * Renderiza lista de comentários de uma entrega.
 * Compartilhado entre aluno.js e professor.js.
 * @param {Array} comentarios
 * @returns {string} HTML
 */
function renderComentarios(comentarios) {
    if (!comentarios || comentarios.length === 0) {
        return '<p class="text-sm text-gray-400 italic">Nenhuma nota ainda.</p>';
    }
    return comentarios.map(c => `
        <div class="flex gap-3 text-sm py-2.5 border-b border-gray-100 last:border-0 last:pb-0">
            <div class="w-7 h-7 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center text-xs font-bold
                        ${c.cargo === 'orientador' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}">
                ${c.autor.charAt(0).toUpperCase()}
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-medium text-gray-800">${c.autor}</span>
                    <span class="text-xs px-2 py-0.5 rounded-full
                                 ${c.cargo === 'orientador' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}">
                        ${c.cargo === 'orientador' ? 'Orientador' : 'Aluno'}
                    </span>
                    <span class="text-xs text-gray-400">${c.data}</span>
                </div>
                <p class="text-gray-600 mt-0.5 break-words">${c.texto}</p>
            </div>
        </div>
    `).join('');
}