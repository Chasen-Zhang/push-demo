
//监听push事件
self.addEventListener('push', function(event) {

    //如果用户没有允许推送授权，推送失败
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }

    var data = {};
    if (event.data) {
        data = event.data.json();
    }
    var title = data.title;
    var message = data.message;
    var icon = data.icon ||"img/timg.png";

    self.clickTarget = data.clickTarget;

    //通知展示详情。传入一个 Promise 为参数，等到该 Promise 为 resolve 状态为止。
    event.waitUntil(self.registration.showNotification(title, {
        body: message,
        tag: 'push-demo',
        icon: icon,
        badge: icon
    }));
});


//鼠标点击通知，打开网页。
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    if(clients.openWindow){
        event.waitUntil(clients.openWindow(self.clickTarget));
    }
});