const avatarInput = document.querySelector('#avatar');

avatarInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onload = (e) => {
    document.querySelector('#avatarImage').src = reader.result;
  };
});
