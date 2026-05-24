from django.contrib import admin
from django.urls import path
from tcc import views

urlpatterns = [
    # ── Admin ─────────────────────────────────────────────────────────────
    path('admin/', admin.site.urls),

    # ── Autenticação ───────────────────────────────────────────────────────
    path('', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),

    # ── Dashboards ─────────────────────────────────────────────────────────
    path('aluno/', views.index_aluno, name='index_aluno'),
    path('professor/', views.index_professor, name='index_professor'),

    # ── Projetos ───────────────────────────────────────────────────────────
    path('projetos/', views.projeto_listar, name='projeto_listar'),
    path('projetos/novo/', views.projeto_criar, name='projeto_criar'),
    path('projetos/<int:projeto_id>/', views.projeto_detalhe, name='projeto_detalhe'),
    path('projetos/<int:projeto_id>/excluir/', views.projeto_excluir, name='projeto_excluir'),

    # ── Entregas ───────────────────────────────────────────────────────────
    path('projetos/<int:projeto_id>/entregas/nova/', views.entrega_criar, name='entrega_criar'),
    path('entregas/<int:entrega_id>/avaliar/', views.entrega_avaliar, name='entrega_avaliar'),
]