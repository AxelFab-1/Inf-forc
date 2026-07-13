export function obtenerCabeceras() {
  const token = localStorage.getItem('jwt_token');

  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

export function obtenerCabecerasArchivo() {
  const token = localStorage.getItem('jwt_token');

  return {
    'Authorization': token ? `Bearer ${token}` : ''
    // Sin Content-Type: el navegador lo genera automáticamente
    // con el boundary correcto para FormData
  };
}