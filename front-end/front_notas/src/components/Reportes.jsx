import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { API_URL } from '../logic/logic'
import { toast } from 'react-hot-toast'

const COLORS = {
  completadas: '#4CAF50',
  pendientes: '#00C2FF',
  alta: '#FF4D4D',
  media: '#FFC107',
  baja: '#4CAF50'
}

const customTooltipStyle = {
  backgroundColor: '#1A1D29',
  border: '1px solid rgba(0,194,255,0.3)',
  borderRadius: '8px',
  padding: '10px',
  color: '#fff',
  fontSize: '14px'
}

export function Reportes() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportes()
  }, [])

  const fetchReportes = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/tareas/reportes/`)
      if (response.ok) {
        const result = await response.json()
        console.log('Reportes data:', result)
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching reportes:', error)
      toast.error('Error al cargar reportes')
    } finally {
      setLoading(false)
    }
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={customTooltipStyle}>
          <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
          <p style={{ margin: '4px 0 0', color: payload[0].payload.fill || '#00C2FF' }}>
            {payload[0].name}: {payload[0].value}
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="reportes-container">
        <div className="loading-full">
          <div className="loading-spinner"></div>
          <p>Cargando reportes...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="reportes-container">
        <div className="empty-state">
          <p>No hay datos para mostrar</p>
        </div>
      </div>
    )
  }

  const pieData = [
    { name: 'Completadas', value: data.completadas || 0 },
    { name: 'Pendientes', value: data.pendientes || 0 }
  ].filter(item => item.value > 0)

  const prioridadData = (data.por_prioridad || []).map(p => ({
    name: p.prioridad.charAt(0).toUpperCase() + p.prioridad.slice(1),
    count: p.count
  }))

  const seccionData = (data.por_seccion || []).map(s => ({
    name: s.nombre,
    total: s.total,
    completadas: s.completadas
  }))

  return (
    <div className="reportes-container">
      <div className="reportes-header">
        <h3>Reportes y Estadísticas</h3>
        <button className="btn-refresh" onClick={fetchReportes}>
          ↻ Actualizar
        </button>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <span className="stat-number">{data.total || 0}</span>
          <span className="stat-label">Total Tareas</span>
        </div>
        <div className="stat-card stat-completadas">
          <span className="stat-number">{data.completadas || 0}</span>
          <span className="stat-label">Completadas</span>
        </div>
        <div className="stat-card stat-pendientes">
          <span className="stat-number">{data.pendientes || 0}</span>
          <span className="stat-label">Pendientes</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{data.creadas_semana || 0}</span>
          <span className="stat-label">Creadas (7 días)</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h4>Estado de Tareas</h4>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={{ stroke: '#fff' }}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={index} 
                      fill={index === 0 ? COLORS.completadas : COLORS.pendientes}
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">
              <p>No hay tareas</p>
            </div>
          )}
        </div>

        <div className="chart-card">
          <h4>Por Prioridad</h4>
          {prioridadData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={prioridadData} layout="vertical">
                <XAxis type="number" stroke="#fff" tick={{ fill: '#fff', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" stroke="#fff" tick={{ fill: '#fff', fontSize: 12 }} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#00C2FF" radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">
              <p>Sin prioridades</p>
            </div>
          )}
        </div>

        {seccionData.length > 0 && (
          <div className="chart-card chart-wide">
            <h4>Por Sección</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={seccionData}>
                <XAxis dataKey="name" stroke="#fff" tick={{ fill: '#fff', fontSize: 12 }} />
                <YAxis stroke="#fff" tick={{ fill: '#fff', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#fff' }} />
                <Bar dataKey="total" name="Total" fill="#00C2FF" radius={[5, 5, 0, 0]} />
                <Bar dataKey="completadas" name="Completadas" fill="#4CAF50" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}