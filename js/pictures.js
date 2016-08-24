'use strict';

requirejs.config({
  baseUrl: 'js'
});

define([
  'photo',
  'gallery',
  'logo-background',
  'upload-form',
  'filter-form'
], function(Photo, Gallery) {

  var ReadyState = {
    'UNSENT': 0,
    'OPENED': 1,
    'HEADERS_RECEIVED': 2,
    'LOADING': 3,
    'DONE': 4
  };

  var picturesContainer = document.querySelector('.pictures');
  var filters = document.querySelector('.filters');
  var allPictures;
  var REQUEST_FAILURE_TIMEOUT = 10000;
  var PAGE_SIZE = 12;
  var currentPage = 0;
  var currentPictures;
  var renderedPictures = [];
  var gallery;
  filters.classList.add('hidden');

  function renderPicture(picturesToRender, pageNumber, replace) {
    replace = typeof replace !== 'undefined' ? replace : true;
    pageNumber = pageNumber || 0;

    if (replace) {
      var element;
      while ((element = renderedPictures.shift())) {
        element.unrender();
      }
      picturesContainer.classList.remove('pictures-failure');
    }

    var picturesFrom = pageNumber * PAGE_SIZE;
    var picturesTo = picturesFrom + PAGE_SIZE;

    picturesToRender = picturesToRender.slice(picturesFrom, picturesTo);
    var pictureFragment = document.createDocumentFragment();

    picturesToRender.forEach(function(picture) {
      var newPictureElement = new Photo(picture);
      newPictureElement.render(pictureFragment);
      renderedPictures.push(newPictureElement);
    });
    picturesContainer.appendChild(pictureFragment);
  }

  function showLoadFailure() {
    picturesContainer.classList.add('pictures-failure');
  }

  function loadPictures(callback) {
    var xhr = new XMLHttpRequest();
    xhr.timeout = REQUEST_FAILURE_TIMEOUT;
    xhr.open('get', 'data/pictures.json');
    xhr.send();

    xhr.onreadystatechange = function(evt) {
      var xhrLoaded = evt.target;

      switch (xhrLoaded.readyState) {
        case ReadyState.OPENED:
        case ReadyState.HEADERS_RECEIVED:
        case ReadyState.LOADING:
          picturesContainer.classList.add('pictures-loading');
          break;
        case ReadyState.DONE:
        default:
          if (xhrLoaded.status === 200) {
            picturesContainer.classList.remove('pictures-loading');
            var data = xhrLoaded.response;
            callback(JSON.parse(data));
            return;
          }
          if (xhr.status > 400) {
            showLoadFailure();
          }
          break;
      }
    };

    xhr.ontimeout = function() {
      showLoadFailure();
    };
  }

  function picturesFilter(picturesToFilter, filterId) {
    var picturesFiltered = picturesToFilter.slice(0);
    switch (filterId) {
      case 'filter-new':
        picturesFiltered = picturesFiltered.sort(function(a, b) {
          if (a.date < b.date) {
            return -1;
          }
          if (a.date === b.date) {
            return 0;
          }
          if (a.date > b.date) {
            return 1;
          }
        });
        break;

      case 'filter-discussed':
        picturesFiltered = picturesFiltered.sort(function(a, b) {
          if (a.comments > b.comments) {
            return -1;
          }
          if (a.comments === b.comments) {
            return 0;
          }
          if (a.comments < b.comments) {
            return 1;
          }
        });
        break;

      case 'filter-popular':
      default:
        picturesFiltered = allPictures.slice(0);
        break;
    }
    localStorage.setItem('filterID', filterId);
    return picturesFiltered;
  }

  function setActiveFilter(filterId) {
    currentPictures = picturesFilter(allPictures, filterId);
    currentPage = 0;
    renderPicture(currentPictures, currentPage, true);
    checkNextPage();
  }

  function initFilters() {
    filters.addEventListener('change', function(evt) {
      var clickedFilter = evt.target;
      location.hash = 'filters/' + clickedFilter.value;
    });
  }

  function isNextPageAvailable() {
    return currentPage < Math.ceil(allPictures.length / PAGE_SIZE);
  }

  function isAtTheBottom() {
    var GAP = 100;
    return picturesContainer.getBoundingClientRect().bottom - GAP <= window.innerHeight;
  }

  function checkNextPage() {
    if (isAtTheBottom() && isNextPageAvailable()) {
      window.dispatchEvent(new CustomEvent('loadneeded'));
    }
  }

  function initScroll() {
    var someTimeout;
    window.addEventListener('scroll', function() {
      clearTimeout(someTimeout);
      someTimeout = setTimeout(checkNextPage, 100);
    });

    window.addEventListener('loadneeded', function() {
      renderPicture(currentPictures, currentPage++, false);
    });
  }

  function initGallery() {
    if (!gallery) {
      gallery = new Gallery();
    }

    window.addEventListener('galleryclick', function(evt) {
      var photos = [];
      photos = currentPictures.map(function(item) {
        return item.url;
      });

      gallery.setPhotos(photos);
      var currentPhotoNumber = photos.indexOf(evt.detail.photoElement.getPhotoUrl());
      gallery.setCurrentPhoto(currentPhotoNumber);
      gallery.show();
    });
  }

  window.addEventListener('hashchange', function() {
    setActiveFilter(parseURL());
  });

  function parseURL() {
    var filterHash = location.hash.match(/^#filters\/(\S+)$/);
    var filterID = 'filter-popular';
    if (filterHash) {
      filterID = 'filter-' + filterHash[1];
    }
    return filterID;
  }

  initFilters();
  initScroll();
  initGallery();

  loadPictures(function(loadedPictures) {
    allPictures = loadedPictures;
    setActiveFilter(parseURL());
    var checkedFilter = document.getElementById(localStorage.getItem('filterID'));
    checkedFilter.checked = true;

    filters.classList.remove('hidden');
  });

});
