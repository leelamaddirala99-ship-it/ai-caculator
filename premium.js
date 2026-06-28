// premium.js: small helper to manage premium banner visibility
(function(){
  const BANNER_ID = 'premiumBanner';
  const DEMO_KEY = 'PREMIUM-DEMO-2026';
  const banner = document.getElementById(BANNER_ID);
  if(!banner) return;
  function hasPremium(){
    return localStorage.getItem('calc_license') === DEMO_KEY;
  }
  function refresh(){
    if(hasPremium()) banner.style.display = 'none';
    else banner.style.display = 'block';
  }
  // expose a small helper for runtime toggling
  window.__calc_premium = {isPremium: ()=> (localStorage.getItem('calc_license')===DEMO_KEY), refresh};
  refresh();
})();
