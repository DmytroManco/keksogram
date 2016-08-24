'use strict';
define(function() {
  var uploadForm = document.forms['upload-select-image'];
  var resizeForm = document.forms['upload-resize'];
  var filterForm = document.forms['upload-filter'];

  var previewImage = filterForm.querySelector('.filter-image-preview');
  var prevButton = filterForm['filter-prev'];
  var selectedFilter = filterForm['upload-filter'];

  var filterMap;

  function setFilter() {
    if (!filterMap) {
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }

    previewImage.className = 'filter-image-preview' + ' ' + filterMap[selectedFilter.value];
  }

  for (var i = 0, l = selectedFilter.length; i < l; i++) {
    selectedFilter[i].onchange = function() {
      setFilter();
    };
  }

  prevButton.onclick = function(evt) {
    evt.preventDefault();

    filterForm.reset();
    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  };

  filterForm.onsubmit = function(evt) {
    evt.preventDefault();

    uploadForm.classList.remove('invisible');
    filterForm.classList.add('invisible');
  };

  function getCookie(name) {
    var results = document.cookie.match( '(^|;) ?' + name + '=([^;]*)(;|$)' );

    if (results) {
      return (unescape(results[2]));
    } else {
      return null;
    }
  }

// Функция установки кук с учебника js
  function setCookie(name, value, options) {
    options = options || {};

    var expires = options.expires;

    if (typeof expires === 'number' && expires) {
      var d = new Date();
      d.setTime(d.getTime() + expires * 1000);
      expires = options.expires = d;
    }
    if (expires && expires.toUTCString) {
      options.expires = expires.toUTCString();
    }

    value = encodeURIComponent(value);
    var updatedCookie = name + '=' + value;
    for (var propName in options) {
      if (options.hasOwnProperty(propName)) {
        updatedCookie += '; ' + propName;
        var propValue = options[propName];
        if (propValue !== true) {
          updatedCookie += '=' + propValue;
        }
      }
    }
    document.cookie = updatedCookie;
  }


// Cookie
  filterForm.onsubmit = function(evt) {
    evt.preventDefault();

    var filterValue = document.forms['upload-filter']['upload-filter'].value;

    // Срок хранения кук
    var myBirthday = new Date(1992, 10, 17);
    var myBirthdayMillisec = myBirthday.getTime();
    var currentDate = new Date();
    var currentDateMillisec = currentDate.getTime();
    var filterCookiesLive = myBirthdayMillisec + currentDateMillisec;

    setCookie('filter', filterValue, {expires: new Date(filterCookiesLive)});
    filterForm.submit();
  };
// Значение по умолчанию
  selectedFilter.value = getCookie('filter');

  setFilter();
});
