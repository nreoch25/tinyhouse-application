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
exports.viewerResolvers = void 0;
const crypto_1 = __importDefault(require("crypto"));
const lib_1 = require("../../../lib");
const utils_1 = require("../../../lib/utils");
const cookieOptions = {
    httpOnly: true,
    sameSite: true,
    signed: true,
    secure: process.env.NODE_ENV === "development" ? false : true,
};
const logInViaLinkedIn = (code, token, db, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const { user } = yield lib_1.LinkedIn.logIn(code);
    if (!user) {
        throw new Error("Google login error");
    }
    // @ts-ignore
    const userName = `${user.localizedFirstName} ${user.localizedLastName}`;
    // @ts-ignore
    const userId = user.id;
    // @ts-ignore
    const userAvatar = (_c = (_b = (_a = user.profilePicture["displayImage~"]) === null || _a === void 0 ? void 0 : _a.elements[0]) === null || _b === void 0 ? void 0 : _b.identifiers[0]) === null || _c === void 0 ? void 0 : _c.identifier;
    // @ts-ignore
    const userEmail = (_e = (_d = user.elements[0]) === null || _d === void 0 ? void 0 : _d["handle~"]) === null || _e === void 0 ? void 0 : _e.emailAddress;
    if (!userId || !userName || !userAvatar || !userEmail) {
        throw new Error("LinkedIn login error");
    }
    const updateRes = yield db.users.findOneAndUpdate({ _id: userId }, {
        $set: {
            name: userName,
            avatar: userAvatar,
            contact: userEmail,
            token,
        },
    }, { returnDocument: "after" });
    let viewer = updateRes.value;
    if (!viewer) {
        const insertResult = yield db.users.insertOne({
            _id: userId,
            token,
            name: userName,
            avatar: userAvatar,
            contact: userEmail,
            income: 0,
            bookings: [],
            listings: [],
        });
        viewer = yield db.users.findOne({ _id: insertResult.insertedId });
    }
    res.cookie("viewer", userId, Object.assign(Object.assign({}, cookieOptions), { maxAge: 365 * 24 * 60 * 60 * 1000 }));
    return viewer;
});
const logInViaGoogle = (code, token, db, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user } = yield lib_1.Google.logIn(code);
    if (!user) {
        throw new Error("Google login error");
    }
    // Names/Photos/Email Lists
    // @ts-ignore
    const userNamesList = user.names && user.names.length ? user.names : null;
    // @ts-ignore
    const userPhotosList = user.photos && user.photos.length ? user.photos : null;
    const userEmailsList = 
    // @ts-ignore
    user.emailAddresses && user.emailAddresses.length ? user.emailAddresses : null;
    // User Display Name
    const userName = userNamesList ? userNamesList[0].displayName : null;
    // User Id
    const userId = userNamesList && userNamesList[0].metadata && userNamesList[0].metadata.source
        ? userNamesList[0].metadata.source.id
        : null;
    // User Avatar
    const userAvatar = userPhotosList && userPhotosList[0].url ? userPhotosList[0].url : null;
    // User Email
    const userEmail = userEmailsList && userEmailsList[0].value ? userEmailsList[0].value : null;
    if (!userId || !userName || !userAvatar || !userEmail) {
        throw new Error("Google login error");
    }
    const updateRes = yield db.users.findOneAndUpdate({ _id: userId }, {
        $set: {
            name: userName,
            avatar: userAvatar,
            contact: userEmail,
            token,
        },
    }, { returnDocument: "after" });
    let viewer = updateRes.value;
    if (!viewer) {
        const insertResult = yield db.users.insertOne({
            _id: userId,
            token,
            name: userName,
            avatar: userAvatar,
            contact: userEmail,
            income: 0,
            bookings: [],
            listings: [],
        });
        viewer = yield db.users.findOne({ _id: insertResult.insertedId });
    }
    res.cookie("viewer", userId, Object.assign(Object.assign({}, cookieOptions), { maxAge: 365 * 24 * 60 * 60 * 1000 }));
    return viewer;
});
const logInViaCookie = (db, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const viewer = yield db.users.findOne({ _id: req.signedCookies.viewer });
    console.log({ viewer });
    if (!viewer) {
        res.clearCookie("viewer", cookieOptions);
    }
    return viewer;
});
const viewerResolvers = {
    Query: {
        googleAuthUrl: () => {
            try {
                return lib_1.Google.authUrl;
            }
            catch (error) {
                throw new Error(`Failed to query Google Auth Url: ${error}`);
            }
        },
        linkedInAuthUrl: () => {
            try {
                return lib_1.LinkedIn.authUrl();
            }
            catch (error) {
                throw new Error(`Failed to query Google Auth Url: ${error}`);
            }
        },
    },
    Mutation: {
        logInCookie: (_root, _args, { db, req, res }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const viewer = yield logInViaCookie(db, req, res);
                if (!viewer) {
                    return { didRequest: true };
                }
                return {
                    _id: viewer._id,
                    token: viewer.token,
                    avatar: viewer.avatar,
                    walletId: viewer.walletId,
                    didRequest: true,
                };
            }
            catch (error) {
                throw new Error(`Failed to log in: ${error}`);
            }
        }),
        logInLinkedIn: (_root, { input }, { db, res }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const code = input ? input.code : null;
                const token = crypto_1.default.randomBytes(16).toString("hex");
                const viewer = code ? yield logInViaLinkedIn(code, token, db, res) : null;
                if (!viewer) {
                    return { didRequest: true };
                }
                return {
                    _id: viewer._id,
                    token: viewer.token,
                    avatar: viewer.avatar,
                    walletId: viewer.walletId,
                    didRequest: true,
                };
            }
            catch (error) {
                throw new Error(`Failed to log in: ${error}`);
            }
        }),
        logInGoogle: (_root, { input }, { db, res }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const code = input ? input.code : null;
                const token = crypto_1.default.randomBytes(16).toString("hex");
                const viewer = code ? yield logInViaGoogle(code, token, db, res) : null;
                if (!viewer) {
                    return { didRequest: true };
                }
                return {
                    _id: viewer._id,
                    token: viewer.token,
                    avatar: viewer.avatar,
                    walletId: viewer.walletId,
                    didRequest: true,
                };
            }
            catch (error) {
                throw new Error(`Failed to log in: ${error}`);
            }
        }),
        logOut: (_root, _args, { res }) => {
            try {
                res.clearCookie("viewer", cookieOptions);
                return { didRequest: true };
            }
            catch (error) {
                throw new Error(`Failed to log out: ${error}`);
            }
        },
        connectStripe: (_root, { input }, { db, req }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { code } = input;
                let viewer = yield (0, utils_1.authorize)(db, req);
                if (!viewer) {
                    throw new Error("viewer cannot be found");
                }
                const wallet = yield lib_1.Stripe.connect(code);
                if (!wallet) {
                    throw new Error("stripe grant error");
                }
                const updateRes = yield db.users.findOneAndUpdate({ _id: viewer._id }, { $set: { walletId: wallet.stripe_user_id } }, { returnDocument: "after" });
                if (!updateRes.value) {
                    throw new Error("viewer could not be updated");
                }
                viewer = updateRes.value;
                return {
                    _id: viewer._id,
                    token: viewer.token,
                    avatar: viewer.avatar,
                    walletId: viewer.walletId,
                    didRequest: true,
                };
            }
            catch (error) {
                throw new Error(`Failed to connect with Stripe: ${error}`);
            }
        }),
        disconnectStripe: (_root, _args, { db, req }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let viewer = yield (0, utils_1.authorize)(db, req);
                if (!viewer) {
                    throw new Error("viewer cannot be found");
                }
                const updateRes = yield db.users.findOneAndUpdate({ _id: viewer._id }, { $set: { walletId: "" } }, { returnDocument: "after" });
                if (!updateRes.value) {
                    throw new Error("viewer could not be updated");
                }
                viewer = updateRes.value;
                return {
                    _id: viewer._id,
                    token: viewer.token,
                    avatar: viewer.avatar,
                    walletId: viewer.walletId,
                    didRequest: true,
                };
            }
            catch (error) {
                throw new Error(`Failed to disconnect with Stripe: ${error}`);
            }
        }),
    },
    Viewer: {
        id: (viewer) => viewer._id,
        hasWallet: (viewer) => (viewer.walletId ? true : undefined),
    },
};
exports.viewerResolvers = viewerResolvers;