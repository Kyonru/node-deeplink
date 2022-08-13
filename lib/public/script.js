function deepLink(options) {
  var fallback = options.fallback || '';
  var url = options.url || '';
  var iosStoreLink = options.ios_store_link;
  var androidPackageName = options.android_package_name;
  var timeout = options.timeout || 250;
  var usePathOnFallback = options.usePathOnFallback || false;
  var playStoreLink =
    'https://play.google.com/store/apps/details?id=' + androidPackageName;
  var ua = window.navigator.userAgent;

  var timeoutId;

  const hiddenProp = () => {
    const properties = {};
    if (typeof document.hidden !== 'undefined') {
      properties.name = 'hidden';
      properties.event = 'visibilitychange';
    } else if (typeof document.msHidden !== 'undefined') {
      properties.name = 'msHidden';
      properties.event = 'msvisibilitychange';
    } else if (typeof document.webkitHidden !== 'undefined') {
      properties.name = 'webkitHidden';
      properties.event = 'webkitvisibilitychange';
    }

    return properties;
  };

  // split the first :// from the url string
  var split = url.split(/:\/\/(.+)/);
  var scheme = split[0];
  var path = split[1] || '';

  var urls = {
    deepLink: url,
    iosStoreLink: iosStoreLink,
    android_intent:
      'intent://' +
      path +
      '#Intent;scheme=' +
      scheme +
      ';package=' +
      androidPackageName +
      ';end;',
    playStoreLink: playStoreLink,
    fallback: usePathOnFallback ? fallback + '/' + path : fallback,
  };

  var isMobile = {
    android: function () {
      return /Android/i.test(ua);
    },
    ios: function () {
      const isMobile = /iPhone|iPad|iPod/i.test(ua);
      const isM1IPad =
        navigator.maxTouchPoints &&
        navigator.maxTouchPoints > 2 &&
        /Macintosh/.test(ua);
      return isMobile || isM1IPad;
    },
  };

  // fallback to the application store on mobile devices
  if (isMobile.ios() && urls.deepLink && urls.iosStoreLink) {
    iosLaunch();
  } else if (isMobile.android() && androidPackageName) {
    androidLaunch();
  } else {
    window.location = urls.fallback;
  }

  function handleVisibilityChange() {
    window.clearTimeout(timeoutId);
    document.removeEventListener(
      hiddenProp().event,
      handleVisibilityChange,
      false
    );
  }

  function launchWebkitApproach(url, fallback, time = 3000) {
    const hidden = hiddenProp();
    if (
      typeof document.addEventListener !== 'undefined' ||
      hidden.name !== undefined
    ) {
      document.addEventListener(hidden.event, handleVisibilityChange, false);
    }

    document.location.replace(url);

    timeoutId = setTimeout(function () {
      document.location.replace(fallback);
    }, time);
  }

  function launchIframeApproach(url, fallback, time = 50) {
    var iframe = document.createElement('iframe');
    iframe.style.border = 'none';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.onload = function () {
      document.location.replace(url);
    };
    iframe.src = url;

    window.onload = function () {
      document.body.appendChild(iframe);

      setTimeout(function () {
        window.location.replace(fallback);
      }, time);
    };
  }

  function iosLaunch() {
    // chrome and safari on ios >= 9 don't allow the iframe approach
    if (
      ua.match(/CriOS/) ||
      (ua.match(/Safari/) && ua.match(/Version\/(9|10|11|12|13|14|15|16)/)) ||
      ua.match(/Line/)
    ) {
      launchWebkitApproach(
        urls.deepLink,
        urls.iosStoreLink || urls.fallback,
        timeout
      );
    } else {
      launchIframeApproach(
        urls.deepLink,
        urls.iosStoreLink || urls.fallback,
        timeout
      );
    }
  }

  function androidLaunch() {
    if (ua.match(/Chrome/)) {
      document.location.replace(urls.android_intent);
    } else if (ua.match(/Firefox/)) {
      launchWebkitApproach(
        urls.deepLink,
        urls.playStoreLink || urls.fallback,
        timeout
      );
    } else {
      launchIframeApproach(url, urls.playStoreLink || urls.fallback, timeout);
    }
  }
}

// expose module so it can be required later in tests
if (typeof module !== 'undefined') {
  module.exports = deepLink;
}
