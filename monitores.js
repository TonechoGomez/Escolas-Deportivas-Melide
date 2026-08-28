// --- MÓDULO DE MONITORES (CON CARGA DE FOTO Y CIERRE OPERATIVO) ---

function mostrarMonitores() {
    const actions = document.getElementById('section-actions');
    if (actions) {
        actions.innerHTML = `<button class="btn" onclick="formMonitor()" style="background: #f59e0b; margin-bottom:20px; color:white; padding:10px 20px; border:none; border-radius:8px; cursor:pointer;">+ NUEVO MONITOR</button>`;
    }
    if (window.db && window.db.Monitores) {
        window.db.Monitores.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
        renderListaMonitores(window.db.Monitores);
    }
}

function renderListaMonitores(lista) {
    const container = document.getElementById('data-container');
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(auto-fill, minmax(22%, 1fr))"; 
    container.style.gap = "15px";
    container.style.padding = "10px";
    container.innerHTML = "";

    lista.forEach((m, idx) => {
        const card = document.createElement('div');
        card.style.cssText = "background:white; padding:20px; border-radius:15px; text-align:center; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.1); border:1px solid #e2e8f0;";
        card.onclick = () => verInfoMonitor(idx);

        const fotoUrl = m.foto || 'https://via.placeholder.com/100?text=IMAGEN';
        card.innerHTML = `
            <img src="${fotoUrl}" style="width:80px; height:80px; border-radius:50%; object-fit:cover; margin-bottom:12px; border:2px solid #005696;">
            <div style="font-weight:bold; font-size:1rem; color:#005696; text-transform:uppercase;">${m.nome}</div>
            <div style="font-size:0.9rem; color:#666; margin-top:5px;">📞 ${m.tlf || '---'}</div>
        `;
        container.appendChild(card);
    });
}

function verInfoMonitor(idx) {
    const m = window.db.Monitores[idx];
    const body = document.getElementById('modal-body');
    const actividadesImpartidas = window.db.Actividades.filter(a => a.monitor === m.nome);

    let opcionesActividades = `<option value="">-- Elegir actividad --</option>`;
    window.db.Actividades.forEach(a => {
        if (a.monitor !== m.nome) {
            opcionesActividades += `<option value="${a.nome}">${a.nome}</option>`;
        }
    });

    body.style.padding = "0"; 
    body.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; background:#f1f5f9; padding:10px 20px; border-radius:20px 20px 0 0; border-bottom:1px solid #e2e8f0;">
            <span style="font-weight:bold; color:#64748b; font-size:0.8rem;">FICHA TÉCNICA</span>
            <button onclick="closeModal()" style="background:#cbd5e1; border:none; color:white; width:30px; height:30px; border-radius:50%; font-size:1.2rem; cursor:pointer; display:flex; align-items:center; justify-content:center; font-weight:bold;">&times;</button>
        </div>

        <div style="padding:20px;">
            <div style="text-align:center; position:relative;">
                <input type="file" id="input-foto-monitor" style="display:none;" accept="image/*" onchange="subirFotoMonitor(this, ${idx})">
                
                <div onclick="document.getElementById('input-foto-monitor').click()" style="cursor:pointer; display:inline-block; position:relative;">
                    <img src="${m.foto || 'https://via.placeholder.com/100?text=SUBIR+FOTO'}" 
                         style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid #005696; display:block;">
                    <div style="position:absolute; bottom:0; right:0; background:#005696; color:white; border-radius:50%; width:25px; height:25px; display:flex; align-items:center; justify-content:center; font-size:0.8rem; border:2px solid white;">📷</div>
                </div>
                
                <h2 style="color:#005696; margin:10px 0;">${m.nome}</h2>
            </div>
            
            <div style="margin-top:15px; text-align:left; font-size:0.9rem;">
                <p><strong>DNI:</strong> ${m.dni || '---'}</p>
                <p><strong>Teléfono:</strong> ${m.tlf || '---'}</p>
                <p><strong>Fecha Nacimiento:</strong> ${m.nacemento || '---'}</p>
                <hr style="border:0; border-top:1px solid #eee; margin:15px 0;">
                
                <h3 style="font-size:1rem; color:#005696; margin-bottom:10px;">Actividades impartidas:</h3>
                <div id="lista-act-monitor" style="max-height:150px; overflow-y:auto; margin-bottom:15px;">
                    ${actividadesImpartidas.map(a => `
                        <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:8px 12px; border-radius:8px; margin-bottom:5px; border:1px solid #e2e8f0;">
                            <span>${a.nome}</span>
                            <button onclick="desvincularActividad('${a.nome}', ${idx})" style="background:#ef4444; color:white; border:none; border-radius:50%; width:24px; height:24px; cursor:pointer; font-weight:bold;">&times;</button>
                        </div>
                    `).join('')}
                </div>

                <label style="font-size:0.8rem; font-weight:bold; color:#64748b;">Añadir nueva actividad:</label>
                <select id="add-act-select" onchange="vincularActividad(this.value, ${idx})" style="width:100%; padding:10px; border-radius:8px; border:1px solid #cbd5e1; margin-top:5px; background:white;">
                    ${opcionesActividades}
                </select>
            </div>

            <div style="margin-top:25px; display:flex; gap:10px;">
                <button class="btn" onclick="editarMonitor(${idx})" style="flex:1; background:#005696; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:bold;">EDITAR DATOS</button>
                <button class="btn" onclick="borrarMonitor(${idx})" style="background:#ef4444; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:bold;">BORRAR</button>
            </div>
        </div>
    `;
    document.getElementById('modal-overlay').classList.add('active');
}

// Función para procesar la imagen seleccionada
function subirFotoMonitor(input, idx) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            window.db.Monitores[idx].foto = e.target.result; // Guardamos en Base64
            saveData();
            verInfoMonitor(idx); // Refrescamos la vista para ver la foto nueva
            mostrarMonitores(); // Refrescamos la lista general
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function vincularActividad(actNome, monitorIdx) {
    if (!actNome) return;
    const monitorNome = window.db.Monitores[monitorIdx].nome;
    const act = window.db.Actividades.find(a => a.nome === actNome);
    if (act) {
        act.monitor = monitorNome;
        saveData();
        verInfoMonitor(monitorIdx);
    }
}

function desvincularActividad(actNome, monitorIdx) {
    if (!confirm(`¿Quitar la actividad ${actNome} de este monitor?`)) return;
    const act = window.db.Actividades.find(a => a.nome === actNome);
    if (act) {
        act.monitor = "Sin asignar";
        saveData();
        verInfoMonitor(monitorIdx);
    }
}

function editarMonitor(idx) {
    const m = window.db.Monitores[idx];
    const body = document.getElementById('modal-body');
    body.style.padding = "0";
    
    body.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; background:#f1f5f9; padding:10px 20px; border-radius:20px 20px 0 0; border-bottom:1px solid #e2e8f0;">
            <span style="font-weight:bold; color:#64748b; font-size:0.8rem;">EDITAR MONITOR</span>
            <button onclick="verInfoMonitor(${idx})" style="background:#cbd5e1; border:none; color:white; width:30px; height:30px; border-radius:50%; font-size:1.2rem; cursor:pointer; display:flex; align-items:center; justify-content:center; font-weight:bold;">&times;</button>
        </div>
        <div style="padding:20px;">
            <label>Nombre:</label>
            <input type="text" id="edit-m-nome" value="${m.nome}" style="width:100%; padding:10px; margin-bottom:10px; border:1px solid #ccc; border-radius:8px; text-transform:uppercase;">
            <label>DNI:</label>
            <input type="text" id="edit-m-dni" value="${m.dni || ''}" style="width:100%; padding:10px; margin-bottom:10px; border:1px solid #ccc; border-radius:8px; text-transform:uppercase;">
            <label>Teléfono:</label>
            <input type="tel" id="edit-m-tlf" value="${m.tlf || ''}" style="width:100%; padding:10px; margin-bottom:10px; border:1px solid #ccc; border-radius:8px;">
            <label>Fecha de Nacimiento:</label>
            <input type="date" id="edit-m-nac" value="${m.nacemento || ''}" style="width:100%; padding:10px; margin-bottom:15px; border:1px solid #ccc; border-radius:8px;">
            
            <button class="btn" onclick="actualizarMonitor(${idx})" style="width:100%; background:#16a34a; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;">GUARDAR CAMBIOS</button>
        </div>
    `;
}

function actualizarMonitor(idx) {
    const nuevoNombre = document.getElementById('edit-m-nome').value.trim().toUpperCase();
    const antiguoNombre = window.db.Monitores[idx].nome;
    if (!nuevoNombre) return alert("El nombre es obligatorio");

    window.db.Monitores[idx].nome = nuevoNombre;
    window.db.Monitores[idx].dni = document.getElementById('edit-m-dni').value.trim().toUpperCase();
    window.db.Monitores[idx].tlf = document.getElementById('edit-m-tlf').value.trim();
    window.db.Monitores[idx].nacemento = document.getElementById('edit-m-nac').value;

    if (nuevoNombre !== antiguoNombre) {
        window.db.Actividades.forEach(act => {
            if (act.monitor === antiguoNombre) act.monitor = nuevoNombre;
        });
    }

    saveData();
    verInfoMonitor(idx);
    mostrarMonitores();
}

function borrarMonitor(idx) {
    if (confirm("¿Borrar este monitor?")) {
        const nomeM = window.db.Monitores[idx].nome;
        window.db.Monitores.splice(idx, 1);
        window.db.Actividades.forEach(act => {
            if (act.monitor === nomeM) act.monitor = "Sin asignar";
        });
        saveData();
        closeModal();
        mostrarMonitores();
    }
}

function formMonitor() {
    const body = document.getElementById('modal-body');
    body.style.padding = "0";
    body.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; background:#f1f5f9; padding:10px 20px; border-radius:20px 20px 0 0; border-bottom:1px solid #e2e8f0;">
            <span style="font-weight:bold; color:#64748b; font-size:0.8rem;">NUEVO REGISTRO</span>
            <button onclick="closeModal()" style="background:#cbd5e1; border:none; color:white; width:30px; height:30px; border-radius:50%; font-size:1.2rem; cursor:pointer; display:flex; align-items:center; justify-content:center; font-weight:bold;">&times;</button>
        </div>
        <div style="padding:20px;">
            <input type="text" id="m-nome" placeholder="NOMBRE" style="width:100%; padding:10px; margin-bottom:10px; border:1px solid #ccc; border-radius:8px; text-transform:uppercase;">
            <input type="text" id="m-dni" placeholder="DNI" style="width:100%; padding:10px; margin-bottom:10px; border:1px solid #ccc; border-radius:8px; text-transform:uppercase;">
            <input type="tel" id="m-tlf" placeholder="TELÉFONO" style="width:100%; padding:10px; margin-bottom:20px; border:1px solid #ccc; border-radius:8px;">
            <button class="btn" onclick="guardarMonitor()" style="width:100%; background:#16a34a; color:white; padding:15px; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">REGISTRAR</button>
        </div>
    `;
    document.getElementById('modal-overlay').classList.add('active');
}

function guardarMonitor() {
    const nome = document.getElementById('m-nome').value.trim().toUpperCase();
    if (!nome) return;
    if (!window.db.Monitores) window.db.Monitores = [];
    window.db.Monitores.push({
        nome: nome,
        dni: document.getElementById('m-dni').value.trim().toUpperCase(),
        tlf: document.getElementById('m-tlf').value.trim(),
        nacemento: '',
        foto: null
    });
    saveData();
    closeModal();
    mostrarMonitores();
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
}