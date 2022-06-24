const express = require('express');

const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Post Model
const Post = require('../../models/Post');
// Load Profile Model
const Profile = require('../../models/Profile');

// Load Validation
const validatePostInput = require('../../validation/post');

router.get('/test', (req, res) => res.json({ msg: 'Posts Works' }));

router.get('/', (req, res) => {
    Post.find()
        .sort({ date: -1 })
        .then((posts) => res.json(posts))
        .catch(() => res.status(404).json({ nopostfound: 'No posts found' }));
});
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then((post) => res.json(post))
        .catch(() => res.status(404).json({ nopostfound: 'No post found with that id' }));
});

router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
        Post.findById(req.params.id)
            .then((post) => {
                // Check for post owner
                if (post.user.toString() !== req.user.id) {
                    return res.status(401).json({ notauthorized: 'User not authorized' });
                }
                // Delete
                post.remove().then(() => res.json({ success: true }));
            })
            .catch((err) => res.status(404).json({ postnotfound: 'No post found by that id' }));
    });
});

router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { text, name } = req.body;

    const { errors, isValid } = validatePostInput({ text });

    if (!isValid) {
        return res.status(400).json(errors);
    }

    const { id, avatar } = req.user;
    const newPost = new Post({
        text,
        name,
        avatar,
        user: id,
    });

    newPost.save().then((post) => res.json(post));
});
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
        Post.findById(req.params.id)
            .then((post) => {
                if (post.likes.filter((like) => like.user.toString() === req.user.id).length > 0) {
                    return res.status(400).json({ alreadyliked: 'User already liked this post' });
                }

                post.likes.unshift({ user: req.user.id });
                post.save().then((post) => res.json(post));
            })
            .catch((err) => res.status(404).json({ postnotfound: 'No post found by that id' }));
    });
});
router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
        Post.findById(req.params.id)
            .then((post) => {
                if (
                    post.likes.filter((like) => like.user.toString() === req.user.id).length === 0
                ) {
                    return res
                        .status(400)
                        .json({ alreadyliked: 'You have not yet liked this post' });
                }

                const removeIndex = post.likes
                    .map((item) => item.user.toString())
                    .indexOf(req.user.id);

                post.likes.splice(removeIndex, 1);
                post.save().then((post) => res.json(post));
            })
            .catch((err) => res.status(404).json({ postnotfound: 'No post found by that id' }));
    });
});

router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { text, name } = req.body;
    const { errors, isValid } = validatePostInput({ text });

    if (!isValid) {
        return res.status(400).json(errors);
    }

    const { avatar, id } = req.user;
    Post.findById(req.params.id)
        .then((post) => {
            const newComment = {
                text,
                name,
                avatar,
                user: id,
            };

            post.comments.unshift(newComment);
            post.save().then((post) => res.json(post));
        })
        .catch((err) => res.json(404).json({ postnotfound: 'No post found' }));
});
router.delete(
    '/comment/:post_id/:comment_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { post_id, comment_id } = req.params;
        Post.findById(post_id)
            .then((post) => {
                if (
                    post.comments.filter((comment) => comment._id.toString() === comment_id)
                        .length === 0
                ) {
                    return res.status(404).json({ commentnotexists: 'Comment does not exist' });
                }

                const removeIndex = post.comments
                    // eslint-disable-next-line no-underscore-dangle
                    .map((item) => item._id.toString())
                    .indexOf(req.params.comment_id);
                post.comments.splice(removeIndex, 1);
                post.save().then((post) => res.json(post));
            })
            .catch(() => res.json(404).json({ postnotfound: 'No post found' }));
    }
);

module.exports = router;
