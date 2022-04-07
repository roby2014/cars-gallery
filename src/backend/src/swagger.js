const swaggerAutogen = require("swagger-autogen")();

const output = __dirname + "/assets/swagger_output.json";
const endpoints = [__dirname + "/routes.ts"];

swaggerAutogen(output, endpoints);
