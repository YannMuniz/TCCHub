/**
 * ============================================================================
 * GUIA DE DESENVOLVIMENTO - TCCHub
 * ============================================================================
 * 
 * Este arquivo documenta as mudanças realizadas e como utilizar o projeto.
 * 
 * DATA: 24 de maio de 2026
 * VERSÃO: 1.0 - Reorganização e Estruturação Base
 */

// ============================================================================
// 1. MUDANÇAS REALIZADAS
// ============================================================================

/**
 * ── CSS (tcc/static/css/style.css) ─────────────────────────────────────
 * ✓ Reorganizado com comentários e seções bem definidas
 * ✓ Adicionadas animações customizadas (fadeIn, fadeInUp, pulse)
 * ✓ Melhorada responsividade
 * ✓ Adicionados utilitários CSS
 * ✓ Estilos para componentes (cards, forms, badges, etc.)
 */

/**
 * ── JavaScript (tcc/static/js/) ────────────────────────────────────────
 * 
 * Arquivos separados e organizados:
 * 
 * 1. common.js
 *    - Funções compartilhadas (logout, sidebar, toast)
 *    - Requisições AJAX com CSRF token
 *    - Inicialização global
 * 
 * 2. aluno.js
 *    - Navegação SPA específica do aluno
 *    - Renderização de projetos e entregas
 *    - Modais e formulários
 *    - Carregamento de dados do backend
 * 
 * 3. professor.js
 *    - Navegação SPA específica do professor
 *    - Renderização de avaliações
 *    - Dashboard com estatísticas
 *    - Ações de avaliação
 */

/**
 * ── Models (tcc/models.py) ─────────────────────────────────────────────
 * ✓ Adicionados comentários com funções TODO para implementação futura
 * ✓ Funções comentadas nos models:
 *   - Usuario: get_projetos(), is_professor(), is_aluno()
 *   - Projeto: get_entregas_*, total_entregas(), percentual_conclusao()
 *   - Entrega: dias_atraso(), pode_ser_avaliada(), get_ultima_correcao()
 *   - Correcao: notificar_aluno(), gerar_relatorio()
 * ✓ Correção de erro no método __str__ da classe Usuario
 */

/**
 * ── Views (tcc/views.py) ───────────────────────────────────────────────
 * ✓ Views principais implementadas com dados do banco:
 *   - login_view: autenticação com redirecionamento por cargo
 *   - logout_view: logout e redirecionamento para login
 *   - index_aluno: portal do aluno
 *   - index_professor: portal do professor
 * 
 * ✓ APIs REST implementadas:
 *   - GET /api/projetos/: lista projetos do usuário
 *   - GET /api/projetos/<id>/: detalhes de um projeto
 *   - POST /api/projetos/criar/: criar novo projeto
 *   - POST /api/projetos/<id>/entregas/criar/: criar entrega
 *   - POST /api/entregas/<id>/avaliar/: avaliar entrega
 * 
 * ✓ Funções TODO deixadas comentadas para futuras implementações
 */

/**
 * ── URLs (tcc/urls.py e TCCHub/urls.py) ────────────────────────────────
 * ✓ URLs reorganizadas e documentadas
 * ✓ Rotas principais:
 *   - / : login
 *   - /logout/ : logout
 *   - /aluno/ : portal do aluno
 *   - /professor/ : portal do professor
 * ✓ Rotas de API:
 *   - /tcc/api/projetos/ : listagem de projetos
 *   - /tcc/api/projetos/<id>/ : detalhe do projeto
 *   - /tcc/api/projetos/criar/ : criar projeto
 *   - /tcc/api/projetos/<id>/entregas/criar/ : criar entrega
 *   - /tcc/api/entregas/<id>/avaliar/ : avaliar entrega
 */

/**
 * ── Templates HTML ─────────────────────────────────────────────────────
 * ✓ Atualizado index_aluno.html com:
 *   - Atributo data-user-name na tag body
 *   - Carregamento dos arquivos JS separados (common.js e aluno.js)
 *   - Remoção de scripts inline
 * 
 * ✓ Atualizado index_professor.html com:
 *   - Atributo data-user-name na tag body
 *   - Carregamento dos arquivos JS separados (common.js e professor.js)
 *   - Remoção de scripts inline
 */

/**
 * ── Comando Customizado ────────────────────────────────────────────────
 * ✓ Criado comando: python manage.py createsuperuser_with_cargo
 * 
 * Uso:
 *   python manage.py createsuperuser_with_cargo
 *   
 * Solicita interativamente:
 *   - Username
 *   - Email
 *   - Password (com confirmação)
 *   - Cargo (aluno ou orientador)
 * 
 * Ou com argumentos:
 *   python manage.py createsuperuser_with_cargo \
 *     --username admin \
 *     --email admin@email.com \
 *     --password senha123 \
 *     --cargo orientador
 */


// ============================================================================
// 2. ESTRUTURA DE DIRETÓRIOS
// ============================================================================

/**
tcc/
├── migrations/
├── management/
│   └── commands/
│       ├── __init__.py
│       └── createsuperuser_with_cargo.py
├── static/
│   ├── css/
│   │   └── style.css                    (✓ Reorganizado)
│   ├── img/
│   └── js/
│       ├── common.js                    (✓ Novo)
│       ├── aluno.js                     (✓ Novo)
│       └── professor.js                 (✓ Novo)
├── templates/
│   └── tcc/
│       ├── login.html
│       ├── index_aluno.html             (✓ Atualizado)
│       └── index_professor.html         (✓ Atualizado)
├── __init__.py
├── admin.py
├── apps.py
├── models.py                            (✓ Atualizado)
├── tests.py
├── urls.py                              (✓ Atualizado)
└── views.py                             (✓ Atualizado)
*/


// ============================================================================
// 3. COMO EXECUTAR E TESTAR
// ============================================================================

/**
 * 1. Criar o banco de dados:
 *    python manage.py migrate
 * 
 * 2. Criar um superusuário com cargo:
 *    python manage.py createsuperuser_with_cargo
 *    
 *    Ou de forma não-interativa:
 *    python manage.py createsuperuser_with_cargo \
 *      --username prof_ricardo \
 *      --email ricardo@univ.br \
 *      --password senha123 \
 *      --cargo orientador
 * 
 * 3. Iniciar o servidor de desenvolvimento:
 *    python manage.py runserver
 * 
 * 4. Acessar a aplicação:
 *    http://localhost:8000/
 *    
 *    Fazer login com as credenciais criadas
 * 
 * 5. Para acessar o admin:
 *    http://localhost:8000/admin/
 */


// ============================================================================
// 4. PRÓXIMAS IMPLEMENTAÇÕES (TODO)
// ============================================================================

/**
 * ── Model Projeto ──────────────────────────────────────────────────────
 * - get_entregas_pendentes(): retorna entregas pendentes
 * - get_entregas_aprovadas(): retorna entregas aprovadas
 * - get_entregas_correcao(): retorna entregas em correção
 * - total_entregas(): conta total de entregas
 * - percentual_conclusao(): calcula progresso do projeto
 * 
 * ── Model Usuario ──────────────────────────────────────────────────────
 * - get_projetos(): retorna projetos do usuário
 * - is_professor(): verifica se é professor
 * - is_aluno(): verifica se é aluno
 * 
 * ── Model Entrega ──────────────────────────────────────────────────────
 * - dias_atraso(): calcula dias em atraso
 * - pode_ser_avaliada(): verifica se pode ser avaliada
 * - get_ultima_correcao(): retorna última correção
 * 
 * ── Model Correcao ─────────────────────────────────────────────────────
 * - notificar_aluno(): envia notificação ao aluno
 * - gerar_relatorio(): gera relatório da correção
 * 
 * ── Views ──────────────────────────────────────────────────────────────
 * - projeto_listar(): listagem paginada com filtros
 * - projeto_detalhe(): exibir detalhes com entregas e correções
 * - projeto_excluir(): deletar projeto com validação
 * - entrega_criar(): create com upload de arquivo
 * - entrega_avaliar(): criar correção e atualizar status
 * 
 * ── Frontend ───────────────────────────────────────────────────────────
 * - Integração completa com APIs
 * - Upload de arquivos de entrega
 * - Notificações real-time (WebSocket ou polling)
 * - Busca e filtros de projetos
 * - Exportação de relatórios em PDF
 */


// ============================================================================
// 5. PADRÕES E CONVENÇÕES
// ============================================================================

/**
 * ── JavaScript ─────────────────────────────────────────────────────
 * - Usar fetchWithCSRF() para requisições POST/PUT/DELETE
 * - Sempre validar permissões no backend (não confiar no client)
 * - Usar showToast() para feedback ao usuário
 * - Manter funções globais bem documentadas com JSDoc
 * 
 * ── CSS ────────────────────────────────────────────────────────────
 * - Usar Tailwind CSS para componentes reutilizáveis
 * - Adicionar animações suaves com @keyframes
 * - Sempre testar responsividade (mobile-first)
 * 
 * ── Django Views ───────────────────────────────────────────────────
 * - Usar @login_required para proteger views
 * - Usar get_object_or_404() para queries seguras
 * - Retornar JsonResponse para APIs
 * - Sempre validar dados de entrada
 * 
 * ── Models ─────────────────────────────────────────────────────────
 * - Usar on_delete=models.CASCADE para relacionamentos
 * - Adicionar related_name para queries reversas
 * - Usar choices para campos limitados
 * - Implementar __str__() para representação legível
 */


// ============================================================================
// 6. DÚVIDAS E SUPORTE
// ============================================================================

/**
 * Dúvidas comuns:
 * 
 * P: Como adicionar um novo campo ao Projeto?
 * R: Edite models.py, crie uma migração (makemigrations), aplique (migrate)
 * 
 * P: Como adicionar uma nova API endpoint?
 * R: Crie a view em views.py, adicione a URL em urls.py, teste com curl/Postman
 * 
 * P: Como fazer upload de arquivos?
 * R: Use request.FILES no formulário, salve em FileField no model
 * 
 * P: Como criar filtros avançados?
 * R: Use Q objects do Django para queries complexas, implemente na API
 * 
 * Para mais dúvidas, verifique os comentários em cada arquivo!
 */
