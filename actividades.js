// ==========================================
// MÓDULO DE GESTIÓN DE ACTIVIDADES (actividades.js)
// ==========================================

function mostrarActividades() {
    document.getElementById('scr-inicio').style.display = 'none';
    document.getElementById('scr-dash').style.display = 'none';
    document.getElementById('scr-edit').style.display = 'block';
    document.getElementById('main-header').style.display = 'flex';
    document.getElementById('btn-atras').style.display = 'block';

    const container = document.getElementById('data-container');
    
    if (!window.db.Actividades) window.db.Actividades = [];

    let html = `
        <div style="max-width: 900px; margin: 0 auto; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h2 style="margin: 0; color: #fff;">Gestión de Actividades</h2>
                <button onclick="abrirModalActividad()" style="background: #16a34a; color: white; border: none; padding: 12px 20px; border-radius: 10px; font-weight: bold; cursor: pointer;">➕ Nueva Actividad</button>
            </div>
            <div style="background: white; color: #333; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                            <th style="padding: 15px;">Actividad</th>
                            <th style="padding: 15px;">Monitor</th>
                            <th style="padding: 15px;">Horario / Días</th>
                            <th style="padding: 15px; text-align: center;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    if (window.db.Actividades.length === 0) {
        html += `<tr><td colspan="4" style="padding: 30px; text-align: center; color: #64748b;">No hay actividades registradas.</td></tr>`;
    } else {
        window.db.Actividades.forEach((act, index) => {
            html += `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 15px; font-weight: 500;">${act.nombre || ''}</td>
                    <td style="padding: 15px;">${act.monitor || 'Sin asignar'}</td>
                    <td style="padding: 15px;">${act.horario || act.dias || 'No especificado'}</td>
                    <td style="padding: 15px; text-align: center;">
                        <button onclick="editarActividad(${index})" style="background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; margin-right: 5px;">Editar</button>
                        <button onclick="eliminarActividad(${index})" style="background: #dc2626; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">Eliminar</button>
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

function abrirModalActividad(index = null) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalBody = document.getElementById('modal-body');
    
    let act = index !== null ? window.db.Actividades[index] : { nombre: '', monitor: '', horario: '', dias: '' };
    
    let opcionesMonitores = '<option value="">Seleccione monitor...</option>';
    if (window.db.Monitores) {
        window.db.Monitores.forEach(m => {
            let sel = (act.monitor === m.nombre) ? 'selected' : '';
            opcionesMonitores += `<option value="${m.nombre}" ${sel}>${m.nombre}</option>`;
        });
    }

    modalBody.innerHTML = `
        <h3 style="margin-top:0; color: var(--melide-primary);">${index !== null ? 'Editar Actividad' : 'Nueva Actividad'}</h3>
        <form onsubmit="guardarActividad(event, ${index})">
            <div style="margin-bottom: 15px;">
                <label style="display:block; font-size: 0.9rem; font-weight: bold; margin-bottom: 5px;">Nombre de la Actividad</label>
                <input type="text" id="act-nombre" value="${act.nombre || ''}" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box;">
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display:block; font-size: 0.9rem; font-weight: bold; margin-bottom: 5px;">Monitor Asignado</label>
                <select id="act-monitor" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box; background: white;">
                    ${opcionesMonitores}
                </select>
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display:block; font-size: 0.9rem; font-weight: bold; margin-bottom: 5px;">Horario / Días</label>
                <input type="text" id="act-horario" value="${act.horario || act.dias || ''}" placeholder="Ej: Lunes y Miércoles 10:00" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box;">
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button type="button" onclick="closeModal()" style="padding: 10px 20px; background: #cbd5e1; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Cancelar</button>
                <button type="submit" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Guardar</button>
            </div>
        </form>
    `;
    modalOverlay.classList.add('active');
}

function guardarActividad(event, index) {
    event.preventDefault();
    const nombre = document.getElementById('act-nombre').value;
    const monitor = document.getElementById('act-monitor').value;
    const horario = document.getElementById('act-horario').value;

    if (!window.db.Actividades) window.db.Actividades = [];

    if (index !== null) {
        window.db.Actividades[index] = { ...window.db.Actividades[index], nombre, monitor, horario };
    } else {
        window.db.Actividades.push({ nombre, monitor, horario });
    }

    saveData();
    closeModal();
    mostrarActividades();
}

function editarActividad(index) {
    abrirModalActividad(index);
}

function eliminarActividad(index) {
    if (confirm("¿Estás seguro de que deseas eliminar esta actividad?")) {
        window.db.Actividades.splice(index, 1);
        saveData();
        mostrarActividades();
    }
}
