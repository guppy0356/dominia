import type { JWK, JWTPayload } from "jose";
import * as jose from "jose";

export interface JwtHelper {
  publicJwk: JWK;
  createToken: (payload?: JWTPayload) => Promise<string>;
}

export async function createJwtTestHelper(): Promise<JwtHelper> {
  const { privateKey, publicKey } = await jose.generateKeyPair("RS256");

  const publicJwk = await jose.exportJWK(publicKey);
  publicJwk.kid = "test-key-1";
  publicJwk.alg = "RS256";

  const createToken = async (payload: JWTPayload = {}) => {
    return new jose.SignJWT({ sub: "test-user", ...payload })
      .setProtectedHeader({ alg: "RS256", kid: "test-key-1" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(privateKey);
  };

  return { publicJwk, createToken };
}
