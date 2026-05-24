from django.db import models
from django.contrib.auth.models import AbstractUser

class Projeto(models.Model):
    titulo = models.CharField(max_length=100)
    descricao = models.TextField()
    aluno = models.CharField(max_length=50)
    orientador = models.CharField(max_length=50)

    def __str__(self):
        return self.titulo
    
    # ──────────────────────────────────────────────────────────────
    # TODO: Métodos adicionais para Projeto
    # ──────────────────────────────────────────────────────────────
    
    # def get_entregas_pendentes(self):
    #     """Retorna todas as entregas com status 'pendente'"""
    #     pass
    
    # def get_entregas_aprovadas(self):
    #     """Retorna todas as entregas com status 'aprovado'"""
    #     pass
    
    # def get_entregas_correcao(self):
    #     """Retorna todas as entregas com status 'correcao'"""
    #     pass
    
    # def total_entregas(self):
    #     """Retorna o total de entregas do projeto"""
    #     pass
    
    # def percentual_conclusao(self):
    #     """Calcula o percentual de conclusão do projeto"""
    #     pass
    

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
    
    # ──────────────────────────────────────────────────────────────
    # TODO: Métodos adicionais para Usuario
    # ──────────────────────────────────────────────────────────────
    
    # def get_projetos(self):
    #     """Retorna os projetos do usuário (como aluno ou orientador)"""
    #     pass
    
    # def is_professor(self):
    #     """Verifica se o usuário é professor"""
    #     pass
    
    # def is_aluno(self):
    #     """Verifica se o usuário é aluno"""
    #     pass
    
    
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

    descricao = models.TextField()

    arquivo = models.FileField(
        upload_to='entregas/'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS,
        default="pendente"
    )

    data_envio = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.titulo
    
    # ──────────────────────────────────────────────────────────────
    # TODO: Métodos adicionais para Entrega
    # ──────────────────────────────────────────────────────────────
    
    # def dias_atraso(self):
    #     """Calcula quantos dias a entrega está atrasada"""
    #     pass
    
    # def pode_ser_avaliada(self):
    #     """Verifica se a entrega pode ser avaliada"""
    #     pass
    
    # def get_ultima_correcao(self):
    #     """Retorna a última correção associada à entrega"""
    #     pass
    

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

    observacao = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=STATUS
    )

    data_correcao = models.DateTimeField(
        auto_now_add=True
    )

    def save(self, *args, **kwargs):

        self.entrega.status = self.status
        self.entrega.save()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Correção - {self.entrega.titulo}"
    
    # ──────────────────────────────────────────────────────────────
    # TODO: Métodos adicionais para Correcao
    # ──────────────────────────────────────────────────────────────
    
    # def notificar_aluno(self):
    #     """Envia notificação ao aluno sobre a correção"""
    #     pass
    
    # def gerar_relatorio(self):
    #     """Gera um relatório da correção"""
    #     pass