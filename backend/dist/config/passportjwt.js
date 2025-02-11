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
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_1 = __importDefault(require("passport"));
const db_1 = require("../lib/db");
const generateTokens_1 = require("../lib/generateTokens");
const ID = process.env.GOOGLE_CLIENT_ID;
const SECRET = process.env.GOOGLE_CLIENT_SECRET;
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: ID !== null && ID !== void 0 ? ID : '',
    clientSecret: SECRET !== null && SECRET !== void 0 ? SECRET : "",
    callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`
}, function (accessToken, refreshToken, profile, cb) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const user = yield db_1.db.user.upsert({
                where: {
                    email: profile._json.email
                },
                update: {
                    isVerified: true
                },
                create: {
                    email: (_a = profile._json.email) !== null && _a !== void 0 ? _a : "",
                    password: String(Math.random() * 12),
                    isVerified: true,
                }
            });
            const token = yield (0, generateTokens_1.generateTokens)(user);
            return cb(null, { user, token });
        }
        catch (e) {
            return cb(e);
        }
    });
}));
