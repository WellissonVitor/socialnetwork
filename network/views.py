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


def index(request):
    return HttpResponseRedirect(reverse(posts, args=['all',1]))


def posts(request, posts_type="all", page_num=1):
    context = load_posts(request, posts_type, page_num)
    return render(request, "network/index.html", context)


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
        "message": "Invalid request."
    })


def load_user(request, username, page_num=1):
    if username == None:
        return render(request, "network/profile.html", {
        "message": "Invalid user"
    })

    # Get user data and serialize it
    user = User.objects.get(username=username)

    # Get user follower, following and posts
    follows = len(user.followers.all())
    followings = len(user.following.all())


    return render(request, "network/profile.html", {
        "user_info": {
            "username": user.username,
            "pic_url": user.pic_url,
            "member_since": user.creation_date,
        },
        "follows": follows,
        "followings": followings,
        "user_posts": load_posts(request, posts_type=username, page_num=1)
    })


def load_posts(request, posts_type="all", page_num=1):
    # Get user posts if requesting from user page
    try:
        user = User.objects.get(username=posts_type)

        all_posts = Post.objects.filter(poster=user).order_by("-timestamp")
    # Get all or following posts
    except:
        if posts_type == "all":
            # Get all posts
            all_posts = Post.objects.all().order_by("-timestamp")

        elif posts_type == "following":
            if request.user.is_authenticated:
                # Get the ids of user followings
                following_users = Follow.objects.filter(follower=request.user).values_list("following")
        
                # Get all following posts
                all_posts = Post.objects.filter(poster__in=following_users).order_by("-timestamp")
            else:
                return {"message": "Login required."}
        else:
            return {
                "message": "Invalid request."
            }

    # Paginates posts
    paginated_posts = Paginator(all_posts, 10)
    
    if page_num not in paginated_posts.page_range:
        return {
            "message": "Invalid page."
        }

    # Get the posts based on the requested page
    posts_page = paginated_posts.get_page(page_num)
    
    return {
        "new_post_form": NewPostForm,
        "posts": [post.serialize() for post in posts_page],
        "pagination": {
            "current": posts_page.number,
            "total_pages": paginated_posts.num_pages,
            "has_next": posts_page.has_next(),
            "has_previous": posts_page.has_previous(),
            "next": posts_page.next_page_number() if posts_page.has_next() else None,
            "previous": posts_page.previous_page_number() if posts_page.has_previous() else None,
        },
        "type": posts_type
    }

#@login_required(login_url=("index"))