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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.imap = void 0;
const imap_1 = __importDefault(require("imap"));
const mailparser_1 = require("mailparser");
const db_1 = require("./db");
const creditmail_1 = require("./mailer/creditmail");
// IMAP Configuration (Update with your email provider settings)
const imapConfig = {
    user: (_a = process.env.SENDER_EMAIL) !== null && _a !== void 0 ? _a : "",
    password: (_b = process.env.MAIL_PASS) !== null && _b !== void 0 ? _b : "",
    host: "imap.gmail.com", // Change for other providers
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
};
exports.imap = new imap_1.default(imapConfig);
const openInbox = (cb) => {
    exports.imap.openBox("INBOX", false, cb);
};
exports.imap.once("ready", () => {
    console.log("IMAP connection ready.");
    openInbox((err) => {
        if (err) {
            console.error("Error opening inbox:", err);
            return;
        }
        console.log("Inbox opened. Listening for new emails...");
        exports.imap.on("mail", () => __awaiter(void 0, void 0, void 0, function* () {
            console.log("New email received. Fetching...");
            exports.imap.search(["UNSEEN"], (err, results) => {
                if (err || !results.length) {
                    console.log("No unread emails found.");
                    return;
                }
                const fetch = exports.imap.fetch(results, { bodies: "", markSeen: true });
                fetch.on("message", (msg) => {
                    let emailData = "";
                    msg.on("body", (stream) => {
                        stream.on("data", (chunk) => {
                            emailData += chunk.toString("utf8");
                        });
                    });
                    msg.on("end", () => __awaiter(void 0, void 0, void 0, function* () {
                        var _a, _b;
                        const parsed = yield (0, mailparser_1.simpleParser)(emailData);
                        console.log("Parsed email:", parsed.subject, parsed.text);
                        if (((_a = parsed.subject) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === "update credit request") {
                            console.log("Processing credit update...");
                            // Extract email sender and process request
                            const senderEmail = (_b = parsed.from) === null || _b === void 0 ? void 0 : _b.value[0].address;
                            if (!senderEmail)
                                return;
                            try {
                                const user = yield db_1.db.user.findUnique({
                                    where: { email: senderEmail },
                                });
                                if (user) {
                                    if (user.redeemed === false) {
                                        yield db_1.db.user.update({
                                            where: { email: senderEmail },
                                            data: { credits: user.credits + 5, redeemed: true }, // Example: Add 10 credits
                                        });
                                        yield (0, creditmail_1.creditmail)({ email: senderEmail, body: "Your credits have been updated successfully!" });
                                        console.log(`Credits updated for ${senderEmail}`);
                                    }
                                    else {
                                        yield (0, creditmail_1.creditmail)({ email: senderEmail, body: "We are not offering credits at the moment. You have already redeemed your credits." });
                                    }
                                }
                                else {
                                    console.log(`No user found for ${senderEmail}`);
                                }
                            }
                            catch (error) {
                                console.error("Database update error:", error);
                            }
                        }
                    }));
                });
                fetch.on("error", (err) => {
                    console.error("Fetch error:", err);
                });
                fetch.on("end", () => {
                    console.log("Finished processing emails.");
                });
            });
        }));
    });
});
exports.imap.once("error", (err) => {
    console.error("IMAP error:", err);
});
exports.imap.once("end", () => {
    console.log("IMAP connection ended.");
});
