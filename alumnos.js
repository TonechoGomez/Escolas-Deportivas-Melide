// ==========================================
// MÓDULO DE GESTIÓN DE ALUMNOS (alumnos.js)
// ==========================================

function mostrarAlumnos() {
    document.getElementById('scr-inicio').style.display = 'none';
    document.getElementById('scr-dash').style.display = 'none';
    document.getElementById('scr-edit').style.display = 'block';
    document.getElementById('main-header').style.display = 'flex';
    document.getElementById('btn-atras').style.display = 'block';

    const container = document.getElementById('data-container');
    
    if (!window.db.Alumnos) window.db.Alumnos = [];

    let html = `
        <div style="max-width: 900px; margin: 0 auto; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h2 style="margin: 0; color: #fff;">Gestión de Alumnos</h2>
                <button onclick="abrirModalAlumno()" style="background: #16a34a; color: white; border: none; padding: 12px 20px; border-radius: 10px; font-weight: bold; cursor: pointer;">➕ Nuevo Alumno</button>
            </div>
            <div style="background: white; color: #333; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                            <th style="padding: 15px;">Nombre</th>
                            <th style="padding: 15px;">Actividad</th>
                            <th style="padding: 15px;">Teléfono</th>
                            <th style="padding: 15px; text-align: center;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    if (window.db.Alumnos.length === 0) {
        html += `<tr><td colspan="4" style="padding: 30px; text-align: center; color: #64748b;">No hay alumnos registrados.</td></tr>`;
    } else {
        window.db.Alumnos.forEach((al, index) => {
            html += `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 15px; font-weight: 500;">${al.nombre || ''}</td>
                    <td style="padding: 15px;">${al.act || al.actividad || 'Sin asignar'}</td>
                    <td style="padding: 15px;">${al.telefono || al.tlf || ''}</td>
                    <td style="padding: 15px; text-align: center;">
                        <button onclick="editarAlumno(${index})" style="background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; margin-right: 5px;">Editar</button>
                        <button onclick="eliminarAlumno(${index})" style="background: #dc2626; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">Eliminar</button>
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

function abrirModalAlumno(index = null) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalBody = document.getElementById('modal-body');
    
    let al = index !== null ? window.db.Alumnos[index] : { nombre: '', act: '', telefono: '' };
    
    let opcionesActividades = '<option value="">Seleccione actividad...</option>';
    if (window.db.Actividades) {
        window.db.Actividades.forEach(a => {
            let sel = ((al.act || al.actividad) === a.nombre) ? 'selected' : '';
            opcionesActividades += `<option value="${a.nombre}" ${sel}>${a.nombre}</option>`;
        });
    }

    modalBody.innerHTML = `
        <h3 style="margin-top:0; color: var(--melide-primary);">${index !== null ? 'Editar Alumno' : 'Nuevo Alumno'}</h3>
        <form onsubmit="guardarAlumno(event, ${index})">
            <div style="margin-bottom: 15px;">
                <label style="display:block; font-size: 0.9rem; font-weight: bold; margin-bottom: 5px;">Nombre y Apellidos</label>
                <input type="text" id="al-nombre" value="${al.nombre || ''}" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box;">
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display:block; font-size: 0.9rem; font-weight: bold; margin-bottom: 5px;">Actividad</label>
                <select id="al-act" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box; background: white;">
                    ${opcionesActividades}
                </select>
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display:block; font-size: 0.9rem; font-weight: bold; margin-bottom: 5px;">Teléfono</label>
                <input type="text" id="al-telefono" value="${al.telefono || al.tlf || ''}" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box;">
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button type="button" onclick="closeModal()" style="padding: 10px 20px; background: #cbd5e1; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Cancelar</button>
                <button type="submit" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Guardar</button>
            </div>
        </form>
    `;
    modalOverlay.classList.add('active');
}

function guardarAlumno(event, index) {
    event.preventDefault();
    const nombre = document.getElementById('al-nombre').value;
    const act = document.getElementById('al-act').value;
    const telefono = document.getElementById('al-telefono').value;

    if (!window.db.Alumnos) window.db.Alumnos = [];

    if (index !== null) {
        window.db.Alumnos[index] = { ...window.db.Alumnos[index], nombre, act, telefono };
    } else {
        window.db.Alumnos.push({ nombre, act, telefono, asistencias: {} });
    }

    saveData();
    closeModal();
    mostrarAlumnos();
}

function editarAlumno(index) {
    abrirModalAlumno(index);
}

function eliminarAlumno(index) {
    if (confirm("¿Estás seguro de que deseas eliminar este alumno?")) {
        window.db.Alumnos.splice(index, 1);
        saveData();
        mostrarAlumnos();
    }
}
