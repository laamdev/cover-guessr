import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/.well-known/openid-configuration",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 301,
      headers: {
        Location: `${process.env.CLERK_JWT_ISSUER_DOMAIN}/.well-known/openid-configuration`,
      },
    });
  }),
});

export default http;
