"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.AppService = void 0;
var common_1 = require("@nestjs/common");
var jimp_1 = require("jimp");
var ipfs_http_client_1 = require("ipfs-http-client");
var AppService = /** @class */ (function () {
    function AppService() {
    }
    AppService.prototype.mintNFT = function (gameNo, winner, loser) {
        return __awaiter(this, void 0, void 0, function () {
            var node, image, dateObj, month, date, font, buffer, file, res, URI_Obj, URI;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        node = ipfs_http_client_1["default"].create({
                            host: 'ipfs.infura.io',
                            port: 5001,
                            protocol: 'https'
                        });
                        return [4 /*yield*/, jimp_1["default"].read('NFTTemplate.png')];
                    case 1:
                        image = _a.sent();
                        if (!image) {
                            console.log('error reading image');
                            return [2 /*return*/];
                        }
                        dateObj = new Date();
                        month = [
                            'Jan',
                            'Feb',
                            'Mar',
                            'Apr',
                            'May',
                            'Jun',
                            'Jul',
                            'Aug',
                            'Sep',
                            'Oct',
                            'Nov',
                            'Dec',
                        ];
                        date = dateObj.getDate() +
                            ' ' +
                            month[dateObj.getMonth()] +
                            ' ' +
                            dateObj.getFullYear();
                        image.quality(100);
                        return [4 /*yield*/, jimp_1["default"].loadFont(jimp_1["default"].FONT_SANS_32_WHITE)];
                    case 2:
                        font = _a.sent();
                        if (!font) {
                            console.log('error loading font');
                            return [2 /*return*/];
                        }
                        image.print(font, 150, 539, date);
                        image.print(font, 625, 539, '#' + gameNo);
                        image.print(font, 445, 735, winner.substr(0, 9) + '.....' + winner.substr(33, 42));
                        image.print(font, 445, 840, winner.substr(0, 9) + '.....' + loser.substr(33, 42));
                        return [4 /*yield*/, image.getBufferAsync(jimp_1["default"].MIME_JPEG)];
                    case 3:
                        buffer = _a.sent();
                        if (!buffer) {
                            console.log('error getting buffer');
                            return [2 /*return*/];
                        }
                        file = {
                            path: 'NFTTT-' + gameNo + '.jpg',
                            content: buffer
                        };
                        return [4 /*yield*/, node.add(file)];
                    case 4:
                        res = _a.sent();
                        if (!res) {
                            console.log('error uploading image');
                            return [2 /*return*/];
                        }
                        URI_Obj = {
                            name: 'NFTTT #' + gameNo,
                            description: 'Winner ticket of game ' + gameNo,
                            image: 'https://ipfs.infura.io/ipfs/' + res.cid.toString()
                        };
                        return [4 /*yield*/, node.add(JSON.stringify(URI_Obj))];
                    case 5:
                        URI = _a.sent();
                        console.log('https://ipfs.infura.io/ipfs/' + URI.cid.toString());
                        return [2 /*return*/];
                }
            });
        });
    };
    AppService = __decorate([
        (0, common_1.Injectable)()
    ], AppService);
    return AppService;
}());
exports.AppService = AppService;
