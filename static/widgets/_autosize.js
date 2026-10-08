// Each widget reports its height to the page that frames it.
(function () {
  function send() {
    var h = Math.max(
      document.documentElement.scrollHeight,
      document.body ? document.body.scrollHeight : 0
    );
    parent.postMessage({ type: 'widget-height', height: h + 24 }, '*');
  }
  window.addEventListener('load', send);
  window.addEventListener('resize', send);
  if (window.ResizeObserver) new ResizeObserver(send).observe(document.documentElement);
  setInterval(send, 1000);
})();
