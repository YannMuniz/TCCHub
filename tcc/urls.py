from django.urls import path
from . import views

app_name = 'tcc'

urlpatterns = [
    path('', views.login_view, name='login'),
    path('aluno/', views.index_aluno, name='index_aluno'),
    path('professor/', views.index_professor, name='index_professor'),
]