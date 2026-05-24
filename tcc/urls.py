from django.urls import path
from . import views

app_name = 'tcc'

urlpatterns = [
    path('', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),

    path('aluno/', views.index_aluno, name='index_aluno'),
    path('professor/', views.index_professor, name='index_professor'),

    path('api/projetos/', views.api_projetos, name='api_projetos'),
    path('api/projetos/criar/', views.api_projeto_criar, name='api_projeto_criar'),
    path('api/projetos/<int:projeto_id>/', views.api_projeto_detalhe, name='api_projeto_detalhe'),
    path('api/projetos/<int:projeto_id>/deletar/', views.api_projeto_deletar, name='api_projeto_deletar'),

    path('api/projetos/<int:projeto_id>/entregas/criar/', views.api_entrega_criar, name='api_entrega_criar'),
    path('api/entregas/<int:entrega_id>/avaliar/', views.api_entrega_avaliar, name='api_entrega_avaliar'),
    path('api/entregas/<int:entrega_id>/comentarios/', views.api_comentario_criar, name='api_comentario_criar'),

    path('api/professores/', views.api_professores, name='api_professores'),
]