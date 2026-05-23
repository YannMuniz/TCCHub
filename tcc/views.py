from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, redirect
from django.contrib.auth.forms import AuthenticationForm

def login_view(request):
    if request.method == "POST":
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)

            # salvar cargo e id na session
            request.session["cargo"] = user.cargo
            request.session["user_id"] = user.id

            return redirect("principal")
    else:
        form = AuthenticationForm()
    return render(request, "tcc/login.html", {"form": form})

def logout_view(request):
    logout(request)
    return redirect("login")
