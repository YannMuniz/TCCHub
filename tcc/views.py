from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.shortcuts import render, redirect, get_object_or_404

from .models import Projeto, Entrega, Correcao


# Autenticação
def login_view(request):
    """Login com AuthenticationForm do Django.
    Redireciona pelo campo `cargo` do model Usuario."""
    if request.method == "POST":
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)

            if user.cargo == "orientador":
                return redirect("index_professor")
            return redirect("index_aluno")
    else:
        form = AuthenticationForm()

    return render(request, "tcc/login.html", {"form": form})


def logout_view(request):
    logout(request)
    return redirect("login")


# Dashboards
@login_required(login_url="login")
def index_aluno(request):
    """Portal do aluno: lista os projetos onde ele é o aluno responsável."""
    projetos = Projeto.objects.filter(aluno=request.user.username)
    return render(request, "tcc/index_aluno.html", {"projetos": projetos})


@login_required(login_url="login")
def index_professor(request):
    """Portal do orientador: lista os projetos que ele orienta."""
    projetos = Projeto.objects.filter(orientador=request.user.username)
    return render(request, "tcc/index_professor.html", {"projetos": projetos})


# Projetos
@login_required(login_url="login")
def projeto_listar(request):
    # TODO: implementar listagem paginada com filtros
    pass


@login_required(login_url="login")
def projeto_criar(request):
    # TODO: criar formulário ModelForm para Projeto e salvar vinculado ao aluno logado
    pass


@login_required(login_url="login")
def projeto_detalhe(request, projeto_id):
    # TODO: buscar projeto, listar entregas e correções relacionadas
    pass


@login_required(login_url="login")
def projeto_excluir(request, projeto_id):
    # TODO: verificar se o usuário é dono do projeto antes de excluir
    pass


# Entregas
@login_required(login_url="login")
def entrega_criar(request, projeto_id):
    # TODO: criar ModelForm para Entrega com upload de arquivo (request.FILES)
    pass


@login_required(login_url="login")
def entrega_avaliar(request, entrega_id):
    # TODO: professor cria Correcao → o save() do model já atualiza status da Entrega
    pass