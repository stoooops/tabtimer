console.log("Content script loaded.");

chrome.runtime.sendMessage({ message: "Hello from content script!" }, function (response) {
    if (response && response.message) {
        console.log(response.message);
    } else {
        console.log("No response received.");
    }
});
