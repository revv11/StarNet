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
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("passport"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const node_cron_1 = __importDefault(require("node-cron"));
const deleteExpiredOtps_1 = require("./lib/opthandle/deleteExpiredOtps");
require("./config/passportjwt");
const imap_1 = require("./lib/imap");
//CONFIGS
dotenv_1.default.config();
//CONSTANTS
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
const FRONTEND_URL = process.env.FRONTEND_URL;
//CORS
const corsOptions = {
    origin: FRONTEND_URL,
    credentials: true,
    optionsSuccessStatus: 200,
};
//MIDDLEWARES
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)(corsOptions));
app.use(passport_1.default.initialize());
app.use(express_1.default.json());
app.use(authRoutes_1.default);
app.listen(PORT, () => {
    console.log("listening on port", PORT);
});
app.get('/', (req, res) => {
    console.log("hepppppppp");
    res.send("hello")
});
node_cron_1.default.schedule('*/5 * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Running OTP cleanup...');
    yield (0, deleteExpiredOtps_1.deleteExpiredOTPs)();
}));
imap_1.imap.connect();
