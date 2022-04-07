import { Router } from 'express'
import {
  UserController,
  PostController,
  TagController,
  FollowController,
  CommentController
} from './controllers'
import multer from 'multer'
import isAuthenticated from './middlewares/isAuthenticated'
import optionalAuthenticated from './middlewares/optionalAuthenticated'
// @ts-ignore
import i18fs from 'i18next-node-fs-backend'
import i18next from 'i18next'
import i18middleware from 'i18next-http-middleware'

i18next
  .use(i18fs)
  .use(i18middleware.LanguageDetector)
  .init({
    lng: 'cimode',
    fallbackLng: 'en',
    preload: ['en', 'pt'],
    saveMissing: true,
    backend: {
      loadPath: __dirname + '/locales/{{lng}}.json'
    }
  })

const router = Router()

router.use(i18middleware.handle(i18next))

// Multer is for making uploading files easy (a lib)
const upload = multer()

// User routes
router.get('/users', UserController.index)
router.get('/user/:id', UserController.getUser)
router.get('/user/:id/avatar', UserController.getAvatar)
router.get('/authenticate', isAuthenticated, UserController.authenticate)
router.get('/user/:id/posts', UserController.getUserPosts)
router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.post(
  '/avatar',
  isAuthenticated,
  upload.single('avatar'),
  UserController.uploadProfilePicture
)
router.put('/user', isAuthenticated, UserController.updateProfile)
router.delete('/user', isAuthenticated, UserController.deleteUser)

// Post routes
router.get('/posts', optionalAuthenticated, PostController.index)
router.get('/file/:id', PostController.getPostFile)
router.get('/post/:id', PostController.getPost)
router.get('/post/:id/like', isAuthenticated, PostController.userLikedPost)
router.post('/posts', isAuthenticated, PostController.create)
router.put('/post/:id/like', isAuthenticated, PostController.likePost)
router.put(
  '/post/:id/file',
  isAuthenticated,
  upload.single('file'),
  PostController.uploadFile
)
router.put('/post/:id', isAuthenticated, PostController.updatePost)
router.delete('/post/:id/like', isAuthenticated, PostController.unlikePost)
router.delete('/post/:id', isAuthenticated, PostController.deletePost)

// Tag routes
router.get('/tags', TagController.index)

// Follow routes
router.get('/user/:id/following', FollowController.getUserFollowing)
router.get('/user/:id/followedBy', FollowController.getUserFollowers)
router.get(
  '/user/:id/isFollowing',
  isAuthenticated,
  FollowController.checkIfFollowing
)
router.post('/follow/:id', isAuthenticated, FollowController.follow)
router.delete('/unfollow/:id', isAuthenticated, FollowController.unfollow)

// Comment routes
router.get('/post/:id/comments', CommentController.getPostComments)
router.post(
  '/post/:id/comments',
  isAuthenticated,
  CommentController.commentOnPost
)
router.put('/comments/:id', isAuthenticated, CommentController.updateComment)
router.delete('/comments/:id', isAuthenticated, CommentController.deleteComment)

export default router
