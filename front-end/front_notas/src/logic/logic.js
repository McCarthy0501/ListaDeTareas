export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'; //variable de entorno 



//funcion para eliminas
 export const handleDelete = async (id,fetchTareas) => {
    try {
      await fetch(`${API_URL}/tareas/${id}/`, { method: 'DELETE' })
      fetchTareas()
      
    } catch (error) {
      console.error('Error deleting tarea:', error)
    }
  }
