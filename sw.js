// Network-first: selalu ambil versi terbaru, cache hanya dipakai kalau offline.
// Data kas (Supabase) tidak pernah di-cache.
var C = 'kas-rt-v1';
self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(function(c){ return c.addAll(['./', 'manifest.webmanifest', 'icon-192.png']); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== C; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var r = e.request;
  if(r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(r).then(function(res){
      var cp = res.clone();
      caches.open(C).then(function(c){ c.put(r, cp); });
      return res;
    }).catch(function(){
      return caches.match(r).then(function(m){ return m || caches.match('./'); });
    })
  );
});
