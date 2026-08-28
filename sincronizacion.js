// ==========================================
// MÓDULO: SINCRONIZACIÓN CON LA NUBE (sincronizacion.js)
// ==========================================

// URL de tu Web App de Google Apps Script (Sustituye si cambia, mantén la actual si ya funciona)
window.SCRIPT_URL = window.SCRIPT_URL || "window.SCRIPT_URL = window.SCRIPT_URL || "https://script.google.com/macros/s/TU_ENLACE_REAL_AQUI/exec";"; 

// 1. Descargar datos de la nube al iniciar la aplicación
async function descargarDatosAlInicio() {
    if (!window.SCRIPT_URL || window.SCRIPT_URL.includes("...")) return;
    
    try {
        const response = await fetch(window.SCRIPT_URL);
        if (response.ok) {
            const dataRemota = await response.json();
            if (dataRemota && typeof dataRemota === 'object') {
                window.db = dataRemota;
                localStorage.setItem('melide_db', JSON.stringify(window.db));
                
                // Si estamos visualizando los cuadrantes u otra sección, refrescamos la vista actual suavemente
                if (typeof renderizarAmbosCuadrantes === 'function' && document.getElementById('data-container')?.innerHTML !== "") {
                    // Solo recargamos cuadrantes si es la vista activa para no molestar al usuario si está escribiendo en otro sitio
                }
            }
        }
    } catch (error) {
        console.log("Modo offline o error al conectar con la nube:", error);
    }
}

// 2. Enviar datos a la nube cada vez que se guarda algo localmente
async function enviarDatosAWebApp() {
    if (!window.SCRIPT_URL || window.SCRIPT_URL.includes("...")) return;

    try {
        await fetch(window.SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Evita problemas de CORS con Google Apps Script
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(window.db)
        });
    } catch (error) {
        console.error("Error al sincronizar con la nube:", error);
    }
}

// 3. Sistema de Sincronización en Tiempo Real (Consulta automática cada 10 segundos para la Tablet)
async function verificarCambiosEnNube() {
    if (!window.SCRIPT_URL || window.SCRIPT_URL.includes("...")) return;

    try {
        const response = await fetch(window.SCRIPT_URL);
        if (response.ok) {
            const dataRemota = await response.json();
            const localActual = JSON.stringify(window.db);
            const remotoActual = JSON.stringify(dataRemota);

            // Si los datos de la nube son diferentes a los que tenemos en pantalla, actualizamos
            if (remotoActual !== localActual && dataRemota && typeof dataRemota === 'object') {
                window.db = dataRemota;
                localStorage.setItem('melide_db', JSON.stringify(window.db));
                
                // Si el usuario está viendo los cuadrantes, los redibujamos al instante con los nuevos datos
                if (typeof renderizarAmbosCuadrantes === 'function') {
                    renderizarAmbosCuadrantes();
                }
            }
        }
    } catch (e) {
        // Silenciamos errores de red en segundo plano para que no molesten
    }
}

// Inicialización automática al cargar el script
document.addEventListener("DOMContentLoaded", () => {
    descargarDatosAlInicio();
    
    // Activa el "vigía" en segundo plano que comprueba si el PC hizo cambios cada 10 segundos
    setInterval(verificarCambiosEnNube, 10000);
});
