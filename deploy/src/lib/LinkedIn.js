"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedIn = void 0;
const superagent_1 = __importDefault(require("superagent"));
exports.LinkedIn = {
    authUrl: () => {
        const redirect_url = encodeURIComponent(process.env.REDIRECT_URL);
        return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&state=987654321&scope=r_liteprofile%20r_emailaddress&client_id=${process.env.LI_CLIENT_ID}&redirect_uri=${redirect_url}`;
    },
    logIn: (code) => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield superagent_1.default
            .post("https://www.linkedin.com/oauth/v2/accessToken")
            .send("grant_type=authorization_code")
            .send(`redirect_uri=${process.env.REDIRECT_URL}`)
            .send(`client_id=${process.env.LI_CLIENT_ID}`)
            .send(`client_secret=${process.env.LI_CLIENT_SECRET}`)
            .send(`code=${code}`)
            .send(`state=123456789`);
        const profile = yield superagent_1.default
            .get("https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,email,localizedLastName,profilePicture(displayImage~digitalmediaAsset:playableStreams))")
            .set("Authorization", `Bearer ${res.body.access_token}`);
        const email = yield superagent_1.default
            .get("https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))")
            .set("Authorization", `Bearer ${res.body.access_token}`);
        return {
            user: Object.assign(Object.assign({}, profile.body), email.body),
        };
    }),
};
