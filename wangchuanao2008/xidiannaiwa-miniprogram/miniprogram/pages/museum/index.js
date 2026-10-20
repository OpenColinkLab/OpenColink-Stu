const { catalog, contextOf, pageOf, eraOptions, contextQuery, routeOptions } = require('../../services/catalog');
const { assetUrl } = require('../../utils/assets');
const { backOrHome } = require('../../utils/navigation');
Page({
  data: { galleries: catalog.galleries.map(item => ({ id: item.id, name: item.name, count: item.count })), totalWorks: catalog.works.length, totalEras: Object.keys(catalog.era_labels).length, gallery: 'main', era: 'all', query: '', eras: [], eraIndex: 0, works: [], total: 0, page: 1, pages: 1, galleryName: '', eraName: '全部展厅' },
  onLoad(options) { const decoded = routeOptions(options); this.setData(contextOf(decoded)); this.refresh(decoded.page); },
  refresh(page) {
    const context = contextOf(this.data);
    const eras = eraOptions(context.gallery);
    const result = pageOf(context, page || 1);
    this.renderedContext = context;
    this.setData(Object.assign({}, context, result, {
      works: result.works.map(work => ({ id: work.id, name: work.name, era_name: work.era_name, year: work.year, thumbnail: assetUrl(work.thumbnail) })),
      eras, eraIndex: eras.findIndex(item => item.id === context.era),
      galleryName: catalog.galleries.find(item => item.id === context.gallery).name,
      eraName: eras.find(item => item.id === context.era).name
    }));
  },
  changeGallery(event) {
    this.cancelSearch();
    this.setData({ gallery: event.currentTarget.dataset.gallery, era: 'all', query: '' });
    this.refresh(1);
  },
  changeEra(event) {
    this.cancelSearch();
    const era = this.data.eras[Number(event.detail.value)];
    if (!era) return;
    this.setData({ era: era.id }); this.refresh(1);
  },
  onSearch(event) {
    this.setData({ query: String(event.detail.value || '').slice(0, 100) });
    this.cancelSearch();
    this.searchTimer = setTimeout(() => { this.searchTimer = null; this.refresh(1); }, 180);
  },
  confirmSearch() { this.cancelSearch(); this.refresh(1); },
  clearSearch() { this.cancelSearch(); this.setData({ query: '' }); this.refresh(1); },
  cancelSearch() { if (this.searchTimer) clearTimeout(this.searchTimer); this.searchTimer = null; },
  changePage(event) {
    this.cancelSearch();
    const offset = Number(event.currentTarget.dataset.offset);
    if (offset !== 1 && offset !== -1) return;
    this.refresh(this.data.page + offset);
    wx.pageScrollTo({ selector: '#museum-browse', duration: 200 });
  },
  openWork(event) {
    // 使用最后一次实际渲染的上下文，避免输入防抖期间卡片与查询不一致。
    this.cancelSearch();
    if (this.renderedContext) this.setData(this.renderedContext);
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/artwork/index?id=' + encodeURIComponent(id) + '&' + contextQuery(this.renderedContext || this.data) });
  },
  back() { backOrHome(); },
  onHide() { if (this.searchTimer) this.confirmSearch(); },
  onUnload() { this.cancelSearch(); },
  onShareAppMessage() { return { title: '奶蛙博物馆 · ' + this.data.galleryName, path: '/pages/museum/index?' + contextQuery(this.data) + '&page=' + this.data.page, imageUrl: '/assets/museum-cover.jpg' }; },
  onShareTimeline() { return { title: '奶蛙博物馆', query: contextQuery(this.data) + '&page=' + this.data.page, imageUrl: '/assets/museum-cover.jpg' }; }
});
