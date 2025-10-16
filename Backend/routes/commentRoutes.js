const express = require('express');
const { verifyJWT } = require('../middleware/authJwt');
const { addComment, getCommentsByCake, updateComment, deleteComment, toggleLike, addReply } = require('../controllers/commentController');

const router = express.Router();

router.get('/:cakeId', getCommentsByCake);
router.post('/', verifyJWT, addComment);
router.put('/:id', verifyJWT, updateComment);
router.delete('/:id', verifyJWT, deleteComment);
router.patch('/like/:id', verifyJWT, toggleLike);
router.post('/reply/:id', verifyJWT, addReply);

module.exports = router;


