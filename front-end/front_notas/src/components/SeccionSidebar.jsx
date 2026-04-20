import { useState } from 'react'
import { createSeccion, handleDeleteSeccion, updateSeccion } from '../logic/logic'
import { toast } from 'react-hot-toast'

export const SeccionSidebar = ({ secciones, fetchSecciones, seccionActual, setSeccionActual, seccionNombreActual }) => {
  const [showForm, setShowForm] = useState(false)
  const [newSeccion, setNewSeccion] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newSeccion.trim()) {
      toast.error('El nombre de la sección no puede estar vacío')
      return
    }
    try {
      await createSeccion(newSeccion.trim())
      toast.success('Sección creada correctamente')
      setNewSeccion('')
      setShowForm(false)
      fetchSecciones()
    } catch (error) {
      toast.error('Error al crear la sección')
    }
  }

  const handleDelete = (id, nombre) => {
    if (confirm(`¿Eliminar sección "${nombre}" y todas sus tareas?`)) {
      try {
        handleDeleteSeccion(id, fetchSecciones)
        if (seccionActual === id) {
          setSeccionActual(null)
        }
        toast.success('Sección eliminada correctamente')
      } catch (error) {
        toast.error('Error al eliminar la sección')
      }
    }
  }

  const handleEdit = async (id) => {
    if (!editName.trim()) {
      toast.error('El nombre de la sección no puede estar vacío')
      return
    }
    try {
      await updateSeccion(id, editName.trim())
      toast.success('Sección actualizada correctamente')
      setEditingId(null)
      setEditName('')
      fetchSecciones()
    } catch (error) {
      toast.error('Error al actualizar la sección')
    }
  }

  const handleSeccionClick = (id, nombre) => {
    setSeccionActual(id)
  }

  return (
    <div className="seccion-sidebar">
      <h3>Secciones</h3>
      
      <div className="seccion-list">
        <button 
          className={`seccion-item ${seccionActual === null ? 'active' : ''}`}
          onClick={() => handleSeccionClick(null, 'Todas las tareas')}
        >
          📋 Todas las tareas
        </button>

        {secciones.map(seccion => (
          <div key={seccion.id} className="seccion-item-container">
            {editingId === seccion.id ? (
              <div className="seccion-edit">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEdit(seccion.id)}
                  autoFocus
                />
                <button onClick={() => handleEdit(seccion.id)}>✓</button>
                <button onClick={() => setEditingId(null)}>✕</button>
              </div>
            ) : (
              <>
                <button 
                  className={`seccion-item ${seccionActual === seccion.id ? 'active' : ''}`}
                  onClick={() => handleSeccionClick(seccion.id, seccion.nombre)}
                >
                  📁 {seccion.nombre}
                </button>
                <div className="seccion-actions">
                  <button onClick={() => { setEditingId(seccion.id); setEditName(seccion.nombre) }}>✏️</button>
                  <button onClick={() => handleDelete(seccion.id, seccion.nombre)}>🗑️</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {showForm ? (
        <form onSubmit={handleCreate} className="seccion-form">
          <input
            type="text"
            placeholder="Nombre de sección"
            value={newSeccion}
            onChange={(e) => setNewSeccion(e.target.value)}
            autoFocus
          />
          <div className="seccion-form-actions">
            <button type="submit">Crear</button>
            <button type="button" onClick={() => { setShowForm(false); setNewSeccion('') }}>Cancelar</button>
          </div>
        </form>
      ) : (
        <button className="btn-add-seccion" onClick={() => setShowForm(true)}>
          + Nueva Sección
        </button>
      )}
    </div>
  )
}