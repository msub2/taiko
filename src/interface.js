AFRAME.registerComponent('interface', {
  schema: {
    
  },

  init: function () {
    this.initInterface();
  },

  initInterface: async function () {
    const DEFAULT_API_SEARCH = 'https://api.chimu.moe/v1/search?status=1&offset=0&mode=1';
    const searchResults = await (await fetch(DEFAULT_API_SEARCH)).json();
    console.log(searchResults);
  },
  
  tick: function (time, timeDelta) {
    // Do something on every scene tick or frame.
  }
});
