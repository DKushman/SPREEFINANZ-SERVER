(function () {
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'analytics_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'wait_for_update': 500
  });

  try {
    if (document.cookie.indexOf('ehcookieblocker_allow_tracking=1') !== -1) {
      gtag('consent', 'update', {
        'ad_storage': 'granted',
        'analytics_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted'
      });
    }
  } catch (e) {}

  gtag('js', new Date());
  gtag('config', 'G-BWN8PQ3RHB', { 'anonymize_ip': true });

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-BWN8PQ3RHB';
  document.head.appendChild(s);
})();
