from django.contrib import admin
from django.urls import path

from . import views

app_name = 'freshmart'

urlpatterns = [
    path('', views.home, name='home'),
    path('admin/', admin.site.urls),
    path('shop/', views.shop, name='shop'),
    path('contact/', views.contact, name='contact'),
    
]
