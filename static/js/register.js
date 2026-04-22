const registerForm = document.querySelector('#register-form');
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

if (registerForm && authResponse) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const data = await submitJson(registerForm, '/auth/register');
        if (data.status === 'registered') {
            authResponse.textContent = `Registered ${data.email}`;
            registerForm.reset();
            return;
        }
        authResponse.textContent = data.error || 'Registration failed';
    });
}
