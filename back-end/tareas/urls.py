from django.urls import path
from .views import TareaListCreate, TareaDetail

urlpatterns = [
    path('tareas/', TareaListCreate.as_view(), name='tarea-list-create'),
    path('tareas/<int:pk>/', TareaDetail.as_view(), name='tarea-detail'),
]
