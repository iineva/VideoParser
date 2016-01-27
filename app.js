'use strict';
var compress = require('koa-compress');
var serve = require('koa-static');
var route = require('koa-route');
var koa = require('koa');
var path = require('path');
var app = module.exports = koa();

// Logger
app.use(require('koa-logger')());
app.use(require('koa-validate')());

app.use(function* globalApp(next) {
  global.App = this;
  yield next;
})

// mongodb
app.use(require('./lib/mongo')(
  '192.168.99.100:27017/dytt',[
    "category", // 储存分类信息
    "mlist", // 储存媒体详情的链接
    "media", // 储存媒体信息
  ]
));

// router
var controllers = {
  crawler: require('./controllers/crawler'),
  home: require('./controllers/home'),
  api: require('./controllers/api'),
}
app.use(route.get('/', controllers.home.index));
app.use(route.get('/search', controllers.home.search));
app.use(route.get('/medias/:id', controllers.home.medias));
app.use(route.get('/media/:id', controllers.home.media));
app.use(route.get('/count', controllers.home.count));
app.use(route.post('/crawler', controllers.crawler.index));
// api
app.use(route.get('/api/category', controllers.api.category));
app.use(route.get('/api/medias', controllers.api.medias));
app.use(route.get('/api/media', controllers.api.media));
app.use(route.get('/api/search', controllers.api.search));


// Serve static files
app.use(serve(path.join(__dirname, 'public')));

// Compress
app.use(compress());

if (!module.parent) {
  var port = process.env.PORT || 3000;
  app.listen(port);
  console.log('listening on port %s', port);
}


// 创建爬虫定时任务
(function crawler() {
  try {
    if (typeof App == 'undefined') { return; }
    console.log("#...爬虫服务任务启动...");
    console.log("\
           *   \n\
         ,WW@    \n\
        WW  WW, \n\
, ,:@WW#     WWW+, ,,  \n\
:WWWW+          .@WWWW  \n\
:@                   W  \n\
:@     W       W     W  \n\
:@   W  W.@W@.W  @,  W  \n\
:@   W   W@ @W   W.  W  \n\
:@   W   WWWWW   W   W  \n\
:@   @W#W#.,.#W##W   W  \n\
:@    WW       WW    W  \n\
:@    @+       +@    W  \n\
:@   WW,       ,WW   W  \n\
:@  #W@:       .W+W  W  \n\
:@  W @@       @W W  W  \n\
,W  W WW       WW W  W  \n\
 W  . WW       W@+, :W  \n\
 W   .W@#     #@:@  W,  \n\
 @#   W W     W @*  W   \n\
  W   W :W   W: W  W*   \n\
  +W  W  +WWW*  W :W    \n\
   WW            .W     \n\
    @W          WW      \n\
    ,WW:     WW@       \n\
       WWWWWW:         \n");
    controllers.crawler.crawler();
  } catch (e) {
    console.log("#...爬虫服务任务出错！", e);
  } finally {
    setTimeout(function () {
      if (!controllers.crawler.crawlering) { crawler(); }
    }, 6 * 1000);
  }
})//()
