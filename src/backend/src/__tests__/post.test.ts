import request from "supertest"
import server from "../index"
import { newUser } from "./factory/user"
import faker from "faker"
import { Post } from "@prisma/client"

describe("Inicio dos testes da rota de posts", () => {
  let user = newUser()
  let post: Post
  let token: string

  beforeAll((done) => {
    request(server)
      .post("/register")
      .send(user)
      .end((err, response) => {
        if (err) throw err

        token = response.body.token // save the token
        done()
      })
  })

  it("Deve criar um novo post, suas respectivas tags e retorná-las", async () => {
    const { statusCode, body } = await request(server)
      .post("/posts")
      .send({
        title: faker.lorem.words(4),
        content: faker.lorem.paragraph(2),
        tags: [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()],
      })
      .set("Authorization", `Bearer ${token}`)

    expect(statusCode).toBe(200)
    expect(body).not.toBeNull()
    expect(Array.isArray(body.tags)).toBeTruthy()

    post = body
  })

  it("Deve adicionar um arquivo ao post criado", async () => {
    const { statusCode, body } = await request(server)
      .put("/post/" + post.id + "/files")
      .attach("file1", __dirname + "/assets/pfp.jpg")
      .set("Authorization", `Bearer ${token}`)

    expect(statusCode).toBe(200)
    expect(body).not.toBeNull()
  })

  it("Deve alterar um post e publica-lo", async () => {
    const { statusCode, body } = await request(server)
      .put("/post/" + post.id)
      .set("Authorization", `Bearer ${token}`)
      .send({ publish: true, title: "Hello world! 2" })

    expect(statusCode).toBe(200)
    expect(body).not.toBeNull()
  })

  it("Deve retornar o arquivo de um post", async () => {
    const { body } = await request(server).get("/post/" + post.id)

    const { statusCode } = await request(server).get("/file/" + body.files[0])

    expect(statusCode).toBe(200)
  })

  it("Deve dar like em um post", async () => {
    const { body, statusCode } = await request(server)
      .put("/post/" + post.id + "/like")
      .set("Authorization", `Bearer ${token}`)

    expect(statusCode).toBe(200)
    expect(body).toHaveProperty("message")
  })

  it("Deve remover o like de um post", async () => {
    const { body, statusCode } = await request(server)
      .delete("/post/" + post.id + "/like")
      .set("Authorization", `Bearer ${token}`)

    expect(statusCode).toBe(200)
    expect(body).toHaveProperty("message")
  })

  it("Deve retornar todos os posts", async () => {
    const { statusCode, body } = await request(server).get("/posts")

    expect(statusCode).toBe(200)
    expect(body).not.toBeNull()
  })

  it("Deve deletar um post", async () => {
    const { statusCode, body } = await request(server)
      .delete("/post/" + post.id)
      .set("Authorization", `Bearer ${token}`)

    expect(statusCode).toBe(200)
    expect(body).toHaveProperty("message")
  })
})
