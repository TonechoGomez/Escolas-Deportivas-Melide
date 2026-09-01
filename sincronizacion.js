// ==========================================
// MÓDULO: SINCRONIZACIÓN CON LA NUBE (sincronizacion.js)
// ==========================================

// URL de tu Web App de Google Apps Script
window.SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwm0XIygblMMbJiKoqSPPGFms-X61I8yipYRQgkqUnuMNK2XV7cTwsYOhxPotAVU0Ol/exec";

// Función auxiliar para actualizar los datos visualmente solo si estamos en cuadrantes
function refrescarSiEstamosEnCuadrantes() {
    const editScreen = document.getElementById('scr-edit');
    // Si la pantalla de edición está abierta y contiene elementos de cuadrantes o estamos viéndolos, actualizamos.
    // Si estás en Instalaciones o Actividades, NO se toca la pantalla para no molestarte.
    if (editScreen && editScreen.style.display === 'block') {
        if (typeof renderizarAmbosCuadrantes === 'function' && document.getElementById('filtro-tipo')) {
            renderizarAmbosCuadrantes();
        }
    }
}

// 1. Descargar datos de la nube al iniciar la aplicación
async function descargarDatosAlInicio() {
    if (!window.SCRIPT_URL) return;
    try {
        const response = await fetch(window.SCRIPT_URL);
        if (response.ok) {
            const dataRemota = await response.json();
            if (dataRemota && typeof dataRemota === 'object' && Object.keys(dataRemota).length > 0) {
                window.db = dataRemota;
                localStorage.setItem('melide_db', JSON.stringify(window.db));
                refrescarSiEstamosEnCuadrantes();
            }
        }
    } catch (error) {
        console.log("Modo offline o error al conectar con la nube:", error);
    }
}

// 2. Enviar datos a la nube cada vez que se guarda algo localmente
async function enviarDatosAWebApp() {
    if (!window.SCRIPT_URL) return;
    try {
        await fetch(window.SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(window.db)
        });
        console.log("Datos enviados correctamente a la nube.");
    } catch (error) {
        console.error("Error al sincronizar con la nube:", error);
    }
}

// 3. Sistema de Sincronización en Tiempo Real (Consulta automática cada 10 segundos)
async function verificarCambiosEnNube() {
    if (!window.SCRIPT_URL) return;
    try {
        const response = await fetch(window.SCRIPT_URL);
        if (response.ok) {
            const dataRemota = await response.json();
            const localActual = JSON.stringify(window.db);
            const remotoActual = JSON.stringify(dataRemota);

            if (remotoActual !== localActual && dataRemota && typeof dataRemota === 'object' && Object.keys(dataRemota).length > 0) {
                window.db = dataRemota;
                localStorage.setItem('melide_db', JSON.stringify(window.db));
                refrescarSiHandsOnCuadrantes(); // Mantiene la pantalla actual a salvo
            }
        }
    } catch (e) {}
}

// Inicialización automática al cargar el script
document.addEventListener("DOMContentLoaded", () => {
    descargarDatosAlInicio();
    setInterval(verificarCambiosEnNube, 10000);
});
