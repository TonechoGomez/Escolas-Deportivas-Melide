// ==========================================
// MÓDULO: CUADRANTES (cuadrantes.js)
// ==========================================

function mostrarCuadrantes() {
    const actions = document.getElementById('section-actions');
    const container = document.getElementById('data-container');
    if (!actions || !container) return;

    actions.innerHTML = `
        <div style="background:rgba(255,255,255,0.1); padding:15px; border-radius:15px; margin-bottom:15px; border:1px solid rgba(255,255,255,0.2);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h2 style="margin:0; color:white; font-size:1.2rem;">XESTIÓN DE HORARIOS</h2>
                <div style="display:flex; gap:10px;">
                    <button onclick="abrirConfiguracionDatos()" style="background:#64748b; color:white; padding:8px 15px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; font-size:0.8rem;">⚙️ CONFIGURACIÓN</button>
                    <button onclick="window.print()" style="background:#475569; color:white; padding:8px 15px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; font-size:0.8rem;">🖨️ IMPRIMIR</button>
                </div>
            </div>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <select id="filtro-tipo" onchange="actualizarOpcionesFiltro()" style="padding:10px; border-radius:8px; border:none; font-size:0.9rem; background:white; color:#333;">
                    <option value="">Filtrar segundo cuadro por...</option>
                    <option value="dia">Día</option>
                    <option value="hora">Hora</option>
                    <option value="monitor">Monitor/a</option>
                    <option value="aula">Instalación</option>
                </select>
                
                <select id="filtro-valor" onchange="renderizarAmbosCuadrantes()" style="padding:10px; border-radius:8px; border:none; font-size:0.9rem; background:white; color:#333;">
                    <option value="">Selecciona opción...</option>
                </select>
            </div>
        </div>
    `;

    renderizarAmbosCuadrantes();
}

function abrirConfiguracionDatos() {
    const container = document.getElementById('data-container');
    if (!container) return;

    // Limpiamos todo el contenedor antes de dibujar para evitar que las tablas lo pisen
    container.innerHTML = "";
    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.padding = "20px 0";

    container.innerHTML = `
        <div style="background:white; padding:30px; border-radius:20px; color:#333; box-shadow:0 10px 30px rgba(0,0,0,0.3); width:100%; max-width:500px; border:1px solid #e2e8f0;">
            <div style="text-align:center; margin-bottom:25px;">
                <h3 style="margin:0; color:#1e293b; font-size:1.4rem;">Xestión de Datos</h3>
                <p style="font-size:0.85rem; color:#64748b; margin-top:5px;">Copia de seguridade e restauración</p>
            </div>
            
            <div style="display:grid; grid-template-columns: 1fr; gap:12px;">
                <button onclick="exportarDatosJSON()" style="padding:15px; background:#16a34a; color:white; border:none; border-radius:12px; cursor:pointer; font-weight:bold; font-size:0.9rem; transition:0.2s;">
                    📤 EXPORTAR COPIA (JSON)
                </button>
                
                <button onclick="document.getElementById('input-import').click()" style="padding:15px; background:#2563eb; color:white; border:none; border-radius:12px; cursor:pointer; font-weight:bold; font-size:0.9rem;">
                    📥 IMPORTAR COPIA (JSON)
                </button>
                <input type="file" id="input-import" style="display:none" onchange="importarDatosJSON(event)">
                
                <hr style="border:0; border-top:1px solid #eee; margin:10px 0;">
                
                <button onclick="borrarTodaLaBD()" style="padding:15px; background:#ef4444; color:white; border:none; border-radius:12px; cursor:pointer; font-weight:bold; font-size:0.9rem;">
                    ⚠️ BORRAR TODO
                </button>
            </div>
            
            <button onclick="renderizarAmbosCuadrantes()" style="margin-top:25px; width:100%; padding:12px; background:#475569; color:white; border:none; border-radius:12px; cursor:pointer; font-weight:bold; font-size:0.9rem;">
                ✕ PECHAR E VOLVER
            </button>
        </div>
    `;
}

function exportarDatosJSON() {
    if (!window.db) return alert("Non hai datos para exportar");
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.db));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "copia_seguridade_licitacion.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importarDatosJSON(event) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importado = JSON.parse(e.target.result);
            if (confirm("¿Sobrescribir todos los datos actuales?")) {
                window.db = importado;
                if (typeof saveData === 'function') saveData();
                else localStorage.setItem('melide_db', JSON.stringify(window.db));
                alert("Datos restaurados.");
                renderizarAmbosCuadrantes();
            }
        } catch (err) { alert("Archivo no válido."); }
    };
    reader.readAsText(event.target.files[0]);
}

function borrarTodaLaBD() {
    if (confirm("¿ELIMINAR TODO? Esta acción es definitiva.")) {
        window.db = { Centros: [], Aulas: [], Monitores: [], Actividades: [], Material: [] };
        if (typeof saveData === 'function') saveData();
        else localStorage.setItem('melide_db', JSON.stringify(window.db));
        location.reload();
    }
}

function obtenerCodigosDia(texto) {
    if (!texto) return [];
    const t = texto.toUpperCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const d = { "LUNS": 1, "LUNES": 1, "MARTES": 2, "MERCORES": 3, "MIERCOLES": 3, "XOVES": 4, "JUEVES": 4, "VENRES": 5, "VIERNES": 5, "SABADO": 6 };
    const partes = t.split(/[^A-Z]+/);
    return [...new Set(partes.map(p => d[p]).filter(Boolean))].sort();
}

function actualizarOpcionesFiltro() {
    const tipo = document.getElementById('filtro-tipo').value;
    const valorSelect = document.getElementById('filtro-valor');
    valorSelect.innerHTML = '<option value="">Todos</option>';
    if (!tipo) return;

    let opciones = [];
    if (tipo === 'dia') {
        opciones = ["LUNS", "MARTES", "MÉRCORES", "XOVES", "VENRES", "LUNS-MÉRCORES", "MARTES-XOVES", "SÁBADO"];
    } else if (tipo === 'hora') {
        for (let h = 9; h <= 21; h++) opciones.push(`${h.toString().padStart(2, '0')}:00`);
    } else if (tipo === 'monitor') {
        opciones = [...new Set((window.db.Actividades || []).map(a => a.monitor).filter(Boolean))].sort();
    } else if (tipo === 'aula') {
        opciones = [...new Set((window.db.Actividades || []).map(a => a.aula).filter(Boolean))].sort();
    }

    opciones.forEach(opt => {
        const el = document.createElement('option');
        el.value = opt; el.textContent = opt;
        valorSelect.appendChild(el);
    });
}

function renderizarAmbosCuadrantes() {
    const container = document.getElementById('data-container');
    if (!container) return;
    container.innerHTML = "";
    container.style.display = "block"; // Reset de estilo por si venimos de configuración

    const divGen = document.createElement('div');
    divGen.innerHTML = `<h4 style="color:white; margin-bottom:8px; border-left:4px solid #16a34a; padding-left:8px; font-size:0.9rem;">CUADRANTE XERAL</h4>`;
    divGen.appendChild(generarTablaBase(false)); 
    container.appendChild(divGen);

    const spacer = document.createElement('div'); spacer.style.height = "30px";
    container.appendChild(spacer);

    const divFil = document.createElement('div');
    divFil.innerHTML = `<h4 style="color:white; margin-bottom:8px; border-left:4px solid #f59e0b; padding-left:8px; font-size:0.9rem;">VISTA FILTRADA</h4>`;
    divFil.appendChild(generarTablaBase(true));
    container.appendChild(divFil);
}

function generarTablaBase(aplicarFiltro) {
    const diasCol = ["Luns", "Martes", "Mércores", "Xoves", "Venres", "Sábado"];
    const horas = [9,10,11,12,13,14,15,16,17,18,19,20,21];
    
    const tipoFiltro = document.getElementById('filtro-tipo')?.value;
    const valorFiltro = document.getElementById('filtro-valor')?.value;

    const wrap = document.createElement('div');
    wrap.style.cssText = "overflow-x:auto; background:white; border-radius:12px; padding:8px; box-shadow:0 4px 15px rgba(0,0,0,0.2);";

    let htm = `<table style="width:100%; border-collapse:collapse; color:#333; font-size:0.6rem; table-layout: fixed; border:1px solid #cbd5e1;">
        <thead><tr><th style="padding:6px; border:1px solid #cbd5e1; background:#f1f5f9; width:45px;">Hora</th>
        ${diasCol.map(d => `<th style="padding:6px; border:1px solid #cbd5e1; background:#005696; color:white;">${d.toUpperCase()}</th>`).join('')}
        </tr></thead><tbody>`;

    horas.forEach(hr => {
        htm += `<tr><td style="padding:6px; border:1px solid #cbd5e1; font-weight:bold; text-align:center; background:#f8fafc;">${hr.toString().padStart(2, '0')}:00</td>`;
        
        diasCol.forEach((_, idx) => {
            const codCol = idx + 1;
            
            const actividades = (window.db.Actividades || []).filter(act => {
                const codigosAct = obtenerCodigosDia(act.dia);
                const horaAct = parseInt((act.hora || "").split(':')[0]);

                if (!(codigosAct.includes(codCol) && horaAct === hr)) return false;
                if (!aplicarFiltro || !tipoFiltro || !valorFiltro || valorFiltro === "") return true;

                if (tipoFiltro === 'dia') {
                    const codigosFiltro = obtenerCodigosDia(valorFiltro);
                    if (codigosFiltro.length === 1) {
                        return codigosAct.includes(codigosFiltro[0]) && codCol === codigosFiltro[0];
                    } else {
                        return codigosAct.length === codigosFiltro.length && 
                               codigosAct.every((val, i) => val === codigosFiltro[i]);
                    }
                }
                
                if (tipoFiltro === 'monitor') return (act.monitor || "") === valorFiltro;
                if (tipoFiltro === 'aula') return (act.aula || "") === valorFiltro;
                if (tipoFiltro === 'hora') return (act.hora || "").includes(valorFiltro);
                return false;
            });

            let content = "";
            actividades.forEach(a => {
                content += `<div style="background:#f0f9ff; margin-bottom:3px; padding:4px; border-radius:4px; border-left:3px solid #005696; border:1px solid #bae6fd; overflow:hidden;">
                    <div style="font-weight:bold; color:#0369a1; font-size:0.55rem; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${a.nome}</div>
                    <div style="color:#64748b; font-size:0.5rem;">${a.aula || ''}</div>
                </div>`;
            });
            htm += `<td style="border:1px solid #cbd5e1; vertical-align:top; padding:3px; min-height:40px;">${content}</td>`;
        });
        htm += `</tr>`;
    });

    htm += `</tbody></table>`;
    wrap.innerHTML = htm;
    return wrap;
}
