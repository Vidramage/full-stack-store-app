import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomplete from './modules/autocomplete';
import typeAhead from './modules/typeAhead';
import makeMap from './modules/map';
import ajaxHeart from './modules/heart';

autocomplete( $('#address'), $('#lat'), $('#lng') )

typeAhead( $('.search') );

makeMap( $('#map') );

const heartForms = $$('form.heart');
heartForms.on('submit', ajaxHeart);

const heart = $$('button.heart__button');

heart.on('mouseover', function(e) {
  this.classList.add('hvr-pulse-grow')
});

heart.on('mouseout', function(e) {
  this.classList.remove('hvr-pulse-grow')
});

const pencil = $$('.store__action--edit');
pencil.on('mouseover', function(e) {
  this.classList.add('hvr-bob')
});

pencil.on('mouseout', function(e) {
  this.classList.remove('hvr-bob')
});


const review = $$('.store__action--count')
review.on('mouseover', function(e) {
  this.classList.add('hvr-grow-rotate')
});
