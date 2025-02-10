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
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
dotenv_1.default.config();
const otp = Math.floor(1000 + Math.random() * 9000);
const otpRoute = `${process.env.FRONTEND_URL}/verify`;
// Looking to send emails in production? Check out our Email API/SMTP product!
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.MAIL_PASS
    }
});
const sendEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, uuid }) {
    try {
        yield db_1.db.otp.create({
            data: {
                userId: uuid,
                otp: otp,
            }
        });
        yield transporter.sendMail({
            from: '"POWERCHORD"<anand.utkarsh18@gmail.com>', // sender address
            to: email, // list of receivers
            subject: "Verfy your email", // Subject line
            // text: hashedToken, // plain text body
            html: `
              <h1>otp ${otp} visit ${otpRoute}
            <h1>
              `, // html body
        });
        console.log("mail sent");
    }
    catch (e) {
        throw new Error(e.messages);
    }
});
exports.sendEmail = sendEmail;
