// Seleccionar elementos
const btnAgregar = document.getElementById('btnAgregar');
const formularioContainer = document.getElementById('formulario-container');
const cerrarFormulario = document.getElementById('cerrarFormulario');
const formulario = document.getElementById('formulario');

// Obtener el usuario logueado
const usuarioLogueado = localStorage.getItem('usuarioLogueado');

// URL del script de Google Apps Script
const API_URL = 'https://script.google.com/macros/s/AKfycbzTpOKYYx56ZXIhfyAXtB1nsxfz_35njP2DVeE58dmwhL992A1gqXdSSrtz7bNrKUR3Jg/exec';

// Función para cargar los datos de la tabla filtrados por usuario
function cargarDatosTabla() {
    const tabla = document.getElementById('miTabla').getElementsByTagName('tbody')[0];
    const headers = ["USUARIO", "FECHA", "HORA", "COMPAÑÍA", "CANTIDAD DE BULTOS", "AGENDADO", "CON ORDEN", "MUESTREO", "COMENTARIO", "ACCIONES"];
    
    tabla.innerHTML = '';

    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar los datos');
            }
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                tabla.innerHTML = '<tr><td colspan="10">No hay datos disponibles</td></tr>';
                return;
            }
            const registrosFiltrados = data.filter(row => row[0] === usuarioLogueado); // Filtrar por usuario logueado
            if (registrosFiltrados.length === 0) {
                tabla.innerHTML = '<tr><td colspan="10">No hay registros para este usuario</td></tr>';
                return;
            }
            registrosFiltrados.forEach((row, rowIndex) => {
                const newRow = tabla.insertRow();
                // Guardar el índice original del registro en el dataset de la fila
                newRow.dataset.rowIndex = data.indexOf(row);
                
                // Agregar las celdas con los datos
                row.forEach((cell, index) => {
                    const newCell = newRow.insertCell(index);
                    if (index === 1 && cell) { // Columna FECHA
                        const fecha = new Date(cell);
                        if (!isNaN(fecha)) {
                            const dia = fecha.getDate().toString().padStart(2, '0');
                            const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
                            const año = fecha.getFullYear();
                            newCell.textContent = `${dia}-${mes}-${año}`;
                        } else {
                            newCell.textContent = cell;
                        }
                    } else if (index === 2 && cell) { // Columna HORA
                        // Verificar si es un formato de fecha ISO (contiene T y Z)
                        if (typeof cell === 'string' && (cell.includes('T') || cell.includes('Z'))) {
                            try {
                                // Intentar extraer la hora de la fecha ISO
                                const fecha = new Date(cell);
                                if (!isNaN(fecha)) {
                                    let horas = fecha.getHours();
                                    const minutos = fecha.getMinutes().toString().padStart(2, '0');
                                    const periodo = horas >= 12 ? 'PM' : 'AM';
                                    horas = horas % 12 || 12; // Convertir a formato 12 horas
                                    newCell.textContent = `${horas}:${minutos} ${periodo}`;
                                } else {
                                    newCell.textContent = cell;
                                }
                            } catch (e) {
                                newCell.textContent = cell;
                            }
                        } else {
                            // Si no es formato ISO, mostrar como está
                            newCell.textContent = cell;
                        }
                    } else { // Otras columnas
                        newCell.textContent = cell || '';
                    }
                    newCell.setAttribute('data-label', headers[index]);
                });
                
                // Agregar celda con botón de eliminar
                const cellAcciones = newRow.insertCell(row.length);
                cellAcciones.setAttribute('data-label', 'ACCIONES');
                
                const btnEliminar = document.createElement('button');
                btnEliminar.textContent = 'Eliminar';
                btnEliminar.className = 'btn-eliminar';
                btnEliminar.addEventListener('click', function() {
                    eliminarRegistro(newRow.dataset.rowIndex);
                });
                
                cellAcciones.appendChild(btnEliminar);
            });
        })
        .catch(error => {
            console.error('Error al cargar datos:', error);
            tabla.innerHTML = '<tr><td colspan="10">Error al cargar los datos</td></tr>';
        });
}

// Función para eliminar un registro
function eliminarRegistro(rowIndex) {
    const confirmar = confirm('¿Estás seguro de que deseas eliminar este registro?');
    if (!confirmar) return;
    
    const datos = {
        accion: 'eliminar',
        rowIndex: rowIndex
    };
    
    fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    })
    .then(response => {
        console.log('Solicitud de eliminación enviada:', response);
        // Mostrar mensaje de éxito
        alert('Registro eliminado correctamente');
        // Recargar la tabla después de eliminar
        setTimeout(() => {
            cargarDatosTabla();
        }, 1000); // Esperar 1 segundo para dar tiempo a que se procese la eliminación
    })
    .catch(error => {
        console.error('Error al eliminar registro:', error);
        alert('Error al eliminar el registro: ' + error.message);
    });
}

// Mostrar formulario al hacer clic en el botón flotante
btnAgregar.addEventListener('click', function() {
    formularioContainer.style.display = 'flex';
    btnAgregar.style.display = 'none';
});

// Cerrar formulario al hacer clic en el botón de cerrar
cerrarFormulario.addEventListener('click', function() {
    formularioContainer.style.display = 'none';
    btnAgregar.style.display = 'block';
});

// Enviar formulario para agregar registro
formulario.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const fecha = document.getElementById('fecha').value;
    const horaInput = document.getElementById('hora').value;
    const compania = document.getElementById('compania').value;
    const cantidadBultos = document.getElementById('cantidadBultos').value;
    const agendado = document.querySelector('input[name="agendado"]:checked').value;
    const conOrden = document.querySelector('input[name="conOrden"]:checked').value;
    const muestreo = document.querySelector('input[name="muestreo"]:checked').value;
    const comentarios = document.getElementById('comentarios').value;

    // Convertir la hora del input (formato 24h) a formato 12h con AM/PM
    let horaFormateada = '';
    if (horaInput) {
        const [horas24, minutos] = horaInput.split(':');
        const horasNum = parseInt(horas24);
        const periodo = horasNum >= 12 ? 'PM' : 'AM';
        const horas12 = horasNum % 12 || 12; // Convertir a formato 12 horas
        horaFormateada = `${horas12}:${minutos} ${periodo}`;
    }

    const datos = {
        accion: 'agregar',
        usuario: usuarioLogueado, // Usar el usuario logueado
        fecha: fecha,
        hora: horaFormateada,
        compania: compania,
        cantidadBultos: cantidadBultos,
        agendado: agendado,
        conOrden: conOrden,
        muestreo: muestreo,
        comentarios: comentarios || ''
    };

    console.log('Enviando datos:', datos);

    fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    })
    .then(response => {
        console.log('Solicitud enviada:', response);
        formularioContainer.style.display = 'none';
        btnAgregar.style.display = 'block';
        formulario.reset();
        // Mostrar mensaje de éxito
        alert('Registro agregado correctamente');
        setTimeout(() => {
            cargarDatosTabla();
        }, 1000); // Esperar 1 segundo para dar tiempo a que se procese la adición
    })
    .catch(error => {
        console.error('Error detallado:', error);
        alert('Error al procesar la solicitud: ' + error.message);
    });
});

// Cargar datos de la tabla al iniciar la página
document.addEventListener('DOMContentLoaded', function() {
    if (usuarioLogueado) {
        cargarDatosTabla();
    } else {
        window.location.href = "../index.html"; // Redirigir si no hay usuario logueado
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar');
    const cerrarSesionLink = document.querySelector('.sidebar ul li a[href="../index.html"]');

    if (hamburger && sidebar && cerrarSesionLink) {
        // Abrir o cerrar el sidebar al hacer clic en el ícono de hamburguesa
        hamburger.addEventListener('click', function(event) {
            event.stopPropagation();
            this.classList.toggle('active');
            sidebar.classList.toggle('active');
        });

        // Cerrar el sidebar al hacer clic fuera de él
        document.addEventListener('click', function(event) {
            if (!sidebar.contains(event.target) && !hamburger.contains(event.target)) {
                sidebar.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });

        // Confirmación para cerrar sesión
        cerrarSesionLink.addEventListener('click', function(event) {
            event.preventDefault();
            const mensaje = "Confirmación de Cierre de Sesión\n\n¿Estás seguro de que deseas cerrar sesión?";
            const confirmar = confirm(mensaje);
            if (confirmar) {
                clearSession(); // Limpiar toda la información relacionada con la sesión
                window.location.href = this.href; // Redirigir al login
            }
        });
    }
});

// Función para limpiar la sesión completamente
function clearSession() {
    localStorage.clear(); // Limpiar todo el almacenamiento local
}