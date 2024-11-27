from .views_auth import RegisterView, login, logout
from .views_email import submit, predict
from .views_vote import get_emails, vote, delete_email
#from .views_openai import openai_analyze

# Re-export views
__all__ = [
    'RegisterView',
    'login',
    'logout',
    'submit',
    'predict',
    'get_emails',
    'vote',
    'delete_email'
    #'openai_analyze'
]
