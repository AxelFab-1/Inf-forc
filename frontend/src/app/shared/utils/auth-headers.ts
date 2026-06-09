export function obtenerCabeceras() {
  const token = localStorage.getItem('jwt_token');
  
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}