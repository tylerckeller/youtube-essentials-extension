(function() {
    'use strict';

    let style = document.createElement('style');
    style.textContent = `
        .modal-background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        .modal-content {
            background: white;
            padding: 1em;
            border-radius: 8px;
            width: 300px;
        }
        .modal-content button {
            margin: 0.5em;
        }
        .blocked-content {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            font-size: 2em;
            color: red;
        }
    `;
    document.head.appendChild(style);

    let prevURL = "";
    let currURL = window.location.href;
    let url = new URL(window.location.href);
    let videoId = url.searchParams.get('v');
    let cleanedUrl = `${url.origin}/watch?v=${videoId}`;

    let modalBackground = document.createElement('div');
    modalBackground.classList.add('modal-background');
    modalBackground.style.display = 'none';
    document.body.appendChild(modalBackground);

    let modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');
    modalBackground.appendChild(modalContent);

    let modalText = document.createElement('p');
    modalText.textContent = "Is this video educational or entertainment?";
    modalContent.appendChild(modalText);

    let btnEducational = document.createElement('button');
    btnEducational.textContent = "Educational";
    modalContent.appendChild(btnEducational);

    let btnEntertainment = document.createElement('button');
    btnEntertainment.textContent = "Entertainment";
    modalContent.appendChild(btnEntertainment);

    btnEducational.addEventListener('click', () => {
        saveData('Educational', false);
        modalBackground.style.display = 'none';
        chrome.storage.local.get(['unblockedVideos'], function(result) {
            let unblockedVideos = result.unblockedVideos || [];
            unblockedVideos.push(cleanedUrl);
            chrome.storage.local.set({ 'unblockedVideos': unblockedVideos }, function() {
            });
        });
    });

    btnEntertainment.addEventListener('click', () => {
        saveData('Entertainment', true);
        modalBackground.style.display = 'none';
        blockVideo();
    });

    setInterval(() => {
        let url = new URL(window.location.href);
        let videoId = url.searchParams.get('v');
        let cleanedUrl = `${url.origin}/watch?v=${videoId}`;
        currURL = cleanedUrl;
    
        if (currURL !== prevURL) {
            prevURL = currURL;
    
            chrome.storage.local.get('unblockedVideos', (result) => {
                let unblockedVideos = result.unblockedVideos || [];
    
                if (url.searchParams.has('v') && !unblockedVideos.includes(currURL)) {
                    setTimeout(() => {
                        modalBackground.style.display = 'flex';
                    }, 1000);
                }
            });
        }
    }, 1000);
    

    function saveData(videoType, blocked) {
        chrome.storage.local.get(['youtubeData'], function(result) {
            let data = result.youtubeData || [];
    
            let channelNameElement = document.querySelector("a.yt-simple-endpoint.style-scope.yt-formatted-string");
            let videoTitleElement = document.querySelector("yt-formatted-string.style-scope.ytd-watch-metadata");
            let videoLengthElement = document.querySelector("span.ytp-time-duration");
            let videoLength = videoLengthElement ? videoLengthElement.innerText : '';
            let channelName = channelNameElement ? channelNameElement.innerText : '';
            let videoTitle = videoTitleElement ? videoTitleElement.innerText : '';
    
            let url = new URL(window.location.href);
            let videoId = url.searchParams.get('v');
            let cleanedUrl = `${url.origin}/watch?v=${videoId}`; // This is the cleaned URL
    
            let newData = {
                timestamp: new Date().toISOString(),
                url: cleanedUrl,
                videoType: videoType,
                channelName: channelName,
                videoTitle: videoTitle,
                videoLength: videoLength,
                blocked: blocked
            };

            data.push(newData);
    
            chrome.storage.local.set({ 'youtubeData': data }, function() {
                if (chrome.runtime.error) {
                    console.log("Runtime error.");
                }
            });
        });
    }
    
    

    function blockVideo() {
        let player = document.querySelector('#movie_player');

        if (player) {
            player.innerHTML = '';
            let blockedContent = document.createElement('div');
            blockedContent.classList.add('blocked-content');
            blockedContent.textContent = "Then go read a book instead. ";
            player.appendChild(blockedContent);

            let btnUnblock = document.createElement('button');
            btnUnblock.textContent = "No, let me watch the video";
            blockedContent.appendChild(btnUnblock);

            btnUnblock.addEventListener('click', () => {
                // Add current URL to unblockedVideos in chrome local storage
                let url = new URL(window.location.href);
                let videoId = url.searchParams.get('v');
                let cleanedUrl = `${url.origin}/watch?v=${videoId}`; // This is the cleaned URL
            
                chrome.storage.local.get(['unblockedVideos'], function(result) {
                    let unblockedVideos = result.unblockedVideos || [];
                    unblockedVideos.push(cleanedUrl);
                    chrome.storage.local.set({ 'unblockedVideos': unblockedVideos }, function() {
                        // After unblockedVideos has been updated, update youtubeData
                        chrome.storage.local.get(['youtubeData'], function(result) {
                            let data = result.youtubeData || [];
                            for(let i = 0; i < data.length; i++) {
                                if(data[i].url === cleanedUrl) {
                                    data[i].blocked = false;
                                    break;
                                }
                            }
                            // Save the updated data
                            chrome.storage.local.set({ 'youtubeData': data }, function() {
                                // After youtubeData has been updated, reload the page
                                window.location.reload();
                            });
                        });
                    });
                });
            });
        }
    }
})();
