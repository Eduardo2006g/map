let map;
let geocoder;

// Inicia o mapa
function initMap() {
    // Cria um novo mapa
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -20.3155, lng: -40.3128 }, // Define o centro do mapa (Vitória - ES)
        zoom: 12 // Define o nível de zoom inicial
    });

    // Inicializa o geocoder
    geocoder = new google.maps.Geocoder();

    // Adiciona um ouvinte de evento para o formulário de localização
    document.getElementById('locationForm').addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Obtém os valores do formulário
        let address = document.getElementById('address').value;
        let name = document.getElementById('name').value;
        let info = document.getElementById('info').value;
        let price = document.getElementById('price').value;
        let imageFile = document.getElementById('image').files[0];
        let imagePath = imageFile ? URL.createObjectURL(imageFile) : null;

        // Cria um objeto com os dados da nova localização
        let newLocation = {
            address: address,
            name: name,
            info: info,
            price: price,
            image: imagePath
        };

        // Chama a função para geocodificar o endereço e adicionar a localização
        geocodeAddress(newLocation, addLocation);
    });

    // Carrega as localizações salvas
    loadLocations();

    // Chamada para criar localizações a partir das propriedades do arquivo JSON "properties"
    createLocationsFromProperties();
}

// Função para criar localizações a partir das propriedades do arquivo JSON "properties"
function createLocationsFromProperties() {
    fetch('prop2.json') // Carrega o arquivo JSON "properties"
        .then(response => response.json()) // Converte a resposta em JSON
        .then(data => {
            // Para cada propriedade no arquivo JSON "properties"
            data.forEach(property => {
                let newLocation = {
                    address: property.address,
                    name: property.name,
                    info: property.info,
                    price: property.price,
                    image: null // Define a imagem como null por padrão
                };

                // Chama a função para geocodificar o endereço e adicionar a localização
                geocodeAddress(newLocation, addLocation);
            });
        })
        .catch(error => console.error('Erro ao carregar o arquivo JSON "properties":', error)); // Trata erros, se houver
}

// Função para geocodificar o endereço
function geocodeAddress(location, callback) {
    geocoder.geocode({ address: location.address }, (results, status) => {
        if (status === "OK") {
            // Se a geocodificação for bem-sucedida, adiciona as coordenadas à localização e chama a função de callback
            location.lat = results[0].geometry.location.lat();
            location.lng = results[0].geometry.location.lng();
            callback(location);
        } else {
            // Se houver erro na geocodificação, exibe um alerta
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
}

// Função para adicionar uma nova localização
function addLocation(newLocation) {
    // Obtém as localizações salvas do armazenamento local ou cria uma lista vazia se não houver
    let locations = JSON.parse(localStorage.getItem('locations')) || [];
    // Adiciona a nova localização à lista
    locations.push(newLocation);
    // Salva a lista atualizada no armazenamento local
    localStorage.setItem('locations', JSON.stringify(locations));
    // Adiciona um marcador para a nova localização no mapa
    addMarker(newLocation);
}

// Função para adicionar um marcador ao mapa
function addMarker(location) {
    const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: location.name
    });

    // Cria uma janela de informações para exibir os detalhes da localização quando o marcador é clicado
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div>
                <h3>${location.name}</h3>
                <p>${location.address}</p>
                <p>${location.info}</p>
                <p>${location.price}</p>
                ${location.image ? `<img src="${location.image}" alt="${location.name}" style="width:100px;">` : ''}
            </div>
        `
    });

    // Adiciona um ouvinte de evento para exibir a janela de informações quando o marcador é clicado
    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });
}

// Função para salvar as localizações como um arquivo JSON
function saveLocations() {
    let locations = JSON.parse(localStorage.getItem('locations')) || [];
    downloadJSON(locations, 'locations.json');
}

// Função para baixar um arquivo JSON
function downloadJSON(data, filename) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
}

// Função para carregar as localizações salvas do arquivo JSON
function loadLocations() {
    // Faz uma solicitação para carregar o arquivo JSON
    fetch('locations.json')
        .then(response => response.json()) // Converte a resposta em JSON
        .then(data => displayLocations(data)) // Passa os dados para a função displayLocations
        .catch(error => console.error('Erro ao carregar o arquivo JSON:', error)); // Trata erros, se houver
}

// Função para exibir as localizações no mapa
function displayLocations(locations) {
    locations.forEach(location => {
        addMarker(location);
    });
}

// Adiciona um ouvinte de evento para o input de arquivo
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const locations = JSON.parse(content);
            localStorage.setItem('locations', JSON.stringify(locations));
            displayLocations(locations);
        };
        reader.readAsText(file);
    }
});
