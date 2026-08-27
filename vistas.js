// ==========================================
// MÓDULO: VISTAS Y ESTADÍSTICAS (vistas.js)
// ==========================================

window.mesFiltroActual = new Date().toISOString().slice(0, 7);

function verPanelEstadisticas() {
    document.getElementById('scr-inicio').style.display = 'none';
    document.getElementById('scr-dash').style.display = 'none';
    document.getElementById('scr-edit').style.display = 'block';
    document.getElementById('main-header').style.display = 'flex';
    document.getElementById('btn-atras').style.display = 'block';

    const container = document.getElementById('data-container');
    
    container.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto; color: white;">
            <div style="background: white; color: #333; padding: 25px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
                <h2 style="color: var(--melide-primary); margin-top: 0; text-align: center;">📊 Estadísticas de Asistencia</h2>
                <div style="margin-bottom: 20px; display: flex; gap: 15px; align-items: center; justify-content: center;">
                    <label style="font-weight: bold;">Seleccionar Mes:</label>
                    <input type="month" id="mes-stats" value="${window.mesFiltroActual}" onchange="window.mesFiltroActual=this.value; renderizarTablaStats()" style="padding: 10px; border-radius: 10px; border: 1px solid #ddd;">
                </div>
                <div id="stats-render">Calculando estadísticas...</div>
            </div>
        </div>
    `;
    
    renderizarTablaStats();
}

function renderizarTablaStats() {
    const render = document.getElementById('stats-render');
    if (!render) return;

    const mes = window.mesFiltroActual;
    const alumnos = window.db.Alumnos || [];
    
    if (alumnos.length === 0) {
        render.innerHTML = "<p style='text-align:center; color: #64748b;'>No hay alumnos registrados para calcular estadísticas.</p>";
        return;
    }

    const stats = {};
    alumnos.forEach(al => {
        const act = al.act || al.actividad || "SIN ACTIVIDAD";
        if (!stats[act]) stats[act] = { totales: 0, presentes: 0 };
        
        const asistencias = al.asistencias || {};
        let asistio = false;
        
        Object.keys(asistencias).forEach(fecha => {
            if (fecha.startsWith(mes) && asistencias[fecha] === true) {
                asistio = true;
            }
        });

        stats[act].totales++;
        if (asistio) stats[act].presentes++;
    });

    let html = `
        <table style="width:100%; border-collapse:collapse; margin-top:10px; text-align: left;">
            <thead>
                <tr style="background:#f1f5f9;">
                    <th style="padding:10px; border:1px solid #ddd;">ACTIVIDAD</th>
                    <th style="padding:10px; border:1px solid #ddd; text-align:center;">ALUMNOS</th>
                    <th style="padding:10px; border:1px solid #ddd; text-align:center;">ASISTENCIA (%)</th>
                </tr>
            </thead>
            <tbody>
    `;

    Object.keys(stats).forEach(act => {
        const totales = stats[act].totales;
        const presentes = stats[act].presentes;
        const porc = totales > 0 ? ((presentes / totales) * 100).toFixed(0) : 0;
        
        html += `
            <tr>
                <td style="padding:10px; border:1px solid #ddd; font-weight:bold;">${act}</td>
                <td style="padding:10px; border:1px solid #ddd; text-align:center;">${totales}</td>
                <td style="padding:10px; border:1px solid #ddd; text-align:center;">
                    <div style="background:#e2e8f0; border-radius:10px; height:20px; width:100%; position:relative;">
                        <div style="background:var(--melide-primary); height:100%; border-radius:10px; width:${porc}%;"></div>
                        <span style="position:absolute; top:0; left:50%; transform:translateX(-50%); font-size:0.7rem; color:${porc > 50 ? 'white' : 'black'}; font-weight:bold;">${porc}%</span>
                    </div>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    render.innerHTML = html;
}
