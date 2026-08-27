// ==========================================
// MÓDULO DE COMUNICACIÓN (comunicacion.js)
// ==========================================

function mostrarComunicacion() {
    document.getElementById('scr-inicio').style.display = 'none';
    document.getElementById('scr-dash').style.display = 'none';
    document.getElementById('scr-edit').style.display = 'block';
    document.getElementById('main-header').style.display = 'flex';
    document.getElementById('btn-atras').style.display = 'block';

    const container = document.getElementById('data-container');
    
    if (!window.db.Mensajes) window.db.Mensajes = [];

    let html = `
        <div style="max-width: 800px; margin: 0 auto; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h2 style="margin: 0; color: #fff;">Tablón de Comunicaciones</h2>
                <button onclick="abrirModalMensaje()" style="background: #16a34a; color: white; border: none; padding: 12px 20px; border-radius: 10px; font-weight: bold; cursor: pointer;">➕ Nuevo Aviso</button>
            </div>
            <div style="display: flex; flexDirection: column; gap: 15px;">
    `;

    if (window.db.Mensajes.length === 0) {
        html += `<div style="background: white; color: #64748b; padding: 30px; text-align: center; border-radius: 15px;">No hay comunicaciones publicadas.</div>`;
    } else {
        window.db.Mensajes.forEach((msg, index) => {
            html += `
                <div style="background: white; color: #333; padding: 20px; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); position: relative;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span style="font-weight: bold; color: var(--melide-primary); font-size: 1.1rem;">${msg.titulo || 'Aviso'}</span>
                        <span style="font-size: 0.85rem; color: #64748b;">${msg.fecha || ''}</span>
                    </div>
                    <p style="margin: 0 0 15px 0; line-height: 1.5;">${msg.contenido || ''}</p>
                    <div style="display: flex; justify-content: flex-end;">
                        <button onclick="eliminarMensaje(${index})" style="background: #dc2626; color: white; border: none; padding: 5px 10px; border-radius: 6px; font-size: 0.85rem; cursor: pointer;">Eliminar</button>
                    </div>
                </div>
            `;
        });
    }

    html += `</div></div>`;
    container.innerHTML = html;
}

function abrirModalMensaje() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = `
        <h3 style="margin-top:0; color: var(--melide-primary);">Nuevo Aviso / Comunicación</h3>
        <form onsubmit="guardarMensaje(event)">
            <div style="margin-bottom: 15px;">
                <label style="display:block; font-size: 0.9rem; font-weight: bold; margin-bottom: 5px;">Título del Aviso</label>
                <input type="text" id="msg-titulo" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box;">
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display:block; font-size: 0.9rem; font-weight: bold; margin-bottom: 5px;">Contenido</label>
                <textarea id="msg-contenido" rows="4" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box; resize: none;"></textarea>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button type="button" onclick="closeModal()" style="padding: 10px 20px; background: #cbd5e1; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Cancelar</button>
                <button type="submit" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Publicar</button>
            </div>
        </form>
    `;
    modalOverlay.classList.add('active');
}

function guardarMensaje(event) {
    event.preventDefault();
    const titulo = document.getElementById('msg-titulo').value;
    const contenido = document.getElementById('msg-contenido').value;
    const fecha = new Date().toLocaleDateString();

    if (!window.db.Mensajes) window.db.Mensajes = [];

    window.db.Mensajes.unshift({ titulo, contenido, fecha });
    saveData();
    closeModal();
    mostrarComunicacion();
}

function eliminarMensaje(index) {
    if (confirm("¿Estás seguro de que deseas eliminar este aviso?")) {
        window.db.Mensajes.splice(index, 1);
        saveData();
        mostrarComunicacion();
    }
}
