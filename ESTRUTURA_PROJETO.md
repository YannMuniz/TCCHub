TCCHub/
├── manage.py                 # Script principal de gerenciamento do Django
├── TCCHub/                   # Pasta de configuração global do projeto
│   ├── init.py
│   ├── settings.py            # Configurações (apps, banco, templates, etc.)
│   ├── urls.py                # Rotas principais do projeto
│   ├── asgi.py                # Configuração para servidores assíncronos
│   └── wsgi.py                # Configuração para servidores web tradicionais
├── tcc/                      # App principal do sistema
│   ├── init.py
│   ├── admin.py               # Registro dos modelos no painel administrativo
│   ├── models.py              # Definição das tabelas (Projeto, Entrega, etc.)
│   ├── views.py               # Lógica das páginas (CRUD, feedback)
│   ├── migrations/            # Histórico de alterações no banco de dados
│   └── ...
└── venv/                     # Ambiente virtual isolado

## 📝 Observações
- **`manage.py`** → usado para rodar servidor, aplicar migrações, criar superuser etc.  
- **Pasta `TCCHub/`** → contém as configurações globais do projeto.  
- **App `tcc/`** → onde fica a lógica específica (models, views, admin, migrations).  
- **`venv/`** → ambiente virtual, não deve ser versionado (adicione ao `.gitignore`).  