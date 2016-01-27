// 获取指定分类下媒体列表

module.exports = function* (id, page, pageSize) {

  // 参数处理
  var db = App.mongo.media;
  var category = yield App.mongo.category.findById(id);
  if (id == null || category == null) { return []; }
  page = page || 1;
  pageSize = pageSize || 10;

  return yield db.find({
      "type._id":db.id(id)
    })
    .limit(pageSize)
    .skip( (pageSize * (page - 1)) )
    .sort( {date: -1} )
    .get();
};
