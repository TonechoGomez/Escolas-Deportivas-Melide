// ==========================================
// MÓDULO: SINCRONIZACIÓN CON LA NUBE (sincronizacion.js)
// ==========================================

window.SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwm0XIygblMMbJiKoqSPPGFms-X61I8yipYRQgkqUnuMNK2XV7cTwsYOhxPotAVU0Ol/exec";

// 1. Descargar datos al inicio
async function descargarDatosAlInicio() {
    if (!window.SCRIPT_URL) return;
    try {
        const response = await fetch(window.SCRIPT_URL);
        if (response.ok) {
            const dataRemota = await response.json();
            if (dataRemota && typeof dataRemota === 'object' && Object.keys(dataRemota).length > 0) {
                window.db = dataRemota;
                localStorage.setItem('melide_db', JSON.stringify(window.db));
            }
        }
    } catch (error) {
        console.log("Modo offline o error al conectar con la nube:", error);
    }
}

// 2. Enviar datos a la nube
async function enviarDatosAWebApp() {
    if (!window.SCRIPT_URL) return false;
    try {
        const response = await fetch(window.SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(window.db)
        });
        console.log("Datos enviados correctamente a la nube.");
        return response.ok;
    } catch (error) {
        console.error("Error al sincronizar con la nube:", error);
        return false;
    }
}

// Descarga inicial automática al abrir la app
document.addEventListener("DOMContentLoaded", () => {
    descargarDatosAlInicio();
});
