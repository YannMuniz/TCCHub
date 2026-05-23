from django.db import models
from django.contrib.auth.models import AbstractUser

class Projeto(models.Model):
    titulo = models.CharField(max_length=100)
    descricao = models.TextField()
    aluno = models.CharField(max_length=50)
    orientador = models.CharField(max_length=50)

    def __str__(self):
        return self.titulo
    

class Usuario(AbstractUser):
    cargo = models.CharField(
        max_length=50,
        choices=[
            ("aluno", "Aluno"),
            ("orientador", "Orientador"),
        ],
        default="aluno"
    )

    def str(self):
        return f"{self.username} ({self.cargo})"
    
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