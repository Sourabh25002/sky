import { inngest } from "../client.ts";

export const helloFunction = inngest.createFunction(
  { id: "hello-world-function" },
  { event: "app/hello.world" },
  async () => {
    return { message: "Hello World!" };
  }
);
