export const displayMap= (locations) => {
  mapboxgl.accessToken = 'pk.eyJ1IjoianVhbnJvIiwiYSI6ImNraDl0eWVscDFueGEycW84dTVucXNrMGMifQ.hPsstFWLXy-_8D4BwhCs_w';
  
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    scrollZoom: false
    // center: [-118, 34],
    // zoom: 10,
    // interactive: false
  });
  
  const bounds= new mapboxgl.LngLatBounds();
  
  locations.forEach(loc => {
    // Create marker
    const el= document.createElement('div');
    el.className= 'marker';
  
    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    }).setLngLat(loc.coordinates).addTo(map);
  
    // Add popup
    new mapboxgl.Popup({
      offset: 30
    }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);
  
    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });
  
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 100,
      left: 100,
      right: 100
    }
  });
};
