from django.urls import path
from . import views

app_name = 'tcc'

urlpatterns = [
    # ── Autenticação ─────────────────────────────────────────────
    path('', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),

    # ── Portais (Dashboards) ─────────────────────────────────────
    path('aluno/', views.index_aluno, name='index_aluno'),
    path('professor/', views.index_professor, name='index_professor'),

    # ── API REST - Projetos ──────────────────────────────────────
    path('api/projetos/', views.api_projetos, name='api_projetos'),
    path('api/projetos/<int:projeto_id>/', views.api_projeto_detalhe, name='api_projeto_detalhe'),
    path('api/projetos/criar/', views.api_projeto_criar, name='api_projeto_criar'),

    # ── API REST - Entregas ──────────────────────────────────────
    path('api/projetos/<int:projeto_id>/entregas/criar/', views.api_entrega_criar, name='api_entrega_criar'),
    path('api/entregas/<int:entrega_id>/avaliar/', views.api_entrega_avaliar, name='api_entrega_avaliar'),
]