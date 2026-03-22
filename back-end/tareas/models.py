from django.db import models

class Tarea(models.Model):
    
    titulo = models.CharField(max_length=200,db_index=True)
    descripcion = models.TextField(blank=True, null=True)
    completada = models.BooleanField(default=False,db_index=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.titulo
