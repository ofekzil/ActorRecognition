
// create handler for click event if recognize button
function onClickHandler() {
    chrome.tabs.query({active : true}, function(tabs) {
        const tab = tabs[0];
        const url = tab.url;
        console.log("Page url: " + url)
        if (url && url.includes("youtube.com")) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["./Extension/scripts.js"]
            });
        }
    });
}

// add onClick handler for recognize function
function addButtonListener() {
    let button = document.getElementById("recognizeButton");
    button.addEventListener("click", onClickHandler);
}

addButtonListener();