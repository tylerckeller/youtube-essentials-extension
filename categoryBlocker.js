console.log("content_main.js loaded try8");

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "local") {
    console.log("------------------------RED ALERT------------------------");
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      if (key === "yrmPolicy" && oldValue !== newValue) {
        console.log("RELOAD");
        chrome.storage.sync.get(["data"], function (items) {
          categories = JSON.parse(items.data);
          console.log(categories);
        });
        location.reload();
      }
    }
  }
});

let categories = {};
// Read it using the storage API
chrome.storage.sync.get(["data"], function (items) {
  try {
    categories = JSON.parse(items.data);
  } catch {
    categories = { data: 15 }; // Used at inital bootup
  }
  modify_page();
});

let NewLength = 0;
let OldLength = 0;
async function modify_page() {
  let timer = setInterval(() => {
    const elements = document.querySelectorAll(".ytd-rich-grid-row");
    OldLength = elements.length;
    if (OldLength != 0) {
      clearInterval(timer);
      RemoveElements(elements);
    }
  }, 1000);
}

window.onscroll = function (e) {
  let elementsScroll = document.querySelectorAll(".ytd-rich-grid-row");
  NewLength = elementsScroll.length;
  if (NewLength > OldLength) {
    elementsScroll = [...elementsScroll];
    elementsScroll = elementsScroll.slice(OldLength);
    OldLength = NewLength;
    RemoveElements(elementsScroll);
  }
};

async function RemoveElements(elements) {
  let sum = Object.values(categories).reduce((partialSum, a) => partialSum + a, 0);
  elements.forEach((item) => {
    let firstChild = item.firstElementChild;
    if (firstChild.id == "content") {
      if (sum == 15) {
        console.log("All categories selected");
      } else if (sum == 0) {
        firstChild.style.display = "none";
      } else {
        let thumbnailElement = firstChild.querySelector("#thumbnail.yt-simple-endpoint.inline-block.style-scope.ytd-thumbnail");
        if (thumbnailElement) {
          let link = thumbnailElement.href;
          console.log(link);
          fetch(link)
            .then((response) => response.text())
            .then((text) => {
              let category = text.substring(
                text.search('"category"') + 12,
                text.search('"category"') + 15
              );
              if (!categories[category]) {
                firstChild.style.display = "none";
              }
              function getTitle(html) {
                var match = html.match(/"title":\s*{\s*"simpleText":\s*"([^"]*)"/);
                return match ? match[1] : null;
              }
  
              function getCategory(html) {
                var match = html.match(/"category":\s*"([^"]*)"/);
                return match ? match[1] : null;
              }
  
              var title = getTitle(text);
              var fullCategory = getCategory(text);
              console.log("Link", link, "\nTitle:", title, "\nShort Category: ", category, "\nFull Category: ", fullCategory, "\n Block Category: ", !categories[category]);
            })
            .catch((error) => console.log("Fetch error:", error));
        } else {
          console.log("Thumbnail element not found.");
        }
      }
    }
  });
}


function logc(fn = "notsent", data, data2 = "") {
  console.log(`[content_main.js] function:[${fn}] data:[${data}] [${data2}]`);
}
