'use strict';

define(function() {
  var REQUEST_FAILURE_TIMEOUT = 10000;
  var pictureTemplate = document.querySelector('#picture-template');

  var Photo = function(data) {
    this._data = data;
    this._onClick = this._onClick.bind(this);
  };

  Photo.prototype.render = function(container) {
    var newPictureElement = pictureTemplate.content.children[0].cloneNode(true);
    newPictureElement.querySelector('.picture-comments').textContent = this._data['comments'];
    newPictureElement.querySelector('.picture-likes').textContent = this._data['likes'];

    if (this._data['url']) {
      var newImg = new Image(182, 182);
      newImg.src = this._data['url'];
    }

    var imageLoadTimeout = setTimeout(function() {
      newPictureElement.classList.add('picture-load-failure');
    }, REQUEST_FAILURE_TIMEOUT);

    newImg.onload = function() {
      var oldImageElement = newPictureElement.querySelector('.picture img');
      newPictureElement.replaceChild(newImg, oldImageElement);
      clearTimeout(imageLoadTimeout);
    };

    newImg.onerror = function() {
      newPictureElement.classList.add('picture-load-failure');
    };

    container.appendChild(newPictureElement);
    this._element = newPictureElement;
    this._element.addEventListener('click', this._onClick);
  };


  Photo.prototype.unrender = function() {
    this._element.parentNode.removeChild(this._element);
    this._element.removeEventListener('click', this._onClick);
    this._element = null;
  };

  Photo.prototype.getPhotoUrl = function() {
    return this._data.url;
  };

  Photo.prototype._onClick = function(evt) {
    evt.preventDefault();
    if (!this._element.classList.contains('picture-load-failure')) {
      var galleryEvent = new CustomEvent('galleryclick', { detail: { photoElement: this}});
      window.dispatchEvent(galleryEvent);
    }
  };

  return Photo;
});
