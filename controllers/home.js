// var redisStore = require('koa-redis');
var render = require('../lib/render');
var apiData = require('../api-data');

module.exports.index = function* () {
  var items = yield apiData.category();
  this.body = yield render('home', {
    'items': items
  });
};

module.exports.medias = function* (id) {
  var items = yield apiData.medias(id);
  this.body = yield render('medias', {
    'list': items
  });
}

module.exports.media = function* (id) {
  var info = yield apiData.media(id);
  this.body = yield render('media', {
    'info': info
  });
}

// 计算资源总数
module.exports.count = function* () {
  var items = yield App.mongo.mlist.find();
  var count = 0;
  items.forEach(function(i){
    if (i.list != null && i.list !== undefined && i.list.length) {
      count += i.list.length;
    }
  });

  this.body = "一共" + count + "个视频";
}

module.exports.search = function* () {
  var items = yield apiData.search(this.query.q);
  this.body = yield render('medias', {
    'list': items
  });
}
