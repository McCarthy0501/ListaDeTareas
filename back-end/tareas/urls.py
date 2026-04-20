from django.urls import path
from .views import TareaListCreate, TareaDetail, SeccionListCreate, SeccionDetail, TareaPorFecha, ReporteTareas, ReporteEstadisticas

urlpatterns = [
    path('tareas/', TareaListCreate.as_view(), name='tarea-list-create'),
    path('tareas/<int:pk>/', TareaDetail.as_view(), name='tarea-detail'),
    path('tareas/por-fecha/', TareaPorFecha.as_view(), name='tarea-por-fecha'),
    path('secciones/', SeccionListCreate.as_view(), name='seccion-list-create'),
    path('secciones/<int:pk>/', SeccionDetail.as_view(), name='seccion-detail'),
    path('reportes/', ReporteTareas.as_view(), name='reporte-tareas'),
    path('reportes/estadisticas/', ReporteEstadisticas.as_view(), name='reporte-estadisticas'),
]
