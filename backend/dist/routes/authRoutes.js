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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const generateTokens_1 = require("../lib/generateTokens");
const zod_1 = require("../lib/zod");
const db_1 = require("../lib/db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const sendMail_1 = require("../lib/mailer/sendMail");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_1 = __importDefault(require("passport"));
const router = (0, express_1.Router)();
require("../config/passportjwt");
const agent_1 = require("../lib/llm/agent.");
const creditdec_1 = __importDefault(require("../lib/creditdec"));
const cookieopt = {
    httpOnly: false,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
    // sameSite: 'none',
    path: '/'
};
router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        console.log(body);
        const { email, password } = zod_1.userSchema.parse(body);
        const existinguseremail = yield db_1.db.user.findUnique({
            where: { email: email }
        });
        if (existinguseremail) {
            console.log("called-------------------------------------------------------");
            res.status(409).json({ user: null, message: "Email already exists" });
        }
        else {
            //creating user
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            const newUser = yield db_1.db.user.create({
                data: { email: email || "", password: hashedPassword }
            });
            const { password: newUserpassword } = newUser, rest = __rest(newUser, ["password"]);
            yield (0, sendMail_1.sendEmail)({ email: email || "", uuid: rest.id });
            const token = yield (0, generateTokens_1.generateTokens)(rest);
            res.cookie("accessToken", token, cookieopt);
            res.json({ user: rest, message: "User created successfully!" });
        }
    }
    catch (e) {
        if (e.name === "ZodError") {
            res.status(500).json({ user: null, message: e.issues[0].message });
        }
        res.json({ user: null, error: e });
    }
}));
router.post('/searchdb', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookie = req.cookies.accessToken;
        console.log(cookie);
        const decoded = jsonwebtoken_1.default.decode(cookie);
        console.log(decoded);
        const userId = decoded.id;
        const body = req.body;
        console.log("id-----------------------------------------", userId);
        const llmres = yield Promise.all([(0, agent_1.handleChat)(body.prompt), (0, creditdec_1.default)(userId)]);
        console.log({ llmres });
        res.json(llmres[0]);
    }
    catch (e) {
        console.log(e);
        res.status(501).json({ error: "An error occured" });
    }
}));
router.post('/verifyotp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookie = req.cookies.accessToken;
        const decoded = jsonwebtoken_1.default.decode(cookie);
        console.log("decoded", decoded);
        const { otp: userotp } = req.body;
        console.log(userotp);
        //@ts-ignore
        const email = decoded === null || decoded === void 0 ? void 0 : decoded.email;
        const response = yield db_1.db.user.findUnique({
            where: {
                email
            },
            select: {
                isVerified: true,
                otp: true,
                id: true,
            }
        });
        if (!(response === null || response === void 0 ? void 0 : response.isVerified) && (response === null || response === void 0 ? void 0 : response.otp) != null) {
            const validotp = response.otp.otp;
            if (validotp === Number(userotp)) {
                const newUser = yield db_1.db.user.update({
                    where: {
                        id: response.id
                    },
                    data: {
                        isVerified: true,
                    },
                    select: {
                        id: true,
                        isVerified: true,
                        email: true,
                    }
                });
                const otp = yield db_1.db.otp.delete({
                    where: {
                        userId: response.id
                    }
                });
                const token = yield (0, generateTokens_1.generateTokens)(newUser);
                console.log(token);
                res.cookie('accessToken', token, cookieopt);
                res.json({ message: "verified" });
            }
            else {
                res.json({ error: "invalid otp" });
            }
        }
        if (!(response === null || response === void 0 ? void 0 : response.isVerified) && (response === null || response === void 0 ? void 0 : response.otp) === null) {
            res.json({ error: "otp expired" });
            //resend call
        }
        if (response === null || response === void 0 ? void 0 : response.isVerified) {
            res.json({ message: "already verified" }).redirect(`${process.env.FRONTEND_URL}`);
        }
    }
    catch (e) {
        console.log(e);
        res.send({ error: e });
    }
}));
router.get('/logout', (req, res) => {
    try {
        res.cookie('accessToken', null, {
            httpOnly: false,
            secure: true,
            maxAge: 10,
            sameSite: 'none',
            domain: process.env.NODE_ENV === 'production'
                ? '.vercel.app'
                : 'localhost'
        });
        res.status(200).json({ message: "logout success" });
    }
    catch (e) {
        console.log(e);
    }
});
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const { email, password } = zod_1.userSchema.parse(body);
        const existinguser = yield db_1.db.user.findUnique({
            where: { email: email },
            select: {
                id: true,
                isVerified: true,
                email: true,
                password: true,
            }
        });
        if (!existinguser) {
            res.status(409).json({ error: "Invalid Credentials" });
            return;
        }
        const passwordValidation = yield bcrypt_1.default.compare(password, (existinguser === null || existinguser === void 0 ? void 0 : existinguser.password) || "");
        if (!passwordValidation) {
            res.status(409).json({ error: "Invalid Credentials" });
            return;
        }
        const user = { id: existinguser.id, isVerified: existinguser.isVerified, email: existinguser.email };
        const token = yield (0, generateTokens_1.generateTokens)(user);
        res.cookie("accessToken", token, cookieopt);
        res.json({ user: user, message: "login successfull!" });
    }
    catch (e) {
        if (e.name === "ZodError")
            res.status(500).json({ user: null, message: e.issues[0].message });
        console.log(e);
    }
}));
router.get('/auth/google', passport_1.default.authenticate('google', { session: false, scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport_1.default.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login` }), (req, res) => {
    //@ts-ignore
    const { user, token } = req.user;
    res.cookie('accessToken', token);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
});
router.get('/user/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield db_1.db.user.findUnique({
            where: {
                id
            },
            select: {
                credits: true,
                email: true,
                isVerified: true,
            }
        });
        console.log(user);
        res.status(200).json(user);
    }
    catch (e) {
        res.json({ error: e });
    }
}));
exports.default = router;
