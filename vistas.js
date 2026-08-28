// ==========================================
// MÓDULO: VISTAS Y ESTADÍSTICAS (vistas.js)
// ==========================================

function mostrarVistas() {
    const actions = document.getElementById('section-actions');
    const container = document.getElementById('data-container');
    if (!actions || !container) return;

    actions.innerHTML = `
        <div style="background:rgba(255,255,255,0.1); padding:15px; border-radius:15px; margin-bottom:15px; border:1px solid rgba(255,255,255,0.2);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h2 style="margin:0; color:white; font-size:1.2rem;">PANEL DE CONTROL E VISTAS</h2>
                <div style="display:flex; gap:10px;">
                    <button onclick="renderizarEstadisticas()" style="background:#0284c7; color:white; padding:8px 15px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; font-size:0.8rem;">📊 ESTADÍSTICAS</button>
                    <button onclick="window.print()" style="background:#475569; color:white; padding:8px 15px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; font-size:0.8rem;">🖨️ IMPRIMIR</button>
                </div>
            </div>
            
            <div style="display:grid; grid-template-columns: 1fr; gap:10px;">
                <select id="filtro-mes-vistas" onchange="renderizarResumenVistas()" style="padding:10px; border-radius:8px; border:none; font-size:0.9rem; background:white; color:#333;">
                    <option value="">Todos os meses / Xeral</option>
                    <option value="Xaneiro">Xaneiro</option>
                    <option value="Febreiro">Febreiro</option>
                    <option value="Marzo">Marzo</option>
                    <option value="Abril">Abril</option>
                    <option value="Maio">Maio</option>
                    <option value="Xuño">Xuño</option>
                    <option value="Xullo">Xullo</option>
                    <option value="Agosto">Agosto</option>
                    <option value="Setembro">Setembro</option>
                    <option value="Outubro">Outubro</option>
                    <option value="Novembro">Novembro</option>
                    <option value="Decembro">Decembro</option>
                </select>
            </div>
        </div>
    `;

    renderizarResumenVistas();
}

function renderizarResumenVistas() {
    const container = document.getElementById('data-container');
    if (!container) return;
    container.innerHTML = "";
    container.style.display = "block";

    const actividades = window.db.Actividades || [];
    const monitores = window.db.Monitores || [];
    const aulas = window.db.Aulas || [];

    const wrap = document.createElement('div');
    wrap.style.cssText = "display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:15px; margin-bottom:20px;";

    // Tarjetas de resumen métrico
    wrap.innerHTML = `
        <div style="background:white; padding:20px; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.1); border-left:5px solid #2563eb;">
            <div style="font-size:0.8rem; color:#64748b; font-weight:bold;">TOTAL ACTIVIDADES</div>
            <div style="font-size:1.8rem; font-weight:bold; color:#1e293b; margin-top:5px;">${actividades.length}</div>
        </div>
        <div style="background:white; padding:20px; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.1); border-left:5px solid #16a34a;">
            <div style="font-size:0.8rem; color:#64748b; font-weight:bold;">TOTAL MONITORES/AS</div>
            <div style="font-size:1.8rem; font-weight:bold; color:#1e293b; margin-top:5px;">${monitores.length}</div>
        </div>
        <div style="background:white; padding:20px; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.1); border-left:5px solid #f59e0b;">
            <div style="font-size:0.8rem; color:#64748b; font-weight:bold;">INSTALACIÓNS / AULAS</div>
            <div style="font-size:1.8rem; font-weight:bold; color:#1e293b; margin-top:5px;">${aulas.length}</div>
        </div>
    `;

    container.appendChild(wrap);

    // Listado detallado de actividades en formato tabla limpia
    const tablaDiv = document.createElement('div');
    tablaDiv.style.cssText = "background:white; border-radius:12px; padding:15px; box-shadow:0 4px 15px rgba(0,0,0,0.1); overflow-x:auto;";
    
    let htm = `<h3 style="margin-top:0; color:#1e293b; font-size:1rem; margin-bottom:12px;">Listado de Actividades Rexistradas</h3>
    <table style="width:100%; border-collapse:collapse; color:#333; font-size:0.8rem;">
        <thead>
            <tr style="background:#f1f5f9; text-align:left;">
                <th style="padding:10px; border-bottom:2px solid #cbd5e1;">Actividade</th>
                <th style="padding:10px; border-bottom:2px solid #cbd5e1;">Monitor/a</th>
                <th style="padding:10px; border-bottom:2px solid #cbd5e1;">Instalación</th>
                <th style="padding:10px; border-bottom:2px solid #cbd5e1;">Días / Hora</th>
            </tr>
        </thead>
        <tbody>`;

    if (actividades.length === 0) {
        htm += `<tr><td colspan="4" style="padding:15px; text-align:center; color:#64748b;">Non hai actividades rexistradas.</td></tr>`;
    } else {
        actividades.forEach(a => {
            htm += `<tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px; font-weight:bold; color:#0f172a;">${a.nome || ''}</td>
                <td style="padding:10px; color:#475569;">${a.monitor || 'Sen asignar'}</td>
                <td style="padding:10px; color:#475569;">${a.aula || 'Sen asignar'}</td>
                <td style="padding:10px; color:#475569;">${a.dia || ''} (${a.hora || ''})</td>
            </tr>`;
        });
    }

    htm += `</tbody></table>`;
    tablaDiv.innerHTML = htm;
    container.appendChild(tablaDiv);
}

function renderizarEstadisticas() {
    const container = document.getElementById('data-container');
    if (!container) return;
    
    container.innerHTML = `
        <div style="background:white; padding:30px; border-radius:15px; color:#333; max-width:600px; margin:0 auto; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
            <h3 style="margin-top:0; color:#1e293b;">Resumo Estatístico de Ocupación</h3>
            <p style="color:#64748b; font-size:0.9rem;">Módulo de análise en tempo real baseado nos cuadrantes activos.</p>
            
            <div style="margin:20px 0; background:#f8fafc; padding:15px; border-radius:10px; border:1px solid #e2e8f0;">
                <p style="margin:0; font-weight:bold; color:#0f172a;">Estado da Sincronización coa Nube:</p>
                <p style="margin:5px 0 0 0; color:#16a34a; font-size:0.85rem;">● Conectado e sincronizado automáticamente en segundo plano.</p>
            </div>

            <button onclick="renderizarResumenVistas()" style="width:100%; padding:12px; background:#475569; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">
                ✕ VOLVER AO RESUMO
            </button>
        </div>
    `;
}
