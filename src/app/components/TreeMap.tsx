import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Correção obrigatória para os ícones padrão do Leaflet funcionarem no Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Dados mockados das árvores monitoradas (simulando a resposta do seu ESP32)
const treesData = [
  { id: 1, lat: -3.1019, lng: -60.0250, species: 'Ipê Roxo', status: 'Normal', temp: '26°C' },
  { id: 2, lat: -3.1030, lng: -60.0220, species: 'Mogno', status: 'Alerta de Fogo', temp: '48°C' },
  { id: 3, lat: -3.1005, lng: -60.0280, species: 'Jatobá', status: 'Normal', temp: '25°C' },
];

export default function TreeMap() {
  return (
    // O container pai precisa ter uma altura definida para o mapa aparecer
    <div className="w-full h-[500px] rounded-xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
      <MapContainer 
        center={[-3.1019, -60.0250]} 
        zoom={14} 
        scrollWheelZoom={true} // Habilita o zoom de lupa com o scroll do mouse
        className="w-full h-full"
      >
        {/* Camada do mapa base (OpenStreetMap) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Iterando sobre as árvores para criar os pinos no mapa */}
        {treesData.map((tree) => (
          <Marker key={tree.id} position={[tree.lat, tree.lng]}>
            <Popup>
              <div className="p-1 min-w-[150px]">
                <h3 className="font-bold text-green-700 text-base mb-1">{tree.species}</h3>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-semibold text-gray-600">Status:</span>{' '}
                    <span className={tree.status.includes('Alerta') ? 'text-red-600 font-bold' : 'text-green-600'}>
                      {tree.status}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-gray-600">Temperatura:</span> {tree.temp}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}