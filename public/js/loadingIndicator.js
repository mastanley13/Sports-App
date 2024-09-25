const loadingIndicator = document.getElementById('loadingIndicator');

export function showLoading() {
    loadingIndicator.style.display = 'block';
}

export function hideLoading() {
    loadingIndicator.style.display = 'none';
}

// Test exports
console.log('showLoading:', typeof showLoading);
console.log('hideLoading:', typeof hideLoading);
