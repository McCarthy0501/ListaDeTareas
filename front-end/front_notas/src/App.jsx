import { useState, useEffect } from 'react'
import './assets/css/index.css'
import { useTask } from './hooks/useTask'
import { API_URL,handleDelete } from './logic/logic'
import { formatDate } from '../utils/format' 
import { validateForm } from '../utils/validation'





function App() {
  
const {
  fetchTareas,
searchTerm,
setSearchTerm,
filteredTareas,
loading}=useTask()

const [showModal, setShowModal] = useState(false)
const [editingTarea, setEditingTarea] = useState(null)
const [formData, setFormData] = useState({ titulo: '', descripcion: '' })
const [errors, setErrors] = useState({})

 

  const handleSubmit = async (e) => {
    e.preventDefault()

    const errors=validateForm(formData) //llamamos las validaciones junto con los errores

    setErrors(errors) //actualizamos el estado de los errores 

    if(Object.keys(errors).length>0 ) return //si hay mas de un error no retorna nada 

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

 
  const handleEdit = (tarea) => {
    setEditingTarea(tarea)
    setFormData({ Título: tarea.titulo, Descripcion: tarea.descripcion || '' })
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
 {/* estado de carga */}  
   {loading ? (
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
                    
                  onClick={() => confirm(`Eliminar ${tarea.titulo} de tu lista de tareas? `)?(handleDelete(tarea.id,fetchTareas)):(null) }  
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
