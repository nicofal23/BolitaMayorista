document.addEventListener('DOMContentLoaded', () => {
  const llantasContainer = document.getElementById('llantasContainer');
  const modeloSelect = document.getElementById('modeloSelect');
  const buscador = document.getElementById('buscador');
  const numeroPiezaInput = document.getElementById('numeroPieza');
  const filtrarNumeroPiezaBtn = document.getElementById('filtrarNumeroPieza');
  const imagenseguneleccion = document.getElementById('imagenseguneleccion');
  const modal = document.getElementById('myModal');
  const modalImage = document.getElementById('modalImage');
  const closeModal = document.getElementById('closeModal');

  // Evento clic en la imagen para abrir el modal
  llantasContainer.addEventListener('click', (event) => {
    if (event.target.tagName === 'IMG') {
      abrirModal(event.target.src);
    }
  });

  closeModal.addEventListener('click', () => {
    cerrarModal();
  });

  // Cierra el modal si se hace clic fuera de la imagen o del modal
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      cerrarModal();
    }
  });

  // Función para abrir el modal
  function abrirModal(imagenSrc) {
    modal.style.display = 'block';
    modalImage.src = imagenSrc;
  }

  // Función para cerrar el modal
  function cerrarModal() {
    modal.style.display = 'none';
  }

  // Cargar datos desde el archivo modelos.json
  fetch('modelos.json')
    .then(response => response.json())
    .then(data => {
      // Llenar el select con modelos únicos
      const modelosUnicos = [...new Set(data.vehiculos.map(CODIGO => CODIGO.modelo))];
      modelosUnicos.forEach(modelo => {
        const option = document.createElement('option');
        option.value = modelo;
        option.textContent = modelo;
        modeloSelect.appendChild(option);
      });

      // Llenar las tarjetas
      llenarTarjetas(data.vehiculos);

      // Agregar eventos para filtrar al cambiar el modelo o escribir en el buscador
      modeloSelect.addEventListener('change', () => {
        const modeloSeleccionado = modeloSelect.value;
        const vehiculoSeleccionado = data.vehiculos.find(CODIGO => CODIGO.modelo === modeloSeleccionado);
        llenarTarjetas([vehiculoSeleccionado]);

        // Actualizar la imagen según el modelo seleccionado
        actualizarImagenSegunSeleccion(modeloSeleccionado, data.vehiculos);
      });

      buscador.addEventListener('input', () => {
        const filtro = buscador.value.toLowerCase();
        const vehiculosFiltrados = data.vehiculos.filter(CODIGO =>
          CODIGO.productos.some(producto => producto.DESCRIPCION.toLowerCase().includes(filtro))
        );
        llenarTarjetas(vehiculosFiltrados);
      });

      filtrarNumeroPiezaBtn.addEventListener('click', () => {
        const numeroPieza = numeroPiezaInput.value.toLowerCase();
        const vehiculosFiltrados = data.vehiculos.filter((CODIGO) => {
          return CODIGO.productos.some((producto) => {
            return producto['NUMERO DE PIEZA'].toLowerCase().includes(numeroPieza) || producto['CODIGO'].toLowerCase().includes(numeroPieza);
          });
        });
        llenarTarjetas(vehiculosFiltrados);
      });
    })
    .catch(error => console.error('Error al cargar los datos:', error));

    function llenarTarjetas(vehiculos) {
      llantasContainer.innerHTML = '';
  
      vehiculos.forEach(vehiculo => {
          vehiculo.productos.forEach(producto => {
              const card = document.createElement('div');
              card.classList.add('card');
  
              const image = document.createElement('img');
              image.src = producto.IMAGEN;
              image.alt = producto.DESCRIPCION;
  
              const cardContent = document.createElement('div');
              cardContent.classList.add('card-content');
  
              const precioConIVA = producto['PRECIO CON IVA'];
              const precioSinIVA = precioConIVA / 1.21; 
              const precioConIvaMas1 = precioConIVA * 1.11;
              const precioConIvaMas = precioConIvaMas1 * 1.0279;



              const precioConAumento1 = precioSinIVA * 1.11;
              const precioConAumento = precioConAumento1 * 1.0279;


              const title = document.createElement('div');
              title.classList.add('card-title');
              title.textContent = producto.DESCRIPCION;
  
              const description = document.createElement('div');
              description.classList.add('card-description');
              description.innerHTML = `
                  <p>Modelo: ${vehiculo['modelo']}</p>
                  <p>Numero de pieza: ${producto["CODIGO"]}</p>
                  <p>Precio sin IVA (21%): $${precioConAumento.toFixed(3)},00</p>
                  <p>Precio con IVA: $${precioConIvaMas.toFixed(3)},00</p>
              `;
  
              const verButton = document.createElement('button');
              verButton.classList.add('boton-ver');
              verButton.textContent = 'Ver número de pieza';
              verButton.addEventListener('click', () => mostrarNumeroDePiezaConContraseña(producto['NUMERO DE PIEZA']));
  
              // Insertar el botón antes del párrafo que contiene el número de pieza
              description.insertBefore(verButton, description.querySelector('p'));
  
              cardContent.appendChild(title);
              cardContent.appendChild(description);
  
              card.appendChild(image);
              card.appendChild(cardContent);
  
              llantasContainer.appendChild(card);
          });
      });
  }
  

  function mostrarNumeroDePiezaConContraseña(numeroDePieza) {
    Swal.fire({
      title: 'Ingrese las credenciales',
      html:
        '<input id="swal-username" class="swal2-input" placeholder="Usuario">' +
        '<input type="password" id="swal-password" class="swal2-input" placeholder="Contraseña">',
      focusConfirm: false,
      preConfirm: () => {
        const usuario = Swal.getPopup().querySelector('#swal-username').value;
        const contraseña = Swal.getPopup().querySelector('#swal-password').value;

        // Verificar las credenciales
        if (usuario === 'bolita' && contraseña === 'bolita11') {
          // Mostrar el número de pieza
          Swal.fire({
            title: 'Número de pieza',
            text: numeroDePieza,
            icon: 'info',
          });
        } else {
          // Mostrar un mensaje si las credenciales son incorrectas
          Swal.fire({
            title: 'Error',
            text: 'Credenciales incorrectas. Acceso denegado.',
            icon: 'error',
          });
        }
      },
    });
  }

  function actualizarImagenSegunSeleccion(modeloSeleccionado, vehiculos) {
    const imagenModelo = obtenerImagenModelo(modeloSeleccionado, vehiculos);
    const imagenSegunSeleccion = document.getElementById("imagenseguneleccion");
  
    if (imagenModelo) {
      imagenSegunSeleccion.innerHTML = `<img src="${imagenModelo}" alt="${modeloSeleccionado}">`;
      // Eliminar clase de animación para reiniciar la animación
      imagenSegunSeleccion.classList.remove("rotate-scale-up");
      // Forzar reflow para que la clase eliminada se aplique correctamente
      void imagenSegunSeleccion.offsetWidth;
      // Agregar nuevamente la clase de animación para iniciarla
      imagenSegunSeleccion.classList.add("rotate-scale-up");
    } else {
      imagenSegunSeleccion.innerHTML = '';
    }
  }

  function obtenerImagenModelo(modeloSeleccionado, vehiculos) {
    const vehiculoEncontrado = vehiculos.find(CODIGO => CODIGO.modelo === modeloSeleccionado);
    return vehiculoEncontrado ? vehiculoEncontrado.imagenmodelo : null;
  }




  let data; // Variable para almacenar los datos cargados desde el archivo JSON

  const searchButton = document.querySelector('.searchButton');

    // Agregar un listener al botón de búsqueda
    searchButton.addEventListener('click', function () {
      buscarCodigo();
    });
  })
  .catch(error => console.error('Error al cargar el archivo JSON:', error));

// Definir la función buscarCodigo
function buscarCodigo() {
  const codigoInput = document.querySelector('.searchTerm').value;

  // Verificar si data está definido y es un array
  if (data && Array.isArray(data.vehiculos)) {
    const producto = data.vehiculos.flatMap(vehiculo => vehiculo.productos).find(item => item.CODIGO == codigoInput);

    if (producto) {
      // Configurar las opciones de SweetAlert con estilo y posición
      const swalOptions = {
        title: `Foto: ${producto.IMAGEN}`,
        text: `Codigo: ${producto.CODIGO}\nPrecio Compañia: $${precioCon50PorCiento.toFixed(2)}\nPrecio publico: $${precioConDescuento.toFixed(2)}`,
        icon: 'success',
        position: 'absolute',
        customClass: {
          popup: 'custom-swal-popup',
          title: 'custom-swal-title',
          content: 'custom-swal-content',
        },
        buttonsStyling: false,
      };

      swal(swalOptions);
    } else {
      swal({
        title: 'Error',
        text: 'Código no encontrado',
        icon: 'error',
        position: 'absolute',
        customClass: {
          popup: 'custom-swal-popup',
          title: 'custom-swal-title',
          content: 'custom-swal-content',
        },
        buttonsStyling: false,
      });
    }
  } else {
    console.error('Los datos no se han cargado correctamente.');
  }
}
  
  