import request from "superagent";

export const LinkedIn = {
  authUrl: (): string => {
    const redirect_url = encodeURIComponent(process.env.REDIRECT_URL as string);
    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&state=987654321&scope=r_liteprofile%20r_emailaddress&client_id=${process.env.LI_CLIENT_ID}&redirect_uri=${redirect_url}`;
  },
  logIn: async (code: string): Promise<Record<string, unknown>> => {
    const res = await request
      .post("https://www.linkedin.com/oauth/v2/accessToken")
      .send("grant_type=authorization_code")
      .send(`redirect_uri=${process.env.REDIRECT_URL}`)
      .send(`client_id=${process.env.LI_CLIENT_ID}`)
      .send(`client_secret=${process.env.LI_CLIENT_SECRET}`)
      .send(`code=${code}`)
      .send(`state=123456789`);

    const profile = await request
      .get(
        "https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,email,localizedLastName,profilePicture(displayImage~digitalmediaAsset:playableStreams))"
      )
      .set("Authorization", `Bearer ${res.body.access_token}`);

    const email = await request
      .get("https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))")
      .set("Authorization", `Bearer ${res.body.access_token}`);

    return {
      user: { ...profile.body, ...email.body },
    };
  },
};
