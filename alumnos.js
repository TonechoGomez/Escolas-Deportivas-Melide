// ==========================================
// MÓDULO: ALUMNOS (alumnos.js)
// ==========================================

function mostrarAlumnos(filtroActividad = "") {
    const container = document.getElementById('data-container');
    const actions = document.getElementById('section-actions');
    const scrDash = document.getElementById('scr-dash');
    const scrEdit = document.getElementById('scr-edit');
    const btnAtras = document.getElementById('btn-atras');

    if (scrDash) scrDash.style.display = "none";
    if (scrEdit) scrEdit.style.display = "block";
    
    if (btnAtras) {
        btnAtras.style.display = "block";
        // CORRECCIÓN: Definimos el comportamiento de atrás de forma directa para evitar saltos dobles
        btnAtras.onclick = () => {
            if (filtroActividad) {
                // Si venimos de una actividad, al pulsar atrás volvemos a la lista de Actividades
                if (typeof mostrarActividades === 'function') {
                    mostrarActividades();
                } else {
                    mostrarAlumnos("");
                }
            } else {
                // Si es el listado general, volvemos al inicio (dashboard)
                if (typeof irInicio === 'function') {
                    irInicio();
                } else {
                    document.getElementById('scr-dash').style.display = "grid";
                    document.getElementById('scr-edit').style.display = "none";
                    btnAtras.style.display = "none";
                }
            }
        };
    }

    if (actions) {
        actions.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:10px; width:100%; margin-bottom:15px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="margin:0; color:white; font-size:1.4rem;">${filtroActividad.toUpperCase() || 'ALUMNOS'}</h2>
                    <button onclick="nuevoAlumno(\`${filtroActividad}\`)" style="background:#16a34a; color:white; padding:10px 20px; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">+ NOVO</button>
                </div>
                <input type="text" id="search-alumno" placeholder="Buscar por nome..." value="${filtroActividad}" oninput="renderizarListaAlumnos(this.value)" style="width:100%; padding:12px; border-radius:10px; border:none; font-size:1rem;">
            </div>
        `;
    }

    renderizarListaAlumnos(filtroActividad);
}

function renderizarListaAlumnos(query = "") {
    const container = document.getElementById('data-container');
    if (!container) return;

    let listaAl = [...(window.db.Alumnos || [])];
    const actividadesExistentes = (window.db.Actividades || []).map(a => a.nome);
    
    // LIMPEZA DE DATOS HUÉRFANOS
    listaAl.forEach(al => {
        if (al.act && !actividadesExistentes.includes(al.act)) {
            al.act = ""; 
        }
    });

    const obtenerEstadoReal = (alumno) => {
        const clave = Object.keys(alumno).find(k => 
            k.toLowerCase().trim().includes('estado') || 
            k.toLowerCase().trim().includes('situacion') || 
            k.toLowerCase().trim().includes('status')
        );
        const valor = clave ? alumno[clave] : null;
        if (!valor) return "ESPERA";
        let str = valor.toString().toLowerCase().trim();
        if (str.includes("admiti")) return "ADMITIDO";
        if (str.includes("baja") || str.includes("baixa")) return "BAIXA";
        return "ESPERA";
    };

    // FILTRADO
    if (query) {
        const q = query.trim().toLowerCase();
        listaAl = listaAl.filter(a => 
            (a.nome && a.nome.toString().toLowerCase().includes(q)) || 
            (a.apelidos && a.apelidos.toString().toLowerCase().includes(q)) ||
            (a.act && a.act.toString().toLowerCase().includes(q))
        );
    }

    // CORRECCIÓN ORDENACIÓN: 1º Admitidos (A-Z), 2º Espera (A-Z), 3º Baixa (A-Z)
    const mapaOrden = { 'ADMITIDO': 1, 'ESPERA': 2, 'BAIXA': 3 };
    listaAl.sort((a, b) => {
        const estA = obtenerEstadoReal(a), estB = obtenerEstadoReal(b);
        // Si los estados son distintos, ordenamos por la jerarquía del mapa
        if (mapaOrden[estA] !== mapaOrden[estB]) return mapaOrden[estA] - mapaOrden[estB];
        
        // Si el estado es el mismo, ordenamos alfabéticamente por Nombre + Apellidos
        const completoA = ((a.nome || "") + " " + (a.apelidos || "")).trim().toUpperCase();
        const completoB = ((b.nome || "") + " " + (b.apelidos || "")).trim().toUpperCase();
        return completoA.localeCompare(completoB);
    });

    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "10px";
    container.innerHTML = "";

    if (listaAl.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:white; padding:20px;">Non se atoparon alumnos.</p>`;
        return;
    }

    const hoyISO = new Date().toISOString().split('T')[0];
    const hoyLabel = new Date().toLocaleDateString('gl-ES', { day: '2-digit', month: '2-digit' });

    listaAl.forEach((alumnoItem) => {
        const estadoFinal = obtenerEstadoReal(alumnoItem);
        let colorBorde = (estadoFinal === 'ADMITIDO') ? "#22c55e" : (estadoFinal === 'BAIXA' ? "#ef4444" : "#eab308");
        const realIdx = window.db.Alumnos.findIndex(orig => orig === alumnoItem);

        const card = document.createElement('div');
        card.style.cssText = `background:white; border-radius:12px; padding:12px; display:flex; align-items:center; gap:12px; box-shadow:0 2px 8px rgba(0,0,0,0.1); border-left: 8px solid ${colorBorde}; color:#333;`;

        card.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; background:#f1f5f9; padding:5px; border-radius:8px; min-width:55px;">
                <span style="font-size:0.65rem; font-weight:bold; color:#475569; margin-bottom:2px;">${hoyLabel}</span>
                <input type="checkbox" ${alumnoItem.asistencias && alumnoItem.asistencias[hoyISO] ? 'checked' : ''} onchange="marcarAsistenciaRapida(${realIdx}, '${hoyISO}', this.checked)" style="width:22px; height:22px; cursor:pointer;">
            </div>

            <div style="flex:2;">
                <h3 style="margin:0; font-size:1rem; text-transform:uppercase;">${alumnoItem.nome} ${alumnoItem.apelidos || ''}</h3>
                <p style="margin:0; font-size:0.8rem; color:#666; font-weight:bold;">${alumnoItem.act || 'SEN ACTIVIDADE'}</p>
            </div>
            
            <button onclick="verHistorialAsistencias(${realIdx})" style="background:#005696; color:white; border:none; padding:8px 12px; border-radius:8px; font-size:0.75rem; font-weight:bold; cursor:pointer;">📊</button>

            <select onchange="cambiarEstadoAlumno(${realIdx}, this.value)" style="background:${colorBorde}; color:white; border:none; border-radius:8px; padding:8px; font-size:0.75rem; font-weight:bold; cursor:pointer;">
                <option value="Admitido" ${estadoFinal === 'ADMITIDO' ? 'selected' : ''}>ADMITIDO</option>
                <option value="Espera" ${estadoFinal === 'ESPERA' ? 'selected' : ''}>ESPERA</option>
                <option value="Baja" ${estadoFinal === 'BAIXA' ? 'selected' : ''}>BAIXA</option>
            </select>

            <div style="display:flex; gap:10px;">
                <button onclick="editarAlumno(${realIdx})" style="background:none; border:none; color:#64748b; cursor:pointer; font-size:1.1rem;">✏️</button>
                <button onclick="borrarAlumno(${realIdx})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:1.1rem;">🗑️</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function marcarAsistenciaRapida(index, fecha, valor) {
    if (!window.db.Alumnos[index].asistencias) window.db.Alumnos[index].asistencias = {};
    window.db.Alumnos[index].asistencias[fecha] = valor;
    saveData();
}

function cambiarEstadoAlumno(index, nuevoEstado) {
    window.db.Alumnos[index].estado = nuevoEstado;
    window.db.Alumnos[index].status = nuevoEstado;
    saveData();
    const query = document.getElementById('search-alumno') ? document.getElementById('search-alumno').value : "";
    renderizarListaAlumnos(query);
}

function verHistorialAsistencias(index) {
    const al = window.db.Alumnos[index];
    const modalBody = document.getElementById('modal-body');
    let html = `<h3 style="margin-top:0; color:#005696;">Historial: ${al.nome}</h3>`;
    html += `<div style="max-height:250px; overflow-y:auto; border-radius:10px; border:1px solid #eee;">`;
    const asistencias = al.asistencias || {};
    const fechas = Object.keys(asistencias).sort().reverse();
    if (fechas.length === 0) {
        html += `<p style="padding:20px; text-align:center; color:#999;">Sen rexistros.</p>`;
    } else {
        fechas.forEach(f => {
            html += `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee;">
                    <span><strong>${f}</strong></span>
                    <select onchange="marcarAsistenciaRapida(${index}, '${f}', this.value === 'true')" style="padding:5px; border-radius:5px; border:1px solid #ddd; font-size:0.8rem; background:${asistencias[f] ? '#dcfce7' : '#fee2e2'}">
                        <option value="true" ${asistencias[f] ? 'selected' : ''}>✅ PRESENTE</option>
                        <option value="false" ${!asistencias[f] ? 'selected' : ''}>❌ AUSENTE</option>
                    </select>
                </div>`;
        });
    }
    html += `</div><button onclick="closeModal();" style="width:100%; margin-top:15px; padding:12px; background:#005696; color:white; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">PECHAR</button>`;
    modalBody.innerHTML = html;
    document.getElementById('modal-overlay').classList.add('active');
}

function editarAlumno(index) {
    const al = window.db.Alumnos[index];
    const modalBody = document.getElementById('modal-body');
    if (!al.telefonos) al.telefonos = [al.tlf || al.telf || ""];

    modalBody.innerHTML = `
        <h2 style="margin-top:0; color:#005696;">Editar Alumno</h2>
        <div style="display:flex; flex-direction:column; gap:12px; max-height: 70vh; overflow-y: auto; padding-right: 5px; text-align:left;">
            <label style="font-size:0.8rem; font-weight:bold; color:#64748b;">NOME</label>
            <input type="text" id="edit-al-nome" value="${al.nome || ''}" style="padding:10px; border-radius:8px; border:1px solid #ddd;">
            <label style="font-size:0.8rem; font-weight:bold; color:#64748b;">APELIDOS</label>
            <input type="text" id="edit-al-apelidos" value="${al.apelidos || ''}" style="padding:10px; border-radius:8px; border:1px solid #ddd;">
            <label style="font-size:0.8rem; font-weight:bold; color:#64748b;">DIRECCIÓN</label>
            <input type="text" id="edit-al-direccion" value="${al.direccion || ''}" style="padding:10px; border-radius:8px; border:1px solid #ddd;">
            <label style="font-size:0.8rem; font-weight:bold; color:#64748b;">EMAIL</label>
            <input type="email" id="edit-al-email" value="${al.email || ''}" style="padding:10px; border-radius:8px; border:1px solid #ddd;">
            <label style="font-size:0.8rem; font-weight:bold; color:#64748b;">FECHA NACEMENTO</label>
            <input type="date" id="edit-al-nacemento" value="${al.nacemento || ''}" style="padding:10px; border-radius:8px; border:1px solid #ddd;">
            <label style="font-size:0.8rem; font-weight:bold; color:#64748b;">TELÉFONOS</label>
            <div id="lista-telefonos-edit" style="display:flex; flex-direction:column; gap:5px;">
                ${al.telefonos.map((t, i) => `
                    <div style="display:flex; gap:5px;">
                        <input type="tel" class="edit-al-tel" value="${t}" style="flex:1; padding:10px; border-radius:8px; border:1px solid #ddd;">
                        ${i > 0 ? `<button onclick="this.parentElement.remove()" style="background:#ef4444; color:white; border:none; border-radius:8px; padding:0 10px;">✕</button>` : ''}
                    </div>
                `).join('')}
            </div>
            <button onclick="engadirCampoTelEdit()" style="background:#f1f5f9; color:#005696; border:1px dashed #005696; padding:8px; border-radius:8px; cursor:pointer; font-size:0.8rem;">+ Engadir outro teléfono</button>
            <button onclick="actualizarAlumno(${index})" style="background:#005696; color:white; padding:15px; border:none; border-radius:10px; font-weight:bold; cursor:pointer; margin-top:10px;">ACTUALIZAR DATOS</button>
        </div>
    `;
    document.getElementById('modal-overlay').classList.add('active');
}

function engadirCampoTelEdit() {
    const container = document.getElementById('lista-telefonos-edit');
    const div = document.createElement('div');
    div.style.cssText = "display:flex; gap:5px;";
    div.innerHTML = `
        <input type="tel" class="edit-al-tel" placeholder="Outro teléfono" style="flex:1; padding:10px; border-radius:8px; border:1px solid #ddd;">
        <button onclick="this.parentElement.remove()" style="background:#ef4444; color:white; border:none; border-radius:8px; padding:0 10px;">✕</button>
    `;
    container.appendChild(div);
}

function actualizarAlumno(index) {
    const tels = Array.from(document.querySelectorAll('.edit-al-tel')).map(input => input.value.trim()).filter(v => v !== "");
    const actActual = window.db.Alumnos[index].act || "";
    window.db.Alumnos[index].nome = document.getElementById('edit-al-nome').value.trim();
    window.db.Alumnos[index].apelidos = document.getElementById('edit-al-apelidos').value.trim();
    window.db.Alumnos[index].direccion = document.getElementById('edit-al-direccion').value.trim();
    window.db.Alumnos[index].email = document.getElementById('edit-al-email').value.trim();
    window.db.Alumnos[index].nacemento = document.getElementById('edit-al-nacemento').value;
    window.db.Alumnos[index].telefonos = tels;
    window.db.Alumnos[index].tlf = tels[0] || ""; 
    saveData(); 
    closeModal(); 
    mostrarAlumnos(actActual);
}

function nuevoAlumno(filtro = "") {
    const modalBody = document.getElementById('modal-body');
    const actividades = window.db.Actividades || [];
    modalBody.innerHTML = `
        <h2 style="margin-top:0; color:#005696;">Novo Alumno</h2>
        <div style="display:flex; flex-direction:column; gap:12px; text-align:left;">
            <input type="text" id="al-nome" placeholder="Nome" style="padding:12px; border:1px solid #ddd; border-radius:8px;">
            <input type="text" id="al-apelidos" placeholder="Apelidos" style="padding:12px; border:1px solid #ddd; border-radius:8px;">
            <select id="al-act" style="padding:12px; border:1px solid #ddd; border-radius:8px;">
                <option value="">Seleccionar Actividade</option>
                ${actividades.map(act => `<option value="${act.nome}" ${act.nome === filtro ? 'selected' : ''}>${act.nome}</option>`).join('')}
            </select>
            <input type="tel" id="al-tel" placeholder="Teléfono" style="padding:12px; border:1px solid #ddd; border-radius:8px;">
            <select id="al-estado" style="padding:12px; border:1px solid #ddd; border-radius:8px;">
                <option value="Admitido">ADMITIDO</option>
                <option value="Espera" selected>ESPERA</option>
                <option value="Baja">BAJA</option>
            </select>
            <button onclick="gardarAlumno()" style="background:#005696; color:white; padding:15px; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">GARDAR</button>
        </div>
    `;
    document.getElementById('modal-overlay').classList.add('active');
}

function gardarAlumno() {
    const nome = document.getElementById('al-nome').value.trim();
    const apelidos = document.getElementById('al-apelidos').value.trim();
    const act = document.getElementById('al-act').value;
    const tel = document.getElementById('al-tel').value.trim();
    if (!nome) return alert("O nome é obrigatorio");
    window.db.Alumnos.push({ 
        nome: nome, 
        apelidos: apelidos,
        act: act, 
        estado: document.getElementById('al-estado').value, 
        status: document.getElementById('al-estado').value,
        telefonos: tel ? [tel] : [],
        tlf: tel,
        asistencias: {} 
    });
    saveData(); closeModal(); 
    mostrarAlumnos(act);
}

function borrarAlumno(index) {
    if (confirm("¿Borrar este alumno?")) {
        const query = document.getElementById('search-alumno') ? document.getElementById('search-alumno').value : "";
        window.db.Alumnos.splice(index, 1);
        saveData();
        renderizarListaAlumnos(query);
    }
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
}