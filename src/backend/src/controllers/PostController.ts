import { User } from "@prisma/client"
import { Request, Response } from "express"

import database from "../database"
import AppError from "../utils/errors"

interface PostEssentials {
  title: string
  content: string
  tags: string[]
}

export default {
  index: async function (req: Request, res: Response) {
    const { tags } = req.query

    try {
      let user: User | null = null

      if (req.user) {
        user = await database.user.findUnique({
          where: { id: (req.user as User).id },
        })
      }

      if (!tags) {
        const posts = await database.post.findMany({
          where: { published: true },
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: {
                id: true,
                email: true,
                profile: true,
                username: true,
                followedBy: { select: { id: true } },
              },
            },
            file: { select: { fileType: true } },
            tags: true,
            _count: { select: { comments: true, likes: true } },
          },
        })

        const postsCount = await database.post.count({
          where: { published: true },
        })

        if (user) {
          posts.sort((postA, postB) => {
            const { followedBy: followedByA } = postA.author
            const { followedBy: followedByB } = postB.author

            const isFollowedByA = followedByA.find(
              (follower) => follower.id === user?.id
            )
            const isFollowedByB = followedByB.find(
              (follower) => follower.id === user?.id
            )

            if (
              (isFollowedByA && postA.createdAt > postB.createdAt) ||
              !isFollowedByB
            )
              return -1
            else if (
              (isFollowedByB && postA.createdAt < postB.createdAt) ||
              !isFollowedByA
            )
              return 1
            else return 0
          })
        }

        res.send({ posts, count: postsCount })
      } else {
        const posts = await database.post.findMany({
          where: {
            tags: {
              some: { name: { in: (tags as string).split(",") } },
            },
          },
          include: {
            author: true,
            tags: true,
            file: { select: { fileType: true } },
            _count: { select: { comments: true, likes: true } },
          },
        })

        res.send({ posts, count: posts.length })
      }
    } catch (error) {
      new AppError(res, {
        name: req.t("server_internal"),
        message: error.message,
        statusCode: 500,
      })
    }
  },
  getPost: async function (req: Request, res: Response) {
    const { id: postId } = req.params
    const { id: userId } = req.user as User

    try {
      const post = await database.post.findUnique({
        where: { id: Number(postId) },
        include: {
          author: true,
          tags: true,
          file: { select: { fileType: true } },
          _count: { select: { comments: true, likes: true } },
        },
      })

      if (!post || (!post.published && post.authorId !== userId)) {
        return new AppError(res, {
          name: req.t("post_controller.post_not_found.name"),
          message: req.t("post_controller.post_not_found.message"),
          statusCode: 404,
        })
      }

      res.send(post)
    } catch (error) {
      new AppError(res, {
        name: req.t("server_internal"),
        message: error.message,
        statusCode: 500,
      })
    }
  },
  getPostFile: async function (req: Request, res: Response) {
    const { id: fileId } = req.params

    try {
      const postFile = await database.postFile.findUnique({
        where: { id: Number(fileId) },
      })

      if (!postFile) {
        return new AppError(res, {
          name: req.t("post_controller.file_not_found.name"),
          message: req.t("post_controller.file_not_found.message"),
          statusCode: 404,
        })
      }

      res.writeHead(200, {
        "Content-Type": postFile.fileType || "image/png",
        "Content-Length": postFile.file.length,
      })

      res.end(postFile.file)
    } catch (error) {
      new AppError(res, {
        name: req.t("server_internal"),
        message: error.message,
        statusCode: 500,
      })
    }
  },
  create: async function (req: Request, res: Response) {
    const { id } = req.user as User
    const { title, content, tags }: PostEssentials = req.body

    const tagsFormatted = tags.map((value) => ({ name: value }))

    try {
      await database.tag.createMany({
        data: tagsFormatted,
        skipDuplicates: true,
      })

      const { id: postId } = await database.post.create({
        data: {
          title,
          authorId: id,
          content,
          published: true,
        },
        include: { tags: true },
      })

      const post = await database.post.update({
        where: { id: postId },
        data: { tags: { connect: tagsFormatted } },
        include: { tags: true },
      })

      res.send(post)
    } catch (error) {
      new AppError(res, {
        name: req.t("server_internal"),
        message: error.message,
        statusCode: 500,
      })
    }
  },
  uploadFile: async function (req: Request, res: Response) {
    const { id: postId } = req.params
    const { id: userId } = req.user as User

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

      if (post.authorId !== userId) {
        return new AppError(res, {
          name: req.t("post_controller.unauthorized.name"),
          message: req.t("post_controller.unauthorized.message"),
          statusCode: 401,
        })
      }

      await database.postFile.create({
        data: {
          file: req.file.buffer,
          fileType: req.file.mimetype,
          post: { connect: { id: Number(postId) } },
        },
      })

      res.send({ message: req.t("post_controller.file_upload_success") })
    } catch (error) {
      new AppError(res, {
        name: req.t("server_internal"),
        message: error.message,
        statusCode: 500,
      })
    }
  },
  updatePost: async function (req: Request, res: Response) {
    const { id: postId } = req.params
    const { id: userId } = req.user as User
    const { publish, title, content } = req.body

    try {
      const post = await database.post.findUnique({
        where: { id: Number(postId) },
      })

      if (post?.authorId !== userId) {
        return new AppError(res, {
          name: req.t("post_controller.unauthorized.name"),
          message: req.t("post_controller.unauthorized.message"),
          statusCode: 401,
        })
      }

      const data = {}

      if (publish) Object.assign(data, { published: publish })
      if (title) Object.assign(data, { title })
      if (content) Object.assign(data, { content })

      await database.post.update({
        where: { id: Number(postId) },
        data,
      })

      res.send({ message: req.t("post_controller.post_updated_succes") })
    } catch (error) {
      new AppError(res, {
        name: req.t("server_internal"),
        message: error.message,
        statusCode: 500,
      })
    }
  },
  deletePost: async function (req: Request, res: Response) {
    const { id: postId } = req.params
    const { id: userId } = req.user as User

    try {
      const post = await database.post.findUnique({
        where: { id: Number(postId) },
        include: { file: true },
      })

      if (!post)
        return new AppError(res, {
          name: req.t("post_controller.post_not_found.name"),
          message: req.t("post_controller.post_not_found.message"),
          statusCode: 404,
        })

      if (post.authorId !== userId)
        return new AppError(res, {
          name: req.t("post_controller.unauthorized.name"),
          message: req.t("post_controller.unauthorized.message"),
          statusCode: 401,
        })

      await database.post.update({
        where: { id: Number(postId) },
        data: {
          file: { delete: true },
          tags: { set: [] },
          comments: { deleteMany: {} },
          likes: { deleteMany: {} }
        },
      })

      await database.post.delete({ where: { id: Number(postId) } })

      res.send({ message: req.t("post_controller.post_deleted") })
    } catch (error) {
      new AppError(res, {
        name: req.t("server_internal"),
        message: error.message,
        statusCode: 500,
      })
    }
  },
  likePost: async function (req: Request, res: Response) {
    const { id: postId } = req.params
    const { id: userId } = req.user as User

    try {
      const post = await database.post.findUnique({
        where: { id: Number(postId) },
      })

      if (!post || (!post.published && post.authorId !== userId)) {
        return new AppError(res, {
          name: req.t("post_controller.post_not_found.name"),
          message: req.t("post_controller.post_not_found.message"),
          statusCode: 404,
        })
      }

      await database.postLike.create({
        data: { postId: Number(postId), userId },
      })

      res.send({ message: "Post liked!" })
    } catch (error) {
      new AppError(res, {
        name: req.t("server_internal"),
        message: error.message,
        statusCode: 500,
      })
    }
  },
  unlikePost: async function (req: Request, res: Response) {
    const { id: postId } = req.params
    const { id: userId } = req.user as User

    try {
      const post = await database.post.findUnique({
        where: { id: Number(postId) },
      })

      if (!post || (!post.published && post.authorId !== userId)) {
        return new AppError(res, {
          name: req.t("post_controller.post_not_found.name"),
          message: req.t("post_controller.post_not_found.message"),
          statusCode: 404,
        })
      }

      const liked = await database.postLike.findFirst({ where: { userId, postId: Number(postId) } })

      if (!liked) {
        return new AppError(res, {
          name: "Unauthorized",
          message: "You didn't liked the post to unlike!",
          statusCode: 401
        })
      }

      await database.postLike.deleteMany({
        where: { postId: post.id, userId },
      })

      res.send({ message: "Post unliked!" })
    } catch (error) {
      new AppError(res, {
        name: req.t("server_internal"),
        message: error.message,
        statusCode: 500,
      })
    }
  },
  userLikedPost: async function (req: Request, res: Response) {
    const { id: postId } = req.params
    const { id: userId } = req.user as User

    try {
      const post = await database.post.findUnique({
        where: { id: Number(postId) },
      })

      if (!post || (!post.published && post.authorId !== userId)) {
        return new AppError(res, {
          name: req.t("post_controller.post_not_found.name"),
          message: req.t("post_controller.post_not_found.message"),
          statusCode: 404,
        })
      }

      const liked = await database.postLike.findFirst({
        where: { postId: post.id, userId },
      })

      res.send({ liked: !!liked })
    } catch (error) {
      new AppError(res, {
        name: req.t("server_internal"),
        message: error.message,
        statusCode: 500,
      })
    }
  }
}
