import { Request, Response } from "express"
import database from "../database"
import AppError from "../utils/errors"

interface CommentBody {
  content: string
}

export default {
  getPostComments: async function (req: Request, res: Response) {
    const { id: postId } = req.params

    try {
      const post = await database.post.findUnique({
        where: { id: Number(postId) },
      })

      if (!post) {
        return new AppError(res, {
          name: req.t("post_controller.post_not_found.name"),
          message: req.t("post_controller.post_not_found.message"),
          statusCode: 404,
        })
      }

      const comments = await database.comment.findMany({
        where: { post: { id: Number(postId) } },
        include: { author: { select: { id: true, username: true } } },
      })

      res.send(comments)
    } catch (error) {
      new AppError(res, {
        name: req.t("server_internal"),
        message: error.message,
        statusCode: 500,
      })
    }
  },
  commentOnPost: async function (req: Request, res: Response) {
    const { id: postId } = req.params
    const { id: userId } = req.user as User
    const { content }: CommentBody = req.body

    try {
      const post = await database.post.findUnique({
        where: { id: Number(postId) },
      })

      if (!post) {
        return new AppError(res, {
          name: req.t("post_controller.post_not_found.name"),
          message: req.t("post_controller.post_not_found.message"),
          statusCode: 404,
        })
      }

      const comment = await database.comment.create({
        data: { postId: Number(postId), authorId: userId, content },
      })

      res.send(comment)
    } catch (error) {
      new AppError(res, {
        name: req.t("server_internal"),
        message: error.message,
        statusCode: 500,
      })
    }
  },
  updateComment: async function (req: Request, res: Response) {
    const { id: commentId } = req.params
    const { id: userId } = req.user as User
    const { content } = req.body

    try {
      const comment = await database.comment.findUnique({
        where: { id: Number(commentId) },
      })

      if (!comment)
        return new AppError(res, {
          name: req.t("comment_controller.not_found.name"),
          message: req.t("comment_controller.not_found.message"),
          statusCode: 401,
        })

      if (comment.authorId !== userId)
        return new AppError(res, {
          name: req.t("comment_controller.not_authorized.name"),
          message: req.t("comment_controller.not_authorized.message"),
          statusCode: 401,
        })

      const commentUpdated = await database.comment.update({
        where: { id: Number(commentId) },
        data: { content },
      })

      res.send(commentUpdated)
    } catch (error) {
      new AppError(res, {
        name: req.t("server_internal"),
        message: error.message,
        statusCode: 500,
      })
    }
  },
  deleteComment: async function (req: Request, res: Response) {
    const { id: commentId } = req.params
    const { id: userId } = req.user as User

    try {
      const comment = await database.comment.findUnique({
        where: { id: Number(commentId) },
      })

      if (!comment)
        return new AppError(res, {
          name: req.t("comment_controller.not_found.name"),
          message: req.t("comment_controller.not_found.message"),
          statusCode: 401,
        })

      if (comment.authorId !== userId)
        return new AppError(res, {
          name: req.t("comment_controller.not_authorized.name"),
          message: req.t("comment_controller.not_authorized.message"),
          statusCode: 401,
        })

      await database.comment.delete({
        where: { id: Number(commentId) },
      })

      res.send({ message: req.t("comment_controller.deleted") })
    } catch (error) {
      new AppError(res, {
        name: req.t("server_internal"),
        message: error.message,
        statusCode: 500,
      })
    }
  },
}
