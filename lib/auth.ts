import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

type GoogleTokenRefreshResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
};

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

async function refreshGoogleAccessToken(refreshToken: string) {
  const tokenUrl = "https://oauth2.googleapis.com/token";
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const payload = (await response.json()) as GoogleTokenRefreshResponse & { error?: string };
  if (!response.ok || !payload.access_token) {
    const reason = payload.error || "unknown_refresh_error";
    throw new Error(`GOOGLE_REFRESH_FAILED:${reason}`);
  }

  return payload;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.modify",
          access_type: "offline",
          include_granted_scopes: "true",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // On initial sign-in, store the access token
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token || token.refreshToken;
        token.expiresAt = account.expires_at;
        return token;
      }

      const expiresAt = token.expiresAt as number | undefined;
      const refreshToken = token.refreshToken as string | undefined;
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const safetyWindow = 60;

      if (expiresAt && nowInSeconds < expiresAt - safetyWindow) {
        return token;
      }

      if (!refreshToken) {
        token.authError = "MissingRefreshToken";
        return token;
      }

      try {
        const refreshed = await refreshGoogleAccessToken(refreshToken);
        token.accessToken = refreshed.access_token;
        token.expiresAt = nowInSeconds + refreshed.expires_in;
        token.refreshToken = refreshed.refresh_token || refreshToken;
        token.authError = undefined;
      } catch (error) {
        console.error("Google token refresh failed:", error);
        token.authError = "RefreshAccessTokenError";
      }

      return token;
    },
    async session({ session, token }) {
      // Make access token available in clientside session
      session.accessToken = token.accessToken as string;
      session.authError = token.authError as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8 hours
  },
});
