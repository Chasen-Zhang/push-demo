importScripts("/workbox-sw.js");//Web App 静态资源本地存储的解决方案
//https://zoumiaojiang.com/article/amazing-workbox-3/
var cacheStorageKey = 'minimal-pwa-05'
var cacheList=[
  '/',
  '/index.html',
  '/index2.html',
  '/main.css',
  '/quan.png'
]
//这里的self === window ;
/* self.addEventListener('install',e =>{ //install事件一般是用来填充你的浏览器的离线缓存能力。
  e.waitUntil( // 等待资源缓存成功
    caches.open(cacheStorageKey)
    .then(cache => 
        {
            cache.addAll(cacheList);
            console.log('0---');
        })
    .then(() => {  
        self.skipWaiting();//缓存成功，跳过，进入新的ServiceWork进程。
        console.log('1------');
    })
  )
}) */
self.addEventListener('install', function(e) {
   // debugger;
    console.log('Cache event!')
    // 打开一个缓存空间，将相关需要缓存的资源添加到缓存里面
    e.waitUntil(//这会确保 Service Worker 不会在 waitUntil() 里面的代码执行完毕之前安装完成。
    // self是当前 context 的 global 变量，执行该方法表示强制当前处在 waiting 状态的 Service Worker 进入 activate 状态
      caches.open(cacheStorageKey).then(function(cache) {
        console.log('Adding to Cache:', cacheList)
        return cache.addAll(cacheList)
      }).then(function() {
        console.log('install event open cache ' + cacheStorageKey);
        console.log('Skip waiting!')
        return self.skipWaiting();
      }).catch(function(){
        console.log('注册失败！');
      })
    )
  })
/* self.addEventListener('fetch',function(e){
    e.respondWith(
      caches.match(e.request).then(function(response){
        if(response != null){
          return response
        }
        return fetch(e.request.url)
      })
    )
  }) */
/**
 * 每次任何被 Service Worker 控制的资源被请求到时，都会触发 fetch 事件，这些资源包括了指定的 scope 内的 html 文档，和这些 html 文档内引用的其他任何资源（比如 index.html 发起了一个跨域的请求来嵌入一个图片，这个也会通过 Service Worker），这下 Service Worker 代理服务器的形象开始慢慢露出来了，而这个代理服务器的钩子就是凭借 scope 和 fetch 事件两大利器就能把站点的请求管理的井井有条。
 */
self.addEventListener('fetch', function(e) {
    console.log('Fetch event ' + cacheStorageKey + ' :', e.request.url);
    e.respondWith( // 劫持我们的 HTTP 响应, 该策略先从网络中获取资源，如果获取失败则再从缓存中读取资源
      fetch(e.request.url)
      .then(function (httpRes) {
  
        // 请求失败了，直接返回失败的结果
        if (!httpRes || httpRes.status !== 200) {
            // return httpRes;
            return caches.match(e.request)
        }
  
        // 请求成功的话，将请求缓存起来。
        var responseClone = httpRes.clone();
        caches.open(cacheStorageKey).then(function (cache) {
            return cache.delete(e.request)
            .then(function() {
                cache.put(e.request, responseClone);
            });
        });
  
        return httpRes;
      })
      .catch(function(err) { // 无网络情况下从缓存中读取
        console.error(err,'errrr');
        return caches.match(e.request);
      })
    )
    /* e.respondWith(
        caches.match(e.request).then(function (response) {
            // 来来来，代理可以搞一些代理的事情

            // 如果 Service Worker 有自己的返回，就直接返回，减少一次 http 请求
            if (response) {
                return response;
            }

            // 如果 service worker 没有返回，那就得直接请求真实远程服务
            var request = e.request.clone(); // 把原始请求拷过来
            return fetch(request).then(function (httpRes) {

                // http请求的返回已被抓到，可以处置了。

                // 请求失败了，直接返回失败的结果就好了。。
                if (!httpRes || httpRes.status !== 200) {
                    return httpRes;
                }

                // 请求成功的话，将请求缓存起来。
                var responseClone = httpRes.clone();
                caches.open(cacheStorageKey).then(function (cache) {
                    cache.put(e.request, responseClone);
                });

                return httpRes;
            });
        })
    ); */
});
/* self.addEventListener('activate',function(e){
e.waitUntil(
    //获取所有cache名称
    caches.keys().then(cacheNames => {
    return Promise.all(
        // 获取所有不同于当前版本名称cache下的内容
        cacheNames.filter(cacheNames => {
        return cacheNames !== cacheStorageKey
        }).map(cacheNames => {
        return caches.delete(cacheNames)
        })
    )
    }).then(() => {
    return self.clients.claim(); //更新代码时，需要通知各个客户端
    })
)
}) */
// 如果当前浏览器没有激活的service worker或者已经激活的worker被解雇，
// 新的service worker进入active事件
self.addEventListener('activate', function(e) {
    console.log('Activate event');
    console.log('Promise all', Promise, Promise.all);
    // active事件中通常做一些过期资源释放的工作
    var cacheDeletePromises = caches.keys().then(cacheNames => {
      console.log('cacheNames', cacheNames, cacheNames.map);
      return Promise.all(cacheNames.map(name => {
        if (name !== cacheStorageKey) { // 如果资源的key与当前需要缓存的key不同则释放资源
          console.log('caches.delete', caches.delete);
          var deletePromise = caches.delete(name);
          console.log('cache delete result: ', deletePromise);
          return deletePromise;
        } else {
          return Promise.resolve();
        }
      }));
    });
    console.log('cacheDeletePromises: ', cacheDeletePromises);
    e.waitUntil(
      Promise.all([cacheDeletePromises]
      ).then(() => {
        console.log('activate event ' + cacheStorageKey);
        console.log('Clients claims.')
        return self.clients.claim();//在 activate 事件回调中执行该方法表示取得页面的控制权, 这样之后打开页面都会使用版本更新的缓存。旧的 Service Worker 脚本不再控制着页面，之后会被停止。
      })
    )
})

/**
 * 激活后( activated )：在这个状态会处理 activate 事件回调 (提供了更新缓存策略的机会)。并可以处理功能性的事件  fetch (请求)、       sync (后台同步)、push (推送)。

    废弃状态 ( redundant )：这个状态表示一个 Service Worker 的生命周期结束。
    *  废弃状态 ( redundant )：这个状态表示一个 Service Worker 的生命周期结束。
        这里特别说明一下，进入废弃 (redundant) 状态的原因可能为这几种：
        安装 (install) 失败
        激活 (activating) 失败
        新版本的 Service Worker 替换了它并成为激活状态
 */
/**
 * push 事件是为推送准备的。不过首先需要了解一下 Notification API 和 PUSH API。通过 PUSH API，当订阅了推送服务后，可以使用推送方    式唤醒 Service Worker 以响应来自系统消息传递服务的消息，即使用户已经关闭了页面。
 */
/* self.addEventListener('push', function(e) {

}); */