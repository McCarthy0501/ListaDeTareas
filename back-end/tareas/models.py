from django.db import models


class Seccion(models.Model):
    nombre = models.CharField(max_length=100)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre


class Tarea(models.Model):
    
    PRIORIDAD_CHOICES = [
        ('alta', 'Alta'),
        ('media', 'Media'),
        ('baja', 'Baja'),
    ]
    
    PRIORIDAD_ORDEN = {
        'alta': 1,
        'media': 2,
        'baja': 3,
    }
    
    titulo = models.CharField(max_length=200, db_index=True)
    descripcion = models.TextField(blank=True, null=True)
    completada = models.BooleanField(default=False, db_index=True)
    prioridad = models.CharField(max_length=10, choices=PRIORIDAD_CHOICES, default='media')
    prioridad_orden = models.IntegerField(default=2, editable=False)
    seccion = models.ForeignKey(Seccion, on_delete=models.CASCADE, null=True, blank=True, related_name='tareas')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.prioridad_orden = self.PRIORIDAD_ORDEN.get(self.prioridad, 2)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.titulo
