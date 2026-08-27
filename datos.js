// ==========================================
// MÓDULO DE GESTIÓN DE DATOS (datos.js)
// ==========================================

// Tu URL de Google Apps Script (asegúrate de que sea la correcta de tu proyecto)
window.SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyc9lXqR6c4X77U0h2j38N_g35K4p5l11x.../exec"; // Se actualizará al poner tu URL real

// Estructura limpia y unificada de la base de datos
window.db = JSON.parse(localStorage.getItem('melide_db')) || {
    Monitores: [],
    Actividades: [],
    Aulas: [],
    Alumnos: [],
    Centros: [],
    Material: []
};

function saveData() {
    localStorage.setItem('melide_db', JSON.stringify(window.db));
    if (typeof enviarDatosAWebApp === 'function') {
        enviarDatosAWebApp();
    }
}

function mostrarDatos() {
    document.getElementById('scr-inicio').style.display = 'none';
    document.getElementById('scr-dash').style.display = 'none';
    document.getElementById('scr-edit').style.display = 'block';
    document.getElementById('main-header').style.display = 'flex';
    document.getElementById('btn-atras').style.display = 'block';

    const container = document.getElementById('data-container');
    container.innerHTML = `
        <div style="background: white; color: #333; padding: 25px; border-radius: 20px; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
            <h2 style="color: var(--melide-primary); margin-top: 0;">Gestión de Datos y Copias de Seguridad</h2>
            <p>Desde aquí puedes descargar una copia de seguridad de tus datos en formato JSON o restaurarla para recuperar toda la información.</p>
            
            <div style="display: flex; gap: 15px; margin-top: 25px; flex-wrap: wrap;">
                <button onclick="exportarJSON()" style="flex: 1; padding: 15px; background: #16a34a; color: white; border: none; border-radius: 10px; font-weight: bold; cursor: pointer;">📥 Descargar Copia (JSON)</button>
                <button onclick="document.getElementById('input-json').click()" style="flex: 1; padding: 15px; background: #2563eb; color: white; border: none; border-radius: 10px; font-weight: bold; cursor: pointer;">📤 Restaurar Copia</button>
                <input type="file" id="input-json" style="display:none" accept=".json" onchange="importarJSON(event)">
            </div>
        </div>
    `;
}

function exportarJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.db, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "melide_deportes_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importarJSON(event) {
    const fileReader = new FileReader();
    if (event.target.files[0]) {
        fileReader.readAsText(event.target.files[0], "UTF-8");
        fileReader.onload = (e) => {
            try {
                window.db = JSON.parse(e.target.result);
                saveData();
                alert("¡Datos restaurados correctamente!");
                location.reload();
            } catch (error) {
                alert("El archivo no es un JSON válido.");
            }
        };
    }
}
