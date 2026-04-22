const postsGrid = document.querySelector('#posts-grid');
const statusLine = document.querySelector('#status');
const identityLine = document.querySelector('#identity');

function readStoredUser() {
    try {
        return JSON.parse(localStorage.getItem('blogUser') || 'null');
    } catch (error) {
        return null;
    }
}

function setStatus(message) {
    if (statusLine) {
        statusLine.textContent = message;
    }
}

function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    if (text !== undefined) {
        element.textContent = text;
    }
    return element;
}

function normalizePosts(data) {
    if (data && Array.isArray(data.posts)) {
        return data.posts;
    }
    return [];
}

async function loadPosts() {
    const response = await fetch('/api/posts');
    if (!response.ok) {
        throw new Error('Posts request failed');
    }
    return normalizePosts(await response.json());
}

function renderTags(tags) {
    const list = createElement('div', 'tag-list');
    (tags || []).forEach((tag) => {
        list.appendChild(createElement('span', 'tag', tag));
    });
    return list;
}

function renderPostPreview(post) {
    const card = createElement('article', 'post-card preview-card');
    const meta = createElement('div', 'post-meta');
    meta.textContent = `${post.author || 'PGT'} / ${post.published_at || 'draft'} / ${post.read_time || 'quick read'}`;

    const title = createElement('h2');
    const link = createElement('a', null, post.title || 'Untitled post');
    link.href = `/post#${encodeURIComponent(post.id)}`;
    title.appendChild(link);

    const counters = createElement('div', 'preview-stats');
    counters.append(
        createElement('span', null, `+ ${Number(post.likes || 0)}`),
        createElement('span', null, `- ${Number(post.dislikes || 0)}`)
    );

    const openLink = createElement('a', 'read-link', 'Read post');
    openLink.href = `/post#${encodeURIComponent(post.id)}`;

    card.append(
        meta,
        title,
        createElement('p', 'excerpt', post.excerpt || ''),
        renderTags(post.tags),
        counters,
        openLink
    );
    return card;
}

function renderPosts(posts) {
    postsGrid.replaceChildren();
    if (posts.length === 0) {
        postsGrid.appendChild(createElement('p', 'empty-state', 'No posts found.'));
        return;
    }
    posts.forEach((post) => {
        postsGrid.appendChild(renderPostPreview(post));
    });
}

async function boot() {
    const user = readStoredUser();
    if (identityLine) {
        identityLine.textContent = user && user.name ? user.name : 'Guest reader';
    }

    try {
        setStatus('Loading previews...');
        const posts = await loadPosts();
        renderPosts(posts);
        setStatus(`${posts.length} previews loaded`);
    } catch (error) {
        setStatus('Could not load posts');
        renderPosts([]);
    }
}

boot();
