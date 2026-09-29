// ==========================================
// MÓDULO: CONFIGURACIÓN E DATOS (datos.js)
// ==========================================

window.mesFiltroActual = new Date().toISOString().substring(0, 7);

// 1. Carga inicial: Si hay algo en el navegador se usa, si no, se crea vacío
window.db = JSON.parse(localStorage.getItem('melide_db')) || { 
    Monitores: [], Actividades: [], Aulas: [], Alumnos: [] 
};

// 2. Tu URL de Google Sheets (No la toques, es la tuya actual)
window.SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwm0XIygblMMbJiKoqSPPGFms-X61I8yipYRQgkqUnuMNK2XV7cTwsYOhxPotAVU0Ol/exec";

/**
 * Guarda los datos y los envía AUTOMÁTICAMENTE a la nube
 */
function saveData() {
    // Guarda copia de seguridad en el navegador
    localStorage.setItem('melide_db', JSON.stringify(window.db));
    
    // Si la función de envío existe en sincronizacion.js, la lanza sola
    if (typeof enviarDatosAWebApp === 'function') {
        enviarDatosAWebApp();
    }
}

function mostrarDatos() {
    const container = document.getElementById('data-container');
    const actions = document.getElementById('section-actions');
    if (!container || !actions) return;

    actions.innerHTML = `<h2 style="color:white; margin:0; text-transform: uppercase;">⚙️ CONFIGURACIÓN DO SISTEMA</h2>`;

    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(auto-fit, minmax(300px, 1fr))";
    container.style.gap = "20px";
    container.style.padding = "20px";

    container.innerHTML = `
        <div style="background:white; color:black; padding:25px; border-radius:20px; box-shadow:0 10px 25px rgba(0,0,0,0.2); text-align:center;">
            <h3 style="margin-top:0; color:#005696;">COPIAS DE SEGURIDADE</h3>
            <p style="font-size:0.9rem; color:#64748b; margin-bottom:20px;">O sistema sincroniza coa nube automaticamente, pero podes descargar un arquivo manual se o desexas.</p>
            
            <button onclick="exportarDatosJSON()" style="width:100%; padding:15px; background:#005696; color:white; border:none; border-radius:12px; cursor:pointer; font-weight:bold; margin-bottom:10px;">📥 DESCARGAR COPIA (JSON)</button>
            
            <div style="margin:15px 0; border-top:1px solid #eee; padding-top:15px;">
                <label style="display:block; margin-bottom:10px; font-weight:bold; font-size:0.8rem;">IMPORTAR COPIA MANUAL:</label>
                <input type="file" id="importFile" onchange="importarDatosJSON(event)" style="font-size:0.8rem; width:100%;">
            </div>
            <button onclick="borrarTodaLaBD()" style="width:100%; background:#ef4444; color:white; padding:10px; border:none; border-radius:12px; cursor:pointer; font-size:0.85rem; margin-top:10px;">⚠️ BORRAR TODA A BASE DE DATOS</button>
            <button onclick="mostrarDatos()" style="margin-top:20px; width:100%; padding:15px; background:#475569; color:white; border:none; border-radius:12px; cursor:pointer; font-weight:bold;">⬅️ VOLVER</button>
        </div>
    ` + mostrarSeccionNuevaTemporada();
}

function exportarDatosJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.db));
    const link = document.createElement('a');
    link.setAttribute("href", dataStr);
    link.setAttribute("download", "melide_backup.json");
    link.click();
}

function importarDatosJSON(event) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (confirm("Isto sobrescribirá todos os datos. Continuar?")) {
                window.db = data;
                saveData();
                location.reload();
            }
        } catch (err) { alert("Erro ao ler o arquivo"); }
    };
    reader.readAsText(event.target.files[0]);
}

function borrarTodaLaBD() {
    if (confirm("⚠️ ESTÁS SEGURO? Perderanse todos os monitores, alumnos e actividades.")) {
        if (confirm("CONFIRMACIÓN FINAL: Esta acción non se pode deshacer.")) {
            window.db = { Monitores: [], Actividades: [], Aulas: [], Alumnos: [] };
            saveData();
            location.reload();
        }
    }
}

// ==========================================
// MÓDULO NOVA TEMPORADA (IMPORTAR EXCEL/CSV)
// ==========================================

function mostrarSeccionNuevaTemporada() {
    return `
        <div style="background:white; color:black; padding:25px; border-radius:20px; box-shadow:0 10px 25px rgba(0,0,0,0.2); text-align:center;">
            <h3 style="margin-top:0; color:#005696;">🚀 NOVA TEMPORADA</h3>
            <p style="font-size:0.9rem; color:#64748b; margin-bottom:15px;">Selecciona o teu arquivo CSV de listados para actualizar as actividades da nova tempada mantendo o histórico xeral.</p>
            
            <input type="file" id="csv-temporada-input" accept=".csv" style="font-size:0.8rem; width:100%; margin-bottom:15px;">
            
            <button onclick="procesarCSVTemporada()" style="width:100%; padding:15px; background:#16a34a; color:white; border:none; border-radius:12px; cursor:pointer; font-weight:bold;">📥 CARGAR NOVA TEMPORADA</button>
        </div>
    `;
}

function procesarCSVTemporada() {
    const input = document.getElementById('csv-temporada-input');
    if (!input || !input.files[0]) {
        alert("Por favor, selecciona primeiro un arquivo CSV.");
        return;
    }

    if (!confirm("ATENCIÓN: Isto actualizará as actividades dos alumnos segundo o arquivo CSV, limpando as asignacións antigas pero conservando o histórico xeral de alumnos. Desexas continuar?")) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const contenido = e.target.result;
        const lineas = contenido.split(/\r\n|\n/);

        if (!window.db.Alumnos) window.db.Alumnos = [];

        // 1. Limpiamos temporalmente el campo 'act' (actividad) de todos los alumnos actuales
        window.db.Alumnos.forEach(al => {
            al.act = "";
        });

        let actividadActual = "";
        let contadorAsignaciones = 0;

        // 2. Leer línea por línea detectando títulos de actividades y alumnos
        for (let i = 0; i < lineas.length; i++) {
            let linea = lineas[i].trim();
            if (!linea) continue;

            let partes = linea.split(/;|,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            let col0 = partes[0] ? partes[0].trim().replace(/^"|"$/g, '') : "";
            let col1 = partes[1] ? partes[1].trim().replace(/^"|"$/g, '') : "";

            if (!col0 || col0.toUpperCase() === "ACTIVIDAD" || col0.toUpperCase() === "ACTIVIDADE") continue;

            // Si la segunda columna está vacía, es el título de la actividad
            if (col1 === "" || partes.length === 1) {
                actividadActual = col0.toUpperCase();
                continue;
            }

            let nombreAlumno = col0.toUpperCase();
            let telefonoAlumno = col1;

            if (!actividadActual) continue;

            // 3. Buscar si el alumno ya existe en el histórico general
            let alumnoGeneral = window.db.Alumnos.find(a => (a.nome || "").trim().toUpperCase() === nombreAlumno);
            
            if (!alumnoGeneral) {
                // Si no existe, lo creamos nuevo con su actividad y teléfono
                window.db.Alumnos.push({
                    nome: nombreAlumno,
                    tlf: telefonoAlumno,
                    act: actividadActual,
                    estado: "Admitido",
                    status: "Admitido",
                    asistencias: {}
                });
            } else {
                // Si ya existe, le asignamos la nueva actividad y actualizamos su teléfono si no lo tenía
                alumnoGeneral.act = actividadActual;
                if (telefonoAlumno && !alumnoGeneral.tlf) {
                    alumnoGeneral.tlf = telefonoAlumno;
                }
            }
            contadorAsignaciones++;
        }

        // 4. Guardar cambios en la base de datos y nube
        if (typeof saveData === 'function') {
            saveData();
        } else {
            localStorage.setItem('melide_db', JSON.stringify(window.db));
        }

        alert(`¡Proceso rematado con éxito!\n\n- Actividades de alumnos actualizadas.\n- Histórico conservado.\n- Total de asignacións procesadas: ${contadorAsignaciones}`);
        location.reload();
    };

    reader.readAsText(input.files[0], 'ISO-8859-1');
}
