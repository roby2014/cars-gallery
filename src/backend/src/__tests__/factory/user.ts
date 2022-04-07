import faker from "faker"

export function newUser() {
  const user = {
    id: 0,
    email: faker.internet.email(),
    name: faker.name.firstName(),
    age: 18,
    country: "BR",
    birthday: "08 15 2003",
    username: faker.internet.userName(),
    password: faker.internet.password(),
  }

  return user
}
