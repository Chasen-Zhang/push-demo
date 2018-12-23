# push-demo
push-demo

注（很重要）：本示例代码可以在火狐中运行，但是在谷歌中仍然无反应，后来查找资料是因为国内访问被墙，需要翻墙。
翻墙之后，客户端可以订阅。但是服务器不能推送，原因应该也是网络原因，在google Chrome中当推送服务时，后台node服务会报这样的错误：

{ Error: connect ETIMEDOUT 216.58.200.234:443
    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1117:14)
  errno: 'ETIMEDOUT',
  code: 'ETIMEDOUT',
  syscall: 'connect',
  address: '216.58.200.234',
  port: 443 } 'error'

详情请参考：https://github.com/web-push-libs/web-push/issues/280以及https://www.cnblogs.com/hellohello/p/8441188.html。
谷歌走的是FCM模式。而火狐走的是不一样的。我们从浏览器生成的endpoint便可以知道。

谷歌的endpoint像这样：

https://fcm.googleapis.com/fcm/send/dgETprOAWaA:AP…X3DYH8MkmKn2pXWIbVJi5ABjlVNkiKARhih89-xFaGp4O6v76；

而火狐的类似这样：https://updates.push.services.mozilla.com/wpush/v2/gAAAAABcH1HEGZP1wcK8fzFx956YoVUpGtwMmN879K-RfLnLlwg6gWve9zl0mRWs-kBrzgbWZ9mC2yzqiu-0Uu5b1NH07jU8LUU1iOPD2hK6vqUmK_fjym0umm

可想而知实现方式不一样。至于看到很多通知消息在谷歌上也是可以的，为什么呢？也许国内的网站并没有通过FCM。个人之见！

国内有些APP使用小米的Push服务，有些使用百度的，还有些使用腾讯的信鸽等等，这些Push都需要在后台运行线程，并且不能休眠，
这就导致了手机在休眠状态时仍然有很多线程在运行着，使得手机耗电速度很快。最后还直接导致今年工信部出台要成立安卓统一推送联盟。
而苹果有一套统一的推送机制，大家把Push发给苹果的服务器，然后再由苹果下发给相应的苹果设备。Safari现在不支持Service Worker，
但是可以用Apple Push，缺点是这种推送苹果说不能用来发送重要的数据，并且目测只能弹框显示，没办法在后台处理消息而不弹框。
（https://juejin.im/post/59d9b38ef265da064a0f72cc）