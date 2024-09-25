document.addEventListener("DOMContentLoaded", function() {
    var elements = document.querySelectorAll("[w3-include-html]");
    var promises = Array.from(elements).map(function(element) {
        var file = element.getAttribute("w3-include-html");
        return fetch(file)
            .then(response => response.text())
            .then(data => {
                element.innerHTML = data;
                element.removeAttribute("w3-include-html");
            })
            .catch(error => console.error('Error loading component:', error));
    });

    Promise.all(promises).then(() => {
        document.dispatchEvent(new Event('html-included'));
    });
});