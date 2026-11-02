// ==========================================
// MÓDULO: CONFIGURACIÓN E DATOS (datos.js)
// ==========================================

window.mesFiltroActual = new Date().toISOString().substring(0, 7);

window.db = JSON.parse(localStorage.getItem('melide_db')) || { 
    Monitores: [], Actividades: [], Aulas: [], Alumnos: [] 
};

window.SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwm0XIygblMMbJiKoqSPPGFms-X61I8yipYRQgkqUnuMNK2XV7cTwsYOhxPotAVU0Ol/exec";

// Guarda en el navegador local (Rápido y seguro)
function saveDataLocal() {
    localStorage.setItem('melide_db', JSON.stringify(window.db));
}

// Envía manualmente los datos a la nube
async function guardarESincronizarManual() {
    saveDataLocal(); // Aseguramos guardado local primero
    const btn = document.getElementById('btn-sync-manual');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = "⏳ SINCRONIZANDO...";
        btn.style.background = "#94a3b8";
    }

    if (typeof enviarDatosAWebApp === 'function') {
        const exito = await enviarDatosAWebApp();
        if (exito !== false) {
            alert("✅ Datos guardados e sincronizados correctamente coa nube!");
        } else {
            alert("⚠️ Os datos gardáronse localmente, pero houbo un problema de conexión coa nube.");
        }
    } else {
        alert("✅ Datos gardados correctamente no dispositivo.");
    }

    if (btn) {
        btn.disabled = false;
        btn.innerHTML = "💾 GARDAR E SINCRONIZAR";
        btn.style.background = "#16a34a";
    }
}

// Mantemos saveData por compatibilidade
function saveData() {
    saveDataLocal();
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
            <p style="font-size:0.9rem; color:#64748b; margin-bottom:20px;">Podes descargar un arquivo de seguridade manual ou forzar a sincronización.</p>
            
            <button onclick="guardarESincronizarManual()" style="width:100%; padding:15px; background:#16a34a; color:white; border:none; border-radius:12px; cursor:pointer; font-weight:bold; margin-bottom:10px;">💾 FORZAR SINCRONIZACIÓN COA NUBE</button>
            <button onclick="exportarDatosJSON()" style="width:100%; padding:15px; background:#005696; color:white; border:none; border-radius:12px; cursor:pointer; font-weight:bold; margin-bottom:10px;">📥 DESCARGAR COPIA (JSON)</button>
            
            <div style="margin:15px 0; border-top:1px solid #eee; padding-top:15px;">
                <label style="display:block; margin-bottom:10px; font-weight:bold; font-size:0.8rem;">IMPORTAR COPIA MANUAL:</label>
                <input type="file" id="importFile" onchange="importarDatosJSON(event)" style="font-size:0.8rem; width:100%;">
            </div>
            <button onclick="borrarTodaLaBD()" style="width:100%; background:#ef4444; color:white; padding:10px; border:none; border-radius:12px; cursor:pointer; font-size:0.85rem; margin-top:10px;">⚠️ BORRAR TODA A BASE DE DATOS</button>
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
                saveDataLocal();
                guardarESincronizarManual();
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
            saveDataLocal();
            guardarESincronizarManual();
            location.reload();
        }
    }
}

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
    if (!input || !input.files[0]) return alert("Por favor, selecciona primeiro un arquivo CSV.");
    if (!confirm("ATENCIÓN: Isto actualizará as actividades dos alumnos segundo o arquivo CSV. Desexas continuar?")) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const contenido = e.target.result;
        const lineas = contenido.split(/\r\n|\n/);

        if (!window.db.Alumnos) window.db.Alumnos = [];
        if (!window.db.Actividades) window.db.Actividades = [];

        window.db.Alumnos.forEach(al => {
            al.act = "";
            al.estado = "Admitido";
            al.status = "Admitido";
            if (al.baja) delete al.baja;
        });

        let actividadActual = "";
        let contadorAlumnos = 0;

        for (let i = 0; i < lineas.length; i++) {
            let linea = lineas[i].trim();
            if (!linea) continue;
            linea = linea.replace(/^["']|["']$/g, '');
            let separador = linea.includes(';') ? ';' : ',';
            let partes = linea.split(separador);

            let col0 = partes[0] ? partes[0].trim().replace(/^["']|["']$/g, '') : "";
            let col1 = partes[1] ? partes[1].trim().replace(/^["']|["']$/g, '') : "";

            if (!col0 || col0.toUpperCase() === "ACTIVIDAD" || col0.toUpperCase() === "ACTIVIDADE" || col0.toUpperCase() === "MOVIL" || col0.toUpperCase() === "MÓVIL") continue;

            if (partes.length === 1 || col1 === "") {
                actividadActual = col0;
                let existeAct = window.db.Actividades.find(a => (a.nome || "").trim().toUpperCase() === actividadActual.toUpperCase());
                if (!existeAct) {
                    window.db.Actividades.push({ nome: actividadActual, dia: "", hora: "", aula: "", monitor: "" });
                }
                continue;
            }

            if (actividadActual && col0 !== "") {
                let textoCompleto = col0.toUpperCase().trim();
                let telefonoAlumno = col1;
                let apelidos = "", nomePila = "";

                if (textoCompleto.includes(",")) {
                    let fragmentos = textoCompleto.split(",");
                    apelidos = fragmentos[0].trim();
                    nomePila = fragmentos[1].trim();
                } else {
                    let palabras = textoCompleto.split(/\s+/);
                    if (palabras.length <= 2) {
                        apelidos = palabras[0] || "";
                        nomePila = palabras[1] || "";
                    } else {
                        apelidos = palabras.slice(0, 2).join(" ");
                        nomePila = palabras.slice(2).join(" ");
                    }
                }

                let alumnoGeneral = window.db.Alumnos.find(a => 
                    (a.nome || "").trim().toUpperCase() === nomePila && 
                    (a.apelidos || "").trim().toUpperCase() === apelidos
                );

                if (!alumnoGeneral) {
                    window.db.Alumnos.push({
                        nome: nomePila, apelidos: apelidos, tlf: telefonoAlumno,
                        act: actividadActual, estado: "Admitido", status: "Admitido", asistencias: {}
                    });
                } else {
                    alumnoGeneral.nome = nomePila; alumnoGeneral.apelidos = apelidos;
                    alumnoGeneral.act = actividadActual; alumnoGeneral.estado = "Admitido";
                    alumnoGeneral.status = "Admitido";
                    if (alumnoGeneral.baja) delete alumnoGeneral.baja;
                    if (telefonoAlumno && !alumnoGeneral.tlf) alumnoGeneral.tlf = telefonoAlumno;
                }
                contadorAlumnos++;
            }
        }

        saveDataLocal();
        guardarESincronizarManual();
        alert(`¡Importación completada con éxito!\n\n- Alumnos procesados: ${contadorAlumnos}`);
        location.reload();
    };

    reader.readAsText(input.files[0], 'ISO-8859-1');
}
