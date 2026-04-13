import { useState, useEffect } from 'react'
import './assets/css/index.css'
import { API_URL, handleDelete } from './logic/logic'
import { formatDate } from '../utils/format' 
import { validateForm } from '../utils/validation'
import { exportarExcel, exportarReportesExcel } from './utils/excel'
import { SeccionSidebar } from './components/SeccionSidebar'
import { Calendario } from './components/Calendario'
import { Reportes } from './components/Reportes'
import { useSeccion } from './hooks/useSeccion'
import { Toaster, toast } from 'react-hot-toast'

function App() {
  const { secciones, loading: loadingSecciones, fetchSecciones } = useSeccion()
  const [tareas, setTareas] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [seccionActual, setSeccionActual] = useState(null)
  const [seccionNombreActual, setSeccionNombreActual] = useState('Todas las tareas')
  const [vistaActual, setVistaActual] = useState('tareas')
  const [tareasCalendario, setTareasCalendario] = useState([])

  const fetchTareas = async () => {
    setLoading(true)
    try {
      let url = `${API_URL}/tareas/`
      if (seccionActual) {
        url += `?seccion=${seccionActual}`
      }
      const response = await fetch(url)
      const data = await response.json()
      setTareas(data.results || data)
    } catch (error) {
      console.error('Error fetching tareas:', error)
      toast.error('Error al cargar las tareas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTareas()
  }, [seccionActual])

  const filteredTareas = tareas.filter(tarea =>
    tarea.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tarea.descripcion && tarea.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const [showModal, setShowModal] = useState(false)
  const [editingTarea, setEditingTarea] = useState(null)
  const [formData, setFormData] = useState({ titulo: '', descripcion: '', prioridad: 'media', seccion: '', fecha_vencimiento: '' })
  const [errors, setErrors] = useState({})

  const handleOpenModal = () => {
    if (secciones.length === 0) {
      toast.error('Primero crea una sección para poder agregar tareas')
      return
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (secciones.length === 0) {
      toast.error('Primero crea una sección para poder agregar tareas')
      return
    }

    if (!formData.seccion) {
      toast.error('Debes seleccionar una sección para la tarea')
      setErrors({ ...errors, seccion: 'Debes seleccionar una sección' })
      return
    }

    const errors = validateForm(formData)
    setErrors(errors)
    if (Object.keys(errors).length > 0) return

    try {
      const url = editingTarea 
        ? `${API_URL}/tareas/${editingTarea.id}/`
        : `${API_URL}/tareas/`
      const method = editingTarea ? 'PUT' : 'POST'
      
      const payload = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        prioridad: formData.prioridad,
        seccion: formData.seccion || null,
        fecha_vencimiento: formData.fecha_vencimiento || null
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast.success(editingTarea ? 'Tarea actualizada correctamente' : 'Tarea creada correctamente')
        fetchTareas()
        closeModal()
      } else {
        toast.error('Error al guardar la tarea')
      }
    } catch (error) {
      console.error('Error saving tarea:', error)
      toast.error('Error al guardar la tarea')
    }
  }

  const handleEdit = (tarea) => {
    setEditingTarea(tarea)
    setFormData({ 
      titulo: tarea.titulo, 
      descripcion: tarea.descripcion || '',
      prioridad: tarea.prioridad || 'media',
      seccion: tarea.seccion || '',
      fecha_vencimiento: tarea.fecha_vencimiento || ''
    })
    setShowModal(true)
  }

  const handleComplete = async (tarea) => {
    try {
      const response = await fetch(`${API_URL}/tareas/${tarea.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tarea, completada: !tarea.completada })
      })
      if (response.ok) {
        toast.success(tarea.completada ? 'Tarea desmarcada' : 'Tarea completada')
        fetchTareas()
      } else {
        toast.error('Error al actualizar la tarea')
      }
    } catch (error) {
      console.error('Error completing tarea:', error)
      toast.error('Error al actualizar la tarea')
    }
  }

  const handleDeleteTarea = async (tarea) => {
    if (confirm(`Eliminar ${tarea.titulo} de tu lista de tareas?`)) {
      try {
        await handleDelete(tarea.id, fetchTareas)
        toast.success('Tarea eliminada correctamente')
      } catch (error) {
        toast.error('Error al eliminar la tarea')
      }
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingTarea(null)
    setFormData({ titulo: '', descripcion: '', prioridad: 'media', seccion: '', fecha_vencimiento: '' })
    setErrors({})
  }

  const getPrioridadColor = (prioridad) => {
    switch(prioridad) {
      case 'alta': return 'prioridad-alta'
      case 'media': return 'prioridad-media'
      case 'baja': return 'prioridad-baja'
      default: return ''
    }
  }

  const handleSeccionChange = (id, nombre) => {
    setSeccionActual(id)
    setSeccionNombreActual(nombre)
    if (id === null) {
      toast.success('Mostrando todas las tareas')
    } else {
      toast.success(`Mostrando tareas de: ${nombre}`)
    }
  }

  const handleFechaSelect = (tareas, fecha) => {
    setTareasCalendario(tareas)
  }

  const handleExportarExcel = () => {
    if (tareasCalendario.length > 0) {
      const success = exportarExcel(tareasCalendario, 'tareas_fecha')
      if (success) {
        toast.success('Excel exportado correctamente')
      } else {
        toast.error('Error al exportar')
      }
    } else {
      toast.error('No hay tareas para exportar')
    }
  }

  const handleExportarTareas = () => {
    if (filteredTareas.length > 0) {
      const success = exportarExcel(filteredTareas, 'tareas')
      if (success) {
        toast.success('Excel exportado correctamente')
      } else {
        toast.error('Error al exportar')
      }
    } else {
      toast.error('No hay tareas para exportar')
    }
  }

  return (
    <div className="container">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1A1D29',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#4CAF50',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF4D4D',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="main-layout">
        <SeccionSidebar 
          secciones={secciones} 
          fetchSecciones={fetchSecciones}
          seccionActual={seccionActual}
          setSeccionActual={(id) => {
            const nombre = id === null ? 'Todas las tareas' : secciones.find(s => s.id === id)?.nombre || 'Todas las tareas'
            handleSeccionChange(id, nombre)
          }}
          seccionNombreActual={seccionNombreActual}
        />
        
        <div className="content-area">
          <div className="nav-tabs">
            <button 
              className={`nav-tab ${vistaActual === 'tareas' ? 'active' : ''}`}
              onClick={() => setVistaActual('tareas')}
            >
              📋 Tareas
            </button>
            <button 
              className={`nav-tab ${vistaActual === 'calendario' ? 'active' : ''}`}
              onClick={() => setVistaActual('calendario')}
            >
              📅 Calendario
            </button>
            <button 
              className={`nav-tab ${vistaActual === 'reportes' ? 'active' : ''}`}
              onClick={() => setVistaActual('reportes')}
            >
              📊 Reportes
            </button>
          </div>

          {vistaActual === 'tareas' && (
            <>
              <header className="header">
                <div className="header-top">
                  <div>
                    <h1>Lista de Tareas</h1>
                    <p className="seccion-actual-label">{seccionNombreActual}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      className="export-btn" 
                      onClick={handleExportarTareas}
                      disabled={filteredTareas.length === 0}
                    >
                      📥 Excel
                    </button>
                    <button 
                      className="btn-add" 
                      onClick={handleOpenModal}
                      disabled={secciones.length === 0}
                      style={{ opacity: secciones.length === 0 ? 0.5 : 1 }}
                      title={secciones.length === 0 ? 'Crea primero una sección' : 'Agregar Tarea'}
                    >
                      <span>+</span> Agregar Tarea
                    </button>
                  </div>
                </div>
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Buscar tareas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </header>

              <main className="tareas-panel">
                {secciones.length === 0 ? (
                  <div className="empty-state">
                    <p>No hay secciones creadas. ¡Crea una sección para comenzar!</p>
                  </div>
                ) : loading ? (
                  <div className="empty-state">
                    <p>Cargando tareas...</p>
                  </div>
                ) : filteredTareas.length === 0 ? (
                  <div className="empty-state">
                    <p>{searchTerm ? 'No se encontraron tareas' : 'No hay tareas registradas. ¡Agrega una!'}</p>
                  </div>
                ) : (
                  <div className="tareas-list">
                    {filteredTareas.map(tarea => (
                      <div key={tarea.id} className={`tarea-item ${tarea.completada ? 'completada' : ''}`}>
                        <div className="tarea-info">
                          <div className="tarea-header">
                            <h3 className="tarea-titulo" style={{ 
                              textDecoration: tarea.completada ? 'line-through' : 'none',
                              opacity: tarea.completada ? 0.6 : 1
                            }}>
                              {tarea.titulo}
                            </h3>
                            <span className={`prioridad-badge ${getPrioridadColor(tarea.prioridad)}`}>
                              {tarea.prioridad}
                            </span>
                          </div>
                          {tarea.descripcion && (
                            <p className="tarea-descripcion">{tarea.descripcion}</p>
                          )}
                          <p className="tarea-fecha">Creada: {formatDate(tarea.fecha_creacion)}</p>
                          {tarea.seccion_nombre && (
                            <span className="tarea-seccion">{tarea.seccion_nombre}</span>
                          )}
                        </div>
                        <div className="tarea-actions">
                          <button 
                            className="btn-action btn-complete"
                            onClick={() => handleComplete(tarea)}
                          >
                            {tarea.completada ? 'Desmarcar' : 'Completar'}
                          </button>
                          <button 
                            className="btn-action btn-edit"
                            onClick={() => handleEdit(tarea)}
                          >
                            Editar
                          </button>
                          <button 
                            className="btn-action btn-delete"
                            onClick={() => handleDeleteTarea(tarea)}  
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </main>
            </>
          )}

          {vistaActual === 'calendario' && (
            <>
              <header className="header">
                <h1>Calendario de Tareas</h1>
              </header>
              <Calendario onFechaSelect={handleFechaSelect} />
              <div className="action-buttons" style={{ marginTop: '20px' }}>
                <button 
                  className="export-btn" 
                  onClick={handleExportarExcel}
                  disabled={tareasCalendario.length === 0}
                >
                  📥 Exportar a Excel
                </button>
              </div>
            </>
          )}

          {vistaActual === 'reportes' && (
            <>
              <header className="header">
                <div className="header-top">
                  <h1>Reportes</h1>
                  <button 
                    className="export-btn" 
                    onClick={() => {
                      fetch(`${API_URL}/tareas/reportes/`).then(r => r.json()).then(data => {
                        const success = exportarReportesExcel(data)
                        if (success) {
                          toast.success('Reportes exportados correctamente')
                        } else {
                          toast.error('Error al exportar reportes')
                        }
                      })
                    }}
                  >
                    📥 Exportar Reportes
                  </button>
                </div>
              </header>
              <Reportes />
            </>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingTarea ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Título de la tarea</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder={editingTarea ? formData.titulo : "titulo de la tarea"}
                />
                {errors.titulo && <p className="error-text">{errors.titulo}</p>}
              </div>
              <div className="form-group">
                <label>Descripción (opcional)</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder={editingTarea ? formData.descripcion : "Descripcion de la tarea"}
                />
                {errors.descripcion && <p className="error-text">{errors.descripcion}</p>}
              </div>
              <div className="form-group">
                <label>Prioridad</label>
                <select
                  value={formData.prioridad}
                  onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                >
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>
              <div className="form-group">
                <label>Sección</label>
                <select
                  value={formData.seccion}
                  onChange={(e) => {
                    setFormData({ ...formData, seccion: e.target.value })
                    setErrors({ ...errors, seccion: null })
                  }}
                >
                  <option value="">Selecciona una sección</option>
                  {secciones.map(seccion => (
                    <option key={seccion.id} value={seccion.id}>{seccion.nombre}</option>
                  ))}
                </select>
                {errors.seccion && <p className="error-text">{errors.seccion}</p>}
              </div>
              <div className="form-group">
                <label>Fecha de vencimiento (opcional)</label>
                <input
                  type="date"
                  value={formData.fecha_vencimiento}
                  onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-action btn-cancel" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  {editingTarea ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App