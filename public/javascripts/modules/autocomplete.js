function autocomplete(input, latInput, lngInput) {
  if(!input) return
  
  const dropdown = new google.maps.places.Autocomplete(input);
  // google maps version of event listener
  dropdown.addListener('place_changed', () => {
    const place = dropdown.getPlace();
    latInput.value = place.geometry.location.lat();
    lngInput.value = place.geometry.location.lng();
  });
  //if someone hits enter on the address field, dont submit form
  //.on = bling.js
  input.on('keydown', (e) => {
    if(e.keyCode === 13) e.preventDefault();
  })
}

export default autocomplete;