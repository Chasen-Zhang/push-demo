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

 可以参考这篇文章
（https://juejin.im/post/59d9b38ef265da064a0f72cc）