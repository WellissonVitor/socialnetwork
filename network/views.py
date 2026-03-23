import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse

from .forms import NewPostForm
from .models import Follow, Like, Post, User


def index(request, posts=None):
    return render(request, "network/index.html", {
        'new_post_form': NewPostForm
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@login_required(login_url="login")
def new_post(request):
    if request.method == "POST":
        new_post_form = NewPostForm(request.POST)
        if new_post_form.is_valid():
            new_post = new_post_form.save(commit=False)
            new_post.poster = request.user
            new_post.save()
        
        return HttpResponseRedirect(reverse("index"))

    return render(request, "network/index.html", {
        "error": "Invalid request."
    })


def load_posts(request, posts):
    if posts == "all":
        posts = Post.objects.all().order_by('-timestamp')
    elif posts == "following" and request.user.is_authenticated:
        # Get the ids of the user followings
        following_users = Follow.objects.filter(follower=request.user).values_list("following")

        posts = Post.objects.filter(poster__in=following_users).order_by("-timestamp")
    else:
        return JsonResponse({"error": "Invalid posts request."}, status=400)
    
    return JsonResponse([post.serialize() for post in posts], safe=False)


def load_user(request, user):
    pass