// ==========================================
// MÓDULO DE SINCRONIZACIÓN AUTOMÁTICA (sincronizacion.js)
// ==========================================

window.recibirDatosNube = function(datosNube) {
    if (datosNube && typeof datosNube === 'object') {
        window.db = datosNube;
        // Unificamos la clave del localStorage para evitar conflictos
        localStorage.setItem('melide_db', JSON.stringify(window.db));
        
        // Si estamos viendo los cuadrantes o la lista de actividades, refrescamos la vista automáticamente
        if (typeof renderizarAmbosCuadrantes === 'function' && document.getElementById('scr-edit') && document.getElementById('scr-edit').style.display === 'block') {
            // Comprobamos qué sección está activa para actualizarla sola sin que pierdas el foco
            const tipoFiltro = document.getElementById('filtro-tipo');
            if (tipoFiltro) {
                renderizarAmbosCuadrantes();
            }
        }
    }
};

// Descarga inicial al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    if (!window.SCRIPT_URL) return;

    const scriptTag = document.createElement('script');
    scriptTag.src = window.SCRIPT_URL + (window.SCRIPT_URL.includes('?') ? '&' : '?') + 'callback=recibirDatosNube';
    scriptTag.onerror = () => console.warn("Modo offline activo.");
    document.body.appendChild(scriptTag);

    // SISTEMA DE ACTUALIZACIÓN AUTOMÁTICA (POLLING):
    // Cada 30 segundos consulta silenciosamente a Google Sheets si hay datos nuevos de otros equipos
    setInterval(() => {
        if (!window.SCRIPT_URL) return;
        const autoTag = document.createElement('script');
        autoTag.src = window.SCRIPT_URL + (window.SCRIPT_URL.includes('?') ? '&' : '?') + 'callback=recibirDatosNube&t=' + new Date().getTime();
        autoTag.onerror = () => {};
        document.body.appendChild(autoTag);
        setTimeout(() => autoTag.remove(), 5000); // Limpia el script temporal
    }, 30000);
});

function enviarDatosAWebApp() {
    if (!window.SCRIPT_URL) return;

    const datos = {
        action: "updateDB",
        db: window.db,
        user: window.userRole || "sistema",
        fecha: new Date().toLocaleString()
    };

    fetch(window.SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    })
    .catch(err => console.error("Error al sincronizar:", err));
}

function forzarSincro() {
    enviarDatosAWebApp();
}
