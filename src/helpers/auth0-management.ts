import "server-only";
import { ManagementClient } from "auth0";

export const auth0ManagementClient = new ManagementClient({
  domain: (process.env.AUTH0_ISSUER_BASE_URL as string).replace("https://", ""), // This SDK requires the base URL withouth protocol
  clientId: process.env.AUTH0_CLIENT_ID as string,
  clientSecret: process.env.AUTH0_CLIENT_SECRET as string,
});
