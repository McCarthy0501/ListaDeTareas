from rest_framework import serializers
from .models import Tarea, Seccion


class SeccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seccion
        fields = ['id', 'nombre', 'fecha_creacion']
        read_only_fields = ['id', 'fecha_creacion']


class TareaSerializer(serializers.ModelSerializer):
    seccion_nombre = serializers.CharField(source='seccion.nombre', read_only=True)
    
    class Meta:
        model = Tarea
        fields = ['id', 'titulo', 'descripcion', 'completada', 'prioridad', 'prioridad_orden', 'seccion', 'seccion_nombre', 'fecha_creacion', 'fecha_actualizacion']
        read_only_fields = ['id', 'prioridad_orden', 'fecha_creacion', 'fecha_actualizacion']
