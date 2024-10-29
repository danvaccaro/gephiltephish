from django.urls import path
from . import views

urlpatterns = [
    path('submit/', views.submit, name='submit'),    
    path('vote/', views.vote), 
    path('vote_page/', views.vote_page, name="vote_page"),
    path('get_emails/', views.get_emails),
    path('predict/', views.predict),
    path('login/', views.login),
    path('register/', views.register),
]