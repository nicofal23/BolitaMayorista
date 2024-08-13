document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', (event) => {
      event.preventDefault(); // Evitar que se envíe el formulario de forma convencional

      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      // Obtener usuarios desde el archivo JSON
      fetch('usuarios.json')
        .then(response => response.json())
        .then(data => {
          const usuarioValido = data.usuarios.find(usuario => usuario.nombreUsuario === username && usuario.contraseña === password);

          if (usuarioValido) {
            // Redirigir a inicio.html
            window.location.href = '/pages/catalog.html';
          } else {
            // Mostrar un mensaje si las credenciales son incorrectas
            alert('Credenciales incorrectas. Acceso denegado.');
          }
        })
        .catch(error => console.error('Error al cargar los usuarios:', error));
    });
  });
  



  