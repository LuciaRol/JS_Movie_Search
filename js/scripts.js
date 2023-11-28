// variables globales
var pagina=1;
var blockScroll=false;
var type= "";
var cont=0;
var contenedor;
var url_error= "https://ih1.redbubble.net/image.3429601350.3818/raf,360x360,075,t,fafafa:ca443f4786.jpg" // imagen error 404
tipos_permitidos = ["movie", "series", "episode"];


window.onload = () => {
        contenedor = document.getElementById("container");
        btn = document.getElementById("boton");
        btnVolver = document.getElementById('boton_volver');


        // click en botón Buscar, inicia la función búsqueda
        btn.addEventListener("click", () => {
        Busqueda()
        });
        
        //click en botón Volver arriba, lleva al principio de la página
        btnVolver.addEventListener('click', function () {
                document.body.scrollTop = 0; // para que funcione en navegadores antiguos
                document.documentElement.scrollTop = 0; // para que funcione en navegadores modernos
        return false;
        })
        
};

// scroll infinito
// cuando se haga scroll al final, se lanzará recarga_scroll(), que obtendrá la siguiente página de la búsqueda
window.addEventListener('scroll', function () {
        if (window.scrollY + window.innerHeight > document.documentElement.scrollHeight - 100) {
                if (!blockScroll) {
                pagina = pagina + 1;
                recarga_scroll();
                }
        }
});

// obtenemos el valor actual de la búsqueda y si es mayor de 3, se lanza
inputBuscador = document.getElementById('buscador');
inputBuscador.addEventListener('input', function() {
        var searchTerm = this.value;
        if (searchTerm.length >= 3) {
                Busqueda();
        }
});

//Función para hacer click en el botón de buscar llama a la función principal
inputBuscador.addEventListener('keypress', function(e) {
        if (e.which === 13) {
                Busqueda();
        }
        });

inputTipo = document.getElementById('tipo');
inputTipo.addEventListener('keypress', function(e) {
        if (e.which === 13) {
                Busqueda();
        }
});


// función que utilizamos para transformar el array de jsons, en un string
function ObtenerValoraciones(array) {
        var jsonStringArray = array.map(jsonObj => JSON.stringify(jsonObj));
        var modifiedStringArray = jsonStringArray.map(jsonString => {
        let modifiedString = jsonString.replace(/[{}"]/g, ''); //así quitamos los simbolos que no nos sirven y se ven mal
        modifiedString = modifiedString.replace(/}\s*{/g, ', ');
        return modifiedString;
        });
        const resultString = modifiedStringArray.join('\n');
        return resultString;
}


// obtiene las películas
function Busqueda() {
        obtener_url();
        var peliculasContainer = document.getElementById("peliculas");
        while (peliculasContainer.firstChild) {
                peliculasContainer.removeChild(peliculasContainer.firstChild);
                }
        llamadaAjax(url);
}

// es lo mismo que búsqueda, pero no vacía el html y se van agregando a la web.
function recarga_scroll(){
        obtener_url();
        llamadaAjax(url);
}

/* Aquí obtenemos el url. El if es para que funcione con tipo (type). 
Si el género no está dentro del array ["movie", "series", "episode"] ignora el género. 
Además, el replace es para poder introducir espacios a la hora de buscarcuando se lance la búsqueda, la web se vaciará. */
function obtener_url(){
        busqueda = document.getElementById("buscador").value;
        tipo_pelicula = document.getElementById("tipo").value;
        if (tipos_permitidos.includes(tipo_pelicula)) {
                url="https://www.omdbapi.com/?s="+ busqueda+"&page="+pagina+"&apikey=ba7933ec"+"&type="+tipo_pelicula;
        } else {
                url ="https://www.omdbapi.com/?s=" +busqueda + "&page=" + pagina +"&apikey=ba7933ec";
        }
        url = url.replace(" ", "+"); //replace para corregir bug si el usuario pone un espacio
}

//aquí traemos todas la información que tiene la url y comprobamos que todo está ok para maquetar
function llamadaAjax(link) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', link, true);
        xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                        var datos = JSON.parse(xhr.responseText);
                        // Verificar si "Search" está definido y no es null. Se pone por si obtenemos un resultado undefined o null y cancelar toda la búsqueda
                        var resultado = datos["Search"];
                        if (resultado === undefined || resultado === null) {
                        // Cancelar la función si "resultado" es undefined o null
                        blockScroll = false; // Cambiamos a false para que no de error la página y siga funcionando
                        return;
                        }
                       /*  Esto se realiza para comprobar la imagen del póster que se recibe. De esta forma, 
                        para cada elemento del json podemos comprobar si la imagen es correcta y, si no, la sustituimos */
                        resultado.forEach(function (item) {
                        var titulo = item["Title"];
                        var id = item["imdbID"];
                        var portada = item["Poster"];
                        var imgCheck = new Image();
                        imgCheck.onload = function () {
                                maquetarRespuesta(portada, titulo, id);
                        };
                        imgCheck.onerror = function () {
                                portada = url_error;
                                maquetarRespuesta(portada, titulo, id);
                        };
                        imgCheck.src = portada;
                        });
                }
        };
        xhr.send();

}
// esta función es para poner todas las películas que ha cogido en busqueda. Normalmente son 10 y 
// va pasando de página en página al hacer scroll
function maquetarRespuesta(portada, titulo, id) {
        var portada1 = document.createElement('div');
        portada1.className = "col-lg-3 col-sm-4 text-center card"; // maqueta las imágenes al mismo tamaño
        portada1.setAttribute('id', id);

        portada1.addEventListener('click', function () {
                var xhr = new XMLHttpRequest();
                //obtenemos toda la información de la película en particular realizando la búsqueda por id
                
                xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4 && xhr.status == 200) {
                                var datos = JSON.parse(xhr.responseText);
                                var an = datos["Released"];
                                var director = datos["Director"];
                                var gen = datos["Genre"];
                                var actores = datos["Actors"];
                                var plot = datos["Plot"];
                                var valoraciones = datos["Ratings"];
                                setDetalle(titulo, an, director, gen, actores, portada, plot, valoraciones);
                        }
                };
                xhr.open('GET', "https://www.omdbapi.com/?i=" + id + "&apikey=ba7933ec", true);
                xhr.send();
        });


        portada1.innerHTML =
                '<img src=' + portada + ' data-toggle="modal" data-target="#imagenModulo">' +
                "<p>" + titulo + "</p>";

        peliculas = document.getElementById("peliculas")
        peliculas.appendChild(portada1);
}


// Introducimos toda la información que hemos recopilado de la película dentro de este html modal
// las etiquetas se incluyen dentro del html mediante esta función. 
function setDetalle(titulo, an, director, gen, actores, portada, plot, valoraciones) {
        var modalHeader = document.querySelector(".modal-header");
        modalHeader.innerHTML =
                "<div class='row'>" +
                "<div class='col-xs-7 col-sm-6 col-lg-8'>" +
                '<h5>' + titulo + '</h5>' +
                "</div>" +
                "</div>";

        var modalBody = document.querySelector(".modal-body");
        modalBody.innerHTML =
                "<div class='row'>" +
                "<div class='col-lg-5 col-sm-12 col-12'>" +
                '<img src=' + portada + '>' +
                "</div>&nbsp;&nbsp;&nbsp;" +
                "<div class='col-lg-6 col-sm-12 col-12'>" +
                "<p>Estreno: " + an + "</p>" +
                "<p>Género: " + gen + "</p>" +
                "<hr/>" +
                "<p>Directora: " + director + "</p>" +
                "<p>Actores: " + actores + "</p>" +
                "<hr/>" +
                "<p>Sinopsis</p>" +
                "<p>" + plot + "</p>" +
                "<hr/>" +
                "<p>Valoraciones</p>" +
                "<p>" + ObtenerValoraciones(valoraciones) + "</p>" +
                "</div>" +
                "</div>";
        }
