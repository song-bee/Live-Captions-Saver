const transcriptArray = [];
let capturing = false;
let observer = null;

function checkCaptions() {
    // Teams v2 
    const closedCaptionsContainer = document.querySelector("[data-tid='closed-captions-renderer']")
    if (!closedCaptionsContainer) {
        // "Please, click 'More' > 'Language and speech' > 'Turn on life captions'"
        return;
    }
    const transcripts = closedCaptionsContainer.querySelectorAll('.fui-ChatMessageCompact');

    transcripts.forEach(transcript => {
        const avatarContainer = transcript.querySelector('[data-lpc-hover-target-id], [data-tid]');
        const ID = avatarContainer?.getAttribute('data-lpc-hover-target-id')
            || avatarContainer?.getAttribute('data-tid')
            || transcript.id;

        const authorEl = transcript.querySelector('.fui-ChatMessageCompact__author');
        const textEl = transcript.querySelector('[data-tid="closed-caption-text"]');

        if (transcript.querySelector('.fui-ChatMessageCompact__author') != null) {

            const Name = authorEl.innerText.trim();
            const Text = textEl.innerText.trim();
            const Time = new Date().toLocaleTimeString();

            const index = transcriptArray.findIndex(t => t.ID === ID);

            if (index > -1) {
                if (transcriptArray[index].Text !== Text) {
                    transcriptArray[index] = { Name, Text, Time, ID };
                    console.log(
                        `%c📝 Updated #%d\n%cText: %s\n%cUser: %s\n%cTime: %s\n%cID: %s`,
                        "color: orange; font-weight: bold;",
                        index + 1,
                        "color: #00bcd4;", Text,
                        "color: #4caf50;", Name,
                        "color: #9c27b0;", Time,
                        "color: gray;", ID
                    );
                }
            } else {
                transcriptArray.push({ Name, Text, Time, ID });
                console.log(
                    `%c🆕 New Entry #%d\n%cText: %s\n%cUser: %s\n%cTime: %s\n%cID: %s`,
                    "color: green; font-weight: bold;",
                    transcriptArray.length,
                    "color: #00bcd4;", Text,
                    "color: #4caf50;", Name,
                    "color: #9c27b0;", Time,
                    "color: gray;", ID
                );
            }

        }

    });
}

// run startTranscription every 5 seconds
// cancel the interval if capturing is true
function startTranscription() {
    const meetingDurationElement = document.getElementById("call-duration-custom");
    if (meetingDurationElement) {

    } else {
        setTimeout(startTranscription, 5000);
        return false;
    }

    const closedCaptionsContainer = document.querySelector("[data-tid='closed-captions-renderer']")
    if (!closedCaptionsContainer) {
        console.log("Please, click 'More' > 'Language and speech' > 'Turn on life captions'");
        setTimeout(startTranscription, 5000);
        return false;
    }

    capturing = true;
    observer = new MutationObserver(checkCaptions);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    return true;
}

startTranscription();

// Listen for messages from the service_worker.js script.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.message) {  // message from service_worker.js      
        case 'return_transcript': // message from service_worker.js
            console.log("response:", transcriptArray.length);
            if (!capturing) {
                alert("Oops! No captions were captured. Please, try again.");
                return;
            }

            let meetingTitle = document.title.replace("__Microsoft_Teams", '').replace(/[^a-z0-9 ]/gi, '');
            chrome.runtime.sendMessage({
                message: "download_captions",
                transcriptArray: transcriptArray,
                meetingTitle: meetingTitle,
                format: request.format
            });


        default:
            break;
    }

});

console.log("content_script.js is running");
