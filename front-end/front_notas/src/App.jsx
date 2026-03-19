import { useState, useEffect } from 'react'
import './assets/css/index.css'
import { API_URL } from './logic/logic.js'




function App() {
  const [tareas, setTareas] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTarea, setEditingTarea] = useState(null)
  const [formData, setFormData] = useState({ titulo: '', descripcion: '' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchTareas()
  }, [])

  const fetchTareas = async () => {
    try {
      console.log('🔍 Fetching from:', `${API_URL}/tareas/`);
      const response = await fetch(`${API_URL}/tareas/`)
      const data = await response.json()
      setTareas(data)
      
    } catch (error) {
      console.error('❌ Error response:', text.substring(0, 200));
      console.error('Error fetching tareas:', error)
      console.log(data)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    const tituloTrimmed = formData.titulo.trim()
    const descripcionTrimmed = formData.descripcion.trim()

    if (!tituloTrimmed) {
      newErrors.titulo = 'El título es requerido'
    } else if (tituloTrimmed.length === 0 || /^\s+$/.test(tituloTrimmed)) {
      newErrors.titulo = 'El título no puede ser solo espacios en blanco'
    } else if (/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_.,]/.test(tituloTrimmed)) {
      newErrors.titulo = 'El título contiene demasiados caracteres especiales'
    } else if (tituloTrimmed.length > 100) {
      newErrors.titulo = 'El título no puede exceder 100 caracteres'
    }

    if (descripcionTrimmed && /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_.,!?]/.test(descripcionTrimmed)) {
      newErrors.descripcion = 'La descripción contiene demasiados caracteres especiales'
    } else if (descripcionTrimmed.length > 500) {
      newErrors.descripcion = 'La descripción no puede exceder 500 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      const url = editingTarea 
        ? `${API_URL}/tareas/${editingTarea.id}/`
        : `${API_URL}/tareas/`
      const method = editingTarea ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: formData.titulo.trim(),
          descripcion: formData.descripcion.trim()
        })
      })

      if (response.ok) {
        fetchTareas()
        closeModal()
      }
    } catch (error) {
      console.error('Error saving tarea:', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/tareas/${id}/`, { method: 'DELETE' })
      fetchTareas()
    } catch (error) {
      console.error('Error deleting tarea:', error)
    }
  }

  const handleEdit = (tarea) => {
    setEditingTarea(tarea)
    setFormData({ titulo: tarea.titulo, descripcion: tarea.descripcion || '' })
    setShowModal(true)
  }

  const handleComplete = async (tarea) => {
    try {
      await fetch(`${API_URL}/tareas/${tarea.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tarea, completada: !tarea.completada })
      })
      fetchTareas()
    } catch (error) {
      console.error('Error completing tarea:', error)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingTarea(null)
    setFormData({ titulo: '', descripcion: '' })
    setErrors({})
  }

  const filteredTareas = tareas.filter(tarea =>
    tarea.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tarea.descripcion && tarea.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container">
      <header className="header">
        <div className="header-top">
          <h1>Lista de Tareas</h1>
          <button className="btn-add" onClick={() => setShowModal(true)}>
            <span>+</span> Agregar Tarea
          </button>
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
        {filteredTareas.length === 0 ? (
          <div className="empty-state">
            <p>{searchTerm ? 'No se encontraron tareas' : 'No hay tareas yet. ¡Agrega una!'}</p>
          </div>
        ) : (
          <div className="tareas-list">
            {filteredTareas.map(tarea => (
              <div key={tarea.id} className="tarea-item">
                <div className="tarea-info">
                  <h3 className="tarea-titulo" style={{ 
                    textDecoration: tarea.completada ? 'line-through' : 'none',
                    opacity: tarea.completada ? 0.6 : 1
                  }}>
                    {tarea.titulo}
                  </h3>
                  {tarea.descripcion && (
                    <p className="tarea-descripcion">{tarea.descripcion}</p>
                  )}
                  <p className="tarea-fecha">Creada: {formatDate(tarea.fecha_creacion)}</p>
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
                    onClick={() => handleDelete(tarea.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

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
                  placeholder="Ingresa el título"
                />
                {errors.titulo && <p className="error-text">{errors.titulo}</p>}
              </div>
              <div className="form-group">
                <label>Descripción (opcional)</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Ingresa la descripción"
                />
                {errors.descripcion && <p className="error-text">{errors.descripcion}</p>}
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
