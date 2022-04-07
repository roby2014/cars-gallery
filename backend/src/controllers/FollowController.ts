import { Request, Response } from 'express'
import database from '../database'
import AppError from '../utils/errors'

export default {
  follow: async function (req: Request, res: Response) {
    const { id: userId } = req.params
    const { id: userAuthId } = req.user as User

    try {
      const userToBeFollowed = await database.user.findUnique({
        where: { id: Number(userId) }
      })

      if (!userToBeFollowed) {
        return new AppError(res, {
          name: req.t('user_controller.user_not_found.name'),
          message: req.t('user_controller.user_not_found.message'),
          statusCode: 404
        })
      }

      await database.user.update({
        where: { id: userAuthId },
        data: { following: { connect: { id: userToBeFollowed.id } } }
      })

      return res.send({
        message: req.t('follow_controller.followed', {
          username: userToBeFollowed?.username
        })
      })
    } catch (error) {
      new AppError(res, {
        name: req.t('server_internal'),
        message: error.message,
        statusCode: 500
      })
    }
  },
  unfollow: async function (req: Request, res: Response) {
    const { id: userId } = req.params
    const { id: userAuthId } = req.user as User

    try {
      const userToBeUnfollowed = await database.user.findUnique({
        where: { id: Number(userId) },
        include: { followedBy: true }
      })

      if (!userToBeUnfollowed) {
        return new AppError(res, {
          name: req.t('user_controller.user_not_found.name'),
          message: req.t('user_controller.user_not_found.message'),
          statusCode: 404
        })
      }

      const isFollowing = userToBeUnfollowed.followedBy.find(
        (user) => user.id === userAuthId
      )

      if (!isFollowing) {
        return new AppError(res, {
          name: req.t('follow_controller.is_not_following.name'),
          message: req.t('follow_controller.is_not_following.message'),
          statusCode: 400
        })
      }

      await database.user.update({
        where: { id: userAuthId },
        data: { followedBy: { disconnect: { id: Number(userId) } } }
      })

      return res.send({
        message: req.t('follow_controller.unfollowed', {
          username: userToBeUnfollowed?.username
        })
      })
    } catch (error) {
      new AppError(res, {
        name: req.t('server_internal'),
        message: error.message,
        statusCode: 500
      })
    }
  },
  getUserFollowers: async function (req: Request, res: Response) {
    const { id: userId } = req.params

    try {
      const userExists = await database.user.findUnique({
        where: { id: Number(userId) },
        select: { followedBy: true }
      })

      if (!userExists) {
        return new AppError(res, {
          name: req.t('user_controller.user_not_found.name'),
          message: req.t('user_controller.user_not_found.message'),
          statusCode: 404
        })
      }

      res.send(userExists)
    } catch (error) {
      new AppError(res, {
        name: req.t('server_internal'),
        message: error.message,
        statusCode: 500
      })
    }
  },

  getUserFollowing: async function (req: Request, res: Response) {
    const { id: userId } = req.params

    try {
      const userExists = await database.user.findUnique({
        where: { id: Number(userId) },
        select: { following: true }
      })

      if (!userExists) {
        return new AppError(res, {
          name: req.t('user_controller.user_not_found.name'),
          message: req.t('user_controller.user_not_found.message'),
          statusCode: 404
        })
      }

      res.send(userExists)
    } catch (error) {
      new AppError(res, {
        name: req.t('server_internal'),
        message: error.message,
        statusCode: 500
      })
    }
  },

  checkIfFollowing: async function (req: Request, res: Response) {
    const { id: authId } = req.user as User
    const { id: userId } = req.params

    try {
      const userExists = await database.user.findUnique({
        where: { id: Number(userId) }
      })

      if (!userExists) {
        return new AppError(res, {
          name: req.t('user_controller.user_not_found.name'),
          message: req.t('user_controller.user_not_found.message'),
          statusCode: 404
        })
      }

      const user = await database.user.findFirst({
        where: { id: Number(userId), followedBy: { some: { id: authId } } }
      })

      res.send({ following: !!user })
    } catch (error) {
      new AppError(res, {
        name: req.t('server_internal'),
        message: error.message,
        statusCode: 500
      })
    }
  }
}
