// --- MÓDULO DE SEGURIDAD Y DASHBOARD (RESTAURADO A TAMAÑO GRANDE) ---

function login() {
    const role = document.getElementById('user-role').value;
    const inputs = document.querySelectorAll('.pin-input');
    let enteredPass = "";
    inputs.forEach(input => enteredPass += input.value);

    let authorized = false;
    if (role === 'tecnico' && enteredPass === '0010') authorized = true;
    else if (role === 'monitor' && enteredPass === '1234') authorized = true;
    else if (role === 'politico' && enteredPass === '4321') authorized = true;

    if (authorized) {
        window.userRole = role;
        entrarAlSistema(role);
    } else {
        alert("PIN incorrecto.");
        inputs.forEach(input => input.value = "");
        inputs[0].focus();
    }
}

function entrarAlSistema(role) {
    document.getElementById('scr-inicio').style.display = 'none';
    document.getElementById('main-header').style.display = 'flex';
    document.getElementById('scr-dash').style.display = 'block';

    const menuContainer = document.getElementById('menu-container');
    menuContainer.innerHTML = "";

    const modulos = [
        { id: 'monitores', label: 'MONITORES', icon: '👤' },
        { id: 'actividades', label: 'ACTIVIDADES', icon: '🏆' },
        { id: 'instalaciones', label: 'INSTALACIONES', icon: '📍' },
        { id: 'alumnos', label: 'ALUMNOS', icon: '👥' },
        { id: 'cuadrantes', label: 'CUADRANTES', icon: '📅' },
        { id: 'configuracion', label: 'CONFIGURACIÓN', icon: '⚙️' }
    ];

    modulos.forEach(m => {
        const div = document.createElement('div');
        div.className = 'menu-item';
        
        div.style.cssText = `
            background: white; 
            color: #005696; 
            padding: 40px 20px; 
            border-radius: 20px; 
            text-align: center; 
            font-weight: bold; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            gap: 20px; 
            cursor: pointer; 
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            transition: transform 0.1s;
        `;
        
        div.innerHTML = `
            <span style="font-size: 4rem;">${m.icon}</span>
            <span style="font-size: 1.2rem; letter-spacing: 1px;">${m.label}</span>
        `;
        
        div.onclick = () => verSeccion(m.id);
        
        div.onmousedown = () => div.style.transform = "scale(0.95)";
        div.onmouseup = () => div.style.transform = "scale(1)";
        
        menuContainer.appendChild(div);
    });
}

function verSeccion(seccion) {
    document.getElementById('scr-dash').style.display = 'none';
    document.getElementById('scr-edit').style.display = 'block';
    document.getElementById('btn-atras').style.display = 'block';
    
    document.getElementById('data-container').innerHTML = "";
    document.getElementById('section-actions').innerHTML = "";

    switch(seccion) {
        case 'monitores': mostrarMonitores(); break;
        case 'actividades': mostrarActividades(); break;
        case 'instalaciones': mostrarAulas(); break;
        case 'alumnos': mostrarAlumnos(); break;
        case 'cuadrantes': mostrarCuadrantes(); break;
        // CAMBIO QUIRÚRGICO: Llamamos a mostrarDatos() para ver los cajones naranjas de backup
        case 'configuracion': if(typeof mostrarDatos === 'function') mostrarDatos(); break;
    }
}