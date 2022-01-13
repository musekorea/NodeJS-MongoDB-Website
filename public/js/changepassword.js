const form = document.querySelector('form');
const newPassword1 = document.querySelector('#newPassword1');
const newPassword2 = document.querySelector('#newPassword2');
const currentPassword = document.querySelector('#currentPassword');
const handleSubmit = async (e) => {
  e.preventDefault();
  if (newPassword1.value !== newPassword2.value) {
    document.querySelector('#error').innerHTML = 'Password Error';
    return;
  }
  const passwordFetch = await fetch('/user/changePassword', {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({
      newPassword: newPassword1.value,
      currentPassword: !currentPassword ? '' : currentPassword.value,
    }),
  });
  if (passwordFetch.status === 400) {
    return window.location.replace('/user/changePassword');
  }
  if (passwordFetch.status === 200) {
    return window.location.replace(`/user/profile/${form.dataset.nickname}`);
  }
};

form.addEventListener('submit', handleSubmit);
