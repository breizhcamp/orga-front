(function (window) {
  window.env = window.env || {};
  window.envLoaded = new Promise(async (resolve, reject) => {
    try {
      const configUrl = '${CONFIG_BASE_URL}';

      const res = await fetch(configUrl + 'modules/config', {
        headers: {
          'X-Tenant-Host': location.host
        }
      });

      const config = await res.json()

      config.forEach(item => {
        window['env'][item.key] = item.value
      })

      resolve()
    } catch (e) {
      reject(e)
    }
  })

})(this);
