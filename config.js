// ==========================================
// MÓDULO: ACTIVIDADES (actividades.js)
// ==========================================

function mostrarActividades() {
    const actions = document.getElementById('section-actions');
    const scrDash = document.getElementById('scr-dash');
    const scrEdit = document.getElementById('scr-edit');
    const btnAtras = document.getElementById('btn-atras');

    if (scrDash) scrDash.style.display = "none";
    if (scrEdit) scrEdit.style.display = "block";
    if (btnAtras) {
        btnAtras.style.display = "block";
        btnAtras.onclick = () => {
            document.getElementById('scr-dash').style.display = "grid";
            document.getElementById('scr-edit').style.display = "none";
            btnAtras.style.display = "none";
        };
    }

    if (actions) {
        actions.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom: 10px;">
                <h2 style="margin:0; color:white; font-size: 1.4rem;">ACTIVIDADES</h2>
                <button onclick="nuevaActividad()" style="background:#16a34a; color:white; padding:10px 20px; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">+ NOVA ACTIVIDADE</button>
            </div>
        `;
    }

    renderizarListaActividades();
}

function renderizarListaActividades() {
    const container = document.getElementById('data-container');
    if (!container) return;

    let listaAct = [...(window.db.Actividades || [])];
    
    // Ordenación natural
    listaAct.sort((a, b) => (a.nome || "").toString().localeCompare((b.nome || "").toString(), 'es', { numeric: true }));

    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(auto-fill, minmax(280px, 1fr))"; 
    container.style.gap = "10px";
    container.innerHTML = "";

    listaAct.forEach((act) => {
        const valNombre = act.nome || "SEN NOME";
        const valMonitor = act.monitor || "---";
        const valAula = act.aula || "---";
        const valHora = act.hora || "--:--";
        const valDia = act.dia || "---";

        const realIdx = window.db.Actividades.findIndex(a => a.nome === valNombre);

        const card = document.createElement('div');
        card.style.cssText = `
            background: white; border-radius: 12px; padding: 12px; color: #333; 
            box-shadow: 0 4px 10px rgba(0,0,0,0.2); border-left: 6px solid #005696;
            display: flex; flex-direction: column; justify-content: space-between; min-height: 180px;
        `;

        card.innerHTML = `
            <div style="margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <h3 style="margin:0; color:#005696; font-size:1.1rem; text-transform: uppercase; line-height:1.2; font-weight:800;">
                        ${valNombre}
                    </h3>
                    <div style="display:flex; gap:8px;">
                        <button onclick="editarActividad(${realIdx})" style="background:none; border:none; color:#64748b; cursor:pointer; font-size:1rem;">✏️</button>
                        <button onclick="borrarActividad(${realIdx})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:1rem;">🗑️</button>
                    </div>
                </div>
            </div>

            <div style="flex-grow:1; font-size:0.8rem; line-height: 1.3; color:#475569;">
                <p style="margin:2px 0;">📅 ${valDia}</p>
                <p style="margin:2px 0;">⏰ ${valHora}</p>
                <p style="margin:2px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">🏠 ${valAula}</p>
                <p style="margin:2px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">👤 ${valMonitor}</p>
            </div>

            <div style="display:flex; gap:6px; margin-top:12px; border-top:1px solid #f0f0f0; padding-top:10px;">
                <button onclick="verListaAsistencia(\`${valNombre}\`)" style="flex:1; background:#005696; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:0.75rem; text-transform:uppercase;">Lista</button>
                <button onclick="abrirGestionWhatsApp(\`${valNombre}\`)" style="flex:1; background:#25d366; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:0.75rem; text-transform:uppercase;">WhatsApp</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function editarActividad(index) {
    const act = window.db.Actividades[index];
    const modalBody = document.getElementById('modal-body');
    const monitores = window.db.Monitores || [];
    const dias = ["Luns", "Martes", "Mércores", "Xoves", "Venres", "Sábado", "Domingo", "Luns-Mércores", "Martes-Xoves"];
    
    let horasOptions = "";
    for(let i = 8; i <= 22; i++) {
        ["00", "30"].forEach(min => {
            let h = i < 10 ? "0"+i : i;
            let timeStr = h + ":" + min;
            horasOptions += `<option value="${timeStr}" ${act.hora === timeStr ? 'selected' : ''}>${timeStr}</option>`;
        });
    }

    const esParroquia = (act.aula || '').includes('Parroquia') ? 'Parroquias' : 'Instalacion';

    modalBody.innerHTML = `
        <div style="padding:10px; text-align:left; max-width:100%; box-sizing:border-box;">
            <h2 style="color:#005696; margin-top:0; font-size:1.3rem;">Editar Actividade</h2>
            <div style="display:flex; flex-direction:column; gap:12px;">
                <input type="text" id="edit-act-nome" value="${act.nome || ''}" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
                <select id="edit-act-dia" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                    ${dias.map(d => `<option value="${d}" ${act.dia === d ? 'selected' : ''}>${d}</option>`).join('')}
                </select>
                <select id="edit-act-hora" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                    ${horasOptions}
                </select>

                <select id="edit-act-tipo-ubicacion" onchange="actualizarSubUbicaciones(this.value, 'edit-act-aula')" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                    <option value="Instalacion" ${esParroquia === 'Instalacion' ? 'selected' : ''}>Instalación Municipal</option>
                    <option value="Parroquias" ${esParroquia === 'Parroquias' ? 'selected' : ''}>Parroquias</option>
                </select>

                <select id="edit-act-aula" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                </select>

                <select id="edit-act-monitor" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                    ${monitores.map(m => `<option value="${m.nome}" ${act.monitor === m.nome ? 'selected' : ''}>${m.nome}</option>`).join('')}
                </select>
                <button onclick="actualizarActividade(${index})" style="width:100%; background:#005696; color:white; padding:15px; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">GARDAR CAMBIOS</button>
            </div>
        </div>
    `;
    document.getElementById('modal-overlay').classList.add('active');
    actualizarSubUbicaciones(esParroquia, 'edit-act-aula', act.aula);
}

function actualizarActividade(index) {
    window.db.Actividades[index].nome = document.getElementById('edit-act-nome').value.trim();
    window.db.Actividades[index].dia = document.getElementById('edit-act-dia').value;
    window.db.Actividades[index].hora = document.getElementById('edit-act-hora').value;
    window.db.Actividades[index].aula = document.getElementById('edit-act-aula').value;
    window.db.Actividades[index].monitor = document.getElementById('edit-act-monitor').value;
    saveData(); closeModal(); renderizarListaActividades();
}

function nuevaActividad() {
    const modalBody = document.getElementById('modal-body');
    const monitores = window.db.Monitores || [];
    const dias = ["Luns", "Martes", "Mércores", "Xoves", "Venres", "Sábado", "Domingo", "Luns-Mércores", "Martes-Xoves"];
    let horasOptions = "";
    for(let i = 8; i <= 22; i++) {
        ["00", "30"].forEach(min => {
            let h = i < 10 ? "0"+i : i;
            let timeStr = h + ":" + min;
            horasOptions += `<option value="${timeStr}">${timeStr}</option>`;
        });
    }
    modalBody.innerHTML = `
        <div style="padding:10px; text-align:left;">
            <h2 style="color:#005696; margin-top:0;">Nova Actividade</h2>
            <div style="display:flex; flex-direction:column; gap:10px;">
                <input type="text" id="act-nome" placeholder="Nome" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;">
                <select id="act-dia" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                    <option value="">Selecciona Día</option>
                    ${dias.map(d => `<option value="${d}">${d}</option>`).join('')}
                </select>
                <select id="act-hora" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                    <option value="">Selecciona Hora</option>
                    ${horasOptions}
                </select>
                
                <select id="act-tipo-ubicacion" onchange="actualizarSubUbicaciones(this.value, 'act-aula')" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                    <option value="Instalacion">Instalación Municipal</option>
                    <option value="Parroquias">Parroquias</option>
                </select>

                <select id="act-aula" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                    <option value="">Selecciona Lugar</option>
                </select>

                <select id="act-monitor" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                    <option value="">Selecciona Monitor/a</option>
                    ${monitores.map(m => `<option value="${m.nome}">${m.nome}</option>`).join('')}
                </select>
                <button onclick="gardarActividade()" style="background:#005696; color:white; padding:15px; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">GARDAR</button>
            </div>
        </div>
    `;
    document.getElementById('modal-overlay').classList.add('active');
    actualizarSubUbicaciones('Instalacion', 'act-aula');
}

function gardarActividade() {
    const nome = document.getElementById('act-nome').value.trim();
    if (!nome) return alert("O nome é obrigatorio");
    window.db.Actividades.push({ 
        nome, 
        dia: document.getElementById('act-dia').value, 
        hora: document.getElementById('act-hora').value, 
        aula: document.getElementById('act-aula').value, 
        monitor: document.getElementById('act-monitor').value 
    });
    saveData(); closeModal(); renderizarListaActividades();
}

function borrarActividad(index) {
    if (confirm("¿Borrar actividade?")) {
        window.db.Actividades.splice(index, 1);
        saveData();
        renderizarListaActividades();
    }
}

function verListaAsistencia(nomeAct) {
    if (typeof mostrarAlumnos === 'function') { mostrarAlumnos(nomeAct); }
}

function abrirGestionWhatsApp(nomeAct) {
    if (typeof prepararEnvioWhatsApp === 'function') {
        prepararEnvioWhatsApp(nomeAct);
    } else {
        alert("Erro: O módulo de comunicación non está cargado.");
    }
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
}
function actualizarSubUbicaciones(tipoSeleccionado, selectId, valorActual = '') {
    const contenedor = document.getElementById(selectId);
    if (!contenedor) return;

    let opciones = '<option value="">Selecciona Lugar</option>';
    const aulas = window.db.Aulas || [];

    if (tipoSeleccionado === 'Parroquias') {
        // Filtra o lista las aulas correspondientes a parroquias (según cómo las guardes en tu base de datos)
        const parroquiasFiltradas = aulas.filter(a => (a.tipo || '').toLowerCase() === 'parroquia' || (a.zona || '').toLowerCase() === 'parroquia');
        const listaFinal = parroquiasFiltradas.length > 0 ? parroquiasFiltradas : aulas; // Si no hay filtro estricto, muestra todas para evitar vacíos
        
        opciones += listaFinal.map(a => `<option value="${a.nome}" ${valorActual === a.nome ? 'selected' : ''}>${a.nome}</option>`).join('');
    } else {
        const instalacionesFiltradas = aulas.filter(a => (a.tipo || '').toLowerCase() !== 'parroquia' && (a.zona || '').toLowerCase() !== 'parroquia');
        const listaFinal = instalacionesFiltradas.length > 0 ? instalacionesFiltradas : aulas;
        
        opciones += listaFinal.map(a => `<option value="${a.nome}" ${valorActual === a.nome ? 'selected' : ''}>${a.nome}</option>`).join('');
    }
    contenedor.innerHTML = opciones;
}