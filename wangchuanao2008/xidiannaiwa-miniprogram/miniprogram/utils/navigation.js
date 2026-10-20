function backOrHome(fallback) {
  if (getCurrentPages().length > 1) wx.navigateBack({ delta: 1 });
  else wx.redirectTo({ url: fallback || '/pages/index/index' });
}
module.exports = { backOrHome };
