import { User } from "@prisma/client"
import request from "supertest"
import server from "../index"
import faker from "faker"
import { newUser } from "./factory/user"

interface UserTest {
  user: User
  token: string
}

describe("Inicio dos testes na rota de comentários", () => {
  const user = newUser()

  let userTest: UserTest, postId: number, commentId: number

  beforeAll(async () => {
    const { body } = await request(server).post("/register").send(user)

    userTest = body

    const { body: post } = await request(server)
      .post("/posts")
      .set("Authorization", `Bearer ${body.token}`)
      .send({
        title: faker.lorem.words(4),
        content: faker.lorem.paragraph(2),
        tags: [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()],
      })

    postId = post.id
  })

  it("Deve comentar em um post", async () => {
    const { statusCode, body } = await request(server)
      .post("/post/" + postId + "/comments")
      .set("Authorization", `Bearer ${userTest.token}`)
      .send({ content: faker.lorem.paragraph(2) })

    expect(statusCode).toEqual(200)
    expect(body).not.toBeNull()

    commentId = body.id
  })

  it("Deve retornar todos os comentários do post", async () => {
    const { body, statusCode } = await request(server).get(
      "/post/" + postId + "/comments"
    )

    expect(statusCode).toEqual(200)
    expect(body).not.toBeNull()
  })

  it("Deve atualizar um comentário", async () => {
    const { body, statusCode } = await request(server)
      .put("/comments/" + commentId)
      .set("Authorization", `Bearer ${userTest.token}`)
      .send({ content: faker.lorem.paragraph(2) })

    expect(statusCode).toEqual(200)
    expect(body).not.toBeNull()
  })

  it("Deve deletar um comentário", async () => {
    const { statusCode } = await request(server)
      .delete("/comments/" + commentId)
      .set("Authorization", `Bearer ${userTest.token}`)

    expect(statusCode).toEqual(200)
  })
})
