var staticCache = 'c8-main-v2'
var allCaches = [staticCache]
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(staticCache).then(function (cache) {
    return cache.addAll([
        './',
        './offline.js',
        'https://fonts.googleapis.com/icon?family=Material+Icons',
        'https://fonts.gstatic.com/s/materialicons/v47/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
        './config.js',
        './cpu.js',
        './debug.js',
        './emulator.js',
        './fileloader.js',
        './keyboard.js',
        './main.js',
        './memory.js',
        './opcode.html',
        './registers.js',
        './screen.js',
        './style.css',
        './res/icon.png',
        './res/btn.jpg',
        './res/bg.jpg'
    ])
  }))
})

self.addEventListener('activate',(event)=>{
	event.waitUntil(caches.keys().then((cacheNs)=>{
		return Promise.all(cacheNs.filter((cacheN)=>{
			return !allCaches.includes(cacheN)
		}).map((cN)=>{
			return caches['delete'](cN)
		}))
	}))
})

self.addEventListener('fetch', (event)=>{
    let u = event.request.url
    event.respondWith(caches.match(event.request).then((response)=>{
        return response || fetch(event.request)
        .then(r=>{return r.status===404?(new Response('404 :(',{status:404})):r})
        .catch(e=>{return new Response('{"error": "connection lost"}')})
    }));
});

self.addEventListener('message',(event)=>{
  if (event.data.action === 'refresh') {
    self.skipWaiting()
  }
  if(event.data.action === 'cacheEXTROMS'){
     event.waitUntil(caches.open(staticCache).then(function (cache) {
        return cache.addAll(event.data.roms)
    }))
  }
  if(event.data.action === 'check'){
    let ch
    event.waitUntil(caches.open(staticCache).then(function(cache) {
        ch = cache
        return clients.claim();
    }).then(function() {
      return self.clients.matchAll().then(function(clients) {
        return Promise.all(clients.map(function(client) {
            return ch.keys().then(k=>{
                var c = [0,0]
                c[0] = k.find(x=>x.url.match('roms/UFO')) ? 1 : 0
                c[1] = k.find(x=>x.url.match('Filter.ch8')) ? 1 : 0
                client.postMessage(JSON.stringify(c))
            })
        }));
      });
    }))
  }
  if(event.data.action === 'cacheROMS'){
      event.waitUntil(caches.open(staticCache).then(function (cache) {
        return cache.addAll([
            './roms/15PUZZLE',
            './roms/BLINKY',
            './roms/BLITZ',
            './roms/BRIX',
            './roms/CONNECT4',
            './roms/GUESS',
            './roms/HIDDEN',
            './roms/INVADERS',
            './roms/KALEID',
            './roms/MAZE',
            './roms/MERLIN',
            './roms/MISSILE',
            './roms/PONG',
            './roms/PONG2',
            './roms/PUZZLE',
            './roms/SYZYGY',
            './roms/TANK',
            './roms/TETRIS',
            './roms/TICTAC',
            './roms/UFO',
            './roms/VBRIX',
            './roms/VERS',
            './roms/WIPEOFF'
        ])
      }))
  }
  if(event.data.action === 'clean'){
      caches.keys().then(function(names) {
          for (let name of names) caches.delete(name);
      });
  }
})
