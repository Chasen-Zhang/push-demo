let express = require("express");
let webPush = require("web-push");
//let atob = require('atob');
let bodyParser = require('body-parser');
let util = require('util');

let app = express();

//订阅者数组
let subscribers = [];
//主题：一般是联系方式或者邮件地址
let VAPID_SUBJECT = 'mailto:787025321@qq.com';

//./node_modules/.bin/web-push generate-vapid-keys  生成
let VAPID_PUBLIC_KEY = 'BNqEGEvl9Eh6v5v0UY2DCQXz8MRb9kHQWFDvsVOsBjT7BLhkdm3m-vawW_kS2Kzqch7y1A8oNu18oPzbtsCLsAU';
let VAPID_PRIVATE_KEY = 'XCmsRfmKRg2Z5MexDCAUlXShxrWgkIozveWl33qcPHY';

//进一步的安全验证，相当于加盐的效果。
let AUTH_SECRET = 'test';



if (!VAPID_SUBJECT) {
    return console.error('请设置主题');
} else if (!VAPID_PUBLIC_KEY) {
    return console.error('私钥没找到')
} else if (!VAPID_PRIVATE_KEY) {
    return console.error('公钥没找到')
} else if (!AUTH_SECRET) {
    return console.error('AUTH_SECRET没找到。')
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//调用setVapidDetails为 web-push 设置生成的公私钥
webPush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

//静态文件
app.use(express.static('static'));

//群发推送  forEach
app.get('/notify/all', function (req, res) {
    if(req.get('auth-secret') != AUTH_SECRET) {
        console.log("错误的授权");
        return res.sendStatus(401);
    }
    
    let message = req.query.message || `default`;
    let clickTarget = req.query.clickTarget || `default`;
    let title = req.query.title || `default`;
    let icon = req.query.icon || `default`;

    subscribers.forEach(pushSubscription => {
        
        //载荷 前端弹框的显示相关的信息，传你所传。跟后台管理页面相结合
        let payload = JSON.stringify({message : message, clickTarget: clickTarget, title: title,icon:icon});
        console.log(pushSubscription, '-发送到客户端pushSubscription');
        webPush.sendNotification(pushSubscription, payload).then((response) => { /* , {} */
          console.log('成功！');
          console.log("Status : "+util.inspect(response.statusCode));
          console.log("Headers : "+JSON.stringify(response.headers));
          console.log("Body : "+JSON.stringify(response.body));
        }).catch((error) =>{
          console.log(error,'error');
          // 判断状态码，440和410表示失效
          // if (err.statusCode === 410 || err.statusCode === 404) {
          //   return util.remove(subscription);
          // } else {
          //   console.log(subscription);
          //   console.log(err);
          // }
          console.log('失败！');
          console.log("Status : "+util.inspect(error.statusCode));
          console.log("Headers : "+JSON.stringify(error.headers));
          console.log("Body : "+JSON.stringify(error.body));
        });
    });

    res.send('服务已经推送');
});


//订阅接口
app.post('/subscribe', function (req, res) {
    let endpoint = req.body['notificationEndPoint'];
    let publicKey = req.body['publicKey'];
    let auth = req.body['auth'];
    
    //拿到端点信息
    let pushSubscription = {
        endpoint: endpoint,
        keys: {
            p256dh: publicKey,
            auth: auth
        }
    };

    //存储到内存数组，实际场景中应该是存到数据库。
    subscribers.push(pushSubscription);
    console.log(subscribers, '-----subscribers=--');
    res.send('接受订阅');
});

//取消订阅
app.post('/unsubscribe', function (req, res) {
    //获取取消订阅的端点信息
    let endpoint = req.body['notificationEndPoint'];

    //冲数据库中删除订阅者信息。
    subscribers = subscribers.filter(subscriber => { endpoint == subscriber.endpoint });

    res.send('订阅移除！');
});

//开启服务
let PORT = process.env.PORT || 8081;
app.listen(PORT, function () {
    console.log(`开启服务，监听端口 ${PORT}!`)
});
