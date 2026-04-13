from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from datetime import datetime, timedelta
from .models import Tarea, Seccion
from .serializers import TareaSerializer, SeccionSerializer
from rest_framework.pagination import PageNumberPagination

class TareaPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class SeccionListCreate(APIView):
    def get(self, request):
        secciones = Seccion.objects.all().order_by('-fecha_creacion')
        serializer = SeccionSerializer(secciones, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SeccionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SeccionDetail(APIView):
    def get(self, request, pk):
        seccion = get_object_or_404(Seccion, pk=pk)
        serializer = SeccionSerializer(seccion)
        return Response(serializer.data)

    def put(self, request, pk):
        seccion = get_object_or_404(Seccion, pk=pk)
        serializer = SeccionSerializer(seccion, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        seccion = get_object_or_404(Seccion, pk=pk)
        seccion.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TareaListCreate(APIView):
    def get(self, request):
        seccion_id = request.query_params.get('seccion')
        
        if seccion_id:
            tareas = Tarea.objects.filter(seccion_id=seccion_id)
        else:
            tareas = Tarea.objects.all()
            
        tareas = tareas.order_by('prioridad_orden', '-fecha_creacion')
        paginator = TareaPagination()
        result = paginator.paginate_queryset(tareas, request)
        serializer = TareaSerializer(result, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = TareaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TareaDetail(APIView):
    def get(self, request, pk):
        tarea = get_object_or_404(Tarea, pk=pk)
        serializer = TareaSerializer(tarea)
        return Response(serializer.data)

    def put(self, request, pk):
        tarea = get_object_or_404(Tarea, pk=pk)
        serializer = TareaSerializer(tarea, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        tarea = get_object_or_404(Tarea, pk=pk)
        tarea.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TareaPorFecha(APIView):
    def get(self, request):
        fecha = request.query_params.get('fecha')
        if not fecha:
            return Response({'error': 'Se requiere parámetro fecha'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            fecha_obj = datetime.strptime(fecha, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)
        
        tareas = Tarea.objects.filter(fecha_vencimiento=fecha_obj).order_by('prioridad_orden', '-fecha_creacion')
        serializer = TareaSerializer(tareas, many=True)
        return Response(serializer.data)


class ReporteTareas(APIView):
    def get(self, request):
        total = Tarea.objects.count()
        completadas = Tarea.objects.filter(completada=True).count()
        pendientes = Tarea.objects.filter(completada=False).count()
        
        por_prioridad = Tarea.objects.values('prioridad').annotate(count=Count('id'))
        
        por_seccion = Seccion.objects.annotate(
            total=Count('tareas'),
            completadas=Count('tareas', filter=Q(tareas__completada=True))
        ).values('nombre', 'total', 'completadas')
        
        ultimos_7_dias = datetime.now().date() - timedelta(days=7)
        creadas_semana = Tarea.objects.filter(fecha_creacion__date__gte=ultimos_7_dias).count()
        
        return Response({
            'total': total,
            'completadas': completadas,
            'pendientes': pendientes,
            'por_prioridad': list(por_prioridad),
            'por_seccion': list(por_seccion),
            'creadas_semana': creadas_semana
        })
