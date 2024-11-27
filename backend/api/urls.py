from django.urls import path
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from . import views

@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'detail': 'CSRF cookie set'})

urlpatterns = [
    # Authentication endpoints
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('csrf/', get_csrf_token, name='csrf'),
    
    # API endpoints
    path('submit/', views.submit, name='submit'),    
    path('vote/', views.vote, name='vote'), 
    path('predict/', views.predict, name='predict'),
    path('get_emails/', views.get_emails, name='get_emails'),
    path('delete_email/<int:email_id>/', views.delete_email, name='delete_email'),
]
