// ==========================================
// MÓDULO DE GESTIÓN DE CUADRANTES (cuadrantes.js)
// ==========================================

function mostrarCuadrantes() {
    document.getElementById('scr-inicio').style.display = 'none';
    document.getElementById('scr-dash').style.display = 'none';
    document.getElementById('scr-edit').style.display = 'block';
    document.getElementById('main-header').style.display = 'flex';
    document.getElementById('btn-atras').style.display = 'block';

    const container = document.getElementById('data-container');
    
    let html = `
        <div style="max-width: 900px; margin: 0 auto; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h2 style="margin: 0; color: #fff;">Cuadrantes Horarios</h2>
            </div>
            <div style="background: white; color: #333; padding: 30px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); text-align: center;">
                <p style="font-size: 1.1rem; color: #64748b; margin-bottom: 20px;">Visualización general de los horarios y planificación semanal de las actividades deportivas.</p>
                <div id="cuadrante-render">
                    <p>Cargando planificación...</p>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
    renderizarAmbosCuadrantes();
}

function renderizarAmbosCuadrantes() {
    const render = document.getElementById('cuadrante-render');
    if (!render) return;

    const acts = window.db.Actividades || [];
    if (acts.length === 0) {
        render.innerHTML = `<p style="padding: 20px; color: #64748b;">No hay actividades con horarios asignados para mostrar en el cuadrante.</p>`;
        return;
    }

    let html = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; text-align: left;">
            <thead>
                <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                    <th style="padding: 12px;">Actividad</th>
                    <th style="padding: 12px;">Monitor</th>
                    <th style="padding: 12px;">Horario / Días</th>
                </tr>
            </thead>
            <tbody>
    `;

    acts.forEach(a => {
        html += `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px; font-weight: bold; color: var(--melide-primary);">${a.nombre || ''}</td>
                <td style="padding: 12px;">${a.monitor || 'Sin asignar'}</td>
                <td style="padding: 12px;">${a.horario || a.dias || 'Por definir'}</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    render.innerHTML = html;
}
