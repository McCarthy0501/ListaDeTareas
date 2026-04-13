import * as XLSX from 'xlsx'

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const exportarExcel = (tareas, filename = 'tareas') => {
  if (!tareas || tareas.length === 0) {
    return false
  }

  const data = tareas.map(tarea => ({
    ID: tarea.id,
    Título: tarea.titulo,
    Descripción: tarea.descripcion || '',
    Prioridad: tarea.prioridad,
    Estado: tarea.completada ? 'Completada' : 'Pendiente',
    Sección: tarea.seccion_nombre || 'Sin sección',
    'Fecha de Creación': formatDate(tarea.fecha_creacion),
    'Fecha de Vencimiento': tarea.fecha_vencimiento ? formatDate(tarea.fecha_vencimiento) : 'Sin fecha'
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Tareas')

  const colWidths = [
    { wch: 5 },
    { wch: 30 },
    { wch: 50 },
    { wch: 10 },
    { wch: 12 },
    { wch: 15 },
    { wch: 20 },
    { wch: 20 }
  ]
  ws['!cols'] = colWidths

  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
  return true
}

export const exportarReportesExcel = (data) => {
  if (!data) return false

  const wb = XLSX.utils.book_new()

  const summaryData = [
    { Métrica: 'Total de Tareas', Valor: data.total },
    { Métrica: 'Tareas Completadas', Valor: data.completadas },
    { Métrica: 'Tareas Pendientes', Valor: data.pendientes },
    { Métrica: 'Creadas en 7 días', Valor: data.creadas_semana }
  ]
  const ws1 = XLSX.utils.json_to_sheet(summaryData)
  ws1['!cols'] = [{ wch: 25 }, { wch: 10 }]
  XLSX.utils.book_append_sheet(wb, ws1, 'Resumen')

  if (data.por_prioridad && data.por_prioridad.length > 0) {
    const prioridadData = data.por_prioridad.map(p => ({
      Prioridad: p.prioridad,
      Cantidad: p.count
    }))
    const ws2 = XLSX.utils.json_to_sheet(prioridadData)
    ws2['!cols'] = [{ wch: 15 }, { wch: 10 }]
    XLSX.utils.book_append_sheet(wb, ws2, 'Por Prioridad')
  }

  if (data.por_seccion && data.por_seccion.length > 0) {
    const seccionData = data.por_seccion.map(s => ({
      Sección: s.nombre,
      Total: s.total,
      Completadas: s.completadas,
      Pendientes: s.total - s.completadas
    }))
    const ws3 = XLSX.utils.json_to_sheet(seccionData)
    ws3['!cols'] = [{ wch: 20 }, { wch: 8 }, { wch: 12 }, { wch: 10 }]
    XLSX.utils.book_append_sheet(wb, ws3, 'Por Sección')
  }

  XLSX.writeFile(wb, `reportes_${new Date().toISOString().split('T')[0]}.xlsx`)
  return true
}