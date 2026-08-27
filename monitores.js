// ==========================================
// MÓDULO DE GESTIÓN DE MONITORES (monitores.js)
// ==========================================

function mostrarMonitores() {
    document.getElementById('scr-inicio').style.display = 'none';
    document.getElementById('scr-dash').style.display = 'none';
    document.getElementById('scr-edit').style.display = 'block';
    document.getElementById('main-header').style.display = 'flex';
    document.getElementById('btn-atras').style.display = 'block';

    const container = document.getElementById('data-container');
    
    // Asegurar que exista la propiedad Monitores
    if (!window.db.Monitores) window.db.Monitores = [];

    let html = `
        <div style="max-width: 800px; margin: 0 auto; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h2 style="margin: 0; color: #fff;">Gestión de Monitores</h2>
                <button onclick="abrirModalMonitor()" style="background: #16a34a; color: white; border: none; padding: 12px 20px; border-radius: 10px; font-weight: bold; cursor: pointer;">➕ Nuevo Monitor</button>
            </div>
            <div style="background: white; color: #333; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                            <th style="padding: 15px;">Nombre</th>
                            <th style="padding: 15px;">Teléfono</th>
                            <th style="padding: 15px;">Email</th>
                            <th style="padding: 15px; text-align: center;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    if (window.db.Monitores.length === 0) {
        html += `<tr><td colspan="4" style="padding: 30px; text-align: center; color: #64748b;">No hay monitores registrados.</td></tr>`;
    } else {
        window.db.Monitores.forEach((mon, index) => {
            html += `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 15px; font-weight: 500;">${mon.nombre || ''}</td>
                    <td style="padding: 15px;">${mon.telefono || ''}</td>
                    <td style="padding: 15px;">${mon.email || ''}</td>
                    <td style="padding: 15px; text-align: center;">
                        <button onclick="editarMonitor(${index})" style="background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; margin-right: 5px;">Editar</button>
                        <button onclick="eliminarMonitor(${index})" style="background: #dc2626; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">Eliminar</button>
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

function abrirModalMonitor(index = null) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalBody = document.getElementById('modal-body');
    
    let mon = index !== null ? window.db.Monitores[index] : { nombre: '', telefono: '', email: '' };

    modalBody.innerHTML = `
        <h3 style="margin-top:0; color: var(--melide-primary);">${index !== null ? 'Editar Monitor' : 'Nuevo Monitor'}</h3>
        <form onsubmit="guardarMonitor(event, ${index})">
            <div style="margin-bottom: 15px;">
                <label style="display:block; font-size: 0.9rem; font-weight: bold; margin-bottom: 5px;">Nombre y Apellidos</label>
                <input type="text" id="mon-nombre" value="${mon.nombre || ''}" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box;">
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display:block; font-size: 0.9rem; font-weight: bold; margin-bottom: 5px;">Teléfono</label>
                <input type="text" id="mon-telefono" value="${mon.telefono || ''}" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box;">
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display:block; font-size: 0.9rem; font-weight: bold; margin-bottom: 5px;">Email</label>
                <input type="email" id="mon-email" value="${mon.email || ''}" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box;">
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button type="button" onclick="closeModal()" style="padding: 10px 20px; background: #cbd5e1; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Cancelar</button>
                <button type="submit" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Guardar</button>
            </div>
        </form>
    `;
    modalOverlay.classList.add('active');
}

function guardarMonitor(event, index) {
    event.preventDefault();
    const nombre = document.getElementById('mon-nombre').value;
    const telefono = document.getElementById('mon-telefono').value;
    const email = document.getElementById('mon-email').value;

    if (!window.db.Monitores) window.db.Monitores = [];

    if (index !== null) {
        window.db.Monitores[index] = { nombre, telefono, email };
    } else {
        window.db.Monitores.push({ nombre, telefono, email });
    }

    saveData();
    closeModal();
    mostrarMonitores();
}

function editarMonitor(index) {
    abrirModalMonitor(index);
}

function eliminarMonitor(index) {
    if (confirm("¿Estás seguro de que deseas eliminar este monitor?")) {
        window.db.Monitores.splice(index, 1);
        saveData();
        mostrarMonitores();
    }
}
