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
