document.getElementById('loginForm').onsubmit = async function (event) {
    event.preventDefault();

    document.getElementById('loading').style.display = 'block';

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('mensaje');

    messageDiv.textContent = '';

    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbwiKU7fAxWvCeGae1gXl7vwym4IV7MKBxa2yHpoMVkT3rb_Kud5S7EFeMbF0AZgUqcLxg/exec', {
            method: 'POST',
            body: new URLSearchParams({
                'username': username,
                'password': password
            })
        });

        const result = await response.json();

        if (result.success) {
            // Generate a simple token (timestamp + username + random string)
            const token = btoa(Date.now() + username + Math.random().toString(36).substring(7));
            
            // Store token and user data
            localStorage.setItem('authToken', token);
            localStorage.setItem('usuarioLogueado', username);
            localStorage.setItem('tokenExpiry', Date.now() + (24 * 60 * 60 * 1000)); // 24 hours expiry

            messageDiv.textContent = 'Acceso concedido.';
            messageDiv.style.color = 'green';
            setTimeout(function () {
                window.location.href = "../Inicio/inicio.html";
            }, 2000);
        } else {
            messageDiv.textContent = 'Usuario o contraseña incorrectos.';
            messageDiv.style.color = 'red';
        }
    } catch (error) {
        console.error('Error:', error);
        messageDiv.textContent = 'Hubo un error al intentar iniciar sesión.';
        messageDiv.style.color = 'red';
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
};
