export const validateForm = ({ titulo, descripcion }) => {
  const errors = {}
  const tituloTrim = titulo.trim()
  const descripcionTrim = descripcion.trim()

  if (!tituloTrim) {
    errors.titulo = 'El título es requerido'
  } else if (tituloTrim.length < 6) {
    errors.titulo = 'El título debe tener al menos 6 caracteres'
  } else if (tituloTrim.length > 100) {
    errors.titulo = 'El título no puede exceder 100 caracteres'
  } else if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_.,]+$/.test(tituloTrim)) {
    errors.titulo = 'El título contiene caracteres no permitidos'
  }

  if (descripcionTrim && descripcionTrim.length > 1000) {
    errors.descripcion = 'La descripción no puede exceder 1000 caracteres'
  } else if (descripcionTrim && !/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_.,!?]+$/.test(descripcionTrim)) {
    errors.descripcion = 'La descripción contiene caracteres no permitidos'
  }

  return errors
}