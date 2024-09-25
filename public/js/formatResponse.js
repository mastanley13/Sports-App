export function formatResponseText(responseText) {
    return responseText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
        .replace(/##(.*?)##/g, '<h3>$1</h3>') // Headers
        .replace(/###(.*?)###/g, '<h4>$1</h4>') // Sub-headers
        .replace(/####(.*?)####/g, '<h5>$1</h5>') // Sub-sub-headers
        .replace(/#(.*?)#/g, '<h2>$1</h2>') // Main headers
        .replace(/\n/g, '<br>'); // Line breaks
}