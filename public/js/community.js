const prePageBtn = document.querySelector('#prePageBtn');
const nextPageBtn = document.querySelector('#nextPageBtn');
const pagination = document.querySelector('.pagiNation');
const totalPage = Number(pagination.dataset.totalpage);
const pageLIs = document.querySelectorAll('.pageLI');
const sortNewBtn = document.querySelector('#sortNewBtn');
const sortPopularBtn = document.querySelector('#sortPopularBtn');

let currentPage;

const refreshCurrentPage = () => {
  currentPage = window.location.href.split('/');
  currentPage = Number(currentPage[currentPage.length - 1]);
  return Number(currentPage);
};

const handlePrePage = async (e) => {
  if (refreshCurrentPage() === 1) {
    return;
  }
  try {
    const prePageFetch = await fetch(`/community/community/${currentPage - 1}`);
    if (prePageFetch.status === 200) {
      window.location.replace(`/community/community/${currentPage - 1}`);
    }
  } catch (error) {
    console.log(error);
  }
};
const handleNextPage = async (e) => {
  if (refreshCurrentPage() === totalPage) {
    return;
  }
  try {
    const prePageFetch = await fetch(`/community/community/${currentPage + 1}`);
    if (prePageFetch.status === 200) {
      window.location.replace(`/community/community/${currentPage + 1}`);
    }
  } catch (error) {
    console.log(error);
  }
};
let newSortState = null;
let popularSortState = null;

const handleSortNew = async (e) => {
  e.preventDefault();
  popularSortState = null;
  console.log(newSortState);
  let newSortFetch;
  try {
    if (newSortState === true) {
      newSortFetch = await fetch(`/community/sort/${currentPage}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'new' }),
      });
      newSortState = false;
    } else if (newSortState === false) {
      newSortFetch = await fetch(`/community/sort/${currentPage}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'old' }),
      });
      newSortState = true;
    } else if (newSortState === null) {
      newSortFetch = await fetch(`/community/sort/1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'new' }),
      });
      newSortState = false;
    }
  } catch (error) {
    console.log(error);
  }
};

const handleSortPopular = async (e) => {
  e.preventDefault();
  newSortState = null;
  console.log(popularSortState);
  let popularSortFetch;
  try {
    if (popularSortState === true) {
      popularSortFetch = await fetch(`/community/sort/${currentPage}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'popular' }),
      });
      popularSortState = false;
    } else if (popularSortState === false) {
      popularSortFetch = await fetch(`/community/sort/${currentPage}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'unPopular' }),
      });
      popularSortState = true;
    } else if (popularSortState === null) {
      popularSortFetch = await fetch(`/community/sort/1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'popular' }),
      });
      popularSortState = false;
    }
  } catch (error) {
    {
    }
    console.log(error);
  }
};

prePageBtn.addEventListener('click', handlePrePage);
nextPageBtn.addEventListener('click', handleNextPage);
sortNewBtn.addEventListener('click', handleSortNew);
sortPopularBtn.addEventListener('click', handleSortPopular);

const init = () => {
  refreshCurrentPage();
  if (currentPage === 1) {
    prePageBtn.style.backgroundColor = 'gray';
    prePageBtn.style.cursor = 'not-allowed';
  } else {
    prePageBtn.style.backgroundColor = 'lightblue';
    prePageBtn.style.cursor = 'pointer';
  }
  if (currentPage === totalPage) {
    nextPageBtn.style.backgroundColor = 'gray';
    nextPageBtn.style.cursor = 'not-allowed';
  } else {
    nextPageBtn.style.backgroundColor = 'lightblue';
    nextPageBtn.style.cursor = 'pointer';
  }
  pageLIs.forEach((li, index) => {
    if (currentPage === index + 1) {
      li.style.backgroundColor = 'red';
    }
  });
};

init();
