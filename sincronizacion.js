// ==========================================
// MÓDULO: SINCRONIZACIÓN CON LA NUBE (sincronizacion.js)
// ==========================================

// URL de tu Web App de Google Apps Script
window.SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwm0XIygblMMbJiKoqSPPGFms-X61I8yipYRQgkqUnuMNK2XV7cTwsYOhxPotAVU0Ol/exec";

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
                if (typeof renderizarAmbosCuadrantes === 'function') {
                    renderizarAmbosCuadrantes();
                }
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
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(window.db)
        });
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
                if (typeof renderizarAmbosCuadrantes === 'function') {
                    renderizarAmbosCuadrantes();
                }
            }
        }
    } catch (e) {}
}

// Inicialización automática al cargar el script
document.addEventListener("DOMContentLoaded", () => {
    descargarDatosAlInicio();
    setInterval(verificarCambiosEnNube, 10000);
});
