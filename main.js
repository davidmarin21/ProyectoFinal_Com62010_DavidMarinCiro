document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;

    if (currentPath.includes('index.html') || currentPath === '/') {
        cargarHabitaciones();
        const reservaForm = document.getElementById('reserva-form');
        reservaForm.addEventListener('submit', realizarReserva);
    }

    if (currentPath.includes('checkout.html')) {
        mostrarResumenReserva();
        const pagoForm = document.getElementById('pago-form');
        pagoForm.addEventListener('submit', realizarPago);
    }

    if (currentPath.includes('reservas.html')) {
        mostrarReservas();
    }
});

function cargarHabitaciones() {
    fetch('reservas.json')
        .then(response => response.json())
        .then(habitaciones => {
            mostrarHabitaciones(habitaciones);
            llenarSelect(habitaciones);
        })
        .catch(error => console.error('Error al cargar las habitaciones:', error));
}

function mostrarHabitaciones(habitaciones) {
    const container = document.getElementById('habitaciones-container');
    container.innerHTML = '';

    habitaciones.forEach(habitacion => {
        const habitacionDiv = document.createElement('div');
        habitacionDiv.classList.add('card', 'mb-3');
        habitacionDiv.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${habitacion.tipo}</h5>
                <p class="card-text">Precio: $${habitacion.precio}</p>
                <p class="card-text">Disponible: ${habitacion.disponible ? 'Sí' : 'No'}</p>
            </div>
        `;
        container.appendChild(habitacionDiv);
    });
}

function llenarSelect(habitaciones) {
    const select = document.getElementById('habitacion');
    select.innerHTML = '';

    habitaciones.filter(habitacion => habitacion.disponible).forEach(habitacion => {
        const option = document.createElement('option');
        option.value = habitacion.id;
        option.textContent = `${habitacion.tipo} - $${habitacion.precio}`;
        select.appendChild(option);
    });
}

function realizarReserva(event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const habitacionId = parseInt(document.getElementById('habitacion').value);

    const nuevaReserva = {
        id: generarIdUnico(),
        nombre,
        email,
        habitacionId,
        fecha: new Date().toLocaleString()
    };

    guardarReserva(nuevaReserva);
    mostrarAlerta('Reserva realizada', 'Su reserva ha sido realizada con éxito. Ahora será redirigido a la página de reservas.', 'success');

    setTimeout(() => {
        window.location.href = 'reservas.html';
    }, 2000);
}

function generarIdUnico() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function guardarReserva(reserva) {
    let reservas = JSON.parse(localStorage.getItem('reservas')) || [];
    reservas.push(reserva);
    localStorage.setItem('reservas', JSON.stringify(reservas));
}

function mostrarAlerta(titulo, texto, icono) {
    Swal.fire({
        title: titulo,
        text: texto,
        icon: icono,
        confirmButtonText: 'Aceptar'
    });
}

function mostrarResumenReserva() {
    const reservas = JSON.parse(localStorage.getItem('reservas')) || [];
    const ultimaReserva = reservas[reservas.length - 1];
    const resumenContainer = document.getElementById('resumen-reserva');

    if (!ultimaReserva) {
        mostrarAlerta('Error', 'No hay reservas para mostrar.', 'error');
        return;
    }

    fetch('reservas.json')
        .then(response => response.json())
        .then(habitaciones => {
            const habitacion = habitaciones.find(h => h.id === ultimaReserva.habitacionId);
            resumenContainer.innerHTML = `
                <h3>Resumen de Reserva</h3>
                <p>Nombre: ${ultimaReserva.nombre}</p>
                <p>Email: ${ultimaReserva.email}</p>
                <p>Habitación: ${habitacion.tipo}</p>
                <p>Precio: $${habitacion.precio}</p>
                <p>Fecha: ${ultimaReserva.fecha}</p>
            `;
        })
        .catch(error => console.error('Error al cargar la habitación:', error));
}

function realizarPago(event) {
    event.preventDefault();

    const tarjeta = document.getElementById('tarjeta').value;
    const fechaExpiracion = document.getElementById('fecha-expiracion').value;
    const cvv = document.getElementById('cvv').value;

    if (!validarPago(tarjeta, fechaExpiracion, cvv)) {
        mostrarAlerta('Error', 'Datos de pago inválidos. Por favor, verifique los campos.', 'error');
        return;
    }

    mostrarAlerta('Pago realizado', 'Su pago ha sido realizado con éxito. ¡Gracias por su reserva!', 'success');

    setTimeout(() => {
        localStorage.removeItem('reservas');
        window.location.href = 'index.html';
    }, 2000);
}

function validarPago(tarjeta, fechaExpiracion, cvv) {
    const tarjetaRegex = /^[0-9]{16}$/;
    const fechaRegex = /^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/;
    const cvvRegex = /^[0-9]{3,4}$/;

    return tarjetaRegex.test(tarjeta) && fechaRegex.test(fechaExpiracion) && cvvRegex.test(cvv);
}

function mostrarReservas() {
    const reservas = JSON.parse(localStorage.getItem('reservas')) || [];
    const container = document.getElementById('reservas-container');
    container.innerHTML = '';

    if (reservas.length === 0) {
        container.innerHTML = '<p>No hay reservas para mostrar.</p>';
        return;
    }

    reservas.forEach(reserva => {
        const reservaDiv = document.createElement('div');
        reservaDiv.classList.add('card', 'mb-3');
        reservaDiv.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">Reserva de ${reserva.nombre}</h5>
                <p class="card-text">Email: ${reserva.email}</p>
                <p class="card-text">Habitación: ${reserva.habitacionId}</p>
                <p class="card-text">Fecha: ${reserva.fecha}</p>
                <button class="btn btn-danger" onclick="eliminarReserva('${reserva.id}')">Eliminar</button>
                <a href="checkout.html" class="btn btn-success">Continuar al Pago</a>
            </div>
        `;
        container.appendChild(reservaDiv);
    });
}

function eliminarReserva(id) {
    let reservas = JSON.parse(localStorage.getItem('reservas')) || [];
    reservas = reservas.filter(reserva => reserva.id !== id);
    localStorage.setItem('reservas', JSON.stringify(reservas));
    mostrarReservas();
    mostrarAlerta('Reserva eliminada', 'La reserva ha sido eliminada con éxito.', 'success');
}
