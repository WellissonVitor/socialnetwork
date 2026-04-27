import json
import random
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
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

        # Generate a random user pic
        seed = random.randint(1, 100000)
        pic_url = f"https://api.dicebear.com/7.x/avataaars/svg?seed={seed}"

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password, pic_url=pic_url)
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


def load_posts(request, posts_type):
    if posts_type == "all":
        # Get all posts
        all_posts = Post.objects.all().order_by('-timestamp')

    elif posts_type == "following" and request.user.is_authenticated:
        # Get the ids of the user followings
        following_users = Follow.objects.filter(follower=request.user).values_list("following")

        # Get all following posts
        all_posts = Post.objects.filter(poster__in=following_users).order_by("-timestamp")
    else:
        try:
            user_id = int(posts_type)
            if posts_type not in User.objects.all():
                return JsonResponse({"invalid_user": "User do not exists."}, status=400)
        except:
            return JsonResponse({"invalid_posts_request": "Invalid request."}, status=400)

    # Paginates posts
    paginated_posts = Paginator(all_posts, 10)

    # Get page number from request url
    page_num = request.GET.get('page', 1)

    # Get the posts based on the requested page
    posts_page = paginated_posts.get_page(page_num)

    # Turn posts and pagination into a jsonresponse
    response = {
        "posts": [post.serialize() for post in posts_page],
        "pagination": {
            "current": posts_page.number,
            "total_pages": paginated_posts.num_pages,
            "has_next": posts_page.has_next(),
            "has_previous": posts_page.has_previous(),
            "next": posts_page.next_page_number() if posts_page.has_next() else None,
            "previous": posts_page.previous_page_number() if posts_page.has_previous() else None,
        }
    }
    
    return JsonResponse(response, safe=False)


def load_user(request, user_id):
    user = User.objects.get(pk=user_id)
    followers = user.followers.all()
    followings = user.following.all()