import ddef from "./mymod.js";

const version = "V4.9"; 
const addResourcesToCache = async (resources) => {
  const cache = await caches.open(version);
  await cache.addAll(resources);
};

const putInCache = async (request, response) => {
  const cache = await caches.open(version);
  await cache.put(request, response);
};

// service-worker.js
self.onmessage = async (event) => {
  // event is an ExtendableMessageEvent object
 console.log("PM", await clients.matchAll());
};

const cacheFirst = async ({ request, preloadResponsePromise, fallbackUrl }) => {
  // First try to get the resource from the cache
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    return responseFromCache;
  }

  // Next try to use the preloaded response, if it's there
  // NOTE: Chrome throws errors regarding preloadResponse, see:
  // https://bugs.chromium.org/p/chromium/issues/detail?id=1420515
  // https://github.com/mdn/dom-examples/issues/145
  // To avoid those errors, remove or comment out this block of preloadResponse
  // code along with enableNavigationPreload() and the "activate" listener.
  // const preloadResponse = await preloadResponsePromise;
  // if (preloadResponse) {
  //   console.info('using preload response', preloadResponse);
  //   putInCache(request, preloadResponse.clone());
  //   return preloadResponse;
  // }

  // Next try to get the resource from the network
  try {
    const responseFromNetwork = await fetch(request.clone());
    // response may be used only once
    // we need to save clone to put one copy in cache
    // and serve second one
    putInCache(request, responseFromNetwork.clone());
    return responseFromNetwork;
  } catch (error) {
    const fallbackResponse = await caches.match(fallbackUrl);
    if (fallbackResponse) {
      return fallbackResponse;
    }
    // when even the fallback response is not available,
    // there is nothing we can do, but we must always
    // return a Response object
    return new Response('Network error happened', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
};

const enableNavigationPreload = async () => {
  if (self.registration.navigationPreload) {
    // Enable navigation preloads!
    await self.registration.navigationPreload.enable();
  }
};

const deleteCache = async (key) => {
  await caches.delete(key);
};

const deleteOldCaches = async () => {
  const cacheKeepList = [version];
  const cacheKeys = await caches.keys();
  const cachesToDelete = cacheKeys.filter(key => !cacheKeepList.includes(key));
  await Promise.all(cachesToDelete.map(deleteCache));
};

self.addEventListener("activate", (event) => {
  console.log("Activation");
  const shouldClaim = (Promise.resolve(true)) ?? clients.claim();
  event.waitUntil(shouldClaim.then(() => deleteOldCaches())); //DispatchEvent and addEventListener can accept multiple listeners for the same event.
});

self.addEventListener('activate', async (event) => {
  // event.waitUntil(enableNavigationPreload());
  // console.log(await clients.matchAll());
  // throw 45;
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    addResourcesToCache([
      "https://nodetest2-vcdb.onrender.com/cors-test.jpg",
      // "https://nodetest2-vcdb.onrender.com/rcors-rtest.jpg",
      './',
      './index.html',
      './style.css',
      './app.js',
      './image-list.js',
      "./gallery/webworker.js",
      './star-wars-logo.jpg',
      './gallery/bountyHunters.jpg',
      './gallery/myLittleVader.jpg',
      './gallery/snowTroopers.jpg',
      './gallery/workerImage.jpg'
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', (event) => {
  console.log("Ok", event.request.url);
  if(event.request.url.startsWith('http')){
   
  event.respondWith(
    cacheFirst({
      request: event.request,
      // preloadResponsePromise: event.preloadResponse,
      fallbackUrl: './gallery/myLittleVader.jpg',
    })
  );
}
});
