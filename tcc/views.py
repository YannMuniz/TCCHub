from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
import json

from .models import Projeto, Entrega, Correcao, Usuario

# ── HELPER ─────────────────────────────────────────────────────────────────
def _serializar_entregas(proj):
    """Serializa entregas com comentários aninhados."""
    result = []
    for e in proj.entregas.all():
        comentarios = [
            {
                "id": c.id,
                "texto": c.texto,
                "autor": c.autor.get_full_name() or c.autor.username,
                "cargo": c.autor.cargo,
                "data": c.data_comentario.strftime("%d/%m/%Y %H:%M"),
            }
            for c in e.comentarios.select_related('autor').order_by('data_comentario')
        ]
        result.append({
            "id": e.id,
            "titulo": e.titulo,
            "descricao": e.descricao,
            "status": e.status,
            "data_envio": e.data_envio.isoformat(),
            "comentarios": comentarios,
        })
    return result

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
    if request.user.cargo != "aluno":
        return redirect("index_professor")
    projetos = request.user.projetos_como_aluno.all()
    return render(request, "tcc/index_aluno.html", {
        "projetos": projetos,
        "user_name": request.user.get_full_name() or request.user.username,
    })


@login_required(login_url="login")
def index_professor(request):
    if request.user.cargo != "orientador":
        return redirect("index_aluno")
    projetos = request.user.projetos_como_orientador.all()
    return render(request, "tcc/index_professor.html", {
        "projetos": projetos,
        "user_name": request.user.get_full_name() or request.user.username,
    })

# ──────────────────────────────────────────────────────────────────
# API REST - PROJETOS
# ──────────────────────────────────────────────────────────────────

@login_required(login_url="login")
@require_http_methods(["GET"])
def api_projetos(request):
    if request.user.cargo == "aluno":
        projetos = request.user.projetos_como_aluno.all()
    else:
        projetos = request.user.projetos_como_orientador.all()

    data = []
    for proj in projetos:
        data.append({
            "id": proj.id,
            "titulo": proj.titulo,
            "descricao": proj.descricao,
            "aluno": proj.aluno.username,
            "aluno_nome": proj.aluno.get_full_name() or proj.aluno.username,
            "orientador": proj.orientador.username,
            "orientador_nome": proj.orientador.get_full_name() or proj.orientador.username,
            "entregas": _serializar_entregas(proj),
        })

    return JsonResponse(data, safe=False)


@login_required(login_url="login")
@require_http_methods(["GET"])
def api_projeto_detalhe(request, projeto_id):
    projeto = get_object_or_404(Projeto, id=projeto_id)

    if request.user.cargo == "aluno":
        if projeto.aluno != request.user:
            return JsonResponse({"error": "Sem permissão"}, status=403)
    else:
        if projeto.orientador != request.user:
            return JsonResponse({"error": "Sem permissão"}, status=403)

    return JsonResponse({
        "id": projeto.id,
        "titulo": projeto.titulo,
        "descricao": projeto.descricao,
        "aluno": projeto.aluno.username,
        "aluno_nome": projeto.aluno.get_full_name() or projeto.aluno.username,
        "orientador": projeto.orientador.username,
        "orientador_nome": projeto.orientador.get_full_name() or projeto.orientador.username,
        "entregas": _serializar_entregas(projeto),
    })

@login_required(login_url="login")
@require_http_methods(["POST"])
def api_projeto_criar(request):
    """
    API para criar um novo projeto.
    Apenas alunos podem criar projetos.
    """
    if request.user.cargo != "aluno":
        return JsonResponse({"error": "Apenas alunos podem criar projetos"}, status=403)

    try:
        data = json.loads(request.body)
        
        orientador_username = data.get("orientador")
        if not orientador_username:
            return JsonResponse({"error": "Orientador é obrigatório"}, status=400)
        
        try:
            orientador = Usuario.objects.get(username=orientador_username, cargo="orientador")
        except Usuario.DoesNotExist:
            return JsonResponse({"error": "Orientador não encontrado"}, status=404)
        
        projeto = Projeto.objects.create(
            titulo=data.get("titulo"),
            descricao=data.get("descricao"),
            aluno=request.user,
            orientador=orientador
        )
        return JsonResponse({
            "id": projeto.id,
            "titulo": projeto.titulo,
            "descricao": projeto.descricao,
            "aluno": projeto.aluno.username,
            "orientador": projeto.orientador.username
        }, status=201)
    except json.JSONDecodeError:
        return JsonResponse({"error": "JSON inválido"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@login_required(login_url="login")
@require_http_methods(["POST"])
def api_projeto_deletar(request, projeto_id):
    """Apenas o aluno responsável pode excluir o projeto."""
    projeto = get_object_or_404(Projeto, id=projeto_id)

    if projeto.aluno != request.user:
        return JsonResponse({"error": "Apenas o aluno responsável pode excluir o projeto"}, status=403)

    projeto.delete()
    return JsonResponse({"message": "Projeto excluído com sucesso"}, status=200)

@login_required(login_url="login")
@require_http_methods(["POST"])
def api_comentario_criar(request, entrega_id):
    """Aluno e orientador do projeto podem comentar."""
    entrega = get_object_or_404(Entrega, id=entrega_id)
    projeto = entrega.projeto

    if request.user != projeto.aluno and request.user != projeto.orientador:
        return JsonResponse({"error": "Sem permissão"}, status=403)

    try:
        data = json.loads(request.body)
        texto = data.get("texto", "").strip()

        if not texto:
            return JsonResponse({"error": "Comentário não pode estar vazio"}, status=400)

        comentario = Comentario.objects.create(
            entrega=entrega,
            autor=request.user,
            texto=texto,
        )
        return JsonResponse({
            "id": comentario.id,
            "texto": comentario.texto,
            "autor": comentario.autor.get_full_name() or comentario.autor.username,
            "cargo": comentario.autor.cargo,
            "data": comentario.data_comentario.strftime("%d/%m/%Y %H:%M"),
        }, status=201)
    except json.JSONDecodeError:
        return JsonResponse({"error": "JSON inválido"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

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
    
    if request.user.cargo != "aluno" or projeto.aluno != request.user:
        return JsonResponse({"error": "Sem permissão"}, status=403)

    try:
        titulo = request.POST.get("titulo")
        descricao = request.POST.get("descricao")
        arquivo = request.FILES.get("arquivo")

        if not titulo or not arquivo:
            return JsonResponse({"error": "Título e arquivo são obrigatórios"}, status=400)

        entrega = Entrega.objects.create(
            projeto=projeto,
            titulo=titulo,
            descricao=descricao or "",
            arquivo=arquivo
        )
        return JsonResponse({
            "id": entrega.id,
            "titulo": entrega.titulo,
            "descricao": entrega.descricao,
            "status": entrega.status,
            "data_envio": entrega.data_envio.isoformat()
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@login_required(login_url="login")
@require_http_methods(["POST"])
def api_entrega_avaliar(request, entrega_id):
    entrega = get_object_or_404(Entrega, id=entrega_id)

    if request.user.cargo != "orientador":
        return JsonResponse({"error": "Apenas orientadores podem avaliar"}, status=403)

    if entrega.projeto.orientador != request.user:
        return JsonResponse({"error": "Sem permissão para avaliar esta entrega"}, status=403)

    try:
        data = json.loads(request.body)
        status_novo = data.get("status")
        observacao = data.get("observacao", "")

        if status_novo not in ["aprovado", "correcao"]:
            return JsonResponse({"error": "Status inválido"}, status=400)

        # Correcao.save() já atualiza entrega.status — não duplicar
        correcao = Correcao.objects.create(
            entrega=entrega,
            orientador=request.user,
            status=status_novo,
            observacao=observacao,
        )
        return JsonResponse({
            "id": correcao.id,
            "entrega_id": entrega.id,
            "status": correcao.status,
            "observacao": correcao.observacao,
            "data_correcao": correcao.data_correcao.isoformat(),
        }, status=201)
    except json.JSONDecodeError:
        return JsonResponse({"error": "JSON inválido"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

# ── API REST - USUÁRIOS ────────────────────────────────────────────────────

@login_required(login_url="login")
@require_http_methods(["GET"])
def api_professores(request):
    """Retorna lista de orientadores disponíveis para o combobox do aluno."""
    professores = Usuario.objects.filter(cargo="orientador").order_by('first_name', 'username')
    data = [
        {
            "username": p.username,
            "nome": p.get_full_name() or p.username,
        }
        for p in professores
    ]
    return JsonResponse(data, safe=False)


# ── API REST - ENTREGAS ────────────────────────────────────────────────────

@login_required(login_url="login")
@require_http_methods(["POST"])
def api_entrega_avaliar(request, entrega_id):
    """
    API para avaliar uma entrega (criar correção).
    Apenas orientadores podem avaliar.
    O status da entrega é atualizado dentro de Correcao.save() — não fazer aqui.
    """
    entrega = get_object_or_404(Entrega, id=entrega_id)

    if request.user.cargo != "orientador":
        return JsonResponse({"error": "Apenas orientadores podem avaliar"}, status=403)

    if entrega.projeto.orientador != request.user:
        return JsonResponse({"error": "Sem permissão para avaliar esta entrega"}, status=403)

    try:
        data = json.loads(request.body)
        status_novo = data.get("status")
        observacao = data.get("observacao", "")

        if status_novo not in ["aprovado", "correcao"]:
            return JsonResponse({"error": "Status inválido"}, status=400)

        # Correcao.save() já chama entrega.save() internamente — não duplicar
        correcao = Correcao.objects.create(
            entrega=entrega,
            orientador=request.user,
            status=status_novo,
            observacao=observacao
        )
        return JsonResponse({
            "id": correcao.id,
            "entrega_id": entrega.id,
            "status": correcao.status,
            "observacao": correcao.observacao,
            "data_correcao": correcao.data_correcao.isoformat()
        }, status=201)
    except json.JSONDecodeError:
        return JsonResponse({"error": "JSON inválido"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)