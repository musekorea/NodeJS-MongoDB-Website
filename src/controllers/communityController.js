import { db, counter } from '../db.js';
import { ObjectId } from 'mongodb';

export const communityController = async (req, res) => {
  let page = req.params.page;

  try {
    const allCommunity = await db.collection('community').find().toArray();
    const findCommunity = await db
      .collection('community')
      .find()
      .limit(5)
      .skip(5 * (page - 1))
      .sort({ _id: -1 })
      .toArray();

    findCommunity.forEach((article) => {
      const time = createdAt(article.createdAt);
      article.time = time;
    });
    res.status(200).render('community.ejs', {
      datas: findCommunity,
      totalPage: Math.ceil(Number(allCommunity.length) / 5),
    });
  } catch (error) {
    console.log(error);
  }
};

export const communitySortController = async (req, res) => {
  const type = req.body.type;
  const page = req.params.page;
  let findCommunity;
  if (type === 'new' || type === 'old') {
    console.log(type);
    findCommunity = await db
      .collection('community')
      .find()
      .limit(5)
      .skip(5 * (page - 1))
      .sort({ _id: type === 'new' ? -1 : 1 })
      .toArray();
  } else if (type === 'popular' || type === 'unPopular') {
    console.log(type);
    findCommunity = await db
      .collection('community')
      .find()
      .limit(5)
      .skip(5 * (page - 1))
      .sort({ views: type === 'popular' ? -1 : 1 })
      .toArray();
  }
  console.log(findCommunity);
  return res.status(200).end();
};

export const getWriteAritcleController = (req, res) => {
  res.status(200).render('writeArticle.ejs');
};
export const postWriteAritcleController = async (req, res) => {
  try {
    const saveArticle = await db.collection('community').insertOne({
      title: req.body.title,
      content: req.body.content,
      _id: counter.count + 1,
      owner: req.session.user.nickname,
      createdAt: Math.floor(new Date().getTime() / (1000 * 60)),
      avatarURL: req.session.user.avatarURL,
      good: 0,
      bad: 0,
      views: 0,
      nestNumbers: 0,
    });
    counter.count = counter.count + 1;
    const updateCounter = await db.collection('counter').updateOne(
      { name: 'counter' },
      {
        $set: { count: counter.count },
      }
    );
    res.status(300).redirect(`/community/community/1`);
  } catch (error) {
    console.log(error);
  }
};

export const getArticleController = async (req, res) => {
  try {
    const post = await db
      .collection('community')
      .findOne({ _id: Number(req.params.id) });
    /* ===================이거=============================== */
    const updateViews = await db.collection('community').updateOne(
      {
        _id: Number(req.params.id),
      },
      {
        $inc: { views: +1 },
      }
    );

    const time = createdAt(post.createdAt);
    post.time = time;
    const comments = await db
      .collection('comments')
      .find({ articleId: String(req.params.id) })
      .sort({ _id: -1 })
      .toArray();

    let commentNumber = 0;

    comments.forEach((comment) => {
      comment.createdAt = createdAt(comment.createdAt);
      if (comment.nestComments) {
        commentNumber = commentNumber + comment.nestComments.length;
        comment.nestComments.forEach((nest) => {
          nest.createdAt = createdAt(nest.createdAt);
        });
      }
    });
    const totalCommentNumber = comments.length + commentNumber;
    return res
      .status(200)
      .render('article.ejs', { data: post, comments, totalCommentNumber });
  } catch (error) {
    console.log(error);
  }
};

export const deleteArticlecontroller = async (req, res) => {
  try {
    const deleteArticle = await db
      .collection('community')
      .deleteOne({ _id: Number(req.params.id) });
    return res.status(200).end();
  } catch (error) {
    console.log(error);
  }
};

export const putArticleCOntroller = async (req, res) => {
  try {
    const editArticle = await db.collection('community').updateOne(
      { _id: Number(req.params.id) },
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          createdAt: Math.floor(new Date().getTime() / (1000 * 60)),
        },
      }
    );
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
  }
};

export const getEditArticleController = async (req, res) => {
  try {
    const article = await db
      .collection('community')
      .findOne({ _id: Number(req.params.id) });
    return res.status(200).render('editArticle.ejs', { data: article });
  } catch (error) {
    console.log(error);
  }
};

/* Add Good */
export const putAddGoodController = async (req, res) => {
  try {
    if (req.body.type === 'good') {
      const addGood = await db.collection('community').updateOne(
        { _id: Number(req.params.id) },
        {
          $set: { good: req.body.goodNum },
        }
      );
    } else {
      const addGood = await db.collection('community').updateOne(
        { _id: Number(req.params.id) },
        {
          $set: { bad: req.body.badNum },
        }
      );
    }

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
  }
};

export const addCommentController = async (req, res) => {
  const articleId = req.params.articleID;
  const content = req.body.comment;
  try {
    const addComment = await db.collection('comments').insertOne({
      content,
      articleId,
      nickname: req.session.user.nickname,
      avatarURL: req.session.user.avatarURL,
      createdAt: Math.floor(new Date().getTime() / (1000 * 60)),
    });
    const newCommentID = addComment.insertedId;
    const updateArticle = await db
      .collection('community')
      .updateOne(
        { _id: Number(articleId) },
        { $addToSet: { comments: addComment.insertedId } }
      );
    return res.status(200).end(JSON.stringify({ newCommentID }));
  } catch (error) {
    console.log(error);
  }
};

export const deleteCommentController = async (req, res) => {
  const commentID = new ObjectId(req.body.commentID);
  try {
    const deleteCommentInArticle = await db.collection('community').updateOne(
      { _id: Number(req.params.articleID) },
      {
        $pull: { comments: commentID },
      }
    );

    /*     const comment = await db.collection('comments').findOne({ _id: commentID });
    if (comment.nestComments) {
      comment.nestComments.forEach(async (nest) => {
        await db.collection('nestcomments').deleteOne({ _id: nest.nestid });
      });
    } */

    const deleteNestComments = await db
      .collection('nestcomments')
      .deleteMany({ commentID: req.body.commentID });

    const deleteComment = await db
      .collection('comments')
      .deleteOne({ _id: commentID });
    return res.status(200).end();
  } catch (error) {
    console.log(error);
  }
};

const createdAt = (oldTime) => {
  const currentTime = Math.floor(new Date().getTime() / (1000 * 60));
  const calTime = currentTime - oldTime;
  let resultTime;
  if (calTime < 60) {
    return `${calTime < 2 ? `1 minute ago` : `${calTime} minutes ago`}`;
  } else if (calTime >= 60 && calTime < 60 * 24) {
    resultTime = Math.floor(calTime / 60);
    return `${resultTime < 2 ? `1 hour ago` : `${resultTime}hours ago`}`;
  } else if (calTime >= 60 * 24 && calTime < 60 * 24 * 30) {
    resultTime = Math.floor(calTime / (60 * 24));
    return `${resultTime < 2 ? `1 day ago` : `${resultTime} days ago`}`;
  } else if (calTime >= 60 * 24 * 30 && calTime < 60 * 24 * 30 * 12) {
    resultTime = Math.floor(calTime / (60 * 24 * 30));
    return `${resultTime < 2 ? `1 month ago` : `${resultTime} months ago`}`;
  } else {
    resultTime = Math.floor(calTime / (60 * 24 * 30 * 12));
    return `${resultTime < 2 ? `1 year ago` : `${resultTime} years ago`}`;
  }
};

export const putCommentController = async (req, res) => {
  console.log(req.params, req.body);
  try {
    const editComment = await db.collection('comments').updateOne(
      { _id: new ObjectId(req.params.commentID) },
      {
        $set: { content: req.body.content },
      }
    );
    return res.status(200).end();
  } catch (error) {
    console.log(error);
  }
};

export const postNestCommentController = async (req, res) => {
  console.log(req.body, req.params.commentID);
  try {
    const saveNestComment = await db.collection('nestcomments').insertOne({
      content: req.body.content,
      owner: req.session.user.nickname,
      createdAt: Math.floor(new Date().getTime() / (1000 * 60)),
      commentID: req.params.commentID,
      articleID: req.body.articleID,
      avatarURL: req.session.user.avatarURL,
    });

    const nestToComment = await db.collection('comments').updateOne(
      {
        _id: new ObjectId(req.params.commentID),
      },
      {
        $push: {
          nestComments: {
            $each: [
              {
                nestid: saveNestComment.insertedId,
                content: req.body.content,
                owner: req.session.user.nickname,
                createdAt: Math.floor(new Date().getTime() / (1000 * 60)),
                commentID: req.params.commentID,
                articleID: req.body.articleID,
                avatarURL: req.session.user.avatarURL,
              },
            ],
            $sort: { nestid: -1 },
          },
        },
      }
    );
    const updateCommunityNumber = await db.collection('community').updateOne(
      {
        _id: Number(req.body.articleID),
      },
      {
        $inc: { nestNumbers: +1 },
      }
    );

    return res
      .status(200)
      .end(JSON.stringify({ nestCommentID: saveNestComment.insertedId }));
  } catch (error) {
    console.log(error);
  }
};

export const deleteNestCommentController = async (req, res) => {
  const articleID = req.params.articleID;
  const { commentID, nestID } = req.body;
  console.log(articleID, commentID, nestID);
  try {
    const updateComment = await db.collection('comments').updateOne(
      {
        _id: new ObjectId(commentID),
      },
      {
        $pull: { nestComments: { nestid: new ObjectId(nestID) } },
      }
    );
    const deleteNest = await db
      .collection('nestcomments')
      .deleteOne({ _id: new ObjectId(nestID) });
    const updateCommunityNumber = await db.collection('community').updateOne(
      {
        _id: Number(articleID),
      },
      {
        $inc: { nestNumbers: -1 },
      }
    );
    return res.status(200).end();
  } catch (error) {
    console.log(error);
  }
};
