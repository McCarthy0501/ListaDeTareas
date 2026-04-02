from django.urls import path
from .views import TareaListCreate, TareaDetail, SeccionListCreate, SeccionDetail

urlpatterns = [
    path('tareas/', TareaListCreate.as_view(), name='tarea-list-create'),
    path('tareas/<int:pk>/', TareaDetail.as_view(), name='tarea-detail'),
    path('secciones/', SeccionListCreate.as_view(), name='seccion-list-create'),
    path('secciones/<int:pk>/', SeccionDetail.as_view(), name='seccion-detail'),
]
