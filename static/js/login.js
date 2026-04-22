const loginForm = document.querySelector('#login-form');
const authResponse = document.querySelector('#auth-response');

async function submitJson(formElement, url) {
    const payload = Object.fromEntries(new FormData(formElement).entries());
    const result = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    return result.json();
}

if (loginForm && authResponse) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const data = await submitJson(loginForm, '/auth/login');
        if (data.token && data.user) {
            localStorage.setItem('blogToken', data.token);
            localStorage.setItem('blogUser', JSON.stringify(data.user));
            authResponse.textContent = `Welcome, ${data.user.name || data.user.email}`;
            loginForm.reset();
            return;
        }
        authResponse.textContent = data.error || 'Login failed';
    });
}
