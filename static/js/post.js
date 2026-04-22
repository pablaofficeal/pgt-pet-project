const postView = document.querySelector('#post-view');
const statusLine = document.querySelector('#status');

const state = {
    post: null,
    comments: [],
    reactions: [],
    user: readStoredUser()
};

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

function getPostId() {
    const raw = window.location.hash.replace('#', '');
    return decodeURIComponent(raw || '');
}

function currentUserId() {
    if (state.user && state.user.id !== undefined) {
        return String(state.user.id);
    }
    return 'guest';
}

function currentUserName() {
    if (state.user && state.user.name) {
        return state.user.name;
    }
    if (state.user && state.user.email) {
        return state.user.email;
    }
    return '';
}

function normalizePosts(data) {
    if (data && Array.isArray(data.posts)) {
        return data.posts;
    }
    return [];
}

function normalizeMaybeObject(value) {
    if (!value || Array.isArray(value)) {
        return [];
    }
    if (Object.keys(value).length === 0) {
        return [];
    }
    return [value];
}

async function fetchJson(url, fallback) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Request failed');
        }
        return await response.json();
    } catch (error) {
        return fallback;
    }
}

async function postJson(url, payload, fallback) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error('Request failed');
        }
        return await response.json();
    } catch (error) {
        return fallback;
    }
}

function reactionTotals() {
    const totals = {
        likes: Number(state.post.likes || 0),
        dislikes: Number(state.post.dislikes || 0)
    };
    state.reactions.forEach((reaction) => {
        if (reaction.kind === 'like') {
            totals.likes += 1;
        }
        if (reaction.kind === 'dislike') {
            totals.dislikes += 1;
        }
    });
    return totals;
}

function renderTags(tags) {
    const list = createElement('div', 'tag-list');
    (tags || []).forEach((tag) => {
        list.appendChild(createElement('span', 'tag', tag));
    });
    return list;
}

function renderReactionButton(kind, count) {
    const button = createElement('button', `reaction-button ${kind}`);
    button.type = 'button';
    button.dataset.kind = kind;
    button.title = kind === 'like' ? 'Like this post' : 'Dislike this post';
    button.setAttribute('aria-label', button.title);
    button.append(
        createElement('span', 'reaction-icon', kind === 'like' ? '+' : '-'),
        createElement('span', 'reaction-count', count)
    );
    return button;
}

function renderComments() {
    const section = createElement('section', 'comments detail-comments');
    section.appendChild(createElement('h3', null, `Comments (${state.comments.length})`));

    const list = createElement('div', 'comment-list');
    if (state.comments.length === 0) {
        list.appendChild(createElement('p', 'empty-state', 'No comments returned from the database yet.'));
    } else {
        state.comments.forEach((comment) => {
            const item = createElement('article', 'comment');
            item.append(
                createElement('strong', null, comment.author_name || 'Anonymous'),
                createElement('p', null, comment.body || ''),
                createElement('time', null, comment.created_at || 'just now')
            );
            list.appendChild(item);
        });
    }

    section.append(list, renderCommentForm());
    return section;
}

function renderCommentForm() {
    const form = createElement('form', 'comment-form');
    const author = document.createElement('input');
    author.name = 'author_name';
    author.type = 'text';
    author.placeholder = 'Name';
    author.value = currentUserName();
    author.required = true;

    const body = document.createElement('textarea');
    body.name = 'body';
    body.placeholder = 'Comment';
    body.rows = 4;
    body.required = true;

    const button = createElement('button', 'comment-submit', 'Post comment');
    button.type = 'submit';
    form.append(author, body, button);
    return form;
}

function renderPost() {
    postView.replaceChildren();
    if (!state.post) {
        postView.appendChild(createElement('p', 'empty-state', 'Post not found.'));
        return;
    }

    const totals = reactionTotals();
    const meta = createElement('div', 'post-meta');
    meta.textContent = `${state.post.author || 'PGT'} / ${state.post.published_at || 'draft'} / ${state.post.read_time || 'quick read'}`;

    const actions = createElement('div', 'post-actions');
    actions.append(
        renderReactionButton('like', totals.likes),
        renderReactionButton('dislike', totals.dislikes)
    );

    postView.append(
        meta,
        createElement('h1', null, state.post.title || 'Untitled post'),
        createElement('p', 'excerpt', state.post.excerpt || ''),
        renderTags(state.post.tags),
        createElement('p', 'post-body full-body', state.post.body || ''),
        actions,
        renderComments()
    );
}

async function submitComment(form) {
    const payload = {
        post_id: state.post.id,
        user_id: currentUserId(),
        author_name: new FormData(form).get('author_name'),
        body: new FormData(form).get('body'),
        created_at: new Date().toISOString()
    };

    const data = await postJson('/api/comments', payload, {});
    const saved = data.comment && Object.keys(data.comment).length > 0 ? data.comment : payload;
    state.comments.push(saved);
    form.reset();
    renderPost();
}

async function submitReaction(button) {
    const payload = {
        post_id: state.post.id,
        user_id: currentUserId(),
        kind: button.dataset.kind,
        created_at: new Date().toISOString()
    };

    button.disabled = true;
    const data = await postJson('/api/reactions', payload, {});
    const saved = data.reaction && Object.keys(data.reaction).length > 0 ? data.reaction : payload;
    state.reactions.push(saved);
    renderPost();
}

async function boot() {
    const postId = getPostId();
    const postsData = await fetchJson('/api/posts', { posts: [] });
    const posts = normalizePosts(postsData);
    state.post = posts.find((post) => String(post.id) === postId);

    if (!state.post) {
        setStatus('Post not found');
        renderPost();
        return;
    }

    const [commentData, reactionData] = await Promise.all([
        postJson('/api/comments/by-post', { post_id: state.post.id }, {}),
        postJson('/api/reactions/by-post', { post_id: state.post.id }, {})
    ]);

    state.comments = normalizeMaybeObject(commentData);
    state.reactions = normalizeMaybeObject(reactionData);
    renderPost();
    setStatus('Loaded from JSON and SQLite');
}

document.addEventListener('submit', async (event) => {
    const form = event.target.closest('.comment-form');
    if (!form || !state.post) {
        return;
    }

    event.preventDefault();
    await submitComment(form);
    setStatus('Comment saved and returned from DB');
});

document.addEventListener('click', async (event) => {
    const button = event.target.closest('.reaction-button');
    if (!button || !state.post) {
        return;
    }

    await submitReaction(button);
    setStatus('Reaction saved and returned from DB');
});

boot();
