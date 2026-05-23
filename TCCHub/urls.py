"""
URL configuration for TCCHub project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
urlpatterns = [
    # Admin site
    path('admin/', admin.site.urls),
    # URLs para autenticação
    path("login/", login_view, name="login"),
    path("logout/", logout_view, name="logout"),

    # URLs para os projetos aluno
    path("projetosAluno/", include("projetos.urls")),
    path("novoProjeto/", include("projetos.urls")),
    path("editarProjeto/<int:projeto_id>/", include("projetos.urls")),
    path("excluirProjeto/<int:projeto_id>/", include("projetos.urls")),
    
    # URLs para os projetos professor
    path("projetosProfessor/", include("projetos.urls")),

    # URLs para as entregas
    path("entregas/", include("postarEntrega.urls")),
    path("postarEntrega/", include("postarEntrega.urls")),
    # path("editarEntrega/<int:entrega_id>/", include("postarEntrega.urls")),
    path("excluirEntrega/<int:entrega_id>/", include("postarEntrega.urls")),

    # URLs para corrigir e concluir entregas
    path("CorrigirEntrega/<int:entrega_id>/", include("corrigirEntrega.urls")),
    path("ConcluirEntrega/<int:entrega_id>/", include("corrigirEntrega.urls")),
]