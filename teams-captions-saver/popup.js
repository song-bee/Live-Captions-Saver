document.addEventListener('DOMContentLoaded', function () {
    // Code inside this block will execute after the extension is fully loaded
    console.log('popup.js loaded!');   

    document.getElementById('saveButton').addEventListener('click', function () {
        console.log('save_captions clicked!');

        const captionFormat = document.getElementById('captionFormat').value;

        chrome.runtime.sendMessage({
            message: "save_captions",
            format: captionFormat
        });
    });

    document.getElementById('clearButton').addEventListener('click', function () {
        console.log('clear_captions clicked!');

        chrome.runtime.sendMessage({
            message: "clear_captions"
        });
    });
});
