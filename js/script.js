// Elementos del formulario de búsqueda de obras.
const formularioBusqueda = document.getElementById("formBusqueda");
const campoBusqueda = document.getElementById("cadenaBusqueda");
const avisoBusqueda = document.getElementById("errorBusqueda");

// Espacios para presentar las obras encontradas.
const seccionResultados = document.getElementById("seccion-respuestas");
const contenedorObras = document.getElementById("obras");

// Dirección del servicio de obras de arte.
const urlApiObras = "https://www.promociones.pescaderiaelcharco.com/obras/";

formularioBusqueda.addEventListener("submit", buscarObras);

async function buscarObras(evento) {
    // Evita que el formulario recargue la página.
    evento.preventDefault();

    const terminoBusqueda = campoBusqueda.value.trim();
    avisoBusqueda.textContent = "";
    contenedorObras.innerHTML = "";
    seccionResultados.hidden = true;

    // Se muestra un aviso si solamente se escribieron espacios.
    if (terminoBusqueda === "") {
        avisoBusqueda.textContent = "Escribe un dato para buscar una obra.";
        return;
    }

    // Filtro elegido: título, tipo, año o movimiento.
    const tipoBusqueda = document.querySelector(
        'input[name="tipoBusqueda"]:checked'
    ).value;

    const urlBusqueda = urlApiObras + "?" + tipoBusqueda + "="
        + encodeURIComponent(terminoBusqueda);

    try {
        // La promesa espera la respuesta del servidor.
        const respuestaObras = await new Promise((resolve, reject) => {
            const solicitudObras = new XMLHttpRequest();

            solicitudObras.open("GET", urlBusqueda);

            solicitudObras.onload = function () {
                if (solicitudObras.status === 200) {
                    resolve(solicitudObras.responseText);
                } else {
                    reject(new Error("No se pudo consultar las obras."));
                }
            };

            solicitudObras.onerror = function () {
                reject(new Error("No se pudo conectar con el servidor."));
            };

            solicitudObras.send();
        });

        // Convierte la respuesta JSON en un arreglo de obras.
        const obras = JSON.parse(respuestaObras);

        seccionResultados.hidden = false;

        if (obras.length === 0) {
            contenedorObras.textContent =
                "No se encontraron obras con ese dato.";
            return;
        }

        // Cada obra aparece con su imagen y sus datos.
        obras.forEach((obra) => {
           const urlImagen = urlApiObras + obra.imagen.replace(/^\//, "");

            const fichaObra = document.createElement("article");
            fichaObra.className = "resultado-obra mb-4";

            fichaObra.innerHTML = `
                <div class="row g-3">
                    <div class="col-12 col-md-6">
                        <img src="${urlImagen}"
                            class="img-fluid w-100"
                            alt="${obra.titulo}">
                    </div>

                    <div class="col-12 col-md-6">
                        <h3>${obra.titulo}</h3>
                        <p>${obra.descripcion}</p>
                        <p>Artista: ${obra.artista}</p>
                        <p>Año: ${obra.anio}</p>
                        <p>Tipo: ${obra.tipo}</p>
                        <p>Movimiento: ${obra.movimiento}</p>
                    </div>
                </div>
            `;

            contenedorObras.appendChild(fichaObra);
        });
    } catch (error) {
        // Se muestra un aviso si falla la consulta o la respuesta.
        avisoBusqueda.textContent =
            "No se pudieron cargar las obras. Intenta de nuevo.";
        console.error(error);
    }
}