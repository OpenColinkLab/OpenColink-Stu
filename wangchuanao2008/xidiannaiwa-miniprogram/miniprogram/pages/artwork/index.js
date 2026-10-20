const { workById, filterWorks, contextOf, contextQuery, routeOptions } = require('../../services/catalog');
const { assetUrl } = require('../../utils/assets');
const { backOrHome } = require('../../utils/navigation');
Page({
  data: { work: null, missing: false, thumbnail: '', fullImage: '', imageLoaded: false, imageFailed: false, position: 0, total: 0 },
  onLoad(options) {
    const decoded = routeOptions(options);
    const work = workById(decoded.id);
    if (!work) { this.setData({ missing: true }); return; }
    this.context = contextOf(decoded);
    this.siblings = filterWorks(this.context);
    if (!this.siblings.some(item => item.id === work.id)) {
      this.context = contextOf({ gallery: work.gallery });
      this.siblings = filterWorks(this.context);
    }
    this.showWork(work.id);
  },
  showWork(id) {
    const index = this.siblings.findIndex(item => item.id === id);
    if (index < 0) return;
    const work = this.siblings[index];
    this.setData({ work, thumbnail: assetUrl(work.thumbnail), fullImage: assetUrl(work.image), imageLoaded: false, imageFailed: false, position: index + 1, total: this.siblings.length });
    wx.setNavigationBarTitle({ title: work.name });
  },
  imageReady(event) { if (event.currentTarget.dataset.id === this.data.work.id) this.setData({ imageLoaded: true, imageFailed: false }); },
  imageError(event) { if (event.currentTarget.dataset.id === this.data.work.id) this.setData({ imageLoaded: false, imageFailed: true }); },
  retryImage() {
    if (!this.data.work) return;
    const fullImage = assetUrl(this.data.work.image);
    this.setData({ fullImage: '', imageLoaded: false, imageFailed: false }, () => this.setData({ fullImage }));
  },
  previewImage() {
    if (!this.data.fullImage) return;
    wx.previewImage({ current: this.data.fullImage, urls: [this.data.fullImage], fail: () => wx.showToast({ title: '图片暂时无法打开，请重试', icon: 'none' }) });
  },
  changeWork(event) {
    if (!this.siblings || !this.siblings.length) return;
    const offset = Number(event.currentTarget.dataset.offset);
    if (offset !== 1 && offset !== -1) return;
    const index = (this.data.position - 1 + offset + this.siblings.length) % this.siblings.length;
    this.showWork(this.siblings[index].id);
    wx.pageScrollTo({ scrollTop: 0, duration: 150 });
  },
  back() { backOrHome('/pages/museum/index?' + contextQuery(this.context)); },
  shareInfo() {
    const work = this.data.work;
    if (!work) return { title: '奶蛙博物馆', path: '/pages/museum/index', imageUrl: '/assets/museum-cover.jpg' };
    return { title: work.name + ' · 奶蛙博物馆', path: '/pages/artwork/index?id=' + encodeURIComponent(work.id) + '&' + contextQuery(this.context), imageUrl: assetUrl(work.thumbnail) || '/assets/museum-cover.jpg' };
  },
  onShareAppMessage() { return this.shareInfo(); },
  onShareTimeline() { const info = this.shareInfo(); return { title: info.title, query: this.data.work ? info.path.split('?')[1] : '', imageUrl: info.imageUrl }; }
});
