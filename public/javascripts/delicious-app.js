import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomplete from './modules/autocomplete';
// import typeAhead from '/modules/typeAhead'
import makeMap from './modules/map';
import ajaxHeart from './modules/heart';


autocomplete( $('#address'), $('#lat'), $('#lng') )

// typeAhead( $('.search'));

makeMap( $('#map'));

//$$ === queryselectorall
const heartForms = $$('form.heart');
//bling.js listen for events on a node list, rather than having to loop every one
heartForms.on('submit', ajaxHeart);

