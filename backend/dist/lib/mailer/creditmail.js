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
exports.creditmail = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const transport_1 = require("./transport");
dotenv_1.default.config();
const otp = Math.floor(1000 + Math.random() * 9000);
const otpRoute = `${process.env.FRONTEND_URL}/verify`;
// Looking to send emails in production? Check out our Email API/SMTP product!
const creditmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, body }) {
    try {
        yield transport_1.transporter.sendMail({
            from: '"Starnet"<revvtech16@gmail.com>', // sender address
            to: email, // list of receivers
            subject: "Credits update response", // Subject line
            // text: hashedToken, // plain text body
            html: `
              <h1>${body} 
            <h1>
              `, // html body
        });
        console.log("mail sent");
    }
    catch (e) {
        throw new Error(e.messages);
    }
});
exports.creditmail = creditmail;
