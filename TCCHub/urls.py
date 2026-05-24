from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from pathlib import Path
from tcc import views

# BASE_DIR
BASE_DIR = Path(__file__).resolve().parent.parent

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

# Servir arquivos estáticos em desenvolvimento
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=BASE_DIR / 'tcc' / 'static')