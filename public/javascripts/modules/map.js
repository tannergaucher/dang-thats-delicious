import axios from 'axios';
import { $ } from './bling';

const mapOptions = {
  center: {lat: 43.2, lng: -79.8},
  zoom: 10
}

function loadPlaces(map, lat = 43.2 , lng = -79.8) {
  axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
    .then(res => {
      const places = res.data;
      // console.log(places)
      if(!places.length) {
        alert('no platzes found');
        return
      }
      //create bounds
      const bounds = new google.maps.LatLngBounds();
      //make marker clickable
      const infoWindow = new google.maps.InfoWindow();
      
      //make marker for each place
      const markers = places.map(place => {
        const [placeLng, placeLat] = place.location.coordinates;
        console.log(placeLng, placeLat); 
        const position = {lat: placeLat, lng: placeLng};
        bounds.extend(position)
        const marker = new google.maps.Marker({map, position});
        //attatch place data to our api
        marker.place = place;
        return marker;
      });
      //loop through markers, listen for click, show details
      //addListener is google maps equvilent of addeventlistener
      //need proper function bc need access to this (marker itself)
      markers.forEach(marker => marker.addListener('click', function(){
        const html = `
          <div class="popup">
            <a href="/store/${this.place.slug}">
              <img src="/uploads/${this.place.photo || 'store.png'}" alt="${this.place.name}" />
              <p>${this.place.name} - ${this.place.location.address}</p>
            </a>
          </div>
        `;
        infoWindow.setContent(html);
        infoWindow.open(map, this);
      }));
      
      
      //then zoom map to fit all markers perfectly
      map.setCenter(bounds.getCenter())
      //
      map.fitBounds(bounds)
    });
}

function makeMap(mapDiv) { 
  if(!mapDiv) return;
  //make map. store in var 
                              //where should it go , params
  const map = new google.maps.Map(mapDiv, mapOptions)
  loadPlaces(map)
  
  const input = $('[name="geolocate"]');
  const autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.addListener('place_changed', () =>{
    const place = autocomplete.getPlace();
    console.log(place)
    loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng())
  })
}

export default makeMap;

