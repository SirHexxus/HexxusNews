// Placeholder for your n8n API URL
const N8N_API_URL = "https://automation.sirhexx.com/webhook/0cd8e4b1-4ce1-4e57-adbf-d49b50dd44c0"; 

// Local Storage Keys
const THEME_KEY = 'theme';
const CACHE_KEY = 'newsCache';

const newsContainer = document.querySelector('.news-container');
const themeToggle = document.getElementById('checkbox');

// Function to set the theme based on local storage
function setTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    themeToggle.checked = savedTheme === 'light';
}

// Event listener for the theme toggle
themeToggle.addEventListener('change', () => {
    const newTheme = themeToggle.checked ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
});

// Function to render news cards
function renderNews(articles) {
    if (!articles || articles.length === 0) {
        newsContainer.innerHTML = '<p>No news articles found.</p>';
        return;
    }

    newsContainer.innerHTML = ''; // Clear loading message
    articles.forEach(article => {
        const card = document.createElement('div');
        card.className = 'news-card';

        // Format the publication date
        const pubDate = article.PubDate ? new Date(article.PubDate).toLocaleDateString() : 'Date unavailable';

        card.innerHTML = `
            <div class="card-header">
                <h2 class="card-title">${article.Title || 'No Title'}</h2>
                <span class="feed-flag">${article.feed || 'Source'}</span>
            </div>
            <p class="card-summary">${article.Summary || 'No summary available.'}</p>
            <p class="card-date">Published: ${pubDate}</p>
            <a href="${article.Link}" target="_blank" class="card-link">Read More</a>
        `;
        newsContainer.appendChild(card);
    });
}

// Function to fetch and cache data
async function fetchAndCacheNews() {
    const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY));
    const now = new Date().getTime();

    // Check if cached data is still fresh (less than 12 hours old)
    if (cachedData && (now - cachedData.timestamp < 12 * 60 * 60 * 1000)) {
        console.log("Using cached data.");
        renderNews(cachedData.articles);
        return;
    }

    // If no cache or cache is stale, fetch new data
    console.log("Fetching new data from N8N.");
    try {
        const response = await fetch(N8N_API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Assuming the n8n workflow returns an array of objects
        if (Array.isArray(data)) {
            const freshData = {
                articles: data,
                timestamp: new Date().getTime()
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
            renderNews(data);
        } else {
            console.error("Fetched data is not an array:", data);
            newsContainer.innerHTML = '<p>Error: Data format from API is incorrect.</p>';
        }
    } catch (error) {
        console.error("Failed to fetch news:", error);
        newsContainer.innerHTML = '<p>Failed to load news. Please try again later.</p>';
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    setTheme();
    fetchAndCacheNews();
    document.getElementById('copyright-year').textContent = new Date().getFullYear();
});
