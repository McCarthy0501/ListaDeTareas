export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

//comentarios 
export const handleDelete = async (id, fetchTareas) => {
    try {
      const response = await fetch(`${API_URL}/tareas/${id}/`, { method: 'DELETE' })
      if (response.ok) {
        fetchTareas()
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting tarea:', error)
      return false
    }
  }

export const handleDeleteSeccion = async (id, fetchSecciones) => {
    try {
      const response = await fetch(`${API_URL}/secciones/${id}/`, { method: 'DELETE' })
      if (response.ok) {
        fetchSecciones()
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting seccion:', error)
      return false
    }
  }

export const createSeccion = async (nombre) => {
    try {
      const response = await fetch(`${API_URL}/secciones/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre })
      })
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Error creating seccion:', error)
      return null
    }
  }

export const updateSeccion = async (id, nombre) => {
    try {
      const response = await fetch(`${API_URL}/secciones/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre })
      })
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Error updating seccion:', error)
      return null
    }
  }
