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

