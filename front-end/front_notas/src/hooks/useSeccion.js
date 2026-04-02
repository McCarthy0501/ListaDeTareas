import { useState, useEffect } from 'react'
import { API_URL } from '../logic/logic'

export const useSeccion = () => {
  const [secciones, setSecciones] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchSecciones = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/secciones/`)
      const data = await response.json()
      setSecciones(data)
    } catch (error) {
      console.error('Error fetching secciones:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSecciones()
  }, [])

  return { secciones, loading, fetchSecciones }
}