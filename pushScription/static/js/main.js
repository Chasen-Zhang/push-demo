var url = 'http://127.0.0.1:8081/subscribe';

/* var applicationServerPublicKey = 'BPeXvOlLmOPXjYKOz03cFnQNnj25PHS9YVZn9vwJGCT1YRYNn2FJBjpDPvhPooTHdBezqIS_-bAEBQn6vn2nep8'; */


//服务端公钥，标示服务端。
var applicationServerPublicKey = 'BNqEGEvl9Eh6v5v0UY2DCQXz8MRb9kHQWFDvsVOsBjT7BLhkdm3m-vawW_kS2Kzqch7y1A8oNu18oPzbtsCLsAU';

var serviceWorkerName = 'sw.js';

var isSubscribed = false;
var swRegistration = null;

$(document).ready(function () {
    $('#btnPushNotifications').click(function (event) {
        if(isSubscribed){
            console.log("取消订阅");
            unsubscribe();
        }else{
            subscribe();
        }
    });
    
    //获取授权
    Notification.requestPermission().then(function (status) {
        if (status === 'denied') {
            console.log('用户拒接授权');
            disableAndSetBtnMessage('用户拒接授权');
        } else if (status === 'granted') {
            console.log('注册SW');
            initialiseServiceWorker();
        }
    });
});

function initialiseServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register(serviceWorkerName).then(handleSWRegistration);
    } else {
        console.log('你的浏览器不支持serviceWorker');
        disableAndSetBtnMessage('你的浏览器不支持serviceWorker');
    }
};

//注册相关
function handleSWRegistration(reg) {
    if(reg.active){
        console.log('serviceWorker 已经可以使用');
    }
    swRegistration = reg;
    initialiseState(reg);
}
//初始化状态
function initialiseState(reg) {
    //是否支持showNotification
    if (!(reg.showNotification)) {
        console.log('不支持showNotification');
        disableAndSetBtnMessage('不支持showNotification');
        return;
    }

    //是否支持PushManager
    if (!('PushManager' in window)) {
        console.log('不支持PushManager');
        disableAndSetBtnMessage('不支持PushManager');
        return;
    }

    //获取推送订阅对象
    navigator.serviceWorker.ready.then(function (reg) {
        //是否已经有推送订阅对象了。getSubscription获取推送订阅对象
        reg.pushManager.getSubscription()
            .then(function (subscription) {
                if (!subscription) {
                    console.log(subscription,'getSubscription');
                    console.log('尚未订阅推送服务');

                    isSubscribed = false;
                    makeButtonSubscribable();
                } else {
                    //已经有订阅对象了
                    isSubscribed = true;
                    makeButtonUnsubscribable();
                }
            })
            .catch(function (err) {
                console.log('错误', err);
            });
    });
}

//前端点击订阅信息
function subscribe() {
    navigator.serviceWorker.ready.then(function (reg) {
        var subscribeParams = {userVisibleOnly: true};
        
        //转换成Uint8Array
        var applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
        subscribeParams.applicationServerKey = applicationServerKey;
        console.log(applicationServerKey,'applicationServerKey',reg.pushManager,subscribeParams);
        reg.pushManager.subscribe(subscribeParams)//订阅推送服务；
            .then(function (subscription) {
                console.log(subscription,'subscription，订阅信息');
                //加密，以及如何从浏览器中的推送订阅中检索公钥和共享秘密
                var endpoint = subscription.endpoint;
                var key = subscription.getKey('p256dh');
                var auth = subscription.getKey('auth');
                //将订阅信息发送到服务器。
                sendSubscriptionToServer(endpoint, key, auth);
                isSubscribed = true;
                makeButtonUnsubscribable();
            })
            .catch(function (e) {
                console.log('出问题了', e);
            });
        console.log('发生了什么01?');

    });
    console.log('发生了什么02?');
}


//点击取消订阅
function unsubscribe() {
    var endpoint = null;
    swRegistration.pushManager.getSubscription()
        .then(function(subscription) {
            if (subscription) {
                endpoint = subscription.endpoint;
                return subscription.unsubscribe();
            }
        })
        .catch(function(error) {
            console.log('出错', error);
        })
        .then(function() {
            //请求服务器
            removeSubscriptionFromServer(endpoint);
            console.log('已经从订阅信息中移除！');
            isSubscribed = false;
            makeButtonSubscribable(endpoint);
        });
}

//把订阅信息发送到服务器。
function sendSubscriptionToServer(endpoint, key, auth) {
    //将字节码转成base64；
    var encodedKey = btoa(String.fromCharCode.apply(null, new Uint8Array(key)));
    var encodedAuth = btoa(String.fromCharCode.apply(null, new Uint8Array(auth)));
    $.ajax({
        type: 'POST',
        url: url,
        data: {publicKey: encodedKey, auth: encodedAuth, notificationEndPoint: endpoint},
        success: function (response) {
            console.log('发送成功。' + JSON.stringify(response));
        },
        dataType: 'json'
    });
}


//通知服务器服务器取消订阅。
function removeSubscriptionFromServer(endpoint) {
    $.ajax({
        type: 'POST',
        url: '/unsubscribe',
        data: {notificationEndPoint: endpoint},
        success: function (response) {
            console.log('取消订阅成功' + JSON.stringify(response));
        },
        dataType: 'json'
    });
}


//装换成Uint8Array格式。
function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}




//ui相关直接无视。。。。

function disableAndSetBtnMessage(message) {
    setBtnMessage(message);
    $('#btnPushNotifications').attr('disabled','disabled');
}

function enableAndSetBtnMessage(message) {
    setBtnMessage(message);
    $('#btnPushNotifications').removeAttr('disabled');
}

function makeButtonSubscribable() {
    enableAndSetBtnMessage('订阅推送通知');
    $('#btnPushNotifications').addClass('btn-primary').removeClass('btn-danger');
}

function makeButtonUnsubscribable() {
    enableAndSetBtnMessage('取消订阅推送通知');
    $('#btnPushNotifications').addClass('btn-danger').removeClass('btn-primary');
}

function setBtnMessage(message) {
    $('#btnPushNotifications').text(message);
}





