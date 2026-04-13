import { useState, useEffect } from 'react'
import { API_URL } from '../logic/logic'
import { toast } from 'react-hot-toast'

const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function getDiasDelMes(year, month) {
  const primerDia = new Date(year, month, 1)
  const ultimoDia = new Date(year, month + 1, 0)
  const dias = []
  
  const inicioDiaSemana = primerDia.getDay()
  for (let i = inicioDiaSemana - 1; i >= 0; i--) {
    const fecha = new Date(year, month, -i)
    dias.push({ fecha, esActual: false })
  }
  
  for (let i = 1; i <= ultimoDia.getDate(); i++) {
    const fecha = new Date(year, month, i)
    dias.push({ fecha, esActual: true })
  }
  
  const finDiaSemana = ultimoDia.getDay()
  for (let i = 1; i < 7 - finDiaSemana; i++) {
    const fecha = new Date(year, month + 1, i)
    dias.push({ fecha, esActual: false })
  }
  
  return dias
}

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function formatDateISO(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function esHoy(date) {
  const hoy = new Date()
  return date.getDate() === hoy.getDate() &&
    date.getMonth() === hoy.getMonth() &&
    date.getFullYear() === hoy.getFullYear()
}

export function Calendario({ onFechaSelect }) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date())
  const [mesActual, setMesActual] = useState(new Date().getMonth())
  const [anoActual, setAnoActual] = useState(new Date().getFullYear())
  const [tareasFecha, setTareasFecha] = useState([])
  const [loading, setLoading] = useState(false)
  const [datesWithTareas, setDatesWithTareas] = useState(new Set())

  useEffect(() => {
    fetchTareasConFechas()
    fetchTareasPorFecha(new Date())
  }, [])

  const fetchTareasConFechas = async () => {
    try {
      const response = await fetch(`${API_URL}/tareas/`)
      const data = await response.json()
      const results = data.results || data
      
      const fechas = new Set()
      results.forEach(tarea => {
        if (tarea.fecha_vencimiento) {
          fechas.add(tarea.fecha_vencimiento)
        }
      })
      setDatesWithTareas(fechas)
    } catch (error) {
      console.error('Error fetching tareas con fechas:', error)
    }
  }

  const fetchTareasPorFecha = async (fecha) => {
    setLoading(true)
    try {
      const fechaStr = formatDateISO(fecha)
      
      const response = await fetch(`${API_URL}/tareas/por-fecha/?fecha=${fechaStr}`)
      const data = await response.json()
      
      if (Array.isArray(data)) {
        setTareasFecha(data)
        onFechaSelect(data, fecha)
      } else {
        setTareasFecha([])
        onFechaSelect([], fecha)
      }
    } catch (error) {
      console.error('Error fetching tareas por fecha:', error)
      setTareasFecha([])
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (date) => {
    setFechaSeleccionada(date)
    fetchTareasPorFecha(date)
    toast.success(`Tareas para: ${formatDate(date)}`)
  }

  const mesAnterior = () => {
    if (mesActual === 0) {
      setMesActual(11)
      setAnoActual(anoActual - 1)
    } else {
      setMesActual(mesActual - 1)
    }
  }

  const mesSiguiente = () => {
    if (mesActual === 11) {
      setMesActual(0)
      setAnoActual(anoActual + 1)
    } else {
      setMesActual(mesActual + 1)
    }
  }

  const dias = getDiasDelMes(anoActual, mesActual)
  const fechaStr = formatDateISO(fechaSeleccionada)

  return (
    <div className="calendario-layout">
      <div className="calendario-panel">
        <div className="calendario-header">
          <h3>Calendario</h3>
          <p className="calendario-subtitulo">Selecciona una fecha</p>
        </div>
        
        <div className="calendario-wrapper">
          <div className="calendario-navegacion">
            <button className="cal-nav-btn" onClick={mesAnterior}>‹</button>
            <span className="mes-ano">{meses[mesActual]} {anoActual}</span>
            <button className="cal-nav-btn" onClick={mesSiguiente}>›</button>
          </div>
          
          <div className="calendario-dias-semana">
            {diasSemana.map(dia => (
              <div key={dia} className="dia-semana">{dia}</div>
            ))}
          </div>
          
          <div className="calendario-dias">
            {dias.map((item, index) => {
              const fechaItemStr = formatDateISO(item.fecha)
              const esSeleccionado = fechaItemStr === formatDateISO(fechaSeleccionada)
              const tieneTareas = datesWithTareas.has(fechaItemStr)
              const esDiaActual = esHoy(item.fecha)
              
              return (
                <button
                  key={index}
                  className={`dia ${!item.esActual ? 'otro-mes' : ''} ${esSeleccionado ? 'seleccionado' : ''} ${tieneTareas ? 'tiene-tareas' : ''} ${esDiaActual ? 'hoy' : ''}`}
                  onClick={() => handleDateChange(item.fecha)}
                  disabled={!item.esActual}
                >
                  {item.fecha.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="tareas-panel">
        <h4>{formatDate(fechaSeleccionada)}</h4>
        
        {loading ? (
          <div className="loading-spinner"></div>
        ) : tareasFecha.length === 0 ? (
          <div className="no-tareas">
            <span className="no-tareas-icon">📅</span>
            <p>No hay tareas para esta fecha</p>
          </div>
        ) : (
          <div className="tareas-list">
            {tareasFecha.map(tarea => (
              <div key={tarea.id} className={`tarea-item-full ${tarea.completada ? 'completada' : ''}`}>
                <div className="tarea-header">
                  <span className={`prioridad-badge ${tarea.prioridad}`}>
                    {tarea.prioridad.toUpperCase()}
                  </span>
                  <input 
                    type="checkbox" 
                    checked={tarea.completada}
                    onChange={() => {}}
                    className="tarea-checkbox"
                  />
                </div>
                
                <h5 className="tarea-titulo-full">{tarea.titulo}</h5>
                
                {tarea.descripcion && (
                  <p className="tarea-descripcion">{tarea.descripcion}</p>
                )}
                
                <div className="tarea-meta">
                  {tarea.seccion_nombre && (
                    <span className="tarea-seccion">{tarea.seccion_nombre}</span>
                  )}
                  <span className="tarea-fecha-ven">
                    Vence: {tarea.fecha_vencimiento}
                  </span>
                </div>
                
                <div className="tarea-fechas">
                  <span>Creada: {new Date(tarea.fecha_creacion).toLocaleDateString('es-ES')}</span>
                  <span>Actualizada: {new Date(tarea.fecha_actualizacion).toLocaleDateString('es-ES')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}