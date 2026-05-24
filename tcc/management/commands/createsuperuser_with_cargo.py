from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
import getpass

User = get_user_model()


class Command(BaseCommand):
    help = 'Cria um superusuário com username, email, password e cargo'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            dest='username',
            help='Username do superusuário',
        )
        parser.add_argument(
            '--email',
            dest='email',
            help='Email do superusuário',
        )
        parser.add_argument(
            '--password',
            dest='password',
            help='Senha do superusuário',
        )
        parser.add_argument(
            '--cargo',
            dest='cargo',
            choices=['aluno', 'orientador'],
            default='orientador',
            help='Cargo do superusuário (aluno ou orientador). Padrão: orientador',
        )

    def handle(self, *args, **options):
        username = options.get('username')
        email = options.get('email')
        password = options.get('password')
        cargo = options.get('cargo', 'orientador')

        # Se username não foi fornecido, solicitar interativamente
        if not username:
            username = input('Username: ')

        # Se email não foi fornecido, solicitar interativamente
        if not email:
            email = input('Email: ')

        # Se password não foi fornecido, solicitar interativamente
        if not password:
            while True:
                password = getpass.getpass('Password: ')
                password_confirm = getpass.getpass('Password (again): ')
                if password != password_confirm:
                    self.stdout.write(
                        self.style.ERROR('As senhas não coincidem. Tente novamente.')
                    )
                    continue
                break

        # Solicitar cargo se não foi fornecido via argumento
        if options.get('cargo') is None or options.get('cargo') == 'orientador':
            cargo_prompt = input('Cargo (aluno/orientador) [orientador]: ').strip().lower()
            cargo = cargo_prompt if cargo_prompt in ['aluno', 'orientador'] else 'orientador'

        # Verificar se o usuário já existe
        if User.objects.filter(username=username).exists():
            raise CommandError(f'O usuário com username "{username}" já existe.')

        if User.objects.filter(email=email).exists():
            raise CommandError(f'O usuário com email "{email}" já existe.')

        # Criar superusuário
        try:
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password,
                cargo=cargo
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f'Superusuário "{username}" criado com sucesso!\n'
                    f'  Email: {email}\n'
                    f'  Cargo: {cargo}'
                )
            )
        except Exception as e:
            raise CommandError(f'Erro ao criar superusuário: {str(e)}')
