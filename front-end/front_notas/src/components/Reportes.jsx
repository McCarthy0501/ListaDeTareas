import { useState, useEffect, useCallback } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar, AreaChart, Area } from 'recharts'
import { API_URL } from '../logic/logic'
import { toast } from 'react-hot-toast'

const COLORS = {
  completadas: '#4CAF50',
  pendientes: '#00C2FF',
  sinSeccion: '#9E9E9E',
  alta: '#FF4D4D',
  media: '#FFC107',
  baja: '#4CAF50',
  proximasVencer: '#FF9800',
  vencidas: '#F44336'
}

const customTooltipStyle = {
  backgroundColor: '#1A1D29',
  border: '1px solid rgba(0,194,255,0.3)',
  borderRadius: '8px',
  padding: '10px',
  color: '#fff',
  fontSize: '14px'
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={customTooltipStyle}>
        <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: '4px 0 0', color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function Reportes() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  const fetchReportes = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/tareas/reportes/estadisticas/`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Error fetching reportes:', error)
      toast.error('Error al cargar reportes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReportes()
  }, [fetchReportes])

  useEffect(() => {
    if (!autoRefresh || !data) return
    
    const interval = setInterval(() => {
      fetchReportes()
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRefresh, data, fetchReportes])

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

  const pieEstadoData = [
    { name: 'Completadas', value: data.completadas || 0 },
    { name: 'Pendientes', value: data.pendientes || 0 }
  ].filter(item => item.value > 0)

  const pieSeccionData = [
    { name: 'Con Sección', value: (data.total || 0) - (data.sin_seccion || 0) },
    { name: 'Sin Sección', value: data.sin_seccion || 0 }
  ].filter(item => item.value > 0)

  const prioridadData = (data.por_prioridad || []).map(p => ({
    name: p.prioridad.charAt(0).toUpperCase() + p.prioridad.slice(1),
    count: p.count,
    fill: p.prioridad === 'alta' ? COLORS.alta : p.prioridad === 'media' ? COLORS.media : COLORS.baja
  }))

  const seccionData = (data.por_seccion || []).map(s => ({
    name: s.nombre,
    total: s.total,
    completadas: s.completadas,
    pendientes: s.total - s.completadas
  }))

  const radialData = [
    { name: 'Completado', value: data.porcentaje_completado || 0, fill: COLORS.completadas },
    { name: 'Pendiente', value: data.porcentaje_pendiente || 0, fill: COLORS.pendientes }
  ]

  const estadoTareasData = [
    { name: 'Vencidas', value: data.vencidas || 0, fill: COLORS.vencidas },
    { name: 'Próximas a vencer', value: data.proximas_vencer || 0, fill: COLORS.proximasVencer },
    { name: 'Normales', value: Math.max(0, (data.pendientes || 0) - (data.vencidas || 0) - (data.proximas_vencer || 0)), fill: COLORS.pendientes }
  ].filter(item => item.value > 0)

  const formatTime = (date) => {
    if (!date) return ''
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div className="reportes-container">
      <div className="reportes-header">
        <div>
          <h3>Reportes y Estadísticas en Tiempo Real</h3>
          {lastUpdate && (
            <p className="last-update">Última actualización: {formatTime(lastUpdate)}</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label className="auto-refresh-toggle">
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh (5s)</span>
          </label>
          <button className="btn-refresh" onClick={fetchReportes}>
            ↻ Actualizar
          </button>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <span className="stat-number">{data.total || 0}</span>
          <span className="stat-label">Total Tareas</span>
        </div>
        <div className="stat-card stat-completadas">
          <span className="stat-number">{data.completadas || 0}</span>
          <span className="stat-label">Completadas</span>
          <span className="stat-percent">{data.porcentaje_completado || 0}%</span>
        </div>
        <div className="stat-card stat-pendientes">
          <span className="stat-number">{data.pendientes || 0}</span>
          <span className="stat-label">Pendientes</span>
          <span className="stat-percent">{data.porcentaje_pendiente || 0}%</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{data.sin_seccion || 0}</span>
          <span className="stat-label">Sin Sección</span>
        </div>
        <div className="stat-card stat-vencidas">
          <span className="stat-number">{data.vencidas || 0}</span>
          <span className="stat-label">Vencidas</span>
        </div>
        <div className="stat-card stat-proximas">
          <span className="stat-number">{data.proximas_vencer || 0}</span>
          <span className="stat-label">Próximas a Vencer</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{data.creadas_semana || 0}</span>
          <span className="stat-label">Creadas (7 días)</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h4>Porcentaje de Completado</h4>
          {radialData[0].value > 0 || radialData[1].value > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="100%" barSize={20} data={radialData} startAngle={180} endAngle={0}>
                <RadialBar minAngle={15} background clockWise dataKey="value" label={{ position: 'insideStart', fill: '#fff', fontSize: '18px', fontWeight: 'bold' }} />
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ color: '#fff', fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} />
              </RadialBarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty"><p>Sin datos</p></div>
          )}
        </div>

        <div className="chart-card">
          <h4>Estado de Tareas</h4>
          {pieEstadoData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieEstadoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={{ stroke: '#fff' }}
                >
                  {pieEstadoData.map((entry, index) => (
                    <Cell key={index} fill={index === 0 ? COLORS.completadas : COLORS.pendientes} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty"><p>No hay tareas</p></div>
          )}
        </div>

        <div className="chart-card">
          <h4>Tareas con Sección</h4>
          {pieSeccionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieSeccionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={{ stroke: '#fff' }}
                >
                  {pieSeccionData.map((entry, index) => (
                    <Cell key={index} fill={index === 0 ? COLORS.pendientes : COLORS.sinSeccion} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty"><p>No hay tareas</p></div>
          )}
        </div>

        <div className="chart-card">
          <h4>Estado de Vencimiento</h4>
          {estadoTareasData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={estadoTareasData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={{ stroke: '#fff' }}
                >
                  {estadoTareasData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty"><p>Sin tareas pendientes</p></div>
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
                <Bar dataKey="count" radius={[0, 5, 5, 0]}>
                  {prioridadData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty"><p>Sin prioridades</p></div>
          )}
        </div>

        {seccionData.length > 0 && (
          <div className="chart-card chart-wide">
            <h4>Por Sección</h4>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={seccionData}>
                <XAxis dataKey="name" stroke="#fff" tick={{ fill: '#fff', fontSize: 12 }} />
                <YAxis stroke="#fff" tick={{ fill: '#fff', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#fff' }} />
                <Bar dataKey="total" name="Total" fill="#00C2FF" radius={[5, 5, 0, 0]} />
                <Bar dataKey="completadas" name="Completadas" fill="#4CAF50" radius={[5, 5, 0, 0]} />
                <Bar dataKey="pendientes" name="Pendientes" fill="#FF9800" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
