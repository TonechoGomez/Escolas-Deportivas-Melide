// ==========================================
// MÓDULO DE SEGURIDAD Y ACCESO (seguridad.js)
// ==========================================

function login() {
    const roleSelect = document.getElementById('user-role').value;
    const pinInputs = document.querySelectorAll('.pin-input');
    let enteredPin = "";
    pinInputs.forEach(input => enteredPin += input.value);

    // PINs configurados por defecto (puedes cambiarlos si lo deseas)
    const validPins = {
        "tecnico": "0010",
        "monitor": "1234",
        "politico": "0000"
    };

    if (enteredPin === validPins[roleSelect]) {
        window.userRole = roleSelect;
        document.getElementById('scr-inicio').style.display = 'none';
        document.getElementById('scr-dash').style.display = 'block';
        document.getElementById('main-header').style.display = 'flex';
        renderizarMenuPrincipal();
    } else {
        alert("PIN incorrecto. Por favor, inténtelo de nuevo.");
        pinInputs.forEach(input => input.value = "");
        if(pinInputs[0]) pinInputs[0].focus();
    }
}

function renderizarMenuPrincipal() {
    const container = document.getElementById('menu-container');
    if (!container) return;

    let html = `
        <div class="menu-item" onclick="mostrarMonitores()">
            <span>👥</span>
            <label>Monitores</label>
        </div>
        <div class="menu-item" onclick="mostrarActividades()">
            <span>📅</span>
            <label>Actividades</label>
        </div>
        <div class="menu-item" onclick="mostrarCuadrantes()">
            <span>⏰</span>
            <label>Cuadrantes</label>
        </div>
        <div class="menu-item" onclick="mostrarInstalaciones()">
            <span>🏟️</span>
            <label>Instalaciones</label>
        </div>
        <div class="menu-item" onclick="mostrarAlumnos()">
            <span>📝</span>
            <label>Alumnos</label>
        </div>
        <div class="menu-item" onclick="mostrarComunicacion()">
            <span>💬</span>
            <label>Comunicaciones</label>
        </div>
        <div class="menu-item" onclick="verPanelEstadisticas()">
            <span>📊</span>
            <label>Estadísticas</label>
        </div>
        <div class="menu-item" onclick="mostrarDatos()">
            <span>💾</span>
            <label>Datos / Backup</label>
        </div>
    `;
    container.innerHTML = html;
}
