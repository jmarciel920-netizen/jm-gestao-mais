// JM Gestão+ — service worker (app instalável).
// Guarda só os arquivos da tela (sem dados de clientes). Os dados vêm sempre do Firebase.
const CACHE='jmgmais-v2';
const TELA=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png','./favicon-32.png'];
// bibliotecas externas versionadas (não mudam): podem ficar guardadas para abrir com internet fraca
const LIBS=/^https:\/\/(www\.gstatic\.com\/firebasejs\/|fonts\.gstatic\.com\/|cdnjs\.cloudflare\.com\/ajax\/libs\/jszip\/3\.10\.1\/|cdn\.sheetjs\.com\/xlsx-0\.20\.3\/)/;
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(TELA)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    // rede primeiro: sempre a versão mais nova; sem internet, a última cópia da tela
    e.respondWith(fetch(r).then(res=>{if(res.ok&&res.type==='basic'){const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c))}return res})
      .catch(()=>caches.match(r,{ignoreSearch:r.mode==='navigate'}).then(x=>x||(r.mode==='navigate'?caches.match('./index.html'):Response.error()))));
    return}
  if(LIBS.test(r.url)){
    e.respondWith(caches.match(r).then(x=>x||fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const c=res.clone();caches.open(CACHE).then(y=>y.put(r,c))}return res})));
  }
  // todo o resto (Firebase, Google Drive, login) passa direto, sem guardar nada
});
