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
            <h3 style="margin-top:0; color:#005696;">PANEL DE XESTIÓN</h3>
            <p style="font-size:0.9rem; color:#64748b; margin-bottom:20px;">Accede ás estadísticas ou xestiona as copias de seguridade.</p>
            
            <button onclick="abrirEstadisticasAsistencia()" style="width:100%; padding:15px; background:#0284c7; color:white; border:none; border-radius:12px; cursor:pointer; font-weight:bold; margin-bottom:10px;">📊 VER ESTADÍSTICAS DE ASISTENCIA</button>
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

// ==========================================
// MÓDULO: ESTADÍSTICAS DE ASISTENCIA (ESTRICTO)
// ==========================================

function abrirEstadisticasAsistencia() {
    const container = document.getElementById('data-container');
    const actions = document.getElementById('section-actions');
    if (!container || !actions) return;

    actions.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:15px;">
            <h2 style="margin:0; color:white; font-size:1.4rem;">📊 ESTADÍSTICAS DE ASISTENCIA</h2>
            <button onclick="mostrarDatos()" style="background:#475569; color:white; padding:10px 20px; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">⬅️ VOLVER</button>
        </div>
    `;

    container.style.display = "block";
    container.style.padding = "20px";
    container.innerHTML = `
        <div style="background:white; color:#333; padding:25px; border-radius:20px; box-shadow:0 10px 25px rgba(0,0,0,0.2); max-width:950px; margin:0 auto;">
            
            <div style="margin-bottom:20px;">
                <label style="font-size:0.85rem; font-weight:bold; color:#64748b; display:block; margin-bottom:8px;">VER ESTADÍSTICAS POR:</label>
                <select id="filtro-vista-app" onchange="renderizarContenidoEstadisticasApp()" style="width:100%; padding:12px; border-radius:10px; border:1px solid #cbd5e1; font-size:1rem; background:white; color:#334155; font-weight:bold; cursor:pointer;">
                    <option value="totales">🌐 Estadísticas Totais do Centro</option>
                    <option value="actividad">🏆 Por Actividade</option>
                    <option value="monitor">👤 Por Monitor/a</option>
                    <option value="alumno">👥 Por Alumno/a</option>
                </select>
            </div>

            <div id="resultado-estadisticas-app"></div>
        </div>
    `;

    renderizarContenidoEstadisticasApp();
}

function renderizarContenidoEstadisticasApp() {
    const opcion = document.getElementById('filtro-vista-app').value;
    const contenedorRes = document.getElementById('resultado-estadisticas-app');
    if (!contenedorRes) return;

    const actividades = window.db.Actividades || [];
    
    // Alumnos activos con actividade válida asignada
    const alumnos = (window.db.Alumnos || []).filter(al => {
        if (!al.act || al.act.trim() === "") return false;
        return actividades.some(act => (act.nome || "").trim().toUpperCase() === al.act.trim().toUpperCase());
    });

    // RECOLLIDA DE FECHAS CLAVE DE CLASE: Únicamente donde hai rexistros reais gardados dende o 1 de novembro
    const fechasClasesPorActividad = {};
    actividades.forEach(act => {
        const nombreAct = act.nome.trim().toUpperCase();
        const fechasSet = new Set();
        
        const alumnosAct = alumnos.filter(a => (a.act || "").trim().toUpperCase() === nombreAct);
        alumnosAct.forEach(a => {
            const asist = a.asistencias || {};
            Object.entries(asist).forEach(([fecha, valor]) => {
                // EXIXIMOS QUE A DATA SEAN DE NOVEMBRO EN ADIANTE E QUE O VALOR SEXA EXPLÍCITAMENTE UN BOOLEANO VÁLIDO
                if (fecha >= "2026-11-01" && (valor === true || valor === false)) {
                    fechasSet.add(fecha);
                }
            });
        });
        fechasClasesPorActividad[nombreAct] = Array.from(fechasSet);
    });

    let html = "";

    if (opcion === 'totales') {
        let totalHorasClaseCentro = 0;
        let totalAsistenciasCentro = 0;
        let totalAusenciasCentro = 0;

        actividades.forEach(act => {
            const nombreAct = act.nome.trim().toUpperCase();
            const fechas = fechasClasesPorActividad[nombreAct] || [];
            totalHorasClaseCentro += fechas.length;

            const alumnosAct = alumnos.filter(a => (a.act || "").trim().toUpperCase() === nombreAct);
            
            alumnosAct.forEach(al => {
                const asist = al.asistencias || {};
                fechas.forEach(fecha => {
                    if (asist[fecha] === true) {
                        totalAsistenciasCentro++;
                    } else if (asist[fecha] === false) {
                        totalAusenciasCentro++;
                    }
                });
            });
        });

        const totalEsperadosCentro = totalAsistenciasCentro + totalAusenciasCentro;
        const porcGlobal = totalEsperadosCentro > 0 ? Math.round((totalAsistenciasCentro / totalEsperadosCentro) * 100) : 0;

        html = `
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px; margin-bottom:20px;">
                <div style="background:#f1f5f9; padding:15px; border-radius:12px; border-left:5px solid #2563eb;">
                    <span style="font-size:0.75rem; font-weight:bold; color:#64748b; display:block;">Nº HORAS CLASE TOTAIS</span>
                    <span style="font-size:1.8rem; font-weight:bold; color:#0f172a; margin-top:5px; display:block;">${totalHorasClaseCentro} hrs</span>
                </div>
                <div style="background:#f1f5f9; padding:15px; border-radius:12px; border-left:5px solid #16a34a;">
                    <span style="font-size:0.75rem; font-weight:bold; color:#64748b; display:block;">Nº PRESENZAS CONFIRMADAS</span>
                    <span style="font-size:1.8rem; font-weight:bold; color:#0f172a; margin-top:5px; display:block;">${totalAsistenciasCentro}</span>
                </div>
                <div style="background:#f1f5f9; padding:15px; border-radius:12px; border-left:5px solid #ef4444;">
                    <span style="font-size:0.75rem; font-weight:bold; color:#64748b; display:block;">Nº AUSENCIAS / FALTAS</span>
                    <span style="font-size:1.8rem; font-weight:bold; color:#0f172a; margin-top:5px; display:block;">${totalAusenciasCentro}</span>
                </div>
                <div style="background:#f1f5f9; padding:15px; border-radius:12px; border-left:5px solid #005696;">
                    <span style="font-size:0.75rem; font-weight:bold; color:#64748b; display:block;">MEDIA GLOBAL DE ASISTENCIA</span>
                    <span style="font-size:1.8rem; font-weight:bold; color:#0f172a; margin-top:5px; display:block;">${porcGlobal}%</span>
                </div>
            </div>
        `;
    } else {
        html = `
            <div style="overflow-x:auto; border:1px solid #e2e8f0; border-radius:12px;">
                <table style="width:100%; border-collapse:collapse; font-size:0.9rem; text-align:left;">
                    <thead>
                        <tr style="background:#f1f5f9; color:#475569;">
                            ${opcion === 'actividad' ? '<th style="padding:12px; border-bottom:2px solid #e2e8f0;">Actividade</th><th style="padding:12px; border-bottom:2px solid #e2e8f0;">Horas de Clase</th><th style="padding:12px; border-bottom:2px solid #e2e8f0;">Nº Alumnos</th><th style="padding:12px; border-bottom:2px solid #e2e8f0;">% Relación Alumnos/Asistencias</th>' : ''}
                            ${opcion === 'monitor' ? '<th style="padding:12px; border-bottom:2px solid #e2e8f0;">Monitor/a</th><th style="padding:12px; border-bottom:2px solid #e2e8f0;">Actividades</th><th style="padding:12px; border-bottom:2px solid #e2e8f0;">% Asistencia Media</th>' : ''}
                            ${opcion === 'alumno' ? '<th style="padding:12px; border-bottom:2px solid #e2e8f0;">Alumno/a</th><th style="padding:12px; border-bottom:2px solid #e2e8f0;">Actividades Asistidas</th><th style="padding:12px; border-bottom:2px solid #e2e8f0;">% Asistencia por Actividade e Total</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (opcion === 'actividad') {
            actividades.forEach(act => {
                const nombreAct = act.nome.trim().toUpperCase();
                const alAct = alumnos.filter(a => (a.act || "").trim().toUpperCase() === nombreAct);
                const fechas = fechasClasesPorActividad[nombreAct] || [];
                const horasClase = fechas.length;

                let presencias = 0;
                let totalPosibles = 0;

                alAct.forEach(al => {
                    const asist = al.asistencias || {};
                    fechas.forEach(f => {
                        if (asist[f] === true || asist[f] === false) {
                            totalPosibles++;
                            if (asist[f] === true) presencias++;
                        }
                    });
                });

                const pct = totalPosibles > 0 ? Math.round((presencias / totalPosibles) * 100) : null;

                html += `
                    <tr style="border-bottom:1px solid #e2e8f0;">
                        <td style="padding:12px; font-weight:bold; color:#0f172a;">${act.nome}</td>
                        <td style="padding:12px; color:#334155;">${horasClase} hrs</td>
                        <td style="padding:12px; color:#334155;">${alAct.length} alumnos</td>
                        <td style="padding:12px; color:#334155;">
                            ${pct !== null ? `
                                <div style="background:#e2e8f0; height:10px; border-radius:5px; overflow:hidden; width:90px; display:inline-block; vertical-align:middle; margin-right:8px;">
                                    <div style="height:100%; width:${pct}%; background:#005696; border-radius:5px;"></div>
                                </div>
                                <strong>${pct}%</strong> (${presencias}/${totalPosibles})
                            ` : '<span style="color:#94a3b8; font-style:italic;">Sen rexistros</span>'}
                        </td>
                    </tr>
                `;
            });
        } else if (opcion === 'monitor') {
            const monitoresUnicos = [...new Set(actividades.map(a => a.monitor).filter(Boolean))];
            
            monitoresUnicos.forEach(mon => {
                const actsMon = actividades.filter(a => a.monitor === mon);
                const nomesActs = actsMon.map(a => a.nome);

                let totalHorasMon = 0;
                let presenciasMon = 0;
                let posiblesMon = 0;

                actsMon.forEach(act => {
                    const nombreAct = act.nome.trim().toUpperCase();
                    const alAct = alumnos.filter(a => (a.act || "").trim().toUpperCase() === nombreAct);
                    const fechas = fechasClasesPorActividad[nombreAct] || [];
                    totalHorasMon += fechas.length;

                    alAct.forEach(al => {
                        const asist = al.asistencias || {};
                        fechas.forEach(f => {
                            if (asist[f] === true || asist[f] === false) {
                                posiblesMon++;
                                if (asist[f] === true) presenciasMon++;
                            }
                        });
                    });
                });

                const pct = posiblesMon > 0 ? Math.round((presenciasMon / posiblesMon) * 100) : null;

                html += `
                    <tr style="border-bottom:1px solid #e2e8f0;">
                        <td style="padding:12px; font-weight:bold; color:#0f172a;">${mon}</td>
                        <td style="padding:12px; color:#334155;">${nomesActs.join(', ') || 'Ningunha'} (${actsMon.length} act. / ${totalHorasMon} hrs)</td>
                        <td style="padding:12px; color:#334155;">
                            ${pct !== null ? `
                                <div style="background:#e2e8f0; height:10px; border-radius:5px; overflow:hidden; width:90px; display:inline-block; vertical-align:middle; margin-right:8px;">
                                    <div style="height:100%; width:${pct}%; background:#005696; border-radius:5px;"></div>
                                </div>
                                <strong>${pct}%</strong>
                            ` : '<span style="color:#94a3b8; font-style:italic;">Sen rexistros</span>'}
                        </td>
                    </tr>
                `;
            });
        } else if (opcion === 'alumno') {
            // Mostramos só alumnos que teñan asistencias reais rexistradas
            const alumnosConRexistros = alumnos.filter(al => {
                const asist = al.asistencias || {};
                return Object.entries(asist).some(([f, v]) => f >= "2026-11-01" && (v === true || v === false));
            });

            if (alumnosConRexistros.length === 0) {
                html += `<tr><td colspan="3" style="padding:15px; text-align:center; color:#64748b;">Non hai alumnos con asistencias marcadas dende novembro.</td></tr>`;
            } else {
                alumnosConRexistros.forEach(al => {
                    const nombreAct = (al.act || "").trim().toUpperCase();
                    const fechas = fechasClasesPorActividad[nombreAct] || [];

                    let presenciasAl = 0;
                    let totalAl = 0;
                    const asist = al.asistencias || {};

                    fechas.forEach(f => {
                        if (asist[f] === true || asist[f] === false) {
                            totalAl++;
                            if (asist[f] === true) presenciasAl++;
                        }
                    });

                    const pctAct = totalAl > 0 ? Math.round((presenciasAl / totalAl) * 100) : 0;

                    html += `
                        <tr style="border-bottom:1px solid #e2e8f0;">
                            <td style="padding:12px; font-weight:bold; color:#0f172a;">${al.nome} ${al.apelidos || ''}</td>
                            <td style="padding:12px; color:#334155;">${al.act || 'Sen actividade'}</td>
                            <td style="padding:12px; color:#334155;">
                                <div style="margin-bottom:4px;">
                                    <span>${al.act || 'Actividade'}: <strong>${pctAct}%</strong> (${presenciasAl}/${totalAl})</span>
                                </div>
                                <div style="border-top:1px dashed #cbd5e1; padding-top:4px; font-weight:bold; color:#005696;">
                                    TOTAL GLOBAL: ${pctAct}%
                                </div>
                            </td>
                        </tr>
                    `;
                });
            }
        }

        html += `</tbody></table></div>`;
    }

    contenedorRes.innerHTML = html;
}

// ==========================================
// UTILIDADES E COPIAS DE SEGURIDADE
// ==========================================

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
                    window.db.Actividades.push({ nome: actividadActual, dia: "", hora: "", aula: "", monitor: "", creacion: new Date().toISOString().split('T')[0] });
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
