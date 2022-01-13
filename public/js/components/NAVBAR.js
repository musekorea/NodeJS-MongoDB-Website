const navBtn = document.querySelector('.fa-bars'); //hamburger
const navMenu = document.querySelector('.navbar__menu'); //menu
const avatarBtn = document.querySelector('#avatarButton'); //avatar
const popupProfile = document.querySelector('.popupProfile');
popupProfile.classList.add('hide');

let isShowing = false;

navBtn.addEventListener('click', (e) => {
  if (isShowing === false) {
    navMenu.style.display = `flex`;
  } else {
    navMenu.style.display = `none`;
  }
  isShowing = !isShowing;
});

avatarBtn.addEventListener('click', (e) => {
  console.log(e.target);
  if (e.target.className === `loginAvatarBtn`) {
    popupProfile.classList.toggle('hide');
  } else {
    return;
  }
});
