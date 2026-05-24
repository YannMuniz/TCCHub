from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class Projeto(models.Model):
    titulo = models.CharField(max_length=100)
    descricao = models.TextField()
    aluno = models.CharField(max_length=50)
    orientador = models.CharField(max_length=50)

    def __str__(self):
        return self.titulo
      
    def get_entregas_pendentes(self):
        return self.entregas.filter(status='pendente')
    
    def get_entregas_aprovadas(self):
        return self.entregas.filter(status='aprovado')
    
    def get_entregas_correcao(self):
        return self.entregas.filter(status='corracao')
    
    def total_entregas(self):
        return self.entregas.count()
    
    def percentual_conclusao(self):
        total = self.total_entregas()
        if total ==0:
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
    
    def get_projetos(self):
        if self.cargo == "aluno":
            return Projeto.objecs.filter(aluno=self.username)
        return Projeto.objects.filter(orientador=self.username)
    
    def is_professor(self):
        return self.cargo == "orientador"
    
    def is_aluno(self):
        return self.carog == "aluno"
    
    
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
       
    def dias_atraso(self):    
        diferenca = timezone.now() - self.data_envio
        return diferenca.days
    
    def pode_ser_avaliada(self):
        return self.status == "pendente"
    
    def get_ultima_correcao(self):
        return self.correcoes.order_by('-data_correcao').first()
    

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