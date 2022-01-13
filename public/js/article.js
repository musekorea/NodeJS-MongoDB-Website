const deleteBtn = document.querySelector('#deleteBtn');
const editBtn = document.querySelector('#editBtn');
const article = document.querySelector('.article');
const goodBtn = document.querySelector('#goodBtn');
const goodNum = document.querySelector('#goodNum');
const badBtn = document.querySelector('#badBtn');
const badNum = document.querySelector('#badNum');
const userData = document.querySelector('#userData');
const commentForm = document.querySelector('#commentForm');
const textArea = commentForm.querySelector('textarea');
const commentBtn = document.querySelector('#commentBtn');
const commentEditBtns = document.querySelector('.commentEditBtns');
const cancelBtn = document.querySelector('#cancelBtn');
const writeCommentBtn = document.querySelector('#writeCommentBtn');
const commentsContainer = document.querySelector('#commentsContainer');
const commentNumberSpan = document.querySelector('#commentNumberSpan');
const articleCommentNumberSpan = document.querySelector(
  '#articleCommentNumberSpan'
);
let commentDeleteBtns = document.querySelectorAll('#commentDeleteBtn');
let commentToolEditBtns = document.querySelectorAll('#commentToolEditBtn');
let commentReplyBtns = document.querySelectorAll('#replyBtn');
let nestCommentDeleteBtns = document.querySelectorAll('#nestCommentDelteBtn');

const isLoggedIn = userData.dataset.loginstate;

let goodState = false;
let badState = false;
let editCommentState = false;
let replyState = false;
let addCommentState = false;

const createdAt = (oldTime) => {
  const currentTime = Math.floor(new Date().getTime() / (1000 * 60));
  const calTime = currentTime - oldTime;
  let resultTime;
  if (calTime < 60) {
    return `${calTime < 2 ? `1 minute ago` : `${calTime} minutes ago`}`;
  } else if (calTime >= 60 && calTime < 60 * 24) {
    resultTime = Math.floor(calTime / 60);
    return `${resultTime < 2 ? `1 hour aog` : `${resultTime}hours ago`}`;
  } else if (calTime >= 60 * 24 && calTime < 60 * 24 * 30) {
    resultTime = Math.floor(calTime / (60 * 24));
    return `${resultTime < 2 ? `1 day ago` : `${resultTime} days ago`}`;
  } else if (calTime >= 60 * 24 * 30 && calTime < 60 * 24 * 30 * 12) {
    resultTime = Math.floor(calTime / (60 * 24 * 30));
    return `${resultTime < 2 ? `1 month ago` : `${resultTime} months ago`}`;
  } else {
    resultTime = Math.floor(calTime / (60 * 24 * 30 * 12));
    return `${resultTime < 2 ? `1 year aog` : `${resultTime} years ago`}`;
  }
};

const handleEdit = (e) => {
  e.preventDefault();
  const currentURL = window.location.href.split('/');
  const postID = currentURL[currentURL.length - 1];
  window.location.replace(`/community/editArticle/${postID}`);
};

const addComment = (e) => {
  if (editCommentState === true || replyState === true) {
    return;
  }
  commentForm.hidden = false;
  commentEditBtns.hidden = true;
  addCommentState = true;
};

const cancelComment = (e) => {
  e.preventDefault();
  commentForm.hidden = true;
  commentEditBtns.hidden = false;
  textArea.value = '';
  addCommentState = false;
};

const createComment = (content, time, newID) => {
  const commentDIV = document.createElement('div');

  commentDIV.id = 'commentWrapper';
  commentDIV.dataset.commentid = newID;
  const commentInnerDIV = document.createElement('div');
  commentInnerDIV.id = 'commentDIV';
  /* ================================================= */
  commentDIV.dataset.nestnumbers = '0';
  const commentHeader = document.createElement('div');
  commentHeader.innerHTML = `
  <div>
    <a href=/user/profile/${userData.dataset.owner}>
    <img src=${
      userData.dataset.avatar
        ? userData.dataset.avatar
        : '/public/images/nouser.png'
    }></a>
    <a href=/user/profile/${userData.dataset.owner}><span>${
    userData.dataset.owner
  }</span>
    </a>
    <span id="time">${time}</span>
  </div>
  <div id="commentToolBox">
  <span id="commentToolEditBtn">✏</span>
  <span id="replyBtn">↩</span>
  <span id="commentDeleteBtn">✖</span>
  </div>
  `;
  commentHeader.id = 'commentHeader';
  const commentBody = document.createElement('div');
  commentBody.id = 'commentBody';
  commentBody.innerHTML = content;
  commentInnerDIV.append(commentHeader, commentBody);
  commentDIV.append(commentInnerDIV);
  commentsContainer.prepend(commentDIV);
  const marker = document.createElement('span');
  commentDIV.append(marker);
};

const writeComment = async (e) => {
  if (textArea.value === '') {
    return;
  }
  e.preventDefault();
  try {
    const commentFetch = await fetch(
      `/community/comments/${article.dataset.id}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: textArea.value }),
      }
    );
    const newCommentID = await commentFetch.json();

    if (commentFetch.status === 200) {
      commentForm.hidden = true;
      commentEditBtns.hidden = false;
      const time = createdAt(Math.floor(new Date().getTime() / (1000 * 60)));
      createComment(textArea.value, time, newCommentID.newCommentID);
      textArea.value = '';
      commentNumberSpan.innerHTML = Number(commentNumberSpan.innerHTML) + 1;
      articleCommentNumberSpan.innerHTML =
        Number(articleCommentNumberSpan.innerHTML) + 1;
    }
    updateDeleteBtns();
    updateEditBtns();
    updateReplyBtns();
  } catch (error) {
    console.log(error);
  }
};

const addGood = async (e) => {
  e.preventDefault();
  if (goodState === false && badState === false) {
    goodNum.innerHTML = Number(goodNum.innerHTML) + 1;
    goodState = true;
  } else if (goodState === true && badState === false) {
    goodNum.innerHTML = Number(goodNum.innerHTML) - 1;
    goodState = false;
  }
  try {
    const postID = article.dataset.id;
    const goodFetch = await fetch(`/community/addGood/${postID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goodNum: goodNum.innerHTML, type: 'good' }),
    });
  } catch (error) {
    console.log(error);
  }
};

const addBad = async (e) => {
  e.preventDefault();
  if (badState === false && goodState === false) {
    badNum.innerHTML = Number(badNum.innerHTML) + 1;
    badState = true;
  } else if (badState === true && goodState === false) {
    badNum.innerHTML = Number(badNum.innerHTML) - 1;
    badState = false;
  }
  try {
    const postID = article.dataset.id;
    const badFetch = await fetch(`/community/addGood/${postID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ badNum: badNum.innerHTML, type: 'bad' }),
    });
  } catch (error) {
    console.log(error);
  }
};

if (isLoggedIn) {
  badBtn.addEventListener('click', addBad);
  goodBtn.addEventListener('click', addGood);
  commentBtn.addEventListener('click', addComment);
  cancelBtn.addEventListener('click', cancelComment);
  writeCommentBtn.addEventListener('click', writeComment);
}

if (editBtn) {
  editBtn.addEventListener('click', handleEdit);
}

/* Comment Tool */
const commentEditBtn = document.querySelector('#commentEditBtn');
const replyBtn = document.querySelector('#replyBtn');

let commentID;
let commentDIV;

const askDeleteComment = (e) => {
  commentID =
    e.target.parentElement.parentElement.parentElement.parentElement.dataset
      .commentid;
  commentDIV = e.target.parentElement.parentElement.parentElement.parentElement;
  const modalWindow = document.createElement('div');
  modalWindow.id = 'modalWindow';
  modalWindow.className = 'modalWindow';
  modalWindow.innerHTML = `
  <div id="modalInner">
  <h3>Delete Comment</h3>
  <p>Do you want to delete comment?</p>
  <div id="modalBtns">
  <button id="commentCancelBtn">Cancel</button>
  <button id="commentConfirmBtn">Confirm</button>
  </div>
  </div>
  `;

  document.body.style = 'overflow:hidden';
  document.body.append(modalWindow);

  const commentCancelBtn = document.querySelector('#commentCancelBtn');
  const commentConfirmBtn = document.querySelector('#commentConfirmBtn');

  commentCancelBtn.addEventListener('click', (e) => {
    modalWindow.remove();
    document.body.style = 'overflow:auto';
    return;
  });

  commentConfirmBtn.addEventListener('click', (e) => {
    modalWindow.remove();
    document.body.style = 'overflow:auto';
    deleteComment();
  });
};

const deleteComment = async (e) => {
  let articleID = window.location.href.split('/');
  articleID = articleID[articleID.length - 1];
  try {
    const deleteCommentFetch = await fetch(`/community/comments/${articleID}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentID }),
    });
    if (deleteCommentFetch.status === 200) {
      commentDIV.remove();
      commentNumberSpan.innerHTML = Number(commentNumberSpan.innerHTML) - 1;
      articleCommentNumberSpan.innerHTML =
        Number(articleCommentNumberSpan.innerHTML) - 1;
      commentID = '';
    }
  } catch (error) {
    console.log(error);
  }
};
let currentEditCommentID;

const handleEditComment = (e) => {
  if (replyState === true || addCommentState === true) {
    return;
  }
  const commentID =
    e.target.parentElement.parentElement.parentElement.parentElement.dataset
      .commentid;
  const commentBody = e.target.parentElement.parentElement.nextElementSibling;
  if (editCommentState === false) {
    currentEditCommentID =
      e.target.parentElement.parentElement.parentElement.parentElement.dataset
        .commentid;
    editCommentState = true;
    /* ================================= */
    commentBtn.disabled = true;
    const editDIV = document.createElement('div');
    editDIV.id = 'editDIV';
    editDIV.innerHTML = `
    <form id="editCommentForm">
      <input id="editCommentInput" "type="text" value=${commentBody.innerHTML}>
      <button>Submit</button>
    </form>
    `;
    commentBody.innerHTML = '';
    commentBody.append(editDIV);
    const editCommentForm = document.querySelector('#editCommentForm');
    editCommentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const editFetch = await fetch(
          `/community/comments/${currentEditCommentID}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: e.target[0].value }),
          }
        );
        if (editFetch.status === 200) {
          commentBody.innerHTML = e.target[0].value;
        }
      } catch (error) {
        console.log(error);
      }
    });
  } else if (editCommentState === true && commentID === currentEditCommentID) {
    editCommentState = false;
    const value = document.querySelector('#editCommentInput').value;
    commentBody.innerHTML = value;
    /* ================================= */
    commentBtn.disabled = false;
  }
};

const addReply = (e) => {
  if (editCommentState === true || addCommentState === true) {
    return;
  }
  if (replyState === true) {
    if (
      e.target.parentElement.parentElement.parentElement.nextElementSibling
        .id === 'replyDIV'
    ) {
      e.target.parentElement.parentElement.parentElement.nextElementSibling.remove();
      replyState = false;
      /* ================================= */
      commentBtn.disabled = false;
    } else {
      replyState = true;
    }
    updateReplyBtns();
    return;
  }

  const commentWrapper =
    e.target.parentElement.parentElement.parentElement.parentElement
      .parentElement;
  const commentDIV =
    e.target.parentElement.parentElement.parentElement.parentElement;
  const replyDIV = document.createElement('div');
  replyDIV.id = 'replyDIV';
  replyDIV.innerHTML = `
    <form id="replyForm">
      <input type="text placeholder = "Write a reply">
      <button >Reply</button>
    </form>
    `;

  commentDIV.insertBefore(
    replyDIV,
    e.target.parentElement.parentElement.parentElement.nextElementSibling
  );
  replyState = true;

  commentBtn.disabled = true;
  const replyBtn = document.querySelector('#replyForm');
  replyBtn.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      let articleID = window.location.href.split('/');
      articleID = articleID[articleID.length - 1];
      const replyFetch = await fetch(
        `/community/nestComments/${commentDIV.dataset.commentid}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'Application/json' },
          body: JSON.stringify({ content: e.target[0].value, articleID }),
        }
      );
      if (replyFetch.status === 200) {
        replyState = false;
        const time = createdAt(Math.floor(new Date().getTime() / (1000 * 60)));
        let nestCommentID = await replyFetch.json();
        nestCommentID = nestCommentID.nestCommentID;
        const nestCommentWrapper = document.createElement('div');
        nestCommentWrapper.id = 'nestCommentWrapper';
        nestCommentWrapper.dataset.nestid = nestCommentID;
        nestCommentWrapper.innerHTML = `
          <div id="nestCommentDIV">
            <div id="nestHeader">
              <div>
                <a href="/user/profile/${userData.dataset.owner}">
                  <img src="${userData.dataset.avatar}">
                </a>
                <a href="/user/profile/${userData.dataset.owner}">
                  <span>${userData.dataset.owner}</span>
                </a>
                <span>${time}</span>
              </div>
              <div id="nestCommentToolBox">
                <span id="nestCommentDeleteBtn">✖</span>
              </div>
            </div>
            <div id="nestCommentBody">${e.target[0].value}</div>
          </div>
        `;
        commentWrapper.insertBefore(
          nestCommentWrapper,
          e.target.parentElement.parentElement.parentElement.parentElement
            .parentElement.nextElementSibling
        );
        console.log(commentDIV);
        replyDIV.remove();
        updateNestDeleteBtns();
        commentNumberSpan.innerHTML = Number(commentNumberSpan.innerHTML) + 1;
        articleCommentNumberSpan.innerHTML =
          Number(articleCommentNumberSpan.innerHTML) + 1;
        commentDIV.dataset.nestnumbers =
          Number(commentDIV.dataset.nestnumbers) + 1;
      }
    } catch (error) {
      console.log(error);
    }
  });
};

const deleteNestComment = async (e) => {
  e.preventDefault();
  const nestParentEl =
    e.target.parentElement.parentElement.parentElement.parentElement;
  let currentURL = window.location.href.split('/');
  currentURL = currentURL[currentURL.length - 1];
  const commentID =
    e.target.parentElement.parentElement.parentElement.parentElement
      .parentElement.dataset.commentid;

  try {
    const deleteNestFetch = await fetch(
      `/community/nestComments/${currentURL}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentID,
          nestID: nestParentEl.dataset.nestid,
        }),
      }
    );
    if (deleteNestFetch.status === 200) {
      articleCommentNumberSpan.innerHTML =
        Number(articleCommentNumberSpan.innerHTML) - 1;
      commentNumberSpan.innerHTML = Number(commentNumberSpan.innerHTML) - 1;
      nestParentEl.remove();
    }
    /* ================================= */
    const commentDIV =
      e.target.parentElement.parentElement.parentElement.parentElement;

    /* commentDIV.dataset.nestnumbers = Number(commentDIV.dataset.nestnumbers) - 1; */
  } catch (error) {
    console.log(error);
  }
};

const updateEditBtns = () => {
  commentToolEditBtns = document.querySelectorAll('#commentToolEditBtn');
  commentToolEditBtns.forEach((commentEditBtn) => {
    if (editCommentState === false) {
      commentEditBtn.addEventListener('click', handleEditComment);
    } else {
      return;
    }
  });
};

const updateDeleteBtns = () => {
  commentDeleteBtns = document.querySelectorAll('#commentDeleteBtn');
  commentDeleteBtns.forEach((commentDeleteBtn) => {
    commentDeleteBtn.addEventListener('click', askDeleteComment);
  });
};

const updateReplyBtns = () => {
  commentReplyBtns = document.querySelectorAll('#replyBtn');
  commentReplyBtns.forEach((commentReplyBtn) => {
    commentReplyBtn.addEventListener('click', addReply);
  });
};

const updateNestDeleteBtns = () => {
  nestCommentDeleteBtns = document.querySelectorAll('#nestCommentDeleteBtn');
  nestCommentDeleteBtns.forEach((nestCommentDeleteBtn) => {
    nestCommentDeleteBtn.addEventListener('click', deleteNestComment);
  });
};

const init = () => {
  updateDeleteBtns();
  updateEditBtns();
  updateReplyBtns();
  updateNestDeleteBtns();
  commentForm.hidden = true;
};

init();
