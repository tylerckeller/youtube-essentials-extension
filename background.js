chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.method === 'saveData') {
        let data = request.data;

        chrome.storage.local.get('youtubeData', result => {
            let youtubeData = result.youtubeData || [];
            youtubeData.push(data);

            chrome.storage.local.set({ 'youtubeData': youtubeData });
        });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.method === 'saveUnblockedVideo') {
        let data = request.data;

        chrome.storage.local.get('unblockedVideos', result => {
            let unblockedVideos = result.unblockedVideos || [];
            unblockedVideos.push(data);

            chrome.storage.local.set({ 'unblockedVideos': unblockedVideos });
        });
    }
});