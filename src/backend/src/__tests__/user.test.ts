import request from "supertest"
import server from "../index"
import faker from "faker"
import { newUser } from "./factory/user"

describe("Inicio dos testes na rota de usuarios", () => {
  let user = newUser()

  it("Deve registrar um novo usuário e retornar a token + usuário criado", async () => {
    const { body, statusCode } = await request(server)
      .post("/register")
      .send(user)

    expect(statusCode).toEqual(200)
    expect(body).toHaveProperty("token")
    expect(body).toHaveProperty("user")

    Object.assign(user, { id: body.user.id })
  })

  it("Deve dar login em um usuário", async () => {
    const { body, statusCode } = await request(server).post("/login").send(user)

    expect(statusCode).toEqual(200)
    expect(body).toHaveProperty("token")
  })

  it("Deve retornar um erro de senha incorreta", async () => {
    const { statusCode } = await request(server)
      .post("/login")
      .send({ ...user, password: "123" })

    expect(statusCode).toEqual(401)
  })

  it("Deve alterar alguma informação do usuario", async () => {
    const { body: bodyLogin } = await request(server).post("/login").send(user)

    const { token } = bodyLogin

    const { statusCode, body } = await request(server)
      .put("/user")
      .set("Authorization", `Bearer ${token}`)
      .send({
        age: 30,
        country: "USA",
        password: user.password,
      })

    expect(statusCode).toBe(200)
    expect(body).not.toBeNull()
  })

  it("Deve alterar a senha do usuario", async () => {
    const { body: bodyLogin } = await request(server).post("/login").send(user)

    const { token } = bodyLogin

    const newPassword = faker.internet.password()

    const { statusCode } = await request(server)
      .put("/user")
      .set("Authorization", `Bearer ${token}`)
      .send({
        oldPassword: user.password,
        newPassword,
        confirmPassword: newPassword,
      })

    expect(statusCode).toBe(200)

    Object.assign(user, { password: newPassword })
  })

  it("Deve enviar uma foto de perfil", async () => {
    const { body: bodyLogin } = await request(server).post("/login").send(user)

    const { token } = bodyLogin

    const { statusCode } = await request(server)
      .post("/avatar")
      .set("Authorization", `Bearer ${token}`)
      .attach("avatar", __dirname + "/assets/pfp.jpg")

    expect(statusCode).toBe(200)
  })

  it("Deve autenticar um usuario e retornar suas informações", async () => {
    const { body: bodyLogin } = await request(server).post("/login").send(user)

    const { token } = bodyLogin

    const { statusCode, body } = await request(server)
      .get("/authenticate")
      .set("Authorization", `Bearer ${token}`)

    expect(statusCode).toBe(200)
    expect(body).not.toBeNull()
  })

  it("Deve retornar um usuario pelo ID", async () => {
    const { body, statusCode } = await request(server).get("/user/" + user.id)

    expect(statusCode).toBe(200)
    expect(body).not.toBeNull()
  })

  it("Deve deletar um usuario", async () => {
    const { body: bodyLogin } = await request(server).post("/login").send(user)

    const { token } = bodyLogin

    const { statusCode } = await request(server)
      .delete("/user")
      .set("Authorization", `Bearer ${token}`)

    expect(statusCode).toBe(200)
  })
})
