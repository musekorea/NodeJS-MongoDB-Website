const form = document.querySelector('form');
const titleInput = document.querySelector('input');
const contentInput = document.querySelector('textarea');
const deleteBtn = document.querySelector('#deleteBtn');

const handleEdit = async (e) => {
  e.preventDefault();
  console.log(e);
  try {
    const title = titleInput.value;
    const content = contentInput.value;
    const postID = form.dataset.id;
    const editFetch = await fetch(`/community/article/${postID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        content,
      }),
    });
    if (editFetch.status === 200) {
      return window.location.replace(`/community/article/${postID}`);
    }
  } catch (error) {
    console.log(error);
  }
};

const handleDelete = async (e) => {
  e.preventDefault();
  const articleID = form.dataset.id;
  try {
    const deleteFetch = await fetch(`/community/article/${articleID}`, {
      method: 'DELETE',
    });
    if (deleteFetch.status === 200) {
      return window.location.replace('/community/community/1');
    }
  } catch (error) {
    console.log(error);
  }
};

deleteBtn.addEventListener('click', handleDelete);

form.addEventListener('submit', handleEdit);
