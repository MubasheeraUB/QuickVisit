// QuickVisit Auth Helper - shared across pages

function showAlert(message, type = 'error') {
  const alertEl = document.getElementById('alert');
  if (!alertEl) {
    alert(message);
    return;
  }
  alertEl.style.display = 'block';
  alertEl.className = type === 'success' ? 'alert alert-success' : 'alert alert-error';
  alertEl.textContent = message;
  setTimeout(() => { alertEl.style.display = 'none'; }, 5000);
}

function logout() {
  api.setToken(null);
  api.setUser(null);
  window.location.href = 'login.html';
}

function requireAuth(role = null) {
  const token = api.getToken();
  const user = api.getUser();

  if (!token || !user) {
    window.location.href = 'login.html';
    return false;
  }

  if (role && user.role !== role) {
    alert('Access denied. Required role: ' + role);
    window.location.href = 'index.html';
    return false;
  }

  return true;
}

function updateLoginLink() {
  const link = document.getElementById('loginLink');
  if (!link) return;
  const user = api.getUser();
  if (user) {
    link.textContent = user.name + ' (Logout)';
    link.onclick = (e) => { e.preventDefault(); logout(); };
  }
}

// Setup login/register form handlers
document.addEventListener('DOMContentLoaded', () => {
  updateLoginLink();

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const result = await api.auth.login(email, password);
        api.setToken(result.token);
        api.setUser(result.user);
        showAlert('Login successful! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = result.user.role === 'admin' ? 'admin.html' : 'tourist.html';
        }, 800);
      } catch (err) {
        showAlert(err.message);
      }
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        phone: document.getElementById('reg-phone').value,
        password: document.getElementById('reg-password').value
      };

      try {
        const result = await api.auth.register(data);
        api.setToken(result.token);
        api.setUser(result.user);
        showAlert('Account created! Redirecting...', 'success');
        setTimeout(() => { window.location.href = 'tourist.html'; }, 800);
      } catch (err) {
        showAlert(err.message);
      }
    });
  }
});
