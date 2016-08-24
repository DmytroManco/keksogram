/* global resizer: true*/
'use strict';
define(function() {

  var uploadForm = document.forms['upload-select-image'];
  var resizeForm = document.forms['upload-resize'];
  var filterForm = document.forms['upload-filter'];
  var previewImage = resizeForm.querySelector('.resize-image-preview');
  var prevButton = resizeForm['resize-prev'];

  var resizeFormX = resizeForm['resize-x'];
  var resizeFormY = resizeForm['resize-y'];
  var resizeSide = resizeForm['resize-size'];

  resizeFormX.min = 0;
  resizeFormY.min = 0;
  resizeSide.min = 50;


  previewImage.onload = function() {
    var previewImageX = previewImage.width;
    var previewImageY = previewImage.height;

    resizeFormX.max = previewImageX;
    resizeFormY.max = previewImageY;
    resizeSide.max = (previewImageX < previewImageY) ? previewImageX : previewImageY;
  };

  resizeSide.onchange = function() {
    resizeFormX.max = resizeSide.value;
    resizeFormY.max = resizeSide.value;

    var moveDiff = (resizeSide.value - resizer.getConstraint().side) / 2;
    var a = resizer.getConstraint().x - moveDiff;
    var b = resizer.getConstraint().y - moveDiff;
    resizer.setConstraint(a, b, resizeSide.value);
  };

  resizeFormX.onchange = function() {
    resizer.setConstraint(+resizeFormX.value, +resizeFormY.value, +resizeSide.value);
  };

  resizeFormY.onchange = function() {
    resizer.setConstraint(+resizeFormX.value, +resizeFormY.value, +resizeSide.value);
  };

  prevButton.onclick = function(event) {
    event.preventDefault();
    resizeForm.reset();
    uploadForm.reset();
    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  };

  resizeForm.onsubmit = function(event) {
    event.preventDefault();
    filterForm.elements['filter-image-src'] = previewImage.src;
    filterForm.querySelector('.filter-image-preview').src = resizer.exportImage().src;
    resizeForm.classList.add('invisible');
    filterForm.classList.remove('invisible');
  };

  window.addEventListener('resizerchange', function() {
    var photoConstraint = resizer.getConstraint();
    resizeFormX.value = Math.floor(photoConstraint.x);
    resizeFormY.value = Math.floor(photoConstraint.y);
    resizeSide.value = Math.floor(photoConstraint.side);
  });
})();
