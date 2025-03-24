// Función para verificar la autenticación
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const tokenExpiry = localStorage.getItem('tokenExpiry');

    // Si no hay token o ha expirado, limpiar sesión y redirigir
    if (!token || !tokenExpiry || Date.now() > parseInt(tokenExpiry)) {
        clearSession();
        return false; // No autenticado
    }

    return true; // Autenticado
}

// Función para limpiar la sesión
function clearSession() {
    try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('usuarioLogueado');
        sessionStorage.setItem('loggedOut', 'true'); // Marcar como cerrado
    } catch (e) {
        console.error('Error al limpiar sesión:', e);
    }
}

// Función para redirigir al login
function redirectToLogin() {
    const loginPath = '../index.html';
    if (window.location.pathname !== loginPath) {
        window.location.replace(loginPath);
    }
}

// Verificar autenticación al cargar la página
window.addEventListener('load', function () {
    if (sessionStorage.getItem('loggedOut') === 'true') {
        clearSession();
        sessionStorage.removeItem('loggedOut');
        redirectToLogin();
    } else {
        // Solo verificar si no se ha cerrado sesión
        if (!checkAuth()) {
            redirectToLogin();
        }
    }
});

// Detectar navegación con el botón atrás
window.addEventListener('pageshow', function (event) {
    // Verificar si la página es recuperada desde el caché
    if (event.persisted || (performance.navigation && performance.navigation.type === 2)) {
        if (!checkAuth()) {
            redirectToLogin();
        }
    }
});

