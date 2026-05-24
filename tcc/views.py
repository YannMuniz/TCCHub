from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json

from .models import Projeto, Entrega, Correcao


# ──────────────────────────────────────────────────────────────────
# AUTENTICAÇÃO
# ──────────────────────────────────────────────────────────────────

def login_view(request):
    """
    Login com AuthenticationForm do Django.
    Redireciona pelo campo `cargo` do model Usuario.
    """
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
    """Logout do usuário e redireciona para login."""
    logout(request)
    return redirect("login")


# ──────────────────────────────────────────────────────────────────
# DASHBOARDS (PORTAIS)
# ──────────────────────────────────────────────────────────────────

@login_required(login_url="login")
def index_aluno(request):
    """
    Portal do aluno: lista os projetos onde ele é o aluno responsável.
    """
    projetos = Projeto.objects.filter(aluno=request.user.username)
    context = {
        'projetos': projetos,
        'user_name': request.user.get_full_name() or request.user.username
    }
    return render(request, "tcc/index_aluno.html", context)


@login_required(login_url="login")
def index_professor(request):
    """
    Portal do orientador: lista os projetos que ele orienta.
    """
    projetos = Projeto.objects.filter(orientador=request.user.username)
    context = {
        'projetos': projetos,
        'user_name': request.user.get_full_name() or request.user.username
    }
    return render(request, "tcc/index_professor.html", context)


# ──────────────────────────────────────────────────────────────────
# API REST - PROJETOS
# ──────────────────────────────────────────────────────────────────

@login_required(login_url="login")
@require_http_methods(["GET"])
def api_projetos(request):
    """
    API para listar projetos do usuário logado.
    - Alunos: retorna projetos onde é aluno
    - Orientadores: retorna projetos que orienta
    """
    if request.user.cargo == "aluno":
        projetos = Projeto.objects.filter(aluno=request.user.username)
    else:
        projetos = Projeto.objects.filter(orientador=request.user.username)

    data = []
    for proj in projetos:
        entregas = list(proj.entregas.values(
            'id', 'titulo', 'descricao', 'status', 'data_envio'
        ))
        data.append({
            'id': proj.id,
            'titulo': proj.titulo,
            'descricao': proj.descricao,
            'aluno': proj.aluno,
            'orientador': proj.orientador,
            'entregas': entregas,
            'comentarios': {}
        })

    return JsonResponse(data, safe=False)


@login_required(login_url="login")
@require_http_methods(["GET"])
def api_projeto_detalhe(request, projeto_id):
    """
    API para obter detalhes de um projeto específico.
    """
    projeto = get_object_or_404(Projeto, id=projeto_id)
    
    # Verificar permissão
    if request.user.cargo == "aluno":
        if projeto.aluno != request.user.username:
            return JsonResponse({'error': 'Sem permissão'}, status=403)
    else:
        if projeto.orientador != request.user.username:
            return JsonResponse({'error': 'Sem permissão'}, status=403)

    entregas = list(projeto.entregas.values(
        'id', 'titulo', 'descricao', 'status', 'data_envio'
    ))

    data = {
        'id': projeto.id,
        'titulo': projeto.titulo,
        'descricao': projeto.descricao,
        'aluno': projeto.aluno,
        'orientador': projeto.orientador,
        'entregas': entregas,
        'comentarios': {}
    }

    return JsonResponse(data)


@login_required(login_url="login")
@require_http_methods(["POST"])
def api_projeto_criar(request):
    """
    API para criar um novo projeto.
    Apenas alunos podem criar projetos.
    """
    if request.user.cargo != "aluno":
        return JsonResponse({'error': 'Apenas alunos podem criar projetos'}, status=403)

    try:
        data = json.loads(request.body)
        projeto = Projeto.objects.create(
            titulo=data.get('titulo'),
            descricao=data.get('descricao'),
            aluno=request.user.username,
            orientador=data.get('orientador', '')
        )
        return JsonResponse({
            'id': projeto.id,
            'titulo': projeto.titulo,
            'descricao': projeto.descricao
        }, status=201)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


# ──────────────────────────────────────────────────────────────────
# API REST - ENTREGAS
# ──────────────────────────────────────────────────────────────────

@login_required(login_url="login")
@require_http_methods(["POST"])
def api_entrega_criar(request, projeto_id):
    """
    API para criar uma nova entrega.
    Apenas alunos podem criar entregas em seus projetos.
    """
    projeto = get_object_or_404(Projeto, id=projeto_id)
    
    if request.user.cargo != "aluno" or projeto.aluno != request.user.username:
        return JsonResponse({'error': 'Sem permissão'}, status=403)

    try:
        titulo = request.POST.get('titulo')
        descricao = request.POST.get('descricao')
        arquivo = request.FILES.get('arquivo')

        entrega = Entrega.objects.create(
            projeto=projeto,
            titulo=titulo,
            descricao=descricao,
            arquivo=arquivo
        )
        return JsonResponse({
            'id': entrega.id,
            'titulo': entrega.titulo,
            'status': entrega.status
        }, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@login_required(login_url="login")
@require_http_methods(["POST"])
def api_entrega_avaliar(request, entrega_id):
    """
    API para avaliar uma entrega (criar correção).
    Apenas orientadores podem avaliar.
    """
    entrega = get_object_or_404(Entrega, id=entrega_id)
    
    if request.user.cargo != "orientador":
        return JsonResponse({'error': 'Apenas orientadores podem avaliar'}, status=403)

    try:
        data = json.loads(request.body)
        status_novo = data.get('status')
        observacao = data.get('observacao', '')

        if status_novo not in ['aprovado', 'correcao']:
            return JsonResponse({'error': 'Status inválido'}, status=400)

        correcao = Correcao.objects.create(
            entrega=entrega,
            status=status_novo,
            observacao=observacao
        )
        return JsonResponse({
            'id': correcao.id,
            'status': correcao.status
        }, status=201)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


# ──────────────────────────────────────────────────────────────────
# FUNÇÕES TODO (Para próximas implementações)
# ──────────────────────────────────────────────────────────────────

# @login_required(login_url="login")
# def projeto_listar(request):
#     """
#     TODO: Implementar listagem paginada com filtros
#     """
#     pass


# @login_required(login_url="login")
# def projeto_detalhe(request, projeto_id):
#     """
#     TODO: Buscar projeto, listar entregas e correções relacionadas
#     """
#     pass


# @login_required(login_url="login")
# def projeto_excluir(request, projeto_id):
#     """
#     TODO: Verificar se o usuário é dono do projeto antes de excluir
#     """
#     pass