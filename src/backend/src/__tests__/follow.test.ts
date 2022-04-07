import { User } from "@prisma/client"
import request from "supertest"
import server from "../index"
import { newUser } from "./factory/user"

interface UserTest {
  user: User
  token: string
}

describe("Inicio dos testes na rota de seguidores", () => {
  const user = newUser()
  const user2 = newUser()

  let userTest: UserTest, userTest2: UserTest

  beforeAll(async () => {
    const { body } = await request(server).post("/register").send(user)

    userTest = body

    const { body: body2 } = await request(server).post("/register").send(user2)

    userTest2 = body2
  })

  it("Deve seguir um usuario", async () => {
    const { statusCode } = await request(server)
      .get("/follow/" + userTest2.user.id)
      .set("Authorization", `Bearer ${userTest.token}`)

    expect(statusCode).toEqual(200)
  })

  it("Deve retornar todos os usuarios seguidos", async () => {
    const { body, statusCode } = await request(server).get(
      "/user/" + userTest.user.id + "/following"
    )

    expect(statusCode).toEqual(200)
    expect(body).not.toBeNull()
  })

  it("Deve retornar todos os usuarios que estão seguindo", async () => {
    const { body, statusCode } = await request(server).get(
      "/user/" + userTest2.user.id + "/followedBy"
    )

    expect(statusCode).toEqual(200)
    expect(body).not.toBeNull()
  })

  it("Deve dar unfollow em um usuario", async () => {
    const { statusCode } = await request(server)
      .delete("/unfollow/" + userTest2.user.id)
      .set("Authorization", `Bearer ${userTest.token}`)

    expect(statusCode).toEqual(200)
  })
})
