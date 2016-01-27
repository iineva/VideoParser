// 获取指定分类下媒体列表

module.exports = function* (id, page, pageSize) {
  return yield App.mongo.media.findById(id);
};
