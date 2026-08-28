// ==========================================
// MÓDULO: COMUNICACIÓN (comunicacion.js)
// ==========================================

let colaEnvioWhatsApp = [];
let mensajeParaWhatsApp = "";

/**
 * Inicia el proceso de envío filtrando por el grupo seleccionado
 */
function prepararEnvioWhatsApp(nomeAct) {
    const body = document.getElementById('modal-body');
    const alumnos = window.db.Alumnos || [];
    
    // Filtramos alumnos admitidos que pertenezcan a este grupo específico
    const admitidosGrupo = alumnos.filter(al => {
        const actAl = (al.act || "").toString().trim();
        const estadoAl = (al.status || al.estado || "").toString().toLowerCase();
        return actAl === nomeAct && estadoAl.includes("admiti");
    });

    if (admitidosGrupo.length === 0) {
        alert("Non hai alumnos admitidos nesta actividade.");
        return;
    }

    // Estética unificada con el resto de la App
    body.style.padding = "0"; 
    body.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; background:#f1f5f9; padding:15px 20px; border-radius:25px 25px 0 0; border-bottom:1px solid #e2e8f0;">
            <span style="font-weight:bold; color:#64748b; font-size:0.85rem; text-transform:uppercase;">ENVIAR WHATSAPP</span>
            <button onclick="closeModal()" style="background:#cbd5e1; border:none; color:white; width:30px; height:30px; border-radius:50%; font-size:1.2rem; cursor:pointer; display:flex; align-items:center; justify-content:center; font-weight:bold;">&times;</button>
        </div>

        <div style="padding:20px;">
            <p style="font-size:0.9rem; color:#005696; font-weight:bold; margin-bottom:15px; text-transform:uppercase;">Grupo: ${nomeAct}</p>
            
            <label style="font-weight:bold; font-size:0.75rem; color:#475569; display:block; margin-bottom:8px;">1. ESCRIBE O MENSAXE:</label>
            <textarea id="wa-txt-area" 
                style="width:100%; height:120px; padding:15px; border-radius:15px; border:1px solid #ddd; box-sizing:border-box; font-family:inherit; font-size:1rem; margin-bottom:20px; background:#f8fafc; color:#333; resize:none;" 
                placeholder="Escribe aquí o aviso para o grupo..."></textarea>
            
            <label style="font-weight:bold; font-size:0.75rem; color:#475569; display:block; margin-bottom:10px;">2. DESTINATARIOS SELECCIONADOS:</label>
            <div id="wa-destinatarios" style="max-height:180px; overflow-y:auto; border:1px solid #eee; border-radius:15px; padding:10px; background:#ffffff; box-shadow:inset 0 2px 4px rgba(0,0,0,0.05);">
                ${admitidosGrupo.map(al => `
                    <div style="display:flex; align-items:center; gap:12px; padding:10px; border-bottom:1px solid #f8fafc;">
                        <input type="checkbox" class="wa-check-alumno" 
                            value="${al.tlf || al.telf || ''}" 
                            data-nome="${al.nome}" 
                            checked style="width:22px; height:22px; cursor:pointer; accent-color:#25d366;">
                        <span style="font-size:1rem; color:#334155; font-weight:500;">${al.nome}</span>
                    </div>
                `).join('')}
            </div>

            <button onclick="iniciarProcesadoCola()" 
                style="width:100%; background:#25d366; color:white; border:none; padding:18px; border-radius:15px; font-weight:bold; cursor:pointer; margin-top:20px; font-size:1.1rem; box-shadow:0 4px 12px rgba(37,211,102,0.3); transition: transform 0.1s;">
                COMENZAR ENVÍOS
            </button>
        </div>
    `;
    document.getElementById('modal-overlay').classList.add('active');
}

/**
 * Recoge el mensaje y la lista de seleccionados para iniciar la cola
 */
function iniciarProcesadoCola() {
    mensajeParaWhatsApp = document.getElementById('wa-txt-area').value.trim();
    if (!mensajeParaWhatsApp) return alert("Debes escribir un mensaxe primeiro.");

    const seleccionados = document.querySelectorAll('.wa-check-alumno:checked');
    colaEnvioWhatsApp = Array.from(seleccionados).map(check => ({
        nome: check.getAttribute('data-nome'),
        tlf: check.value
    }));

    if (colaEnvioWhatsApp.length === 0) return alert("Selecciona polo menos un alumno.");

    mostrarSiguienteEnvio();
}

/**
 * Interfaz de envío individual paso a paso
 */
function mostrarSiguienteEnvio() {
    if (colaEnvioWhatsApp.length === 0) {
        alert("✅ Envíos finalizados.");
        closeModal();
        return;
    }

    const proximo = colaEnvioWhatsApp[0];
    const body = document.getElementById('modal-body');

    body.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; background:#f1f5f9; padding:15px 20px; border-radius:25px 25px 0 0; border-bottom:1px solid #e2e8f0;">
            <span style="font-weight:bold; color:#64748b; font-size:0.85rem; text-transform:uppercase;">PROCESO DE ENVÍO</span>
            <button onclick="closeModal()" style="background:#cbd5e1; border:none; color:white; width:30px; height:30px; border-radius:50%; font-size:1.2rem; cursor:pointer; display:flex; align-items:center; justify-content:center; font-weight:bold;">&times;</button>
        </div>

        <div style="padding:25px;">
            <div style="background:#f8fafc; padding:25px; border-radius:20px; text-align:center; margin-bottom:20px; border:1px solid #e2e8f0; box-shadow:0 4px 6px rgba(0,0,0,0.02);">
                <p style="margin:0; font-size:0.8rem; color:#64748b; text-transform:uppercase; letter-spacing:1px;">Preparado para:</p>
                <h3 style="margin:10px 0; color:#005696; font-size:1.6rem;">${proximo.nome}</h3>
                <div style="display:inline-block; background:#dcfce7; color:#166534; padding:6px 18px; border-radius:12px; font-weight:bold; font-size:1rem;">
                    📱 ${proximo.tlf || 'Sen número'}
                </div>
            </div>
            
            <div style="background:#fff7ed; color:#9a3412; padding:15px; border-radius:15px; font-size:0.9rem; line-height:1.5; margin-bottom:25px; border-left:6px solid #f97316;">
                <strong>Instrucións:</strong> Ao premer o botón abrirase WhatsApp. Envía o aviso e <b>regresa a esta pantalla</b> para enviar o seguinte.
            </div>

            <button onclick="executarEnvioYPasarSiguiente('${proximo.tlf}')" 
                style="width:100%; background:#005696; color:white; border:none; padding:20px; border-radius:15px; font-weight:bold; cursor:pointer; font-size:1.1rem; box-shadow:0 4px 10px rgba(0,86,150,0.2);">
                ABRIR WHATSAPP E CONTINUAR
            </button>
            
            <p style="text-align:center; margin-top:20px; font-size:0.85rem; color:#94a3b8; font-weight:bold;">
                PENDENTES NA COLA: <span style="color:#005696;">${colaEnvioWhatsApp.length}</span>
            </p>
        </div>
    `;
}

/**
 * Abre WhatsApp y limpia el elemento actual de la cola
 */
function executarEnvioYPasarSiguiente(tlf) {
    if (!tlf || tlf.trim() === "") {
        alert("O alumno non ten un número válido.");
        colaEnvioWhatsApp.shift();
        mostrarSiguienteEnvio();
        return;
    }

    const limpio = tlf.toString().replace(/\D/g, '');
    const url = `https://wa.me/34${limpio}?text=${encodeURIComponent(mensajeParaWhatsApp)}`;
    
    window.open(url, '_blank');
    
    colaEnvioWhatsApp.shift();
    
    setTimeout(() => {
        mostrarSiguienteEnvio();
    }, 500);
}