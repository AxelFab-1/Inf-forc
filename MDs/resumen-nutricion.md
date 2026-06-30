# Resumen de Implementación: Módulo de Nutrición

*Proyecto:* Infinity Force
*Módulo:* Nutrición — IMC + Macros con Mifflin-St Jeor
*Basado en:* `promt-nutricion`

---

## Objetivo
Crear un módulo completo de nutrición que calcule el IMC y los macronutrientes del socio usando la fórmula de **Mifflin-St Jeor** multiplicada por el **Factor de Actividad**. Se guarda un historial biométrico en MongoDB y se muestra siempre el último registro en pantalla.

---

## TAREA 1 — Backend: Modelo, Servicio y Controlador

### `Usuario.java` — Actualizado
Se agregaron tres campos biométricos estáticos a la raíz del documento:
- `sexo` (String)
- `fechaNacimiento` (Date)
- `estaturaCm` (Double)

Se añadió una **clase anidada estática** `RegistroBiometrico` con los campos:
- `fechaRegistro`, `pesoKg`, `objetivo`, `nivelActividad`
- `imcCalculado`, `caloriasRecomendadas`
- `proteinasG`, `carbohidratosG`, `grasasG`

El documento del usuario ahora contiene `List<RegistroBiometrico> historialBiometrico`.

### `NutricionService.java` — Nuevo
Dos métodos principales:

**`obtenerPerfil(clienteId)`**: Busca al usuario y devuelve sus datos estáticos + el último elemento del array historialBiometrico.

**`registrarBiometrico(clienteId, datos)`**: Maneja dos escenarios:
- **Primera vez** (si `estaturaCm` o `fechaNacimiento` son null): actualiza campos estáticos del usuario y hace el cálculo completo.
- **Actualización**: usa los datos estáticos ya existentes y recalcula con el nuevo peso/nivel/objetivo.

**Fórmulas aplicadas:**
| Paso | Operación |
|---|---|
| IMC | `peso / (estatura_m²)` |
| TMB Masculino | `(10×kg) + (6.25×cm) − (5×edad) + 5` |
| TMB Femenino | `(10×kg) + (6.25×cm) − (5×edad) − 161` |
| Factor Actividad | Sedentario 1.2 / Ligero 1.375 / Moderado 1.55 / Intenso 1.725 |
| Ajuste Objetivo | Volumen +300 kcal / Definición −300 kcal / Mantenimiento ±0 |
| Proteínas | 30% de calorías ÷ 4 |
| Carbohidratos | 45% de calorías ÷ 4 |
| Grasas | 25% de calorías ÷ 9 |

### `NutricionController.java` — Nuevo
Dos endpoints protegidos con `Principal` (requieren JWT):
- `GET /api/nutricion/perfil` → devuelve datos estáticos + último registro
- `POST /api/nutricion/registrar` → calcula y hace push al historial

---

## TAREA 2 — Frontend: Lógica de inicio y Modal de primera vez

### `nutricion.ts`
- En `ngOnInit()` hace un `fetch GET` a `/api/nutricion/perfil`.
- Si el usuario **no tiene** `estaturaCm` o `fechaNacimiento`, activa el flag `mostrarModalPrimeraVez = true`.
- Si **ya tiene** esos datos, carga directamente el último registro del historial en pantalla.

---

## TAREA 3 — Vista principal: IMC y Macros

La pantalla principal muestra dos tarjetas:

**Tarjeta 1 — Diagnóstico IMC:**
- Círculo visual con el valor del IMC y color dinámico (azul/verde/naranja/rojo según categoría).
- Detalles: Categoría, Objetivo, Peso actual, Nivel de actividad.
- Nota de advertencia médica.

**Tarjeta 2 — Distribución de Macros:**
- Número grande de calorías totales/día.
- Barras de progreso para Proteínas (30%), Carbohidratos (45%) y Grasas (25%) con gramos exactos.
- Nota de advertencia sobre precisión de las estimaciones.

Botón **"Actualizar datos"** prominente en el encabezado.

---

## TAREA 4 — Modal de actualización

Al hacer clic en "Actualizar datos", se abre un modal simplificado con solo 3 campos:
- Nuevo Peso (kg)
- Nuevo Nivel de Actividad
- Nuevo Objetivo

Al guardar, ejecuta el `POST /api/nutricion/registrar`, recibe el nuevo `ultimoRegistro` en la respuesta y actualiza la vista **sin recargar la página**.

---

## Integración con el resto de la app

- Nueva ruta `/nutricion` registrada en `app.routes.ts` con `AuthGuard` y `expectedRole: 'cliente'`.
- El enlace de **"Comunidad"** (que no tenía funcionalidad real) fue reemplazado por **"Nutrición"** en el `footer-menu`, usando el ícono `bi-clipboard2-pulse`.
