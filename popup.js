document.getElementById('educational').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, { method: 'setVideoType', type: 'Educational' });
    });
});

document.getElementById('entertainment').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, { method: 'setVideoType', type: 'Entertainment' });
    });
});