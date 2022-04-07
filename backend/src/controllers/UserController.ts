import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import database from '../database'
import AppError from '../utils/errors'
import { User } from '@prisma/client'
import { generateToken } from '../middlewares/auth'
import path from 'path'

// Typescript :sunglasses:
type RegisterFields = {
  name: string
  email: string
  password: string
  birthday: Date
  country: string
  username: string
  bio: string
}

type LoginFields = {
  password: string
  email: string
}

export default {
  index: async function (req: Request, res: Response) {
    try {
      const users = await database.user.findMany({
        include: {
          posts: true,
          following: true,
          followedBy: true,
          _count: { select: { posts: true } }
        }
      })

      const modifiedUsers = users.map((value) => {
        const followedBy = value.followedBy.length
        const following = value.following.length

        if (!value._count) {
          return { ...value, _count: { followedBy, following, posts: 0 } }
        }

        return {
          ...value,
          _count: { posts: value._count.posts, followedBy, following }
        }
      })

      res.send(modifiedUsers)
    } catch (error) {
      return new AppError(res, {
        name: req.t('server_internal'),
        message: error.message,
        statusCode: 500
      })
    }
  },
  login: async function (req: Request, res: Response) {
    const { email: userEmail, password: userPassword }: LoginFields = req.body

    if (!userEmail || !userPassword) {
      return new AppError(res, {
        name: req.t('user_controller.unfilled_fields_login.name'),
        message: req.t('user_controller.unfilled_fields_login.message'),
        statusCode: 400
      })
    }

    try {
      // verifica se email é valido, se for, retorna os dados
      // do utilizador e também o numero de seguidores e seguindo
      const userExists = await database.user.findUnique({
        where: {
          email: userEmail
        },
        include: { following: true, followedBy: true }
      })

      // se email for invalido, retorna erro
      if (!userExists) {
        return new AppError(res, {
          name: req.t('user_controller.email_notfound.name'),
          message: req.t('user_controller.email_notfound.message'),
          statusCode: 404
        })
      }

      // ve se a password é válida, se for invalida, retorna erro
      if (!(await bcrypt.compare(userPassword, userExists.password))) {
        return new AppError(res, {
          name: req.t('user_controller.wrong_password.name'),
          message: req.t('user_controller.wrong_password.message'),
          statusCode: 401
        })
      }

      const followedBy = userExists.followedBy.length
      const following = userExists.following.length

      // se email e password forem validos, retorna o user e o token
      const token = generateToken(userExists)
      return res.send({
        user: { ...userExists, _count: { followedBy, following } },
        token
      })
    } catch (error) {
      return new AppError(res, {
        name: req.t('server_internal'),
        message: error.message,
        statusCode: 500
      })
    }
  },

  register: async function (req: Request, res: Response) {
    const {
      name: userName,
      email: userEmail,
      password: userPassword,
      birthday: userBirthday,
      country: userCountry,
      username: userUsername,
      bio: userBio
    }: RegisterFields = req.body

    if (
      !userName ||
      !userEmail ||
      !userPassword ||
      !userCountry ||
      !userBirthday ||
      !userUsername
    ) {
      return new AppError(res, {
        name: req.t('user_controller.unfilled_fields.name'),
        message: req.t('user_controller.unfilled_fields.message'),
        statusCode: 400
      })
    }

    try {
      const emailExists = await database.user.findUnique({
        where: {
          email: userEmail
        }
      })

      if (emailExists) {
        return new AppError(res, {
          name: req.t('user_controller.email_in_use.name'),
          message: req.t('user_controller.email_in_use.message'),
          statusCode: 400
        })
      }

      const usernameExists = await database.user.findUnique({
        where: {
          username: userUsername
        }
      })

      if (usernameExists) {
        return new AppError(res, {
          name: req.t('user_controller.user_in_use.name'),
          message: req.t('user_controller.user_in_use.message'),
          statusCode: 400
        })
      }

      const passwordHashed = await bcrypt.hash(userPassword, 10)

      const newUser = await database.user.create({
        data: {
          email: userEmail,
          name: userName,
          birthday: new Date(userBirthday),
          country: userCountry,
          password: passwordHashed,
          username: userUsername,
          bio: userBio
        }
      })

      const token = generateToken(newUser)
      return res.send({ user: newUser, token })
    } catch (error) {
      new AppError(res, {
        name: req.t('server_internal'),
        message: error.message,
        statusCode: 500
      })
    }
  },

  updateProfile: async function (req: Request, res: Response) {
    const { id: userId } = req.user as User
    const {
      email,
      username,
      birthday,
      oldPassword,
      newPassword,
      country,
      bio,
      name
    } = req.body

    try {
      const oldUser = await database.user.findUnique({ where: { id: userId } })

      if (!oldUser) return

      // If we are only changing the password
      if (oldPassword && newPassword) {
        if (!(await bcrypt.compare(oldPassword, oldUser.password))) {
          return new AppError(res, {
            name: req.t('user_controller.unauthorized.name'),
            message: req.t('user_controller.unauthorized.message'),
            statusCode: 401
          })
        }

        const passwordHashed = await bcrypt.hash(newPassword, 10)

        const updatedUser = await database.user.update({
          where: { id: userId },
          data: { password: passwordHashed }
        })

        return res.send({
          user: updatedUser,
          message: req.t('user_controller.pw_updated')
        })
      }

      const data = {}

      if (username) {
        const usernameExists = await database.user.findUnique({
          where: {
            username
          }
        })
        if (usernameExists) {
          return new AppError(res, {
            name: req.t('user_controller.user_in_use.name'),
            message: req.t('user_controller.user_in_use.message'),
            statusCode: 400
          })
        }
      }

      if (email) {
        const emailExists = await database.user.findUnique({
          where: {
            email
          }
        })
        if (emailExists) {
          return new AppError(res, {
            name: req.t('user_controller.email_in_use.name'),
            message: req.t('user_controller.email_in_use.message'),
            statusCode: 400
          })
        }  
      }
      
      // check each field to update
      if (email) Object.assign(data, { email })
      if (birthday) Object.assign(data, { birthday: new Date(birthday) })
      if (country) Object.assign(data, { country })
      if (name) Object.assign(data, { name })
      if (bio) Object.assign(data, { bio })
      if (username) Object.assign(data, { username })

      const updatedUser = await database.user.update({
        where: { id: userId },
        data
      })

      res.send({
        user: updatedUser,
        message: req.t('user_controller.field_updated')
      })
    } catch (error) {
      new AppError(res, {
        name: req.t('server_internal'),
        message: error.message,
        statusCode: 500
      })
    }
  },

  uploadProfilePicture: async function (req: Request, res: Response) {
    const { id } = req.user as User

    try {
      const profile = await database.profile.findUnique({
        where: {
          userId: Number(id)
        }
      })

      // If the user don't have a profile create one
      // Else just update the old photo
      if (!profile) {
        await database.profile.create({
          data: {
            userId: Number(id),
            photo: req.file.buffer
          }
        })
      } else {
        await database.profile.update({
          where: {
            userId: Number(id)
          },
          data: {
            photo: req.file.buffer
          }
        })
      }

      res.send({
        message: req.t('user_controller.image_send_success')
      })
    } catch (error) {
      new AppError(res, {
        name: req.t('server_internal'),
        message: error.message,
        statusCode: 500
      })
    }
  },

  getAvatar: async function (req: Request, res: Response) {
    const { id } = req.params

    try {
      if (!id) {
        return new AppError(res, {
          name: req.t('user_controller.avatar_no_user_id.name'),
          message: req.t('user_controller.avatar_no_user_id.message'),
          statusCode: 400
        })
      }

      const profile = await database.profile.findUnique({
        where: {
          userId: Number(id)
        }
      })

      if (!profile || !profile.photo) {
        return res.sendFile(
          path.join(__dirname, '..', 'assets', 'default_user.png')
        )
      }

      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': profile.photo.length
      })
      res.end(profile.photo)
    } catch (error) {
      new AppError(res, {
        name: req.t('server_internal'),
        message: error.message,
        statusCode: 500
      })
    }
  },

  authenticate: async function (req: Request, res: Response) {
    try {
      const { id: userId } = req.user as User

      const user = await database.user.findUnique({
        where: { id: userId },
        include: {
          posts: true,
          _count: { select: { posts: true } }
        }
      })

      const following = await database.user.count({
        where: { followedBy: { some: { id: Number(userId) } } }
      })

      const followedBy = await database.user.count({
        where: { following: { some: { id: Number(userId) } } }
      })

      res.send({ ...user, _count: { followedBy, following } })
    } catch (error) {
      new AppError(res, {
        name: req.t('server_internal'),
        message: error.message,
        statusCode: 500
      })
    }
  },

  getUser: async function (req: Request, res: Response) {
    try {
      const { id: userId } = req.params

      const userExists = await database.user.findUnique({
        where: { id: Number(userId) },
        include: {
          posts: true
        }
      })

      if (!userExists) {
        return new AppError(res, {
          name: req.t('user_controller.user_not_found.name'),
          message: req.t('user_controller.user_not_found.message'),
          statusCode: 404
        })
      }

      const following = await database.user.count({
        where: { followedBy: { some: { id: Number(userId) } } }
      })

      const followedBy = await database.user.count({
        where: { following: { some: { id: Number(userId) } } }
      })

      res.send({ ...userExists, _count: { followedBy, following } })
    } catch (error) {
      new AppError(res, {
        name: req.t('server_internal'),
        message: error.message,
        statusCode: 500
      })
    }
  },

  deleteUser: async function (req: Request, res: Response) {
    const { id: userId } = req.user as User

    try {
      const user = await database.user.findUnique({
        where: { id: userId },
        include: { profile: true }
      })

      if (!user) return

      if (user.profile) {
        await database.user.update({
          where: { id: Number(userId) },
          data: {
            profile: { delete: true }
          }
        })
      }

      await database.post.deleteMany({
        where: { authorId: Number(userId) }
      })

      await database.user.update({
        where: { id: Number(userId) },
        data: {
          postsLiked: { deleteMany: {} },
          postsCommented: { deleteMany: {} },
          followedBy: { set: [] },
          following: { set: [] }
        }
      })

      await database.user.delete({ where: { id: userId } })

      res.send({ message: req.t('delete_account') })
    } catch (error) {
      new AppError(res, {
        name: req.t('server_internal'),
        message: error.message,
        statusCode: 500
      })
    }
  },

  getUserPosts: async function (req: Request, res: Response) {
    const { id: userId } = req.params

    try {
      const posts = await database.post.findMany({
        where: { authorId: Number(userId), published: true },
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              profile: true,
              username: true,
              followedBy: { select: { id: true } }
            }
          },
          file: { select: { fileType: true } },
          tags: true,
          _count: { select: { comments: true, likes: true } }
        }
      })

      res.send(posts)
    } catch (error) {
      new AppError(res, {
        name: req.t('server_internal'),
        message: error.message,
        statusCode: 500
      })
    }
  }
}
