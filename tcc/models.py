from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class Projeto(models.Model):
    titulo = models.CharField(max_length=100)
    descricao = models.TextField()
    aluno = models.ForeignKey(
        'Usuario',
        on_delete=models.CASCADE,
        related_name='projetos_como_aluno'
    )
    orientador = models.ForeignKey(
        'Usuario',
        on_delete=models.CASCADE,
        related_name='projetos_como_orientador'
    )
    data_criacao = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo

    def get_entregas_pendentes(self):
        return self.entregas.filter(status='pendente')

    def get_entregas_aprovadas(self):
        return self.entregas.filter(status='aprovado')

    def get_entregas_correcao(self):
        return self.entregas.filter(status='correcao')  # era 'corracao' — typo corrigido

    def total_entregas(self):
        return self.entregas.count()

    def percentual_conclusao(self):
        total = self.total_entregas()
        if total == 0:
            return 0
        aprovadas = self.get_entregas_aprovadas().count()
        return round((aprovadas / total) * 100, 2)


class Usuario(AbstractUser):
    cargo = models.CharField(
        max_length=50,
        choices=[
            ("aluno", "Aluno"),
            ("orientador", "Orientador"),
        ],
        default="aluno"
    )

    def __str__(self):
        return f"{self.username} ({self.cargo})"

    def get_projetos_como_aluno(self):
        return self.projetos_como_aluno.all()

    def get_projetos_como_orientador(self):
        return self.projetos_como_orientador.all()

    def is_professor(self):
        return self.cargo == "orientador"

    def is_aluno(self):
        return self.cargo == "aluno"


class Entrega(models.Model):
    STATUS = [
        ("pendente", "Pendente"),
        ("aprovado", "Aprovado"),
        ("correcao", "Correção"),
    ]

    projeto = models.ForeignKey(
        Projeto,
        on_delete=models.CASCADE,
        related_name='entregas'
    )
    titulo = models.CharField(max_length=100)
    descricao = models.TextField(blank=True)
    arquivo = models.FileField(upload_to='entregas/')
    status = models.CharField(max_length=20, choices=STATUS, default="pendente")
    data_envio = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo

    def dias_desde_envio(self):
        return (timezone.now() - self.data_envio).days

    def pode_ser_avaliada(self):
        return self.status == "pendente"


# Classe única e limpa — removida a definição duplicada que estava causando o conflito
class Correcao(models.Model):
    STATUS = [
        ("aprovado", "Aprovado"),
        ("correcao", "Correção"),
    ]

    entrega = models.ForeignKey(
        Entrega,
        on_delete=models.CASCADE,
        related_name='correcoes'
    )
    orientador = models.ForeignKey(
        'Usuario',
        on_delete=models.CASCADE,
        related_name='correcoes_realizadas',
        null=True,
        blank=True
    )
    observacao = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS)
    data_correcao = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Propaga o status para a entrega — ponto único de atualização
        self.entrega.status = self.status
        self.entrega.save(update_fields=['status'])
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Correção - {self.entrega.titulo} ({self.get_status_display()})"

    def notificar_aluno(self):
        return f"Notificação enviada para o aluno do projeto: {self.entrega.projeto.aluno}"

    def gerar_relatorio(self):
        return {
            "projeto": self.entrega.projeto.titulo,
            "entrega": self.entrega.titulo,
            "status": self.get_status_display(),
            "observacao": self.observacao,
            "data": self.data_correcao.strftime("%d/%m/%Y %H:%M")
        }

class Comentario(models.Model):
    entrega = models.ForeignKey(
        Entrega,
        on_delete=models.CASCADE,
        related_name='comentarios'
    )
    autor = models.ForeignKey(
        'Usuario',
        on_delete=models.CASCADE,
        related_name='comentarios_enviados'
    )
    texto = models.TextField()
    data_comentario = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Nota de {self.autor.username} em '{self.entrega.titulo}'"