// ==========================================
// MÓDULO DE GESTIÓN DE INSTALACIONES (instalaciones.js)
// ==========================================

function mostrarInstalaciones() {
    document.getElementById('scr-inicio').style.display = 'none';
    document.getElementById('scr-dash').style.display = 'none';
    document.getElementById('scr-edit').style.display = 'block';
    document.getElementById('main-header').style.display = 'flex';
    document.getElementById('btn-atras').style.display = 'block';

    const container = document.getElementById('data-container');
    
    if (!window.db.Aulas) window.db.Aulas = [];

    let html = `
        <div style="max-width: 800px; margin: 0 auto; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h2 style="margin: 0; color: #fff;">Gestión de Instalaciones y Aulas</h2>
                <button onclick="abrirModalInstalacion()" style="background: #16a34a; color: white; border: none; padding: 12px 20px; border-radius: 10px; font-weight: bold; cursor: pointer;">➕ Nueva Instalación</button>
            </div>
            <div style="background: white; color: #333; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                            <th style="padding: 15px;">Nombre de la Instalación / Aula</th>
                            <th style="padding: 15px;">Ubicación / Descripción</th>
                            <th style="padding: 15px; text-align: center;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    if (window.db.Aulas.length === 0) {
        html += `<tr><td colspan="3" style="padding: 30px; text-align: center; color: #64748b;">No hay instalaciones registradas.</td></tr>`;
    } else {
        window.db.Aulas.forEach((aula, index) => {
            let nombreAula = typeof aula === 'string' ? aula : (aula.nombre || '');
            let descAula = typeof aula === 'object' ? (aula.descripcion || aula.ubicacion || '') : '';
            html += `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 15px; font-weight: 500;">${nombreAula}</td>
                    <td style="padding: 15px;">${descAula}</td>
                    <td style="padding: 15px; text-align: center;">
                        <button onclick="editarInstalacion(${index})" style="background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; margin-right: 5px;">Editar</button>
                        <button onclick="eliminarInstalacion(${index})" style="background: #dc2626; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    }

    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function abrirModalInstalacion(index = null) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalBody = document.getElementById('modal-body');
    
    let aula = index !== null ? window.db.Aulas[index] : { nombre: '', descripcion: '' };
    if (typeof aula === 'string') aula = { nombre: aula, descripcion: '' };

    modalBody.innerHTML = `
        <h3 style="margin-top:0; color: var(--melide-primary);">${index !== null ? 'Editar Instalación' : 'Nueva Instalación'}</h3>
        <form onsubmit="guardarInstalacion(event, ${index})">
            <div style="margin-bottom: 15px;">
                <label style="display:block; font-size: 0.9rem; font-weight: bold; margin-bottom: 5px;">Nombre de la Instalación</label>
                <input type="text" id="inst-nombre" value="${aula.nombre || ''}" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box;">
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display:block; font-size: 0.9rem; font-weight: bold; margin-bottom: 5px;">Descripción / Ubicación</label>
                <input type="text" id="inst-desc" value="${aula.descripcion || ''}" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box;">
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button type="button" onclick="closeModal()" style="padding: 10px 20px; background: #cbd5e1; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Cancelar</button>
                <button type="submit" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Guardar</button>
            </div>
        </form>
    `;
    modalOverlay.classList.add('active');
}

function guardarInstalacion(event, index) {
    event.preventDefault();
    const nombre = document.getElementById('inst-nombre').value;
    const descripcion = document.getElementById('inst-desc').value;

    if (!window.db.Aulas) window.db.Aulas = [];

    if (index !== null) {
        window.db.Aulas[index] = { nombre, descripcion };
    } else {
        window.db.Aulas.push({ nombre, descripcion });
    }

    saveData();
    closeModal();
    mostrarInstalaciones();
}

function editarInstalacion(index) {
    abrirModalInstalacion(index);
}

function eliminarInstalacion(index) {
    if (confirm("¿Estás seguro de que deseas eliminar esta instalación?")) {
        window.db.Aulas.splice(index, 1);
        saveData();
        mostrarInstalaciones();
    }
}
