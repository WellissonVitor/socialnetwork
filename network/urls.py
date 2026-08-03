
from django.urls import path

from . import views

urlpatterns = [
    path("<str:posts_type>/<int:page_num>", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("new_post", views.new_post, name="new_post"),
    path("load_user/<str:username>", views.load_user, name="load_user"),
]
