from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Tarea
from .serializers import TareaSerializer
from rest_framework.pagination import PageNumberPagination

class TareaPagination(PageNumberPagination):
    page_size = 20  # tareas por página
    page_size_query_param = 'page_size'
    max_page_size = 100


class TareaListCreate(APIView):
    def get(self, request):
        tareas = Tarea.objects.all()
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
