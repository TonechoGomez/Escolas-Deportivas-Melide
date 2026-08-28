// ==========================================
// MÓDULO: INSTALACIONES (instalaciones.js)
// ==========================================

function mostrarAulas() {
    const actions = document.getElementById('section-actions');
    const container = document.getElementById('data-container');
    if (!actions || !container) return;

    actions.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:20px;">
            <h2 style="margin:0; color:white; font-size:1.4rem;">INSTALACIÓNS</h2>
            <button onclick="formAula()" style="background:#16a34a; color:white; padding:10px 20px; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">+ NOVA INSTALACIÓN</button>
        </div>
    `;
    
    verificarEstructuraAulas();

    if (window.db.Aulas) {
        window.db.Aulas.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
    }
    
    renderListaAulas(window.db.Aulas || []);
}

function verificarEstructuraAulas() {
    if (!window.db.Aulas) window.db.Aulas = [];
    let parroquias = window.db.Aulas.find(a => a.nome.toUpperCase() === "PARROQUIAS");
    if (!parroquias) {
        window.db.Aulas.push({ nome: "PARROQUIAS", lugares: [] });
    }
}

function renderListaAulas(lista) {
    const container = document.getElementById('data-container');
    container.innerHTML = "";
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(auto-fill, minmax(250px, 1fr))";
    container.style.gap = "20px";

    lista.forEach((aula, idx) => {
        const card = document.createElement('div');
        card.style.cssText = "background:white; color:#1e293b; padding:25px; border-radius:20px; text-align:center; cursor:pointer; box-shadow:0 10px 20px rgba(0,0,0,0.2); position:relative;";
        
        const subInfo = aula.nome.toUpperCase() === "PARROQUIAS" 
            ? `<div style="font-size:0.8rem; color:#64748b; margin-top:5px;">${(aula.lugares || []).length} LOCALIZACIÓNS</div>`
            : "";

        card.innerHTML = `
            <span style="font-size:3rem; display:block; margin-bottom:10px;">🏛️</span>
            <div style="font-weight:bold; text-transform:uppercase;">${aula.nome}</div>
            ${subInfo}
            <button onclick="event.stopPropagation(); borrarAula(${idx})" style="position:absolute; top:10px; right:10px; background:none; border:none; color:#ef4444; font-size:1.2rem; cursor:pointer;">&times;</button>
        `;
        
        card.onclick = () => {
            if (aula.nome.toUpperCase() === "PARROQUIAS") {
                verDetalleParroquias(idx);
            }
        };
        container.appendChild(card);
    });
}

function verDetalleParroquias(idxAula) {
    const aula = window.db.Aulas[idxAula];
    if (!aula.lugares) aula.lugares = [];

    const container = document.getElementById('data-container');
    const actions = document.getElementById('section-actions');

    actions.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
            <h2 style="margin:0; color:white;">📍 LOCALIZACIÓNS PARROQUIAS</h2>
            <button onclick="formLugar(${idxAula})" style="background:#f59e0b; color:white; padding:10px; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">+ ENGADIR LUGAR</button>
        </div>
    `;

    container.innerHTML = "";
    if (aula.lugares.length === 0) {
        container.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:white; padding:40px;">Non hai lugares rexistrados.</div>`;
    } else {
        aula.lugares.forEach((lugar, idxLugar) => {
            const card = document.createElement('div');
            card.style.cssText = "background:#f1f5f9; color:#334155; padding:20px; border-radius:15px; display:flex; justify-content:space-between; align-items:center; font-weight:bold;";
            card.innerHTML = `
                <span>${lugar.toUpperCase()}</span>
                <button onclick="borrarLugar(${idxAula}, ${idxLugar})" style="background:#ef4444; color:white; border:none; width:30px; height:30px; border-radius:50%; cursor:pointer;">&times;</button>
            `;
            container.appendChild(card);
        });
    }
}

function formLugar(idxAula) {
    const body = document.getElementById('modal-body');
    body.innerHTML = `
        <div style="padding:20px;">
            <h3>Engadir novo lugar</h3>
            <input type="text" id="new-lugar" placeholder="NOME DO LUGAR" style="width:100%; padding:12px; border-radius:10px; border:1px solid #ddd; text-transform:uppercase; box-sizing:border-box; margin-bottom:15px;">
            <button onclick="guardarLugar(${idxAula})" style="width:100%; background:#16a34a; color:white; padding:15px; border:none; border-radius:12px; font-weight:bold; cursor:pointer;">GARDAR</button>
        </div>
    `;
    document.getElementById('modal-overlay').classList.add('active');
}

function guardarLugar(idxAula) {
    const nome = document.getElementById('new-lugar').value.trim().toUpperCase();
    if (!nome) return;
    if (!window.db.Aulas[idxAula].lugares) window.db.Aulas[idxAula].lugares = [];
    window.db.Aulas[idxAula].lugares.push(nome);
    saveData();
    closeModal();
    verDetalleParroquias(idxAula);
}

function borrarLugar(idxAula, idxLugar) {
    if (confirm("¿Borrar este lugar?")) {
        window.db.Aulas[idxAula].lugares.splice(idxLugar, 1);
        saveData();
        verDetalleParroquias(idxAula);
    }
}

function borrarAula(idx) {
    if (confirm("¿Borrar esta instalación?")) {
        window.db.Aulas.splice(idx, 1);
        saveData();
        mostrarAulas();
    }
}

function formAula() {
    const body = document.getElementById('modal-body');
    body.innerHTML = `
        <div style="padding:20px;">
            <h3>Nova Instalación</h3>
            <input type="text" id="a-nome" placeholder="NOME (PABELLÓN, PISCINA...)" style="width:100%; padding:12px; border-radius:10px; border:1px solid #ddd; text-transform:uppercase; box-sizing:border-box; margin-bottom:15px;">
            <button onclick="guardarAula()" style="width:100%; background:#16a34a; color:white; padding:15px; border:none; border-radius:12px; font-weight:bold; cursor:pointer;">CREAR</button>
        </div>
    `;
    document.getElementById('modal-overlay').classList.add('active');
}

function guardarAula() {
    const nome = document.getElementById('a-nome').value.trim().toUpperCase();
    if (!nome) return;
    window.db.Aulas.push({ nome: nome, lugares: [] });
    saveData();
    closeModal();
    mostrarAulas();
}