document.getElementById('downloadData').addEventListener('click', () => {
    chrome.storage.local.get(['youtubeData', 'unblockedVideos'], (result) => {
        let dataStr = JSON.stringify(result, null, 4);
        let blob = new Blob([dataStr], { type: 'text/json' });
        let url = URL.createObjectURL(blob);
        
        let link = document.createElement('a');
        link.href = url;
        link.download = 'data.json';
        link.click();
    });
});

document.getElementById('clearData').addEventListener('click', () => {
    chrome.storage.local.clear(() => {
        console.log('Data has been cleared.');
    });
});
