from django.contrib import admin
from django.urls import path, include
from tcc import views

urlpatterns = [
    # ── Admin ─────────────────────────────────────────────────────────────
    path('admin/', admin.site.urls),

    # ── Autenticação Principal ─────────────────────────────────────────────
    path('', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),

    # ── App TCC (inclui todas as rotas do app) ─────────────────────────────
    path('tcc/', include('tcc.urls')),

    # ── Dashboards (Rotas Principais) ──────────────────────────────────────
    path('aluno/', views.index_aluno, name='index_aluno'),
    path('professor/', views.index_professor, name='index_professor'),
]