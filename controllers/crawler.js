var co = require('co');
var crawler = require('../crawler');
var HOME_URL = 'http://www.dytt8.net';


// 获取分类信息
function* category() {
  console.log("#...获取媒体分类");
  var items = yield crawler(HOME_URL, require('../crawler/parser/category'));
  var db = App.mongo.category;

  // 删除已经不存在的数据
  var categorys = yield db.find().get();
  items.forEach(function(i) {
    for (var j = 0; j < categorys.length; j++) {
      var c = categorys[j];
      if (c.title === i.title) {
        categorys.splice(j, 1);
        break;
      }
    }
  });
  for (var i in categorys) {
    yield db.remove(categorys[i]);
  }

  // 插入数据库
  for (var i in items) {
    var c = items[i];
    var old = yield db.findOne({
      title: c.title
    });
    if (old != null) {
      // 如果数据存在，更新
      old.title = c.title;
      old.url = c.url;
      yield db.updateById(old._id, old);
    } else {
      // 如果分类不存在,保存数据库
      yield db.insert(c);
    }
  }
  console.log("#插入分类数据完成! 总共:%s条", yield db.count());
}

// 获取媒体列表
function* media() {

  // 解析器
  var parser = require('../crawler/parser/media');
  // 数据库工具
  var mdb = App.mongo.media;
  var cdb = App.mongo.category;

  // 获取媒体列表的链接
  console.log("#...获取媒体列表的链接");
  var categorys = yield cdb.find().get();
  for (var i in categorys) {
    var c = categorys[i];
    if (c.list == null || c.list.length == 0) {
      c.list = yield crawler(c.url, parser.list);
      yield cdb.updateById(c._id, c);
    }
  }
  console.log("#...获取媒体列表的链接，完成");

  // 获取媒体详情的链接
  console.log("#...获取媒体详情的链接");
  var mldb = App.mongo.mlist;
  var medialist = [];
  for (var i in categorys) {
    var c = categorys[i];
    for (var j in c.list) {
      var url = c.list[j];
      // 没有记录就插入一条新纪录
      var mlist = yield mldb.findOne({url: url});
      if (mlist == null) {
        mlist = yield mldb.insert({url: url});
      }
      // 之前没有缓存列表，就查询
      if (mlist.list == null || mlist.length == 0) {
        mlist.list = yield crawler(url, parser.medias);
        yield mldb.updateById(mlist._id, mlist);
      }
      if (mlist.list) {
        mlist.list.forEach(function(i) {
          medialist.push({
            url: i,
            type: {
              _id: c._id,
              title: c.title
            }
          });
       });
      }
    }
  }
  console.log("#...获取媒体详情的链接完成！");


  // TODO 获取媒体的信息，查询数据库过于频繁，低效，待改进
  console.log("#...获取媒体的信息");
  for (var i in medialist) {
    var u = medialist[i];
    var info = yield mdb.findOne({url: u.url});
    // 数据不存在就插入数据
    if (info == null) { info = yield mdb.insert({url: u.url}); }
    // 未查询到详情就查询
    if (typeof info.info!="object" && typeof info.source!="object") {
      try {
        var result = yield crawler(u.url, parser.media);
        result._id = info._id;
        result.url = info.url;
        result.type = u.type;
        yield mdb.updateById(result._id, result);
        console.log("$...获取到电影:", result.top_title, '\n');
        console.log(result);
      } catch (e) {
        console.log("############### 解析出错");
        console.log(e);
      } finally {

      }
    }
  }
  console.log("#...获取媒体的信息，完成");


  console.log("#...获取媒体列表完成！总共%s条", medialist.length);
}

module.exports.crawlering = false;
module.exports.crawler = function() {
  // 异步执行爬虫任务
  co(function* () {
    if (module.exports.crawlering) { return; }
    module.exports.crawlering = true;
    // 获取分类信息
    yield category();
    // 获取媒体列表
    yield media();
  }).then(function (value) {
    module.exports.crawlering = false;
  }, function (err) {
    console.log("#...爬虫任务出错！");
    console.error(err.stack);
  });
}

module.exports.index = function*() {

  // 异步执行爬虫任务
  module.exports.crawler();

  this.redirect(this.request.header.referer);
}
