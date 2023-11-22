
(function (exports, isomorphicFormData, crossFetch) {
        'use strict'; function __awaiter(thisArg, _arguments, P, generator) {
                function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
                return new (P || (P = Promise))(function (resolve, reject) {
                        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
                        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
                        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
                        step((generator = generator.apply(thisArg, _arguments || [])).next());
                });
        }
        class AppwriteException extends Error { constructor(message, code = 0, type = '', response = '') { super(message); this.name = 'AppwriteException'; this.message = message; this.code = code; this.type = type; this.response = response; } }
        class Appwrite {
                constructor() {
                        this.config = { endpoint: 'https://HOSTNAME/v1', endpointRealtime: '', project: '', key: '', jwt: '', locale: '', mode: '', }; this.headers = { 'x-sdk-version': 'appwrite:web:5.0.0', 'X-Appwrite-Response-Format': '0.15.0', }; this.realtime = {
                                socket: undefined, timeout: undefined, url: '', channels: new Set(), subscriptions: new Map(), subscriptionsCounter: 0, reconnect: true, reconnectAttempts: 0, lastMessage: undefined, connect: () => { clearTimeout(this.realtime.timeout); this.realtime.timeout = window === null || window === void 0 ? void 0 : window.setTimeout(() => { this.realtime.createSocket(); }, 50); }, getTimeout: () => { switch (true) { case this.realtime.reconnectAttempts < 5: return 1000; case this.realtime.reconnectAttempts < 15: return 5000; case this.realtime.reconnectAttempts < 100: return 10000; default: return 60000; } }, createSocket: () => {
                                        var _a, _b; if (this.realtime.channels.size < 1)
                                                return; const channels = new URLSearchParams(); channels.set('project', this.config.project); this.realtime.channels.forEach(channel => { channels.append('channels[]', channel); }); const url = this.config.endpointRealtime + '/realtime?' + channels.toString(); if (url !== this.realtime.url || !this.realtime.socket || ((_a = this.realtime.socket) === null || _a === void 0 ? void 0 : _a.readyState) > WebSocket.OPEN) {
                                                        if (this.realtime.socket && ((_b = this.realtime.socket) === null || _b === void 0 ? void 0 : _b.readyState) < WebSocket.CLOSING) { this.realtime.reconnect = false; this.realtime.socket.close(); }
                                                        this.realtime.url = url; this.realtime.socket = new WebSocket(url); this.realtime.socket.addEventListener('message', this.realtime.onMessage); this.realtime.socket.addEventListener('open', _event => { this.realtime.reconnectAttempts = 0; }); this.realtime.socket.addEventListener('close', event => {
                                                                var _a, _b, _c; if (!this.realtime.reconnect || (((_b = (_a = this.realtime) === null || _a === void 0 ? void 0 : _a.lastMessage) === null || _b === void 0 ? void 0 : _b.type) === 'error' && ((_c = this.realtime) === null || _c === void 0 ? void 0 : _c.lastMessage.data).code === 1008)) { this.realtime.reconnect = true; return; }
                                                                const timeout = this.realtime.getTimeout(); console.error(`Realtime got disconnected. Reconnect will be attempted in ${timeout / 1000} seconds.`, event.reason); setTimeout(() => { this.realtime.reconnectAttempts++; this.realtime.createSocket(); }, timeout);
                                                        });
                                                }
                                }, onMessage: (event) => {
                                        var _a, _b; try {
                                                const message = JSON.parse(event.data); this.realtime.lastMessage = message; switch (message.type) {
                                                        case 'connected': const cookie = JSON.parse((_a = window.localStorage.getItem('cookieFallback')) !== null && _a !== void 0 ? _a : '{}'); const session = cookie === null || cookie === void 0 ? void 0 : cookie[`a_session_${this.config.project}`]; const messageData = message.data; if (session && !messageData.user) { (_b = this.realtime.socket) === null || _b === void 0 ? void 0 : _b.send(JSON.stringify({ type: 'authentication', data: { session } })); }
                                                                break; case 'event': let data = message.data; if (data === null || data === void 0 ? void 0 : data.channels) {
                                                                        const isSubscribed = data.channels.some(channel => this.realtime.channels.has(channel)); if (!isSubscribed)
                                                                                return; this.realtime.subscriptions.forEach(subscription => { if (data.channels.some(channel => subscription.channels.includes(channel))) { setTimeout(() => subscription.callback(data)); } });
                                                                }
                                                                break; case 'error': throw message.data; default: break;
                                                }
                                        }
                                                catch (e) { console.error(e); }
                                }, cleanUp: channels => { this.realtime.channels.forEach(channel => { if (channels.includes(channel)) { let found = Array.from(this.realtime.subscriptions).some(([_key, subscription]) => { return subscription.channels.includes(channel); }); if (!found) { this.realtime.channels.delete(channel); } } }); }
                        }; this.account = {
                                get: () => __awaiter(this, void 0, void 0, function* () { let path = '/account'; let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload); }), create: (userId, email, password, name) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof userId === 'undefined') { throw new AppwriteException('Missing required parameter: "userId"'); }
                                        if (typeof email === 'undefined') { throw new AppwriteException('Missing required parameter: "email"'); }
                                        if (typeof password === 'undefined') { throw new AppwriteException('Missing required parameter: "password"'); }
                                        let path = '/account'; let payload = {}; if (typeof userId !== 'undefined') { payload['userId'] = userId; }
                                        if (typeof email !== 'undefined') { payload['email'] = email; }
                                        if (typeof password !== 'undefined') { payload['password'] = password; }
                                        if (typeof name !== 'undefined') { payload['name'] = name; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), updateEmail: (email, password) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof email === 'undefined') { throw new AppwriteException('Missing required parameter: "email"'); }
                                        if (typeof password === 'undefined') { throw new AppwriteException('Missing required parameter: "password"'); }
                                        let path = '/account/email'; let payload = {}; if (typeof email !== 'undefined') { payload['email'] = email; }
                                        if (typeof password !== 'undefined') { payload['password'] = password; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('patch', uri, { 'content-type': 'application/json', }, payload);
                                }), createJWT: () => __awaiter(this, void 0, void 0, function* () { let path = '/account/jwt'; let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload); }), getLogs: (limit, offset) => __awaiter(this, void 0, void 0, function* () {
                                        let path = '/account/logs'; let payload = {}; if (typeof limit !== 'undefined') { payload['limit'] = limit; }
                                        if (typeof offset !== 'undefined') { payload['offset'] = offset; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), updateName: (name) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof name === 'undefined') { throw new AppwriteException('Missing required parameter: "name"'); }
                                        let path = '/account/name'; let payload = {}; if (typeof name !== 'undefined') { payload['name'] = name; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('patch', uri, { 'content-type': 'application/json', }, payload);
                                }), updatePassword: (password, oldPassword) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof password === 'undefined') { throw new AppwriteException('Missing required parameter: "password"'); }
                                        let path = '/account/password'; let payload = {}; if (typeof password !== 'undefined') { payload['password'] = password; }
                                        if (typeof oldPassword !== 'undefined') { payload['oldPassword'] = oldPassword; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('patch', uri, { 'content-type': 'application/json', }, payload);
                                }), updatePhone: (number, password) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof number === 'undefined') { throw new AppwriteException('Missing required parameter: "number"'); }
                                        if (typeof password === 'undefined') { throw new AppwriteException('Missing required parameter: "password"'); }
                                        let path = '/account/phone'; let payload = {}; if (typeof number !== 'undefined') { payload['number'] = number; }
                                        if (typeof password !== 'undefined') { payload['password'] = password; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('patch', uri, { 'content-type': 'application/json', }, payload);
                                }), getPrefs: () => __awaiter(this, void 0, void 0, function* () { let path = '/account/prefs'; let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload); }), updatePrefs: (prefs) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof prefs === 'undefined') { throw new AppwriteException('Missing required parameter: "prefs"'); }
                                        let path = '/account/prefs'; let payload = {}; if (typeof prefs !== 'undefined') { payload['prefs'] = prefs; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('patch', uri, { 'content-type': 'application/json', }, payload);
                                }), createRecovery: (email, url) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof email === 'undefined') { throw new AppwriteException('Missing required parameter: "email"'); }
                                        if (typeof url === 'undefined') { throw new AppwriteException('Missing required parameter: "url"'); }
                                        let path = '/account/recovery'; let payload = {}; if (typeof email !== 'undefined') { payload['email'] = email; }
                                        if (typeof url !== 'undefined') { payload['url'] = url; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), updateRecovery: (userId, secret, password, passwordAgain) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof userId === 'undefined') { throw new AppwriteException('Missing required parameter: "userId"'); }
                                        if (typeof secret === 'undefined') { throw new AppwriteException('Missing required parameter: "secret"'); }
                                        if (typeof password === 'undefined') { throw new AppwriteException('Missing required parameter: "password"'); }
                                        if (typeof passwordAgain === 'undefined') { throw new AppwriteException('Missing required parameter: "passwordAgain"'); }
                                        let path = '/account/recovery'; let payload = {}; if (typeof userId !== 'undefined') { payload['userId'] = userId; }
                                        if (typeof secret !== 'undefined') { payload['secret'] = secret; }
                                        if (typeof password !== 'undefined') { payload['password'] = password; }
                                        if (typeof passwordAgain !== 'undefined') { payload['passwordAgain'] = passwordAgain; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('put', uri, { 'content-type': 'application/json', }, payload);
                                }), getSessions: () => __awaiter(this, void 0, void 0, function* () { let path = '/account/sessions'; let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload); }), deleteSessions: () => __awaiter(this, void 0, void 0, function* () { let path = '/account/sessions'; let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('delete', uri, { 'content-type': 'application/json', }, payload); }), createAnonymousSession: () => __awaiter(this, void 0, void 0, function* () { let path = '/account/sessions/anonymous'; let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload); }), createEmailSession: (email, password) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof email === 'undefined') { throw new AppwriteException('Missing required parameter: "email"'); }
                                        if (typeof password === 'undefined') { throw new AppwriteException('Missing required parameter: "password"'); }
                                        let path = '/account/sessions/email'; let payload = {}; if (typeof email !== 'undefined') { payload['email'] = email; }
                                        if (typeof password !== 'undefined') { payload['password'] = password; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), createMagicURLSession: (userId, email, url) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof userId === 'undefined') { throw new AppwriteException('Missing required parameter: "userId"'); }
                                        if (typeof email === 'undefined') { throw new AppwriteException('Missing required parameter: "email"'); }
                                        let path = '/account/sessions/magic-url'; let payload = {}; if (typeof userId !== 'undefined') { payload['userId'] = userId; }
                                        if (typeof email !== 'undefined') { payload['email'] = email; }
                                        if (typeof url !== 'undefined') { payload['url'] = url; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), updateMagicURLSession: (userId, secret) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof userId === 'undefined') { throw new AppwriteException('Missing required parameter: "userId"'); }
                                        if (typeof secret === 'undefined') { throw new AppwriteException('Missing required parameter: "secret"'); }
                                        let path = '/account/sessions/magic-url'; let payload = {}; if (typeof userId !== 'undefined') { payload['userId'] = userId; }
                                        if (typeof secret !== 'undefined') { payload['secret'] = secret; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('put', uri, { 'content-type': 'application/json', }, payload);
                                }), createOAuth2Session: (provider, success, failure, scopes) => {
                                        if (typeof provider === 'undefined') { throw new AppwriteException('Missing required parameter: "provider"'); }
                                        let path = '/account/sessions/oauth2/{provider}'.replace('{provider}', provider); let payload = {}; if (typeof success !== 'undefined') { payload['success'] = success; }
                                        if (typeof failure !== 'undefined') { payload['failure'] = failure; }
                                        if (typeof scopes !== 'undefined') { payload['scopes'] = scopes; }
                                        const uri = new URL(this.config.endpoint + path); payload['project'] = this.config.project; for (const [key, value] of Object.entries(this.flatten(payload))) { uri.searchParams.append(key, value); }
                                        if (typeof window !== 'undefined' && (window === null || window === void 0 ? void 0 : window.location)) { window.location.href = uri.toString(); }
                                        else { return uri; }
                                }, createPhoneSession: (userId, number) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof userId === 'undefined') { throw new AppwriteException('Missing required parameter: "userId"'); }
                                        if (typeof number === 'undefined') { throw new AppwriteException('Missing required parameter: "number"'); }
                                        let path = '/account/sessions/phone'; let payload = {}; if (typeof userId !== 'undefined') { payload['userId'] = userId; }
                                        if (typeof number !== 'undefined') { payload['number'] = number; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), updatePhoneSession: (userId, secret) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof userId === 'undefined') { throw new AppwriteException('Missing required parameter: "userId"'); }
                                        if (typeof secret === 'undefined') { throw new AppwriteException('Missing required parameter: "secret"'); }
                                        let path = '/account/sessions/phone'; let payload = {}; if (typeof userId !== 'undefined') { payload['userId'] = userId; }
                                        if (typeof secret !== 'undefined') { payload['secret'] = secret; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('put', uri, { 'content-type': 'application/json', }, payload);
                                }), getSession: (sessionId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof sessionId === 'undefined') { throw new AppwriteException('Missing required parameter: "sessionId"'); }
                                        let path = '/account/sessions/{sessionId}'.replace('{sessionId}', sessionId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), updateSession: (sessionId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof sessionId === 'undefined') { throw new AppwriteException('Missing required parameter: "sessionId"'); }
                                        let path = '/account/sessions/{sessionId}'.replace('{sessionId}', sessionId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('patch', uri, { 'content-type': 'application/json', }, payload);
                                }), deleteSession: (sessionId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof sessionId === 'undefined') { throw new AppwriteException('Missing required parameter: "sessionId"'); }
                                        let path = '/account/sessions/{sessionId}'.replace('{sessionId}', sessionId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('delete', uri, { 'content-type': 'application/json', }, payload);
                                }), updateStatus: () => __awaiter(this, void 0, void 0, function* () { let path = '/account/status'; let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('patch', uri, { 'content-type': 'application/json', }, payload); }), createVerification: (url) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof url === 'undefined') { throw new AppwriteException('Missing required parameter: "url"'); }
                                        let path = '/account/verification'; let payload = {}; if (typeof url !== 'undefined') { payload['url'] = url; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), updateVerification: (userId, secret) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof userId === 'undefined') { throw new AppwriteException('Missing required parameter: "userId"'); }
                                        if (typeof secret === 'undefined') { throw new AppwriteException('Missing required parameter: "secret"'); }
                                        let path = '/account/verification'; let payload = {}; if (typeof userId !== 'undefined') { payload['userId'] = userId; }
                                        if (typeof secret !== 'undefined') { payload['secret'] = secret; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('put', uri, { 'content-type': 'application/json', }, payload);
                                }), createPhoneVerification: () => __awaiter(this, void 0, void 0, function* () { let path = '/account/verification/phone'; let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload); }), updatePhoneVerification: (userId, secret) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof userId === 'undefined') { throw new AppwriteException('Missing required parameter: "userId"'); }
                                        if (typeof secret === 'undefined') { throw new AppwriteException('Missing required parameter: "secret"'); }
                                        let path = '/account/verification/phone'; let payload = {}; if (typeof userId !== 'undefined') { payload['userId'] = userId; }
                                        if (typeof secret !== 'undefined') { payload['secret'] = secret; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('put', uri, { 'content-type': 'application/json', }, payload);
                                })
                        }; this.avatars = {
                                getBrowser: (code, width, height, quality) => {
                                        if (typeof code === 'undefined') { throw new AppwriteException('Missing required parameter: "code"'); }
                                        let path = '/avatars/browsers/{code}'.replace('{code}', code); let payload = {}; if (typeof width !== 'undefined') { payload['width'] = width; }
                                        if (typeof height !== 'undefined') { payload['height'] = height; }
                                        if (typeof quality !== 'undefined') { payload['quality'] = quality; }
                                        const uri = new URL(this.config.endpoint + path); payload['project'] = this.config.project; for (const [key, value] of Object.entries(this.flatten(payload))) { uri.searchParams.append(key, value); }
                                        return uri;
                                }, getCreditCard: (code, width, height, quality) => {
                                        if (typeof code === 'undefined') { throw new AppwriteException('Missing required parameter: "code"'); }
                                        let path = '/avatars/credit-cards/{code}'.replace('{code}', code); let payload = {}; if (typeof width !== 'undefined') { payload['width'] = width; }
                                        if (typeof height !== 'undefined') { payload['height'] = height; }
                                        if (typeof quality !== 'undefined') { payload['quality'] = quality; }
                                        const uri = new URL(this.config.endpoint + path); payload['project'] = this.config.project; for (const [key, value] of Object.entries(this.flatten(payload))) { uri.searchParams.append(key, value); }
                                        return uri;
                                }, getFavicon: (url) => {
                                        if (typeof url === 'undefined') { throw new AppwriteException('Missing required parameter: "url"'); }
                                        let path = '/avatars/favicon'; let payload = {}; if (typeof url !== 'undefined') { payload['url'] = url; }
                                        const uri = new URL(this.config.endpoint + path); payload['project'] = this.config.project; for (const [key, value] of Object.entries(this.flatten(payload))) { uri.searchParams.append(key, value); }
                                        return uri;
                                }, getFlag: (code, width, height, quality) => {
                                        if (typeof code === 'undefined') { throw new AppwriteException('Missing required parameter: "code"'); }
                                        let path = '/avatars/flags/{code}'.replace('{code}', code); let payload = {}; if (typeof width !== 'undefined') { payload['width'] = width; }
                                        if (typeof height !== 'undefined') { payload['height'] = height; }
                                        if (typeof quality !== 'undefined') { payload['quality'] = quality; }
                                        const uri = new URL(this.config.endpoint + path); payload['project'] = this.config.project; for (const [key, value] of Object.entries(this.flatten(payload))) { uri.searchParams.append(key, value); }
                                        return uri;
                                }, getImage: (url, width, height) => {
                                        if (typeof url === 'undefined') { throw new AppwriteException('Missing required parameter: "url"'); }
                                        let path = '/avatars/image'; let payload = {}; if (typeof url !== 'undefined') { payload['url'] = url; }
                                        if (typeof width !== 'undefined') { payload['width'] = width; }
                                        if (typeof height !== 'undefined') { payload['height'] = height; }
                                        const uri = new URL(this.config.endpoint + path); payload['project'] = this.config.project; for (const [key, value] of Object.entries(this.flatten(payload))) { uri.searchParams.append(key, value); }
                                        return uri;
                                }, getInitials: (name, width, height, color, background) => {
                                        let path = '/avatars/initials'; let payload = {}; if (typeof name !== 'undefined') { payload['name'] = name; }
                                        if (typeof width !== 'undefined') { payload['width'] = width; }
                                        if (typeof height !== 'undefined') { payload['height'] = height; }
                                        if (typeof color !== 'undefined') { payload['color'] = color; }
                                        if (typeof background !== 'undefined') { payload['background'] = background; }
                                        const uri = new URL(this.config.endpoint + path); payload['project'] = this.config.project; for (const [key, value] of Object.entries(this.flatten(payload))) { uri.searchParams.append(key, value); }
                                        return uri;
                                }, getQR: (text, size, margin, download) => {
                                        if (typeof text === 'undefined') { throw new AppwriteException('Missing required parameter: "text"'); }
                                        let path = '/avatars/qr'; let payload = {}; if (typeof text !== 'undefined') { payload['text'] = text; }
                                        if (typeof size !== 'undefined') { payload['size'] = size; }
                                        if (typeof margin !== 'undefined') { payload['margin'] = margin; }
                                        if (typeof download !== 'undefined') { payload['download'] = download; }
                                        const uri = new URL(this.config.endpoint + path); payload['project'] = this.config.project; for (const [key, value] of Object.entries(this.flatten(payload))) { uri.searchParams.append(key, value); }
                                        return uri;
                                }
                        }; this.databases = {
                                list: (search, limit, offset, cursor, cursorDirection, orderType) => __awaiter(this, void 0, void 0, function* () {
                                        let path = '/databases'; let payload = {}; if (typeof search !== 'undefined') { payload['search'] = search; }
                                        if (typeof limit !== 'undefined') { payload['limit'] = limit; }
                                        if (typeof offset !== 'undefined') { payload['offset'] = offset; }
                                        if (typeof cursor !== 'undefined') { payload['cursor'] = cursor; }
                                        if (typeof cursorDirection !== 'undefined') { payload['cursorDirection'] = cursorDirection; }
                                        if (typeof orderType !== 'undefined') { payload['orderType'] = orderType; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), create: (databaseId, name) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof name === 'undefined') { throw new AppwriteException('Missing required parameter: "name"'); }
                                        let path = '/databases'; let payload = {}; if (typeof databaseId !== 'undefined') { payload['databaseId'] = databaseId; }
                                        if (typeof name !== 'undefined') { payload['name'] = name; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), getUsage: (range) => __awaiter(this, void 0, void 0, function* () {
                                        let path = '/databases/usage'; let payload = {}; if (typeof range !== 'undefined') { payload['range'] = range; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), get: (databaseId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        let path = '/databases/{databaseId}'.replace('{databaseId}', databaseId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), update: (databaseId, name) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof name === 'undefined') { throw new AppwriteException('Missing required parameter: "name"'); }
                                        let path = '/databases/{databaseId}'.replace('{databaseId}', databaseId); let payload = {}; if (typeof name !== 'undefined') { payload['name'] = name; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('put', uri, { 'content-type': 'application/json', }, payload);
                                }), delete: (databaseId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        let path = '/databases/{databaseId}'.replace('{databaseId}', databaseId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('delete', uri, { 'content-type': 'application/json', }, payload);
                                }), listCollections: (databaseId, search, limit, offset, cursor, cursorDirection, orderType) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        let path = '/databases/{databaseId}/collections'.replace('{databaseId}', databaseId); let payload = {}; if (typeof search !== 'undefined') { payload['search'] = search; }
                                        if (typeof limit !== 'undefined') { payload['limit'] = limit; }
                                        if (typeof offset !== 'undefined') { payload['offset'] = offset; }
                                        if (typeof cursor !== 'undefined') { payload['cursor'] = cursor; }
                                        if (typeof cursorDirection !== 'undefined') { payload['cursorDirection'] = cursorDirection; }
                                        if (typeof orderType !== 'undefined') { payload['orderType'] = orderType; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), createCollection: (databaseId, collectionId, name, permission, read, write) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        if (typeof name === 'undefined') { throw new AppwriteException('Missing required parameter: "name"'); }
                                        if (typeof permission === 'undefined') { throw new AppwriteException('Missing required parameter: "permission"'); }
                                        if (typeof read === 'undefined') { throw new AppwriteException('Missing required parameter: "read"'); }
                                        if (typeof write === 'undefined') { throw new AppwriteException('Missing required parameter: "write"'); }
                                        let path = '/databases/{databaseId}/collections'.replace('{databaseId}', databaseId); let payload = {}; if (typeof collectionId !== 'undefined') { payload['collectionId'] = collectionId; }
                                        if (typeof name !== 'undefined') { payload['name'] = name; }
                                        if (typeof permission !== 'undefined') { payload['permission'] = permission; }
                                        if (typeof read !== 'undefined') { payload['read'] = read; }
                                        if (typeof write !== 'undefined') { payload['write'] = write; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), getCollection: (databaseId, collectionId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        let path = '/databases/{databaseId}/collections/{collectionId}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), updateCollection: (databaseId, collectionId, name, permission, read, write, enabled) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        if (typeof name === 'undefined') { throw new AppwriteException('Missing required parameter: "name"'); }
                                        if (typeof permission === 'undefined') { throw new AppwriteException('Missing required parameter: "permission"'); }
                                        let path = '/databases/{databaseId}/collections/{collectionId}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId); let payload = {}; if (typeof name !== 'undefined') { payload['name'] = name; }
                                        if (typeof permission !== 'undefined') { payload['permission'] = permission; }
                                        if (typeof read !== 'undefined') { payload['read'] = read; }
                                        if (typeof write !== 'undefined') { payload['write'] = write; }
                                        if (typeof enabled !== 'undefined') { payload['enabled'] = enabled; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('put', uri, { 'content-type': 'application/json', }, payload);
                                }), deleteCollection: (databaseId, collectionId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        let path = '/databases/{databaseId}/collections/{collectionId}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('delete', uri, { 'content-type': 'application/json', }, payload);
                                }), listAttributes: (databaseId, collectionId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        let path = '/databases/{databaseId}/collections/{collectionId}/attributes'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), createBooleanAttribute: (databaseId, collectionId, key, required, xdefault, array) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        if (typeof key === 'undefined') { throw new AppwriteException('Missing required parameter: "key"'); }
                                        if (typeof required === 'undefined') { throw new AppwriteException('Missing required parameter: "required"'); }
                                        let path = '/databases/{databaseId}/collections/{collectionId}/attributes/boolean'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId); let payload = {}; if (typeof key !== 'undefined') { payload['key'] = key; }
                                        if (typeof required !== 'undefined') { payload['required'] = required; }
                                        if (typeof xdefault !== 'undefined') { payload['default'] = xdefault; }
                                        if (typeof array !== 'undefined') { payload['array'] = array; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), createEmailAttribute: (databaseId, collectionId, key, required, xdefault, array) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        if (typeof key === 'undefined') { throw new AppwriteException('Missing required parameter: "key"'); }
                                        if (typeof required === 'undefined') { throw new AppwriteException('Missing required parameter: "required"'); }
                                        let path = '/databases/{databaseId}/collections/{collectionId}/attributes/email'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId); let payload = {}; if (typeof key !== 'undefined') { payload['key'] = key; }
                                        if (typeof required !== 'undefined') { payload['required'] = required; }
                                        if (typeof xdefault !== 'undefined') { payload['default'] = xdefault; }
                                        if (typeof array !== 'undefined') { payload['array'] = array; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), createEnumAttribute: (databaseId, collectionId, key, elements, required, xdefault, array) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        if (typeof key === 'undefined') { throw new AppwriteException('Missing required parameter: "key"'); }
                                        if (typeof elements === 'undefined') { throw new AppwriteException('Missing required parameter: "elements"'); }
                                        if (typeof required === 'undefined') { throw new AppwriteException('Missing required parameter: "required"'); }
                                        let path = '/databases/{databaseId}/collections/{collectionId}/attributes/enum'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId); let payload = {}; if (typeof key !== 'undefined') { payload['key'] = key; }
                                        if (typeof elements !== 'undefined') { payload['elements'] = elements; }
                                        if (typeof required !== 'undefined') { payload['required'] = required; }
                                        if (typeof xdefault !== 'undefined') { payload['default'] = xdefault; }
                                        if (typeof array !== 'undefined') { payload['array'] = array; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), createFloatAttribute: (databaseId, collectionId, key, required, min, max, xdefault, array) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        if (typeof key === 'undefined') { throw new AppwriteException('Missing required parameter: "key"'); }
                                        if (typeof required === 'undefined') { throw new AppwriteException('Missing required parameter: "required"'); }
                                        let path = '/databases/{databaseId}/collections/{collectionId}/attributes/float'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId); let payload = {}; if (typeof key !== 'undefined') { payload['key'] = key; }
                                        if (typeof required !== 'undefined') { payload['required'] = required; }
                                        if (typeof min !== 'undefined') { payload['min'] = min; }
                                        if (typeof max !== 'undefined') { payload['max'] = max; }
                                        if (typeof xdefault !== 'undefined') { payload['default'] = xdefault; }
                                        if (typeof array !== 'undefined') { payload['array'] = array; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), createIntegerAttribute: (databaseId, collectionId, key, required, min, max, xdefault, array) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        if (typeof key === 'undefined') { throw new AppwriteException('Missing required parameter: "key"'); }
                                        if (typeof required === 'undefined') { throw new AppwriteException('Missing required parameter: "required"'); }
                                        let path = '/databases/{databaseId}/collections/{collectionId}/attributes/integer'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId); let payload = {}; if (typeof key !== 'undefined') { payload['key'] = key; }
                                        if (typeof required !== 'undefined') { payload['required'] = required; }
                                        if (typeof min !== 'undefined') { payload['min'] = min; }
                                        if (typeof max !== 'undefined') { payload['max'] = max; }
                                        if (typeof xdefault !== 'undefined') { payload['default'] = xdefault; }
                                        if (typeof array !== 'undefined') { payload['array'] = array; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), createIpAttribute: (databaseId, collectionId, key, required, xdefault, array) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        if (typeof key === 'undefined') { throw new AppwriteException('Missing required parameter: "key"'); }
                                        if (typeof required === 'undefined') { throw new AppwriteException('Missing required parameter: "required"'); }
                                        let path = '/databases/{databaseId}/collections/{collectionId}/attributes/ip'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId); let payload = {}; if (typeof key !== 'undefined') { payload['key'] = key; }
                                        if (typeof required !== 'undefined') { payload['required'] = required; }
                                        if (typeof xdefault !== 'undefined') { payload['default'] = xdefault; }
                                        if (typeof array !== 'undefined') { payload['array'] = array; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), createStringAttribute: (databaseId, collectionId, key, size, required, xdefault, array) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        if (typeof key === 'undefined') { throw new AppwriteException('Missing required parameter: "key"'); }
                                        if (typeof size === 'undefined') { throw new AppwriteException('Missing required parameter: "size"'); }
                                        if (typeof required === 'undefined') { throw new AppwriteException('Missing required parameter: "required"'); }
                                        let path = '/databases/{databaseId}/collections/{collectionId}/attributes/string'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId); let payload = {}; if (typeof key !== 'undefined') { payload['key'] = key; }
                                        if (typeof size !== 'undefined') { payload['size'] = size; }
                                        if (typeof required !== 'undefined') { payload['required'] = required; }
                                        if (typeof xdefault !== 'undefined') { payload['default'] = xdefault; }
                                        if (typeof array !== 'undefined') { payload['array'] = array; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), createUrlAttribute: (databaseId, collectionId, key, required, xdefault, array) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        if (typeof key === 'undefined') { throw new AppwriteException('Missing required parameter: "key"'); }
                                        if (typeof required === 'undefined') { throw new AppwriteException('Missing required parameter: "required"'); }
                                        let path = '/databases/{databaseId}/collections/{collectionId}/attributes/url'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId); let payload = {}; if (typeof key !== 'undefined') { payload['key'] = key; }
                                        if (typeof required !== 'undefined') { payload['required'] = required; }
                                        if (typeof xdefault !== 'undefined') { payload['default'] = xdefault; }
                                        if (typeof array !== 'undefined') { payload['array'] = array; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), getAttribute: (databaseId, collectionId, key) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        if (typeof key === 'undefined') { throw new AppwriteException('Missing required parameter: "key"'); }
                                        let path = '/databases/{databaseId}/collections/{collectionId}/attributes/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), deleteAttribute: (databaseId, collectionId, key) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        if (typeof key === 'undefined') { throw new AppwriteException('Missing required parameter: "key"'); }
                                        let path = '/databases/{databaseId}/collections/{collectionId}/attributes/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('delete', uri, { 'content-type': 'application/json', }, payload);
                                }), listDocuments: (databaseId, collectionId, queries, limit, offset, cursor, cursorDirection, orderAttributes, orderTypes) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        let path = '/databases/{databaseId}/collections/{collectionId}/documents'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId); let payload = {}; if (typeof queries !== 'undefined') { payload['queries'] = queries; }
                                        if (typeof limit !== 'undefined') { payload['limit'] = limit; }
                                        if (typeof offset !== 'undefined') { payload['offset'] = offset; }
                                        if (typeof cursor !== 'undefined') { payload['cursor'] = cursor; }
                                        if (typeof cursorDirection !== 'undefined') { payload['cursorDirection'] = cursorDirection; }
                                        if (typeof orderAttributes !== 'undefined') { payload['orderAttributes'] = orderAttributes; }
                                        if (typeof orderTypes !== 'undefined') { payload['orderTypes'] = orderTypes; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), createDocument: (databaseId, collectionId, documentId, data, read, write) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        if (typeof documentId === 'undefined') { throw new AppwriteException('Missing required parameter: "documentId"'); }
                                        if (typeof data === 'undefined') { throw new AppwriteException('Missing required parameter: "data"'); }
                                        let path = '/databases/{databaseId}/collections/{collectionId}/documents'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId); let payload = {}; if (typeof documentId !== 'undefined') { payload['documentId'] = documentId; }
                                        if (typeof data !== 'undefined') { payload['data'] = data; }
                                        if (typeof read !== 'undefined') { payload['read'] = read; }
                                        if (typeof write !== 'undefined') { payload['write'] = write; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), getDocument: (databaseId, collectionId, documentId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        if (typeof documentId === 'undefined') { throw new AppwriteException('Missing required parameter: "documentId"'); }
                                        let path = '/databases/{databaseId}/collections/{collectionId}/documents/{documentId}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{documentId}', documentId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), updateDocument: (databaseId, collectionId, documentId, data, read, write) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        if (typeof documentId === 'undefined') { throw new AppwriteException('Missing required parameter: "documentId"'); }
                                        if (typeof data === 'undefined') { throw new AppwriteException('Missing required parameter: "data"'); }
                                        let path = '/databases/{databaseId}/collections/{collectionId}/documents/{documentId}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{documentId}', documentId); let payload = {}; if (typeof data !== 'undefined') { payload['data'] = data; }
                                        if (typeof read !== 'undefined') { payload['read'] = read; }
                                        if (typeof write !== 'undefined') { payload['write'] = write; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('patch', uri, { 'content-type': 'application/json', }, payload);
                                }), deleteDocument: (databaseId, collectionId, documentId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        if (typeof documentId === 'undefined') { throw new AppwriteException('Missing required parameter: "documentId"'); }
                                        let path = '/databases/{databaseId}/collections/{collectionId}/documents/{documentId}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{documentId}', documentId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('delete', uri, { 'content-type': 'application/json', }, payload);
                                }), listDocumentLogs: (databaseId, collectionId, documentId, limit, offset) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        if (typeof documentId === 'undefined') { throw new AppwriteException('Missing required parameter: "documentId"'); }
                                        let path = '/databases/{databaseId}/collections/{collectionId}/documents/{documentId}/logs'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{documentId}', documentId); let payload = {}; if (typeof limit !== 'undefined') { payload['limit'] = limit; }
                                        if (typeof offset !== 'undefined') { payload['offset'] = offset; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), listIndexes: (databaseId, collectionId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        let path = '/databases/{databaseId}/collections/{collectionId}/indexes'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), createIndex: (databaseId, collectionId, key, type, attributes, orders) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        if (typeof key === 'undefined') { throw new AppwriteException('Missing required parameter: "key"'); }
                                        if (typeof type === 'undefined') { throw new AppwriteException('Missing required parameter: "type"'); }
                                        if (typeof attributes === 'undefined') { throw new AppwriteException('Missing required parameter: "attributes"'); }
                                        let path = '/databases/{databaseId}/collections/{collectionId}/indexes'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId); let payload = {}; if (typeof key !== 'undefined') { payload['key'] = key; }
                                        if (typeof type !== 'undefined') { payload['type'] = type; }
                                        if (typeof attributes !== 'undefined') { payload['attributes'] = attributes; }
                                        if (typeof orders !== 'undefined') { payload['orders'] = orders; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), getIndex: (databaseId, collectionId, key) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        if (typeof key === 'undefined') { throw new AppwriteException('Missing required parameter: "key"'); }
                                        let path = '/databases/{databaseId}/collections/{collectionId}/indexes/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), deleteIndex: (databaseId, collectionId, key) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        if (typeof key === 'undefined') { throw new AppwriteException('Missing required parameter: "key"'); }
                                        let path = '/databases/{databaseId}/collections/{collectionId}/indexes/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('delete', uri, { 'content-type': 'application/json', }, payload);
                                }), listCollectionLogs: (databaseId, collectionId, limit, offset) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        let path = '/databases/{databaseId}/collections/{collectionId}/logs'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId); let payload = {}; if (typeof limit !== 'undefined') { payload['limit'] = limit; }
                                        if (typeof offset !== 'undefined') { payload['offset'] = offset; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), getCollectionUsage: (databaseId, collectionId, range) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        if (typeof collectionId === 'undefined') { throw new AppwriteException('Missing required parameter: "collectionId"'); }
                                        let path = '/databases/{databaseId}/collections/{collectionId}/usage'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId); let payload = {}; if (typeof range !== 'undefined') { payload['range'] = range; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), listLogs: (databaseId, limit, offset) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        let path = '/databases/{databaseId}/logs'.replace('{databaseId}', databaseId); let payload = {}; if (typeof limit !== 'undefined') { payload['limit'] = limit; }
                                        if (typeof offset !== 'undefined') { payload['offset'] = offset; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), getDatabaseUsage: (databaseId, range) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof databaseId === 'undefined') { throw new AppwriteException('Missing required parameter: "databaseId"'); }
                                        let path = '/databases/{databaseId}/usage'.replace('{databaseId}', databaseId); let payload = {}; if (typeof range !== 'undefined') { payload['range'] = range; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                })
                        }; this.functions = {
                                list: (search, limit, offset, cursor, cursorDirection, orderType) => __awaiter(this, void 0, void 0, function* () {
                                        let path = '/functions'; let payload = {}; if (typeof search !== 'undefined') { payload['search'] = search; }
                                        if (typeof limit !== 'undefined') { payload['limit'] = limit; }
                                        if (typeof offset !== 'undefined') { payload['offset'] = offset; }
                                        if (typeof cursor !== 'undefined') { payload['cursor'] = cursor; }
                                        if (typeof cursorDirection !== 'undefined') { payload['cursorDirection'] = cursorDirection; }
                                        if (typeof orderType !== 'undefined') { payload['orderType'] = orderType; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), create: (functionId, name, execute, runtime, vars, events, schedule, timeout) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof functionId === 'undefined') { throw new AppwriteException('Missing required parameter: "functionId"'); }
                                        if (typeof name === 'undefined') { throw new AppwriteException('Missing required parameter: "name"'); }
                                        if (typeof execute === 'undefined') { throw new AppwriteException('Missing required parameter: "execute"'); }
                                        if (typeof runtime === 'undefined') { throw new AppwriteException('Missing required parameter: "runtime"'); }
                                        let path = '/functions'; let payload = {}; if (typeof functionId !== 'undefined') { payload['functionId'] = functionId; }
                                        if (typeof name !== 'undefined') { payload['name'] = name; }
                                        if (typeof execute !== 'undefined') { payload['execute'] = execute; }
                                        if (typeof runtime !== 'undefined') { payload['runtime'] = runtime; }
                                        if (typeof vars !== 'undefined') { payload['vars'] = vars; }
                                        if (typeof events !== 'undefined') { payload['events'] = events; }
                                        if (typeof schedule !== 'undefined') { payload['schedule'] = schedule; }
                                        if (typeof timeout !== 'undefined') { payload['timeout'] = timeout; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), listRuntimes: () => __awaiter(this, void 0, void 0, function* () { let path = '/functions/runtimes'; let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload); }), get: (functionId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof functionId === 'undefined') { throw new AppwriteException('Missing required parameter: "functionId"'); }
                                        let path = '/functions/{functionId}'.replace('{functionId}', functionId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), update: (functionId, name, execute, vars, events, schedule, timeout) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof functionId === 'undefined') { throw new AppwriteException('Missing required parameter: "functionId"'); }
                                        if (typeof name === 'undefined') { throw new AppwriteException('Missing required parameter: "name"'); }
                                        if (typeof execute === 'undefined') { throw new AppwriteException('Missing required parameter: "execute"'); }
                                        let path = '/functions/{functionId}'.replace('{functionId}', functionId); let payload = {}; if (typeof name !== 'undefined') { payload['name'] = name; }
                                        if (typeof execute !== 'undefined') { payload['execute'] = execute; }
                                        if (typeof vars !== 'undefined') { payload['vars'] = vars; }
                                        if (typeof events !== 'undefined') { payload['events'] = events; }
                                        if (typeof schedule !== 'undefined') { payload['schedule'] = schedule; }
                                        if (typeof timeout !== 'undefined') { payload['timeout'] = timeout; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('put', uri, { 'content-type': 'application/json', }, payload);
                                }), delete: (functionId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof functionId === 'undefined') { throw new AppwriteException('Missing required parameter: "functionId"'); }
                                        let path = '/functions/{functionId}'.replace('{functionId}', functionId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('delete', uri, { 'content-type': 'application/json', }, payload);
                                }), listDeployments: (functionId, search, limit, offset, cursor, cursorDirection, orderType) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof functionId === 'undefined') { throw new AppwriteException('Missing required parameter: "functionId"'); }
                                        let path = '/functions/{functionId}/deployments'.replace('{functionId}', functionId); let payload = {}; if (typeof search !== 'undefined') { payload['search'] = search; }
                                        if (typeof limit !== 'undefined') { payload['limit'] = limit; }
                                        if (typeof offset !== 'undefined') { payload['offset'] = offset; }
                                        if (typeof cursor !== 'undefined') { payload['cursor'] = cursor; }
                                        if (typeof cursorDirection !== 'undefined') { payload['cursorDirection'] = cursorDirection; }
                                        if (typeof orderType !== 'undefined') { payload['orderType'] = orderType; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), createDeployment: (functionId, entrypoint, code, activate, onProgress = (progress) => { }) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof functionId === 'undefined') { throw new AppwriteException('Missing required parameter: "functionId"'); }
                                        if (typeof entrypoint === 'undefined') { throw new AppwriteException('Missing required parameter: "entrypoint"'); }
                                        if (typeof code === 'undefined') { throw new AppwriteException('Missing required parameter: "code"'); }
                                        if (typeof activate === 'undefined') { throw new AppwriteException('Missing required parameter: "activate"'); }
                                        let path = '/functions/{functionId}/deployments'.replace('{functionId}', functionId); let payload = {}; if (typeof entrypoint !== 'undefined') { payload['entrypoint'] = entrypoint; }
                                        if (typeof code !== 'undefined') { payload['code'] = code; }
                                        if (typeof activate !== 'undefined') { payload['activate'] = activate; }
                                        const uri = new URL(this.config.endpoint + path); if (!(code instanceof File)) { throw new AppwriteException('Parameter "code" has to be a File.'); }
                                        const size = code.size; if (size <= Appwrite.CHUNK_SIZE) { return yield this.call('post', uri, { 'content-type': 'multipart/form-data', }, payload); }
                                        let id = undefined; let response = undefined; const headers = { 'content-type': 'multipart/form-data', }; let counter = 0; const totalCounters = Math.ceil(size / Appwrite.CHUNK_SIZE); for (counter; counter < totalCounters; counter++) {
                                                const start = (counter * Appwrite.CHUNK_SIZE); const end = Math.min((((counter * Appwrite.CHUNK_SIZE) + Appwrite.CHUNK_SIZE) - 1), size); headers['content-range'] = 'bytes ' + start + '-' + end + '/' + size; if (id) { headers['x-appwrite-id'] = id; }
                                                const stream = code.slice(start, end + 1); payload['code'] = new File([stream], code.name); response = yield this.call('post', uri, headers, payload); if (!id) { id = response['$id']; }
                                                if (onProgress) { onProgress({ $id: response.$id, progress: Math.min((counter + 1) * Appwrite.CHUNK_SIZE - 1, size) / size * 100, sizeUploaded: end, chunksTotal: response.chunksTotal, chunksUploaded: response.chunksUploaded }); }
                                        }
                                        return response;
                                }), getDeployment: (functionId, deploymentId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof functionId === 'undefined') { throw new AppwriteException('Missing required parameter: "functionId"'); }
                                        if (typeof deploymentId === 'undefined') { throw new AppwriteException('Missing required parameter: "deploymentId"'); }
                                        let path = '/functions/{functionId}/deployments/{deploymentId}'.replace('{functionId}', functionId).replace('{deploymentId}', deploymentId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), updateDeployment: (functionId, deploymentId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof functionId === 'undefined') { throw new AppwriteException('Missing required parameter: "functionId"'); }
                                        if (typeof deploymentId === 'undefined') { throw new AppwriteException('Missing required parameter: "deploymentId"'); }
                                        let path = '/functions/{functionId}/deployments/{deploymentId}'.replace('{functionId}', functionId).replace('{deploymentId}', deploymentId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('patch', uri, { 'content-type': 'application/json', }, payload);
                                }), deleteDeployment: (functionId, deploymentId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof functionId === 'undefined') { throw new AppwriteException('Missing required parameter: "functionId"'); }
                                        if (typeof deploymentId === 'undefined') { throw new AppwriteException('Missing required parameter: "deploymentId"'); }
                                        let path = '/functions/{functionId}/deployments/{deploymentId}'.replace('{functionId}', functionId).replace('{deploymentId}', deploymentId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('delete', uri, { 'content-type': 'application/json', }, payload);
                                }), retryBuild: (functionId, deploymentId, buildId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof functionId === 'undefined') { throw new AppwriteException('Missing required parameter: "functionId"'); }
                                        if (typeof deploymentId === 'undefined') { throw new AppwriteException('Missing required parameter: "deploymentId"'); }
                                        if (typeof buildId === 'undefined') { throw new AppwriteException('Missing required parameter: "buildId"'); }
                                        let path = '/functions/{functionId}/deployments/{deploymentId}/builds/{buildId}'.replace('{functionId}', functionId).replace('{deploymentId}', deploymentId).replace('{buildId}', buildId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), listExecutions: (functionId, limit, offset, search, cursor, cursorDirection) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof functionId === 'undefined') { throw new AppwriteException('Missing required parameter: "functionId"'); }
                                        let path = '/functions/{functionId}/executions'.replace('{functionId}', functionId); let payload = {}; if (typeof limit !== 'undefined') { payload['limit'] = limit; }
                                        if (typeof offset !== 'undefined') { payload['offset'] = offset; }
                                        if (typeof search !== 'undefined') { payload['search'] = search; }
                                        if (typeof cursor !== 'undefined') { payload['cursor'] = cursor; }
                                        if (typeof cursorDirection !== 'undefined') { payload['cursorDirection'] = cursorDirection; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), createExecution: (functionId, data, async) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof functionId === 'undefined') { throw new AppwriteException('Missing required parameter: "functionId"'); }
                                        let path = '/functions/{functionId}/executions'.replace('{functionId}', functionId); let payload = {}; if (typeof data !== 'undefined') { payload['data'] = data; }
                                        if (typeof async !== 'undefined') { payload['async'] = async; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), getExecution: (functionId, executionId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof functionId === 'undefined') { throw new AppwriteException('Missing required parameter: "functionId"'); }
                                        if (typeof executionId === 'undefined') { throw new AppwriteException('Missing required parameter: "executionId"'); }
                                        let path = '/functions/{functionId}/executions/{executionId}'.replace('{functionId}', functionId).replace('{executionId}', executionId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), getUsage: (functionId, range) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof functionId === 'undefined') { throw new AppwriteException('Missing required parameter: "functionId"'); }
                                        let path = '/functions/{functionId}/usage'.replace('{functionId}', functionId); let payload = {}; if (typeof range !== 'undefined') { payload['range'] = range; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                })
                        }; this.health = { get: () => __awaiter(this, void 0, void 0, function* () { let path = '/health'; let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload); }), getAntivirus: () => __awaiter(this, void 0, void 0, function* () { let path = '/health/anti-virus'; let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload); }), getCache: () => __awaiter(this, void 0, void 0, function* () { let path = '/health/cache'; let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload); }), getDB: () => __awaiter(this, void 0, void 0, function* () { let path = '/health/db'; let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload); }), getQueueCertificates: () => __awaiter(this, void 0, void 0, function* () { let path = '/health/queue/certificates'; let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload); }), getQueueFunctions: () => __awaiter(this, void 0, void 0, function* () { let path = '/health/queue/functions'; let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload); }), getQueueLogs: () => __awaiter(this, void 0, void 0, function* () { let path = '/health/queue/logs'; let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload); }), getQueueWebhooks: () => __awaiter(this, void 0, void 0, function* () { let path = '/health/queue/webhooks'; let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload); }), getStorageLocal: () => __awaiter(this, void 0, void 0, function* () { let path = '/health/storage/local'; let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload); }), getTime: () => __awaiter(this, void 0, void 0, function* () { let path = '/health/time'; let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload); }) }; this.locale = { get: () => __awaiter(this, void 0, void 0, function* () { let path = '/locale'; let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload); }), getContinents: () => __awaiter(this, void 0, void 0, function* () { let path = '/locale/continents'; let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload); }), getCountries: () => __awaiter(this, void 0, void 0, function* () { let path = '/locale/countries'; let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload); }), getCountriesEU: () => __awaiter(this, void 0, void 0, function* () { let path = '/locale/countries/eu'; let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload); }), getCountriesPhones: () => __awaiter(this, void 0, void 0, function* () { let path = '/locale/countries/phones'; let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload); }), getCurrencies: () => __awaiter(this, void 0, void 0, function* () { let path = '/locale/currencies'; let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload); }), getLanguages: () => __awaiter(this, void 0, void 0, function* () { let path = '/locale/languages'; let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload); }) }; this.projects = {
                                list: (search, limit, offset, cursor, cursorDirection, orderType) => __awaiter(this, void 0, void 0, function* () {
                                        let path = '/projects'; let payload = {}; if (typeof search !== 'undefined') { payload['search'] = search; }
                                        if (typeof limit !== 'undefined') { payload['limit'] = limit; }
                                        if (typeof offset !== 'undefined') { payload['offset'] = offset; }
                                        if (typeof cursor !== 'undefined') { payload['cursor'] = cursor; }
                                        if (typeof cursorDirection !== 'undefined') { payload['cursorDirection'] = cursorDirection; }
                                        if (typeof orderType !== 'undefined') { payload['orderType'] = orderType; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), create: (projectId, name, teamId, description, logo, url, legalName, legalCountry, legalState, legalCity, legalAddress, legalTaxId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        if (typeof name === 'undefined') { throw new AppwriteException('Missing required parameter: "name"'); }
                                        if (typeof teamId === 'undefined') { throw new AppwriteException('Missing required parameter: "teamId"'); }
                                        let path = '/projects'; let payload = {}; if (typeof projectId !== 'undefined') { payload['projectId'] = projectId; }
                                        if (typeof name !== 'undefined') { payload['name'] = name; }
                                        if (typeof teamId !== 'undefined') { payload['teamId'] = teamId; }
                                        if (typeof description !== 'undefined') { payload['description'] = description; }
                                        if (typeof logo !== 'undefined') { payload['logo'] = logo; }
                                        if (typeof url !== 'undefined') { payload['url'] = url; }
                                        if (typeof legalName !== 'undefined') { payload['legalName'] = legalName; }
                                        if (typeof legalCountry !== 'undefined') { payload['legalCountry'] = legalCountry; }
                                        if (typeof legalState !== 'undefined') { payload['legalState'] = legalState; }
                                        if (typeof legalCity !== 'undefined') { payload['legalCity'] = legalCity; }
                                        if (typeof legalAddress !== 'undefined') { payload['legalAddress'] = legalAddress; }
                                        if (typeof legalTaxId !== 'undefined') { payload['legalTaxId'] = legalTaxId; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), get: (projectId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        let path = '/projects/{projectId}'.replace('{projectId}', projectId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), update: (projectId, name, description, logo, url, legalName, legalCountry, legalState, legalCity, legalAddress, legalTaxId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        if (typeof name === 'undefined') { throw new AppwriteException('Missing required parameter: "name"'); }
                                        let path = '/projects/{projectId}'.replace('{projectId}', projectId); let payload = {}; if (typeof name !== 'undefined') { payload['name'] = name; }
                                        if (typeof description !== 'undefined') { payload['description'] = description; }
                                        if (typeof logo !== 'undefined') { payload['logo'] = logo; }
                                        if (typeof url !== 'undefined') { payload['url'] = url; }
                                        if (typeof legalName !== 'undefined') { payload['legalName'] = legalName; }
                                        if (typeof legalCountry !== 'undefined') { payload['legalCountry'] = legalCountry; }
                                        if (typeof legalState !== 'undefined') { payload['legalState'] = legalState; }
                                        if (typeof legalCity !== 'undefined') { payload['legalCity'] = legalCity; }
                                        if (typeof legalAddress !== 'undefined') { payload['legalAddress'] = legalAddress; }
                                        if (typeof legalTaxId !== 'undefined') { payload['legalTaxId'] = legalTaxId; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('patch', uri, { 'content-type': 'application/json', }, payload);
                                }), delete: (projectId, password) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        if (typeof password === 'undefined') { throw new AppwriteException('Missing required parameter: "password"'); }
                                        let path = '/projects/{projectId}'.replace('{projectId}', projectId); let payload = {}; if (typeof password !== 'undefined') { payload['password'] = password; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('delete', uri, { 'content-type': 'application/json', }, payload);
                                }), updateAuthLimit: (projectId, limit) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        if (typeof limit === 'undefined') { throw new AppwriteException('Missing required parameter: "limit"'); }
                                        let path = '/projects/{projectId}/auth/limit'.replace('{projectId}', projectId); let payload = {}; if (typeof limit !== 'undefined') { payload['limit'] = limit; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('patch', uri, { 'content-type': 'application/json', }, payload);
                                }), updateAuthStatus: (projectId, method, status) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        if (typeof method === 'undefined') { throw new AppwriteException('Missing required parameter: "method"'); }
                                        if (typeof status === 'undefined') { throw new AppwriteException('Missing required parameter: "status"'); }
                                        let path = '/projects/{projectId}/auth/{method}'.replace('{projectId}', projectId).replace('{method}', method); let payload = {}; if (typeof status !== 'undefined') { payload['status'] = status; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('patch', uri, { 'content-type': 'application/json', }, payload);
                                }), listDomains: (projectId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        let path = '/projects/{projectId}/domains'.replace('{projectId}', projectId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), createDomain: (projectId, domain) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        if (typeof domain === 'undefined') { throw new AppwriteException('Missing required parameter: "domain"'); }
                                        let path = '/projects/{projectId}/domains'.replace('{projectId}', projectId); let payload = {}; if (typeof domain !== 'undefined') { payload['domain'] = domain; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), getDomain: (projectId, domainId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        if (typeof domainId === 'undefined') { throw new AppwriteException('Missing required parameter: "domainId"'); }
                                        let path = '/projects/{projectId}/domains/{domainId}'.replace('{projectId}', projectId).replace('{domainId}', domainId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), deleteDomain: (projectId, domainId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        if (typeof domainId === 'undefined') { throw new AppwriteException('Missing required parameter: "domainId"'); }
                                        let path = '/projects/{projectId}/domains/{domainId}'.replace('{projectId}', projectId).replace('{domainId}', domainId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('delete', uri, { 'content-type': 'application/json', }, payload);
                                }), updateDomainVerification: (projectId, domainId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        if (typeof domainId === 'undefined') { throw new AppwriteException('Missing required parameter: "domainId"'); }
                                        let path = '/projects/{projectId}/domains/{domainId}/verification'.replace('{projectId}', projectId).replace('{domainId}', domainId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('patch', uri, { 'content-type': 'application/json', }, payload);
                                }), listKeys: (projectId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        let path = '/projects/{projectId}/keys'.replace('{projectId}', projectId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), createKey: (projectId, name, scopes, expire) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        if (typeof name === 'undefined') { throw new AppwriteException('Missing required parameter: "name"'); }
                                        if (typeof scopes === 'undefined') { throw new AppwriteException('Missing required parameter: "scopes"'); }
                                        let path = '/projects/{projectId}/keys'.replace('{projectId}', projectId); let payload = {}; if (typeof name !== 'undefined') { payload['name'] = name; }
                                        if (typeof scopes !== 'undefined') { payload['scopes'] = scopes; }
                                        if (typeof expire !== 'undefined') { payload['expire'] = expire; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), getKey: (projectId, keyId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        if (typeof keyId === 'undefined') { throw new AppwriteException('Missing required parameter: "keyId"'); }
                                        let path = '/projects/{projectId}/keys/{keyId}'.replace('{projectId}', projectId).replace('{keyId}', keyId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), updateKey: (projectId, keyId, name, scopes, expire) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        if (typeof keyId === 'undefined') { throw new AppwriteException('Missing required parameter: "keyId"'); }
                                        if (typeof name === 'undefined') { throw new AppwriteException('Missing required parameter: "name"'); }
                                        if (typeof scopes === 'undefined') { throw new AppwriteException('Missing required parameter: "scopes"'); }
                                        let path = '/projects/{projectId}/keys/{keyId}'.replace('{projectId}', projectId).replace('{keyId}', keyId); let payload = {}; if (typeof name !== 'undefined') { payload['name'] = name; }
                                        if (typeof scopes !== 'undefined') { payload['scopes'] = scopes; }
                                        if (typeof expire !== 'undefined') { payload['expire'] = expire; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('put', uri, { 'content-type': 'application/json', }, payload);
                                }), deleteKey: (projectId, keyId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        if (typeof keyId === 'undefined') { throw new AppwriteException('Missing required parameter: "keyId"'); }
                                        let path = '/projects/{projectId}/keys/{keyId}'.replace('{projectId}', projectId).replace('{keyId}', keyId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('delete', uri, { 'content-type': 'application/json', }, payload);
                                }), updateOAuth2: (projectId, provider, appId, secret) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        if (typeof provider === 'undefined') { throw new AppwriteException('Missing required parameter: "provider"'); }
                                        let path = '/projects/{projectId}/oauth2'.replace('{projectId}', projectId); let payload = {}; if (typeof provider !== 'undefined') { payload['provider'] = provider; }
                                        if (typeof appId !== 'undefined') { payload['appId'] = appId; }
                                        if (typeof secret !== 'undefined') { payload['secret'] = secret; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('patch', uri, { 'content-type': 'application/json', }, payload);
                                }), listPlatforms: (projectId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        let path = '/projects/{projectId}/platforms'.replace('{projectId}', projectId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), createPlatform: (projectId, type, name, key, store, hostname) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        if (typeof type === 'undefined') { throw new AppwriteException('Missing required parameter: "type"'); }
                                        if (typeof name === 'undefined') { throw new AppwriteException('Missing required parameter: "name"'); }
                                        let path = '/projects/{projectId}/platforms'.replace('{projectId}', projectId); let payload = {}; if (typeof type !== 'undefined') { payload['type'] = type; }
                                        if (typeof name !== 'undefined') { payload['name'] = name; }
                                        if (typeof key !== 'undefined') { payload['key'] = key; }
                                        if (typeof store !== 'undefined') { payload['store'] = store; }
                                        if (typeof hostname !== 'undefined') { payload['hostname'] = hostname; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), getPlatform: (projectId, platformId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        if (typeof platformId === 'undefined') { throw new AppwriteException('Missing required parameter: "platformId"'); }
                                        let path = '/projects/{projectId}/platforms/{platformId}'.replace('{projectId}', projectId).replace('{platformId}', platformId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), updatePlatform: (projectId, platformId, name, key, store, hostname) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        if (typeof platformId === 'undefined') { throw new AppwriteException('Missing required parameter: "platformId"'); }
                                        if (typeof name === 'undefined') { throw new AppwriteException('Missing required parameter: "name"'); }
                                        let path = '/projects/{projectId}/platforms/{platformId}'.replace('{projectId}', projectId).replace('{platformId}', platformId); let payload = {}; if (typeof name !== 'undefined') { payload['name'] = name; }
                                        if (typeof key !== 'undefined') { payload['key'] = key; }
                                        if (typeof store !== 'undefined') { payload['store'] = store; }
                                        if (typeof hostname !== 'undefined') { payload['hostname'] = hostname; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('put', uri, { 'content-type': 'application/json', }, payload);
                                }), deletePlatform: (projectId, platformId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        if (typeof platformId === 'undefined') { throw new AppwriteException('Missing required parameter: "platformId"'); }
                                        let path = '/projects/{projectId}/platforms/{platformId}'.replace('{projectId}', projectId).replace('{platformId}', platformId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('delete', uri, { 'content-type': 'application/json', }, payload);
                                }), updateServiceStatus: (projectId, service, status) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        if (typeof service === 'undefined') { throw new AppwriteException('Missing required parameter: "service"'); }
                                        if (typeof status === 'undefined') { throw new AppwriteException('Missing required parameter: "status"'); }
                                        let path = '/projects/{projectId}/service'.replace('{projectId}', projectId); let payload = {}; if (typeof service !== 'undefined') { payload['service'] = service; }
                                        if (typeof status !== 'undefined') { payload['status'] = status; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('patch', uri, { 'content-type': 'application/json', }, payload);
                                }), getUsage: (projectId, range) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        let path = '/projects/{projectId}/usage'.replace('{projectId}', projectId); let payload = {}; if (typeof range !== 'undefined') { payload['range'] = range; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), listWebhooks: (projectId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        let path = '/projects/{projectId}/webhooks'.replace('{projectId}', projectId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), createWebhook: (projectId, name, events, url, security, httpUser, httpPass) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        if (typeof name === 'undefined') { throw new AppwriteException('Missing required parameter: "name"'); }
                                        if (typeof events === 'undefined') { throw new AppwriteException('Missing required parameter: "events"'); }
                                        if (typeof url === 'undefined') { throw new AppwriteException('Missing required parameter: "url"'); }
                                        if (typeof security === 'undefined') { throw new AppwriteException('Missing required parameter: "security"'); }
                                        let path = '/projects/{projectId}/webhooks'.replace('{projectId}', projectId); let payload = {}; if (typeof name !== 'undefined') { payload['name'] = name; }
                                        if (typeof events !== 'undefined') { payload['events'] = events; }
                                        if (typeof url !== 'undefined') { payload['url'] = url; }
                                        if (typeof security !== 'undefined') { payload['security'] = security; }
                                        if (typeof httpUser !== 'undefined') { payload['httpUser'] = httpUser; }
                                        if (typeof httpPass !== 'undefined') { payload['httpPass'] = httpPass; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), getWebhook: (projectId, webhookId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        if (typeof webhookId === 'undefined') { throw new AppwriteException('Missing required parameter: "webhookId"'); }
                                        let path = '/projects/{projectId}/webhooks/{webhookId}'.replace('{projectId}', projectId).replace('{webhookId}', webhookId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), updateWebhook: (projectId, webhookId, name, events, url, security, httpUser, httpPass) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        if (typeof webhookId === 'undefined') { throw new AppwriteException('Missing required parameter: "webhookId"'); }
                                        if (typeof name === 'undefined') { throw new AppwriteException('Missing required parameter: "name"'); }
                                        if (typeof events === 'undefined') { throw new AppwriteException('Missing required parameter: "events"'); }
                                        if (typeof url === 'undefined') { throw new AppwriteException('Missing required parameter: "url"'); }
                                        if (typeof security === 'undefined') { throw new AppwriteException('Missing required parameter: "security"'); }
                                        let path = '/projects/{projectId}/webhooks/{webhookId}'.replace('{projectId}', projectId).replace('{webhookId}', webhookId); let payload = {}; if (typeof name !== 'undefined') { payload['name'] = name; }
                                        if (typeof events !== 'undefined') { payload['events'] = events; }
                                        if (typeof url !== 'undefined') { payload['url'] = url; }
                                        if (typeof security !== 'undefined') { payload['security'] = security; }
                                        if (typeof httpUser !== 'undefined') { payload['httpUser'] = httpUser; }
                                        if (typeof httpPass !== 'undefined') { payload['httpPass'] = httpPass; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('put', uri, { 'content-type': 'application/json', }, payload);
                                }), deleteWebhook: (projectId, webhookId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        if (typeof webhookId === 'undefined') { throw new AppwriteException('Missing required parameter: "webhookId"'); }
                                        let path = '/projects/{projectId}/webhooks/{webhookId}'.replace('{projectId}', projectId).replace('{webhookId}', webhookId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('delete', uri, { 'content-type': 'application/json', }, payload);
                                }), updateWebhookSignature: (projectId, webhookId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof projectId === 'undefined') { throw new AppwriteException('Missing required parameter: "projectId"'); }
                                        if (typeof webhookId === 'undefined') { throw new AppwriteException('Missing required parameter: "webhookId"'); }
                                        let path = '/projects/{projectId}/webhooks/{webhookId}/signature'.replace('{projectId}', projectId).replace('{webhookId}', webhookId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('patch', uri, { 'content-type': 'application/json', }, payload);
                                })
                        }; this.storage = {
                                listBuckets: (search, limit, offset, cursor, cursorDirection, orderType) => __awaiter(this, void 0, void 0, function* () {
                                        let path = '/storage/buckets'; let payload = {}; if (typeof search !== 'undefined') { payload['search'] = search; }
                                        if (typeof limit !== 'undefined') { payload['limit'] = limit; }
                                        if (typeof offset !== 'undefined') { payload['offset'] = offset; }
                                        if (typeof cursor !== 'undefined') { payload['cursor'] = cursor; }
                                        if (typeof cursorDirection !== 'undefined') { payload['cursorDirection'] = cursorDirection; }
                                        if (typeof orderType !== 'undefined') { payload['orderType'] = orderType; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), createBucket: (bucketId, name, permission, read, write, enabled, maximumFileSize, allowedFileExtensions, encryption, antivirus) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof bucketId === 'undefined') { throw new AppwriteException('Missing required parameter: "bucketId"'); }
                                        if (typeof name === 'undefined') { throw new AppwriteException('Missing required parameter: "name"'); }
                                        if (typeof permission === 'undefined') { throw new AppwriteException('Missing required parameter: "permission"'); }
                                        let path = '/storage/buckets'; let payload = {}; if (typeof bucketId !== 'undefined') { payload['bucketId'] = bucketId; }
                                        if (typeof name !== 'undefined') { payload['name'] = name; }
                                        if (typeof permission !== 'undefined') { payload['permission'] = permission; }
                                        if (typeof read !== 'undefined') { payload['read'] = read; }
                                        if (typeof write !== 'undefined') { payload['write'] = write; }
                                        if (typeof enabled !== 'undefined') { payload['enabled'] = enabled; }
                                        if (typeof maximumFileSize !== 'undefined') { payload['maximumFileSize'] = maximumFileSize; }
                                        if (typeof allowedFileExtensions !== 'undefined') { payload['allowedFileExtensions'] = allowedFileExtensions; }
                                        if (typeof encryption !== 'undefined') { payload['encryption'] = encryption; }
                                        if (typeof antivirus !== 'undefined') { payload['antivirus'] = antivirus; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), getBucket: (bucketId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof bucketId === 'undefined') { throw new AppwriteException('Missing required parameter: "bucketId"'); }
                                        let path = '/storage/buckets/{bucketId}'.replace('{bucketId}', bucketId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), updateBucket: (bucketId, name, permission, read, write, enabled, maximumFileSize, allowedFileExtensions, encryption, antivirus) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof bucketId === 'undefined') { throw new AppwriteException('Missing required parameter: "bucketId"'); }
                                        if (typeof name === 'undefined') { throw new AppwriteException('Missing required parameter: "name"'); }
                                        if (typeof permission === 'undefined') { throw new AppwriteException('Missing required parameter: "permission"'); }
                                        let path = '/storage/buckets/{bucketId}'.replace('{bucketId}', bucketId); let payload = {}; if (typeof name !== 'undefined') { payload['name'] = name; }
                                        if (typeof permission !== 'undefined') { payload['permission'] = permission; }
                                        if (typeof read !== 'undefined') { payload['read'] = read; }
                                        if (typeof write !== 'undefined') { payload['write'] = write; }
                                        if (typeof enabled !== 'undefined') { payload['enabled'] = enabled; }
                                        if (typeof maximumFileSize !== 'undefined') { payload['maximumFileSize'] = maximumFileSize; }
                                        if (typeof allowedFileExtensions !== 'undefined') { payload['allowedFileExtensions'] = allowedFileExtensions; }
                                        if (typeof encryption !== 'undefined') { payload['encryption'] = encryption; }
                                        if (typeof antivirus !== 'undefined') { payload['antivirus'] = antivirus; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('put', uri, { 'content-type': 'application/json', }, payload);
                                }), deleteBucket: (bucketId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof bucketId === 'undefined') { throw new AppwriteException('Missing required parameter: "bucketId"'); }
                                        let path = '/storage/buckets/{bucketId}'.replace('{bucketId}', bucketId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('delete', uri, { 'content-type': 'application/json', }, payload);
                                }), listFiles: (bucketId, search, limit, offset, cursor, cursorDirection, orderType) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof bucketId === 'undefined') { throw new AppwriteException('Missing required parameter: "bucketId"'); }
                                        let path = '/storage/buckets/{bucketId}/files'.replace('{bucketId}', bucketId); let payload = {}; if (typeof search !== 'undefined') { payload['search'] = search; }
                                        if (typeof limit !== 'undefined') { payload['limit'] = limit; }
                                        if (typeof offset !== 'undefined') { payload['offset'] = offset; }
                                        if (typeof cursor !== 'undefined') { payload['cursor'] = cursor; }
                                        if (typeof cursorDirection !== 'undefined') { payload['cursorDirection'] = cursorDirection; }
                                        if (typeof orderType !== 'undefined') { payload['orderType'] = orderType; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), createFile: (bucketId, fileId, file, read, write, onProgress = (progress) => { }) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof bucketId === 'undefined') { throw new AppwriteException('Missing required parameter: "bucketId"'); }
                                        if (typeof fileId === 'undefined') { throw new AppwriteException('Missing required parameter: "fileId"'); }
                                        if (typeof file === 'undefined') { throw new AppwriteException('Missing required parameter: "file"'); }
                                        let path = '/storage/buckets/{bucketId}/files'.replace('{bucketId}', bucketId); let payload = {}; if (typeof fileId !== 'undefined') { payload['fileId'] = fileId; }
                                        if (typeof file !== 'undefined') { payload['file'] = file; }
                                        if (typeof read !== 'undefined') { payload['read'] = read; }
                                        if (typeof write !== 'undefined') { payload['write'] = write; }
                                        const uri = new URL(this.config.endpoint + path); if (!(file instanceof File)) { throw new AppwriteException('Parameter "file" has to be a File.'); }
                                        const size = file.size; if (size <= Appwrite.CHUNK_SIZE) { return yield this.call('post', uri, { 'content-type': 'multipart/form-data', }, payload); }
                                        let id = undefined; let response = undefined; const headers = { 'content-type': 'multipart/form-data', }; let counter = 0; const totalCounters = Math.ceil(size / Appwrite.CHUNK_SIZE); if (fileId != 'unique()') {
                                                try { response = yield this.call('GET', new URL(this.config.endpoint + path + '/' + fileId), headers); counter = response.chunksUploaded; }
                                                catch (e) { }
                                        }
                                        for (counter; counter < totalCounters; counter++) {
                                                const start = (counter * Appwrite.CHUNK_SIZE); const end = Math.min((((counter * Appwrite.CHUNK_SIZE) + Appwrite.CHUNK_SIZE) - 1), size); headers['content-range'] = 'bytes ' + start + '-' + end + '/' + size; if (id) { headers['x-appwrite-id'] = id; }
                                                const stream = file.slice(start, end + 1); payload['file'] = new File([stream], file.name); response = yield this.call('post', uri, headers, payload); if (!id) { id = response['$id']; }
                                                if (onProgress) { onProgress({ $id: response.$id, progress: Math.min((counter + 1) * Appwrite.CHUNK_SIZE - 1, size) / size * 100, sizeUploaded: end, chunksTotal: response.chunksTotal, chunksUploaded: response.chunksUploaded }); }
                                        }
                                        return response;
                                }), getFile: (bucketId, fileId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof bucketId === 'undefined') { throw new AppwriteException('Missing required parameter: "bucketId"'); }
                                        if (typeof fileId === 'undefined') { throw new AppwriteException('Missing required parameter: "fileId"'); }
                                        let path = '/storage/buckets/{bucketId}/files/{fileId}'.replace('{bucketId}', bucketId).replace('{fileId}', fileId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), updateFile: (bucketId, fileId, read, write) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof bucketId === 'undefined') { throw new AppwriteException('Missing required parameter: "bucketId"'); }
                                        if (typeof fileId === 'undefined') { throw new AppwriteException('Missing required parameter: "fileId"'); }
                                        let path = '/storage/buckets/{bucketId}/files/{fileId}'.replace('{bucketId}', bucketId).replace('{fileId}', fileId); let payload = {}; if (typeof read !== 'undefined') { payload['read'] = read; }
                                        if (typeof write !== 'undefined') { payload['write'] = write; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('put', uri, { 'content-type': 'application/json', }, payload);
                                }), deleteFile: (bucketId, fileId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof bucketId === 'undefined') { throw new AppwriteException('Missing required parameter: "bucketId"'); }
                                        if (typeof fileId === 'undefined') { throw new AppwriteException('Missing required parameter: "fileId"'); }
                                        let path = '/storage/buckets/{bucketId}/files/{fileId}'.replace('{bucketId}', bucketId).replace('{fileId}', fileId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('delete', uri, { 'content-type': 'application/json', }, payload);
                                }), getFileDownload: (bucketId, fileId) => {
                                        if (typeof bucketId === 'undefined') { throw new AppwriteException('Missing required parameter: "bucketId"'); }
                                        if (typeof fileId === 'undefined') { throw new AppwriteException('Missing required parameter: "fileId"'); }
                                        let path = '/storage/buckets/{bucketId}/files/{fileId}/download'.replace('{bucketId}', bucketId).replace('{fileId}', fileId); let payload = {}; const uri = new URL(this.config.endpoint + path); payload['project'] = this.config.project; for (const [key, value] of Object.entries(this.flatten(payload))) { uri.searchParams.append(key, value); }
                                        return uri;
                                }, getFilePreview: (bucketId, fileId, width, height, gravity, quality, borderWidth, borderColor, borderRadius, opacity, rotation, background, output) => {
                                        if (typeof bucketId === 'undefined') { throw new AppwriteException('Missing required parameter: "bucketId"'); }
                                        if (typeof fileId === 'undefined') { throw new AppwriteException('Missing required parameter: "fileId"'); }
                                        let path = '/storage/buckets/{bucketId}/files/{fileId}/preview'.replace('{bucketId}', bucketId).replace('{fileId}', fileId); let payload = {}; if (typeof width !== 'undefined') { payload['width'] = width; }
                                        if (typeof height !== 'undefined') { payload['height'] = height; }
                                        if (typeof gravity !== 'undefined') { payload['gravity'] = gravity; }
                                        if (typeof quality !== 'undefined') { payload['quality'] = quality; }
                                        if (typeof borderWidth !== 'undefined') { payload['borderWidth'] = borderWidth; }
                                        if (typeof borderColor !== 'undefined') { payload['borderColor'] = borderColor; }
                                        if (typeof borderRadius !== 'undefined') { payload['borderRadius'] = borderRadius; }
                                        if (typeof opacity !== 'undefined') { payload['opacity'] = opacity; }
                                        if (typeof rotation !== 'undefined') { payload['rotation'] = rotation; }
                                        if (typeof background !== 'undefined') { payload['background'] = background; }
                                        if (typeof output !== 'undefined') { payload['output'] = output; }
                                        const uri = new URL(this.config.endpoint + path); payload['project'] = this.config.project; for (const [key, value] of Object.entries(this.flatten(payload))) { uri.searchParams.append(key, value); }
                                        return uri;
                                }, getFileView: (bucketId, fileId) => {
                                        if (typeof bucketId === 'undefined') { throw new AppwriteException('Missing required parameter: "bucketId"'); }
                                        if (typeof fileId === 'undefined') { throw new AppwriteException('Missing required parameter: "fileId"'); }
                                        let path = '/storage/buckets/{bucketId}/files/{fileId}/view'.replace('{bucketId}', bucketId).replace('{fileId}', fileId); let payload = {}; const uri = new URL(this.config.endpoint + path); payload['project'] = this.config.project; for (const [key, value] of Object.entries(this.flatten(payload))) { uri.searchParams.append(key, value); }
                                        return uri;
                                }, getUsage: (range) => __awaiter(this, void 0, void 0, function* () {
                                        let path = '/storage/usage'; let payload = {}; if (typeof range !== 'undefined') { payload['range'] = range; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), getBucketUsage: (bucketId, range) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof bucketId === 'undefined') { throw new AppwriteException('Missing required parameter: "bucketId"'); }
                                        let path = '/storage/{bucketId}/usage'.replace('{bucketId}', bucketId); let payload = {}; if (typeof range !== 'undefined') { payload['range'] = range; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                })
                        }; this.teams = {
                                list: (search, limit, offset, cursor, cursorDirection, orderType) => __awaiter(this, void 0, void 0, function* () {
                                        let path = '/teams'; let payload = {}; if (typeof search !== 'undefined') { payload['search'] = search; }
                                        if (typeof limit !== 'undefined') { payload['limit'] = limit; }
                                        if (typeof offset !== 'undefined') { payload['offset'] = offset; }
                                        if (typeof cursor !== 'undefined') { payload['cursor'] = cursor; }
                                        if (typeof cursorDirection !== 'undefined') { payload['cursorDirection'] = cursorDirection; }
                                        if (typeof orderType !== 'undefined') { payload['orderType'] = orderType; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), create: (teamId, name, roles) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof teamId === 'undefined') { throw new AppwriteException('Missing required parameter: "teamId"'); }
                                        if (typeof name === 'undefined') { throw new AppwriteException('Missing required parameter: "name"'); }
                                        let path = '/teams'; let payload = {}; if (typeof teamId !== 'undefined') { payload['teamId'] = teamId; }
                                        if (typeof name !== 'undefined') { payload['name'] = name; }
                                        if (typeof roles !== 'undefined') { payload['roles'] = roles; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), get: (teamId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof teamId === 'undefined') { throw new AppwriteException('Missing required parameter: "teamId"'); }
                                        let path = '/teams/{teamId}'.replace('{teamId}', teamId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), update: (teamId, name) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof teamId === 'undefined') { throw new AppwriteException('Missing required parameter: "teamId"'); }
                                        if (typeof name === 'undefined') { throw new AppwriteException('Missing required parameter: "name"'); }
                                        let path = '/teams/{teamId}'.replace('{teamId}', teamId); let payload = {}; if (typeof name !== 'undefined') { payload['name'] = name; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('put', uri, { 'content-type': 'application/json', }, payload);
                                }), delete: (teamId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof teamId === 'undefined') { throw new AppwriteException('Missing required parameter: "teamId"'); }
                                        let path = '/teams/{teamId}'.replace('{teamId}', teamId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('delete', uri, { 'content-type': 'application/json', }, payload);
                                }), listLogs: (teamId, limit, offset) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof teamId === 'undefined') { throw new AppwriteException('Missing required parameter: "teamId"'); }
                                        let path = '/teams/{teamId}/logs'.replace('{teamId}', teamId); let payload = {}; if (typeof limit !== 'undefined') { payload['limit'] = limit; }
                                        if (typeof offset !== 'undefined') { payload['offset'] = offset; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), getMemberships: (teamId, search, limit, offset, cursor, cursorDirection, orderType) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof teamId === 'undefined') { throw new AppwriteException('Missing required parameter: "teamId"'); }
                                        let path = '/teams/{teamId}/memberships'.replace('{teamId}', teamId); let payload = {}; if (typeof search !== 'undefined') { payload['search'] = search; }
                                        if (typeof limit !== 'undefined') { payload['limit'] = limit; }
                                        if (typeof offset !== 'undefined') { payload['offset'] = offset; }
                                        if (typeof cursor !== 'undefined') { payload['cursor'] = cursor; }
                                        if (typeof cursorDirection !== 'undefined') { payload['cursorDirection'] = cursorDirection; }
                                        if (typeof orderType !== 'undefined') { payload['orderType'] = orderType; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), createMembership: (teamId, email, roles, url, name) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof teamId === 'undefined') { throw new AppwriteException('Missing required parameter: "teamId"'); }
                                        if (typeof email === 'undefined') { throw new AppwriteException('Missing required parameter: "email"'); }
                                        if (typeof roles === 'undefined') { throw new AppwriteException('Missing required parameter: "roles"'); }
                                        if (typeof url === 'undefined') { throw new AppwriteException('Missing required parameter: "url"'); }
                                        let path = '/teams/{teamId}/memberships'.replace('{teamId}', teamId); let payload = {}; if (typeof email !== 'undefined') { payload['email'] = email; }
                                        if (typeof roles !== 'undefined') { payload['roles'] = roles; }
                                        if (typeof url !== 'undefined') { payload['url'] = url; }
                                        if (typeof name !== 'undefined') { payload['name'] = name; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), getMembership: (teamId, membershipId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof teamId === 'undefined') { throw new AppwriteException('Missing required parameter: "teamId"'); }
                                        if (typeof membershipId === 'undefined') { throw new AppwriteException('Missing required parameter: "membershipId"'); }
                                        let path = '/teams/{teamId}/memberships/{membershipId}'.replace('{teamId}', teamId).replace('{membershipId}', membershipId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), updateMembershipRoles: (teamId, membershipId, roles) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof teamId === 'undefined') { throw new AppwriteException('Missing required parameter: "teamId"'); }
                                        if (typeof membershipId === 'undefined') { throw new AppwriteException('Missing required parameter: "membershipId"'); }
                                        if (typeof roles === 'undefined') { throw new AppwriteException('Missing required parameter: "roles"'); }
                                        let path = '/teams/{teamId}/memberships/{membershipId}'.replace('{teamId}', teamId).replace('{membershipId}', membershipId); let payload = {}; if (typeof roles !== 'undefined') { payload['roles'] = roles; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('patch', uri, { 'content-type': 'application/json', }, payload);
                                }), deleteMembership: (teamId, membershipId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof teamId === 'undefined') { throw new AppwriteException('Missing required parameter: "teamId"'); }
                                        if (typeof membershipId === 'undefined') { throw new AppwriteException('Missing required parameter: "membershipId"'); }
                                        let path = '/teams/{teamId}/memberships/{membershipId}'.replace('{teamId}', teamId).replace('{membershipId}', membershipId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('delete', uri, { 'content-type': 'application/json', }, payload);
                                }), updateMembershipStatus: (teamId, membershipId, userId, secret) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof teamId === 'undefined') { throw new AppwriteException('Missing required parameter: "teamId"'); }
                                        if (typeof membershipId === 'undefined') { throw new AppwriteException('Missing required parameter: "membershipId"'); }
                                        if (typeof userId === 'undefined') { throw new AppwriteException('Missing required parameter: "userId"'); }
                                        if (typeof secret === 'undefined') { throw new AppwriteException('Missing required parameter: "secret"'); }
                                        let path = '/teams/{teamId}/memberships/{membershipId}/status'.replace('{teamId}', teamId).replace('{membershipId}', membershipId); let payload = {}; if (typeof userId !== 'undefined') { payload['userId'] = userId; }
                                        if (typeof secret !== 'undefined') { payload['secret'] = secret; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('patch', uri, { 'content-type': 'application/json', }, payload);
                                })
                        }; this.users = {
                                list: (search, limit, offset, cursor, cursorDirection, orderType) => __awaiter(this, void 0, void 0, function* () {
                                        let path = '/users'; let payload = {}; if (typeof search !== 'undefined') { payload['search'] = search; }
                                        if (typeof limit !== 'undefined') { payload['limit'] = limit; }
                                        if (typeof offset !== 'undefined') { payload['offset'] = offset; }
                                        if (typeof cursor !== 'undefined') { payload['cursor'] = cursor; }
                                        if (typeof cursorDirection !== 'undefined') { payload['cursorDirection'] = cursorDirection; }
                                        if (typeof orderType !== 'undefined') { payload['orderType'] = orderType; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), create: (userId, email, password, name) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof userId === 'undefined') { throw new AppwriteException('Missing required parameter: "userId"'); }
                                        if (typeof email === 'undefined') { throw new AppwriteException('Missing required parameter: "email"'); }
                                        if (typeof password === 'undefined') { throw new AppwriteException('Missing required parameter: "password"'); }
                                        let path = '/users'; let payload = {}; if (typeof userId !== 'undefined') { payload['userId'] = userId; }
                                        if (typeof email !== 'undefined') { payload['email'] = email; }
                                        if (typeof password !== 'undefined') { payload['password'] = password; }
                                        if (typeof name !== 'undefined') { payload['name'] = name; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('post', uri, { 'content-type': 'application/json', }, payload);
                                }), getUsage: (range, provider) => __awaiter(this, void 0, void 0, function* () {
                                        let path = '/users/usage'; let payload = {}; if (typeof range !== 'undefined') { payload['range'] = range; }
                                        if (typeof provider !== 'undefined') { payload['provider'] = provider; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), get: (userId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof userId === 'undefined') { throw new AppwriteException('Missing required parameter: "userId"'); }
                                        let path = '/users/{userId}'.replace('{userId}', userId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), delete: (userId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof userId === 'undefined') { throw new AppwriteException('Missing required parameter: "userId"'); }
                                        let path = '/users/{userId}'.replace('{userId}', userId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('delete', uri, { 'content-type': 'application/json', }, payload);
                                }), updateEmail: (userId, email) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof userId === 'undefined') { throw new AppwriteException('Missing required parameter: "userId"'); }
                                        if (typeof email === 'undefined') { throw new AppwriteException('Missing required parameter: "email"'); }
                                        let path = '/users/{userId}/email'.replace('{userId}', userId); let payload = {}; if (typeof email !== 'undefined') { payload['email'] = email; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('patch', uri, { 'content-type': 'application/json', }, payload);
                                }), getLogs: (userId, limit, offset) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof userId === 'undefined') { throw new AppwriteException('Missing required parameter: "userId"'); }
                                        let path = '/users/{userId}/logs'.replace('{userId}', userId); let payload = {}; if (typeof limit !== 'undefined') { payload['limit'] = limit; }
                                        if (typeof offset !== 'undefined') { payload['offset'] = offset; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), getMemberships: (userId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof userId === 'undefined') { throw new AppwriteException('Missing required parameter: "userId"'); }
                                        let path = '/users/{userId}/memberships'.replace('{userId}', userId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), updateName: (userId, name) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof userId === 'undefined') { throw new AppwriteException('Missing required parameter: "userId"'); }
                                        if (typeof name === 'undefined') { throw new AppwriteException('Missing required parameter: "name"'); }
                                        let path = '/users/{userId}/name'.replace('{userId}', userId); let payload = {}; if (typeof name !== 'undefined') { payload['name'] = name; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('patch', uri, { 'content-type': 'application/json', }, payload);
                                }), updatePassword: (userId, password) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof userId === 'undefined') { throw new AppwriteException('Missing required parameter: "userId"'); }
                                        if (typeof password === 'undefined') { throw new AppwriteException('Missing required parameter: "password"'); }
                                        let path = '/users/{userId}/password'.replace('{userId}', userId); let payload = {}; if (typeof password !== 'undefined') { payload['password'] = password; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('patch', uri, { 'content-type': 'application/json', }, payload);
                                }), updatePhone: (userId, number) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof userId === 'undefined') { throw new AppwriteException('Missing required parameter: "userId"'); }
                                        if (typeof number === 'undefined') { throw new AppwriteException('Missing required parameter: "number"'); }
                                        let path = '/users/{userId}/phone'.replace('{userId}', userId); let payload = {}; if (typeof number !== 'undefined') { payload['number'] = number; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('patch', uri, { 'content-type': 'application/json', }, payload);
                                }), getPrefs: (userId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof userId === 'undefined') { throw new AppwriteException('Missing required parameter: "userId"'); }
                                        let path = '/users/{userId}/prefs'.replace('{userId}', userId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), updatePrefs: (userId, prefs) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof userId === 'undefined') { throw new AppwriteException('Missing required parameter: "userId"'); }
                                        if (typeof prefs === 'undefined') { throw new AppwriteException('Missing required parameter: "prefs"'); }
                                        let path = '/users/{userId}/prefs'.replace('{userId}', userId); let payload = {}; if (typeof prefs !== 'undefined') { payload['prefs'] = prefs; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('patch', uri, { 'content-type': 'application/json', }, payload);
                                }), getSessions: (userId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof userId === 'undefined') { throw new AppwriteException('Missing required parameter: "userId"'); }
                                        let path = '/users/{userId}/sessions'.replace('{userId}', userId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('get', uri, { 'content-type': 'application/json', }, payload);
                                }), deleteSessions: (userId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof userId === 'undefined') { throw new AppwriteException('Missing required parameter: "userId"'); }
                                        let path = '/users/{userId}/sessions'.replace('{userId}', userId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('delete', uri, { 'content-type': 'application/json', }, payload);
                                }), deleteSession: (userId, sessionId) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof userId === 'undefined') { throw new AppwriteException('Missing required parameter: "userId"'); }
                                        if (typeof sessionId === 'undefined') { throw new AppwriteException('Missing required parameter: "sessionId"'); }
                                        let path = '/users/{userId}/sessions/{sessionId}'.replace('{userId}', userId).replace('{sessionId}', sessionId); let payload = {}; const uri = new URL(this.config.endpoint + path); return yield this.call('delete', uri, { 'content-type': 'application/json', }, payload);
                                }), updateStatus: (userId, status) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof userId === 'undefined') { throw new AppwriteException('Missing required parameter: "userId"'); }
                                        if (typeof status === 'undefined') { throw new AppwriteException('Missing required parameter: "status"'); }
                                        let path = '/users/{userId}/status'.replace('{userId}', userId); let payload = {}; if (typeof status !== 'undefined') { payload['status'] = status; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('patch', uri, { 'content-type': 'application/json', }, payload);
                                }), updateEmailVerification: (userId, emailVerification) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof userId === 'undefined') { throw new AppwriteException('Missing required parameter: "userId"'); }
                                        if (typeof emailVerification === 'undefined') { throw new AppwriteException('Missing required parameter: "emailVerification"'); }
                                        let path = '/users/{userId}/verification'.replace('{userId}', userId); let payload = {}; if (typeof emailVerification !== 'undefined') { payload['emailVerification'] = emailVerification; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('patch', uri, { 'content-type': 'application/json', }, payload);
                                }), updatePhoneVerification: (userId, phoneVerification) => __awaiter(this, void 0, void 0, function* () {
                                        if (typeof userId === 'undefined') { throw new AppwriteException('Missing required parameter: "userId"'); }
                                        if (typeof phoneVerification === 'undefined') { throw new AppwriteException('Missing required parameter: "phoneVerification"'); }
                                        let path = '/users/{userId}/verification/phone'.replace('{userId}', userId); let payload = {}; if (typeof phoneVerification !== 'undefined') { payload['phoneVerification'] = phoneVerification; }
                                        const uri = new URL(this.config.endpoint + path); return yield this.call('patch', uri, { 'content-type': 'application/json', }, payload);
                                })
                        };
                }
                setEndpoint(endpoint) { this.config.endpoint = endpoint; this.config.endpointRealtime = this.config.endpointRealtime || this.config.endpoint.replace('https://', 'wss://').replace('http://', 'ws://'); return this; }
                setEndpointRealtime(endpointRealtime) { this.config.endpointRealtime = endpointRealtime; return this; }
                setProject(value) { this.headers['X-Appwrite-Project'] = value; this.config.project = value; return this; }
                setKey(value) { this.headers['X-Appwrite-Key'] = value; this.config.key = value; return this; }
                setJWT(value) { this.headers['X-Appwrite-JWT'] = value; this.config.jwt = value; return this; }
                setLocale(value) { this.headers['X-Appwrite-Locale'] = value; this.config.locale = value; return this; }
                setMode(value) { this.headers['X-Appwrite-Mode'] = value; this.config.mode = value; return this; }
                subscribe(channels, callback) { let channelArray = typeof channels === 'string' ? [channels] : channels; channelArray.forEach(channel => this.realtime.channels.add(channel)); const counter = this.realtime.subscriptionsCounter++; this.realtime.subscriptions.set(counter, { channels: channelArray, callback }); this.realtime.connect(); return () => { this.realtime.subscriptions.delete(counter); this.realtime.cleanUp(channelArray); this.realtime.connect(); }; }
                call(method, url, headers = {}, params = {}) {
                        var _a, _b; return __awaiter(this, void 0, void 0, function* () {
                                method = method.toUpperCase(); headers = Object.assign({}, this.headers, headers); let options = { method, headers, credentials: 'include' }; if (typeof window !== 'undefined' && window.localStorage) { headers['X-Fallback-Cookies'] = (_a = window.localStorage.getItem('cookieFallback')) !== null && _a !== void 0 ? _a : ''; }
                                if (method === 'GET') { for (const [key, value] of Object.entries(this.flatten(params))) { url.searchParams.append(key, value); } }
                                else {
                                        switch (headers['content-type']) {
                                                case 'application/json': options.body = JSON.stringify(params); break; case 'multipart/form-data': let formData = new FormData(); for (const key in params) {
                                                        if (Array.isArray(params[key])) { params[key].forEach((value) => { formData.append(key + '[]', value); }); }
                                                        else { formData.append(key, params[key]); }
                                                }
                                                        options.body = formData; delete headers['content-type']; break;
                                        }
                                }
                                try {
                                        let data = null; const response = yield crossFetch.fetch(url.toString(), options); if ((_b = response.headers.get('content-type')) === null || _b === void 0 ? void 0 : _b.includes('application/json')) { data = yield response.json(); }
                                        else { data = { message: yield response.text() }; }
                                        if (400 <= response.status) { throw new AppwriteException(data === null || data === void 0 ? void 0 : data.message, response.status, data === null || data === void 0 ? void 0 : data.type, data); }
                                        const cookieFallback = response.headers.get('X-Fallback-Cookies'); if (typeof window !== 'undefined' && window.localStorage && cookieFallback) { window.console.warn('Appwrite is using localStorage for session management. Increase your security by adding a custom domain as your API endpoint.'); window.localStorage.setItem('cookieFallback', cookieFallback); }
                                        return data;
                                }
                                catch (e) {
                                        if (e instanceof AppwriteException) { throw e; }
                                        throw new AppwriteException(e.message);
                                }
                        });
                }
                flatten(data, prefix = '') {
                        let output = {}; for (const key in data) {
                                let value = data[key]; let finalKey = prefix ? `${prefix}[${key}]` : key; if (Array.isArray(value)) { output = Object.assign(output, this.flatten(value, finalKey)); }
                                else { output[finalKey] = value; }
                        }
                        return output;
                }
        }
        Appwrite.CHUNK_SIZE = 5 * 1024 * 1024; class Query { }
        Query.equal = (attribute, value) => Query.addQuery(attribute, "equal", value); Query.notEqual = (attribute, value) => Query.addQuery(attribute, "notEqual", value); Query.lesser = (attribute, value) => Query.addQuery(attribute, "lesser", value); Query.lesserEqual = (attribute, value) => Query.addQuery(attribute, "lesserEqual", value); Query.greater = (attribute, value) => Query.addQuery(attribute, "greater", value); Query.greaterEqual = (attribute, value) => Query.addQuery(attribute, "greaterEqual", value); Query.search = (attribute, value) => Query.addQuery(attribute, "search", value); Query.addQuery = (attribute, oper, value) => value instanceof Array ? `${attribute}.${oper}(${value
                .map((v) => Query.parseValues(v))
                .join(",")})` : `${attribute}.${oper}(${Query.parseValues(value)})`; Query.parseValues = (value) => typeof value === "string" || value instanceof String ? `"${value}"` : `${value}`; exports.Appwrite = Appwrite; exports.Query = Query; Object.defineProperty(exports, '__esModule', { value: true });
}(this.window = this.window || {}, null, window)); (function (global, factory) { typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Chart = factory()); })(this, (function () {
        'use strict'; function fontString(pixelSize, fontStyle, fontFamily) { return fontStyle + ' ' + pixelSize + 'px ' + fontFamily; }
        const requestAnimFrame = (function () {
                if (typeof window === 'undefined') { return function (callback) { return callback(); }; }
                return window.requestAnimationFrame;
        }()); function throttled(fn, thisArg, updateFn) { const updateArgs = updateFn || ((args) => Array.prototype.slice.call(args)); let ticking = false; let args = []; return function (...rest) { args = updateArgs(rest); if (!ticking) { ticking = true; requestAnimFrame.call(window, () => { ticking = false; fn.apply(thisArg, args); }); } }; }
        function debounce(fn, delay) {
                let timeout; return function (...args) {
                        if (delay) { clearTimeout(timeout); timeout = setTimeout(fn, delay, args); } else { fn.apply(this, args); }
                        return delay;
                };
        }
        const _toLeftRightCenter = (align) => align === 'start' ? 'left' : align === 'end' ? 'right' : 'center'; const _alignStartEnd = (align, start, end) => align === 'start' ? start : align === 'end' ? end : (start + end) / 2; const _textX = (align, left, right, rtl) => { const check = rtl ? 'left' : 'right'; return align === check ? right : align === 'center' ? (left + right) / 2 : left; }; class Animator {
                constructor() { this._request = null; this._charts = new Map(); this._running = false; this._lastDate = undefined; }
                _notify(chart, anims, date, type) { const callbacks = anims.listeners[type]; const numSteps = anims.duration; callbacks.forEach(fn => fn({ chart, initial: anims.initial, numSteps, currentStep: Math.min(date - anims.start, numSteps) })); }
                _refresh() {
                        if (this._request) { return; }
                        this._running = true; this._request = requestAnimFrame.call(window, () => { this._update(); this._request = null; if (this._running) { this._refresh(); } });
                }
                _update(date = Date.now()) {
                        let remaining = 0; this._charts.forEach((anims, chart) => {
                                if (!anims.running || !anims.items.length) { return; }
                                const items = anims.items; let i = items.length - 1; let draw = false; let item; for (; i >= 0; --i) {
                                        item = items[i]; if (item._active) {
                                                if (item._total > anims.duration) { anims.duration = item._total; }
                                                item.tick(date); draw = true;
                                        } else { items[i] = items[items.length - 1]; items.pop(); }
                                }
                                if (draw) { chart.draw(); this._notify(chart, anims, date, 'progress'); }
                                if (!items.length) { anims.running = false; this._notify(chart, anims, date, 'complete'); anims.initial = false; }
                                remaining += items.length;
                        }); this._lastDate = date; if (remaining === 0) { this._running = false; }
                }
                _getAnims(chart) {
                        const charts = this._charts; let anims = charts.get(chart); if (!anims) { anims = { running: false, initial: true, items: [], listeners: { complete: [], progress: [] } }; charts.set(chart, anims); }
                        return anims;
                }
                listen(chart, event, cb) { this._getAnims(chart).listeners[event].push(cb); }
                add(chart, items) {
                        if (!items || !items.length) { return; }
                        this._getAnims(chart).items.push(...items);
                }
                has(chart) { return this._getAnims(chart).items.length > 0; }
                start(chart) {
                        const anims = this._charts.get(chart); if (!anims) { return; }
                        anims.running = true; anims.start = Date.now(); anims.duration = anims.items.reduce((acc, cur) => Math.max(acc, cur._duration), 0); this._refresh();
                }
                running(chart) {
                        if (!this._running) { return false; }
                        const anims = this._charts.get(chart); if (!anims || !anims.running || !anims.items.length) { return false; }
                        return true;
                }
                stop(chart) {
                        const anims = this._charts.get(chart); if (!anims || !anims.items.length) { return; }
                        const items = anims.items; let i = items.length - 1; for (; i >= 0; --i) { items[i].cancel(); }
                        anims.items = []; this._notify(chart, anims, Date.now(), 'complete');
                }
                remove(chart) { return this._charts.delete(chart); }
        }
        var animator = new Animator(); function round(v) { return v + 0.5 | 0; }
        const lim = (v, l, h) => Math.max(Math.min(v, h), l); function p2b(v) { return lim(round(v * 2.55), 0, 255); }
        function n2b(v) { return lim(round(v * 255), 0, 255); }
        function b2n(v) { return lim(round(v / 2.55) / 100, 0, 1); }
        function n2p(v) { return lim(round(v * 100), 0, 100); }
        const map$1 = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, a: 10, b: 11, c: 12, d: 13, e: 14, f: 15 }; const hex = [...'0123456789ABCDEF']; const h1 = b => hex[b & 0xF]; const h2 = b => hex[(b & 0xF0) >> 4] + hex[b & 0xF]; const eq = b => ((b & 0xF0) >> 4) === (b & 0xF); const isShort = v => eq(v.r) && eq(v.g) && eq(v.b) && eq(v.a); function hexParse(str) {
                var len = str.length; var ret; if (str[0] === '#') { if (len === 4 || len === 5) { ret = { r: 255 & map$1[str[1]] * 17, g: 255 & map$1[str[2]] * 17, b: 255 & map$1[str[3]] * 17, a: len === 5 ? map$1[str[4]] * 17 : 255 }; } else if (len === 7 || len === 9) { ret = { r: map$1[str[1]] << 4 | map$1[str[2]], g: map$1[str[3]] << 4 | map$1[str[4]], b: map$1[str[5]] << 4 | map$1[str[6]], a: len === 9 ? (map$1[str[7]] << 4 | map$1[str[8]]) : 255 }; } }
                return ret;
        }
        const alpha = (a, f) => a < 255 ? f(a) : ''; function hexString(v) { var f = isShort(v) ? h1 : h2; return v ? '#' + f(v.r) + f(v.g) + f(v.b) + alpha(v.a, f) : undefined; }
        const HUE_RE = /^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/; function hsl2rgbn(h, s, l) { const a = s * Math.min(l, 1 - l); const f = (n, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); return [f(0), f(8), f(4)]; }
        function hsv2rgbn(h, s, v) { const f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0); return [f(5), f(3), f(1)]; }
        function hwb2rgbn(h, w, b) {
                const rgb = hsl2rgbn(h, 1, 0.5); let i; if (w + b > 1) { i = 1 / (w + b); w *= i; b *= i; }
                for (i = 0; i < 3; i++) { rgb[i] *= 1 - w - b; rgb[i] += w; }
                return rgb;
        }
        function hueValue(r, g, b, d, max) {
                if (r === max) { return ((g - b) / d) + (g < b ? 6 : 0); }
                if (g === max) { return (b - r) / d + 2; }
                return (r - g) / d + 4;
        }
        function rgb2hsl(v) {
                const range = 255; const r = v.r / range; const g = v.g / range; const b = v.b / range; const max = Math.max(r, g, b); const min = Math.min(r, g, b); const l = (max + min) / 2; let h, s, d; if (max !== min) { d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min); h = hueValue(r, g, b, d, max); h = h * 60 + 0.5; }
                return [h | 0, s || 0, l];
        }
        function calln(f, a, b, c) { return (Array.isArray(a) ? f(a[0], a[1], a[2]) : f(a, b, c)).map(n2b); }
        function hsl2rgb(h, s, l) { return calln(hsl2rgbn, h, s, l); }
        function hwb2rgb(h, w, b) { return calln(hwb2rgbn, h, w, b); }
        function hsv2rgb(h, s, v) { return calln(hsv2rgbn, h, s, v); }
        function hue(h) { return (h % 360 + 360) % 360; }
        function hueParse(str) {
                const m = HUE_RE.exec(str); let a = 255; let v; if (!m) { return; }
                if (m[5] !== v) { a = m[6] ? p2b(+m[5]) : n2b(+m[5]); }
                const h = hue(+m[2]); const p1 = +m[3] / 100; const p2 = +m[4] / 100; if (m[1] === 'hwb') { v = hwb2rgb(h, p1, p2); } else if (m[1] === 'hsv') { v = hsv2rgb(h, p1, p2); } else { v = hsl2rgb(h, p1, p2); }
                return { r: v[0], g: v[1], b: v[2], a: a };
        }
        function rotate(v, deg) { var h = rgb2hsl(v); h[0] = hue(h[0] + deg); h = hsl2rgb(h); v.r = h[0]; v.g = h[1]; v.b = h[2]; }
        function hslString(v) {
                if (!v) { return; }
                const a = rgb2hsl(v); const h = a[0]; const s = n2p(a[1]); const l = n2p(a[2]); return v.a < 255 ? `hsla(${h}, ${s}%, ${l}%, ${b2n(v.a)})` : `hsl(${h}, ${s}%, ${l}%)`;
        }
        const map$2 = { x: 'dark', Z: 'light', Y: 're', X: 'blu', W: 'gr', V: 'medium', U: 'slate', A: 'ee', T: 'ol', S: 'or', B: 'ra', C: 'lateg', D: 'ights', R: 'in', Q: 'turquois', E: 'hi', P: 'ro', O: 'al', N: 'le', M: 'de', L: 'yello', F: 'en', K: 'ch', G: 'arks', H: 'ea', I: 'ightg', J: 'wh' }; const names$1 = { OiceXe: 'f0f8ff', antiquewEte: 'faebd7', aqua: 'ffff', aquamarRe: '7fffd4', azuY: 'f0ffff', beige: 'f5f5dc', bisque: 'ffe4c4', black: '0', blanKedOmond: 'ffebcd', Xe: 'ff', XeviTet: '8a2be2', bPwn: 'a52a2a', burlywood: 'deb887', caMtXe: '5f9ea0', KartYuse: '7fff00', KocTate: 'd2691e', cSO: 'ff7f50', cSnflowerXe: '6495ed', cSnsilk: 'fff8dc', crimson: 'dc143c', cyan: 'ffff', xXe: '8b', xcyan: '8b8b', xgTMnPd: 'b8860b', xWay: 'a9a9a9', xgYF: '6400', xgYy: 'a9a9a9', xkhaki: 'bdb76b', xmagFta: '8b008b', xTivegYF: '556b2f', xSange: 'ff8c00', xScEd: '9932cc', xYd: '8b0000', xsOmon: 'e9967a', xsHgYF: '8fbc8f', xUXe: '483d8b', xUWay: '2f4f4f', xUgYy: '2f4f4f', xQe: 'ced1', xviTet: '9400d3', dAppRk: 'ff1493', dApskyXe: 'bfff', dimWay: '696969', dimgYy: '696969', dodgerXe: '1e90ff', fiYbrick: 'b22222', flSOwEte: 'fffaf0', foYstWAn: '228b22', fuKsia: 'ff00ff', gaRsbSo: 'dcdcdc', ghostwEte: 'f8f8ff', gTd: 'ffd700', gTMnPd: 'daa520', Way: '808080', gYF: '8000', gYFLw: 'adff2f', gYy: '808080', honeyMw: 'f0fff0', hotpRk: 'ff69b4', RdianYd: 'cd5c5c', Rdigo: '4b0082', ivSy: 'fffff0', khaki: 'f0e68c', lavFMr: 'e6e6fa', lavFMrXsh: 'fff0f5', lawngYF: '7cfc00', NmoncEffon: 'fffacd', ZXe: 'add8e6', ZcSO: 'f08080', Zcyan: 'e0ffff', ZgTMnPdLw: 'fafad2', ZWay: 'd3d3d3', ZgYF: '90ee90', ZgYy: 'd3d3d3', ZpRk: 'ffb6c1', ZsOmon: 'ffa07a', ZsHgYF: '20b2aa', ZskyXe: '87cefa', ZUWay: '778899', ZUgYy: '778899', ZstAlXe: 'b0c4de', ZLw: 'ffffe0', lime: 'ff00', limegYF: '32cd32', lRF: 'faf0e6', magFta: 'ff00ff', maPon: '800000', VaquamarRe: '66cdaa', VXe: 'cd', VScEd: 'ba55d3', VpurpN: '9370db', VsHgYF: '3cb371', VUXe: '7b68ee', VsprRggYF: 'fa9a', VQe: '48d1cc', VviTetYd: 'c71585', midnightXe: '191970', mRtcYam: 'f5fffa', mistyPse: 'ffe4e1', moccasR: 'ffe4b5', navajowEte: 'ffdead', navy: '80', Tdlace: 'fdf5e6', Tive: '808000', TivedBb: '6b8e23', Sange: 'ffa500', SangeYd: 'ff4500', ScEd: 'da70d6', pOegTMnPd: 'eee8aa', pOegYF: '98fb98', pOeQe: 'afeeee', pOeviTetYd: 'db7093', papayawEp: 'ffefd5', pHKpuff: 'ffdab9', peru: 'cd853f', pRk: 'ffc0cb', plum: 'dda0dd', powMrXe: 'b0e0e6', purpN: '800080', YbeccapurpN: '663399', Yd: 'ff0000', Psybrown: 'bc8f8f', PyOXe: '4169e1', saddNbPwn: '8b4513', sOmon: 'fa8072', sandybPwn: 'f4a460', sHgYF: '2e8b57', sHshell: 'fff5ee', siFna: 'a0522d', silver: 'c0c0c0', skyXe: '87ceeb', UXe: '6a5acd', UWay: '708090', UgYy: '708090', snow: 'fffafa', sprRggYF: 'ff7f', stAlXe: '4682b4', tan: 'd2b48c', teO: '8080', tEstN: 'd8bfd8', tomato: 'ff6347', Qe: '40e0d0', viTet: 'ee82ee', JHt: 'f5deb3', wEte: 'ffffff', wEtesmoke: 'f5f5f5', Lw: 'ffff00', LwgYF: '9acd32' }; function unpack() {
                const unpacked = {}; const keys = Object.keys(names$1); const tkeys = Object.keys(map$2); let i, j, k, ok, nk; for (i = 0; i < keys.length; i++) {
                        ok = nk = keys[i]; for (j = 0; j < tkeys.length; j++) { k = tkeys[j]; nk = nk.replace(k, map$2[k]); }
                        k = parseInt(names$1[ok], 16); unpacked[nk] = [k >> 16 & 0xFF, k >> 8 & 0xFF, k & 0xFF];
                }
                return unpacked;
        }
        let names; function nameParse(str) {
                if (!names) { names = unpack(); names.transparent = [0, 0, 0, 0]; }
                const a = names[str.toLowerCase()]; return a && { r: a[0], g: a[1], b: a[2], a: a.length === 4 ? a[3] : 255 };
        }
        const RGB_RE = /^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/; function rgbParse(str) {
                const m = RGB_RE.exec(str); let a = 255; let r, g, b; if (!m) { return; }
                if (m[7] !== r) { const v = +m[7]; a = m[8] ? p2b(v) : lim(v * 255, 0, 255); }
                r = +m[1]; g = +m[3]; b = +m[5]; r = 255 & (m[2] ? p2b(r) : lim(r, 0, 255)); g = 255 & (m[4] ? p2b(g) : lim(g, 0, 255)); b = 255 & (m[6] ? p2b(b) : lim(b, 0, 255)); return { r: r, g: g, b: b, a: a };
        }
        function rgbString(v) { return v && (v.a < 255 ? `rgba(${v.r}, ${v.g}, ${v.b}, ${b2n(v.a)})` : `rgb(${v.r}, ${v.g}, ${v.b})`); }
        const to = v => v <= 0.0031308 ? v * 12.92 : Math.pow(v, 1.0 / 2.4) * 1.055 - 0.055; const from = v => v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); function interpolate$1(rgb1, rgb2, t) { const r = from(b2n(rgb1.r)); const g = from(b2n(rgb1.g)); const b = from(b2n(rgb1.b)); return { r: n2b(to(r + t * (from(b2n(rgb2.r)) - r))), g: n2b(to(g + t * (from(b2n(rgb2.g)) - g))), b: n2b(to(b + t * (from(b2n(rgb2.b)) - b))), a: rgb1.a + t * (rgb2.a - rgb1.a) }; }
        function modHSL(v, i, ratio) { if (v) { let tmp = rgb2hsl(v); tmp[i] = Math.max(0, Math.min(tmp[i] + tmp[i] * ratio, i === 0 ? 360 : 1)); tmp = hsl2rgb(tmp); v.r = tmp[0]; v.g = tmp[1]; v.b = tmp[2]; } }
        function clone$1(v, proto) { return v ? Object.assign(proto || {}, v) : v; }
        function fromObject(input) {
                var v = { r: 0, g: 0, b: 0, a: 255 }; if (Array.isArray(input)) { if (input.length >= 3) { v = { r: input[0], g: input[1], b: input[2], a: 255 }; if (input.length > 3) { v.a = n2b(input[3]); } } } else { v = clone$1(input, { r: 0, g: 0, b: 0, a: 1 }); v.a = n2b(v.a); }
                return v;
        }
        function functionParse(str) {
                if (str.charAt(0) === 'r') { return rgbParse(str); }
                return hueParse(str);
        }
        class Color {
                constructor(input) {
                        if (input instanceof Color) { return input; }
                        const type = typeof input; let v; if (type === 'object') { v = fromObject(input); } else if (type === 'string') { v = hexParse(input) || nameParse(input) || functionParse(input); }
                        this._rgb = v; this._valid = !!v;
                }
                get valid() { return this._valid; }
                get rgb() {
                        var v = clone$1(this._rgb); if (v) { v.a = b2n(v.a); }
                        return v;
                }
                set rgb(obj) { this._rgb = fromObject(obj); }
                rgbString() { return this._valid ? rgbString(this._rgb) : undefined; }
                hexString() { return this._valid ? hexString(this._rgb) : undefined; }
                hslString() { return this._valid ? hslString(this._rgb) : undefined; }
                mix(color, weight) {
                        if (color) { const c1 = this.rgb; const c2 = color.rgb; let w2; const p = weight === w2 ? 0.5 : weight; const w = 2 * p - 1; const a = c1.a - c2.a; const w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2.0; w2 = 1 - w1; c1.r = 0xFF & w1 * c1.r + w2 * c2.r + 0.5; c1.g = 0xFF & w1 * c1.g + w2 * c2.g + 0.5; c1.b = 0xFF & w1 * c1.b + w2 * c2.b + 0.5; c1.a = p * c1.a + (1 - p) * c2.a; this.rgb = c1; }
                        return this;
                }
                interpolate(color, t) {
                        if (color) { this._rgb = interpolate$1(this._rgb, color._rgb, t); }
                        return this;
                }
                clone() { return new Color(this.rgb); }
                alpha(a) { this._rgb.a = n2b(a); return this; }
                clearer(ratio) { const rgb = this._rgb; rgb.a *= 1 - ratio; return this; }
                greyscale() { const rgb = this._rgb; const val = round(rgb.r * 0.3 + rgb.g * 0.59 + rgb.b * 0.11); rgb.r = rgb.g = rgb.b = val; return this; }
                opaquer(ratio) { const rgb = this._rgb; rgb.a *= 1 + ratio; return this; }
                negate() { const v = this._rgb; v.r = 255 - v.r; v.g = 255 - v.g; v.b = 255 - v.b; return this; }
                lighten(ratio) { modHSL(this._rgb, 2, ratio); return this; }
                darken(ratio) { modHSL(this._rgb, 2, -ratio); return this; }
                saturate(ratio) { modHSL(this._rgb, 1, ratio); return this; }
                desaturate(ratio) { modHSL(this._rgb, 1, -ratio); return this; }
                rotate(deg) { rotate(this._rgb, deg); return this; }
        }
        function index_esm(input) { return new Color(input); }
        function isPatternOrGradient(value) {
                if (value && typeof value === 'object') { const type = value.toString(); return type === '[object CanvasPattern]' || type === '[object CanvasGradient]'; }
                return false;
        }
        function color(value) { return isPatternOrGradient(value) ? value : index_esm(value); }
        function getHoverColor(value) { return isPatternOrGradient(value) ? value : index_esm(value).saturate(0.5).darken(0.1).hexString(); }
        function noop() { }
        const uid = (function () { let id = 0; return function () { return id++; }; }()); function isNullOrUndef(value) { return value === null || typeof value === 'undefined'; }
        function isArray(value) {
                if (Array.isArray && Array.isArray(value)) { return true; }
                const type = Object.prototype.toString.call(value); if (type.slice(0, 7) === '[object' && type.slice(-6) === 'Array]') { return true; }
                return false;
        }
        function isObject(value) { return value !== null && Object.prototype.toString.call(value) === '[object Object]'; }
        const isNumberFinite = (value) => (typeof value === 'number' || value instanceof Number) && isFinite(+value); function finiteOrDefault(value, defaultValue) { return isNumberFinite(value) ? value : defaultValue; }
        function valueOrDefault(value, defaultValue) { return typeof value === 'undefined' ? defaultValue : value; }
        const toPercentage = (value, dimension) => typeof value === 'string' && value.endsWith('%') ? parseFloat(value) / 100 : value / dimension; const toDimension = (value, dimension) => typeof value === 'string' && value.endsWith('%') ? parseFloat(value) / 100 * dimension : +value; function callback(fn, args, thisArg) { if (fn && typeof fn.call === 'function') { return fn.apply(thisArg, args); } }
        function each(loopable, fn, thisArg, reverse) { let i, len, keys; if (isArray(loopable)) { len = loopable.length; if (reverse) { for (i = len - 1; i >= 0; i--) { fn.call(thisArg, loopable[i], i); } } else { for (i = 0; i < len; i++) { fn.call(thisArg, loopable[i], i); } } } else if (isObject(loopable)) { keys = Object.keys(loopable); len = keys.length; for (i = 0; i < len; i++) { fn.call(thisArg, loopable[keys[i]], keys[i]); } } }
        function _elementsEqual(a0, a1) {
                let i, ilen, v0, v1; if (!a0 || !a1 || a0.length !== a1.length) { return false; }
                for (i = 0, ilen = a0.length; i < ilen; ++i) { v0 = a0[i]; v1 = a1[i]; if (v0.datasetIndex !== v1.datasetIndex || v0.index !== v1.index) { return false; } }
                return true;
        }
        function clone(source) {
                if (isArray(source)) { return source.map(clone); }
                if (isObject(source)) {
                        const target = Object.create(null); const keys = Object.keys(source); const klen = keys.length; let k = 0; for (; k < klen; ++k) { target[keys[k]] = clone(source[keys[k]]); }
                        return target;
                }
                return source;
        }
        function isValidKey(key) { return ['__proto__', 'prototype', 'constructor'].indexOf(key) === -1; }
        function _merger(key, target, source, options) {
                if (!isValidKey(key)) { return; }
                const tval = target[key]; const sval = source[key]; if (isObject(tval) && isObject(sval)) { merge(tval, sval, options); } else { target[key] = clone(sval); }
        }
        function merge(target, source, options) {
                const sources = isArray(source) ? source : [source]; const ilen = sources.length; if (!isObject(target)) { return target; }
                options = options || {}; const merger = options.merger || _merger; for (let i = 0; i < ilen; ++i) {
                        source = sources[i]; if (!isObject(source)) { continue; }
                        const keys = Object.keys(source); for (let k = 0, klen = keys.length; k < klen; ++k) { merger(keys[k], target, source, options); }
                }
                return target;
        }
        function mergeIf(target, source) { return merge(target, source, { merger: _mergerIf }); }
        function _mergerIf(key, target, source) {
                if (!isValidKey(key)) { return; }
                const tval = target[key]; const sval = source[key]; if (isObject(tval) && isObject(sval)) { mergeIf(tval, sval); } else if (!Object.prototype.hasOwnProperty.call(target, key)) { target[key] = clone(sval); }
        }
        function _deprecated(scope, value, previous, current) { if (value !== undefined) { console.warn(scope + ': "' + previous + '" is deprecated. Please use "' + current + '" instead'); } }
        const emptyString = ''; const dot = '.'; function indexOfDotOrLength(key, start) { const idx = key.indexOf(dot, start); return idx === -1 ? key.length : idx; }
        function resolveObjectKey(obj, key) {
                if (key === emptyString) { return obj; }
                let pos = 0; let idx = indexOfDotOrLength(key, pos); while (obj && idx > pos) { obj = obj[key.slice(pos, idx)]; pos = idx + 1; idx = indexOfDotOrLength(key, pos); }
                return obj;
        }
        function _capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
        const defined = (value) => typeof value !== 'undefined'; const isFunction = (value) => typeof value === 'function'; const setsEqual = (a, b) => {
                if (a.size !== b.size) { return false; }
                for (const item of a) { if (!b.has(item)) { return false; } }
                return true;
        }; function _isClickEvent(e) { return e.type === 'mouseup' || e.type === 'click' || e.type === 'contextmenu'; }
        const overrides = Object.create(null); const descriptors = Object.create(null); function getScope$1(node, key) {
                if (!key) { return node; }
                const keys = key.split('.'); for (let i = 0, n = keys.length; i < n; ++i) { const k = keys[i]; node = node[k] || (node[k] = Object.create(null)); }
                return node;
        }
        function set(root, scope, values) {
                if (typeof scope === 'string') { return merge(getScope$1(root, scope), values); }
                return merge(getScope$1(root, ''), scope);
        }
        class Defaults {
                constructor(_descriptors) { this.animation = undefined; this.backgroundColor = 'rgba(0,0,0,0.1)'; this.borderColor = 'rgba(0,0,0,0.1)'; this.color = '#666'; this.datasets = {}; this.devicePixelRatio = (context) => context.chart.platform.getDevicePixelRatio(); this.elements = {}; this.events = ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove']; this.font = { family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif", size: 12, style: 'normal', lineHeight: 1.2, weight: null }; this.hover = {}; this.hoverBackgroundColor = (ctx, options) => getHoverColor(options.backgroundColor); this.hoverBorderColor = (ctx, options) => getHoverColor(options.borderColor); this.hoverColor = (ctx, options) => getHoverColor(options.color); this.indexAxis = 'x'; this.interaction = { mode: 'nearest', intersect: true, includeInvisible: false }; this.maintainAspectRatio = true; this.onHover = null; this.onClick = null; this.parsing = true; this.plugins = {}; this.responsive = true; this.scale = undefined; this.scales = {}; this.showLine = true; this.drawActiveElementsOnTop = true; this.describe(_descriptors); }
                set(scope, values) { return set(this, scope, values); }
                get(scope) { return getScope$1(this, scope); }
                describe(scope, values) { return set(descriptors, scope, values); }
                override(scope, values) { return set(overrides, scope, values); }
                route(scope, name, targetScope, targetName) {
                        const scopeObject = getScope$1(this, scope); const targetScopeObject = getScope$1(this, targetScope); const privateName = '_' + name; Object.defineProperties(scopeObject, {
                                [privateName]: { value: scopeObject[name], writable: true }, [name]: {
                                        enumerable: true, get() {
                                                const local = this[privateName]; const target = targetScopeObject[targetName]; if (isObject(local)) { return Object.assign({}, target, local); }
                                                return valueOrDefault(local, target);
                                        }, set(value) { this[privateName] = value; }
                                }
                        });
                }
        }
        var defaults = new Defaults({ _scriptable: (name) => !name.startsWith('on'), _indexable: (name) => name !== 'events', hover: { _fallback: 'interaction' }, interaction: { _scriptable: false, _indexable: false, } }); function _lookup(table, value, cmp) {
                cmp = cmp || ((index) => table[index] < value); let hi = table.length - 1; let lo = 0; let mid; while (hi - lo > 1) { mid = (lo + hi) >> 1; if (cmp(mid)) { lo = mid; } else { hi = mid; } }
                return { lo, hi };
        }
        const _lookupByKey = (table, key, value) => _lookup(table, value, index => table[index][key] < value); const _rlookupByKey = (table, key, value) => _lookup(table, value, index => table[index][key] >= value); function _filterBetween(values, min, max) {
                let start = 0; let end = values.length; while (start < end && values[start] < min) { start++; }
                while (end > start && values[end - 1] > max) { end--; }
                return start > 0 || end < values.length ? values.slice(start, end) : values;
        }
        const arrayEvents = ['push', 'pop', 'shift', 'splice', 'unshift']; function listenArrayEvents(array, listener) {
                if (array._chartjs) { array._chartjs.listeners.push(listener); return; }
                Object.defineProperty(array, '_chartjs', { configurable: true, enumerable: false, value: { listeners: [listener] } }); arrayEvents.forEach((key) => { const method = '_onData' + _capitalize(key); const base = array[key]; Object.defineProperty(array, key, { configurable: true, enumerable: false, value(...args) { const res = base.apply(this, args); array._chartjs.listeners.forEach((object) => { if (typeof object[method] === 'function') { object[method](...args); } }); return res; } }); });
        }
        function unlistenArrayEvents(array, listener) {
                const stub = array._chartjs; if (!stub) { return; }
                const listeners = stub.listeners; const index = listeners.indexOf(listener); if (index !== -1) { listeners.splice(index, 1); }
                if (listeners.length > 0) { return; }
                arrayEvents.forEach((key) => { delete array[key]; }); delete array._chartjs;
        }
        function _arrayUnique(items) {
                const set = new Set(); let i, ilen; for (i = 0, ilen = items.length; i < ilen; ++i) { set.add(items[i]); }
                if (set.size === ilen) { return items; }
                return Array.from(set);
        }
        const PI = Math.PI; const TAU = 2 * PI; const PITAU = TAU + PI; const INFINITY = Number.POSITIVE_INFINITY; const RAD_PER_DEG = PI / 180; const HALF_PI = PI / 2; const QUARTER_PI = PI / 4; const TWO_THIRDS_PI = PI * 2 / 3; const log10 = Math.log10; const sign = Math.sign; function niceNum(range) { const roundedRange = Math.round(range); range = almostEquals(range, roundedRange, range / 1000) ? roundedRange : range; const niceRange = Math.pow(10, Math.floor(log10(range))); const fraction = range / niceRange; const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10; return niceFraction * niceRange; }
        function _factorize(value) {
                const result = []; const sqrt = Math.sqrt(value); let i; for (i = 1; i < sqrt; i++) { if (value % i === 0) { result.push(i); result.push(value / i); } }
                if (sqrt === (sqrt | 0)) { result.push(sqrt); }
                result.sort((a, b) => a - b).pop(); return result;
        }
        function isNumber(n) { return !isNaN(parseFloat(n)) && isFinite(n); }
        function almostEquals(x, y, epsilon) { return Math.abs(x - y) < epsilon; }
        function almostWhole(x, epsilon) { const rounded = Math.round(x); return ((rounded - epsilon) <= x) && ((rounded + epsilon) >= x); }
        function _setMinAndMaxByKey(array, target, property) { let i, ilen, value; for (i = 0, ilen = array.length; i < ilen; i++) { value = array[i][property]; if (!isNaN(value)) { target.min = Math.min(target.min, value); target.max = Math.max(target.max, value); } } }
        function toRadians(degrees) { return degrees * (PI / 180); }
        function toDegrees(radians) { return radians * (180 / PI); }
        function _decimalPlaces(x) {
                if (!isNumberFinite(x)) { return; }
                let e = 1; let p = 0; while (Math.round(x * e) / e !== x) { e *= 10; p++; }
                return p;
        }
        function getAngleFromPoint(centrePoint, anglePoint) {
                const distanceFromXCenter = anglePoint.x - centrePoint.x; const distanceFromYCenter = anglePoint.y - centrePoint.y; const radialDistanceFromCenter = Math.sqrt(distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter); let angle = Math.atan2(distanceFromYCenter, distanceFromXCenter); if (angle < (-0.5 * PI)) { angle += TAU; }
                return { angle, distance: radialDistanceFromCenter };
        }
        function distanceBetweenPoints(pt1, pt2) { return Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2)); }
        function _angleDiff(a, b) { return (a - b + PITAU) % TAU - PI; }
        function _normalizeAngle(a) { return (a % TAU + TAU) % TAU; }
        function _angleBetween(angle, start, end, sameAngleIsFullCircle) { const a = _normalizeAngle(angle); const s = _normalizeAngle(start); const e = _normalizeAngle(end); const angleToStart = _normalizeAngle(s - a); const angleToEnd = _normalizeAngle(e - a); const startToAngle = _normalizeAngle(a - s); const endToAngle = _normalizeAngle(a - e); return a === s || a === e || (sameAngleIsFullCircle && s === e) || (angleToStart > angleToEnd && startToAngle < endToAngle); }
        function _limitValue(value, min, max) { return Math.max(min, Math.min(max, value)); }
        function _int16Range(value) { return _limitValue(value, -32768, 32767); }
        function _isBetween(value, start, end, epsilon = 1e-6) { return value >= Math.min(start, end) - epsilon && value <= Math.max(start, end) + epsilon; }
        function _isDomSupported() { return typeof window !== 'undefined' && typeof document !== 'undefined'; }
        function _getParentNode(domNode) {
                let parent = domNode.parentNode; if (parent && parent.toString() === '[object ShadowRoot]') { parent = parent.host; }
                return parent;
        }
        function parseMaxStyle(styleValue, node, parentProperty) {
                let valueInPixels; if (typeof styleValue === 'string') { valueInPixels = parseInt(styleValue, 10); if (styleValue.indexOf('%') !== -1) { valueInPixels = valueInPixels / 100 * node.parentNode[parentProperty]; } } else { valueInPixels = styleValue; }
                return valueInPixels;
        }
        const getComputedStyle = (element) => window.getComputedStyle(element, null); function getStyle(el, property) { return getComputedStyle(el).getPropertyValue(property); }
        const positions = ['top', 'right', 'bottom', 'left']; function getPositionedStyle(styles, style, suffix) {
                const result = {}; suffix = suffix ? '-' + suffix : ''; for (let i = 0; i < 4; i++) { const pos = positions[i]; result[pos] = parseFloat(styles[style + '-' + pos + suffix]) || 0; }
                result.width = result.left + result.right; result.height = result.top + result.bottom; return result;
        }
        const useOffsetPos = (x, y, target) => (x > 0 || y > 0) && (!target || !target.shadowRoot); function getCanvasPosition(e, canvas) {
                const touches = e.touches; const source = touches && touches.length ? touches[0] : e; const { offsetX, offsetY } = source; let box = false; let x, y; if (useOffsetPos(offsetX, offsetY, e.target)) { x = offsetX; y = offsetY; } else { const rect = canvas.getBoundingClientRect(); x = source.clientX - rect.left; y = source.clientY - rect.top; box = true; }
                return { x, y, box };
        }
        function getRelativePosition(evt, chart) {
                if ('native' in evt) { return evt; }
                const { canvas, currentDevicePixelRatio } = chart; const style = getComputedStyle(canvas); const borderBox = style.boxSizing === 'border-box'; const paddings = getPositionedStyle(style, 'padding'); const borders = getPositionedStyle(style, 'border', 'width'); const { x, y, box } = getCanvasPosition(evt, canvas); const xOffset = paddings.left + (box && borders.left); const yOffset = paddings.top + (box && borders.top); let { width, height } = chart; if (borderBox) { width -= paddings.width + borders.width; height -= paddings.height + borders.height; }
                return { x: Math.round((x - xOffset) / width * canvas.width / currentDevicePixelRatio), y: Math.round((y - yOffset) / height * canvas.height / currentDevicePixelRatio) };
        }
        function getContainerSize(canvas, width, height) {
                let maxWidth, maxHeight; if (width === undefined || height === undefined) { const container = _getParentNode(canvas); if (!container) { width = canvas.clientWidth; height = canvas.clientHeight; } else { const rect = container.getBoundingClientRect(); const containerStyle = getComputedStyle(container); const containerBorder = getPositionedStyle(containerStyle, 'border', 'width'); const containerPadding = getPositionedStyle(containerStyle, 'padding'); width = rect.width - containerPadding.width - containerBorder.width; height = rect.height - containerPadding.height - containerBorder.height; maxWidth = parseMaxStyle(containerStyle.maxWidth, container, 'clientWidth'); maxHeight = parseMaxStyle(containerStyle.maxHeight, container, 'clientHeight'); } }
                return { width, height, maxWidth: maxWidth || INFINITY, maxHeight: maxHeight || INFINITY };
        }
        const round1 = v => Math.round(v * 10) / 10; function getMaximumSize(canvas, bbWidth, bbHeight, aspectRatio) {
                const style = getComputedStyle(canvas); const margins = getPositionedStyle(style, 'margin'); const maxWidth = parseMaxStyle(style.maxWidth, canvas, 'clientWidth') || INFINITY; const maxHeight = parseMaxStyle(style.maxHeight, canvas, 'clientHeight') || INFINITY; const containerSize = getContainerSize(canvas, bbWidth, bbHeight); let { width, height } = containerSize; if (style.boxSizing === 'content-box') { const borders = getPositionedStyle(style, 'border', 'width'); const paddings = getPositionedStyle(style, 'padding'); width -= paddings.width + borders.width; height -= paddings.height + borders.height; }
                width = Math.max(0, width - margins.width); height = Math.max(0, aspectRatio ? Math.floor(width / aspectRatio) : height - margins.height); width = round1(Math.min(width, maxWidth, containerSize.maxWidth)); height = round1(Math.min(height, maxHeight, containerSize.maxHeight)); if (width && !height) { height = round1(width / 2); }
                return { width, height };
        }
        function retinaScale(chart, forceRatio, forceStyle) {
                const pixelRatio = forceRatio || 1; const deviceHeight = Math.floor(chart.height * pixelRatio); const deviceWidth = Math.floor(chart.width * pixelRatio); chart.height = deviceHeight / pixelRatio; chart.width = deviceWidth / pixelRatio; const canvas = chart.canvas; if (canvas.style && (forceStyle || (!canvas.style.height && !canvas.style.width))) { canvas.style.height = `${chart.height}px`; canvas.style.width = `${chart.width}px`; }
                if (chart.currentDevicePixelRatio !== pixelRatio || canvas.height !== deviceHeight || canvas.width !== deviceWidth) { chart.currentDevicePixelRatio = pixelRatio; canvas.height = deviceHeight; canvas.width = deviceWidth; chart.ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0); return true; }
                return false;
        }
        const supportsEventListenerOptions = (function () {
                let passiveSupported = false; try { const options = { get passive() { passiveSupported = true; return false; } }; window.addEventListener('test', null, options); window.removeEventListener('test', null, options); } catch (e) { }
                return passiveSupported;
        }()); function readUsedSize(element, property) { const value = getStyle(element, property); const matches = value && value.match(/^(\d+)(\.\d+)?px$/); return matches ? +matches[1] : undefined; }
        function toFontString(font) {
                if (!font || isNullOrUndef(font.size) || isNullOrUndef(font.family)) { return null; }
                return (font.style ? font.style + ' ' : '')
                        + (font.weight ? font.weight + ' ' : '')
                        + font.size + 'px '
                        + font.family;
        }
        function _measureText(ctx, data, gc, longest, string) {
                let textWidth = data[string]; if (!textWidth) { textWidth = data[string] = ctx.measureText(string).width; gc.push(string); }
                if (textWidth > longest) { longest = textWidth; }
                return longest;
        }
        function _longestText(ctx, font, arrayOfThings, cache) {
                cache = cache || {}; let data = cache.data = cache.data || {}; let gc = cache.garbageCollect = cache.garbageCollect || []; if (cache.font !== font) { data = cache.data = {}; gc = cache.garbageCollect = []; cache.font = font; }
                ctx.save(); ctx.font = font; let longest = 0; const ilen = arrayOfThings.length; let i, j, jlen, thing, nestedThing; for (i = 0; i < ilen; i++) { thing = arrayOfThings[i]; if (thing !== undefined && thing !== null && isArray(thing) !== true) { longest = _measureText(ctx, data, gc, longest, thing); } else if (isArray(thing)) { for (j = 0, jlen = thing.length; j < jlen; j++) { nestedThing = thing[j]; if (nestedThing !== undefined && nestedThing !== null && !isArray(nestedThing)) { longest = _measureText(ctx, data, gc, longest, nestedThing); } } } }
                ctx.restore(); const gcLen = gc.length / 2; if (gcLen > arrayOfThings.length) {
                        for (i = 0; i < gcLen; i++) { delete data[gc[i]]; }
                        gc.splice(0, gcLen);
                }
                return longest;
        }
        function _alignPixel(chart, pixel, width) { const devicePixelRatio = chart.currentDevicePixelRatio; const halfWidth = width !== 0 ? Math.max(width / 2, 0.5) : 0; return Math.round((pixel - halfWidth) * devicePixelRatio) / devicePixelRatio + halfWidth; }
        function clearCanvas(canvas, ctx) { ctx = ctx || canvas.getContext('2d'); ctx.save(); ctx.resetTransform(); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.restore(); }
        function drawPoint(ctx, options, x, y) {
                let type, xOffset, yOffset, size, cornerRadius; const style = options.pointStyle; const rotation = options.rotation; const radius = options.radius; let rad = (rotation || 0) * RAD_PER_DEG; if (style && typeof style === 'object') { type = style.toString(); if (type === '[object HTMLImageElement]' || type === '[object HTMLCanvasElement]') { ctx.save(); ctx.translate(x, y); ctx.rotate(rad); ctx.drawImage(style, -style.width / 2, -style.height / 2, style.width, style.height); ctx.restore(); return; } }
                if (isNaN(radius) || radius <= 0) { return; }
                ctx.beginPath(); switch (style) {
                        default: ctx.arc(x, y, radius, 0, TAU); ctx.closePath(); break; case 'triangle': ctx.moveTo(x + Math.sin(rad) * radius, y - Math.cos(rad) * radius); rad += TWO_THIRDS_PI; ctx.lineTo(x + Math.sin(rad) * radius, y - Math.cos(rad) * radius); rad += TWO_THIRDS_PI; ctx.lineTo(x + Math.sin(rad) * radius, y - Math.cos(rad) * radius); ctx.closePath(); break; case 'rectRounded': cornerRadius = radius * 0.516; size = radius - cornerRadius; xOffset = Math.cos(rad + QUARTER_PI) * size; yOffset = Math.sin(rad + QUARTER_PI) * size; ctx.arc(x - xOffset, y - yOffset, cornerRadius, rad - PI, rad - HALF_PI); ctx.arc(x + yOffset, y - xOffset, cornerRadius, rad - HALF_PI, rad); ctx.arc(x + xOffset, y + yOffset, cornerRadius, rad, rad + HALF_PI); ctx.arc(x - yOffset, y + xOffset, cornerRadius, rad + HALF_PI, rad + PI); ctx.closePath(); break; case 'rect': if (!rotation) { size = Math.SQRT1_2 * radius; ctx.rect(x - size, y - size, 2 * size, 2 * size); break; }
                                rad += QUARTER_PI; case 'rectRot': xOffset = Math.cos(rad) * radius; yOffset = Math.sin(rad) * radius; ctx.moveTo(x - xOffset, y - yOffset); ctx.lineTo(x + yOffset, y - xOffset); ctx.lineTo(x + xOffset, y + yOffset); ctx.lineTo(x - yOffset, y + xOffset); ctx.closePath(); break; case 'crossRot': rad += QUARTER_PI; case 'cross': xOffset = Math.cos(rad) * radius; yOffset = Math.sin(rad) * radius; ctx.moveTo(x - xOffset, y - yOffset); ctx.lineTo(x + xOffset, y + yOffset); ctx.moveTo(x + yOffset, y - xOffset); ctx.lineTo(x - yOffset, y + xOffset); break; case 'star': xOffset = Math.cos(rad) * radius; yOffset = Math.sin(rad) * radius; ctx.moveTo(x - xOffset, y - yOffset); ctx.lineTo(x + xOffset, y + yOffset); ctx.moveTo(x + yOffset, y - xOffset); ctx.lineTo(x - yOffset, y + xOffset); rad += QUARTER_PI; xOffset = Math.cos(rad) * radius; yOffset = Math.sin(rad) * radius; ctx.moveTo(x - xOffset, y - yOffset); ctx.lineTo(x + xOffset, y + yOffset); ctx.moveTo(x + yOffset, y - xOffset); ctx.lineTo(x - yOffset, y + xOffset); break; case 'line': xOffset = Math.cos(rad) * radius; yOffset = Math.sin(rad) * radius; ctx.moveTo(x - xOffset, y - yOffset); ctx.lineTo(x + xOffset, y + yOffset); break; case 'dash': ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(rad) * radius, y + Math.sin(rad) * radius); break;
                }
                ctx.fill(); if (options.borderWidth > 0) { ctx.stroke(); }
        }
        function _isPointInArea(point, area, margin) { margin = margin || 0.5; return !area || (point && point.x > area.left - margin && point.x < area.right + margin && point.y > area.top - margin && point.y < area.bottom + margin); }
        function clipArea(ctx, area) { ctx.save(); ctx.beginPath(); ctx.rect(area.left, area.top, area.right - area.left, area.bottom - area.top); ctx.clip(); }
        function unclipArea(ctx) { ctx.restore(); }
        function _steppedLineTo(ctx, previous, target, flip, mode) {
                if (!previous) { return ctx.lineTo(target.x, target.y); }
                if (mode === 'middle') { const midpoint = (previous.x + target.x) / 2.0; ctx.lineTo(midpoint, previous.y); ctx.lineTo(midpoint, target.y); } else if (mode === 'after' !== !!flip) { ctx.lineTo(previous.x, target.y); } else { ctx.lineTo(target.x, previous.y); }
                ctx.lineTo(target.x, target.y);
        }
        function _bezierCurveTo(ctx, previous, target, flip) {
                if (!previous) { return ctx.lineTo(target.x, target.y); }
                ctx.bezierCurveTo(flip ? previous.cp1x : previous.cp2x, flip ? previous.cp1y : previous.cp2y, flip ? target.cp2x : target.cp1x, flip ? target.cp2y : target.cp1y, target.x, target.y);
        }
        function renderText(ctx, text, x, y, font, opts = {}) {
                const lines = isArray(text) ? text : [text]; const stroke = opts.strokeWidth > 0 && opts.strokeColor !== ''; let i, line; ctx.save(); ctx.font = font.string; setRenderOpts(ctx, opts); for (i = 0; i < lines.length; ++i) {
                        line = lines[i]; if (stroke) {
                                if (opts.strokeColor) { ctx.strokeStyle = opts.strokeColor; }
                                if (!isNullOrUndef(opts.strokeWidth)) { ctx.lineWidth = opts.strokeWidth; }
                                ctx.strokeText(line, x, y, opts.maxWidth);
                        }
                        ctx.fillText(line, x, y, opts.maxWidth); decorateText(ctx, x, y, line, opts); y += font.lineHeight;
                }
                ctx.restore();
        }
        function setRenderOpts(ctx, opts) {
                if (opts.translation) { ctx.translate(opts.translation[0], opts.translation[1]); }
                if (!isNullOrUndef(opts.rotation)) { ctx.rotate(opts.rotation); }
                if (opts.color) { ctx.fillStyle = opts.color; }
                if (opts.textAlign) { ctx.textAlign = opts.textAlign; }
                if (opts.textBaseline) { ctx.textBaseline = opts.textBaseline; }
        }
        function decorateText(ctx, x, y, line, opts) { if (opts.strikethrough || opts.underline) { const metrics = ctx.measureText(line); const left = x - metrics.actualBoundingBoxLeft; const right = x + metrics.actualBoundingBoxRight; const top = y - metrics.actualBoundingBoxAscent; const bottom = y + metrics.actualBoundingBoxDescent; const yDecoration = opts.strikethrough ? (top + bottom) / 2 : bottom; ctx.strokeStyle = ctx.fillStyle; ctx.beginPath(); ctx.lineWidth = opts.decorationWidth || 2; ctx.moveTo(left, yDecoration); ctx.lineTo(right, yDecoration); ctx.stroke(); } }
        function addRoundedRectPath(ctx, rect) { const { x, y, w, h, radius } = rect; ctx.arc(x + radius.topLeft, y + radius.topLeft, radius.topLeft, -HALF_PI, PI, true); ctx.lineTo(x, y + h - radius.bottomLeft); ctx.arc(x + radius.bottomLeft, y + h - radius.bottomLeft, radius.bottomLeft, PI, HALF_PI, true); ctx.lineTo(x + w - radius.bottomRight, y + h); ctx.arc(x + w - radius.bottomRight, y + h - radius.bottomRight, radius.bottomRight, HALF_PI, 0, true); ctx.lineTo(x + w, y + radius.topRight); ctx.arc(x + w - radius.topRight, y + radius.topRight, radius.topRight, 0, -HALF_PI, true); ctx.lineTo(x + radius.topLeft, y); }
        function _createResolver(scopes, prefixes = [''], rootScopes = scopes, fallback, getTarget = () => scopes[0]) {
                if (!defined(fallback)) { fallback = _resolve('_fallback', scopes); }
                const cache = { [Symbol.toStringTag]: 'Object', _cacheable: true, _scopes: scopes, _rootScopes: rootScopes, _fallback: fallback, _getTarget: getTarget, override: (scope) => _createResolver([scope, ...scopes], prefixes, rootScopes, fallback), }; return new Proxy(cache, { deleteProperty(target, prop) { delete target[prop]; delete target._keys; delete scopes[0][prop]; return true; }, get(target, prop) { return _cached(target, prop, () => _resolveWithPrefixes(prop, prefixes, scopes, target)); }, getOwnPropertyDescriptor(target, prop) { return Reflect.getOwnPropertyDescriptor(target._scopes[0], prop); }, getPrototypeOf() { return Reflect.getPrototypeOf(scopes[0]); }, has(target, prop) { return getKeysFromAllScopes(target).includes(prop); }, ownKeys(target) { return getKeysFromAllScopes(target); }, set(target, prop, value) { const storage = target._storage || (target._storage = getTarget()); target[prop] = storage[prop] = value; delete target._keys; return true; } });
        }
        function _attachContext(proxy, context, subProxy, descriptorDefaults) { const cache = { _cacheable: false, _proxy: proxy, _context: context, _subProxy: subProxy, _stack: new Set(), _descriptors: _descriptors(proxy, descriptorDefaults), setContext: (ctx) => _attachContext(proxy, ctx, subProxy, descriptorDefaults), override: (scope) => _attachContext(proxy.override(scope), context, subProxy, descriptorDefaults) }; return new Proxy(cache, { deleteProperty(target, prop) { delete target[prop]; delete proxy[prop]; return true; }, get(target, prop, receiver) { return _cached(target, prop, () => _resolveWithContext(target, prop, receiver)); }, getOwnPropertyDescriptor(target, prop) { return target._descriptors.allKeys ? Reflect.has(proxy, prop) ? { enumerable: true, configurable: true } : undefined : Reflect.getOwnPropertyDescriptor(proxy, prop); }, getPrototypeOf() { return Reflect.getPrototypeOf(proxy); }, has(target, prop) { return Reflect.has(proxy, prop); }, ownKeys() { return Reflect.ownKeys(proxy); }, set(target, prop, value) { proxy[prop] = value; delete target[prop]; return true; } }); }
        function _descriptors(proxy, defaults = { scriptable: true, indexable: true }) { const { _scriptable = defaults.scriptable, _indexable = defaults.indexable, _allKeys = defaults.allKeys } = proxy; return { allKeys: _allKeys, scriptable: _scriptable, indexable: _indexable, isScriptable: isFunction(_scriptable) ? _scriptable : () => _scriptable, isIndexable: isFunction(_indexable) ? _indexable : () => _indexable }; }
        const readKey = (prefix, name) => prefix ? prefix + _capitalize(name) : name; const needsSubResolver = (prop, value) => isObject(value) && prop !== 'adapters' && (Object.getPrototypeOf(value) === null || value.constructor === Object); function _cached(target, prop, resolve) {
                if (Object.prototype.hasOwnProperty.call(target, prop)) { return target[prop]; }
                const value = resolve(); target[prop] = value; return value;
        }
        function _resolveWithContext(target, prop, receiver) {
                const { _proxy, _context, _subProxy, _descriptors: descriptors } = target; let value = _proxy[prop]; if (isFunction(value) && descriptors.isScriptable(prop)) { value = _resolveScriptable(prop, value, target, receiver); }
                if (isArray(value) && value.length) { value = _resolveArray(prop, value, target, descriptors.isIndexable); }
                if (needsSubResolver(prop, value)) { value = _attachContext(value, _context, _subProxy && _subProxy[prop], descriptors); }
                return value;
        }
        function _resolveScriptable(prop, value, target, receiver) {
                const { _proxy, _context, _subProxy, _stack } = target; if (_stack.has(prop)) { throw new Error('Recursion detected: ' + Array.from(_stack).join('->') + '->' + prop); }
                _stack.add(prop); value = value(_context, _subProxy || receiver); _stack.delete(prop); if (needsSubResolver(prop, value)) { value = createSubResolver(_proxy._scopes, _proxy, prop, value); }
                return value;
        }
        function _resolveArray(prop, value, target, isIndexable) {
                const { _proxy, _context, _subProxy, _descriptors: descriptors } = target; if (defined(_context.index) && isIndexable(prop)) { value = value[_context.index % value.length]; } else if (isObject(value[0])) { const arr = value; const scopes = _proxy._scopes.filter(s => s !== arr); value = []; for (const item of arr) { const resolver = createSubResolver(scopes, _proxy, prop, item); value.push(_attachContext(resolver, _context, _subProxy && _subProxy[prop], descriptors)); } }
                return value;
        }
        function resolveFallback(fallback, prop, value) { return isFunction(fallback) ? fallback(prop, value) : fallback; }
        const getScope = (key, parent) => key === true ? parent : typeof key === 'string' ? resolveObjectKey(parent, key) : undefined; function addScopes(set, parentScopes, key, parentFallback, value) {
                for (const parent of parentScopes) { const scope = getScope(key, parent); if (scope) { set.add(scope); const fallback = resolveFallback(scope._fallback, key, value); if (defined(fallback) && fallback !== key && fallback !== parentFallback) { return fallback; } } else if (scope === false && defined(parentFallback) && key !== parentFallback) { return null; } }
                return false;
        }
        function createSubResolver(parentScopes, resolver, prop, value) {
                const rootScopes = resolver._rootScopes; const fallback = resolveFallback(resolver._fallback, prop, value); const allScopes = [...parentScopes, ...rootScopes]; const set = new Set(); set.add(value); let key = addScopesFromKey(set, allScopes, prop, fallback || prop, value); if (key === null) { return false; }
                if (defined(fallback) && fallback !== prop) { key = addScopesFromKey(set, allScopes, fallback, key, value); if (key === null) { return false; } }
                return _createResolver(Array.from(set), [''], rootScopes, fallback, () => subGetTarget(resolver, prop, value));
        }
        function addScopesFromKey(set, allScopes, key, fallback, item) {
                while (key) { key = addScopes(set, allScopes, key, fallback, item); }
                return key;
        }
        function subGetTarget(resolver, prop, value) {
                const parent = resolver._getTarget(); if (!(prop in parent)) { parent[prop] = {}; }
                const target = parent[prop]; if (isArray(target) && isObject(value)) { return value; }
                return target;
        }
        function _resolveWithPrefixes(prop, prefixes, scopes, proxy) { let value; for (const prefix of prefixes) { value = _resolve(readKey(prefix, prop), scopes); if (defined(value)) { return needsSubResolver(prop, value) ? createSubResolver(scopes, proxy, prop, value) : value; } } }
        function _resolve(key, scopes) {
                for (const scope of scopes) {
                        if (!scope) { continue; }
                        const value = scope[key]; if (defined(value)) { return value; }
                }
        }
        function getKeysFromAllScopes(target) {
                let keys = target._keys; if (!keys) { keys = target._keys = resolveKeysFromAllScopes(target._scopes); }
                return keys;
        }
        function resolveKeysFromAllScopes(scopes) {
                const set = new Set(); for (const scope of scopes) { for (const key of Object.keys(scope).filter(k => !k.startsWith('_'))) { set.add(key); } }
                return Array.from(set);
        }
        function _parseObjectDataRadialScale(meta, data, start, count) {
                const { iScale } = meta; const { key = 'r' } = this._parsing; const parsed = new Array(count); let i, ilen, index, item; for (i = 0, ilen = count; i < ilen; ++i) { index = i + start; item = data[index]; parsed[i] = { r: iScale.parse(resolveObjectKey(item, key), index) }; }
                return parsed;
        }
        const EPSILON = Number.EPSILON || 1e-14; const getPoint = (points, i) => i < points.length && !points[i].skip && points[i]; const getValueAxis = (indexAxis) => indexAxis === 'x' ? 'y' : 'x'; function splineCurve(firstPoint, middlePoint, afterPoint, t) { const previous = firstPoint.skip ? middlePoint : firstPoint; const current = middlePoint; const next = afterPoint.skip ? middlePoint : afterPoint; const d01 = distanceBetweenPoints(current, previous); const d12 = distanceBetweenPoints(next, current); let s01 = d01 / (d01 + d12); let s12 = d12 / (d01 + d12); s01 = isNaN(s01) ? 0 : s01; s12 = isNaN(s12) ? 0 : s12; const fa = t * s01; const fb = t * s12; return { previous: { x: current.x - fa * (next.x - previous.x), y: current.y - fa * (next.y - previous.y) }, next: { x: current.x + fb * (next.x - previous.x), y: current.y + fb * (next.y - previous.y) } }; }
        function monotoneAdjust(points, deltaK, mK) {
                const pointsLen = points.length; let alphaK, betaK, tauK, squaredMagnitude, pointCurrent; let pointAfter = getPoint(points, 0); for (let i = 0; i < pointsLen - 1; ++i) {
                        pointCurrent = pointAfter; pointAfter = getPoint(points, i + 1); if (!pointCurrent || !pointAfter) { continue; }
                        if (almostEquals(deltaK[i], 0, EPSILON)) { mK[i] = mK[i + 1] = 0; continue; }
                        alphaK = mK[i] / deltaK[i]; betaK = mK[i + 1] / deltaK[i]; squaredMagnitude = Math.pow(alphaK, 2) + Math.pow(betaK, 2); if (squaredMagnitude <= 9) { continue; }
                        tauK = 3 / Math.sqrt(squaredMagnitude); mK[i] = alphaK * tauK * deltaK[i]; mK[i + 1] = betaK * tauK * deltaK[i];
                }
        }
        function monotoneCompute(points, mK, indexAxis = 'x') {
                const valueAxis = getValueAxis(indexAxis); const pointsLen = points.length; let delta, pointBefore, pointCurrent; let pointAfter = getPoint(points, 0); for (let i = 0; i < pointsLen; ++i) {
                        pointBefore = pointCurrent; pointCurrent = pointAfter; pointAfter = getPoint(points, i + 1); if (!pointCurrent) { continue; }
                        const iPixel = pointCurrent[indexAxis]; const vPixel = pointCurrent[valueAxis]; if (pointBefore) { delta = (iPixel - pointBefore[indexAxis]) / 3; pointCurrent[`cp1${indexAxis}`] = iPixel - delta; pointCurrent[`cp1${valueAxis}`] = vPixel - delta * mK[i]; }
                        if (pointAfter) { delta = (pointAfter[indexAxis] - iPixel) / 3; pointCurrent[`cp2${indexAxis}`] = iPixel + delta; pointCurrent[`cp2${valueAxis}`] = vPixel + delta * mK[i]; }
                }
        }
        function splineCurveMonotone(points, indexAxis = 'x') {
                const valueAxis = getValueAxis(indexAxis); const pointsLen = points.length; const deltaK = Array(pointsLen).fill(0); const mK = Array(pointsLen); let i, pointBefore, pointCurrent; let pointAfter = getPoint(points, 0); for (i = 0; i < pointsLen; ++i) {
                        pointBefore = pointCurrent; pointCurrent = pointAfter; pointAfter = getPoint(points, i + 1); if (!pointCurrent) { continue; }
                        if (pointAfter) { const slopeDelta = pointAfter[indexAxis] - pointCurrent[indexAxis]; deltaK[i] = slopeDelta !== 0 ? (pointAfter[valueAxis] - pointCurrent[valueAxis]) / slopeDelta : 0; }
                        mK[i] = !pointBefore ? deltaK[i] : !pointAfter ? deltaK[i - 1] : (sign(deltaK[i - 1]) !== sign(deltaK[i])) ? 0 : (deltaK[i - 1] + deltaK[i]) / 2;
                }
                monotoneAdjust(points, deltaK, mK); monotoneCompute(points, mK, indexAxis);
        }
        function capControlPoint(pt, min, max) { return Math.max(Math.min(pt, max), min); }
        function capBezierPoints(points, area) {
                let i, ilen, point, inArea, inAreaPrev; let inAreaNext = _isPointInArea(points[0], area); for (i = 0, ilen = points.length; i < ilen; ++i) {
                        inAreaPrev = inArea; inArea = inAreaNext; inAreaNext = i < ilen - 1 && _isPointInArea(points[i + 1], area); if (!inArea) { continue; }
                        point = points[i]; if (inAreaPrev) { point.cp1x = capControlPoint(point.cp1x, area.left, area.right); point.cp1y = capControlPoint(point.cp1y, area.top, area.bottom); }
                        if (inAreaNext) { point.cp2x = capControlPoint(point.cp2x, area.left, area.right); point.cp2y = capControlPoint(point.cp2y, area.top, area.bottom); }
                }
        }
        function _updateBezierControlPoints(points, options, area, loop, indexAxis) {
                let i, ilen, point, controlPoints; if (options.spanGaps) { points = points.filter((pt) => !pt.skip); }
                if (options.cubicInterpolationMode === 'monotone') { splineCurveMonotone(points, indexAxis); } else { let prev = loop ? points[points.length - 1] : points[0]; for (i = 0, ilen = points.length; i < ilen; ++i) { point = points[i]; controlPoints = splineCurve(prev, point, points[Math.min(i + 1, ilen - (loop ? 0 : 1)) % ilen], options.tension); point.cp1x = controlPoints.previous.x; point.cp1y = controlPoints.previous.y; point.cp2x = controlPoints.next.x; point.cp2y = controlPoints.next.y; prev = point; } }
                if (options.capBezierPoints) { capBezierPoints(points, area); }
        }
        const atEdge = (t) => t === 0 || t === 1; const elasticIn = (t, s, p) => -(Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * TAU / p)); const elasticOut = (t, s, p) => Math.pow(2, -10 * t) * Math.sin((t - s) * TAU / p) + 1; const effects = {
                linear: t => t, easeInQuad: t => t * t, easeOutQuad: t => -t * (t - 2), easeInOutQuad: t => ((t /= 0.5) < 1) ? 0.5 * t * t : -0.5 * ((--t) * (t - 2) - 1), easeInCubic: t => t * t * t, easeOutCubic: t => (t -= 1) * t * t + 1, easeInOutCubic: t => ((t /= 0.5) < 1) ? 0.5 * t * t * t : 0.5 * ((t -= 2) * t * t + 2), easeInQuart: t => t * t * t * t, easeOutQuart: t => -((t -= 1) * t * t * t - 1), easeInOutQuart: t => ((t /= 0.5) < 1) ? 0.5 * t * t * t * t : -0.5 * ((t -= 2) * t * t * t - 2), easeInQuint: t => t * t * t * t * t, easeOutQuint: t => (t -= 1) * t * t * t * t + 1, easeInOutQuint: t => ((t /= 0.5) < 1) ? 0.5 * t * t * t * t * t : 0.5 * ((t -= 2) * t * t * t * t + 2), easeInSine: t => -Math.cos(t * HALF_PI) + 1, easeOutSine: t => Math.sin(t * HALF_PI), easeInOutSine: t => -0.5 * (Math.cos(PI * t) - 1), easeInExpo: t => (t === 0) ? 0 : Math.pow(2, 10 * (t - 1)), easeOutExpo: t => (t === 1) ? 1 : -Math.pow(2, -10 * t) + 1, easeInOutExpo: t => atEdge(t) ? t : t < 0.5 ? 0.5 * Math.pow(2, 10 * (t * 2 - 1)) : 0.5 * (-Math.pow(2, -10 * (t * 2 - 1)) + 2), easeInCirc: t => (t >= 1) ? t : -(Math.sqrt(1 - t * t) - 1), easeOutCirc: t => Math.sqrt(1 - (t -= 1) * t), easeInOutCirc: t => ((t /= 0.5) < 1) ? -0.5 * (Math.sqrt(1 - t * t) - 1) : 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1), easeInElastic: t => atEdge(t) ? t : elasticIn(t, 0.075, 0.3), easeOutElastic: t => atEdge(t) ? t : elasticOut(t, 0.075, 0.3), easeInOutElastic(t) { const s = 0.1125; const p = 0.45; return atEdge(t) ? t : t < 0.5 ? 0.5 * elasticIn(t * 2, s, p) : 0.5 + 0.5 * elasticOut(t * 2 - 1, s, p); }, easeInBack(t) { const s = 1.70158; return t * t * ((s + 1) * t - s); }, easeOutBack(t) { const s = 1.70158; return (t -= 1) * t * ((s + 1) * t + s) + 1; }, easeInOutBack(t) {
                        let s = 1.70158; if ((t /= 0.5) < 1) { return 0.5 * (t * t * (((s *= (1.525)) + 1) * t - s)); }
                        return 0.5 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
                }, easeInBounce: t => 1 - effects.easeOutBounce(1 - t), easeOutBounce(t) {
                        const m = 7.5625; const d = 2.75; if (t < (1 / d)) { return m * t * t; }
                        if (t < (2 / d)) { return m * (t -= (1.5 / d)) * t + 0.75; }
                        if (t < (2.5 / d)) { return m * (t -= (2.25 / d)) * t + 0.9375; }
                        return m * (t -= (2.625 / d)) * t + 0.984375;
                }, easeInOutBounce: t => (t < 0.5) ? effects.easeInBounce(t * 2) * 0.5 : effects.easeOutBounce(t * 2 - 1) * 0.5 + 0.5,
        }; function _pointInLine(p1, p2, t, mode) { return { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) }; }
        function _steppedInterpolation(p1, p2, t, mode) { return { x: p1.x + t * (p2.x - p1.x), y: mode === 'middle' ? t < 0.5 ? p1.y : p2.y : mode === 'after' ? t < 1 ? p1.y : p2.y : t > 0 ? p2.y : p1.y }; }
        function _bezierInterpolation(p1, p2, t, mode) { const cp1 = { x: p1.cp2x, y: p1.cp2y }; const cp2 = { x: p2.cp1x, y: p2.cp1y }; const a = _pointInLine(p1, cp1, t); const b = _pointInLine(cp1, cp2, t); const c = _pointInLine(cp2, p2, t); const d = _pointInLine(a, b, t); const e = _pointInLine(b, c, t); return _pointInLine(d, e, t); }
        const intlCache = new Map(); function getNumberFormat(locale, options) {
                options = options || {}; const cacheKey = locale + JSON.stringify(options); let formatter = intlCache.get(cacheKey); if (!formatter) { formatter = new Intl.NumberFormat(locale, options); intlCache.set(cacheKey, formatter); }
                return formatter;
        }
        function formatNumber(num, locale, options) { return getNumberFormat(locale, options).format(num); }
        const LINE_HEIGHT = new RegExp(/^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/); const FONT_STYLE = new RegExp(/^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/); function toLineHeight(value, size) {
                const matches = ('' + value).match(LINE_HEIGHT); if (!matches || matches[1] === 'normal') { return size * 1.2; }
                value = +matches[2]; switch (matches[3]) { case 'px': return value; case '%': value /= 100; break; }
                return size * value;
        }
        const numberOrZero = v => +v || 0; function _readValueToProps(value, props) {
                const ret = {}; const objProps = isObject(props); const keys = objProps ? Object.keys(props) : props; const read = isObject(value) ? objProps ? prop => valueOrDefault(value[prop], value[props[prop]]) : prop => value[prop] : () => value; for (const prop of keys) { ret[prop] = numberOrZero(read(prop)); }
                return ret;
        }
        function toTRBL(value) { return _readValueToProps(value, { top: 'y', right: 'x', bottom: 'y', left: 'x' }); }
        function toTRBLCorners(value) { return _readValueToProps(value, ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']); }
        function toPadding(value) { const obj = toTRBL(value); obj.width = obj.left + obj.right; obj.height = obj.top + obj.bottom; return obj; }
        function toFont(options, fallback) {
                options = options || {}; fallback = fallback || defaults.font; let size = valueOrDefault(options.size, fallback.size); if (typeof size === 'string') { size = parseInt(size, 10); }
                let style = valueOrDefault(options.style, fallback.style); if (style && !('' + style).match(FONT_STYLE)) { console.warn('Invalid font style specified: "' + style + '"'); style = ''; }
                const font = { family: valueOrDefault(options.family, fallback.family), lineHeight: toLineHeight(valueOrDefault(options.lineHeight, fallback.lineHeight), size), size, style, weight: valueOrDefault(options.weight, fallback.weight), string: '' }; font.string = toFontString(font); return font;
        }
        function resolve(inputs, context, index, info) {
                let cacheable = true; let i, ilen, value; for (i = 0, ilen = inputs.length; i < ilen; ++i) {
                        value = inputs[i]; if (value === undefined) { continue; }
                        if (context !== undefined && typeof value === 'function') { value = value(context); cacheable = false; }
                        if (index !== undefined && isArray(value)) { value = value[index % value.length]; cacheable = false; }
                        if (value !== undefined) {
                                if (info && !cacheable) { info.cacheable = false; }
                                return value;
                        }
                }
        }
        function _addGrace(minmax, grace, beginAtZero) { const { min, max } = minmax; const change = toDimension(grace, (max - min) / 2); const keepZero = (value, add) => beginAtZero && value === 0 ? 0 : value + add; return { min: keepZero(min, -Math.abs(change)), max: keepZero(max, change) }; }
        function createContext(parentContext, context) { return Object.assign(Object.create(parentContext), context); }
        const getRightToLeftAdapter = function (rectX, width) {
                return {
                        x(x) { return rectX + rectX + width - x; }, setWidth(w) { width = w; }, textAlign(align) {
                                if (align === 'center') { return align; }
                                return align === 'right' ? 'left' : 'right';
                        }, xPlus(x, value) { return x - value; }, leftForLtr(x, itemWidth) { return x - itemWidth; },
                };
        }; const getLeftToRightAdapter = function () { return { x(x) { return x; }, setWidth(w) { }, textAlign(align) { return align; }, xPlus(x, value) { return x + value; }, leftForLtr(x, _itemWidth) { return x; }, }; }; function getRtlAdapter(rtl, rectX, width) { return rtl ? getRightToLeftAdapter(rectX, width) : getLeftToRightAdapter(); }
        function overrideTextDirection(ctx, direction) { let style, original; if (direction === 'ltr' || direction === 'rtl') { style = ctx.canvas.style; original = [style.getPropertyValue('direction'), style.getPropertyPriority('direction'),]; style.setProperty('direction', direction, 'important'); ctx.prevTextDirection = original; } }
        function restoreTextDirection(ctx, original) { if (original !== undefined) { delete ctx.prevTextDirection; ctx.canvas.style.setProperty('direction', original[0], original[1]); } }
        function propertyFn(property) {
                if (property === 'angle') { return { between: _angleBetween, compare: _angleDiff, normalize: _normalizeAngle, }; }
                return { between: _isBetween, compare: (a, b) => a - b, normalize: x => x };
        }
        function normalizeSegment({ start, end, count, loop, style }) { return { start: start % count, end: end % count, loop: loop && (end - start + 1) % count === 0, style }; }
        function getSegment(segment, points, bounds) {
                const { property, start: startBound, end: endBound } = bounds; const { between, normalize } = propertyFn(property); const count = points.length; let { start, end, loop } = segment; let i, ilen; if (loop) {
                        start += count; end += count; for (i = 0, ilen = count; i < ilen; ++i) {
                                if (!between(normalize(points[start % count][property]), startBound, endBound)) { break; }
                                start--; end--;
                        }
                        start %= count; end %= count;
                }
                if (end < start) { end += count; }
                return { start, end, loop, style: segment.style };
        }
        function _boundSegment(segment, points, bounds) {
                if (!bounds) { return [segment]; }
                const { property, start: startBound, end: endBound } = bounds; const count = points.length; const { compare, between, normalize } = propertyFn(property); const { start, end, loop, style } = getSegment(segment, points, bounds); const result = []; let inside = false; let subStart = null; let value, point, prevValue; const startIsBefore = () => between(startBound, prevValue, value) && compare(startBound, prevValue) !== 0; const endIsBefore = () => compare(endBound, value) === 0 || between(endBound, prevValue, value); const shouldStart = () => inside || startIsBefore(); const shouldStop = () => !inside || endIsBefore(); for (let i = start, prev = start; i <= end; ++i) {
                        point = points[i % count]; if (point.skip) { continue; }
                        value = normalize(point[property]); if (value === prevValue) { continue; }
                        inside = between(value, startBound, endBound); if (subStart === null && shouldStart()) { subStart = compare(value, startBound) === 0 ? i : prev; }
                        if (subStart !== null && shouldStop()) { result.push(normalizeSegment({ start: subStart, end: i, loop, count, style })); subStart = null; }
                        prev = i; prevValue = value;
                }
                if (subStart !== null) { result.push(normalizeSegment({ start: subStart, end, loop, count, style })); }
                return result;
        }
        function _boundSegments(line, bounds) {
                const result = []; const segments = line.segments; for (let i = 0; i < segments.length; i++) { const sub = _boundSegment(segments[i], line.points, bounds); if (sub.length) { result.push(...sub); } }
                return result;
        }
        function findStartAndEnd(points, count, loop, spanGaps) {
                let start = 0; let end = count - 1; if (loop && !spanGaps) { while (start < count && !points[start].skip) { start++; } }
                while (start < count && points[start].skip) { start++; }
                start %= count; if (loop) { end += start; }
                while (end > start && points[end % count].skip) { end--; }
                end %= count; return { start, end };
        }
        function solidSegments(points, start, max, loop) {
                const count = points.length; const result = []; let last = start; let prev = points[start]; let end; for (end = start + 1; end <= max; ++end) {
                        const cur = points[end % count]; if (cur.skip || cur.stop) { if (!prev.skip) { loop = false; result.push({ start: start % count, end: (end - 1) % count, loop }); start = last = cur.stop ? end : null; } } else { last = end; if (prev.skip) { start = end; } }
                        prev = cur;
                }
                if (last !== null) { result.push({ start: start % count, end: last % count, loop }); }
                return result;
        }
        function _computeSegments(line, segmentOptions) {
                const points = line.points; const spanGaps = line.options.spanGaps; const count = points.length; if (!count) { return []; }
                const loop = !!line._loop; const { start, end } = findStartAndEnd(points, count, loop, spanGaps); if (spanGaps === true) { return splitByStyles(line, [{ start, end, loop }], points, segmentOptions); }
                const max = end < start ? end + count : end; const completeLoop = !!line._fullLoop && start === 0 && end === count - 1; return splitByStyles(line, solidSegments(points, start, max, completeLoop), points, segmentOptions);
        }
        function splitByStyles(line, segments, points, segmentOptions) {
                if (!segmentOptions || !segmentOptions.setContext || !points) { return segments; }
                return doSplitByStyles(line, segments, points, segmentOptions);
        }
        function doSplitByStyles(line, segments, points, segmentOptions) {
                const chartContext = line._chart.getContext(); const baseStyle = readStyle(line.options); const { _datasetIndex: datasetIndex, options: { spanGaps } } = line; const count = points.length; const result = []; let prevStyle = baseStyle; let start = segments[0].start; let i = start; function addStyle(s, e, l, st) {
                        const dir = spanGaps ? -1 : 1; if (s === e) { return; }
                        s += count; while (points[s % count].skip) { s -= dir; }
                        while (points[e % count].skip) { e += dir; }
                        if (s % count !== e % count) { result.push({ start: s % count, end: e % count, loop: l, style: st }); prevStyle = st; start = e % count; }
                }
                for (const segment of segments) {
                        start = spanGaps ? start : segment.start; let prev = points[start % count]; let style; for (i = start + 1; i <= segment.end; i++) {
                                const pt = points[i % count]; style = readStyle(segmentOptions.setContext(createContext(chartContext, { type: 'segment', p0: prev, p1: pt, p0DataIndex: (i - 1) % count, p1DataIndex: i % count, datasetIndex }))); if (styleChanged(style, prevStyle)) { addStyle(start, i - 1, segment.loop, prevStyle); }
                                prev = pt; prevStyle = style;
                        }
                        if (start < i - 1) { addStyle(start, i - 1, segment.loop, prevStyle); }
                }
                return result;
        }
        function readStyle(options) { return { backgroundColor: options.backgroundColor, borderCapStyle: options.borderCapStyle, borderDash: options.borderDash, borderDashOffset: options.borderDashOffset, borderJoinStyle: options.borderJoinStyle, borderWidth: options.borderWidth, borderColor: options.borderColor }; }
        function styleChanged(style, prevStyle) { return prevStyle && JSON.stringify(style) !== JSON.stringify(prevStyle); }
        var helpers = Object.freeze({ __proto__: null, easingEffects: effects, isPatternOrGradient: isPatternOrGradient, color: color, getHoverColor: getHoverColor, noop: noop, uid: uid, isNullOrUndef: isNullOrUndef, isArray: isArray, isObject: isObject, isFinite: isNumberFinite, finiteOrDefault: finiteOrDefault, valueOrDefault: valueOrDefault, toPercentage: toPercentage, toDimension: toDimension, callback: callback, each: each, _elementsEqual: _elementsEqual, clone: clone, _merger: _merger, merge: merge, mergeIf: mergeIf, _mergerIf: _mergerIf, _deprecated: _deprecated, resolveObjectKey: resolveObjectKey, _capitalize: _capitalize, defined: defined, isFunction: isFunction, setsEqual: setsEqual, _isClickEvent: _isClickEvent, toFontString: toFontString, _measureText: _measureText, _longestText: _longestText, _alignPixel: _alignPixel, clearCanvas: clearCanvas, drawPoint: drawPoint, _isPointInArea: _isPointInArea, clipArea: clipArea, unclipArea: unclipArea, _steppedLineTo: _steppedLineTo, _bezierCurveTo: _bezierCurveTo, renderText: renderText, addRoundedRectPath: addRoundedRectPath, _lookup: _lookup, _lookupByKey: _lookupByKey, _rlookupByKey: _rlookupByKey, _filterBetween: _filterBetween, listenArrayEvents: listenArrayEvents, unlistenArrayEvents: unlistenArrayEvents, _arrayUnique: _arrayUnique, _createResolver: _createResolver, _attachContext: _attachContext, _descriptors: _descriptors, _parseObjectDataRadialScale: _parseObjectDataRadialScale, splineCurve: splineCurve, splineCurveMonotone: splineCurveMonotone, _updateBezierControlPoints: _updateBezierControlPoints, _isDomSupported: _isDomSupported, _getParentNode: _getParentNode, getStyle: getStyle, getRelativePosition: getRelativePosition, getMaximumSize: getMaximumSize, retinaScale: retinaScale, supportsEventListenerOptions: supportsEventListenerOptions, readUsedSize: readUsedSize, fontString: fontString, requestAnimFrame: requestAnimFrame, throttled: throttled, debounce: debounce, _toLeftRightCenter: _toLeftRightCenter, _alignStartEnd: _alignStartEnd, _textX: _textX, _pointInLine: _pointInLine, _steppedInterpolation: _steppedInterpolation, _bezierInterpolation: _bezierInterpolation, formatNumber: formatNumber, toLineHeight: toLineHeight, _readValueToProps: _readValueToProps, toTRBL: toTRBL, toTRBLCorners: toTRBLCorners, toPadding: toPadding, toFont: toFont, resolve: resolve, _addGrace: _addGrace, createContext: createContext, PI: PI, TAU: TAU, PITAU: PITAU, INFINITY: INFINITY, RAD_PER_DEG: RAD_PER_DEG, HALF_PI: HALF_PI, QUARTER_PI: QUARTER_PI, TWO_THIRDS_PI: TWO_THIRDS_PI, log10: log10, sign: sign, niceNum: niceNum, _factorize: _factorize, isNumber: isNumber, almostEquals: almostEquals, almostWhole: almostWhole, _setMinAndMaxByKey: _setMinAndMaxByKey, toRadians: toRadians, toDegrees: toDegrees, _decimalPlaces: _decimalPlaces, getAngleFromPoint: getAngleFromPoint, distanceBetweenPoints: distanceBetweenPoints, _angleDiff: _angleDiff, _normalizeAngle: _normalizeAngle, _angleBetween: _angleBetween, _limitValue: _limitValue, _int16Range: _int16Range, _isBetween: _isBetween, getRtlAdapter: getRtlAdapter, overrideTextDirection: overrideTextDirection, restoreTextDirection: restoreTextDirection, _boundSegment: _boundSegment, _boundSegments: _boundSegments, _computeSegments: _computeSegments }); function binarySearch(metaset, axis, value, intersect) {
                const { controller, data, _sorted } = metaset; const iScale = controller._cachedMeta.iScale; if (iScale && axis === iScale.axis && axis !== 'r' && _sorted && data.length) { const lookupMethod = iScale._reversePixels ? _rlookupByKey : _lookupByKey; if (!intersect) { return lookupMethod(data, axis, value); } else if (controller._sharedOptions) { const el = data[0]; const range = typeof el.getRange === 'function' && el.getRange(axis); if (range) { const start = lookupMethod(data, axis, value - range); const end = lookupMethod(data, axis, value + range); return { lo: start.lo, hi: end.hi }; } } }
                return { lo: 0, hi: data.length - 1 };
        }
        function evaluateInteractionItems(chart, axis, position, handler, intersect) { const metasets = chart.getSortedVisibleDatasetMetas(); const value = position[axis]; for (let i = 0, ilen = metasets.length; i < ilen; ++i) { const { index, data } = metasets[i]; const { lo, hi } = binarySearch(metasets[i], axis, value, intersect); for (let j = lo; j <= hi; ++j) { const element = data[j]; if (!element.skip) { handler(element, index, j); } } } }
        function getDistanceMetricForAxis(axis) { const useX = axis.indexOf('x') !== -1; const useY = axis.indexOf('y') !== -1; return function (pt1, pt2) { const deltaX = useX ? Math.abs(pt1.x - pt2.x) : 0; const deltaY = useY ? Math.abs(pt1.y - pt2.y) : 0; return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)); }; }
        function getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible) {
                const items = []; if (!includeInvisible && !chart.isPointInArea(position)) { return items; }
                const evaluationFunc = function (element, datasetIndex, index) {
                        if (!includeInvisible && !_isPointInArea(element, chart.chartArea, 0)) { return; }
                        if (element.inRange(position.x, position.y, useFinalPosition)) { items.push({ element, datasetIndex, index }); }
                }; evaluateInteractionItems(chart, axis, position, evaluationFunc, true); return items;
        }
        function getNearestRadialItems(chart, position, axis, useFinalPosition) {
                let items = []; function evaluationFunc(element, datasetIndex, index) { const { startAngle, endAngle } = element.getProps(['startAngle', 'endAngle'], useFinalPosition); const { angle } = getAngleFromPoint(element, { x: position.x, y: position.y }); if (_angleBetween(angle, startAngle, endAngle)) { items.push({ element, datasetIndex, index }); } }
                evaluateInteractionItems(chart, axis, position, evaluationFunc); return items;
        }
        function getNearestCartesianItems(chart, position, axis, intersect, useFinalPosition, includeInvisible) {
                let items = []; const distanceMetric = getDistanceMetricForAxis(axis); let minDistance = Number.POSITIVE_INFINITY; function evaluationFunc(element, datasetIndex, index) {
                        const inRange = element.inRange(position.x, position.y, useFinalPosition); if (intersect && !inRange) { return; }
                        const center = element.getCenterPoint(useFinalPosition); const pointInArea = !!includeInvisible || chart.isPointInArea(center); if (!pointInArea && !inRange) { return; }
                        const distance = distanceMetric(position, center); if (distance < minDistance) { items = [{ element, datasetIndex, index }]; minDistance = distance; } else if (distance === minDistance) { items.push({ element, datasetIndex, index }); }
                }
                evaluateInteractionItems(chart, axis, position, evaluationFunc); return items;
        }
        function getNearestItems(chart, position, axis, intersect, useFinalPosition, includeInvisible) {
                if (!includeInvisible && !chart.isPointInArea(position)) { return []; }
                return axis === 'r' && !intersect ? getNearestRadialItems(chart, position, axis, useFinalPosition) : getNearestCartesianItems(chart, position, axis, intersect, useFinalPosition, includeInvisible);
        }
        function getAxisItems(chart, position, axis, intersect, useFinalPosition) {
                const items = []; const rangeMethod = axis === 'x' ? 'inXRange' : 'inYRange'; let intersectsItem = false; evaluateInteractionItems(chart, axis, position, (element, datasetIndex, index) => { if (element[rangeMethod](position[axis], useFinalPosition)) { items.push({ element, datasetIndex, index }); intersectsItem = intersectsItem || element.inRange(position.x, position.y, useFinalPosition); } }); if (intersect && !intersectsItem) { return []; }
                return items;
        }
        var Interaction = {
                evaluateInteractionItems, modes: {
                        index(chart, e, options, useFinalPosition) {
                                const position = getRelativePosition(e, chart); const axis = options.axis || 'x'; const includeInvisible = options.includeInvisible || false; const items = options.intersect ? getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible) : getNearestItems(chart, position, axis, false, useFinalPosition, includeInvisible); const elements = []; if (!items.length) { return []; }
                                chart.getSortedVisibleDatasetMetas().forEach((meta) => { const index = items[0].index; const element = meta.data[index]; if (element && !element.skip) { elements.push({ element, datasetIndex: meta.index, index }); } }); return elements;
                        }, dataset(chart, e, options, useFinalPosition) {
                                const position = getRelativePosition(e, chart); const axis = options.axis || 'xy'; const includeInvisible = options.includeInvisible || false; let items = options.intersect ? getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible) : getNearestItems(chart, position, axis, false, useFinalPosition, includeInvisible); if (items.length > 0) { const datasetIndex = items[0].datasetIndex; const data = chart.getDatasetMeta(datasetIndex).data; items = []; for (let i = 0; i < data.length; ++i) { items.push({ element: data[i], datasetIndex, index: i }); } }
                                return items;
                        }, point(chart, e, options, useFinalPosition) { const position = getRelativePosition(e, chart); const axis = options.axis || 'xy'; const includeInvisible = options.includeInvisible || false; return getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible); }, nearest(chart, e, options, useFinalPosition) { const position = getRelativePosition(e, chart); const axis = options.axis || 'xy'; const includeInvisible = options.includeInvisible || false; return getNearestItems(chart, position, axis, options.intersect, useFinalPosition, includeInvisible); }, x(chart, e, options, useFinalPosition) { const position = getRelativePosition(e, chart); return getAxisItems(chart, position, 'x', options.intersect, useFinalPosition); }, y(chart, e, options, useFinalPosition) { const position = getRelativePosition(e, chart); return getAxisItems(chart, position, 'y', options.intersect, useFinalPosition); }
                }
        }; const STATIC_POSITIONS = ['left', 'top', 'right', 'bottom']; function filterByPosition(array, position) { return array.filter(v => v.pos === position); }
        function filterDynamicPositionByAxis(array, axis) { return array.filter(v => STATIC_POSITIONS.indexOf(v.pos) === -1 && v.box.axis === axis); }
        function sortByWeight(array, reverse) { return array.sort((a, b) => { const v0 = reverse ? b : a; const v1 = reverse ? a : b; return v0.weight === v1.weight ? v0.index - v1.index : v0.weight - v1.weight; }); }
        function wrapBoxes(boxes) {
                const layoutBoxes = []; let i, ilen, box, pos, stack, stackWeight; for (i = 0, ilen = (boxes || []).length; i < ilen; ++i) { box = boxes[i]; ({ position: pos, options: { stack, stackWeight=1 } } = box); layoutBoxes.push({ index: i, box, pos, horizontal: box.isHorizontal(), weight: box.weight, stack: stack && (pos + stack), stackWeight }); }
                return layoutBoxes;
        }
        function buildStacks(layouts) {
                const stacks = {}; for (const wrap of layouts) {
                        const { stack, pos, stackWeight } = wrap; if (!stack || !STATIC_POSITIONS.includes(pos)) { continue; }
                        const _stack = stacks[stack] || (stacks[stack] = { count: 0, placed: 0, weight: 0, size: 0 }); _stack.count++; _stack.weight += stackWeight;
                }
                return stacks;
        }
        function setLayoutDims(layouts, params) {
                const stacks = buildStacks(layouts); const { vBoxMaxWidth, hBoxMaxHeight } = params; let i, ilen, layout; for (i = 0, ilen = layouts.length; i < ilen; ++i) { layout = layouts[i]; const { fullSize } = layout.box; const stack = stacks[layout.stack]; const factor = stack && layout.stackWeight / stack.weight; if (layout.horizontal) { layout.width = factor ? factor * vBoxMaxWidth : fullSize && params.availableWidth; layout.height = hBoxMaxHeight; } else { layout.width = vBoxMaxWidth; layout.height = factor ? factor * hBoxMaxHeight : fullSize && params.availableHeight; } }
                return stacks;
        }
        function buildLayoutBoxes(boxes) { const layoutBoxes = wrapBoxes(boxes); const fullSize = sortByWeight(layoutBoxes.filter(wrap => wrap.box.fullSize), true); const left = sortByWeight(filterByPosition(layoutBoxes, 'left'), true); const right = sortByWeight(filterByPosition(layoutBoxes, 'right')); const top = sortByWeight(filterByPosition(layoutBoxes, 'top'), true); const bottom = sortByWeight(filterByPosition(layoutBoxes, 'bottom')); const centerHorizontal = filterDynamicPositionByAxis(layoutBoxes, 'x'); const centerVertical = filterDynamicPositionByAxis(layoutBoxes, 'y'); return { fullSize, leftAndTop: left.concat(top), rightAndBottom: right.concat(centerVertical).concat(bottom).concat(centerHorizontal), chartArea: filterByPosition(layoutBoxes, 'chartArea'), vertical: left.concat(right).concat(centerVertical), horizontal: top.concat(bottom).concat(centerHorizontal) }; }
        function getCombinedMax(maxPadding, chartArea, a, b) { return Math.max(maxPadding[a], chartArea[a]) + Math.max(maxPadding[b], chartArea[b]); }
        function updateMaxPadding(maxPadding, boxPadding) { maxPadding.top = Math.max(maxPadding.top, boxPadding.top); maxPadding.left = Math.max(maxPadding.left, boxPadding.left); maxPadding.bottom = Math.max(maxPadding.bottom, boxPadding.bottom); maxPadding.right = Math.max(maxPadding.right, boxPadding.right); }
        function updateDims(chartArea, params, layout, stacks) {
                const { pos, box } = layout; const maxPadding = chartArea.maxPadding; if (!isObject(pos)) {
                        if (layout.size) { chartArea[pos] -= layout.size; }
                        const stack = stacks[layout.stack] || { size: 0, count: 1 }; stack.size = Math.max(stack.size, layout.horizontal ? box.height : box.width); layout.size = stack.size / stack.count; chartArea[pos] += layout.size;
                }
                if (box.getPadding) { updateMaxPadding(maxPadding, box.getPadding()); }
                const newWidth = Math.max(0, params.outerWidth - getCombinedMax(maxPadding, chartArea, 'left', 'right')); const newHeight = Math.max(0, params.outerHeight - getCombinedMax(maxPadding, chartArea, 'top', 'bottom')); const widthChanged = newWidth !== chartArea.w; const heightChanged = newHeight !== chartArea.h; chartArea.w = newWidth; chartArea.h = newHeight; return layout.horizontal ? { same: widthChanged, other: heightChanged } : { same: heightChanged, other: widthChanged };
        }
        function handleMaxPadding(chartArea) {
                const maxPadding = chartArea.maxPadding; function updatePos(pos) { const change = Math.max(maxPadding[pos] - chartArea[pos], 0); chartArea[pos] += change; return change; }
                chartArea.y += updatePos('top'); chartArea.x += updatePos('left'); updatePos('right'); updatePos('bottom');
        }
        function getMargins(horizontal, chartArea) {
                const maxPadding = chartArea.maxPadding; function marginForPositions(positions) { const margin = { left: 0, top: 0, right: 0, bottom: 0 }; positions.forEach((pos) => { margin[pos] = Math.max(chartArea[pos], maxPadding[pos]); }); return margin; }
                return horizontal ? marginForPositions(['left', 'right']) : marginForPositions(['top', 'bottom']);
        }
        function fitBoxes(boxes, chartArea, params, stacks) {
                const refitBoxes = []; let i, ilen, layout, box, refit, changed; for (i = 0, ilen = boxes.length, refit = 0; i < ilen; ++i) { layout = boxes[i]; box = layout.box; box.update(layout.width || chartArea.w, layout.height || chartArea.h, getMargins(layout.horizontal, chartArea)); const { same, other } = updateDims(chartArea, params, layout, stacks); refit |= same && refitBoxes.length; changed = changed || other; if (!box.fullSize) { refitBoxes.push(layout); } }
                return refit && fitBoxes(refitBoxes, chartArea, params, stacks) || changed;
        }
        function setBoxDims(box, left, top, width, height) { box.top = top; box.left = left; box.right = left + width; box.bottom = top + height; box.width = width; box.height = height; }
        function placeBoxes(boxes, chartArea, params, stacks) {
                const userPadding = params.padding; let { x, y } = chartArea; for (const layout of boxes) {
                        const box = layout.box; const stack = stacks[layout.stack] || { count: 1, placed: 0, weight: 1 }; const weight = (layout.stackWeight / stack.weight) || 1; if (layout.horizontal) {
                                const width = chartArea.w * weight; const height = stack.size || box.height; if (defined(stack.start)) { y = stack.start; }
                                if (box.fullSize) { setBoxDims(box, userPadding.left, y, params.outerWidth - userPadding.right - userPadding.left, height); } else { setBoxDims(box, chartArea.left + stack.placed, y, width, height); }
                                stack.start = y; stack.placed += width; y = box.bottom;
                        } else {
                                const height = chartArea.h * weight; const width = stack.size || box.width; if (defined(stack.start)) { x = stack.start; }
                                if (box.fullSize) { setBoxDims(box, x, userPadding.top, width, params.outerHeight - userPadding.bottom - userPadding.top); } else { setBoxDims(box, x, chartArea.top + stack.placed, width, height); }
                                stack.start = x; stack.placed += height; x = box.right;
                        }
                }
                chartArea.x = x; chartArea.y = y;
        }
        defaults.set('layout', { autoPadding: true, padding: { top: 0, right: 0, bottom: 0, left: 0 } }); var layouts = {
                addBox(chart, item) {
                        if (!chart.boxes) { chart.boxes = []; }
                        item.fullSize = item.fullSize || false; item.position = item.position || 'top'; item.weight = item.weight || 0; item._layers = item._layers || function () { return [{ z: 0, draw(chartArea) { item.draw(chartArea); } }]; }; chart.boxes.push(item);
                }, removeBox(chart, layoutItem) { const index = chart.boxes ? chart.boxes.indexOf(layoutItem) : -1; if (index !== -1) { chart.boxes.splice(index, 1); } }, configure(chart, item, options) { item.fullSize = options.fullSize; item.position = options.position; item.weight = options.weight; }, update(chart, width, height, minPadding) {
                        if (!chart) { return; }
                        const padding = toPadding(chart.options.layout.padding); const availableWidth = Math.max(width - padding.width, 0); const availableHeight = Math.max(height - padding.height, 0); const boxes = buildLayoutBoxes(chart.boxes); const verticalBoxes = boxes.vertical; const horizontalBoxes = boxes.horizontal; each(chart.boxes, box => { if (typeof box.beforeLayout === 'function') { box.beforeLayout(); } }); const visibleVerticalBoxCount = verticalBoxes.reduce((total, wrap) => wrap.box.options && wrap.box.options.display === false ? total : total + 1, 0) || 1; const params = Object.freeze({ outerWidth: width, outerHeight: height, padding, availableWidth, availableHeight, vBoxMaxWidth: availableWidth / 2 / visibleVerticalBoxCount, hBoxMaxHeight: availableHeight / 2 }); const maxPadding = Object.assign({}, padding); updateMaxPadding(maxPadding, toPadding(minPadding)); const chartArea = Object.assign({ maxPadding, w: availableWidth, h: availableHeight, x: padding.left, y: padding.top }, padding); const stacks = setLayoutDims(verticalBoxes.concat(horizontalBoxes), params); fitBoxes(boxes.fullSize, chartArea, params, stacks); fitBoxes(verticalBoxes, chartArea, params, stacks); if (fitBoxes(horizontalBoxes, chartArea, params, stacks)) { fitBoxes(verticalBoxes, chartArea, params, stacks); }
                        handleMaxPadding(chartArea); placeBoxes(boxes.leftAndTop, chartArea, params, stacks); chartArea.x += chartArea.w; chartArea.y += chartArea.h; placeBoxes(boxes.rightAndBottom, chartArea, params, stacks); chart.chartArea = { left: chartArea.left, top: chartArea.top, right: chartArea.left + chartArea.w, bottom: chartArea.top + chartArea.h, height: chartArea.h, width: chartArea.w, }; each(boxes.chartArea, (layout) => { const box = layout.box; Object.assign(box, chart.chartArea); box.update(chartArea.w, chartArea.h, { left: 0, top: 0, right: 0, bottom: 0 }); });
                }
        }; class BasePlatform {
                acquireContext(canvas, aspectRatio) { }
                releaseContext(context) { return false; }
                addEventListener(chart, type, listener) { }
                removeEventListener(chart, type, listener) { }
                getDevicePixelRatio() { return 1; }
                getMaximumSize(element, width, height, aspectRatio) { width = Math.max(0, width || element.width); height = height || element.height; return { width, height: Math.max(0, aspectRatio ? Math.floor(width / aspectRatio) : height) }; }
                isAttached(canvas) { return true; }
                updateConfig(config) { }
        }
        class BasicPlatform extends BasePlatform {
                acquireContext(item) { return item && item.getContext && item.getContext('2d') || null; }
                updateConfig(config) { config.options.animation = false; }
        }
        const EXPANDO_KEY = '$chartjs'; const EVENT_TYPES = { touchstart: 'mousedown', touchmove: 'mousemove', touchend: 'mouseup', pointerenter: 'mouseenter', pointerdown: 'mousedown', pointermove: 'mousemove', pointerup: 'mouseup', pointerleave: 'mouseout', pointerout: 'mouseout' }; const isNullOrEmpty = value => value === null || value === ''; function initCanvas(canvas, aspectRatio) {
                const style = canvas.style; const renderHeight = canvas.getAttribute('height'); const renderWidth = canvas.getAttribute('width'); canvas[EXPANDO_KEY] = { initial: { height: renderHeight, width: renderWidth, style: { display: style.display, height: style.height, width: style.width } } }; style.display = style.display || 'block'; style.boxSizing = style.boxSizing || 'border-box'; if (isNullOrEmpty(renderWidth)) { const displayWidth = readUsedSize(canvas, 'width'); if (displayWidth !== undefined) { canvas.width = displayWidth; } }
                if (isNullOrEmpty(renderHeight)) { if (canvas.style.height === '') { canvas.height = canvas.width / (aspectRatio || 2); } else { const displayHeight = readUsedSize(canvas, 'height'); if (displayHeight !== undefined) { canvas.height = displayHeight; } } }
                return canvas;
        }
        const eventListenerOptions = supportsEventListenerOptions ? { passive: true } : false; function addListener(node, type, listener) { node.addEventListener(type, listener, eventListenerOptions); }
        function removeListener(chart, type, listener) { chart.canvas.removeEventListener(type, listener, eventListenerOptions); }
        function fromNativeEvent(event, chart) { const type = EVENT_TYPES[event.type] || event.type; const { x, y } = getRelativePosition(event, chart); return { type, chart, native: event, x: x !== undefined ? x : null, y: y !== undefined ? y : null, }; }
        function nodeListContains(nodeList, canvas) { for (const node of nodeList) { if (node === canvas || node.contains(canvas)) { return true; } } }
        function createAttachObserver(chart, type, listener) {
                const canvas = chart.canvas; const observer = new MutationObserver(entries => {
                        let trigger = false; for (const entry of entries) { trigger = trigger || nodeListContains(entry.addedNodes, canvas); trigger = trigger && !nodeListContains(entry.removedNodes, canvas); }
                        if (trigger) { listener(); }
                }); observer.observe(document, { childList: true, subtree: true }); return observer;
        }
        function createDetachObserver(chart, type, listener) {
                const canvas = chart.canvas; const observer = new MutationObserver(entries => {
                        let trigger = false; for (const entry of entries) { trigger = trigger || nodeListContains(entry.removedNodes, canvas); trigger = trigger && !nodeListContains(entry.addedNodes, canvas); }
                        if (trigger) { listener(); }
                }); observer.observe(document, { childList: true, subtree: true }); return observer;
        }
        const drpListeningCharts = new Map(); let oldDevicePixelRatio = 0; function onWindowResize() {
                const dpr = window.devicePixelRatio; if (dpr === oldDevicePixelRatio) { return; }
                oldDevicePixelRatio = dpr; drpListeningCharts.forEach((resize, chart) => { if (chart.currentDevicePixelRatio !== dpr) { resize(); } });
        }
        function listenDevicePixelRatioChanges(chart, resize) {
                if (!drpListeningCharts.size) { window.addEventListener('resize', onWindowResize); }
                drpListeningCharts.set(chart, resize);
        }
        function unlistenDevicePixelRatioChanges(chart) { drpListeningCharts.delete(chart); if (!drpListeningCharts.size) { window.removeEventListener('resize', onWindowResize); } }
        function createResizeObserver(chart, type, listener) {
                const canvas = chart.canvas; const container = canvas && _getParentNode(canvas); if (!container) { return; }
                const resize = throttled((width, height) => { const w = container.clientWidth; listener(width, height); if (w < container.clientWidth) { listener(); } }, window); const observer = new ResizeObserver(entries => {
                        const entry = entries[0]; const width = entry.contentRect.width; const height = entry.contentRect.height; if (width === 0 && height === 0) { return; }
                        resize(width, height);
                }); observer.observe(container); listenDevicePixelRatioChanges(chart, resize); return observer;
        }
        function releaseObserver(chart, type, observer) {
                if (observer) { observer.disconnect(); }
                if (type === 'resize') { unlistenDevicePixelRatioChanges(chart); }
        }
        function createProxyAndListen(chart, type, listener) { const canvas = chart.canvas; const proxy = throttled((event) => { if (chart.ctx !== null) { listener(fromNativeEvent(event, chart)); } }, chart, (args) => { const event = args[0]; return [event, event.offsetX, event.offsetY]; }); addListener(canvas, type, proxy); return proxy; }
        class DomPlatform extends BasePlatform {
                acquireContext(canvas, aspectRatio) {
                        const context = canvas && canvas.getContext && canvas.getContext('2d'); if (context && context.canvas === canvas) { initCanvas(canvas, aspectRatio); return context; }
                        return null;
                }
                releaseContext(context) {
                        const canvas = context.canvas; if (!canvas[EXPANDO_KEY]) { return false; }
                        const initial = canvas[EXPANDO_KEY].initial;['height', 'width'].forEach((prop) => { const value = initial[prop]; if (isNullOrUndef(value)) { canvas.removeAttribute(prop); } else { canvas.setAttribute(prop, value); } }); const style = initial.style || {}; Object.keys(style).forEach((key) => { canvas.style[key] = style[key]; }); canvas.width = canvas.width; delete canvas[EXPANDO_KEY]; return true;
                }
                addEventListener(chart, type, listener) { this.removeEventListener(chart, type); const proxies = chart.$proxies || (chart.$proxies = {}); const handlers = { attach: createAttachObserver, detach: createDetachObserver, resize: createResizeObserver }; const handler = handlers[type] || createProxyAndListen; proxies[type] = handler(chart, type, listener); }
                removeEventListener(chart, type) {
                        const proxies = chart.$proxies || (chart.$proxies = {}); const proxy = proxies[type]; if (!proxy) { return; }
                        const handlers = { attach: releaseObserver, detach: releaseObserver, resize: releaseObserver }; const handler = handlers[type] || removeListener; handler(chart, type, proxy); proxies[type] = undefined;
                }
                getDevicePixelRatio() { return window.devicePixelRatio; }
                getMaximumSize(canvas, width, height, aspectRatio) { return getMaximumSize(canvas, width, height, aspectRatio); }
                isAttached(canvas) { const container = _getParentNode(canvas); return !!(container && container.isConnected); }
        }
        function _detectPlatform(canvas) {
                if (!_isDomSupported() || (typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas)) { return BasicPlatform; }
                return DomPlatform;
        }
        var platforms = Object.freeze({ __proto__: null, _detectPlatform: _detectPlatform, BasePlatform: BasePlatform, BasicPlatform: BasicPlatform, DomPlatform: DomPlatform }); const transparent = 'transparent'; const interpolators = { boolean(from, to, factor) { return factor > 0.5 ? to : from; }, color(from, to, factor) { const c0 = color(from || transparent); const c1 = c0.valid && color(to || transparent); return c1 && c1.valid ? c1.mix(c0, factor).hexString() : to; }, number(from, to, factor) { return from + (to - from) * factor; } }; class Animation {
                constructor(cfg, target, prop, to) { const currentValue = target[prop]; to = resolve([cfg.to, to, currentValue, cfg.from]); const from = resolve([cfg.from, currentValue, to]); this._active = true; this._fn = cfg.fn || interpolators[cfg.type || typeof from]; this._easing = effects[cfg.easing] || effects.linear; this._start = Math.floor(Date.now() + (cfg.delay || 0)); this._duration = this._total = Math.floor(cfg.duration); this._loop = !!cfg.loop; this._target = target; this._prop = prop; this._from = from; this._to = to; this._promises = undefined; }
                active() { return this._active; }
                update(cfg, to, date) { if (this._active) { this._notify(false); const currentValue = this._target[this._prop]; const elapsed = date - this._start; const remain = this._duration - elapsed; this._start = date; this._duration = Math.floor(Math.max(remain, cfg.duration)); this._total += elapsed; this._loop = !!cfg.loop; this._to = resolve([cfg.to, to, currentValue, cfg.from]); this._from = resolve([cfg.from, currentValue, to]); } }
                cancel() { if (this._active) { this.tick(Date.now()); this._active = false; this._notify(false); } }
                tick(date) {
                        const elapsed = date - this._start; const duration = this._duration; const prop = this._prop; const from = this._from; const loop = this._loop; const to = this._to; let factor; this._active = from !== to && (loop || (elapsed < duration)); if (!this._active) { this._target[prop] = to; this._notify(true); return; }
                        if (elapsed < 0) { this._target[prop] = from; return; }
                        factor = (elapsed / duration) % 2; factor = loop && factor > 1 ? 2 - factor : factor; factor = this._easing(Math.min(1, Math.max(0, factor))); this._target[prop] = this._fn(from, to, factor);
                }
                wait() { const promises = this._promises || (this._promises = []); return new Promise((res, rej) => { promises.push({ res, rej }); }); }
                _notify(resolved) { const method = resolved ? 'res' : 'rej'; const promises = this._promises || []; for (let i = 0; i < promises.length; i++) { promises[i][method](); } }
        }
        const numbers = ['x', 'y', 'borderWidth', 'radius', 'tension']; const colors = ['color', 'borderColor', 'backgroundColor']; defaults.set('animation', { delay: undefined, duration: 1000, easing: 'easeOutQuart', fn: undefined, from: undefined, loop: undefined, to: undefined, type: undefined, }); const animationOptions = Object.keys(defaults.animation); defaults.describe('animation', { _fallback: false, _indexable: false, _scriptable: (name) => name !== 'onProgress' && name !== 'onComplete' && name !== 'fn', }); defaults.set('animations', { colors: { type: 'color', properties: colors }, numbers: { type: 'number', properties: numbers }, }); defaults.describe('animations', { _fallback: 'animation', }); defaults.set('transitions', { active: { animation: { duration: 400 } }, resize: { animation: { duration: 0 } }, show: { animations: { colors: { from: 'transparent' }, visible: { type: 'boolean', duration: 0 }, } }, hide: { animations: { colors: { to: 'transparent' }, visible: { type: 'boolean', easing: 'linear', fn: v => v | 0 }, } } }); class Animations {
                constructor(chart, config) { this._chart = chart; this._properties = new Map(); this.configure(config); }
                configure(config) {
                        if (!isObject(config)) { return; }
                        const animatedProps = this._properties; Object.getOwnPropertyNames(config).forEach(key => {
                                const cfg = config[key]; if (!isObject(cfg)) { return; }
                                const resolved = {}; for (const option of animationOptions) { resolved[option] = cfg[option]; }
                                (isArray(cfg.properties) && cfg.properties || [key]).forEach((prop) => { if (prop === key || !animatedProps.has(prop)) { animatedProps.set(prop, resolved); } });
                        });
                }
                _animateOptions(target, values) {
                        const newOptions = values.options; const options = resolveTargetOptions(target, newOptions); if (!options) { return []; }
                        const animations = this._createAnimations(options, newOptions); if (newOptions.$shared) { awaitAll(target.options.$animations, newOptions).then(() => { target.options = newOptions; }, () => { }); }
                        return animations;
                }
                _createAnimations(target, values) {
                        const animatedProps = this._properties; const animations = []; const running = target.$animations || (target.$animations = {}); const props = Object.keys(values); const date = Date.now(); let i; for (i = props.length - 1; i >= 0; --i) {
                                const prop = props[i]; if (prop.charAt(0) === '$') { continue; }
                                if (prop === 'options') { animations.push(...this._animateOptions(target, values)); continue; }
                                const value = values[prop]; let animation = running[prop]; const cfg = animatedProps.get(prop); if (animation) { if (cfg && animation.active()) { animation.update(cfg, value, date); continue; } else { animation.cancel(); } }
                                if (!cfg || !cfg.duration) { target[prop] = value; continue; }
                                running[prop] = animation = new Animation(cfg, target, prop, value); animations.push(animation);
                        }
                        return animations;
                }
                update(target, values) {
                        if (this._properties.size === 0) { Object.assign(target, values); return; }
                        const animations = this._createAnimations(target, values); if (animations.length) { animator.add(this._chart, animations); return true; }
                }
        }
        function awaitAll(animations, properties) {
                const running = []; const keys = Object.keys(properties); for (let i = 0; i < keys.length; i++) { const anim = animations[keys[i]]; if (anim && anim.active()) { running.push(anim.wait()); } }
                return Promise.all(running);
        }
        function resolveTargetOptions(target, newOptions) {
                if (!newOptions) { return; }
                let options = target.options; if (!options) { target.options = newOptions; return; }
                if (options.$shared) { target.options = options = Object.assign({}, options, { $shared: false, $animations: {} }); }
                return options;
        }
        function scaleClip(scale, allowedOverflow) { const opts = scale && scale.options || {}; const reverse = opts.reverse; const min = opts.min === undefined ? allowedOverflow : 0; const max = opts.max === undefined ? allowedOverflow : 0; return { start: reverse ? max : min, end: reverse ? min : max }; }
        function defaultClip(xScale, yScale, allowedOverflow) {
                if (allowedOverflow === false) { return false; }
                const x = scaleClip(xScale, allowedOverflow); const y = scaleClip(yScale, allowedOverflow); return { top: y.end, right: x.end, bottom: y.start, left: x.start };
        }
        function toClip(value) {
                let t, r, b, l; if (isObject(value)) { t = value.top; r = value.right; b = value.bottom; l = value.left; } else { t = r = b = l = value; }
                return { top: t, right: r, bottom: b, left: l, disabled: value === false };
        }
        function getSortedDatasetIndices(chart, filterVisible) {
                const keys = []; const metasets = chart._getSortedDatasetMetas(filterVisible); let i, ilen; for (i = 0, ilen = metasets.length; i < ilen; ++i) { keys.push(metasets[i].index); }
                return keys;
        }
        function applyStack(stack, value, dsIndex, options = {}) {
                const keys = stack.keys; const singleMode = options.mode === 'single'; let i, ilen, datasetIndex, otherValue; if (value === null) { return; }
                for (i = 0, ilen = keys.length; i < ilen; ++i) {
                        datasetIndex = +keys[i]; if (datasetIndex === dsIndex) {
                                if (options.all) { continue; }
                                break;
                        }
                        otherValue = stack.values[datasetIndex]; if (isNumberFinite(otherValue) && (singleMode || (value === 0 || sign(value) === sign(otherValue)))) { value += otherValue; }
                }
                return value;
        }
        function convertObjectDataToArray(data) {
                const keys = Object.keys(data); const adata = new Array(keys.length); let i, ilen, key; for (i = 0, ilen = keys.length; i < ilen; ++i) { key = keys[i]; adata[i] = { x: key, y: data[key] }; }
                return adata;
        }
        function isStacked(scale, meta) { const stacked = scale && scale.options.stacked; return stacked || (stacked === undefined && meta.stack !== undefined); }
        function getStackKey(indexScale, valueScale, meta) { return `${indexScale.id}.${valueScale.id}.${meta.stack || meta.type}`; }
        function getUserBounds(scale) { const { min, max, minDefined, maxDefined } = scale.getUserBounds(); return { min: minDefined ? min : Number.NEGATIVE_INFINITY, max: maxDefined ? max : Number.POSITIVE_INFINITY }; }
        function getOrCreateStack(stacks, stackKey, indexValue) { const subStack = stacks[stackKey] || (stacks[stackKey] = {}); return subStack[indexValue] || (subStack[indexValue] = {}); }
        function getLastIndexInStack(stack, vScale, positive, type) {
                for (const meta of vScale.getMatchingVisibleMetas(type).reverse()) { const value = stack[meta.index]; if ((positive && value > 0) || (!positive && value < 0)) { return meta.index; } }
                return null;
        }
        function updateStacks(controller, parsed) { const { chart, _cachedMeta: meta } = controller; const stacks = chart._stacks || (chart._stacks = {}); const { iScale, vScale, index: datasetIndex } = meta; const iAxis = iScale.axis; const vAxis = vScale.axis; const key = getStackKey(iScale, vScale, meta); const ilen = parsed.length; let stack; for (let i = 0; i < ilen; ++i) { const item = parsed[i]; const { [iAxis]: index, [vAxis]: value } = item; const itemStacks = item._stacks || (item._stacks = {}); stack = itemStacks[vAxis] = getOrCreateStack(stacks, key, index); stack[datasetIndex] = value; stack._top = getLastIndexInStack(stack, vScale, true, meta.type); stack._bottom = getLastIndexInStack(stack, vScale, false, meta.type); } }
        function getFirstScaleId(chart, axis) { const scales = chart.scales; return Object.keys(scales).filter(key => scales[key].axis === axis).shift(); }
        function createDatasetContext(parent, index) { return createContext(parent, { active: false, dataset: undefined, datasetIndex: index, index, mode: 'default', type: 'dataset' }); }
        function createDataContext(parent, index, element) { return createContext(parent, { active: false, dataIndex: index, parsed: undefined, raw: undefined, element, index, mode: 'default', type: 'data' }); }
        function clearStacks(meta, items) {
                const datasetIndex = meta.controller.index; const axis = meta.vScale && meta.vScale.axis; if (!axis) { return; }
                items = items || meta._parsed; for (const parsed of items) {
                        const stacks = parsed._stacks; if (!stacks || stacks[axis] === undefined || stacks[axis][datasetIndex] === undefined) { return; }
                        delete stacks[axis][datasetIndex];
                }
        }
        const isDirectUpdateMode = (mode) => mode === 'reset' || mode === 'none'; const cloneIfNotShared = (cached, shared) => shared ? cached : Object.assign({}, cached); const createStack = (canStack, meta, chart) => canStack && !meta.hidden && meta._stacked && { keys: getSortedDatasetIndices(chart, true), values: null }; class DatasetController {
                constructor(chart, datasetIndex) { this.chart = chart; this._ctx = chart.ctx; this.index = datasetIndex; this._cachedDataOpts = {}; this._cachedMeta = this.getMeta(); this._type = this._cachedMeta.type; this.options = undefined; this._parsing = false; this._data = undefined; this._objectData = undefined; this._sharedOptions = undefined; this._drawStart = undefined; this._drawCount = undefined; this.enableOptionSharing = false; this.supportsDecimation = false; this.$context = undefined; this._syncList = []; this.initialize(); }
                initialize() { const meta = this._cachedMeta; this.configure(); this.linkScales(); meta._stacked = isStacked(meta.vScale, meta); this.addElements(); }
                updateIndex(datasetIndex) {
                        if (this.index !== datasetIndex) { clearStacks(this._cachedMeta); }
                        this.index = datasetIndex;
                }
                linkScales() { const chart = this.chart; const meta = this._cachedMeta; const dataset = this.getDataset(); const chooseId = (axis, x, y, r) => axis === 'x' ? x : axis === 'r' ? r : y; const xid = meta.xAxisID = valueOrDefault(dataset.xAxisID, getFirstScaleId(chart, 'x')); const yid = meta.yAxisID = valueOrDefault(dataset.yAxisID, getFirstScaleId(chart, 'y')); const rid = meta.rAxisID = valueOrDefault(dataset.rAxisID, getFirstScaleId(chart, 'r')); const indexAxis = meta.indexAxis; const iid = meta.iAxisID = chooseId(indexAxis, xid, yid, rid); const vid = meta.vAxisID = chooseId(indexAxis, yid, xid, rid); meta.xScale = this.getScaleForId(xid); meta.yScale = this.getScaleForId(yid); meta.rScale = this.getScaleForId(rid); meta.iScale = this.getScaleForId(iid); meta.vScale = this.getScaleForId(vid); }
                getDataset() { return this.chart.data.datasets[this.index]; }
                getMeta() { return this.chart.getDatasetMeta(this.index); }
                getScaleForId(scaleID) { return this.chart.scales[scaleID]; }
                _getOtherScale(scale) { const meta = this._cachedMeta; return scale === meta.iScale ? meta.vScale : meta.iScale; }
                reset() { this._update('reset'); }
                _destroy() {
                        const meta = this._cachedMeta; if (this._data) { unlistenArrayEvents(this._data, this); }
                        if (meta._stacked) { clearStacks(meta); }
                }
                _dataCheck() {
                        const dataset = this.getDataset(); const data = dataset.data || (dataset.data = []); const _data = this._data; if (isObject(data)) { this._data = convertObjectDataToArray(data); } else if (_data !== data) {
                                if (_data) { unlistenArrayEvents(_data, this); const meta = this._cachedMeta; clearStacks(meta); meta._parsed = []; }
                                if (data && Object.isExtensible(data)) { listenArrayEvents(data, this); }
                                this._syncList = []; this._data = data;
                        }
                }
                addElements() { const meta = this._cachedMeta; this._dataCheck(); if (this.datasetElementType) { meta.dataset = new this.datasetElementType(); } }
                buildOrUpdateElements(resetNewElements) {
                        const meta = this._cachedMeta; const dataset = this.getDataset(); let stackChanged = false; this._dataCheck(); const oldStacked = meta._stacked; meta._stacked = isStacked(meta.vScale, meta); if (meta.stack !== dataset.stack) { stackChanged = true; clearStacks(meta); meta.stack = dataset.stack; }
                        this._resyncElements(resetNewElements); if (stackChanged || oldStacked !== meta._stacked) { updateStacks(this, meta._parsed); }
                }
                configure() { const config = this.chart.config; const scopeKeys = config.datasetScopeKeys(this._type); const scopes = config.getOptionScopes(this.getDataset(), scopeKeys, true); this.options = config.createResolver(scopes, this.getContext()); this._parsing = this.options.parsing; this._cachedDataOpts = {}; }
                parse(start, count) {
                        const { _cachedMeta: meta, _data: data } = this; const { iScale, _stacked } = meta; const iAxis = iScale.axis; let sorted = start === 0 && count === data.length ? true : meta._sorted; let prev = start > 0 && meta._parsed[start - 1]; let i, cur, parsed; if (this._parsing === false) { meta._parsed = data; meta._sorted = true; parsed = data; } else {
                                if (isArray(data[start])) { parsed = this.parseArrayData(meta, data, start, count); } else if (isObject(data[start])) { parsed = this.parseObjectData(meta, data, start, count); } else { parsed = this.parsePrimitiveData(meta, data, start, count); }
                                const isNotInOrderComparedToPrev = () => cur[iAxis] === null || (prev && cur[iAxis] < prev[iAxis]); for (i = 0; i < count; ++i) {
                                        meta._parsed[i + start] = cur = parsed[i]; if (sorted) {
                                                if (isNotInOrderComparedToPrev()) { sorted = false; }
                                                prev = cur;
                                        }
                                }
                                meta._sorted = sorted;
                        }
                        if (_stacked) { updateStacks(this, parsed); }
                }
                parsePrimitiveData(meta, data, start, count) {
                        const { iScale, vScale } = meta; const iAxis = iScale.axis; const vAxis = vScale.axis; const labels = iScale.getLabels(); const singleScale = iScale === vScale; const parsed = new Array(count); let i, ilen, index; for (i = 0, ilen = count; i < ilen; ++i) { index = i + start; parsed[i] = { [iAxis]: singleScale || iScale.parse(labels[index], index), [vAxis]: vScale.parse(data[index], index) }; }
                        return parsed;
                }
                parseArrayData(meta, data, start, count) {
                        const { xScale, yScale } = meta; const parsed = new Array(count); let i, ilen, index, item; for (i = 0, ilen = count; i < ilen; ++i) { index = i + start; item = data[index]; parsed[i] = { x: xScale.parse(item[0], index), y: yScale.parse(item[1], index) }; }
                        return parsed;
                }
                parseObjectData(meta, data, start, count) {
                        const { xScale, yScale } = meta; const { xAxisKey = 'x', yAxisKey = 'y' } = this._parsing; const parsed = new Array(count); let i, ilen, index, item; for (i = 0, ilen = count; i < ilen; ++i) { index = i + start; item = data[index]; parsed[i] = { x: xScale.parse(resolveObjectKey(item, xAxisKey), index), y: yScale.parse(resolveObjectKey(item, yAxisKey), index) }; }
                        return parsed;
                }
                getParsed(index) { return this._cachedMeta._parsed[index]; }
                getDataElement(index) { return this._cachedMeta.data[index]; }
                applyStack(scale, parsed, mode) { const chart = this.chart; const meta = this._cachedMeta; const value = parsed[scale.axis]; const stack = { keys: getSortedDatasetIndices(chart, true), values: parsed._stacks[scale.axis] }; return applyStack(stack, value, meta.index, { mode }); }
                updateRangeFromParsed(range, scale, parsed, stack) {
                        const parsedValue = parsed[scale.axis]; let value = parsedValue === null ? NaN : parsedValue; const values = stack && parsed._stacks[scale.axis]; if (stack && values) { stack.values = values; value = applyStack(stack, parsedValue, this._cachedMeta.index); }
                        range.min = Math.min(range.min, value); range.max = Math.max(range.max, value);
                }
                getMinMax(scale, canStack) {
                        const meta = this._cachedMeta; const _parsed = meta._parsed; const sorted = meta._sorted && scale === meta.iScale; const ilen = _parsed.length; const otherScale = this._getOtherScale(scale); const stack = createStack(canStack, meta, this.chart); const range = { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY }; const { min: otherMin, max: otherMax } = getUserBounds(otherScale); let i, parsed; function _skip() { parsed = _parsed[i]; const otherValue = parsed[otherScale.axis]; return !isNumberFinite(parsed[scale.axis]) || otherMin > otherValue || otherMax < otherValue; }
                        for (i = 0; i < ilen; ++i) {
                                if (_skip()) { continue; }
                                this.updateRangeFromParsed(range, scale, parsed, stack); if (sorted) { break; }
                        }
                        if (sorted) {
                                for (i = ilen - 1; i >= 0; --i) {
                                        if (_skip()) { continue; }
                                        this.updateRangeFromParsed(range, scale, parsed, stack); break;
                                }
                        }
                        return range;
                }
                getAllParsedValues(scale) {
                        const parsed = this._cachedMeta._parsed; const values = []; let i, ilen, value; for (i = 0, ilen = parsed.length; i < ilen; ++i) { value = parsed[i][scale.axis]; if (isNumberFinite(value)) { values.push(value); } }
                        return values;
                }
                getMaxOverflow() { return false; }
                getLabelAndValue(index) { const meta = this._cachedMeta; const iScale = meta.iScale; const vScale = meta.vScale; const parsed = this.getParsed(index); return { label: iScale ? '' + iScale.getLabelForValue(parsed[iScale.axis]) : '', value: vScale ? '' + vScale.getLabelForValue(parsed[vScale.axis]) : '' }; }
                _update(mode) { const meta = this._cachedMeta; this.update(mode || 'default'); meta._clip = toClip(valueOrDefault(this.options.clip, defaultClip(meta.xScale, meta.yScale, this.getMaxOverflow()))); }
                update(mode) { }
                draw() {
                        const ctx = this._ctx; const chart = this.chart; const meta = this._cachedMeta; const elements = meta.data || []; const area = chart.chartArea; const active = []; const start = this._drawStart || 0; const count = this._drawCount || (elements.length - start); const drawActiveElementsOnTop = this.options.drawActiveElementsOnTop; let i; if (meta.dataset) { meta.dataset.draw(ctx, area, start, count); }
                        for (i = start; i < start + count; ++i) {
                                const element = elements[i]; if (element.hidden) { continue; }
                                if (element.active && drawActiveElementsOnTop) { active.push(element); } else { element.draw(ctx, area); }
                        }
                        for (i = 0; i < active.length; ++i) { active[i].draw(ctx, area); }
                }
                getStyle(index, active) { const mode = active ? 'active' : 'default'; return index === undefined && this._cachedMeta.dataset ? this.resolveDatasetElementOptions(mode) : this.resolveDataElementOptions(index || 0, mode); }
                getContext(index, active, mode) {
                        const dataset = this.getDataset(); let context; if (index >= 0 && index < this._cachedMeta.data.length) { const element = this._cachedMeta.data[index]; context = element.$context || (element.$context = createDataContext(this.getContext(), index, element)); context.parsed = this.getParsed(index); context.raw = dataset.data[index]; context.index = context.dataIndex = index; } else { context = this.$context || (this.$context = createDatasetContext(this.chart.getContext(), this.index)); context.dataset = dataset; context.index = context.datasetIndex = this.index; }
                        context.active = !!active; context.mode = mode; return context;
                }
                resolveDatasetElementOptions(mode) { return this._resolveElementOptions(this.datasetElementType.id, mode); }
                resolveDataElementOptions(index, mode) { return this._resolveElementOptions(this.dataElementType.id, mode, index); }
                _resolveElementOptions(elementType, mode = 'default', index) {
                        const active = mode === 'active'; const cache = this._cachedDataOpts; const cacheKey = elementType + '-' + mode; const cached = cache[cacheKey]; const sharing = this.enableOptionSharing && defined(index); if (cached) { return cloneIfNotShared(cached, sharing); }
                        const config = this.chart.config; const scopeKeys = config.datasetElementScopeKeys(this._type, elementType); const prefixes = active ? [`${elementType}Hover`, 'hover', elementType, ''] : [elementType, '']; const scopes = config.getOptionScopes(this.getDataset(), scopeKeys); const names = Object.keys(defaults.elements[elementType]); const context = () => this.getContext(index, active); const values = config.resolveNamedOptions(scopes, names, context, prefixes); if (values.$shared) { values.$shared = sharing; cache[cacheKey] = Object.freeze(cloneIfNotShared(values, sharing)); }
                        return values;
                }
                _resolveAnimations(index, transition, active) {
                        const chart = this.chart; const cache = this._cachedDataOpts; const cacheKey = `animation-${transition}`; const cached = cache[cacheKey]; if (cached) { return cached; }
                        let options; if (chart.options.animation !== false) { const config = this.chart.config; const scopeKeys = config.datasetAnimationScopeKeys(this._type, transition); const scopes = config.getOptionScopes(this.getDataset(), scopeKeys); options = config.createResolver(scopes, this.getContext(index, active, transition)); }
                        const animations = new Animations(chart, options && options.animations); if (options && options._cacheable) { cache[cacheKey] = Object.freeze(animations); }
                        return animations;
                }
                getSharedOptions(options) {
                        if (!options.$shared) { return; }
                        return this._sharedOptions || (this._sharedOptions = Object.assign({}, options));
                }
                includeOptions(mode, sharedOptions) { return !sharedOptions || isDirectUpdateMode(mode) || this.chart._animationsDisabled; }
                updateElement(element, index, properties, mode) { if (isDirectUpdateMode(mode)) { Object.assign(element, properties); } else { this._resolveAnimations(index, mode).update(element, properties); } }
                updateSharedOptions(sharedOptions, mode, newOptions) { if (sharedOptions && !isDirectUpdateMode(mode)) { this._resolveAnimations(undefined, mode).update(sharedOptions, newOptions); } }
                _setStyle(element, index, mode, active) { element.active = active; const options = this.getStyle(index, active); this._resolveAnimations(index, mode, active).update(element, { options: (!active && this.getSharedOptions(options)) || options }); }
                removeHoverStyle(element, datasetIndex, index) { this._setStyle(element, index, 'active', false); }
                setHoverStyle(element, datasetIndex, index) { this._setStyle(element, index, 'active', true); }
                _removeDatasetHoverStyle() { const element = this._cachedMeta.dataset; if (element) { this._setStyle(element, undefined, 'active', false); } }
                _setDatasetHoverStyle() { const element = this._cachedMeta.dataset; if (element) { this._setStyle(element, undefined, 'active', true); } }
                _resyncElements(resetNewElements) {
                        const data = this._data; const elements = this._cachedMeta.data; for (const [method, arg1, arg2] of this._syncList) { this[method](arg1, arg2); }
                        this._syncList = []; const numMeta = elements.length; const numData = data.length; const count = Math.min(numData, numMeta); if (count) { this.parse(0, count); }
                        if (numData > numMeta) { this._insertElements(numMeta, numData - numMeta, resetNewElements); } else if (numData < numMeta) { this._removeElements(numData, numMeta - numData); }
                }
                _insertElements(start, count, resetNewElements = true) {
                        const meta = this._cachedMeta; const data = meta.data; const end = start + count; let i; const move = (arr) => { arr.length += count; for (i = arr.length - 1; i >= end; i--) { arr[i] = arr[i - count]; } }; move(data); for (i = start; i < end; ++i) { data[i] = new this.dataElementType(); }
                        if (this._parsing) { move(meta._parsed); }
                        this.parse(start, count); if (resetNewElements) { this.updateElements(data, start, count, 'reset'); }
                }
                updateElements(element, start, count, mode) { }
                _removeElements(start, count) {
                        const meta = this._cachedMeta; if (this._parsing) { const removed = meta._parsed.splice(start, count); if (meta._stacked) { clearStacks(meta, removed); } }
                        meta.data.splice(start, count);
                }
                _sync(args) {
                        if (this._parsing) { this._syncList.push(args); } else { const [method, arg1, arg2] = args; this[method](arg1, arg2); }
                        this.chart._dataChanges.push([this.index, ...args]);
                }
                _onDataPush() { const count = arguments.length; this._sync(['_insertElements', this.getDataset().data.length - count, count]); }
                _onDataPop() { this._sync(['_removeElements', this._cachedMeta.data.length - 1, 1]); }
                _onDataShift() { this._sync(['_removeElements', 0, 1]); }
                _onDataSplice(start, count) {
                        if (count) { this._sync(['_removeElements', start, count]); }
                        const newCount = arguments.length - 2; if (newCount) { this._sync(['_insertElements', start, newCount]); }
                }
                _onDataUnshift() { this._sync(['_insertElements', 0, arguments.length]); }
        }
        DatasetController.defaults = {}; DatasetController.prototype.datasetElementType = null; DatasetController.prototype.dataElementType = null; class Element {
                constructor() { this.x = undefined; this.y = undefined; this.active = false; this.options = undefined; this.$animations = undefined; }
                tooltipPosition(useFinalPosition) { const { x, y } = this.getProps(['x', 'y'], useFinalPosition); return { x, y }; }
                hasValue() { return isNumber(this.x) && isNumber(this.y); }
                getProps(props, final) {
                        const anims = this.$animations; if (!final || !anims) { return this; }
                        const ret = {}; props.forEach(prop => { ret[prop] = anims[prop] && anims[prop].active() ? anims[prop]._to : this[prop]; }); return ret;
                }
        }
        Element.defaults = {}; Element.defaultRoutes = undefined; const formatters = {
                values(value) { return isArray(value) ? value : '' + value; }, numeric(tickValue, index, ticks) {
                        if (tickValue === 0) { return '0'; }
                        const locale = this.chart.options.locale; let notation; let delta = tickValue; if (ticks.length > 1) {
                                const maxTick = Math.max(Math.abs(ticks[0].value), Math.abs(ticks[ticks.length - 1].value)); if (maxTick < 1e-4 || maxTick > 1e+15) { notation = 'scientific'; }
                                delta = calculateDelta(tickValue, ticks);
                        }
                        const logDelta = log10(Math.abs(delta)); const numDecimal = Math.max(Math.min(-1 * Math.floor(logDelta), 20), 0); const options = { notation, minimumFractionDigits: numDecimal, maximumFractionDigits: numDecimal }; Object.assign(options, this.options.ticks.format); return formatNumber(tickValue, locale, options);
                }, logarithmic(tickValue, index, ticks) {
                        if (tickValue === 0) { return '0'; }
                        const remain = tickValue / (Math.pow(10, Math.floor(log10(tickValue)))); if (remain === 1 || remain === 2 || remain === 5) { return formatters.numeric.call(this, tickValue, index, ticks); }
                        return '';
                }
        }; function calculateDelta(tickValue, ticks) {
                let delta = ticks.length > 3 ? ticks[2].value - ticks[1].value : ticks[1].value - ticks[0].value; if (Math.abs(delta) >= 1 && tickValue !== Math.floor(tickValue)) { delta = tickValue - Math.floor(tickValue); }
                return delta;
        }
        var Ticks = { formatters }; defaults.set('scale', { display: true, offset: false, reverse: false, beginAtZero: false, bounds: 'ticks', grace: 0, grid: { display: true, lineWidth: 1, drawBorder: true, drawOnChartArea: true, drawTicks: true, tickLength: 8, tickWidth: (_ctx, options) => options.lineWidth, tickColor: (_ctx, options) => options.color, offset: false, borderDash: [], borderDashOffset: 0.0, borderWidth: 1 }, title: { display: false, text: '', padding: { top: 4, bottom: 4 } }, ticks: { minRotation: 0, maxRotation: 50, mirror: false, textStrokeWidth: 0, textStrokeColor: '', padding: 3, display: true, autoSkip: true, autoSkipPadding: 3, labelOffset: 0, callback: Ticks.formatters.values, minor: {}, major: {}, align: 'center', crossAlign: 'near', showLabelBackdrop: false, backdropColor: 'rgba(255, 255, 255, 0.75)', backdropPadding: 2, } }); defaults.route('scale.ticks', 'color', '', 'color'); defaults.route('scale.grid', 'color', '', 'borderColor'); defaults.route('scale.grid', 'borderColor', '', 'borderColor'); defaults.route('scale.title', 'color', '', 'color'); defaults.describe('scale', { _fallback: false, _scriptable: (name) => !name.startsWith('before') && !name.startsWith('after') && name !== 'callback' && name !== 'parser', _indexable: (name) => name !== 'borderDash' && name !== 'tickBorderDash', }); defaults.describe('scales', { _fallback: 'scale', }); defaults.describe('scale.ticks', { _scriptable: (name) => name !== 'backdropPadding' && name !== 'callback', _indexable: (name) => name !== 'backdropPadding', }); function autoSkip(scale, ticks) {
                const tickOpts = scale.options.ticks; const ticksLimit = tickOpts.maxTicksLimit || determineMaxTicks(scale); const majorIndices = tickOpts.major.enabled ? getMajorIndices(ticks) : []; const numMajorIndices = majorIndices.length; const first = majorIndices[0]; const last = majorIndices[numMajorIndices - 1]; const newTicks = []; if (numMajorIndices > ticksLimit) { skipMajors(ticks, newTicks, majorIndices, numMajorIndices / ticksLimit); return newTicks; }
                const spacing = calculateSpacing(majorIndices, ticks, ticksLimit); if (numMajorIndices > 0) {
                        let i, ilen; const avgMajorSpacing = numMajorIndices > 1 ? Math.round((last - first) / (numMajorIndices - 1)) : null; skip(ticks, newTicks, spacing, isNullOrUndef(avgMajorSpacing) ? 0 : first - avgMajorSpacing, first); for (i = 0, ilen = numMajorIndices - 1; i < ilen; i++) { skip(ticks, newTicks, spacing, majorIndices[i], majorIndices[i + 1]); }
                        skip(ticks, newTicks, spacing, last, isNullOrUndef(avgMajorSpacing) ? ticks.length : last + avgMajorSpacing); return newTicks;
                }
                skip(ticks, newTicks, spacing); return newTicks;
        }
        function determineMaxTicks(scale) { const offset = scale.options.offset; const tickLength = scale._tickSize(); const maxScale = scale._length / tickLength + (offset ? 0 : 1); const maxChart = scale._maxLength / tickLength; return Math.floor(Math.min(maxScale, maxChart)); }
        function calculateSpacing(majorIndices, ticks, ticksLimit) {
                const evenMajorSpacing = getEvenSpacing(majorIndices); const spacing = ticks.length / ticksLimit; if (!evenMajorSpacing) { return Math.max(spacing, 1); }
                const factors = _factorize(evenMajorSpacing); for (let i = 0, ilen = factors.length - 1; i < ilen; i++) { const factor = factors[i]; if (factor > spacing) { return factor; } }
                return Math.max(spacing, 1);
        }
        function getMajorIndices(ticks) {
                const result = []; let i, ilen; for (i = 0, ilen = ticks.length; i < ilen; i++) { if (ticks[i].major) { result.push(i); } }
                return result;
        }
        function skipMajors(ticks, newTicks, majorIndices, spacing) { let count = 0; let next = majorIndices[0]; let i; spacing = Math.ceil(spacing); for (i = 0; i < ticks.length; i++) { if (i === next) { newTicks.push(ticks[i]); count++; next = majorIndices[count * spacing]; } } }
        function skip(ticks, newTicks, spacing, majorStart, majorEnd) {
                const start = valueOrDefault(majorStart, 0); const end = Math.min(valueOrDefault(majorEnd, ticks.length), ticks.length); let count = 0; let length, i, next; spacing = Math.ceil(spacing); if (majorEnd) { length = majorEnd - majorStart; spacing = length / Math.floor(length / spacing); }
                next = start; while (next < 0) { count++; next = Math.round(start + count * spacing); }
                for (i = Math.max(start, 0); i < end; i++) { if (i === next) { newTicks.push(ticks[i]); count++; next = Math.round(start + count * spacing); } }
        }
        function getEvenSpacing(arr) {
                const len = arr.length; let i, diff; if (len < 2) { return false; }
                for (diff = arr[0], i = 1; i < len; ++i) { if (arr[i] - arr[i - 1] !== diff) { return false; } }
                return diff;
        }
        const reverseAlign = (align) => align === 'left' ? 'right' : align === 'right' ? 'left' : align; const offsetFromEdge = (scale, edge, offset) => edge === 'top' || edge === 'left' ? scale[edge] + offset : scale[edge] - offset; function sample(arr, numItems) {
                const result = []; const increment = arr.length / numItems; const len = arr.length; let i = 0; for (; i < len; i += increment) { result.push(arr[Math.floor(i)]); }
                return result;
        }
        function getPixelForGridLine(scale, index, offsetGridLines) {
                const length = scale.ticks.length; const validIndex = Math.min(index, length - 1); const start = scale._startPixel; const end = scale._endPixel; const epsilon = 1e-6; let lineValue = scale.getPixelForTick(validIndex); let offset; if (offsetGridLines) {
                        if (length === 1) { offset = Math.max(lineValue - start, end - lineValue); } else if (index === 0) { offset = (scale.getPixelForTick(1) - lineValue) / 2; } else { offset = (lineValue - scale.getPixelForTick(validIndex - 1)) / 2; }
                        lineValue += validIndex < index ? offset : -offset; if (lineValue < start - epsilon || lineValue > end + epsilon) { return; }
                }
                return lineValue;
        }
        function garbageCollect(caches, length) {
                each(caches, (cache) => {
                        const gc = cache.gc; const gcLen = gc.length / 2; let i; if (gcLen > length) {
                                for (i = 0; i < gcLen; ++i) { delete cache.data[gc[i]]; }
                                gc.splice(0, gcLen);
                        }
                });
        }
        function getTickMarkLength(options) { return options.drawTicks ? options.tickLength : 0; }
        function getTitleHeight(options, fallback) {
                if (!options.display) { return 0; }
                const font = toFont(options.font, fallback); const padding = toPadding(options.padding); const lines = isArray(options.text) ? options.text.length : 1; return (lines * font.lineHeight) + padding.height;
        }
        function createScaleContext(parent, scale) { return createContext(parent, { scale, type: 'scale' }); }
        function createTickContext(parent, index, tick) { return createContext(parent, { tick, index, type: 'tick' }); }
        function titleAlign(align, position, reverse) {
                let ret = _toLeftRightCenter(align); if ((reverse && position !== 'right') || (!reverse && position === 'right')) { ret = reverseAlign(ret); }
                return ret;
        }
        function titleArgs(scale, offset, position, align) {
                const { top, left, bottom, right, chart } = scale; const { chartArea, scales } = chart; let rotation = 0; let maxWidth, titleX, titleY; const height = bottom - top; const width = right - left; if (scale.isHorizontal()) {
                        titleX = _alignStartEnd(align, left, right); if (isObject(position)) { const positionAxisID = Object.keys(position)[0]; const value = position[positionAxisID]; titleY = scales[positionAxisID].getPixelForValue(value) + height - offset; } else if (position === 'center') { titleY = (chartArea.bottom + chartArea.top) / 2 + height - offset; } else { titleY = offsetFromEdge(scale, position, offset); }
                        maxWidth = right - left;
                } else {
                        if (isObject(position)) { const positionAxisID = Object.keys(position)[0]; const value = position[positionAxisID]; titleX = scales[positionAxisID].getPixelForValue(value) - width + offset; } else if (position === 'center') { titleX = (chartArea.left + chartArea.right) / 2 - width + offset; } else { titleX = offsetFromEdge(scale, position, offset); }
                        titleY = _alignStartEnd(align, bottom, top); rotation = position === 'left' ? -HALF_PI : HALF_PI;
                }
                return { titleX, titleY, maxWidth, rotation };
        }
        class Scale extends Element {
                constructor(cfg) { super(); this.id = cfg.id; this.type = cfg.type; this.options = undefined; this.ctx = cfg.ctx; this.chart = cfg.chart; this.top = undefined; this.bottom = undefined; this.left = undefined; this.right = undefined; this.width = undefined; this.height = undefined; this._margins = { left: 0, right: 0, top: 0, bottom: 0 }; this.maxWidth = undefined; this.maxHeight = undefined; this.paddingTop = undefined; this.paddingBottom = undefined; this.paddingLeft = undefined; this.paddingRight = undefined; this.axis = undefined; this.labelRotation = undefined; this.min = undefined; this.max = undefined; this._range = undefined; this.ticks = []; this._gridLineItems = null; this._labelItems = null; this._labelSizes = null; this._length = 0; this._maxLength = 0; this._longestTextCache = {}; this._startPixel = undefined; this._endPixel = undefined; this._reversePixels = false; this._userMax = undefined; this._userMin = undefined; this._suggestedMax = undefined; this._suggestedMin = undefined; this._ticksLength = 0; this._borderValue = 0; this._cache = {}; this._dataLimitsCached = false; this.$context = undefined; }
                init(options) { this.options = options.setContext(this.getContext()); this.axis = options.axis; this._userMin = this.parse(options.min); this._userMax = this.parse(options.max); this._suggestedMin = this.parse(options.suggestedMin); this._suggestedMax = this.parse(options.suggestedMax); }
                parse(raw, index) { return raw; }
                getUserBounds() { let { _userMin, _userMax, _suggestedMin, _suggestedMax } = this; _userMin = finiteOrDefault(_userMin, Number.POSITIVE_INFINITY); _userMax = finiteOrDefault(_userMax, Number.NEGATIVE_INFINITY); _suggestedMin = finiteOrDefault(_suggestedMin, Number.POSITIVE_INFINITY); _suggestedMax = finiteOrDefault(_suggestedMax, Number.NEGATIVE_INFINITY); return { min: finiteOrDefault(_userMin, _suggestedMin), max: finiteOrDefault(_userMax, _suggestedMax), minDefined: isNumberFinite(_userMin), maxDefined: isNumberFinite(_userMax) }; }
                getMinMax(canStack) {
                        let { min, max, minDefined, maxDefined } = this.getUserBounds(); let range; if (minDefined && maxDefined) { return { min, max }; }
                        const metas = this.getMatchingVisibleMetas(); for (let i = 0, ilen = metas.length; i < ilen; ++i) {
                                range = metas[i].controller.getMinMax(this, canStack); if (!minDefined) { min = Math.min(min, range.min); }
                                if (!maxDefined) { max = Math.max(max, range.max); }
                        }
                        min = maxDefined && min > max ? max : min; max = minDefined && min > max ? min : max; return { min: finiteOrDefault(min, finiteOrDefault(max, min)), max: finiteOrDefault(max, finiteOrDefault(min, max)) };
                }
                getPadding() { return { left: this.paddingLeft || 0, top: this.paddingTop || 0, right: this.paddingRight || 0, bottom: this.paddingBottom || 0 }; }
                getTicks() { return this.ticks; }
                getLabels() { const data = this.chart.data; return this.options.labels || (this.isHorizontal() ? data.xLabels : data.yLabels) || data.labels || []; }
                beforeLayout() { this._cache = {}; this._dataLimitsCached = false; }
                beforeUpdate() { callback(this.options.beforeUpdate, [this]); }
                update(maxWidth, maxHeight, margins) {
                        const { beginAtZero, grace, ticks: tickOpts } = this.options; const sampleSize = tickOpts.sampleSize; this.beforeUpdate(); this.maxWidth = maxWidth; this.maxHeight = maxHeight; this._margins = margins = Object.assign({ left: 0, right: 0, top: 0, bottom: 0 }, margins); this.ticks = null; this._labelSizes = null; this._gridLineItems = null; this._labelItems = null; this.beforeSetDimensions(); this.setDimensions(); this.afterSetDimensions(); this._maxLength = this.isHorizontal() ? this.width + margins.left + margins.right : this.height + margins.top + margins.bottom; if (!this._dataLimitsCached) { this.beforeDataLimits(); this.determineDataLimits(); this.afterDataLimits(); this._range = _addGrace(this, grace, beginAtZero); this._dataLimitsCached = true; }
                        this.beforeBuildTicks(); this.ticks = this.buildTicks() || []; this.afterBuildTicks(); const samplingEnabled = sampleSize < this.ticks.length; this._convertTicksToLabels(samplingEnabled ? sample(this.ticks, sampleSize) : this.ticks); this.configure(); this.beforeCalculateLabelRotation(); this.calculateLabelRotation(); this.afterCalculateLabelRotation(); if (tickOpts.display && (tickOpts.autoSkip || tickOpts.source === 'auto')) { this.ticks = autoSkip(this, this.ticks); this._labelSizes = null; this.afterAutoSkip(); }
                        if (samplingEnabled) { this._convertTicksToLabels(this.ticks); }
                        this.beforeFit(); this.fit(); this.afterFit(); this.afterUpdate();
                }
                configure() {
                        let reversePixels = this.options.reverse; let startPixel, endPixel; if (this.isHorizontal()) { startPixel = this.left; endPixel = this.right; } else { startPixel = this.top; endPixel = this.bottom; reversePixels = !reversePixels; }
                        this._startPixel = startPixel; this._endPixel = endPixel; this._reversePixels = reversePixels; this._length = endPixel - startPixel; this._alignToPixels = this.options.alignToPixels;
                }
                afterUpdate() { callback(this.options.afterUpdate, [this]); }
                beforeSetDimensions() { callback(this.options.beforeSetDimensions, [this]); }
                setDimensions() {
                        if (this.isHorizontal()) { this.width = this.maxWidth; this.left = 0; this.right = this.width; } else { this.height = this.maxHeight; this.top = 0; this.bottom = this.height; }
                        this.paddingLeft = 0; this.paddingTop = 0; this.paddingRight = 0; this.paddingBottom = 0;
                }
                afterSetDimensions() { callback(this.options.afterSetDimensions, [this]); }
                _callHooks(name) { this.chart.notifyPlugins(name, this.getContext()); callback(this.options[name], [this]); }
                beforeDataLimits() { this._callHooks('beforeDataLimits'); }
                determineDataLimits() { }
                afterDataLimits() { this._callHooks('afterDataLimits'); }
                beforeBuildTicks() { this._callHooks('beforeBuildTicks'); }
                buildTicks() { return []; }
                afterBuildTicks() { this._callHooks('afterBuildTicks'); }
                beforeTickToLabelConversion() { callback(this.options.beforeTickToLabelConversion, [this]); }
                generateTickLabels(ticks) { const tickOpts = this.options.ticks; let i, ilen, tick; for (i = 0, ilen = ticks.length; i < ilen; i++) { tick = ticks[i]; tick.label = callback(tickOpts.callback, [tick.value, i, ticks], this); } }
                afterTickToLabelConversion() { callback(this.options.afterTickToLabelConversion, [this]); }
                beforeCalculateLabelRotation() { callback(this.options.beforeCalculateLabelRotation, [this]); }
                calculateLabelRotation() {
                        const options = this.options; const tickOpts = options.ticks; const numTicks = this.ticks.length; const minRotation = tickOpts.minRotation || 0; const maxRotation = tickOpts.maxRotation; let labelRotation = minRotation; let tickWidth, maxHeight, maxLabelDiagonal; if (!this._isVisible() || !tickOpts.display || minRotation >= maxRotation || numTicks <= 1 || !this.isHorizontal()) { this.labelRotation = minRotation; return; }
                        const labelSizes = this._getLabelSizes(); const maxLabelWidth = labelSizes.widest.width; const maxLabelHeight = labelSizes.highest.height; const maxWidth = _limitValue(this.chart.width - maxLabelWidth, 0, this.maxWidth); tickWidth = options.offset ? this.maxWidth / numTicks : maxWidth / (numTicks - 1); if (maxLabelWidth + 6 > tickWidth) {
                                tickWidth = maxWidth / (numTicks - (options.offset ? 0.5 : 1)); maxHeight = this.maxHeight - getTickMarkLength(options.grid)
                                        - tickOpts.padding - getTitleHeight(options.title, this.chart.options.font); maxLabelDiagonal = Math.sqrt(maxLabelWidth * maxLabelWidth + maxLabelHeight * maxLabelHeight); labelRotation = toDegrees(Math.min(Math.asin(_limitValue((labelSizes.highest.height + 6) / tickWidth, -1, 1)), Math.asin(_limitValue(maxHeight / maxLabelDiagonal, -1, 1)) - Math.asin(_limitValue(maxLabelHeight / maxLabelDiagonal, -1, 1)))); labelRotation = Math.max(minRotation, Math.min(maxRotation, labelRotation));
                        }
                        this.labelRotation = labelRotation;
                }
                afterCalculateLabelRotation() { callback(this.options.afterCalculateLabelRotation, [this]); }
                afterAutoSkip() { }
                beforeFit() { callback(this.options.beforeFit, [this]); }
                fit() {
                        const minSize = { width: 0, height: 0 }; const { chart, options: { ticks: tickOpts, title: titleOpts, grid: gridOpts } } = this; const display = this._isVisible(); const isHorizontal = this.isHorizontal(); if (display) {
                                const titleHeight = getTitleHeight(titleOpts, chart.options.font); if (isHorizontal) { minSize.width = this.maxWidth; minSize.height = getTickMarkLength(gridOpts) + titleHeight; } else { minSize.height = this.maxHeight; minSize.width = getTickMarkLength(gridOpts) + titleHeight; }
                                if (tickOpts.display && this.ticks.length) {
                                        const { first, last, widest, highest } = this._getLabelSizes(); const tickPadding = tickOpts.padding * 2; const angleRadians = toRadians(this.labelRotation); const cos = Math.cos(angleRadians); const sin = Math.sin(angleRadians); if (isHorizontal) { const labelHeight = tickOpts.mirror ? 0 : sin * widest.width + cos * highest.height; minSize.height = Math.min(this.maxHeight, minSize.height + labelHeight + tickPadding); } else { const labelWidth = tickOpts.mirror ? 0 : cos * widest.width + sin * highest.height; minSize.width = Math.min(this.maxWidth, minSize.width + labelWidth + tickPadding); }
                                        this._calculatePadding(first, last, sin, cos);
                                }
                        }
                        this._handleMargins(); if (isHorizontal) { this.width = this._length = chart.width - this._margins.left - this._margins.right; this.height = minSize.height; } else { this.width = minSize.width; this.height = this._length = chart.height - this._margins.top - this._margins.bottom; }
                }
                _calculatePadding(first, last, sin, cos) {
                        const { ticks: { align, padding }, position } = this.options; const isRotated = this.labelRotation !== 0; const labelsBelowTicks = position !== 'top' && this.axis === 'x'; if (this.isHorizontal()) {
                                const offsetLeft = this.getPixelForTick(0) - this.left; const offsetRight = this.right - this.getPixelForTick(this.ticks.length - 1); let paddingLeft = 0; let paddingRight = 0; if (isRotated) { if (labelsBelowTicks) { paddingLeft = cos * first.width; paddingRight = sin * last.height; } else { paddingLeft = sin * first.height; paddingRight = cos * last.width; } } else if (align === 'start') { paddingRight = last.width; } else if (align === 'end') { paddingLeft = first.width; } else if (align !== 'inner') { paddingLeft = first.width / 2; paddingRight = last.width / 2; }
                                this.paddingLeft = Math.max((paddingLeft - offsetLeft + padding) * this.width / (this.width - offsetLeft), 0); this.paddingRight = Math.max((paddingRight - offsetRight + padding) * this.width / (this.width - offsetRight), 0);
                        } else {
                                let paddingTop = last.height / 2; let paddingBottom = first.height / 2; if (align === 'start') { paddingTop = 0; paddingBottom = first.height; } else if (align === 'end') { paddingTop = last.height; paddingBottom = 0; }
                                this.paddingTop = paddingTop + padding; this.paddingBottom = paddingBottom + padding;
                        }
                }
                _handleMargins() { if (this._margins) { this._margins.left = Math.max(this.paddingLeft, this._margins.left); this._margins.top = Math.max(this.paddingTop, this._margins.top); this._margins.right = Math.max(this.paddingRight, this._margins.right); this._margins.bottom = Math.max(this.paddingBottom, this._margins.bottom); } }
                afterFit() { callback(this.options.afterFit, [this]); }
                isHorizontal() { const { axis, position } = this.options; return position === 'top' || position === 'bottom' || axis === 'x'; }
                isFullSize() { return this.options.fullSize; }
                _convertTicksToLabels(ticks) {
                        this.beforeTickToLabelConversion(); this.generateTickLabels(ticks); let i, ilen; for (i = 0, ilen = ticks.length; i < ilen; i++) { if (isNullOrUndef(ticks[i].label)) { ticks.splice(i, 1); ilen--; i--; } }
                        this.afterTickToLabelConversion();
                }
                _getLabelSizes() {
                        let labelSizes = this._labelSizes; if (!labelSizes) {
                                const sampleSize = this.options.ticks.sampleSize; let ticks = this.ticks; if (sampleSize < ticks.length) { ticks = sample(ticks, sampleSize); }
                                this._labelSizes = labelSizes = this._computeLabelSizes(ticks, ticks.length);
                        }
                        return labelSizes;
                }
                _computeLabelSizes(ticks, length) {
                        const { ctx, _longestTextCache: caches } = this; const widths = []; const heights = []; let widestLabelSize = 0; let highestLabelSize = 0; let i, j, jlen, label, tickFont, fontString, cache, lineHeight, width, height, nestedLabel; for (i = 0; i < length; ++i) {
                                label = ticks[i].label; tickFont = this._resolveTickFontOptions(i); ctx.font = fontString = tickFont.string; cache = caches[fontString] = caches[fontString] || { data: {}, gc: [] }; lineHeight = tickFont.lineHeight; width = height = 0; if (!isNullOrUndef(label) && !isArray(label)) { width = _measureText(ctx, cache.data, cache.gc, width, label); height = lineHeight; } else if (isArray(label)) { for (j = 0, jlen = label.length; j < jlen; ++j) { nestedLabel = label[j]; if (!isNullOrUndef(nestedLabel) && !isArray(nestedLabel)) { width = _measureText(ctx, cache.data, cache.gc, width, nestedLabel); height += lineHeight; } } }
                                widths.push(width); heights.push(height); widestLabelSize = Math.max(width, widestLabelSize); highestLabelSize = Math.max(height, highestLabelSize);
                        }
                        garbageCollect(caches, length); const widest = widths.indexOf(widestLabelSize); const highest = heights.indexOf(highestLabelSize); const valueAt = (idx) => ({ width: widths[idx] || 0, height: heights[idx] || 0 }); return { first: valueAt(0), last: valueAt(length - 1), widest: valueAt(widest), highest: valueAt(highest), widths, heights, };
                }
                getLabelForValue(value) { return value; }
                getPixelForValue(value, index) { return NaN; }
                getValueForPixel(pixel) { }
                getPixelForTick(index) {
                        const ticks = this.ticks; if (index < 0 || index > ticks.length - 1) { return null; }
                        return this.getPixelForValue(ticks[index].value);
                }
                getPixelForDecimal(decimal) {
                        if (this._reversePixels) { decimal = 1 - decimal; }
                        const pixel = this._startPixel + decimal * this._length; return _int16Range(this._alignToPixels ? _alignPixel(this.chart, pixel, 0) : pixel);
                }
                getDecimalForPixel(pixel) { const decimal = (pixel - this._startPixel) / this._length; return this._reversePixels ? 1 - decimal : decimal; }
                getBasePixel() { return this.getPixelForValue(this.getBaseValue()); }
                getBaseValue() { const { min, max } = this; return min < 0 && max < 0 ? max : min > 0 && max > 0 ? min : 0; }
                getContext(index) {
                        const ticks = this.ticks || []; if (index >= 0 && index < ticks.length) { const tick = ticks[index]; return tick.$context || (tick.$context = createTickContext(this.getContext(), index, tick)); }
                        return this.$context || (this.$context = createScaleContext(this.chart.getContext(), this));
                }
                _tickSize() { const optionTicks = this.options.ticks; const rot = toRadians(this.labelRotation); const cos = Math.abs(Math.cos(rot)); const sin = Math.abs(Math.sin(rot)); const labelSizes = this._getLabelSizes(); const padding = optionTicks.autoSkipPadding || 0; const w = labelSizes ? labelSizes.widest.width + padding : 0; const h = labelSizes ? labelSizes.highest.height + padding : 0; return this.isHorizontal() ? h * cos > w * sin ? w / cos : h / sin : h * sin < w * cos ? h / cos : w / sin; }
                _isVisible() {
                        const display = this.options.display; if (display !== 'auto') { return !!display; }
                        return this.getMatchingVisibleMetas().length > 0;
                }
                _computeGridLineItems(chartArea) {
                        const axis = this.axis; const chart = this.chart; const options = this.options; const { grid, position } = options; const offset = grid.offset; const isHorizontal = this.isHorizontal(); const ticks = this.ticks; const ticksLength = ticks.length + (offset ? 1 : 0); const tl = getTickMarkLength(grid); const items = []; const borderOpts = grid.setContext(this.getContext()); const axisWidth = borderOpts.drawBorder ? borderOpts.borderWidth : 0; const axisHalfWidth = axisWidth / 2; const alignBorderValue = function (pixel) { return _alignPixel(chart, pixel, axisWidth); }; let borderValue, i, lineValue, alignedLineValue; let tx1, ty1, tx2, ty2, x1, y1, x2, y2; if (position === 'top') { borderValue = alignBorderValue(this.bottom); ty1 = this.bottom - tl; ty2 = borderValue - axisHalfWidth; y1 = alignBorderValue(chartArea.top) + axisHalfWidth; y2 = chartArea.bottom; } else if (position === 'bottom') { borderValue = alignBorderValue(this.top); y1 = chartArea.top; y2 = alignBorderValue(chartArea.bottom) - axisHalfWidth; ty1 = borderValue + axisHalfWidth; ty2 = this.top + tl; } else if (position === 'left') { borderValue = alignBorderValue(this.right); tx1 = this.right - tl; tx2 = borderValue - axisHalfWidth; x1 = alignBorderValue(chartArea.left) + axisHalfWidth; x2 = chartArea.right; } else if (position === 'right') { borderValue = alignBorderValue(this.left); x1 = chartArea.left; x2 = alignBorderValue(chartArea.right) - axisHalfWidth; tx1 = borderValue + axisHalfWidth; tx2 = this.left + tl; } else if (axis === 'x') {
                                if (position === 'center') { borderValue = alignBorderValue((chartArea.top + chartArea.bottom) / 2 + 0.5); } else if (isObject(position)) { const positionAxisID = Object.keys(position)[0]; const value = position[positionAxisID]; borderValue = alignBorderValue(this.chart.scales[positionAxisID].getPixelForValue(value)); }
                                y1 = chartArea.top; y2 = chartArea.bottom; ty1 = borderValue + axisHalfWidth; ty2 = ty1 + tl;
                        } else if (axis === 'y') {
                                if (position === 'center') { borderValue = alignBorderValue((chartArea.left + chartArea.right) / 2); } else if (isObject(position)) { const positionAxisID = Object.keys(position)[0]; const value = position[positionAxisID]; borderValue = alignBorderValue(this.chart.scales[positionAxisID].getPixelForValue(value)); }
                                tx1 = borderValue - axisHalfWidth; tx2 = tx1 - tl; x1 = chartArea.left; x2 = chartArea.right;
                        }
                        const limit = valueOrDefault(options.ticks.maxTicksLimit, ticksLength); const step = Math.max(1, Math.ceil(ticksLength / limit)); for (i = 0; i < ticksLength; i += step) {
                                const optsAtIndex = grid.setContext(this.getContext(i)); const lineWidth = optsAtIndex.lineWidth; const lineColor = optsAtIndex.color; const borderDash = grid.borderDash || []; const borderDashOffset = optsAtIndex.borderDashOffset; const tickWidth = optsAtIndex.tickWidth; const tickColor = optsAtIndex.tickColor; const tickBorderDash = optsAtIndex.tickBorderDash || []; const tickBorderDashOffset = optsAtIndex.tickBorderDashOffset; lineValue = getPixelForGridLine(this, i, offset); if (lineValue === undefined) { continue; }
                                alignedLineValue = _alignPixel(chart, lineValue, lineWidth); if (isHorizontal) { tx1 = tx2 = x1 = x2 = alignedLineValue; } else { ty1 = ty2 = y1 = y2 = alignedLineValue; }
                                items.push({ tx1, ty1, tx2, ty2, x1, y1, x2, y2, width: lineWidth, color: lineColor, borderDash, borderDashOffset, tickWidth, tickColor, tickBorderDash, tickBorderDashOffset, });
                        }
                        this._ticksLength = ticksLength; this._borderValue = borderValue; return items;
                }
                _computeLabelItems(chartArea) {
                        const axis = this.axis; const options = this.options; const { position, ticks: optionTicks } = options; const isHorizontal = this.isHorizontal(); const ticks = this.ticks; const { align, crossAlign, padding, mirror } = optionTicks; const tl = getTickMarkLength(options.grid); const tickAndPadding = tl + padding; const hTickAndPadding = mirror ? -padding : tickAndPadding; const rotation = -toRadians(this.labelRotation); const items = []; let i, ilen, tick, label, x, y, textAlign, pixel, font, lineHeight, lineCount, textOffset; let textBaseline = 'middle'; if (position === 'top') { y = this.bottom - hTickAndPadding; textAlign = this._getXAxisLabelAlignment(); } else if (position === 'bottom') { y = this.top + hTickAndPadding; textAlign = this._getXAxisLabelAlignment(); } else if (position === 'left') { const ret = this._getYAxisLabelAlignment(tl); textAlign = ret.textAlign; x = ret.x; } else if (position === 'right') { const ret = this._getYAxisLabelAlignment(tl); textAlign = ret.textAlign; x = ret.x; } else if (axis === 'x') {
                                if (position === 'center') { y = ((chartArea.top + chartArea.bottom) / 2) + tickAndPadding; } else if (isObject(position)) { const positionAxisID = Object.keys(position)[0]; const value = position[positionAxisID]; y = this.chart.scales[positionAxisID].getPixelForValue(value) + tickAndPadding; }
                                textAlign = this._getXAxisLabelAlignment();
                        } else if (axis === 'y') {
                                if (position === 'center') { x = ((chartArea.left + chartArea.right) / 2) - tickAndPadding; } else if (isObject(position)) { const positionAxisID = Object.keys(position)[0]; const value = position[positionAxisID]; x = this.chart.scales[positionAxisID].getPixelForValue(value); }
                                textAlign = this._getYAxisLabelAlignment(tl).textAlign;
                        }
                        if (axis === 'y') { if (align === 'start') { textBaseline = 'top'; } else if (align === 'end') { textBaseline = 'bottom'; } }
                        const labelSizes = this._getLabelSizes(); for (i = 0, ilen = ticks.length; i < ilen; ++i) {
                                tick = ticks[i]; label = tick.label; const optsAtIndex = optionTicks.setContext(this.getContext(i)); pixel = this.getPixelForTick(i) + optionTicks.labelOffset; font = this._resolveTickFontOptions(i); lineHeight = font.lineHeight; lineCount = isArray(label) ? label.length : 1; const halfCount = lineCount / 2; const color = optsAtIndex.color; const strokeColor = optsAtIndex.textStrokeColor; const strokeWidth = optsAtIndex.textStrokeWidth; let tickTextAlign = textAlign; if (isHorizontal) {
                                        x = pixel; if (textAlign === 'inner') { if (i === ilen - 1) { tickTextAlign = !this.options.reverse ? 'right' : 'left'; } else if (i === 0) { tickTextAlign = !this.options.reverse ? 'left' : 'right'; } else { tickTextAlign = 'center'; } }
                                        if (position === 'top') { if (crossAlign === 'near' || rotation !== 0) { textOffset = -lineCount * lineHeight + lineHeight / 2; } else if (crossAlign === 'center') { textOffset = -labelSizes.highest.height / 2 - halfCount * lineHeight + lineHeight; } else { textOffset = -labelSizes.highest.height + lineHeight / 2; } } else { if (crossAlign === 'near' || rotation !== 0) { textOffset = lineHeight / 2; } else if (crossAlign === 'center') { textOffset = labelSizes.highest.height / 2 - halfCount * lineHeight; } else { textOffset = labelSizes.highest.height - lineCount * lineHeight; } }
                                        if (mirror) { textOffset *= -1; }
                                } else { y = pixel; textOffset = (1 - lineCount) * lineHeight / 2; }
                                let backdrop; if (optsAtIndex.showLabelBackdrop) {
                                        const labelPadding = toPadding(optsAtIndex.backdropPadding); const height = labelSizes.heights[i]; const width = labelSizes.widths[i]; let top = y + textOffset - labelPadding.top; let left = x - labelPadding.left; switch (textBaseline) { case 'middle': top -= height / 2; break; case 'bottom': top -= height; break; }
                                        switch (textAlign) { case 'center': left -= width / 2; break; case 'right': left -= width; break; }
                                        backdrop = { left, top, width: width + labelPadding.width, height: height + labelPadding.height, color: optsAtIndex.backdropColor, };
                                }
                                items.push({ rotation, label, font, color, strokeColor, strokeWidth, textOffset, textAlign: tickTextAlign, textBaseline, translation: [x, y], backdrop, });
                        }
                        return items;
                }
                _getXAxisLabelAlignment() {
                        const { position, ticks } = this.options; const rotation = -toRadians(this.labelRotation); if (rotation) { return position === 'top' ? 'left' : 'right'; }
                        let align = 'center'; if (ticks.align === 'start') { align = 'left'; } else if (ticks.align === 'end') { align = 'right'; } else if (ticks.align === 'inner') { align = 'inner'; }
                        return align;
                }
                _getYAxisLabelAlignment(tl) {
                        const { position, ticks: { crossAlign, mirror, padding } } = this.options; const labelSizes = this._getLabelSizes(); const tickAndPadding = tl + padding; const widest = labelSizes.widest.width; let textAlign; let x; if (position === 'left') { if (mirror) { x = this.right + padding; if (crossAlign === 'near') { textAlign = 'left'; } else if (crossAlign === 'center') { textAlign = 'center'; x += (widest / 2); } else { textAlign = 'right'; x += widest; } } else { x = this.right - tickAndPadding; if (crossAlign === 'near') { textAlign = 'right'; } else if (crossAlign === 'center') { textAlign = 'center'; x -= (widest / 2); } else { textAlign = 'left'; x = this.left; } } } else if (position === 'right') { if (mirror) { x = this.left + padding; if (crossAlign === 'near') { textAlign = 'right'; } else if (crossAlign === 'center') { textAlign = 'center'; x -= (widest / 2); } else { textAlign = 'left'; x -= widest; } } else { x = this.left + tickAndPadding; if (crossAlign === 'near') { textAlign = 'left'; } else if (crossAlign === 'center') { textAlign = 'center'; x += widest / 2; } else { textAlign = 'right'; x = this.right; } } } else { textAlign = 'right'; }
                        return { textAlign, x };
                }
                _computeLabelArea() {
                        if (this.options.ticks.mirror) { return; }
                        const chart = this.chart; const position = this.options.position; if (position === 'left' || position === 'right') { return { top: 0, left: this.left, bottom: chart.height, right: this.right }; } if (position === 'top' || position === 'bottom') { return { top: this.top, left: 0, bottom: this.bottom, right: chart.width }; }
                }
                drawBackground() { const { ctx, options: { backgroundColor }, left, top, width, height } = this; if (backgroundColor) { ctx.save(); ctx.fillStyle = backgroundColor; ctx.fillRect(left, top, width, height); ctx.restore(); } }
                getLineWidthForValue(value) {
                        const grid = this.options.grid; if (!this._isVisible() || !grid.display) { return 0; }
                        const ticks = this.ticks; const index = ticks.findIndex(t => t.value === value); if (index >= 0) { const opts = grid.setContext(this.getContext(index)); return opts.lineWidth; }
                        return 0;
                }
                drawGrid(chartArea) {
                        const grid = this.options.grid; const ctx = this.ctx; const items = this._gridLineItems || (this._gridLineItems = this._computeGridLineItems(chartArea)); let i, ilen; const drawLine = (p1, p2, style) => {
                                if (!style.width || !style.color) { return; }
                                ctx.save(); ctx.lineWidth = style.width; ctx.strokeStyle = style.color; ctx.setLineDash(style.borderDash || []); ctx.lineDashOffset = style.borderDashOffset; ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke(); ctx.restore();
                        }; if (grid.display) {
                                for (i = 0, ilen = items.length; i < ilen; ++i) {
                                        const item = items[i]; if (grid.drawOnChartArea) { drawLine({ x: item.x1, y: item.y1 }, { x: item.x2, y: item.y2 }, item); }
                                        if (grid.drawTicks) { drawLine({ x: item.tx1, y: item.ty1 }, { x: item.tx2, y: item.ty2 }, { color: item.tickColor, width: item.tickWidth, borderDash: item.tickBorderDash, borderDashOffset: item.tickBorderDashOffset }); }
                                }
                        }
                }
                drawBorder() {
                        const { chart, ctx, options: { grid } } = this; const borderOpts = grid.setContext(this.getContext()); const axisWidth = grid.drawBorder ? borderOpts.borderWidth : 0; if (!axisWidth) { return; }
                        const lastLineWidth = grid.setContext(this.getContext(0)).lineWidth; const borderValue = this._borderValue; let x1, x2, y1, y2; if (this.isHorizontal()) { x1 = _alignPixel(chart, this.left, axisWidth) - axisWidth / 2; x2 = _alignPixel(chart, this.right, lastLineWidth) + lastLineWidth / 2; y1 = y2 = borderValue; } else { y1 = _alignPixel(chart, this.top, axisWidth) - axisWidth / 2; y2 = _alignPixel(chart, this.bottom, lastLineWidth) + lastLineWidth / 2; x1 = x2 = borderValue; }
                        ctx.save(); ctx.lineWidth = borderOpts.borderWidth; ctx.strokeStyle = borderOpts.borderColor; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
                }
                drawLabels(chartArea) {
                        const optionTicks = this.options.ticks; if (!optionTicks.display) { return; }
                        const ctx = this.ctx; const area = this._computeLabelArea(); if (area) { clipArea(ctx, area); }
                        const items = this._labelItems || (this._labelItems = this._computeLabelItems(chartArea)); let i, ilen; for (i = 0, ilen = items.length; i < ilen; ++i) {
                                const item = items[i]; const tickFont = item.font; const label = item.label; if (item.backdrop) { ctx.fillStyle = item.backdrop.color; ctx.fillRect(item.backdrop.left, item.backdrop.top, item.backdrop.width, item.backdrop.height); }
                                let y = item.textOffset; renderText(ctx, label, 0, y, tickFont, item);
                        }
                        if (area) { unclipArea(ctx); }
                }
                drawTitle() {
                        const { ctx, options: { position, title, reverse } } = this; if (!title.display) { return; }
                        const font = toFont(title.font); const padding = toPadding(title.padding); const align = title.align; let offset = font.lineHeight / 2; if (position === 'bottom' || position === 'center' || isObject(position)) { offset += padding.bottom; if (isArray(title.text)) { offset += font.lineHeight * (title.text.length - 1); } } else { offset += padding.top; }
                        const { titleX, titleY, maxWidth, rotation } = titleArgs(this, offset, position, align); renderText(ctx, title.text, 0, 0, font, { color: title.color, maxWidth, rotation, textAlign: titleAlign(align, position, reverse), textBaseline: 'middle', translation: [titleX, titleY], });
                }
                draw(chartArea) {
                        if (!this._isVisible()) { return; }
                        this.drawBackground(); this.drawGrid(chartArea); this.drawBorder(); this.drawTitle(); this.drawLabels(chartArea);
                }
                _layers() {
                        const opts = this.options; const tz = opts.ticks && opts.ticks.z || 0; const gz = valueOrDefault(opts.grid && opts.grid.z, -1); if (!this._isVisible() || this.draw !== Scale.prototype.draw) { return [{ z: tz, draw: (chartArea) => { this.draw(chartArea); } }]; }
                        return [{ z: gz, draw: (chartArea) => { this.drawBackground(); this.drawGrid(chartArea); this.drawTitle(); } }, { z: gz + 1, draw: () => { this.drawBorder(); } }, { z: tz, draw: (chartArea) => { this.drawLabels(chartArea); } }];
                }
                getMatchingVisibleMetas(type) {
                        const metas = this.chart.getSortedVisibleDatasetMetas(); const axisID = this.axis + 'AxisID'; const result = []; let i, ilen; for (i = 0, ilen = metas.length; i < ilen; ++i) { const meta = metas[i]; if (meta[axisID] === this.id && (!type || meta.type === type)) { result.push(meta); } }
                        return result;
                }
                _resolveTickFontOptions(index) { const opts = this.options.ticks.setContext(this.getContext(index)); return toFont(opts.font); }
                _maxDigits() { const fontSize = this._resolveTickFontOptions(0).lineHeight; return (this.isHorizontal() ? this.width : this.height) / fontSize; }
        }
        class TypedRegistry {
                constructor(type, scope, override) { this.type = type; this.scope = scope; this.override = override; this.items = Object.create(null); }
                isForType(type) { return Object.prototype.isPrototypeOf.call(this.type.prototype, type.prototype); }
                register(item) {
                        const proto = Object.getPrototypeOf(item); let parentScope; if (isIChartComponent(proto)) { parentScope = this.register(proto); }
                        const items = this.items; const id = item.id; const scope = this.scope + '.' + id; if (!id) { throw new Error('class does not have id: ' + item); }
                        if (id in items) { return scope; }
                        items[id] = item; registerDefaults(item, scope, parentScope); if (this.override) { defaults.override(item.id, item.overrides); }
                        return scope;
                }
                get(id) { return this.items[id]; }
                unregister(item) {
                        const items = this.items; const id = item.id; const scope = this.scope; if (id in items) { delete items[id]; }
                        if (scope && id in defaults[scope]) { delete defaults[scope][id]; if (this.override) { delete overrides[id]; } }
                }
        }
        function registerDefaults(item, scope, parentScope) {
                const itemDefaults = merge(Object.create(null), [parentScope ? defaults.get(parentScope) : {}, defaults.get(scope), item.defaults]); defaults.set(scope, itemDefaults); if (item.defaultRoutes) { routeDefaults(scope, item.defaultRoutes); }
                if (item.descriptors) { defaults.describe(scope, item.descriptors); }
        }
        function routeDefaults(scope, routes) { Object.keys(routes).forEach(property => { const propertyParts = property.split('.'); const sourceName = propertyParts.pop(); const sourceScope = [scope].concat(propertyParts).join('.'); const parts = routes[property].split('.'); const targetName = parts.pop(); const targetScope = parts.join('.'); defaults.route(sourceScope, sourceName, targetScope, targetName); }); }
        function isIChartComponent(proto) { return 'id' in proto && 'defaults' in proto; }
        class Registry {
                constructor() { this.controllers = new TypedRegistry(DatasetController, 'datasets', true); this.elements = new TypedRegistry(Element, 'elements'); this.plugins = new TypedRegistry(Object, 'plugins'); this.scales = new TypedRegistry(Scale, 'scales'); this._typedRegistries = [this.controllers, this.scales, this.elements]; }
                add(...args) { this._each('register', args); }
                remove(...args) { this._each('unregister', args); }
                addControllers(...args) { this._each('register', args, this.controllers); }
                addElements(...args) { this._each('register', args, this.elements); }
                addPlugins(...args) { this._each('register', args, this.plugins); }
                addScales(...args) { this._each('register', args, this.scales); }
                getController(id) { return this._get(id, this.controllers, 'controller'); }
                getElement(id) { return this._get(id, this.elements, 'element'); }
                getPlugin(id) { return this._get(id, this.plugins, 'plugin'); }
                getScale(id) { return this._get(id, this.scales, 'scale'); }
                removeControllers(...args) { this._each('unregister', args, this.controllers); }
                removeElements(...args) { this._each('unregister', args, this.elements); }
                removePlugins(...args) { this._each('unregister', args, this.plugins); }
                removeScales(...args) { this._each('unregister', args, this.scales); }
                _each(method, args, typedRegistry) { [...args].forEach(arg => { const reg = typedRegistry || this._getRegistryForType(arg); if (typedRegistry || reg.isForType(arg) || (reg === this.plugins && arg.id)) { this._exec(method, reg, arg); } else { each(arg, item => { const itemReg = typedRegistry || this._getRegistryForType(item); this._exec(method, itemReg, item); }); } }); }
                _exec(method, registry, component) { const camelMethod = _capitalize(method); callback(component['before' + camelMethod], [], component); registry[method](component); callback(component['after' + camelMethod], [], component); }
                _getRegistryForType(type) {
                        for (let i = 0; i < this._typedRegistries.length; i++) { const reg = this._typedRegistries[i]; if (reg.isForType(type)) { return reg; } }
                        return this.plugins;
                }
                _get(id, typedRegistry, type) {
                        const item = typedRegistry.get(id); if (item === undefined) { throw new Error('"' + id + '" is not a registered ' + type + '.'); }
                        return item;
                }
        }
        var registry = new Registry(); class PluginService {
                constructor() { this._init = []; }
                notify(chart, hook, args, filter) {
                        if (hook === 'beforeInit') { this._init = this._createDescriptors(chart, true); this._notify(this._init, chart, 'install'); }
                        const descriptors = filter ? this._descriptors(chart).filter(filter) : this._descriptors(chart); const result = this._notify(descriptors, chart, hook, args); if (hook === 'afterDestroy') { this._notify(descriptors, chart, 'stop'); this._notify(this._init, chart, 'uninstall'); }
                        return result;
                }
                _notify(descriptors, chart, hook, args) {
                        args = args || {}; for (const descriptor of descriptors) { const plugin = descriptor.plugin; const method = plugin[hook]; const params = [chart, args, descriptor.options]; if (callback(method, params, plugin) === false && args.cancelable) { return false; } }
                        return true;
                }
                invalidate() { if (!isNullOrUndef(this._cache)) { this._oldCache = this._cache; this._cache = undefined; } }
                _descriptors(chart) {
                        if (this._cache) { return this._cache; }
                        const descriptors = this._cache = this._createDescriptors(chart); this._notifyStateChanges(chart); return descriptors;
                }
                _createDescriptors(chart, all) { const config = chart && chart.config; const options = valueOrDefault(config.options && config.options.plugins, {}); const plugins = allPlugins(config); return options === false && !all ? [] : createDescriptors(chart, plugins, options, all); }
                _notifyStateChanges(chart) { const previousDescriptors = this._oldCache || []; const descriptors = this._cache; const diff = (a, b) => a.filter(x => !b.some(y => x.plugin.id === y.plugin.id)); this._notify(diff(previousDescriptors, descriptors), chart, 'stop'); this._notify(diff(descriptors, previousDescriptors), chart, 'start'); }
        }
        function allPlugins(config) {
                const plugins = []; const keys = Object.keys(registry.plugins.items); for (let i = 0; i < keys.length; i++) { plugins.push(registry.getPlugin(keys[i])); }
                const local = config.plugins || []; for (let i = 0; i < local.length; i++) { const plugin = local[i]; if (plugins.indexOf(plugin) === -1) { plugins.push(plugin); } }
                return plugins;
        }
        function getOpts(options, all) {
                if (!all && options === false) { return null; }
                if (options === true) { return {}; }
                return options;
        }
        function createDescriptors(chart, plugins, options, all) {
                const result = []; const context = chart.getContext(); for (let i = 0; i < plugins.length; i++) {
                        const plugin = plugins[i]; const id = plugin.id; const opts = getOpts(options[id], all); if (opts === null) { continue; }
                        result.push({ plugin, options: pluginOpts(chart.config, plugin, opts, context) });
                }
                return result;
        }
        function pluginOpts(config, plugin, opts, context) { const keys = config.pluginScopeKeys(plugin); const scopes = config.getOptionScopes(opts, keys); return config.createResolver(scopes, context, [''], { scriptable: false, indexable: false, allKeys: true }); }
        function getIndexAxis(type, options) { const datasetDefaults = defaults.datasets[type] || {}; const datasetOptions = (options.datasets || {})[type] || {}; return datasetOptions.indexAxis || options.indexAxis || datasetDefaults.indexAxis || 'x'; }
        function getAxisFromDefaultScaleID(id, indexAxis) {
                let axis = id; if (id === '_index_') { axis = indexAxis; } else if (id === '_value_') { axis = indexAxis === 'x' ? 'y' : 'x'; }
                return axis;
        }
        function getDefaultScaleIDFromAxis(axis, indexAxis) { return axis === indexAxis ? '_index_' : '_value_'; }
        function axisFromPosition(position) {
                if (position === 'top' || position === 'bottom') { return 'x'; }
                if (position === 'left' || position === 'right') { return 'y'; }
        }
        function determineAxis(id, scaleOptions) {
                if (id === 'x' || id === 'y') { return id; }
                return scaleOptions.axis || axisFromPosition(scaleOptions.position) || id.charAt(0).toLowerCase();
        }
        function mergeScaleConfig(config, options) {
                const chartDefaults = overrides[config.type] || { scales: {} }; const configScales = options.scales || {}; const chartIndexAxis = getIndexAxis(config.type, options); const firstIDs = Object.create(null); const scales = Object.create(null); Object.keys(configScales).forEach(id => {
                        const scaleConf = configScales[id]; if (!isObject(scaleConf)) { return console.error(`Invalid scale configuration for scale: ${id}`); }
                        if (scaleConf._proxy) { return console.warn(`Ignoring resolver passed as options for scale: ${id}`); }
                        const axis = determineAxis(id, scaleConf); const defaultId = getDefaultScaleIDFromAxis(axis, chartIndexAxis); const defaultScaleOptions = chartDefaults.scales || {}; firstIDs[axis] = firstIDs[axis] || id; scales[id] = mergeIf(Object.create(null), [{ axis }, scaleConf, defaultScaleOptions[axis], defaultScaleOptions[defaultId]]);
                }); config.data.datasets.forEach(dataset => { const type = dataset.type || config.type; const indexAxis = dataset.indexAxis || getIndexAxis(type, options); const datasetDefaults = overrides[type] || {}; const defaultScaleOptions = datasetDefaults.scales || {}; Object.keys(defaultScaleOptions).forEach(defaultID => { const axis = getAxisFromDefaultScaleID(defaultID, indexAxis); const id = dataset[axis + 'AxisID'] || firstIDs[axis] || axis; scales[id] = scales[id] || Object.create(null); mergeIf(scales[id], [{ axis }, configScales[id], defaultScaleOptions[defaultID]]); }); }); Object.keys(scales).forEach(key => { const scale = scales[key]; mergeIf(scale, [defaults.scales[scale.type], defaults.scale]); }); return scales;
        }
        function initOptions(config) { const options = config.options || (config.options = {}); options.plugins = valueOrDefault(options.plugins, {}); options.scales = mergeScaleConfig(config, options); }
        function initData(data) { data = data || {}; data.datasets = data.datasets || []; data.labels = data.labels || []; return data; }
        function initConfig(config) { config = config || {}; config.data = initData(config.data); initOptions(config); return config; }
        const keyCache = new Map(); const keysCached = new Set(); function cachedKeys(cacheKey, generate) {
                let keys = keyCache.get(cacheKey); if (!keys) { keys = generate(); keyCache.set(cacheKey, keys); keysCached.add(keys); }
                return keys;
        }
        const addIfFound = (set, obj, key) => { const opts = resolveObjectKey(obj, key); if (opts !== undefined) { set.add(opts); } }; class Config {
                constructor(config) { this._config = initConfig(config); this._scopeCache = new Map(); this._resolverCache = new Map(); }
                get platform() { return this._config.platform; }
                get type() { return this._config.type; }
                set type(type) { this._config.type = type; }
                get data() { return this._config.data; }
                set data(data) { this._config.data = initData(data); }
                get options() { return this._config.options; }
                set options(options) { this._config.options = options; }
                get plugins() { return this._config.plugins; }
                update() { const config = this._config; this.clearCache(); initOptions(config); }
                clearCache() { this._scopeCache.clear(); this._resolverCache.clear(); }
                datasetScopeKeys(datasetType) { return cachedKeys(datasetType, () => [[`datasets.${datasetType}`, '']]); }
                datasetAnimationScopeKeys(datasetType, transition) { return cachedKeys(`${datasetType}.transition.${transition}`, () => [[`datasets.${datasetType}.transitions.${transition}`, `transitions.${transition}`,], [`datasets.${datasetType}`, '']]); }
                datasetElementScopeKeys(datasetType, elementType) { return cachedKeys(`${datasetType}-${elementType}`, () => [[`datasets.${datasetType}.elements.${elementType}`, `datasets.${datasetType}`, `elements.${elementType}`, '']]); }
                pluginScopeKeys(plugin) { const id = plugin.id; const type = this.type; return cachedKeys(`${type}-plugin-${id}`, () => [[`plugins.${id}`, ...plugin.additionalOptionScopes || [],]]); }
                _cachedScopes(mainScope, resetCache) {
                        const _scopeCache = this._scopeCache; let cache = _scopeCache.get(mainScope); if (!cache || resetCache) { cache = new Map(); _scopeCache.set(mainScope, cache); }
                        return cache;
                }
                getOptionScopes(mainScope, keyLists, resetCache) {
                        const { options, type } = this; const cache = this._cachedScopes(mainScope, resetCache); const cached = cache.get(keyLists); if (cached) { return cached; }
                        const scopes = new Set(); keyLists.forEach(keys => {
                                if (mainScope) { scopes.add(mainScope); keys.forEach(key => addIfFound(scopes, mainScope, key)); }
                                keys.forEach(key => addIfFound(scopes, options, key)); keys.forEach(key => addIfFound(scopes, overrides[type] || {}, key)); keys.forEach(key => addIfFound(scopes, defaults, key)); keys.forEach(key => addIfFound(scopes, descriptors, key));
                        }); const array = Array.from(scopes); if (array.length === 0) { array.push(Object.create(null)); }
                        if (keysCached.has(keyLists)) { cache.set(keyLists, array); }
                        return array;
                }
                chartOptionScopes() { const { options, type } = this; return [options, overrides[type] || {}, defaults.datasets[type] || {}, { type }, defaults, descriptors]; }
                resolveNamedOptions(scopes, names, context, prefixes = ['']) {
                        const result = { $shared: true }; const { resolver, subPrefixes } = getResolver(this._resolverCache, scopes, prefixes); let options = resolver; if (needContext(resolver, names)) { result.$shared = false; context = isFunction(context) ? context() : context; const subResolver = this.createResolver(scopes, context, subPrefixes); options = _attachContext(resolver, context, subResolver); }
                        for (const prop of names) { result[prop] = options[prop]; }
                        return result;
                }
                createResolver(scopes, context, prefixes = [''], descriptorDefaults) { const { resolver } = getResolver(this._resolverCache, scopes, prefixes); return isObject(context) ? _attachContext(resolver, context, undefined, descriptorDefaults) : resolver; }
        }
        function getResolver(resolverCache, scopes, prefixes) {
                let cache = resolverCache.get(scopes); if (!cache) { cache = new Map(); resolverCache.set(scopes, cache); }
                const cacheKey = prefixes.join(); let cached = cache.get(cacheKey); if (!cached) { const resolver = _createResolver(scopes, prefixes); cached = { resolver, subPrefixes: prefixes.filter(p => !p.toLowerCase().includes('hover')) }; cache.set(cacheKey, cached); }
                return cached;
        }
        const hasFunction = value => isObject(value) && Object.getOwnPropertyNames(value).reduce((acc, key) => acc || isFunction(value[key]), false); function needContext(proxy, names) {
                const { isScriptable, isIndexable } = _descriptors(proxy); for (const prop of names) { const scriptable = isScriptable(prop); const indexable = isIndexable(prop); const value = (indexable || scriptable) && proxy[prop]; if ((scriptable && (isFunction(value) || hasFunction(value))) || (indexable && isArray(value))) { return true; } }
                return false;
        }
        var version = "3.8.0"; const KNOWN_POSITIONS = ['top', 'bottom', 'left', 'right', 'chartArea']; function positionIsHorizontal(position, axis) { return position === 'top' || position === 'bottom' || (KNOWN_POSITIONS.indexOf(position) === -1 && axis === 'x'); }
        function compare2Level(l1, l2) { return function (a, b) { return a[l1] === b[l1] ? a[l2] - b[l2] : a[l1] - b[l1]; }; }
        function onAnimationsComplete(context) { const chart = context.chart; const animationOptions = chart.options.animation; chart.notifyPlugins('afterRender'); callback(animationOptions && animationOptions.onComplete, [context], chart); }
        function onAnimationProgress(context) { const chart = context.chart; const animationOptions = chart.options.animation; callback(animationOptions && animationOptions.onProgress, [context], chart); }
        function getCanvas(item) {
                if (_isDomSupported() && typeof item === 'string') { item = document.getElementById(item); } else if (item && item.length) { item = item[0]; }
                if (item && item.canvas) { item = item.canvas; }
                return item;
        }
        const instances = {}; const getChart = (key) => { const canvas = getCanvas(key); return Object.values(instances).filter((c) => c.canvas === canvas).pop(); }; function moveNumericKeys(obj, start, move) { const keys = Object.keys(obj); for (const key of keys) { const intKey = +key; if (intKey >= start) { const value = obj[key]; delete obj[key]; if (move > 0 || intKey > start) { obj[intKey + move] = value; } } } }
        function determineLastEvent(e, lastEvent, inChartArea, isClick) {
                if (!inChartArea || e.type === 'mouseout') { return null; }
                if (isClick) { return lastEvent; }
                return e;
        }
        class Chart {
                constructor(item, userConfig) {
                        const config = this.config = new Config(userConfig); const initialCanvas = getCanvas(item); const existingChart = getChart(initialCanvas); if (existingChart) { throw new Error('Canvas is already in use. Chart with ID \'' + existingChart.id + '\'' + ' must be destroyed before the canvas can be reused.'); }
                        const options = config.createResolver(config.chartOptionScopes(), this.getContext()); this.platform = new (config.platform || _detectPlatform(initialCanvas))(); this.platform.updateConfig(config); const context = this.platform.acquireContext(initialCanvas, options.aspectRatio); const canvas = context && context.canvas; const height = canvas && canvas.height; const width = canvas && canvas.width; this.id = uid(); this.ctx = context; this.canvas = canvas; this.width = width; this.height = height; this._options = options; this._aspectRatio = this.aspectRatio; this._layers = []; this._metasets = []; this._stacks = undefined; this.boxes = []; this.currentDevicePixelRatio = undefined; this.chartArea = undefined; this._active = []; this._lastEvent = undefined; this._listeners = {}; this._responsiveListeners = undefined; this._sortedMetasets = []; this.scales = {}; this._plugins = new PluginService(); this.$proxies = {}; this._hiddenIndices = {}; this.attached = false; this._animationsDisabled = undefined; this.$context = undefined; this._doResize = debounce(mode => this.update(mode), options.resizeDelay || 0); this._dataChanges = []; instances[this.id] = this; if (!context || !canvas) { console.error("Failed to create chart: can't acquire context from the given item"); return; }
                        animator.listen(this, 'complete', onAnimationsComplete); animator.listen(this, 'progress', onAnimationProgress); this._initialize(); if (this.attached) { this.update(); }
                }
                get aspectRatio() {
                        const { options: { aspectRatio, maintainAspectRatio }, width, height, _aspectRatio } = this; if (!isNullOrUndef(aspectRatio)) { return aspectRatio; }
                        if (maintainAspectRatio && _aspectRatio) { return _aspectRatio; }
                        return height ? width / height : null;
                }
                get data() { return this.config.data; }
                set data(data) { this.config.data = data; }
                get options() { return this._options; }
                set options(options) { this.config.options = options; }
                _initialize() {
                        this.notifyPlugins('beforeInit'); if (this.options.responsive) { this.resize(); } else { retinaScale(this, this.options.devicePixelRatio); }
                        this.bindEvents(); this.notifyPlugins('afterInit'); return this;
                }
                clear() { clearCanvas(this.canvas, this.ctx); return this; }
                stop() { animator.stop(this); return this; }
                resize(width, height) { if (!animator.running(this)) { this._resize(width, height); } else { this._resizeBeforeDraw = { width, height }; } }
                _resize(width, height) {
                        const options = this.options; const canvas = this.canvas; const aspectRatio = options.maintainAspectRatio && this.aspectRatio; const newSize = this.platform.getMaximumSize(canvas, width, height, aspectRatio); const newRatio = options.devicePixelRatio || this.platform.getDevicePixelRatio(); const mode = this.width ? 'resize' : 'attach'; this.width = newSize.width; this.height = newSize.height; this._aspectRatio = this.aspectRatio; if (!retinaScale(this, newRatio, true)) { return; }
                        this.notifyPlugins('resize', { size: newSize }); callback(options.onResize, [this, newSize], this); if (this.attached) { if (this._doResize(mode)) { this.render(); } }
                }
                ensureScalesHaveIDs() { const options = this.options; const scalesOptions = options.scales || {}; each(scalesOptions, (axisOptions, axisID) => { axisOptions.id = axisID; }); }
                buildOrUpdateScales() {
                        const options = this.options; const scaleOpts = options.scales; const scales = this.scales; const updated = Object.keys(scales).reduce((obj, id) => { obj[id] = false; return obj; }, {}); let items = []; if (scaleOpts) { items = items.concat(Object.keys(scaleOpts).map((id) => { const scaleOptions = scaleOpts[id]; const axis = determineAxis(id, scaleOptions); const isRadial = axis === 'r'; const isHorizontal = axis === 'x'; return { options: scaleOptions, dposition: isRadial ? 'chartArea' : isHorizontal ? 'bottom' : 'left', dtype: isRadial ? 'radialLinear' : isHorizontal ? 'category' : 'linear' }; })); }
                        each(items, (item) => {
                                const scaleOptions = item.options; const id = scaleOptions.id; const axis = determineAxis(id, scaleOptions); const scaleType = valueOrDefault(scaleOptions.type, item.dtype); if (scaleOptions.position === undefined || positionIsHorizontal(scaleOptions.position, axis) !== positionIsHorizontal(item.dposition)) { scaleOptions.position = item.dposition; }
                                updated[id] = true; let scale = null; if (id in scales && scales[id].type === scaleType) { scale = scales[id]; } else { const scaleClass = registry.getScale(scaleType); scale = new scaleClass({ id, type: scaleType, ctx: this.ctx, chart: this }); scales[scale.id] = scale; }
                                scale.init(scaleOptions, options);
                        }); each(updated, (hasUpdated, id) => { if (!hasUpdated) { delete scales[id]; } }); each(scales, (scale) => { layouts.configure(this, scale, scale.options); layouts.addBox(this, scale); });
                }
                _updateMetasets() {
                        const metasets = this._metasets; const numData = this.data.datasets.length; const numMeta = metasets.length; metasets.sort((a, b) => a.index - b.index); if (numMeta > numData) {
                                for (let i = numData; i < numMeta; ++i) { this._destroyDatasetMeta(i); }
                                metasets.splice(numData, numMeta - numData);
                        }
                        this._sortedMetasets = metasets.slice(0).sort(compare2Level('order', 'index'));
                }
                _removeUnreferencedMetasets() {
                        const { _metasets: metasets, data: { datasets } } = this; if (metasets.length > datasets.length) { delete this._stacks; }
                        metasets.forEach((meta, index) => { if (datasets.filter(x => x === meta._dataset).length === 0) { this._destroyDatasetMeta(index); } });
                }
                buildOrUpdateControllers() {
                        const newControllers = []; const datasets = this.data.datasets; let i, ilen; this._removeUnreferencedMetasets(); for (i = 0, ilen = datasets.length; i < ilen; i++) {
                                const dataset = datasets[i]; let meta = this.getDatasetMeta(i); const type = dataset.type || this.config.type; if (meta.type && meta.type !== type) { this._destroyDatasetMeta(i); meta = this.getDatasetMeta(i); }
                                meta.type = type; meta.indexAxis = dataset.indexAxis || getIndexAxis(type, this.options); meta.order = dataset.order || 0; meta.index = i; meta.label = '' + dataset.label; meta.visible = this.isDatasetVisible(i); if (meta.controller) { meta.controller.updateIndex(i); meta.controller.linkScales(); } else { const ControllerClass = registry.getController(type); const { datasetElementType, dataElementType } = defaults.datasets[type]; Object.assign(ControllerClass.prototype, { dataElementType: registry.getElement(dataElementType), datasetElementType: datasetElementType && registry.getElement(datasetElementType) }); meta.controller = new ControllerClass(this, i); newControllers.push(meta.controller); }
                        }
                        this._updateMetasets(); return newControllers;
                }
                _resetElements() { each(this.data.datasets, (dataset, datasetIndex) => { this.getDatasetMeta(datasetIndex).controller.reset(); }, this); }
                reset() { this._resetElements(); this.notifyPlugins('reset'); }
                update(mode) {
                        const config = this.config; config.update(); const options = this._options = config.createResolver(config.chartOptionScopes(), this.getContext()); const animsDisabled = this._animationsDisabled = !options.animation; this._updateScales(); this._checkEventBindings(); this._updateHiddenIndices(); this._plugins.invalidate(); if (this.notifyPlugins('beforeUpdate', { mode, cancelable: true }) === false) { return; }
                        const newControllers = this.buildOrUpdateControllers(); this.notifyPlugins('beforeElementsUpdate'); let minPadding = 0; for (let i = 0, ilen = this.data.datasets.length; i < ilen; i++) { const { controller } = this.getDatasetMeta(i); const reset = !animsDisabled && newControllers.indexOf(controller) === -1; controller.buildOrUpdateElements(reset); minPadding = Math.max(+controller.getMaxOverflow(), minPadding); }
                        minPadding = this._minPadding = options.layout.autoPadding ? minPadding : 0; this._updateLayout(minPadding); if (!animsDisabled) { each(newControllers, (controller) => { controller.reset(); }); }
                        this._updateDatasets(mode); this.notifyPlugins('afterUpdate', { mode }); this._layers.sort(compare2Level('z', '_idx')); const { _active, _lastEvent } = this; if (_lastEvent) { this._eventHandler(_lastEvent, true); } else if (_active.length) { this._updateHoverStyles(_active, _active, true); }
                        this.render();
                }
                _updateScales() { each(this.scales, (scale) => { layouts.removeBox(this, scale); }); this.ensureScalesHaveIDs(); this.buildOrUpdateScales(); }
                _checkEventBindings() { const options = this.options; const existingEvents = new Set(Object.keys(this._listeners)); const newEvents = new Set(options.events); if (!setsEqual(existingEvents, newEvents) || !!this._responsiveListeners !== options.responsive) { this.unbindEvents(); this.bindEvents(); } }
                _updateHiddenIndices() { const { _hiddenIndices } = this; const changes = this._getUniformDataChanges() || []; for (const { method, start, count } of changes) { const move = method === '_removeElements' ? -count : count; moveNumericKeys(_hiddenIndices, start, move); } }
                _getUniformDataChanges() {
                        const _dataChanges = this._dataChanges; if (!_dataChanges || !_dataChanges.length) { return; }
                        this._dataChanges = []; const datasetCount = this.data.datasets.length; const makeSet = (idx) => new Set(_dataChanges.filter(c => c[0] === idx).map((c, i) => i + ',' + c.splice(1).join(','))); const changeSet = makeSet(0); for (let i = 1; i < datasetCount; i++) { if (!setsEqual(changeSet, makeSet(i))) { return; } }
                        return Array.from(changeSet).map(c => c.split(',')).map(a => ({ method: a[1], start: +a[2], count: +a[3] }));
                }
                _updateLayout(minPadding) {
                        if (this.notifyPlugins('beforeLayout', { cancelable: true }) === false) { return; }
                        layouts.update(this, this.width, this.height, minPadding); const area = this.chartArea; const noArea = area.width <= 0 || area.height <= 0; this._layers = []; each(this.boxes, (box) => {
                                if (noArea && box.position === 'chartArea') { return; }
                                if (box.configure) { box.configure(); }
                                this._layers.push(...box._layers());
                        }, this); this._layers.forEach((item, index) => { item._idx = index; }); this.notifyPlugins('afterLayout');
                }
                _updateDatasets(mode) {
                        if (this.notifyPlugins('beforeDatasetsUpdate', { mode, cancelable: true }) === false) { return; }
                        for (let i = 0, ilen = this.data.datasets.length; i < ilen; ++i) { this.getDatasetMeta(i).controller.configure(); }
                        for (let i = 0, ilen = this.data.datasets.length; i < ilen; ++i) { this._updateDataset(i, isFunction(mode) ? mode({ datasetIndex: i }) : mode); }
                        this.notifyPlugins('afterDatasetsUpdate', { mode });
                }
                _updateDataset(index, mode) {
                        const meta = this.getDatasetMeta(index); const args = { meta, index, mode, cancelable: true }; if (this.notifyPlugins('beforeDatasetUpdate', args) === false) { return; }
                        meta.controller._update(mode); args.cancelable = false; this.notifyPlugins('afterDatasetUpdate', args);
                }
                render() {
                        if (this.notifyPlugins('beforeRender', { cancelable: true }) === false) { return; }
                        if (animator.has(this)) { if (this.attached && !animator.running(this)) { animator.start(this); } } else { this.draw(); onAnimationsComplete({ chart: this }); }
                }
                draw() {
                        let i; if (this._resizeBeforeDraw) { const { width, height } = this._resizeBeforeDraw; this._resize(width, height); this._resizeBeforeDraw = null; }
                        this.clear(); if (this.width <= 0 || this.height <= 0) { return; }
                        if (this.notifyPlugins('beforeDraw', { cancelable: true }) === false) { return; }
                        const layers = this._layers; for (i = 0; i < layers.length && layers[i].z <= 0; ++i) { layers[i].draw(this.chartArea); }
                        this._drawDatasets(); for (; i < layers.length; ++i) { layers[i].draw(this.chartArea); }
                        this.notifyPlugins('afterDraw');
                }
                _getSortedDatasetMetas(filterVisible) {
                        const metasets = this._sortedMetasets; const result = []; let i, ilen; for (i = 0, ilen = metasets.length; i < ilen; ++i) { const meta = metasets[i]; if (!filterVisible || meta.visible) { result.push(meta); } }
                        return result;
                }
                getSortedVisibleDatasetMetas() { return this._getSortedDatasetMetas(true); }
                _drawDatasets() {
                        if (this.notifyPlugins('beforeDatasetsDraw', { cancelable: true }) === false) { return; }
                        const metasets = this.getSortedVisibleDatasetMetas(); for (let i = metasets.length - 1; i >= 0; --i) { this._drawDataset(metasets[i]); }
                        this.notifyPlugins('afterDatasetsDraw');
                }
                _drawDataset(meta) {
                        const ctx = this.ctx; const clip = meta._clip; const useClip = !clip.disabled; const area = this.chartArea; const args = { meta, index: meta.index, cancelable: true }; if (this.notifyPlugins('beforeDatasetDraw', args) === false) { return; }
                        if (useClip) { clipArea(ctx, { left: clip.left === false ? 0 : area.left - clip.left, right: clip.right === false ? this.width : area.right + clip.right, top: clip.top === false ? 0 : area.top - clip.top, bottom: clip.bottom === false ? this.height : area.bottom + clip.bottom }); }
                        meta.controller.draw(); if (useClip) { unclipArea(ctx); }
                        args.cancelable = false; this.notifyPlugins('afterDatasetDraw', args);
                }
                isPointInArea(point) { return _isPointInArea(point, this.chartArea, this._minPadding); }
                getElementsAtEventForMode(e, mode, options, useFinalPosition) {
                        const method = Interaction.modes[mode]; if (typeof method === 'function') { return method(this, e, options, useFinalPosition); }
                        return [];
                }
                getDatasetMeta(datasetIndex) {
                        const dataset = this.data.datasets[datasetIndex]; const metasets = this._metasets; let meta = metasets.filter(x => x && x._dataset === dataset).pop(); if (!meta) { meta = { type: null, data: [], dataset: null, controller: null, hidden: null, xAxisID: null, yAxisID: null, order: dataset && dataset.order || 0, index: datasetIndex, _dataset: dataset, _parsed: [], _sorted: false }; metasets.push(meta); }
                        return meta;
                }
                getContext() { return this.$context || (this.$context = createContext(null, { chart: this, type: 'chart' })); }
                getVisibleDatasetCount() { return this.getSortedVisibleDatasetMetas().length; }
                isDatasetVisible(datasetIndex) {
                        const dataset = this.data.datasets[datasetIndex]; if (!dataset) { return false; }
                        const meta = this.getDatasetMeta(datasetIndex); return typeof meta.hidden === 'boolean' ? !meta.hidden : !dataset.hidden;
                }
                setDatasetVisibility(datasetIndex, visible) { const meta = this.getDatasetMeta(datasetIndex); meta.hidden = !visible; }
                toggleDataVisibility(index) { this._hiddenIndices[index] = !this._hiddenIndices[index]; }
                getDataVisibility(index) { return !this._hiddenIndices[index]; }
                _updateVisibility(datasetIndex, dataIndex, visible) { const mode = visible ? 'show' : 'hide'; const meta = this.getDatasetMeta(datasetIndex); const anims = meta.controller._resolveAnimations(undefined, mode); if (defined(dataIndex)) { meta.data[dataIndex].hidden = !visible; this.update(); } else { this.setDatasetVisibility(datasetIndex, visible); anims.update(meta, { visible }); this.update((ctx) => ctx.datasetIndex === datasetIndex ? mode : undefined); } }
                hide(datasetIndex, dataIndex) { this._updateVisibility(datasetIndex, dataIndex, false); }
                show(datasetIndex, dataIndex) { this._updateVisibility(datasetIndex, dataIndex, true); }
                _destroyDatasetMeta(datasetIndex) {
                        const meta = this._metasets[datasetIndex]; if (meta && meta.controller) { meta.controller._destroy(); }
                        delete this._metasets[datasetIndex];
                }
                _stop() { let i, ilen; this.stop(); animator.remove(this); for (i = 0, ilen = this.data.datasets.length; i < ilen; ++i) { this._destroyDatasetMeta(i); } }
                destroy() {
                        this.notifyPlugins('beforeDestroy'); const { canvas, ctx } = this; this._stop(); this.config.clearCache(); if (canvas) { this.unbindEvents(); clearCanvas(canvas, ctx); this.platform.releaseContext(ctx); this.canvas = null; this.ctx = null; }
                        this.notifyPlugins('destroy'); delete instances[this.id]; this.notifyPlugins('afterDestroy');
                }
                toBase64Image(...args) { return this.canvas.toDataURL(...args); }
                bindEvents() { this.bindUserEvents(); if (this.options.responsive) { this.bindResponsiveEvents(); } else { this.attached = true; } }
                bindUserEvents() { const listeners = this._listeners; const platform = this.platform; const _add = (type, listener) => { platform.addEventListener(this, type, listener); listeners[type] = listener; }; const listener = (e, x, y) => { e.offsetX = x; e.offsetY = y; this._eventHandler(e); }; each(this.options.events, (type) => _add(type, listener)); }
                bindResponsiveEvents() {
                        if (!this._responsiveListeners) { this._responsiveListeners = {}; }
                        const listeners = this._responsiveListeners; const platform = this.platform; const _add = (type, listener) => { platform.addEventListener(this, type, listener); listeners[type] = listener; }; const _remove = (type, listener) => { if (listeners[type]) { platform.removeEventListener(this, type, listener); delete listeners[type]; } }; const listener = (width, height) => { if (this.canvas) { this.resize(width, height); } }; let detached; const attached = () => { _remove('attach', attached); this.attached = true; this.resize(); _add('resize', listener); _add('detach', detached); }; detached = () => { this.attached = false; _remove('resize', listener); this._stop(); this._resize(0, 0); _add('attach', attached); }; if (platform.isAttached(this.canvas)) { attached(); } else { detached(); }
                }
                unbindEvents() { each(this._listeners, (listener, type) => { this.platform.removeEventListener(this, type, listener); }); this._listeners = {}; each(this._responsiveListeners, (listener, type) => { this.platform.removeEventListener(this, type, listener); }); this._responsiveListeners = undefined; }
                updateHoverStyle(items, mode, enabled) {
                        const prefix = enabled ? 'set' : 'remove'; let meta, item, i, ilen; if (mode === 'dataset') { meta = this.getDatasetMeta(items[0].datasetIndex); meta.controller['_' + prefix + 'DatasetHoverStyle'](); }
                        for (i = 0, ilen = items.length; i < ilen; ++i) { item = items[i]; const controller = item && this.getDatasetMeta(item.datasetIndex).controller; if (controller) { controller[prefix + 'HoverStyle'](item.element, item.datasetIndex, item.index); } }
                }
                getActiveElements() { return this._active || []; }
                setActiveElements(activeElements) {
                        const lastActive = this._active || []; const active = activeElements.map(({ datasetIndex, index }) => {
                                const meta = this.getDatasetMeta(datasetIndex); if (!meta) { throw new Error('No dataset found at index ' + datasetIndex); }
                                return { datasetIndex, element: meta.data[index], index, };
                        }); const changed = !_elementsEqual(active, lastActive); if (changed) { this._active = active; this._lastEvent = null; this._updateHoverStyles(active, lastActive); }
                }
                notifyPlugins(hook, args, filter) { return this._plugins.notify(this, hook, args, filter); }
                _updateHoverStyles(active, lastActive, replay) {
                        const hoverOptions = this.options.hover; const diff = (a, b) => a.filter(x => !b.some(y => x.datasetIndex === y.datasetIndex && x.index === y.index)); const deactivated = diff(lastActive, active); const activated = replay ? active : diff(active, lastActive); if (deactivated.length) { this.updateHoverStyle(deactivated, hoverOptions.mode, false); }
                        if (activated.length && hoverOptions.mode) { this.updateHoverStyle(activated, hoverOptions.mode, true); }
                }
                _eventHandler(e, replay) {
                        const args = { event: e, replay, cancelable: true, inChartArea: this.isPointInArea(e) }; const eventFilter = (plugin) => (plugin.options.events || this.options.events).includes(e.native.type); if (this.notifyPlugins('beforeEvent', args, eventFilter) === false) { return; }
                        const changed = this._handleEvent(e, replay, args.inChartArea); args.cancelable = false; this.notifyPlugins('afterEvent', args, eventFilter); if (changed || args.changed) { this.render(); }
                        return this;
                }
                _handleEvent(e, replay, inChartArea) {
                        const { _active: lastActive = [], options } = this; const useFinalPosition = replay; const active = this._getActiveElements(e, lastActive, inChartArea, useFinalPosition); const isClick = _isClickEvent(e); const lastEvent = determineLastEvent(e, this._lastEvent, inChartArea, isClick); if (inChartArea) { this._lastEvent = null; callback(options.onHover, [e, active, this], this); if (isClick) { callback(options.onClick, [e, active, this], this); } }
                        const changed = !_elementsEqual(active, lastActive); if (changed || replay) { this._active = active; this._updateHoverStyles(active, lastActive, replay); }
                        this._lastEvent = lastEvent; return changed;
                }
                _getActiveElements(e, lastActive, inChartArea, useFinalPosition) {
                        if (e.type === 'mouseout') { return []; }
                        if (!inChartArea) { return lastActive; }
                        const hoverOptions = this.options.hover; return this.getElementsAtEventForMode(e, hoverOptions.mode, hoverOptions, useFinalPosition);
                }
        }
        const invalidatePlugins = () => each(Chart.instances, (chart) => chart._plugins.invalidate()); const enumerable = true; Object.defineProperties(Chart, { defaults: { enumerable, value: defaults }, instances: { enumerable, value: instances }, overrides: { enumerable, value: overrides }, registry: { enumerable, value: registry }, version: { enumerable, value: version }, getChart: { enumerable, value: getChart }, register: { enumerable, value: (...items) => { registry.add(...items); invalidatePlugins(); } }, unregister: { enumerable, value: (...items) => { registry.remove(...items); invalidatePlugins(); } } }); function abstract() { throw new Error('This method is not implemented: Check that a complete date adapter is provided.'); }
        class DateAdapter {
                constructor(options) { this.options = options || {}; }
                formats() { return abstract(); }
                parse(value, format) { return abstract(); }
                format(timestamp, format) { return abstract(); }
                add(timestamp, amount, unit) { return abstract(); }
                diff(a, b, unit) { return abstract(); }
                startOf(timestamp, unit, weekday) { return abstract(); }
                endOf(timestamp, unit) { return abstract(); }
        }
        DateAdapter.override = function (members) { Object.assign(DateAdapter.prototype, members); }; var _adapters = { _date: DateAdapter }; function getAllScaleValues(scale, type) {
                if (!scale._cache.$bar) {
                        const visibleMetas = scale.getMatchingVisibleMetas(type); let values = []; for (let i = 0, ilen = visibleMetas.length; i < ilen; i++) { values = values.concat(visibleMetas[i].controller.getAllParsedValues(scale)); }
                        scale._cache.$bar = _arrayUnique(values.sort((a, b) => a - b));
                }
                return scale._cache.$bar;
        }
        function computeMinSampleSize(meta) {
                const scale = meta.iScale; const values = getAllScaleValues(scale, meta.type); let min = scale._length; let i, ilen, curr, prev; const updateMinAndPrev = () => {
                        if (curr === 32767 || curr === -32768) { return; }
                        if (defined(prev)) { min = Math.min(min, Math.abs(curr - prev) || min); }
                        prev = curr;
                }; for (i = 0, ilen = values.length; i < ilen; ++i) { curr = scale.getPixelForValue(values[i]); updateMinAndPrev(); }
                prev = undefined; for (i = 0, ilen = scale.ticks.length; i < ilen; ++i) { curr = scale.getPixelForTick(i); updateMinAndPrev(); }
                return min;
        }
        function computeFitCategoryTraits(index, ruler, options, stackCount) {
                const thickness = options.barThickness; let size, ratio; if (isNullOrUndef(thickness)) { size = ruler.min * options.categoryPercentage; ratio = options.barPercentage; } else { size = thickness * stackCount; ratio = 1; }
                return { chunk: size / stackCount, ratio, start: ruler.pixels[index] - (size / 2) };
        }
        function computeFlexCategoryTraits(index, ruler, options, stackCount) {
                const pixels = ruler.pixels; const curr = pixels[index]; let prev = index > 0 ? pixels[index - 1] : null; let next = index < pixels.length - 1 ? pixels[index + 1] : null; const percent = options.categoryPercentage; if (prev === null) { prev = curr - (next === null ? ruler.end - ruler.start : next - curr); }
                if (next === null) { next = curr + curr - prev; }
                const start = curr - (curr - Math.min(prev, next)) / 2 * percent; const size = Math.abs(next - prev) / 2 * percent; return { chunk: size / stackCount, ratio: options.barPercentage, start };
        }
        function parseFloatBar(entry, item, vScale, i) {
                const startValue = vScale.parse(entry[0], i); const endValue = vScale.parse(entry[1], i); const min = Math.min(startValue, endValue); const max = Math.max(startValue, endValue); let barStart = min; let barEnd = max; if (Math.abs(min) > Math.abs(max)) { barStart = max; barEnd = min; }
                item[vScale.axis] = barEnd; item._custom = { barStart, barEnd, start: startValue, end: endValue, min, max };
        }
        function parseValue(entry, item, vScale, i) {
                if (isArray(entry)) { parseFloatBar(entry, item, vScale, i); } else { item[vScale.axis] = vScale.parse(entry, i); }
                return item;
        }
        function parseArrayOrPrimitive(meta, data, start, count) {
                const iScale = meta.iScale; const vScale = meta.vScale; const labels = iScale.getLabels(); const singleScale = iScale === vScale; const parsed = []; let i, ilen, item, entry; for (i = start, ilen = start + count; i < ilen; ++i) { entry = data[i]; item = {}; item[iScale.axis] = singleScale || iScale.parse(labels[i], i); parsed.push(parseValue(entry, item, vScale, i)); }
                return parsed;
        }
        function isFloatBar(custom) { return custom && custom.barStart !== undefined && custom.barEnd !== undefined; }
        function barSign(size, vScale, actualBase) {
                if (size !== 0) { return sign(size); }
                return (vScale.isHorizontal() ? 1 : -1) * (vScale.min >= actualBase ? 1 : -1);
        }
        function borderProps(properties) {
                let reverse, start, end, top, bottom; if (properties.horizontal) { reverse = properties.base > properties.x; start = 'left'; end = 'right'; } else { reverse = properties.base < properties.y; start = 'bottom'; end = 'top'; }
                if (reverse) { top = 'end'; bottom = 'start'; } else { top = 'start'; bottom = 'end'; }
                return { start, end, reverse, top, bottom };
        }
        function setBorderSkipped(properties, options, stack, index) {
                let edge = options.borderSkipped; const res = {}; if (!edge) { properties.borderSkipped = res; return; }
                const { start, end, reverse, top, bottom } = borderProps(properties); if (edge === 'middle' && stack) { properties.enableBorderRadius = true; if ((stack._top || 0) === index) { edge = top; } else if ((stack._bottom || 0) === index) { edge = bottom; } else { res[parseEdge(bottom, start, end, reverse)] = true; edge = top; } }
                res[parseEdge(edge, start, end, reverse)] = true; properties.borderSkipped = res;
        }
        function parseEdge(edge, a, b, reverse) {
                if (reverse) { edge = swap(edge, a, b); edge = startEnd(edge, b, a); } else { edge = startEnd(edge, a, b); }
                return edge;
        }
        function swap(orig, v1, v2) { return orig === v1 ? v2 : orig === v2 ? v1 : orig; }
        function startEnd(v, start, end) { return v === 'start' ? start : v === 'end' ? end : v; }
        function setInflateAmount(properties, { inflateAmount }, ratio) { properties.inflateAmount = inflateAmount === 'auto' ? ratio === 1 ? 0.33 : 0 : inflateAmount; }
        class BarController extends DatasetController {
                parsePrimitiveData(meta, data, start, count) { return parseArrayOrPrimitive(meta, data, start, count); }
                parseArrayData(meta, data, start, count) { return parseArrayOrPrimitive(meta, data, start, count); }
                parseObjectData(meta, data, start, count) {
                        const { iScale, vScale } = meta; const { xAxisKey = 'x', yAxisKey = 'y' } = this._parsing; const iAxisKey = iScale.axis === 'x' ? xAxisKey : yAxisKey; const vAxisKey = vScale.axis === 'x' ? xAxisKey : yAxisKey; const parsed = []; let i, ilen, item, obj; for (i = start, ilen = start + count; i < ilen; ++i) { obj = data[i]; item = {}; item[iScale.axis] = iScale.parse(resolveObjectKey(obj, iAxisKey), i); parsed.push(parseValue(resolveObjectKey(obj, vAxisKey), item, vScale, i)); }
                        return parsed;
                }
                updateRangeFromParsed(range, scale, parsed, stack) { super.updateRangeFromParsed(range, scale, parsed, stack); const custom = parsed._custom; if (custom && scale === this._cachedMeta.vScale) { range.min = Math.min(range.min, custom.min); range.max = Math.max(range.max, custom.max); } }
                getMaxOverflow() { return 0; }
                getLabelAndValue(index) { const meta = this._cachedMeta; const { iScale, vScale } = meta; const parsed = this.getParsed(index); const custom = parsed._custom; const value = isFloatBar(custom) ? '[' + custom.start + ', ' + custom.end + ']' : '' + vScale.getLabelForValue(parsed[vScale.axis]); return { label: '' + iScale.getLabelForValue(parsed[iScale.axis]), value }; }
                initialize() { this.enableOptionSharing = true; super.initialize(); const meta = this._cachedMeta; meta.stack = this.getDataset().stack; }
                update(mode) { const meta = this._cachedMeta; this.updateElements(meta.data, 0, meta.data.length, mode); }
                updateElements(bars, start, count, mode) {
                        const reset = mode === 'reset'; const { index, _cachedMeta: { vScale } } = this; const base = vScale.getBasePixel(); const horizontal = vScale.isHorizontal(); const ruler = this._getRuler(); const firstOpts = this.resolveDataElementOptions(start, mode); const sharedOptions = this.getSharedOptions(firstOpts); const includeOptions = this.includeOptions(mode, sharedOptions); this.updateSharedOptions(sharedOptions, mode, firstOpts); for (let i = start; i < start + count; i++) {
                                const parsed = this.getParsed(i); const vpixels = reset || isNullOrUndef(parsed[vScale.axis]) ? { base, head: base } : this._calculateBarValuePixels(i); const ipixels = this._calculateBarIndexPixels(i, ruler); const stack = (parsed._stacks || {})[vScale.axis]; const properties = { horizontal, base: vpixels.base, enableBorderRadius: !stack || isFloatBar(parsed._custom) || (index === stack._top || index === stack._bottom), x: horizontal ? vpixels.head : ipixels.center, y: horizontal ? ipixels.center : vpixels.head, height: horizontal ? ipixels.size : Math.abs(vpixels.size), width: horizontal ? Math.abs(vpixels.size) : ipixels.size }; if (includeOptions) { properties.options = sharedOptions || this.resolveDataElementOptions(i, bars[i].active ? 'active' : mode); }
                                const options = properties.options || bars[i].options; setBorderSkipped(properties, options, stack, index); setInflateAmount(properties, options, ruler.ratio); this.updateElement(bars[i], i, properties, mode);
                        }
                }
                _getStacks(last, dataIndex) {
                        const meta = this._cachedMeta; const iScale = meta.iScale; const metasets = iScale.getMatchingVisibleMetas(this._type); const stacked = iScale.options.stacked; const ilen = metasets.length; const stacks = []; let i, item; for (i = 0; i < ilen; ++i) {
                                item = metasets[i]; if (!item.controller.options.grouped) { continue; }
                                if (typeof dataIndex !== 'undefined') { const val = item.controller.getParsed(dataIndex)[item.controller._cachedMeta.vScale.axis]; if (isNullOrUndef(val) || isNaN(val)) { continue; } }
                                if (stacked === false || stacks.indexOf(item.stack) === -1 || (stacked === undefined && item.stack === undefined)) { stacks.push(item.stack); }
                                if (item.index === last) { break; }
                        }
                        if (!stacks.length) { stacks.push(undefined); }
                        return stacks;
                }
                _getStackCount(index) { return this._getStacks(undefined, index).length; }
                _getStackIndex(datasetIndex, name, dataIndex) { const stacks = this._getStacks(datasetIndex, dataIndex); const index = (name !== undefined) ? stacks.indexOf(name) : -1; return (index === -1) ? stacks.length - 1 : index; }
                _getRuler() {
                        const opts = this.options; const meta = this._cachedMeta; const iScale = meta.iScale; const pixels = []; let i, ilen; for (i = 0, ilen = meta.data.length; i < ilen; ++i) { pixels.push(iScale.getPixelForValue(this.getParsed(i)[iScale.axis], i)); }
                        const barThickness = opts.barThickness; const min = barThickness || computeMinSampleSize(meta); return { min, pixels, start: iScale._startPixel, end: iScale._endPixel, stackCount: this._getStackCount(), scale: iScale, grouped: opts.grouped, ratio: barThickness ? 1 : opts.categoryPercentage * opts.barPercentage };
                }
                _calculateBarValuePixels(index) {
                        const { _cachedMeta: { vScale, _stacked }, options: { base: baseValue, minBarLength } } = this; const actualBase = baseValue || 0; const parsed = this.getParsed(index); const custom = parsed._custom; const floating = isFloatBar(custom); let value = parsed[vScale.axis]; let start = 0; let length = _stacked ? this.applyStack(vScale, parsed, _stacked) : value; let head, size; if (length !== value) { start = length - value; length = value; }
                        if (floating) {
                                value = custom.barStart; length = custom.barEnd - custom.barStart; if (value !== 0 && sign(value) !== sign(custom.barEnd)) { start = 0; }
                                start += value;
                        }
                        const startValue = !isNullOrUndef(baseValue) && !floating ? baseValue : start; let base = vScale.getPixelForValue(startValue); if (this.chart.getDataVisibility(index)) { head = vScale.getPixelForValue(start + length); } else { head = base; }
                        size = head - base; if (Math.abs(size) < minBarLength) {
                                size = barSign(size, vScale, actualBase) * minBarLength; if (value === actualBase) { base -= size / 2; }
                                const startPixel = vScale.getPixelForDecimal(0); const endPixel = vScale.getPixelForDecimal(1); const min = Math.min(startPixel, endPixel); const max = Math.max(startPixel, endPixel); base = Math.max(Math.min(base, max), min); head = base + size;
                        }
                        if (base === vScale.getPixelForValue(actualBase)) { const halfGrid = sign(size) * vScale.getLineWidthForValue(actualBase) / 2; base += halfGrid; size -= halfGrid; }
                        return { size, base, head, center: head + size / 2 };
                }
                _calculateBarIndexPixels(index, ruler) {
                        const scale = ruler.scale; const options = this.options; const skipNull = options.skipNull; const maxBarThickness = valueOrDefault(options.maxBarThickness, Infinity); let center, size; if (ruler.grouped) { const stackCount = skipNull ? this._getStackCount(index) : ruler.stackCount; const range = options.barThickness === 'flex' ? computeFlexCategoryTraits(index, ruler, options, stackCount) : computeFitCategoryTraits(index, ruler, options, stackCount); const stackIndex = this._getStackIndex(this.index, this._cachedMeta.stack, skipNull ? index : undefined); center = range.start + (range.chunk * stackIndex) + (range.chunk / 2); size = Math.min(maxBarThickness, range.chunk * range.ratio); } else { center = scale.getPixelForValue(this.getParsed(index)[scale.axis], index); size = Math.min(maxBarThickness, ruler.min * ruler.ratio); }
                        return { base: center - size / 2, head: center + size / 2, center, size };
                }
                draw() { const meta = this._cachedMeta; const vScale = meta.vScale; const rects = meta.data; const ilen = rects.length; let i = 0; for (; i < ilen; ++i) { if (this.getParsed(i)[vScale.axis] !== null) { rects[i].draw(this._ctx); } } }
        }
        BarController.id = 'bar'; BarController.defaults = { datasetElementType: false, dataElementType: 'bar', categoryPercentage: 0.8, barPercentage: 0.9, grouped: true, animations: { numbers: { type: 'number', properties: ['x', 'y', 'base', 'width', 'height'] } } }; BarController.overrides = { scales: { _index_: { type: 'category', offset: true, grid: { offset: true } }, _value_: { type: 'linear', beginAtZero: true, } } }; class BubbleController extends DatasetController {
                initialize() { this.enableOptionSharing = true; super.initialize(); }
                parsePrimitiveData(meta, data, start, count) {
                        const parsed = super.parsePrimitiveData(meta, data, start, count); for (let i = 0; i < parsed.length; i++) { parsed[i]._custom = this.resolveDataElementOptions(i + start).radius; }
                        return parsed;
                }
                parseArrayData(meta, data, start, count) {
                        const parsed = super.parseArrayData(meta, data, start, count); for (let i = 0; i < parsed.length; i++) { const item = data[start + i]; parsed[i]._custom = valueOrDefault(item[2], this.resolveDataElementOptions(i + start).radius); }
                        return parsed;
                }
                parseObjectData(meta, data, start, count) {
                        const parsed = super.parseObjectData(meta, data, start, count); for (let i = 0; i < parsed.length; i++) { const item = data[start + i]; parsed[i]._custom = valueOrDefault(item && item.r && +item.r, this.resolveDataElementOptions(i + start).radius); }
                        return parsed;
                }
                getMaxOverflow() {
                        const data = this._cachedMeta.data; let max = 0; for (let i = data.length - 1; i >= 0; --i) { max = Math.max(max, data[i].size(this.resolveDataElementOptions(i)) / 2); }
                        return max > 0 && max;
                }
                getLabelAndValue(index) { const meta = this._cachedMeta; const { xScale, yScale } = meta; const parsed = this.getParsed(index); const x = xScale.getLabelForValue(parsed.x); const y = yScale.getLabelForValue(parsed.y); const r = parsed._custom; return { label: meta.label, value: '(' + x + ', ' + y + (r ? ', ' + r : '') + ')' }; }
                update(mode) { const points = this._cachedMeta.data; this.updateElements(points, 0, points.length, mode); }
                updateElements(points, start, count, mode) {
                        const reset = mode === 'reset'; const { iScale, vScale } = this._cachedMeta; const firstOpts = this.resolveDataElementOptions(start, mode); const sharedOptions = this.getSharedOptions(firstOpts); const includeOptions = this.includeOptions(mode, sharedOptions); const iAxis = iScale.axis; const vAxis = vScale.axis; for (let i = start; i < start + count; i++) {
                                const point = points[i]; const parsed = !reset && this.getParsed(i); const properties = {}; const iPixel = properties[iAxis] = reset ? iScale.getPixelForDecimal(0.5) : iScale.getPixelForValue(parsed[iAxis]); const vPixel = properties[vAxis] = reset ? vScale.getBasePixel() : vScale.getPixelForValue(parsed[vAxis]); properties.skip = isNaN(iPixel) || isNaN(vPixel); if (includeOptions) { properties.options = this.resolveDataElementOptions(i, point.active ? 'active' : mode); if (reset) { properties.options.radius = 0; } }
                                this.updateElement(point, i, properties, mode);
                        }
                        this.updateSharedOptions(sharedOptions, mode, firstOpts);
                }
                resolveDataElementOptions(index, mode) {
                        const parsed = this.getParsed(index); let values = super.resolveDataElementOptions(index, mode); if (values.$shared) { values = Object.assign({}, values, { $shared: false }); }
                        const radius = values.radius; if (mode !== 'active') { values.radius = 0; }
                        values.radius += valueOrDefault(parsed && parsed._custom, radius); return values;
                }
        }
        BubbleController.id = 'bubble'; BubbleController.defaults = { datasetElementType: false, dataElementType: 'point', animations: { numbers: { type: 'number', properties: ['x', 'y', 'borderWidth', 'radius'] } } }; BubbleController.overrides = { scales: { x: { type: 'linear' }, y: { type: 'linear' } }, plugins: { tooltip: { callbacks: { title() { return ''; } } } } }; function getRatioAndOffset(rotation, circumference, cutout) {
                let ratioX = 1; let ratioY = 1; let offsetX = 0; let offsetY = 0; if (circumference < TAU) { const startAngle = rotation; const endAngle = startAngle + circumference; const startX = Math.cos(startAngle); const startY = Math.sin(startAngle); const endX = Math.cos(endAngle); const endY = Math.sin(endAngle); const calcMax = (angle, a, b) => _angleBetween(angle, startAngle, endAngle, true) ? 1 : Math.max(a, a * cutout, b, b * cutout); const calcMin = (angle, a, b) => _angleBetween(angle, startAngle, endAngle, true) ? -1 : Math.min(a, a * cutout, b, b * cutout); const maxX = calcMax(0, startX, endX); const maxY = calcMax(HALF_PI, startY, endY); const minX = calcMin(PI, startX, endX); const minY = calcMin(PI + HALF_PI, startY, endY); ratioX = (maxX - minX) / 2; ratioY = (maxY - minY) / 2; offsetX = -(maxX + minX) / 2; offsetY = -(maxY + minY) / 2; }
                return { ratioX, ratioY, offsetX, offsetY };
        }
        class DoughnutController extends DatasetController {
                constructor(chart, datasetIndex) { super(chart, datasetIndex); this.enableOptionSharing = true; this.innerRadius = undefined; this.outerRadius = undefined; this.offsetX = undefined; this.offsetY = undefined; }
                linkScales() { }
                parse(start, count) {
                        const data = this.getDataset().data; const meta = this._cachedMeta; if (this._parsing === false) { meta._parsed = data; } else {
                                let getter = (i) => +data[i]; if (isObject(data[start])) { const { key = 'value' } = this._parsing; getter = (i) => +resolveObjectKey(data[i], key); }
                                let i, ilen; for (i = start, ilen = start + count; i < ilen; ++i) { meta._parsed[i] = getter(i); }
                        }
                }
                _getRotation() { return toRadians(this.options.rotation - 90); }
                _getCircumference() { return toRadians(this.options.circumference); }
                _getRotationExtents() {
                        let min = TAU; let max = -TAU; for (let i = 0; i < this.chart.data.datasets.length; ++i) { if (this.chart.isDatasetVisible(i)) { const controller = this.chart.getDatasetMeta(i).controller; const rotation = controller._getRotation(); const circumference = controller._getCircumference(); min = Math.min(min, rotation); max = Math.max(max, rotation + circumference); } }
                        return { rotation: min, circumference: max - min, };
                }
                update(mode) { const chart = this.chart; const { chartArea } = chart; const meta = this._cachedMeta; const arcs = meta.data; const spacing = this.getMaxBorderWidth() + this.getMaxOffset(arcs) + this.options.spacing; const maxSize = Math.max((Math.min(chartArea.width, chartArea.height) - spacing) / 2, 0); const cutout = Math.min(toPercentage(this.options.cutout, maxSize), 1); const chartWeight = this._getRingWeight(this.index); const { circumference, rotation } = this._getRotationExtents(); const { ratioX, ratioY, offsetX, offsetY } = getRatioAndOffset(rotation, circumference, cutout); const maxWidth = (chartArea.width - spacing) / ratioX; const maxHeight = (chartArea.height - spacing) / ratioY; const maxRadius = Math.max(Math.min(maxWidth, maxHeight) / 2, 0); const outerRadius = toDimension(this.options.radius, maxRadius); const innerRadius = Math.max(outerRadius * cutout, 0); const radiusLength = (outerRadius - innerRadius) / this._getVisibleDatasetWeightTotal(); this.offsetX = offsetX * outerRadius; this.offsetY = offsetY * outerRadius; meta.total = this.calculateTotal(); this.outerRadius = outerRadius - radiusLength * this._getRingWeightOffset(this.index); this.innerRadius = Math.max(this.outerRadius - radiusLength * chartWeight, 0); this.updateElements(arcs, 0, arcs.length, mode); }
                _circumference(i, reset) {
                        const opts = this.options; const meta = this._cachedMeta; const circumference = this._getCircumference(); if ((reset && opts.animation.animateRotate) || !this.chart.getDataVisibility(i) || meta._parsed[i] === null || meta.data[i].hidden) { return 0; }
                        return this.calculateCircumference(meta._parsed[i] * circumference / TAU);
                }
                updateElements(arcs, start, count, mode) {
                        const reset = mode === 'reset'; const chart = this.chart; const chartArea = chart.chartArea; const opts = chart.options; const animationOpts = opts.animation; const centerX = (chartArea.left + chartArea.right) / 2; const centerY = (chartArea.top + chartArea.bottom) / 2; const animateScale = reset && animationOpts.animateScale; const innerRadius = animateScale ? 0 : this.innerRadius; const outerRadius = animateScale ? 0 : this.outerRadius; const firstOpts = this.resolveDataElementOptions(start, mode); const sharedOptions = this.getSharedOptions(firstOpts); const includeOptions = this.includeOptions(mode, sharedOptions); let startAngle = this._getRotation(); let i; for (i = 0; i < start; ++i) { startAngle += this._circumference(i, reset); }
                        for (i = start; i < start + count; ++i) {
                                const circumference = this._circumference(i, reset); const arc = arcs[i]; const properties = { x: centerX + this.offsetX, y: centerY + this.offsetY, startAngle, endAngle: startAngle + circumference, circumference, outerRadius, innerRadius }; if (includeOptions) { properties.options = sharedOptions || this.resolveDataElementOptions(i, arc.active ? 'active' : mode); }
                                startAngle += circumference; this.updateElement(arc, i, properties, mode);
                        }
                        this.updateSharedOptions(sharedOptions, mode, firstOpts);
                }
                calculateTotal() {
                        const meta = this._cachedMeta; const metaData = meta.data; let total = 0; let i; for (i = 0; i < metaData.length; i++) { const value = meta._parsed[i]; if (value !== null && !isNaN(value) && this.chart.getDataVisibility(i) && !metaData[i].hidden) { total += Math.abs(value); } }
                        return total;
                }
                calculateCircumference(value) {
                        const total = this._cachedMeta.total; if (total > 0 && !isNaN(value)) { return TAU * (Math.abs(value) / total); }
                        return 0;
                }
                getLabelAndValue(index) { const meta = this._cachedMeta; const chart = this.chart; const labels = chart.data.labels || []; const value = formatNumber(meta._parsed[index], chart.options.locale); return { label: labels[index] || '', value, }; }
                getMaxBorderWidth(arcs) {
                        let max = 0; const chart = this.chart; let i, ilen, meta, controller, options; if (!arcs) { for (i = 0, ilen = chart.data.datasets.length; i < ilen; ++i) { if (chart.isDatasetVisible(i)) { meta = chart.getDatasetMeta(i); arcs = meta.data; controller = meta.controller; break; } } }
                        if (!arcs) { return 0; }
                        for (i = 0, ilen = arcs.length; i < ilen; ++i) { options = controller.resolveDataElementOptions(i); if (options.borderAlign !== 'inner') { max = Math.max(max, options.borderWidth || 0, options.hoverBorderWidth || 0); } }
                        return max;
                }
                getMaxOffset(arcs) {
                        let max = 0; for (let i = 0, ilen = arcs.length; i < ilen; ++i) { const options = this.resolveDataElementOptions(i); max = Math.max(max, options.offset || 0, options.hoverOffset || 0); }
                        return max;
                }
                _getRingWeightOffset(datasetIndex) {
                        let ringWeightOffset = 0; for (let i = 0; i < datasetIndex; ++i) { if (this.chart.isDatasetVisible(i)) { ringWeightOffset += this._getRingWeight(i); } }
                        return ringWeightOffset;
                }
                _getRingWeight(datasetIndex) { return Math.max(valueOrDefault(this.chart.data.datasets[datasetIndex].weight, 1), 0); }
                _getVisibleDatasetWeightTotal() { return this._getRingWeightOffset(this.chart.data.datasets.length) || 1; }
        }
        DoughnutController.id = 'doughnut'; DoughnutController.defaults = { datasetElementType: false, dataElementType: 'arc', animation: { animateRotate: true, animateScale: false }, animations: { numbers: { type: 'number', properties: ['circumference', 'endAngle', 'innerRadius', 'outerRadius', 'startAngle', 'x', 'y', 'offset', 'borderWidth', 'spacing'] }, }, cutout: '50%', rotation: 0, circumference: 360, radius: '100%', spacing: 0, indexAxis: 'r', }; DoughnutController.descriptors = { _scriptable: (name) => name !== 'spacing', _indexable: (name) => name !== 'spacing', }; DoughnutController.overrides = {
                aspectRatio: 1, plugins: {
                        legend: {
                                labels: {
                                        generateLabels(chart) {
                                                const data = chart.data; if (data.labels.length && data.datasets.length) { const { labels: { pointStyle } } = chart.legend.options; return data.labels.map((label, i) => { const meta = chart.getDatasetMeta(0); const style = meta.controller.getStyle(i); return { text: label, fillStyle: style.backgroundColor, strokeStyle: style.borderColor, lineWidth: style.borderWidth, pointStyle: pointStyle, hidden: !chart.getDataVisibility(i), index: i }; }); }
                                                return [];
                                        }
                                }, onClick(e, legendItem, legend) { legend.chart.toggleDataVisibility(legendItem.index); legend.chart.update(); }
                        }, tooltip: {
                                callbacks: {
                                        title() { return ''; }, label(tooltipItem) {
                                                let dataLabel = tooltipItem.label; const value = ': ' + tooltipItem.formattedValue; if (isArray(dataLabel)) { dataLabel = dataLabel.slice(); dataLabel[0] += value; } else { dataLabel += value; }
                                                return dataLabel;
                                        }
                                }
                        }
                }
        }; class LineController extends DatasetController {
                initialize() { this.enableOptionSharing = true; this.supportsDecimation = true; super.initialize(); }
                update(mode) {
                        const meta = this._cachedMeta; const { dataset: line, data: points = [], _dataset } = meta; const animationsDisabled = this.chart._animationsDisabled; let { start, count } = getStartAndCountOfVisiblePoints(meta, points, animationsDisabled); this._drawStart = start; this._drawCount = count; if (scaleRangesChanged(meta)) { start = 0; count = points.length; }
                        line._chart = this.chart; line._datasetIndex = this.index; line._decimated = !!_dataset._decimated; line.points = points; const options = this.resolveDatasetElementOptions(mode); if (!this.options.showLine) { options.borderWidth = 0; }
                        options.segment = this.options.segment; this.updateElement(line, undefined, { animated: !animationsDisabled, options }, mode); this.updateElements(points, start, count, mode);
                }
                updateElements(points, start, count, mode) {
                        const reset = mode === 'reset'; const { iScale, vScale, _stacked, _dataset } = this._cachedMeta; const firstOpts = this.resolveDataElementOptions(start, mode); const sharedOptions = this.getSharedOptions(firstOpts); const includeOptions = this.includeOptions(mode, sharedOptions); const iAxis = iScale.axis; const vAxis = vScale.axis; const { spanGaps, segment } = this.options; const maxGapLength = isNumber(spanGaps) ? spanGaps : Number.POSITIVE_INFINITY; const directUpdate = this.chart._animationsDisabled || reset || mode === 'none'; let prevParsed = start > 0 && this.getParsed(start - 1); for (let i = start; i < start + count; ++i) {
                                const point = points[i]; const parsed = this.getParsed(i); const properties = directUpdate ? point : {}; const nullData = isNullOrUndef(parsed[vAxis]); const iPixel = properties[iAxis] = iScale.getPixelForValue(parsed[iAxis], i); const vPixel = properties[vAxis] = reset || nullData ? vScale.getBasePixel() : vScale.getPixelForValue(_stacked ? this.applyStack(vScale, parsed, _stacked) : parsed[vAxis], i); properties.skip = isNaN(iPixel) || isNaN(vPixel) || nullData; properties.stop = i > 0 && (Math.abs(parsed[iAxis] - prevParsed[iAxis])) > maxGapLength; if (segment) { properties.parsed = parsed; properties.raw = _dataset.data[i]; }
                                if (includeOptions) { properties.options = sharedOptions || this.resolveDataElementOptions(i, point.active ? 'active' : mode); }
                                if (!directUpdate) { this.updateElement(point, i, properties, mode); }
                                prevParsed = parsed;
                        }
                        this.updateSharedOptions(sharedOptions, mode, firstOpts);
                }
                getMaxOverflow() {
                        const meta = this._cachedMeta; const dataset = meta.dataset; const border = dataset.options && dataset.options.borderWidth || 0; const data = meta.data || []; if (!data.length) { return border; }
                        const firstPoint = data[0].size(this.resolveDataElementOptions(0)); const lastPoint = data[data.length - 1].size(this.resolveDataElementOptions(data.length - 1)); return Math.max(border, firstPoint, lastPoint) / 2;
                }
                draw() { const meta = this._cachedMeta; meta.dataset.updateControlPoints(this.chart.chartArea, meta.iScale.axis); super.draw(); }
        }
        LineController.id = 'line'; LineController.defaults = { datasetElementType: 'line', dataElementType: 'point', showLine: true, spanGaps: false, }; LineController.overrides = { scales: { _index_: { type: 'category', }, _value_: { type: 'linear', }, } }; function getStartAndCountOfVisiblePoints(meta, points, animationsDisabled) {
                const pointCount = points.length; let start = 0; let count = pointCount; if (meta._sorted) {
                        const { iScale, _parsed } = meta; const axis = iScale.axis; const { min, max, minDefined, maxDefined } = iScale.getUserBounds(); if (minDefined) { start = _limitValue(Math.min(_lookupByKey(_parsed, iScale.axis, min).lo, animationsDisabled ? pointCount : _lookupByKey(points, axis, iScale.getPixelForValue(min)).lo), 0, pointCount - 1); }
                        if (maxDefined) { count = _limitValue(Math.max(_lookupByKey(_parsed, iScale.axis, max).hi + 1, animationsDisabled ? 0 : _lookupByKey(points, axis, iScale.getPixelForValue(max)).hi + 1), start, pointCount) - start; } else { count = pointCount - start; }
                }
                return { start, count };
        }
        function scaleRangesChanged(meta) {
                const { xScale, yScale, _scaleRanges } = meta; const newRanges = { xmin: xScale.min, xmax: xScale.max, ymin: yScale.min, ymax: yScale.max }; if (!_scaleRanges) { meta._scaleRanges = newRanges; return true; }
                const changed = _scaleRanges.xmin !== xScale.min || _scaleRanges.xmax !== xScale.max || _scaleRanges.ymin !== yScale.min || _scaleRanges.ymax !== yScale.max; Object.assign(_scaleRanges, newRanges); return changed;
        }
        class PolarAreaController extends DatasetController {
                constructor(chart, datasetIndex) { super(chart, datasetIndex); this.innerRadius = undefined; this.outerRadius = undefined; }
                getLabelAndValue(index) { const meta = this._cachedMeta; const chart = this.chart; const labels = chart.data.labels || []; const value = formatNumber(meta._parsed[index].r, chart.options.locale); return { label: labels[index] || '', value, }; }
                parseObjectData(meta, data, start, count) { return _parseObjectDataRadialScale.bind(this)(meta, data, start, count); }
                update(mode) { const arcs = this._cachedMeta.data; this._updateRadius(); this.updateElements(arcs, 0, arcs.length, mode); }
                getMinMax() {
                        const meta = this._cachedMeta; const range = { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY }; meta.data.forEach((element, index) => {
                                const parsed = this.getParsed(index).r; if (!isNaN(parsed) && this.chart.getDataVisibility(index)) {
                                        if (parsed < range.min) { range.min = parsed; }
                                        if (parsed > range.max) { range.max = parsed; }
                                }
                        }); return range;
                }
                _updateRadius() { const chart = this.chart; const chartArea = chart.chartArea; const opts = chart.options; const minSize = Math.min(chartArea.right - chartArea.left, chartArea.bottom - chartArea.top); const outerRadius = Math.max(minSize / 2, 0); const innerRadius = Math.max(opts.cutoutPercentage ? (outerRadius / 100) * (opts.cutoutPercentage) : 1, 0); const radiusLength = (outerRadius - innerRadius) / chart.getVisibleDatasetCount(); this.outerRadius = outerRadius - (radiusLength * this.index); this.innerRadius = this.outerRadius - radiusLength; }
                updateElements(arcs, start, count, mode) {
                        const reset = mode === 'reset'; const chart = this.chart; const opts = chart.options; const animationOpts = opts.animation; const scale = this._cachedMeta.rScale; const centerX = scale.xCenter; const centerY = scale.yCenter; const datasetStartAngle = scale.getIndexAngle(0) - 0.5 * PI; let angle = datasetStartAngle; let i; const defaultAngle = 360 / this.countVisibleElements(); for (i = 0; i < start; ++i) { angle += this._computeAngle(i, mode, defaultAngle); }
                        for (i = start; i < start + count; i++) {
                                const arc = arcs[i]; let startAngle = angle; let endAngle = angle + this._computeAngle(i, mode, defaultAngle); let outerRadius = chart.getDataVisibility(i) ? scale.getDistanceFromCenterForValue(this.getParsed(i).r) : 0; angle = endAngle; if (reset) {
                                        if (animationOpts.animateScale) { outerRadius = 0; }
                                        if (animationOpts.animateRotate) { startAngle = endAngle = datasetStartAngle; }
                                }
                                const properties = { x: centerX, y: centerY, innerRadius: 0, outerRadius, startAngle, endAngle, options: this.resolveDataElementOptions(i, arc.active ? 'active' : mode) }; this.updateElement(arc, i, properties, mode);
                        }
                }
                countVisibleElements() { const meta = this._cachedMeta; let count = 0; meta.data.forEach((element, index) => { if (!isNaN(this.getParsed(index).r) && this.chart.getDataVisibility(index)) { count++; } }); return count; }
                _computeAngle(index, mode, defaultAngle) { return this.chart.getDataVisibility(index) ? toRadians(this.resolveDataElementOptions(index, mode).angle || defaultAngle) : 0; }
        }
        PolarAreaController.id = 'polarArea'; PolarAreaController.defaults = { dataElementType: 'arc', animation: { animateRotate: true, animateScale: true }, animations: { numbers: { type: 'number', properties: ['x', 'y', 'startAngle', 'endAngle', 'innerRadius', 'outerRadius'] }, }, indexAxis: 'r', startAngle: 0, }; PolarAreaController.overrides = {
                aspectRatio: 1, plugins: {
                        legend: {
                                labels: {
                                        generateLabels(chart) {
                                                const data = chart.data; if (data.labels.length && data.datasets.length) { const { labels: { pointStyle } } = chart.legend.options; return data.labels.map((label, i) => { const meta = chart.getDatasetMeta(0); const style = meta.controller.getStyle(i); return { text: label, fillStyle: style.backgroundColor, strokeStyle: style.borderColor, lineWidth: style.borderWidth, pointStyle: pointStyle, hidden: !chart.getDataVisibility(i), index: i }; }); }
                                                return [];
                                        }
                                }, onClick(e, legendItem, legend) { legend.chart.toggleDataVisibility(legendItem.index); legend.chart.update(); }
                        }, tooltip: { callbacks: { title() { return ''; }, label(context) { return context.chart.data.labels[context.dataIndex] + ': ' + context.formattedValue; } } }
                }, scales: { r: { type: 'radialLinear', angleLines: { display: false }, beginAtZero: true, grid: { circular: true }, pointLabels: { display: false }, startAngle: 0 } }
        }; class PieController extends DoughnutController { }
        PieController.id = 'pie'; PieController.defaults = { cutout: 0, rotation: 0, circumference: 360, radius: '100%' }; class RadarController extends DatasetController {
                getLabelAndValue(index) { const vScale = this._cachedMeta.vScale; const parsed = this.getParsed(index); return { label: vScale.getLabels()[index], value: '' + vScale.getLabelForValue(parsed[vScale.axis]) }; }
                parseObjectData(meta, data, start, count) { return _parseObjectDataRadialScale.bind(this)(meta, data, start, count); }
                update(mode) {
                        const meta = this._cachedMeta; const line = meta.dataset; const points = meta.data || []; const labels = meta.iScale.getLabels(); line.points = points; if (mode !== 'resize') {
                                const options = this.resolveDatasetElementOptions(mode); if (!this.options.showLine) { options.borderWidth = 0; }
                                const properties = { _loop: true, _fullLoop: labels.length === points.length, options }; this.updateElement(line, undefined, properties, mode);
                        }
                        this.updateElements(points, 0, points.length, mode);
                }
                updateElements(points, start, count, mode) { const scale = this._cachedMeta.rScale; const reset = mode === 'reset'; for (let i = start; i < start + count; i++) { const point = points[i]; const options = this.resolveDataElementOptions(i, point.active ? 'active' : mode); const pointPosition = scale.getPointPositionForValue(i, this.getParsed(i).r); const x = reset ? scale.xCenter : pointPosition.x; const y = reset ? scale.yCenter : pointPosition.y; const properties = { x, y, angle: pointPosition.angle, skip: isNaN(x) || isNaN(y), options }; this.updateElement(point, i, properties, mode); } }
        }
        RadarController.id = 'radar'; RadarController.defaults = { datasetElementType: 'line', dataElementType: 'point', indexAxis: 'r', showLine: true, elements: { line: { fill: 'start' } }, }; RadarController.overrides = { aspectRatio: 1, scales: { r: { type: 'radialLinear', } } }; class ScatterController extends LineController { }
        ScatterController.id = 'scatter'; ScatterController.defaults = { showLine: false, fill: false }; ScatterController.overrides = { interaction: { mode: 'point' }, plugins: { tooltip: { callbacks: { title() { return ''; }, label(item) { return '(' + item.label + ', ' + item.formattedValue + ')'; } } } }, scales: { x: { type: 'linear' }, y: { type: 'linear' } } }; var controllers = Object.freeze({ __proto__: null, BarController: BarController, BubbleController: BubbleController, DoughnutController: DoughnutController, LineController: LineController, PolarAreaController: PolarAreaController, PieController: PieController, RadarController: RadarController, ScatterController: ScatterController }); function clipArc(ctx, element, endAngle) {
                const { startAngle, pixelMargin, x, y, outerRadius, innerRadius } = element; let angleMargin = pixelMargin / outerRadius; ctx.beginPath(); ctx.arc(x, y, outerRadius, startAngle - angleMargin, endAngle + angleMargin); if (innerRadius > pixelMargin) { angleMargin = pixelMargin / innerRadius; ctx.arc(x, y, innerRadius, endAngle + angleMargin, startAngle - angleMargin, true); } else { ctx.arc(x, y, pixelMargin, endAngle + HALF_PI, startAngle - HALF_PI); }
                ctx.closePath(); ctx.clip();
        }
        function toRadiusCorners(value) { return _readValueToProps(value, ['outerStart', 'outerEnd', 'innerStart', 'innerEnd']); }
        function parseBorderRadius$1(arc, innerRadius, outerRadius, angleDelta) { const o = toRadiusCorners(arc.options.borderRadius); const halfThickness = (outerRadius - innerRadius) / 2; const innerLimit = Math.min(halfThickness, angleDelta * innerRadius / 2); const computeOuterLimit = (val) => { const outerArcLimit = (outerRadius - Math.min(halfThickness, val)) * angleDelta / 2; return _limitValue(val, 0, Math.min(halfThickness, outerArcLimit)); }; return { outerStart: computeOuterLimit(o.outerStart), outerEnd: computeOuterLimit(o.outerEnd), innerStart: _limitValue(o.innerStart, 0, innerLimit), innerEnd: _limitValue(o.innerEnd, 0, innerLimit), }; }
        function rThetaToXY(r, theta, x, y) { return { x: x + r * Math.cos(theta), y: y + r * Math.sin(theta), }; }
        function pathArc(ctx, element, offset, spacing, end) {
                const { x, y, startAngle: start, pixelMargin, innerRadius: innerR } = element; const outerRadius = Math.max(element.outerRadius + spacing + offset - pixelMargin, 0); const innerRadius = innerR > 0 ? innerR + spacing + offset + pixelMargin : 0; let spacingOffset = 0; const alpha = end - start; if (spacing) { const noSpacingInnerRadius = innerR > 0 ? innerR - spacing : 0; const noSpacingOuterRadius = outerRadius > 0 ? outerRadius - spacing : 0; const avNogSpacingRadius = (noSpacingInnerRadius + noSpacingOuterRadius) / 2; const adjustedAngle = avNogSpacingRadius !== 0 ? (alpha * avNogSpacingRadius) / (avNogSpacingRadius + spacing) : alpha; spacingOffset = (alpha - adjustedAngle) / 2; }
                const beta = Math.max(0.001, alpha * outerRadius - offset / PI) / outerRadius; const angleOffset = (alpha - beta) / 2; const startAngle = start + angleOffset + spacingOffset; const endAngle = end - angleOffset - spacingOffset; const { outerStart, outerEnd, innerStart, innerEnd } = parseBorderRadius$1(element, innerRadius, outerRadius, endAngle - startAngle); const outerStartAdjustedRadius = outerRadius - outerStart; const outerEndAdjustedRadius = outerRadius - outerEnd; const outerStartAdjustedAngle = startAngle + outerStart / outerStartAdjustedRadius; const outerEndAdjustedAngle = endAngle - outerEnd / outerEndAdjustedRadius; const innerStartAdjustedRadius = innerRadius + innerStart; const innerEndAdjustedRadius = innerRadius + innerEnd; const innerStartAdjustedAngle = startAngle + innerStart / innerStartAdjustedRadius; const innerEndAdjustedAngle = endAngle - innerEnd / innerEndAdjustedRadius; ctx.beginPath(); ctx.arc(x, y, outerRadius, outerStartAdjustedAngle, outerEndAdjustedAngle); if (outerEnd > 0) { const pCenter = rThetaToXY(outerEndAdjustedRadius, outerEndAdjustedAngle, x, y); ctx.arc(pCenter.x, pCenter.y, outerEnd, outerEndAdjustedAngle, endAngle + HALF_PI); }
                const p4 = rThetaToXY(innerEndAdjustedRadius, endAngle, x, y); ctx.lineTo(p4.x, p4.y); if (innerEnd > 0) { const pCenter = rThetaToXY(innerEndAdjustedRadius, innerEndAdjustedAngle, x, y); ctx.arc(pCenter.x, pCenter.y, innerEnd, endAngle + HALF_PI, innerEndAdjustedAngle + Math.PI); }
                ctx.arc(x, y, innerRadius, endAngle - (innerEnd / innerRadius), startAngle + (innerStart / innerRadius), true); if (innerStart > 0) { const pCenter = rThetaToXY(innerStartAdjustedRadius, innerStartAdjustedAngle, x, y); ctx.arc(pCenter.x, pCenter.y, innerStart, innerStartAdjustedAngle + Math.PI, startAngle - HALF_PI); }
                const p8 = rThetaToXY(outerStartAdjustedRadius, startAngle, x, y); ctx.lineTo(p8.x, p8.y); if (outerStart > 0) { const pCenter = rThetaToXY(outerStartAdjustedRadius, outerStartAdjustedAngle, x, y); ctx.arc(pCenter.x, pCenter.y, outerStart, startAngle - HALF_PI, outerStartAdjustedAngle); }
                ctx.closePath();
        }
        function drawArc(ctx, element, offset, spacing) {
                const { fullCircles, startAngle, circumference } = element; let endAngle = element.endAngle; if (fullCircles) {
                        pathArc(ctx, element, offset, spacing, startAngle + TAU); for (let i = 0; i < fullCircles; ++i) { ctx.fill(); }
                        if (!isNaN(circumference)) { endAngle = startAngle + circumference % TAU; if (circumference % TAU === 0) { endAngle += TAU; } }
                }
                pathArc(ctx, element, offset, spacing, endAngle); ctx.fill(); return endAngle;
        }
        function drawFullCircleBorders(ctx, element, inner) {
                const { x, y, startAngle, pixelMargin, fullCircles } = element; const outerRadius = Math.max(element.outerRadius - pixelMargin, 0); const innerRadius = element.innerRadius + pixelMargin; let i; if (inner) { clipArc(ctx, element, startAngle + TAU); }
                ctx.beginPath(); ctx.arc(x, y, innerRadius, startAngle + TAU, startAngle, true); for (i = 0; i < fullCircles; ++i) { ctx.stroke(); }
                ctx.beginPath(); ctx.arc(x, y, outerRadius, startAngle, startAngle + TAU); for (i = 0; i < fullCircles; ++i) { ctx.stroke(); }
        }
        function drawBorder(ctx, element, offset, spacing, endAngle) {
                const { options } = element; const { borderWidth, borderJoinStyle } = options; const inner = options.borderAlign === 'inner'; if (!borderWidth) { return; }
                if (inner) { ctx.lineWidth = borderWidth * 2; ctx.lineJoin = borderJoinStyle || 'round'; } else { ctx.lineWidth = borderWidth; ctx.lineJoin = borderJoinStyle || 'bevel'; }
                if (element.fullCircles) { drawFullCircleBorders(ctx, element, inner); }
                if (inner) { clipArc(ctx, element, endAngle); }
                pathArc(ctx, element, offset, spacing, endAngle); ctx.stroke();
        }
        class ArcElement extends Element {
                constructor(cfg) { super(); this.options = undefined; this.circumference = undefined; this.startAngle = undefined; this.endAngle = undefined; this.innerRadius = undefined; this.outerRadius = undefined; this.pixelMargin = 0; this.fullCircles = 0; if (cfg) { Object.assign(this, cfg); } }
                inRange(chartX, chartY, useFinalPosition) { const point = this.getProps(['x', 'y'], useFinalPosition); const { angle, distance } = getAngleFromPoint(point, { x: chartX, y: chartY }); const { startAngle, endAngle, innerRadius, outerRadius, circumference } = this.getProps(['startAngle', 'endAngle', 'innerRadius', 'outerRadius', 'circumference'], useFinalPosition); const rAdjust = this.options.spacing / 2; const _circumference = valueOrDefault(circumference, endAngle - startAngle); const betweenAngles = _circumference >= TAU || _angleBetween(angle, startAngle, endAngle); const withinRadius = _isBetween(distance, innerRadius + rAdjust, outerRadius + rAdjust); return (betweenAngles && withinRadius); }
                getCenterPoint(useFinalPosition) { const { x, y, startAngle, endAngle, innerRadius, outerRadius } = this.getProps(['x', 'y', 'startAngle', 'endAngle', 'innerRadius', 'outerRadius', 'circumference',], useFinalPosition); const { offset, spacing } = this.options; const halfAngle = (startAngle + endAngle) / 2; const halfRadius = (innerRadius + outerRadius + spacing + offset) / 2; return { x: x + Math.cos(halfAngle) * halfRadius, y: y + Math.sin(halfAngle) * halfRadius }; }
                tooltipPosition(useFinalPosition) { return this.getCenterPoint(useFinalPosition); }
                draw(ctx) {
                        const { options, circumference } = this; const offset = (options.offset || 0) / 2; const spacing = (options.spacing || 0) / 2; this.pixelMargin = (options.borderAlign === 'inner') ? 0.33 : 0; this.fullCircles = circumference > TAU ? Math.floor(circumference / TAU) : 0; if (circumference === 0 || this.innerRadius < 0 || this.outerRadius < 0) { return; }
                        ctx.save(); let radiusOffset = 0; if (offset) { radiusOffset = offset / 2; const halfAngle = (this.startAngle + this.endAngle) / 2; ctx.translate(Math.cos(halfAngle) * radiusOffset, Math.sin(halfAngle) * radiusOffset); if (this.circumference >= PI) { radiusOffset = offset; } }
                        ctx.fillStyle = options.backgroundColor; ctx.strokeStyle = options.borderColor; const endAngle = drawArc(ctx, this, radiusOffset, spacing); drawBorder(ctx, this, radiusOffset, spacing, endAngle); ctx.restore();
                }
        }
        ArcElement.id = 'arc'; ArcElement.defaults = { borderAlign: 'center', borderColor: '#fff', borderJoinStyle: undefined, borderRadius: 0, borderWidth: 2, offset: 0, spacing: 0, angle: undefined, }; ArcElement.defaultRoutes = { backgroundColor: 'backgroundColor' }; function setStyle(ctx, options, style = options) { ctx.lineCap = valueOrDefault(style.borderCapStyle, options.borderCapStyle); ctx.setLineDash(valueOrDefault(style.borderDash, options.borderDash)); ctx.lineDashOffset = valueOrDefault(style.borderDashOffset, options.borderDashOffset); ctx.lineJoin = valueOrDefault(style.borderJoinStyle, options.borderJoinStyle); ctx.lineWidth = valueOrDefault(style.borderWidth, options.borderWidth); ctx.strokeStyle = valueOrDefault(style.borderColor, options.borderColor); }
        function lineTo(ctx, previous, target) { ctx.lineTo(target.x, target.y); }
        function getLineMethod(options) {
                if (options.stepped) { return _steppedLineTo; }
                if (options.tension || options.cubicInterpolationMode === 'monotone') { return _bezierCurveTo; }
                return lineTo;
        }
        function pathVars(points, segment, params = {}) { const count = points.length; const { start: paramsStart = 0, end: paramsEnd = count - 1 } = params; const { start: segmentStart, end: segmentEnd } = segment; const start = Math.max(paramsStart, segmentStart); const end = Math.min(paramsEnd, segmentEnd); const outside = paramsStart < segmentStart && paramsEnd < segmentStart || paramsStart > segmentEnd && paramsEnd > segmentEnd; return { count, start, loop: segment.loop, ilen: end < start && !outside ? count + end - start : end - start }; }
        function pathSegment(ctx, line, segment, params) {
                const { points, options } = line; const { count, start, loop, ilen } = pathVars(points, segment, params); const lineMethod = getLineMethod(options); let { move = true, reverse } = params || {}; let i, point, prev; for (i = 0; i <= ilen; ++i) {
                        point = points[(start + (reverse ? ilen - i : i)) % count]; if (point.skip) { continue; } else if (move) { ctx.moveTo(point.x, point.y); move = false; } else { lineMethod(ctx, prev, point, reverse, options.stepped); }
                        prev = point;
                }
                if (loop) { point = points[(start + (reverse ? ilen : 0)) % count]; lineMethod(ctx, prev, point, reverse, options.stepped); }
                return !!loop;
        }
        function fastPathSegment(ctx, line, segment, params) {
                const points = line.points; const { count, start, ilen } = pathVars(points, segment, params); const { move = true, reverse } = params || {}; let avgX = 0; let countX = 0; let i, point, prevX, minY, maxY, lastY; const pointIndex = (index) => (start + (reverse ? ilen - index : index)) % count; const drawX = () => { if (minY !== maxY) { ctx.lineTo(avgX, maxY); ctx.lineTo(avgX, minY); ctx.lineTo(avgX, lastY); } }; if (move) { point = points[pointIndex(0)]; ctx.moveTo(point.x, point.y); }
                for (i = 0; i <= ilen; ++i) {
                        point = points[pointIndex(i)]; if (point.skip) { continue; }
                        const x = point.x; const y = point.y; const truncX = x | 0; if (truncX === prevX) {
                                if (y < minY) { minY = y; } else if (y > maxY) { maxY = y; }
                                avgX = (countX * avgX + x) / ++countX;
                        } else { drawX(); ctx.lineTo(x, y); prevX = truncX; countX = 0; minY = maxY = y; }
                        lastY = y;
                }
                drawX();
        }
        function _getSegmentMethod(line) { const opts = line.options; const borderDash = opts.borderDash && opts.borderDash.length; const useFastPath = !line._decimated && !line._loop && !opts.tension && opts.cubicInterpolationMode !== 'monotone' && !opts.stepped && !borderDash; return useFastPath ? fastPathSegment : pathSegment; }
        function _getInterpolationMethod(options) {
                if (options.stepped) { return _steppedInterpolation; }
                if (options.tension || options.cubicInterpolationMode === 'monotone') { return _bezierInterpolation; }
                return _pointInLine;
        }
        function strokePathWithCache(ctx, line, start, count) {
                let path = line._path; if (!path) { path = line._path = new Path2D(); if (line.path(path, start, count)) { path.closePath(); } }
                setStyle(ctx, line.options); ctx.stroke(path);
        }
        function strokePathDirect(ctx, line, start, count) {
                const { segments, options } = line; const segmentMethod = _getSegmentMethod(line); for (const segment of segments) {
                        setStyle(ctx, options, segment.style); ctx.beginPath(); if (segmentMethod(ctx, line, segment, { start, end: start + count - 1 })) { ctx.closePath(); }
                        ctx.stroke();
                }
        }
        const usePath2D = typeof Path2D === 'function'; function draw(ctx, line, start, count) { if (usePath2D && !line.options.segment) { strokePathWithCache(ctx, line, start, count); } else { strokePathDirect(ctx, line, start, count); } }
        class LineElement extends Element {
                constructor(cfg) { super(); this.animated = true; this.options = undefined; this._chart = undefined; this._loop = undefined; this._fullLoop = undefined; this._path = undefined; this._points = undefined; this._segments = undefined; this._decimated = false; this._pointsUpdated = false; this._datasetIndex = undefined; if (cfg) { Object.assign(this, cfg); } }
                updateControlPoints(chartArea, indexAxis) { const options = this.options; if ((options.tension || options.cubicInterpolationMode === 'monotone') && !options.stepped && !this._pointsUpdated) { const loop = options.spanGaps ? this._loop : this._fullLoop; _updateBezierControlPoints(this._points, options, chartArea, loop, indexAxis); this._pointsUpdated = true; } }
                set points(points) { this._points = points; delete this._segments; delete this._path; this._pointsUpdated = false; }
                get points() { return this._points; }
                get segments() { return this._segments || (this._segments = _computeSegments(this, this.options.segment)); }
                first() { const segments = this.segments; const points = this.points; return segments.length && points[segments[0].start]; }
                last() { const segments = this.segments; const points = this.points; const count = segments.length; return count && points[segments[count - 1].end]; }
                interpolate(point, property) {
                        const options = this.options; const value = point[property]; const points = this.points; const segments = _boundSegments(this, { property, start: value, end: value }); if (!segments.length) { return; }
                        const result = []; const _interpolate = _getInterpolationMethod(options); let i, ilen; for (i = 0, ilen = segments.length; i < ilen; ++i) {
                                const { start, end } = segments[i]; const p1 = points[start]; const p2 = points[end]; if (p1 === p2) { result.push(p1); continue; }
                                const t = Math.abs((value - p1[property]) / (p2[property] - p1[property])); const interpolated = _interpolate(p1, p2, t, options.stepped); interpolated[property] = point[property]; result.push(interpolated);
                        }
                        return result.length === 1 ? result[0] : result;
                }
                pathSegment(ctx, segment, params) { const segmentMethod = _getSegmentMethod(this); return segmentMethod(ctx, this, segment, params); }
                path(ctx, start, count) {
                        const segments = this.segments; const segmentMethod = _getSegmentMethod(this); let loop = this._loop; start = start || 0; count = count || (this.points.length - start); for (const segment of segments) { loop &= segmentMethod(ctx, this, segment, { start, end: start + count - 1 }); }
                        return !!loop;
                }
                draw(ctx, chartArea, start, count) {
                        const options = this.options || {}; const points = this.points || []; if (points.length && options.borderWidth) { ctx.save(); draw(ctx, this, start, count); ctx.restore(); }
                        if (this.animated) { this._pointsUpdated = false; this._path = undefined; }
                }
        }
        LineElement.id = 'line'; LineElement.defaults = { borderCapStyle: 'butt', borderDash: [], borderDashOffset: 0, borderJoinStyle: 'miter', borderWidth: 3, capBezierPoints: true, cubicInterpolationMode: 'default', fill: false, spanGaps: false, stepped: false, tension: 0, }; LineElement.defaultRoutes = { backgroundColor: 'backgroundColor', borderColor: 'borderColor' }; LineElement.descriptors = { _scriptable: true, _indexable: (name) => name !== 'borderDash' && name !== 'fill', }; function inRange$1(el, pos, axis, useFinalPosition) { const options = el.options; const { [axis]: value } = el.getProps([axis], useFinalPosition); return (Math.abs(pos - value) < options.radius + options.hitRadius); }
        class PointElement extends Element {
                constructor(cfg) { super(); this.options = undefined; this.parsed = undefined; this.skip = undefined; this.stop = undefined; if (cfg) { Object.assign(this, cfg); } }
                inRange(mouseX, mouseY, useFinalPosition) { const options = this.options; const { x, y } = this.getProps(['x', 'y'], useFinalPosition); return ((Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2)) < Math.pow(options.hitRadius + options.radius, 2)); }
                inXRange(mouseX, useFinalPosition) { return inRange$1(this, mouseX, 'x', useFinalPosition); }
                inYRange(mouseY, useFinalPosition) { return inRange$1(this, mouseY, 'y', useFinalPosition); }
                getCenterPoint(useFinalPosition) { const { x, y } = this.getProps(['x', 'y'], useFinalPosition); return { x, y }; }
                size(options) { options = options || this.options || {}; let radius = options.radius || 0; radius = Math.max(radius, radius && options.hoverRadius || 0); const borderWidth = radius && options.borderWidth || 0; return (radius + borderWidth) * 2; }
                draw(ctx, area) {
                        const options = this.options; if (this.skip || options.radius < 0.1 || !_isPointInArea(this, area, this.size(options) / 2)) { return; }
                        ctx.strokeStyle = options.borderColor; ctx.lineWidth = options.borderWidth; ctx.fillStyle = options.backgroundColor; drawPoint(ctx, options, this.x, this.y);
                }
                getRange() { const options = this.options || {}; return options.radius + options.hitRadius; }
        }
        PointElement.id = 'point'; PointElement.defaults = { borderWidth: 1, hitRadius: 1, hoverBorderWidth: 1, hoverRadius: 4, pointStyle: 'circle', radius: 3, rotation: 0 }; PointElement.defaultRoutes = { backgroundColor: 'backgroundColor', borderColor: 'borderColor' }; function getBarBounds(bar, useFinalPosition) {
                const { x, y, base, width, height } = bar.getProps(['x', 'y', 'base', 'width', 'height'], useFinalPosition); let left, right, top, bottom, half; if (bar.horizontal) { half = height / 2; left = Math.min(x, base); right = Math.max(x, base); top = y - half; bottom = y + half; } else { half = width / 2; left = x - half; right = x + half; top = Math.min(y, base); bottom = Math.max(y, base); }
                return { left, top, right, bottom };
        }
        function skipOrLimit(skip, value, min, max) { return skip ? 0 : _limitValue(value, min, max); }
        function parseBorderWidth(bar, maxW, maxH) { const value = bar.options.borderWidth; const skip = bar.borderSkipped; const o = toTRBL(value); return { t: skipOrLimit(skip.top, o.top, 0, maxH), r: skipOrLimit(skip.right, o.right, 0, maxW), b: skipOrLimit(skip.bottom, o.bottom, 0, maxH), l: skipOrLimit(skip.left, o.left, 0, maxW) }; }
        function parseBorderRadius(bar, maxW, maxH) { const { enableBorderRadius } = bar.getProps(['enableBorderRadius']); const value = bar.options.borderRadius; const o = toTRBLCorners(value); const maxR = Math.min(maxW, maxH); const skip = bar.borderSkipped; const enableBorder = enableBorderRadius || isObject(value); return { topLeft: skipOrLimit(!enableBorder || skip.top || skip.left, o.topLeft, 0, maxR), topRight: skipOrLimit(!enableBorder || skip.top || skip.right, o.topRight, 0, maxR), bottomLeft: skipOrLimit(!enableBorder || skip.bottom || skip.left, o.bottomLeft, 0, maxR), bottomRight: skipOrLimit(!enableBorder || skip.bottom || skip.right, o.bottomRight, 0, maxR) }; }
        function boundingRects(bar) { const bounds = getBarBounds(bar); const width = bounds.right - bounds.left; const height = bounds.bottom - bounds.top; const border = parseBorderWidth(bar, width / 2, height / 2); const radius = parseBorderRadius(bar, width / 2, height / 2); return { outer: { x: bounds.left, y: bounds.top, w: width, h: height, radius }, inner: { x: bounds.left + border.l, y: bounds.top + border.t, w: width - border.l - border.r, h: height - border.t - border.b, radius: { topLeft: Math.max(0, radius.topLeft - Math.max(border.t, border.l)), topRight: Math.max(0, radius.topRight - Math.max(border.t, border.r)), bottomLeft: Math.max(0, radius.bottomLeft - Math.max(border.b, border.l)), bottomRight: Math.max(0, radius.bottomRight - Math.max(border.b, border.r)), } } }; }
        function inRange(bar, x, y, useFinalPosition) { const skipX = x === null; const skipY = y === null; const skipBoth = skipX && skipY; const bounds = bar && !skipBoth && getBarBounds(bar, useFinalPosition); return bounds && (skipX || _isBetween(x, bounds.left, bounds.right)) && (skipY || _isBetween(y, bounds.top, bounds.bottom)); }
        function hasRadius(radius) { return radius.topLeft || radius.topRight || radius.bottomLeft || radius.bottomRight; }
        function addNormalRectPath(ctx, rect) { ctx.rect(rect.x, rect.y, rect.w, rect.h); }
        function inflateRect(rect, amount, refRect = {}) { const x = rect.x !== refRect.x ? -amount : 0; const y = rect.y !== refRect.y ? -amount : 0; const w = (rect.x + rect.w !== refRect.x + refRect.w ? amount : 0) - x; const h = (rect.y + rect.h !== refRect.y + refRect.h ? amount : 0) - y; return { x: rect.x + x, y: rect.y + y, w: rect.w + w, h: rect.h + h, radius: rect.radius }; }
        class BarElement extends Element {
                constructor(cfg) { super(); this.options = undefined; this.horizontal = undefined; this.base = undefined; this.width = undefined; this.height = undefined; this.inflateAmount = undefined; if (cfg) { Object.assign(this, cfg); } }
                draw(ctx) {
                        const { inflateAmount, options: { borderColor, backgroundColor } } = this; const { inner, outer } = boundingRects(this); const addRectPath = hasRadius(outer.radius) ? addRoundedRectPath : addNormalRectPath; ctx.save(); if (outer.w !== inner.w || outer.h !== inner.h) { ctx.beginPath(); addRectPath(ctx, inflateRect(outer, inflateAmount, inner)); ctx.clip(); addRectPath(ctx, inflateRect(inner, -inflateAmount, outer)); ctx.fillStyle = borderColor; ctx.fill('evenodd'); }
                        ctx.beginPath(); addRectPath(ctx, inflateRect(inner, inflateAmount)); ctx.fillStyle = backgroundColor; ctx.fill(); ctx.restore();
                }
                inRange(mouseX, mouseY, useFinalPosition) { return inRange(this, mouseX, mouseY, useFinalPosition); }
                inXRange(mouseX, useFinalPosition) { return inRange(this, mouseX, null, useFinalPosition); }
                inYRange(mouseY, useFinalPosition) { return inRange(this, null, mouseY, useFinalPosition); }
                getCenterPoint(useFinalPosition) { const { x, y, base, horizontal } = this.getProps(['x', 'y', 'base', 'horizontal'], useFinalPosition); return { x: horizontal ? (x + base) / 2 : x, y: horizontal ? y : (y + base) / 2 }; }
                getRange(axis) { return axis === 'x' ? this.width / 2 : this.height / 2; }
        }
        BarElement.id = 'bar'; BarElement.defaults = { borderSkipped: 'start', borderWidth: 0, borderRadius: 0, inflateAmount: 'auto', pointStyle: undefined }; BarElement.defaultRoutes = { backgroundColor: 'backgroundColor', borderColor: 'borderColor' }; var elements = Object.freeze({ __proto__: null, ArcElement: ArcElement, LineElement: LineElement, PointElement: PointElement, BarElement: BarElement }); function lttbDecimation(data, start, count, availableWidth, options) {
                const samples = options.samples || availableWidth; if (samples >= count) { return data.slice(start, start + count); }
                const decimated = []; const bucketWidth = (count - 2) / (samples - 2); let sampledIndex = 0; const endIndex = start + count - 1; let a = start; let i, maxAreaPoint, maxArea, area, nextA; decimated[sampledIndex++] = data[a]; for (i = 0; i < samples - 2; i++) {
                        let avgX = 0; let avgY = 0; let j; const avgRangeStart = Math.floor((i + 1) * bucketWidth) + 1 + start; const avgRangeEnd = Math.min(Math.floor((i + 2) * bucketWidth) + 1, count) + start; const avgRangeLength = avgRangeEnd - avgRangeStart; for (j = avgRangeStart; j < avgRangeEnd; j++) { avgX += data[j].x; avgY += data[j].y; }
                        avgX /= avgRangeLength; avgY /= avgRangeLength; const rangeOffs = Math.floor(i * bucketWidth) + 1 + start; const rangeTo = Math.min(Math.floor((i + 1) * bucketWidth) + 1, count) + start; const { x: pointAx, y: pointAy } = data[a]; maxArea = area = -1; for (j = rangeOffs; j < rangeTo; j++) {
                                area = 0.5 * Math.abs((pointAx - avgX) * (data[j].y - pointAy) -
                                        (pointAx - data[j].x) * (avgY - pointAy)); if (area > maxArea) { maxArea = area; maxAreaPoint = data[j]; nextA = j; }
                        }
                        decimated[sampledIndex++] = maxAreaPoint; a = nextA;
                }
                decimated[sampledIndex++] = data[endIndex]; return decimated;
        }
        function minMaxDecimation(data, start, count, availableWidth) {
                let avgX = 0; let countX = 0; let i, point, x, y, prevX, minIndex, maxIndex, startIndex, minY, maxY; const decimated = []; const endIndex = start + count - 1; const xMin = data[start].x; const xMax = data[endIndex].x; const dx = xMax - xMin; for (i = start; i < start + count; ++i) {
                        point = data[i]; x = (point.x - xMin) / dx * availableWidth; y = point.y; const truncX = x | 0; if (truncX === prevX) {
                                if (y < minY) { minY = y; minIndex = i; } else if (y > maxY) { maxY = y; maxIndex = i; }
                                avgX = (countX * avgX + point.x) / ++countX;
                        } else {
                                const lastIndex = i - 1; if (!isNullOrUndef(minIndex) && !isNullOrUndef(maxIndex)) {
                                        const intermediateIndex1 = Math.min(minIndex, maxIndex); const intermediateIndex2 = Math.max(minIndex, maxIndex); if (intermediateIndex1 !== startIndex && intermediateIndex1 !== lastIndex) { decimated.push({ ...data[intermediateIndex1], x: avgX, }); }
                                        if (intermediateIndex2 !== startIndex && intermediateIndex2 !== lastIndex) { decimated.push({ ...data[intermediateIndex2], x: avgX }); }
                                }
                                if (i > 0 && lastIndex !== startIndex) { decimated.push(data[lastIndex]); }
                                decimated.push(point); prevX = truncX; countX = 0; minY = maxY = y; minIndex = maxIndex = startIndex = i;
                        }
                }
                return decimated;
        }
        function cleanDecimatedDataset(dataset) { if (dataset._decimated) { const data = dataset._data; delete dataset._decimated; delete dataset._data; Object.defineProperty(dataset, 'data', { value: data }); } }
        function cleanDecimatedData(chart) { chart.data.datasets.forEach((dataset) => { cleanDecimatedDataset(dataset); }); }
        function getStartAndCountOfVisiblePointsSimplified(meta, points) {
                const pointCount = points.length; let start = 0; let count; const { iScale } = meta; const { min, max, minDefined, maxDefined } = iScale.getUserBounds(); if (minDefined) { start = _limitValue(_lookupByKey(points, iScale.axis, min).lo, 0, pointCount - 1); }
                if (maxDefined) { count = _limitValue(_lookupByKey(points, iScale.axis, max).hi + 1, start, pointCount) - start; } else { count = pointCount - start; }
                return { start, count };
        }
        var plugin_decimation = {
                id: 'decimation', defaults: { algorithm: 'min-max', enabled: false, }, beforeElementsUpdate: (chart, args, options) => {
                        if (!options.enabled) { cleanDecimatedData(chart); return; }
                        const availableWidth = chart.width; chart.data.datasets.forEach((dataset, datasetIndex) => {
                                const { _data, indexAxis } = dataset; const meta = chart.getDatasetMeta(datasetIndex); const data = _data || dataset.data; if (resolve([indexAxis, chart.options.indexAxis]) === 'y') { return; }
                                if (!meta.controller.supportsDecimation) { return; }
                                const xAxis = chart.scales[meta.xAxisID]; if (xAxis.type !== 'linear' && xAxis.type !== 'time') { return; }
                                if (chart.options.parsing) { return; }
                                let { start, count } = getStartAndCountOfVisiblePointsSimplified(meta, data); const threshold = options.threshold || 4 * availableWidth; if (count <= threshold) { cleanDecimatedDataset(dataset); return; }
                                if (isNullOrUndef(_data)) { dataset._data = data; delete dataset.data; Object.defineProperty(dataset, 'data', { configurable: true, enumerable: true, get: function () { return this._decimated; }, set: function (d) { this._data = d; } }); }
                                let decimated; switch (options.algorithm) { case 'lttb': decimated = lttbDecimation(data, start, count, availableWidth, options); break; case 'min-max': decimated = minMaxDecimation(data, start, count, availableWidth); break; default: throw new Error(`Unsupported decimation algorithm '${options.algorithm}'`); }
                                dataset._decimated = decimated;
                        });
                }, destroy(chart) { cleanDecimatedData(chart); }
        }; function _segments(line, target, property) {
                const segments = line.segments; const points = line.points; const tpoints = target.points; const parts = []; for (const segment of segments) {
                        let { start, end } = segment; end = _findSegmentEnd(start, end, points); const bounds = _getBounds(property, points[start], points[end], segment.loop); if (!target.segments) { parts.push({ source: segment, target: bounds, start: points[start], end: points[end] }); continue; }
                        const targetSegments = _boundSegments(target, bounds); for (const tgt of targetSegments) { const subBounds = _getBounds(property, tpoints[tgt.start], tpoints[tgt.end], tgt.loop); const fillSources = _boundSegment(segment, points, subBounds); for (const fillSource of fillSources) { parts.push({ source: fillSource, target: tgt, start: { [property]: _getEdge(bounds, subBounds, 'start', Math.max) }, end: { [property]: _getEdge(bounds, subBounds, 'end', Math.min) } }); } }
                }
                return parts;
        }
        function _getBounds(property, first, last, loop) {
                if (loop) { return; }
                let start = first[property]; let end = last[property]; if (property === 'angle') { start = _normalizeAngle(start); end = _normalizeAngle(end); }
                return { property, start, end };
        }
        function _pointsFromSegments(boundary, line) { const { x = null, y = null } = boundary || {}; const linePoints = line.points; const points = []; line.segments.forEach(({ start, end }) => { end = _findSegmentEnd(start, end, linePoints); const first = linePoints[start]; const last = linePoints[end]; if (y !== null) { points.push({ x: first.x, y }); points.push({ x: last.x, y }); } else if (x !== null) { points.push({ x, y: first.y }); points.push({ x, y: last.y }); } }); return points; }
        function _findSegmentEnd(start, end, points) {
                for (; end > start; end--) { const point = points[end]; if (!isNaN(point.x) && !isNaN(point.y)) { break; } }
                return end;
        }
        function _getEdge(a, b, prop, fn) {
                if (a && b) { return fn(a[prop], b[prop]); }
                return a ? a[prop] : b ? b[prop] : 0;
        }
        function _createBoundaryLine(boundary, line) {
                let points = []; let _loop = false; if (isArray(boundary)) { _loop = true; points = boundary; } else { points = _pointsFromSegments(boundary, line); }
                return points.length ? new LineElement({ points, options: { tension: 0 }, _loop, _fullLoop: _loop }) : null;
        }
        function _resolveTarget(sources, index, propagate) {
                const source = sources[index]; let fill = source.fill; const visited = [index]; let target; if (!propagate) { return fill; }
                while (fill !== false && visited.indexOf(fill) === -1) {
                        if (!isNumberFinite(fill)) { return fill; }
                        target = sources[fill]; if (!target) { return false; }
                        if (target.visible) { return fill; }
                        visited.push(fill); fill = target.fill;
                }
                return false;
        }
        function _decodeFill(line, index, count) {
                const fill = parseFillOption(line); if (isObject(fill)) { return isNaN(fill.value) ? false : fill; }
                let target = parseFloat(fill); if (isNumberFinite(target) && Math.floor(target) === target) { return decodeTargetIndex(fill[0], index, target, count); }
                return ['origin', 'start', 'end', 'stack', 'shape'].indexOf(fill) >= 0 && fill;
        }
        function decodeTargetIndex(firstCh, index, target, count) {
                if (firstCh === '-' || firstCh === '+') { target = index + target; }
                if (target === index || target < 0 || target >= count) { return false; }
                return target;
        }
        function _getTargetPixel(fill, scale) {
                let pixel = null; if (fill === 'start') { pixel = scale.bottom; } else if (fill === 'end') { pixel = scale.top; } else if (isObject(fill)) { pixel = scale.getPixelForValue(fill.value); } else if (scale.getBasePixel) { pixel = scale.getBasePixel(); }
                return pixel;
        }
        function _getTargetValue(fill, scale, startValue) {
                let value; if (fill === 'start') { value = startValue; } else if (fill === 'end') { value = scale.options.reverse ? scale.min : scale.max; } else if (isObject(fill)) { value = fill.value; } else { value = scale.getBaseValue(); }
                return value;
        }
        function parseFillOption(line) {
                const options = line.options; const fillOption = options.fill; let fill = valueOrDefault(fillOption && fillOption.target, fillOption); if (fill === undefined) { fill = !!options.backgroundColor; }
                if (fill === false || fill === null) { return false; }
                if (fill === true) { return 'origin'; }
                return fill;
        }
        function _buildStackLine(source) {
                const { scale, index, line } = source; const points = []; const segments = line.segments; const sourcePoints = line.points; const linesBelow = getLinesBelow(scale, index); linesBelow.push(_createBoundaryLine({ x: null, y: scale.bottom }, line)); for (let i = 0; i < segments.length; i++) { const segment = segments[i]; for (let j = segment.start; j <= segment.end; j++) { addPointsBelow(points, sourcePoints[j], linesBelow); } }
                return new LineElement({ points, options: {} });
        }
        function getLinesBelow(scale, index) {
                const below = []; const metas = scale.getMatchingVisibleMetas('line'); for (let i = 0; i < metas.length; i++) {
                        const meta = metas[i]; if (meta.index === index) { break; }
                        if (!meta.hidden) { below.unshift(meta.dataset); }
                }
                return below;
        }
        function addPointsBelow(points, sourcePoint, linesBelow) {
                const postponed = []; for (let j = 0; j < linesBelow.length; j++) {
                        const line = linesBelow[j]; const { first, last, point } = findPoint(line, sourcePoint, 'x'); if (!point || (first && last)) { continue; }
                        if (first) { postponed.unshift(point); } else { points.push(point); if (!last) { break; } }
                }
                points.push(...postponed);
        }
        function findPoint(line, sourcePoint, property) {
                const point = line.interpolate(sourcePoint, property); if (!point) { return {}; }
                const pointValue = point[property]; const segments = line.segments; const linePoints = line.points; let first = false; let last = false; for (let i = 0; i < segments.length; i++) { const segment = segments[i]; const firstValue = linePoints[segment.start][property]; const lastValue = linePoints[segment.end][property]; if (_isBetween(pointValue, firstValue, lastValue)) { first = pointValue === firstValue; last = pointValue === lastValue; break; } }
                return { first, last, point };
        }
        class simpleArc {
                constructor(opts) { this.x = opts.x; this.y = opts.y; this.radius = opts.radius; }
                pathSegment(ctx, bounds, opts) { const { x, y, radius } = this; bounds = bounds || { start: 0, end: TAU }; ctx.arc(x, y, radius, bounds.end, bounds.start, true); return !opts.bounds; }
                interpolate(point) { const { x, y, radius } = this; const angle = point.angle; return { x: x + Math.cos(angle) * radius, y: y + Math.sin(angle) * radius, angle }; }
        }
        function _getTarget(source) {
                const { chart, fill, line } = source; if (isNumberFinite(fill)) { return getLineByIndex(chart, fill); }
                if (fill === 'stack') { return _buildStackLine(source); }
                if (fill === 'shape') { return true; }
                const boundary = computeBoundary(source); if (boundary instanceof simpleArc) { return boundary; }
                return _createBoundaryLine(boundary, line);
        }
        function getLineByIndex(chart, index) { const meta = chart.getDatasetMeta(index); const visible = meta && chart.isDatasetVisible(index); return visible ? meta.dataset : null; }
        function computeBoundary(source) {
                const scale = source.scale || {}; if (scale.getPointPositionForValue) { return computeCircularBoundary(source); }
                return computeLinearBoundary(source);
        }
        function computeLinearBoundary(source) {
                const { scale = {}, fill } = source; const pixel = _getTargetPixel(fill, scale); if (isNumberFinite(pixel)) { const horizontal = scale.isHorizontal(); return { x: horizontal ? pixel : null, y: horizontal ? null : pixel }; }
                return null;
        }
        function computeCircularBoundary(source) {
                const { scale, fill } = source; const options = scale.options; const length = scale.getLabels().length; const start = options.reverse ? scale.max : scale.min; const value = _getTargetValue(fill, scale, start); const target = []; if (options.grid.circular) { const center = scale.getPointPositionForValue(0, start); return new simpleArc({ x: center.x, y: center.y, radius: scale.getDistanceFromCenterForValue(value) }); }
                for (let i = 0; i < length; ++i) { target.push(scale.getPointPositionForValue(i, value)); }
                return target;
        }
        function _drawfill(ctx, source, area) { const target = _getTarget(source); const { line, scale, axis } = source; const lineOpts = line.options; const fillOption = lineOpts.fill; const color = lineOpts.backgroundColor; const { above = color, below = color } = fillOption || {}; if (target && line.points.length) { clipArea(ctx, area); doFill(ctx, { line, target, above, below, area, scale, axis }); unclipArea(ctx); } }
        function doFill(ctx, cfg) {
                const { line, target, above, below, area, scale } = cfg; const property = line._loop ? 'angle' : cfg.axis; ctx.save(); if (property === 'x' && below !== above) { clipVertical(ctx, target, area.top); fill(ctx, { line, target, color: above, scale, property }); ctx.restore(); ctx.save(); clipVertical(ctx, target, area.bottom); }
                fill(ctx, { line, target, color: below, scale, property }); ctx.restore();
        }
        function clipVertical(ctx, target, clipY) {
                const { segments, points } = target; let first = true; let lineLoop = false; ctx.beginPath(); for (const segment of segments) {
                        const { start, end } = segment; const firstPoint = points[start]; const lastPoint = points[_findSegmentEnd(start, end, points)]; if (first) { ctx.moveTo(firstPoint.x, firstPoint.y); first = false; } else { ctx.lineTo(firstPoint.x, clipY); ctx.lineTo(firstPoint.x, firstPoint.y); }
                        lineLoop = !!target.pathSegment(ctx, segment, { move: lineLoop }); if (lineLoop) { ctx.closePath(); } else { ctx.lineTo(lastPoint.x, clipY); }
                }
                ctx.lineTo(target.first().x, clipY); ctx.closePath(); ctx.clip();
        }
        function fill(ctx, cfg) {
                const { line, target, property, color, scale } = cfg; const segments = _segments(line, target, property); for (const { source: src, target: tgt, start, end } of segments) {
                        const { style: { backgroundColor = color } = {} } = src; const notShape = target !== true; ctx.save(); ctx.fillStyle = backgroundColor; clipBounds(ctx, scale, notShape && _getBounds(property, start, end)); ctx.beginPath(); const lineLoop = !!line.pathSegment(ctx, src); let loop; if (notShape) {
                                if (lineLoop) { ctx.closePath(); } else { interpolatedLineTo(ctx, target, end, property); }
                                const targetLoop = !!target.pathSegment(ctx, tgt, { move: lineLoop, reverse: true }); loop = lineLoop && targetLoop; if (!loop) { interpolatedLineTo(ctx, target, start, property); }
                        }
                        ctx.closePath(); ctx.fill(loop ? 'evenodd' : 'nonzero'); ctx.restore();
                }
        }
        function clipBounds(ctx, scale, bounds) { const { top, bottom } = scale.chart.chartArea; const { property, start, end } = bounds || {}; if (property === 'x') { ctx.beginPath(); ctx.rect(start, top, end - start, bottom - top); ctx.clip(); } }
        function interpolatedLineTo(ctx, target, point, property) { const interpolatedPoint = target.interpolate(point, property); if (interpolatedPoint) { ctx.lineTo(interpolatedPoint.x, interpolatedPoint.y); } }
        var index = {
                id: 'filler', afterDatasetsUpdate(chart, _args, options) {
                        const count = (chart.data.datasets || []).length; const sources = []; let meta, i, line, source; for (i = 0; i < count; ++i) {
                                meta = chart.getDatasetMeta(i); line = meta.dataset; source = null; if (line && line.options && line instanceof LineElement) { source = { visible: chart.isDatasetVisible(i), index: i, fill: _decodeFill(line, i, count), chart, axis: meta.controller.options.indexAxis, scale: meta.vScale, line, }; }
                                meta.$filler = source; sources.push(source);
                        }
                        for (i = 0; i < count; ++i) {
                                source = sources[i]; if (!source || source.fill === false) { continue; }
                                source.fill = _resolveTarget(sources, i, options.propagate);
                        }
                }, beforeDraw(chart, _args, options) {
                        const draw = options.drawTime === 'beforeDraw'; const metasets = chart.getSortedVisibleDatasetMetas(); const area = chart.chartArea; for (let i = metasets.length - 1; i >= 0; --i) {
                                const source = metasets[i].$filler; if (!source) { continue; }
                                source.line.updateControlPoints(area, source.axis); if (draw) { _drawfill(chart.ctx, source, area); }
                        }
                }, beforeDatasetsDraw(chart, _args, options) {
                        if (options.drawTime !== 'beforeDatasetsDraw') { return; }
                        const metasets = chart.getSortedVisibleDatasetMetas(); for (let i = metasets.length - 1; i >= 0; --i) { const source = metasets[i].$filler; if (source) { _drawfill(chart.ctx, source, chart.chartArea); } }
                }, beforeDatasetDraw(chart, args, options) {
                        const source = args.meta.$filler; if (!source || source.fill === false || options.drawTime !== 'beforeDatasetDraw') { return; }
                        _drawfill(chart.ctx, source, chart.chartArea);
                }, defaults: { propagate: true, drawTime: 'beforeDatasetDraw' }
        }; const getBoxSize = (labelOpts, fontSize) => {
                let { boxHeight = fontSize, boxWidth = fontSize } = labelOpts; if (labelOpts.usePointStyle) { boxHeight = Math.min(boxHeight, fontSize); boxWidth = Math.min(boxWidth, fontSize); }
                return { boxWidth, boxHeight, itemHeight: Math.max(fontSize, boxHeight) };
        }; const itemsEqual = (a, b) => a !== null && b !== null && a.datasetIndex === b.datasetIndex && a.index === b.index; class Legend extends Element {
                constructor(config) { super(); this._added = false; this.legendHitBoxes = []; this._hoveredItem = null; this.doughnutMode = false; this.chart = config.chart; this.options = config.options; this.ctx = config.ctx; this.legendItems = undefined; this.columnSizes = undefined; this.lineWidths = undefined; this.maxHeight = undefined; this.maxWidth = undefined; this.top = undefined; this.bottom = undefined; this.left = undefined; this.right = undefined; this.height = undefined; this.width = undefined; this._margins = undefined; this.position = undefined; this.weight = undefined; this.fullSize = undefined; }
                update(maxWidth, maxHeight, margins) { this.maxWidth = maxWidth; this.maxHeight = maxHeight; this._margins = margins; this.setDimensions(); this.buildLabels(); this.fit(); }
                setDimensions() { if (this.isHorizontal()) { this.width = this.maxWidth; this.left = this._margins.left; this.right = this.width; } else { this.height = this.maxHeight; this.top = this._margins.top; this.bottom = this.height; } }
                buildLabels() {
                        const labelOpts = this.options.labels || {}; let legendItems = callback(labelOpts.generateLabels, [this.chart], this) || []; if (labelOpts.filter) { legendItems = legendItems.filter((item) => labelOpts.filter(item, this.chart.data)); }
                        if (labelOpts.sort) { legendItems = legendItems.sort((a, b) => labelOpts.sort(a, b, this.chart.data)); }
                        if (this.options.reverse) { legendItems.reverse(); }
                        this.legendItems = legendItems;
                }
                fit() {
                        const { options, ctx } = this; if (!options.display) { this.width = this.height = 0; return; }
                        const labelOpts = options.labels; const labelFont = toFont(labelOpts.font); const fontSize = labelFont.size; const titleHeight = this._computeTitleHeight(); const { boxWidth, itemHeight } = getBoxSize(labelOpts, fontSize); let width, height; ctx.font = labelFont.string; if (this.isHorizontal()) { width = this.maxWidth; height = this._fitRows(titleHeight, fontSize, boxWidth, itemHeight) + 10; } else { height = this.maxHeight; width = this._fitCols(titleHeight, fontSize, boxWidth, itemHeight) + 10; }
                        this.width = Math.min(width, options.maxWidth || this.maxWidth); this.height = Math.min(height, options.maxHeight || this.maxHeight);
                }
                _fitRows(titleHeight, fontSize, boxWidth, itemHeight) {
                        const { ctx, maxWidth, options: { labels: { padding } } } = this; const hitboxes = this.legendHitBoxes = []; const lineWidths = this.lineWidths = [0]; const lineHeight = itemHeight + padding; let totalHeight = titleHeight; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; let row = -1; let top = -lineHeight; this.legendItems.forEach((legendItem, i) => {
                                const itemWidth = boxWidth + (fontSize / 2) + ctx.measureText(legendItem.text).width; if (i === 0 || lineWidths[lineWidths.length - 1] + itemWidth + 2 * padding > maxWidth) { totalHeight += lineHeight; lineWidths[lineWidths.length - (i > 0 ? 0 : 1)] = 0; top += lineHeight; row++; }
                                hitboxes[i] = { left: 0, top, row, width: itemWidth, height: itemHeight }; lineWidths[lineWidths.length - 1] += itemWidth + padding;
                        }); return totalHeight;
                }
                _fitCols(titleHeight, fontSize, boxWidth, itemHeight) {
                        const { ctx, maxHeight, options: { labels: { padding } } } = this; const hitboxes = this.legendHitBoxes = []; const columnSizes = this.columnSizes = []; const heightLimit = maxHeight - titleHeight; let totalWidth = padding; let currentColWidth = 0; let currentColHeight = 0; let left = 0; let col = 0; this.legendItems.forEach((legendItem, i) => {
                                const itemWidth = boxWidth + (fontSize / 2) + ctx.measureText(legendItem.text).width; if (i > 0 && currentColHeight + itemHeight + 2 * padding > heightLimit) { totalWidth += currentColWidth + padding; columnSizes.push({ width: currentColWidth, height: currentColHeight }); left += currentColWidth + padding; col++; currentColWidth = currentColHeight = 0; }
                                hitboxes[i] = { left, top: currentColHeight, col, width: itemWidth, height: itemHeight }; currentColWidth = Math.max(currentColWidth, itemWidth); currentColHeight += itemHeight + padding;
                        }); totalWidth += currentColWidth; columnSizes.push({ width: currentColWidth, height: currentColHeight }); return totalWidth;
                }
                adjustHitBoxes() {
                        if (!this.options.display) { return; }
                        const titleHeight = this._computeTitleHeight(); const { legendHitBoxes: hitboxes, options: { align, labels: { padding }, rtl } } = this; const rtlHelper = getRtlAdapter(rtl, this.left, this.width); if (this.isHorizontal()) {
                                let row = 0; let left = _alignStartEnd(align, this.left + padding, this.right - this.lineWidths[row]); for (const hitbox of hitboxes) {
                                        if (row !== hitbox.row) { row = hitbox.row; left = _alignStartEnd(align, this.left + padding, this.right - this.lineWidths[row]); }
                                        hitbox.top += this.top + titleHeight + padding; hitbox.left = rtlHelper.leftForLtr(rtlHelper.x(left), hitbox.width); left += hitbox.width + padding;
                                }
                        } else {
                                let col = 0; let top = _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - this.columnSizes[col].height); for (const hitbox of hitboxes) {
                                        if (hitbox.col !== col) { col = hitbox.col; top = _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - this.columnSizes[col].height); }
                                        hitbox.top = top; hitbox.left += this.left + padding; hitbox.left = rtlHelper.leftForLtr(rtlHelper.x(hitbox.left), hitbox.width); top += hitbox.height + padding;
                                }
                        }
                }
                isHorizontal() { return this.options.position === 'top' || this.options.position === 'bottom'; }
                draw() { if (this.options.display) { const ctx = this.ctx; clipArea(ctx, this); this._draw(); unclipArea(ctx); } }
                _draw() {
                        const { options: opts, columnSizes, lineWidths, ctx } = this; const { align, labels: labelOpts } = opts; const defaultColor = defaults.color; const rtlHelper = getRtlAdapter(opts.rtl, this.left, this.width); const labelFont = toFont(labelOpts.font); const { color: fontColor, padding } = labelOpts; const fontSize = labelFont.size; const halfFontSize = fontSize / 2; let cursor; this.drawTitle(); ctx.textAlign = rtlHelper.textAlign('left'); ctx.textBaseline = 'middle'; ctx.lineWidth = 0.5; ctx.font = labelFont.string; const { boxWidth, boxHeight, itemHeight } = getBoxSize(labelOpts, fontSize); const drawLegendBox = function (x, y, legendItem) {
                                if (isNaN(boxWidth) || boxWidth <= 0 || isNaN(boxHeight) || boxHeight < 0) { return; }
                                ctx.save(); const lineWidth = valueOrDefault(legendItem.lineWidth, 1); ctx.fillStyle = valueOrDefault(legendItem.fillStyle, defaultColor); ctx.lineCap = valueOrDefault(legendItem.lineCap, 'butt'); ctx.lineDashOffset = valueOrDefault(legendItem.lineDashOffset, 0); ctx.lineJoin = valueOrDefault(legendItem.lineJoin, 'miter'); ctx.lineWidth = lineWidth; ctx.strokeStyle = valueOrDefault(legendItem.strokeStyle, defaultColor); ctx.setLineDash(valueOrDefault(legendItem.lineDash, [])); if (labelOpts.usePointStyle) { const drawOptions = { radius: boxWidth * Math.SQRT2 / 2, pointStyle: legendItem.pointStyle, rotation: legendItem.rotation, borderWidth: lineWidth }; const centerX = rtlHelper.xPlus(x, boxWidth / 2); const centerY = y + halfFontSize; drawPoint(ctx, drawOptions, centerX, centerY); } else {
                                        const yBoxTop = y + Math.max((fontSize - boxHeight) / 2, 0); const xBoxLeft = rtlHelper.leftForLtr(x, boxWidth); const borderRadius = toTRBLCorners(legendItem.borderRadius); ctx.beginPath(); if (Object.values(borderRadius).some(v => v !== 0)) { addRoundedRectPath(ctx, { x: xBoxLeft, y: yBoxTop, w: boxWidth, h: boxHeight, radius: borderRadius, }); } else { ctx.rect(xBoxLeft, yBoxTop, boxWidth, boxHeight); }
                                        ctx.fill(); if (lineWidth !== 0) { ctx.stroke(); }
                                }
                                ctx.restore();
                        }; const fillText = function (x, y, legendItem) { renderText(ctx, legendItem.text, x, y + (itemHeight / 2), labelFont, { strikethrough: legendItem.hidden, textAlign: rtlHelper.textAlign(legendItem.textAlign) }); }; const isHorizontal = this.isHorizontal(); const titleHeight = this._computeTitleHeight(); if (isHorizontal) { cursor = { x: _alignStartEnd(align, this.left + padding, this.right - lineWidths[0]), y: this.top + padding + titleHeight, line: 0 }; } else { cursor = { x: this.left + padding, y: _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - columnSizes[0].height), line: 0 }; }
                        overrideTextDirection(this.ctx, opts.textDirection); const lineHeight = itemHeight + padding; this.legendItems.forEach((legendItem, i) => {
                                ctx.strokeStyle = legendItem.fontColor || fontColor; ctx.fillStyle = legendItem.fontColor || fontColor; const textWidth = ctx.measureText(legendItem.text).width; const textAlign = rtlHelper.textAlign(legendItem.textAlign || (legendItem.textAlign = labelOpts.textAlign)); const width = boxWidth + halfFontSize + textWidth; let x = cursor.x; let y = cursor.y; rtlHelper.setWidth(this.width); if (isHorizontal) { if (i > 0 && x + width + padding > this.right) { y = cursor.y += lineHeight; cursor.line++; x = cursor.x = _alignStartEnd(align, this.left + padding, this.right - lineWidths[cursor.line]); } } else if (i > 0 && y + lineHeight > this.bottom) { x = cursor.x = x + columnSizes[cursor.line].width + padding; cursor.line++; y = cursor.y = _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - columnSizes[cursor.line].height); }
                                const realX = rtlHelper.x(x); drawLegendBox(realX, y, legendItem); x = _textX(textAlign, x + boxWidth + halfFontSize, isHorizontal ? x + width : this.right, opts.rtl); fillText(rtlHelper.x(x), y, legendItem); if (isHorizontal) { cursor.x += width + padding; } else { cursor.y += lineHeight; }
                        }); restoreTextDirection(this.ctx, opts.textDirection);
                }
                drawTitle() {
                        const opts = this.options; const titleOpts = opts.title; const titleFont = toFont(titleOpts.font); const titlePadding = toPadding(titleOpts.padding); if (!titleOpts.display) { return; }
                        const rtlHelper = getRtlAdapter(opts.rtl, this.left, this.width); const ctx = this.ctx; const position = titleOpts.position; const halfFontSize = titleFont.size / 2; const topPaddingPlusHalfFontSize = titlePadding.top + halfFontSize; let y; let left = this.left; let maxWidth = this.width; if (this.isHorizontal()) { maxWidth = Math.max(...this.lineWidths); y = this.top + topPaddingPlusHalfFontSize; left = _alignStartEnd(opts.align, left, this.right - maxWidth); } else { const maxHeight = this.columnSizes.reduce((acc, size) => Math.max(acc, size.height), 0); y = topPaddingPlusHalfFontSize + _alignStartEnd(opts.align, this.top, this.bottom - maxHeight - opts.labels.padding - this._computeTitleHeight()); }
                        const x = _alignStartEnd(position, left, left + maxWidth); ctx.textAlign = rtlHelper.textAlign(_toLeftRightCenter(position)); ctx.textBaseline = 'middle'; ctx.strokeStyle = titleOpts.color; ctx.fillStyle = titleOpts.color; ctx.font = titleFont.string; renderText(ctx, titleOpts.text, x, y, titleFont);
                }
                _computeTitleHeight() { const titleOpts = this.options.title; const titleFont = toFont(titleOpts.font); const titlePadding = toPadding(titleOpts.padding); return titleOpts.display ? titleFont.lineHeight + titlePadding.height : 0; }
                _getLegendItemAt(x, y) {
                        let i, hitBox, lh; if (_isBetween(x, this.left, this.right) && _isBetween(y, this.top, this.bottom)) { lh = this.legendHitBoxes; for (i = 0; i < lh.length; ++i) { hitBox = lh[i]; if (_isBetween(x, hitBox.left, hitBox.left + hitBox.width) && _isBetween(y, hitBox.top, hitBox.top + hitBox.height)) { return this.legendItems[i]; } } }
                        return null;
                }
                handleEvent(e) {
                        const opts = this.options; if (!isListened(e.type, opts)) { return; }
                        const hoveredItem = this._getLegendItemAt(e.x, e.y); if (e.type === 'mousemove' || e.type === 'mouseout') {
                                const previous = this._hoveredItem; const sameItem = itemsEqual(previous, hoveredItem); if (previous && !sameItem) { callback(opts.onLeave, [e, previous, this], this); }
                                this._hoveredItem = hoveredItem; if (hoveredItem && !sameItem) { callback(opts.onHover, [e, hoveredItem, this], this); }
                        } else if (hoveredItem) { callback(opts.onClick, [e, hoveredItem, this], this); }
                }
        }
        function isListened(type, opts) {
                if ((type === 'mousemove' || type === 'mouseout') && (opts.onHover || opts.onLeave)) { return true; }
                if (opts.onClick && (type === 'click' || type === 'mouseup')) { return true; }
                return false;
        }
        var plugin_legend = { id: 'legend', _element: Legend, start(chart, _args, options) { const legend = chart.legend = new Legend({ ctx: chart.ctx, options, chart }); layouts.configure(chart, legend, options); layouts.addBox(chart, legend); }, stop(chart) { layouts.removeBox(chart, chart.legend); delete chart.legend; }, beforeUpdate(chart, _args, options) { const legend = chart.legend; layouts.configure(chart, legend, options); legend.options = options; }, afterUpdate(chart) { const legend = chart.legend; legend.buildLabels(); legend.adjustHitBoxes(); }, afterEvent(chart, args) { if (!args.replay) { chart.legend.handleEvent(args.event); } }, defaults: { display: true, position: 'top', align: 'center', fullSize: true, reverse: false, weight: 1000, onClick(e, legendItem, legend) { const index = legendItem.datasetIndex; const ci = legend.chart; if (ci.isDatasetVisible(index)) { ci.hide(index); legendItem.hidden = true; } else { ci.show(index); legendItem.hidden = false; } }, onHover: null, onLeave: null, labels: { color: (ctx) => ctx.chart.options.color, boxWidth: 40, padding: 10, generateLabels(chart) { const datasets = chart.data.datasets; const { labels: { usePointStyle, pointStyle, textAlign, color } } = chart.legend.options; return chart._getSortedDatasetMetas().map((meta) => { const style = meta.controller.getStyle(usePointStyle ? 0 : undefined); const borderWidth = toPadding(style.borderWidth); return { text: datasets[meta.index].label, fillStyle: style.backgroundColor, fontColor: color, hidden: !meta.visible, lineCap: style.borderCapStyle, lineDash: style.borderDash, lineDashOffset: style.borderDashOffset, lineJoin: style.borderJoinStyle, lineWidth: (borderWidth.width + borderWidth.height) / 4, strokeStyle: style.borderColor, pointStyle: pointStyle || style.pointStyle, rotation: style.rotation, textAlign: textAlign || style.textAlign, borderRadius: 0, datasetIndex: meta.index }; }, this); } }, title: { color: (ctx) => ctx.chart.options.color, display: false, position: 'center', text: '', } }, descriptors: { _scriptable: (name) => !name.startsWith('on'), labels: { _scriptable: (name) => !['generateLabels', 'filter', 'sort'].includes(name), } }, }; class Title extends Element {
                constructor(config) { super(); this.chart = config.chart; this.options = config.options; this.ctx = config.ctx; this._padding = undefined; this.top = undefined; this.bottom = undefined; this.left = undefined; this.right = undefined; this.width = undefined; this.height = undefined; this.position = undefined; this.weight = undefined; this.fullSize = undefined; }
                update(maxWidth, maxHeight) {
                        const opts = this.options; this.left = 0; this.top = 0; if (!opts.display) { this.width = this.height = this.right = this.bottom = 0; return; }
                        this.width = this.right = maxWidth; this.height = this.bottom = maxHeight; const lineCount = isArray(opts.text) ? opts.text.length : 1; this._padding = toPadding(opts.padding); const textSize = lineCount * toFont(opts.font).lineHeight + this._padding.height; if (this.isHorizontal()) { this.height = textSize; } else { this.width = textSize; }
                }
                isHorizontal() { const pos = this.options.position; return pos === 'top' || pos === 'bottom'; }
                _drawArgs(offset) {
                        const { top, left, bottom, right, options } = this; const align = options.align; let rotation = 0; let maxWidth, titleX, titleY; if (this.isHorizontal()) { titleX = _alignStartEnd(align, left, right); titleY = top + offset; maxWidth = right - left; } else {
                                if (options.position === 'left') { titleX = left + offset; titleY = _alignStartEnd(align, bottom, top); rotation = PI * -0.5; } else { titleX = right - offset; titleY = _alignStartEnd(align, top, bottom); rotation = PI * 0.5; }
                                maxWidth = bottom - top;
                        }
                        return { titleX, titleY, maxWidth, rotation };
                }
                draw() {
                        const ctx = this.ctx; const opts = this.options; if (!opts.display) { return; }
                        const fontOpts = toFont(opts.font); const lineHeight = fontOpts.lineHeight; const offset = lineHeight / 2 + this._padding.top; const { titleX, titleY, maxWidth, rotation } = this._drawArgs(offset); renderText(ctx, opts.text, 0, 0, fontOpts, { color: opts.color, maxWidth, rotation, textAlign: _toLeftRightCenter(opts.align), textBaseline: 'middle', translation: [titleX, titleY], });
                }
        }
        function createTitle(chart, titleOpts) { const title = new Title({ ctx: chart.ctx, options: titleOpts, chart }); layouts.configure(chart, title, titleOpts); layouts.addBox(chart, title); chart.titleBlock = title; }
        var plugin_title = { id: 'title', _element: Title, start(chart, _args, options) { createTitle(chart, options); }, stop(chart) { const titleBlock = chart.titleBlock; layouts.removeBox(chart, titleBlock); delete chart.titleBlock; }, beforeUpdate(chart, _args, options) { const title = chart.titleBlock; layouts.configure(chart, title, options); title.options = options; }, defaults: { align: 'center', display: false, font: { weight: 'bold', }, fullSize: true, padding: 10, position: 'top', text: '', weight: 2000 }, defaultRoutes: { color: 'color' }, descriptors: { _scriptable: true, _indexable: false, }, }; const map = new WeakMap(); var plugin_subtitle = { id: 'subtitle', start(chart, _args, options) { const title = new Title({ ctx: chart.ctx, options, chart }); layouts.configure(chart, title, options); layouts.addBox(chart, title); map.set(chart, title); }, stop(chart) { layouts.removeBox(chart, map.get(chart)); map.delete(chart); }, beforeUpdate(chart, _args, options) { const title = map.get(chart); layouts.configure(chart, title, options); title.options = options; }, defaults: { align: 'center', display: false, font: { weight: 'normal', }, fullSize: true, padding: 0, position: 'top', text: '', weight: 1500 }, defaultRoutes: { color: 'color' }, descriptors: { _scriptable: true, _indexable: false, }, }; const positioners = {
                average(items) {
                        if (!items.length) { return false; }
                        let i, len; let x = 0; let y = 0; let count = 0; for (i = 0, len = items.length; i < len; ++i) { const el = items[i].element; if (el && el.hasValue()) { const pos = el.tooltipPosition(); x += pos.x; y += pos.y; ++count; } }
                        return { x: x / count, y: y / count };
                }, nearest(items, eventPosition) {
                        if (!items.length) { return false; }
                        let x = eventPosition.x; let y = eventPosition.y; let minDistance = Number.POSITIVE_INFINITY; let i, len, nearestElement; for (i = 0, len = items.length; i < len; ++i) { const el = items[i].element; if (el && el.hasValue()) { const center = el.getCenterPoint(); const d = distanceBetweenPoints(eventPosition, center); if (d < minDistance) { minDistance = d; nearestElement = el; } } }
                        if (nearestElement) { const tp = nearestElement.tooltipPosition(); x = tp.x; y = tp.y; }
                        return { x, y };
                }
        }; function pushOrConcat(base, toPush) {
                if (toPush) { if (isArray(toPush)) { Array.prototype.push.apply(base, toPush); } else { base.push(toPush); } }
                return base;
        }
        function splitNewlines(str) {
                if ((typeof str === 'string' || str instanceof String) && str.indexOf('\n') > -1) { return str.split('\n'); }
                return str;
        }
        function createTooltipItem(chart, item) { const { element, datasetIndex, index } = item; const controller = chart.getDatasetMeta(datasetIndex).controller; const { label, value } = controller.getLabelAndValue(index); return { chart, label, parsed: controller.getParsed(index), raw: chart.data.datasets[datasetIndex].data[index], formattedValue: value, dataset: controller.getDataset(), dataIndex: index, datasetIndex, element }; }
        function getTooltipSize(tooltip, options) {
                const ctx = tooltip.chart.ctx; const { body, footer, title } = tooltip; const { boxWidth, boxHeight } = options; const bodyFont = toFont(options.bodyFont); const titleFont = toFont(options.titleFont); const footerFont = toFont(options.footerFont); const titleLineCount = title.length; const footerLineCount = footer.length; const bodyLineItemCount = body.length; const padding = toPadding(options.padding); let height = padding.height; let width = 0; let combinedBodyLength = body.reduce((count, bodyItem) => count + bodyItem.before.length + bodyItem.lines.length + bodyItem.after.length, 0); combinedBodyLength += tooltip.beforeBody.length + tooltip.afterBody.length; if (titleLineCount) {
                        height += titleLineCount * titleFont.lineHeight
                        + (titleLineCount - 1) * options.titleSpacing
                        + options.titleMarginBottom;
                }
                if (combinedBodyLength) {
                        const bodyLineHeight = options.displayColors ? Math.max(boxHeight, bodyFont.lineHeight) : bodyFont.lineHeight; height += bodyLineItemCount * bodyLineHeight
                                + (combinedBodyLength - bodyLineItemCount) * bodyFont.lineHeight
                                + (combinedBodyLength - 1) * options.bodySpacing;
                }
                if (footerLineCount) {
                        height += options.footerMarginTop
                        + footerLineCount * footerFont.lineHeight
                        + (footerLineCount - 1) * options.footerSpacing;
                }
                let widthPadding = 0; const maxLineWidth = function (line) { width = Math.max(width, ctx.measureText(line).width + widthPadding); }; ctx.save(); ctx.font = titleFont.string; each(tooltip.title, maxLineWidth); ctx.font = bodyFont.string; each(tooltip.beforeBody.concat(tooltip.afterBody), maxLineWidth); widthPadding = options.displayColors ? (boxWidth + 2 + options.boxPadding) : 0; each(body, (bodyItem) => { each(bodyItem.before, maxLineWidth); each(bodyItem.lines, maxLineWidth); each(bodyItem.after, maxLineWidth); }); widthPadding = 0; ctx.font = footerFont.string; each(tooltip.footer, maxLineWidth); ctx.restore(); width += padding.width; return { width, height };
        }
        function determineYAlign(chart, size) {
                const { y, height } = size; if (y < height / 2) { return 'top'; } else if (y > (chart.height - height / 2)) { return 'bottom'; }
                return 'center';
        }
        function doesNotFitWithAlign(xAlign, chart, options, size) {
                const { x, width } = size; const caret = options.caretSize + options.caretPadding; if (xAlign === 'left' && x + width + caret > chart.width) { return true; }
                if (xAlign === 'right' && x - width - caret < 0) { return true; }
        }
        function determineXAlign(chart, options, size, yAlign) {
                const { x, width } = size; const { width: chartWidth, chartArea: { left, right } } = chart; let xAlign = 'center'; if (yAlign === 'center') { xAlign = x <= (left + right) / 2 ? 'left' : 'right'; } else if (x <= width / 2) { xAlign = 'left'; } else if (x >= chartWidth - width / 2) { xAlign = 'right'; }
                if (doesNotFitWithAlign(xAlign, chart, options, size)) { xAlign = 'center'; }
                return xAlign;
        }
        function determineAlignment(chart, options, size) { const yAlign = size.yAlign || options.yAlign || determineYAlign(chart, size); return { xAlign: size.xAlign || options.xAlign || determineXAlign(chart, options, size, yAlign), yAlign }; }
        function alignX(size, xAlign) {
                let { x, width } = size; if (xAlign === 'right') { x -= width; } else if (xAlign === 'center') { x -= (width / 2); }
                return x;
        }
        function alignY(size, yAlign, paddingAndSize) {
                let { y, height } = size; if (yAlign === 'top') { y += paddingAndSize; } else if (yAlign === 'bottom') { y -= height + paddingAndSize; } else { y -= (height / 2); }
                return y;
        }
        function getBackgroundPoint(options, size, alignment, chart) {
                const { caretSize, caretPadding, cornerRadius } = options; const { xAlign, yAlign } = alignment; const paddingAndSize = caretSize + caretPadding; const { topLeft, topRight, bottomLeft, bottomRight } = toTRBLCorners(cornerRadius); let x = alignX(size, xAlign); const y = alignY(size, yAlign, paddingAndSize); if (yAlign === 'center') { if (xAlign === 'left') { x += paddingAndSize; } else if (xAlign === 'right') { x -= paddingAndSize; } } else if (xAlign === 'left') { x -= Math.max(topLeft, bottomLeft) + caretSize; } else if (xAlign === 'right') { x += Math.max(topRight, bottomRight) + caretSize; }
                return { x: _limitValue(x, 0, chart.width - size.width), y: _limitValue(y, 0, chart.height - size.height) };
        }
        function getAlignedX(tooltip, align, options) { const padding = toPadding(options.padding); return align === 'center' ? tooltip.x + tooltip.width / 2 : align === 'right' ? tooltip.x + tooltip.width - padding.right : tooltip.x + padding.left; }
        function getBeforeAfterBodyLines(callback) { return pushOrConcat([], splitNewlines(callback)); }
        function createTooltipContext(parent, tooltip, tooltipItems) { return createContext(parent, { tooltip, tooltipItems, type: 'tooltip' }); }
        function overrideCallbacks(callbacks, context) { const override = context && context.dataset && context.dataset.tooltip && context.dataset.tooltip.callbacks; return override ? callbacks.override(override) : callbacks; }
        class Tooltip extends Element {
                constructor(config) { super(); this.opacity = 0; this._active = []; this._eventPosition = undefined; this._size = undefined; this._cachedAnimations = undefined; this._tooltipItems = []; this.$animations = undefined; this.$context = undefined; this.chart = config.chart || config._chart; this._chart = this.chart; this.options = config.options; this.dataPoints = undefined; this.title = undefined; this.beforeBody = undefined; this.body = undefined; this.afterBody = undefined; this.footer = undefined; this.xAlign = undefined; this.yAlign = undefined; this.x = undefined; this.y = undefined; this.height = undefined; this.width = undefined; this.caretX = undefined; this.caretY = undefined; this.labelColors = undefined; this.labelPointStyles = undefined; this.labelTextColors = undefined; }
                initialize(options) { this.options = options; this._cachedAnimations = undefined; this.$context = undefined; }
                _resolveAnimations() {
                        const cached = this._cachedAnimations; if (cached) { return cached; }
                        const chart = this.chart; const options = this.options.setContext(this.getContext()); const opts = options.enabled && chart.options.animation && options.animations; const animations = new Animations(this.chart, opts); if (opts._cacheable) { this._cachedAnimations = Object.freeze(animations); }
                        return animations;
                }
                getContext() { return this.$context || (this.$context = createTooltipContext(this.chart.getContext(), this, this._tooltipItems)); }
                getTitle(context, options) { const { callbacks } = options; const beforeTitle = callbacks.beforeTitle.apply(this, [context]); const title = callbacks.title.apply(this, [context]); const afterTitle = callbacks.afterTitle.apply(this, [context]); let lines = []; lines = pushOrConcat(lines, splitNewlines(beforeTitle)); lines = pushOrConcat(lines, splitNewlines(title)); lines = pushOrConcat(lines, splitNewlines(afterTitle)); return lines; }
                getBeforeBody(tooltipItems, options) { return getBeforeAfterBodyLines(options.callbacks.beforeBody.apply(this, [tooltipItems])); }
                getBody(tooltipItems, options) { const { callbacks } = options; const bodyItems = []; each(tooltipItems, (context) => { const bodyItem = { before: [], lines: [], after: [] }; const scoped = overrideCallbacks(callbacks, context); pushOrConcat(bodyItem.before, splitNewlines(scoped.beforeLabel.call(this, context))); pushOrConcat(bodyItem.lines, scoped.label.call(this, context)); pushOrConcat(bodyItem.after, splitNewlines(scoped.afterLabel.call(this, context))); bodyItems.push(bodyItem); }); return bodyItems; }
                getAfterBody(tooltipItems, options) { return getBeforeAfterBodyLines(options.callbacks.afterBody.apply(this, [tooltipItems])); }
                getFooter(tooltipItems, options) { const { callbacks } = options; const beforeFooter = callbacks.beforeFooter.apply(this, [tooltipItems]); const footer = callbacks.footer.apply(this, [tooltipItems]); const afterFooter = callbacks.afterFooter.apply(this, [tooltipItems]); let lines = []; lines = pushOrConcat(lines, splitNewlines(beforeFooter)); lines = pushOrConcat(lines, splitNewlines(footer)); lines = pushOrConcat(lines, splitNewlines(afterFooter)); return lines; }
                _createItems(options) {
                        const active = this._active; const data = this.chart.data; const labelColors = []; const labelPointStyles = []; const labelTextColors = []; let tooltipItems = []; let i, len; for (i = 0, len = active.length; i < len; ++i) { tooltipItems.push(createTooltipItem(this.chart, active[i])); }
                        if (options.filter) { tooltipItems = tooltipItems.filter((element, index, array) => options.filter(element, index, array, data)); }
                        if (options.itemSort) { tooltipItems = tooltipItems.sort((a, b) => options.itemSort(a, b, data)); }
                        each(tooltipItems, (context) => { const scoped = overrideCallbacks(options.callbacks, context); labelColors.push(scoped.labelColor.call(this, context)); labelPointStyles.push(scoped.labelPointStyle.call(this, context)); labelTextColors.push(scoped.labelTextColor.call(this, context)); }); this.labelColors = labelColors; this.labelPointStyles = labelPointStyles; this.labelTextColors = labelTextColors; this.dataPoints = tooltipItems; return tooltipItems;
                }
                update(changed, replay) {
                        const options = this.options.setContext(this.getContext()); const active = this._active; let properties; let tooltipItems = []; if (!active.length) { if (this.opacity !== 0) { properties = { opacity: 0 }; } } else { const position = positioners[options.position].call(this, active, this._eventPosition); tooltipItems = this._createItems(options); this.title = this.getTitle(tooltipItems, options); this.beforeBody = this.getBeforeBody(tooltipItems, options); this.body = this.getBody(tooltipItems, options); this.afterBody = this.getAfterBody(tooltipItems, options); this.footer = this.getFooter(tooltipItems, options); const size = this._size = getTooltipSize(this, options); const positionAndSize = Object.assign({}, position, size); const alignment = determineAlignment(this.chart, options, positionAndSize); const backgroundPoint = getBackgroundPoint(options, positionAndSize, alignment, this.chart); this.xAlign = alignment.xAlign; this.yAlign = alignment.yAlign; properties = { opacity: 1, x: backgroundPoint.x, y: backgroundPoint.y, width: size.width, height: size.height, caretX: position.x, caretY: position.y }; }
                        this._tooltipItems = tooltipItems; this.$context = undefined; if (properties) { this._resolveAnimations().update(this, properties); }
                        if (changed && options.external) { options.external.call(this, { chart: this.chart, tooltip: this, replay }); }
                }
                drawCaret(tooltipPoint, ctx, size, options) { const caretPosition = this.getCaretPosition(tooltipPoint, size, options); ctx.lineTo(caretPosition.x1, caretPosition.y1); ctx.lineTo(caretPosition.x2, caretPosition.y2); ctx.lineTo(caretPosition.x3, caretPosition.y3); }
                getCaretPosition(tooltipPoint, size, options) {
                        const { xAlign, yAlign } = this; const { caretSize, cornerRadius } = options; const { topLeft, topRight, bottomLeft, bottomRight } = toTRBLCorners(cornerRadius); const { x: ptX, y: ptY } = tooltipPoint; const { width, height } = size; let x1, x2, x3, y1, y2, y3; if (yAlign === 'center') {
                                y2 = ptY + (height / 2); if (xAlign === 'left') { x1 = ptX; x2 = x1 - caretSize; y1 = y2 + caretSize; y3 = y2 - caretSize; } else { x1 = ptX + width; x2 = x1 + caretSize; y1 = y2 - caretSize; y3 = y2 + caretSize; }
                                x3 = x1;
                        } else {
                                if (xAlign === 'left') { x2 = ptX + Math.max(topLeft, bottomLeft) + (caretSize); } else if (xAlign === 'right') { x2 = ptX + width - Math.max(topRight, bottomRight) - caretSize; } else { x2 = this.caretX; }
                                if (yAlign === 'top') { y1 = ptY; y2 = y1 - caretSize; x1 = x2 - caretSize; x3 = x2 + caretSize; } else { y1 = ptY + height; y2 = y1 + caretSize; x1 = x2 + caretSize; x3 = x2 - caretSize; }
                                y3 = y1;
                        }
                        return { x1, x2, x3, y1, y2, y3 };
                }
                drawTitle(pt, ctx, options) { const title = this.title; const length = title.length; let titleFont, titleSpacing, i; if (length) { const rtlHelper = getRtlAdapter(options.rtl, this.x, this.width); pt.x = getAlignedX(this, options.titleAlign, options); ctx.textAlign = rtlHelper.textAlign(options.titleAlign); ctx.textBaseline = 'middle'; titleFont = toFont(options.titleFont); titleSpacing = options.titleSpacing; ctx.fillStyle = options.titleColor; ctx.font = titleFont.string; for (i = 0; i < length; ++i) { ctx.fillText(title[i], rtlHelper.x(pt.x), pt.y + titleFont.lineHeight / 2); pt.y += titleFont.lineHeight + titleSpacing; if (i + 1 === length) { pt.y += options.titleMarginBottom - titleSpacing; } } } }
                _drawColorBox(ctx, pt, i, rtlHelper, options) {
                        const labelColors = this.labelColors[i]; const labelPointStyle = this.labelPointStyles[i]; const { boxHeight, boxWidth, boxPadding } = options; const bodyFont = toFont(options.bodyFont); const colorX = getAlignedX(this, 'left', options); const rtlColorX = rtlHelper.x(colorX); const yOffSet = boxHeight < bodyFont.lineHeight ? (bodyFont.lineHeight - boxHeight) / 2 : 0; const colorY = pt.y + yOffSet; if (options.usePointStyle) { const drawOptions = { radius: Math.min(boxWidth, boxHeight) / 2, pointStyle: labelPointStyle.pointStyle, rotation: labelPointStyle.rotation, borderWidth: 1 }; const centerX = rtlHelper.leftForLtr(rtlColorX, boxWidth) + boxWidth / 2; const centerY = colorY + boxHeight / 2; ctx.strokeStyle = options.multiKeyBackground; ctx.fillStyle = options.multiKeyBackground; drawPoint(ctx, drawOptions, centerX, centerY); ctx.strokeStyle = labelColors.borderColor; ctx.fillStyle = labelColors.backgroundColor; drawPoint(ctx, drawOptions, centerX, centerY); } else { ctx.lineWidth = labelColors.borderWidth || 1; ctx.strokeStyle = labelColors.borderColor; ctx.setLineDash(labelColors.borderDash || []); ctx.lineDashOffset = labelColors.borderDashOffset || 0; const outerX = rtlHelper.leftForLtr(rtlColorX, boxWidth - boxPadding); const innerX = rtlHelper.leftForLtr(rtlHelper.xPlus(rtlColorX, 1), boxWidth - boxPadding - 2); const borderRadius = toTRBLCorners(labelColors.borderRadius); if (Object.values(borderRadius).some(v => v !== 0)) { ctx.beginPath(); ctx.fillStyle = options.multiKeyBackground; addRoundedRectPath(ctx, { x: outerX, y: colorY, w: boxWidth, h: boxHeight, radius: borderRadius, }); ctx.fill(); ctx.stroke(); ctx.fillStyle = labelColors.backgroundColor; ctx.beginPath(); addRoundedRectPath(ctx, { x: innerX, y: colorY + 1, w: boxWidth - 2, h: boxHeight - 2, radius: borderRadius, }); ctx.fill(); } else { ctx.fillStyle = options.multiKeyBackground; ctx.fillRect(outerX, colorY, boxWidth, boxHeight); ctx.strokeRect(outerX, colorY, boxWidth, boxHeight); ctx.fillStyle = labelColors.backgroundColor; ctx.fillRect(innerX, colorY + 1, boxWidth - 2, boxHeight - 2); } }
                        ctx.fillStyle = this.labelTextColors[i];
                }
                drawBody(pt, ctx, options) {
                        const { body } = this; const { bodySpacing, bodyAlign, displayColors, boxHeight, boxWidth, boxPadding } = options; const bodyFont = toFont(options.bodyFont); let bodyLineHeight = bodyFont.lineHeight; let xLinePadding = 0; const rtlHelper = getRtlAdapter(options.rtl, this.x, this.width); const fillLineOfText = function (line) { ctx.fillText(line, rtlHelper.x(pt.x + xLinePadding), pt.y + bodyLineHeight / 2); pt.y += bodyLineHeight + bodySpacing; }; const bodyAlignForCalculation = rtlHelper.textAlign(bodyAlign); let bodyItem, textColor, lines, i, j, ilen, jlen; ctx.textAlign = bodyAlign; ctx.textBaseline = 'middle'; ctx.font = bodyFont.string; pt.x = getAlignedX(this, bodyAlignForCalculation, options); ctx.fillStyle = options.bodyColor; each(this.beforeBody, fillLineOfText); xLinePadding = displayColors && bodyAlignForCalculation !== 'right' ? bodyAlign === 'center' ? (boxWidth / 2 + boxPadding) : (boxWidth + 2 + boxPadding) : 0; for (i = 0, ilen = body.length; i < ilen; ++i) {
                                bodyItem = body[i]; textColor = this.labelTextColors[i]; ctx.fillStyle = textColor; each(bodyItem.before, fillLineOfText); lines = bodyItem.lines; if (displayColors && lines.length) { this._drawColorBox(ctx, pt, i, rtlHelper, options); bodyLineHeight = Math.max(bodyFont.lineHeight, boxHeight); }
                                for (j = 0, jlen = lines.length; j < jlen; ++j) { fillLineOfText(lines[j]); bodyLineHeight = bodyFont.lineHeight; }
                                each(bodyItem.after, fillLineOfText);
                        }
                        xLinePadding = 0; bodyLineHeight = bodyFont.lineHeight; each(this.afterBody, fillLineOfText); pt.y -= bodySpacing;
                }
                drawFooter(pt, ctx, options) { const footer = this.footer; const length = footer.length; let footerFont, i; if (length) { const rtlHelper = getRtlAdapter(options.rtl, this.x, this.width); pt.x = getAlignedX(this, options.footerAlign, options); pt.y += options.footerMarginTop; ctx.textAlign = rtlHelper.textAlign(options.footerAlign); ctx.textBaseline = 'middle'; footerFont = toFont(options.footerFont); ctx.fillStyle = options.footerColor; ctx.font = footerFont.string; for (i = 0; i < length; ++i) { ctx.fillText(footer[i], rtlHelper.x(pt.x), pt.y + footerFont.lineHeight / 2); pt.y += footerFont.lineHeight + options.footerSpacing; } } }
                drawBackground(pt, ctx, tooltipSize, options) {
                        const { xAlign, yAlign } = this; const { x, y } = pt; const { width, height } = tooltipSize; const { topLeft, topRight, bottomLeft, bottomRight } = toTRBLCorners(options.cornerRadius); ctx.fillStyle = options.backgroundColor; ctx.strokeStyle = options.borderColor; ctx.lineWidth = options.borderWidth; ctx.beginPath(); ctx.moveTo(x + topLeft, y); if (yAlign === 'top') { this.drawCaret(pt, ctx, tooltipSize, options); }
                        ctx.lineTo(x + width - topRight, y); ctx.quadraticCurveTo(x + width, y, x + width, y + topRight); if (yAlign === 'center' && xAlign === 'right') { this.drawCaret(pt, ctx, tooltipSize, options); }
                        ctx.lineTo(x + width, y + height - bottomRight); ctx.quadraticCurveTo(x + width, y + height, x + width - bottomRight, y + height); if (yAlign === 'bottom') { this.drawCaret(pt, ctx, tooltipSize, options); }
                        ctx.lineTo(x + bottomLeft, y + height); ctx.quadraticCurveTo(x, y + height, x, y + height - bottomLeft); if (yAlign === 'center' && xAlign === 'left') { this.drawCaret(pt, ctx, tooltipSize, options); }
                        ctx.lineTo(x, y + topLeft); ctx.quadraticCurveTo(x, y, x + topLeft, y); ctx.closePath(); ctx.fill(); if (options.borderWidth > 0) { ctx.stroke(); }
                }
                _updateAnimationTarget(options) {
                        const chart = this.chart; const anims = this.$animations; const animX = anims && anims.x; const animY = anims && anims.y; if (animX || animY) {
                                const position = positioners[options.position].call(this, this._active, this._eventPosition); if (!position) { return; }
                                const size = this._size = getTooltipSize(this, options); const positionAndSize = Object.assign({}, position, this._size); const alignment = determineAlignment(chart, options, positionAndSize); const point = getBackgroundPoint(options, positionAndSize, alignment, chart); if (animX._to !== point.x || animY._to !== point.y) { this.xAlign = alignment.xAlign; this.yAlign = alignment.yAlign; this.width = size.width; this.height = size.height; this.caretX = position.x; this.caretY = position.y; this._resolveAnimations().update(this, point); }
                        }
                }
                _willRender() { return !!this.opacity; }
                draw(ctx) {
                        const options = this.options.setContext(this.getContext()); let opacity = this.opacity; if (!opacity) { return; }
                        this._updateAnimationTarget(options); const tooltipSize = { width: this.width, height: this.height }; const pt = { x: this.x, y: this.y }; opacity = Math.abs(opacity) < 1e-3 ? 0 : opacity; const padding = toPadding(options.padding); const hasTooltipContent = this.title.length || this.beforeBody.length || this.body.length || this.afterBody.length || this.footer.length; if (options.enabled && hasTooltipContent) { ctx.save(); ctx.globalAlpha = opacity; this.drawBackground(pt, ctx, tooltipSize, options); overrideTextDirection(ctx, options.textDirection); pt.y += padding.top; this.drawTitle(pt, ctx, options); this.drawBody(pt, ctx, options); this.drawFooter(pt, ctx, options); restoreTextDirection(ctx, options.textDirection); ctx.restore(); }
                }
                getActiveElements() { return this._active || []; }
                setActiveElements(activeElements, eventPosition) {
                        const lastActive = this._active; const active = activeElements.map(({ datasetIndex, index }) => {
                                const meta = this.chart.getDatasetMeta(datasetIndex); if (!meta) { throw new Error('Cannot find a dataset at index ' + datasetIndex); }
                                return { datasetIndex, element: meta.data[index], index, };
                        }); const changed = !_elementsEqual(lastActive, active); const positionChanged = this._positionChanged(active, eventPosition); if (changed || positionChanged) { this._active = active; this._eventPosition = eventPosition; this._ignoreReplayEvents = true; this.update(true); }
                }
                handleEvent(e, replay, inChartArea = true) {
                        if (replay && this._ignoreReplayEvents) { return false; }
                        this._ignoreReplayEvents = false; const options = this.options; const lastActive = this._active || []; const active = this._getActiveElements(e, lastActive, replay, inChartArea); const positionChanged = this._positionChanged(active, e); const changed = replay || !_elementsEqual(active, lastActive) || positionChanged; if (changed) { this._active = active; if (options.enabled || options.external) { this._eventPosition = { x: e.x, y: e.y }; this.update(true, replay); } }
                        return changed;
                }
                _getActiveElements(e, lastActive, replay, inChartArea) {
                        const options = this.options; if (e.type === 'mouseout') { return []; }
                        if (!inChartArea) { return lastActive; }
                        const active = this.chart.getElementsAtEventForMode(e, options.mode, options, replay); if (options.reverse) { active.reverse(); }
                        return active;
                }
                _positionChanged(active, e) { const { caretX, caretY, options } = this; const position = positioners[options.position].call(this, active, e); return position !== false && (caretX !== position.x || caretY !== position.y); }
        }
        Tooltip.positioners = positioners; var plugin_tooltip = {
                id: 'tooltip', _element: Tooltip, positioners, afterInit(chart, _args, options) { if (options) { chart.tooltip = new Tooltip({ chart, options }); } }, beforeUpdate(chart, _args, options) { if (chart.tooltip) { chart.tooltip.initialize(options); } }, reset(chart, _args, options) { if (chart.tooltip) { chart.tooltip.initialize(options); } }, afterDraw(chart) {
                        const tooltip = chart.tooltip; if (tooltip && tooltip._willRender()) {
                                const args = { tooltip }; if (chart.notifyPlugins('beforeTooltipDraw', args) === false) { return; }
                                tooltip.draw(chart.ctx); chart.notifyPlugins('afterTooltipDraw', args);
                        }
                }, afterEvent(chart, args) { if (chart.tooltip) { const useFinalPosition = args.replay; if (chart.tooltip.handleEvent(args.event, useFinalPosition, args.inChartArea)) { args.changed = true; } } }, defaults: {
                        enabled: true, external: null, position: 'average', backgroundColor: 'rgba(0,0,0,0.8)', titleColor: '#fff', titleFont: { weight: 'bold', }, titleSpacing: 2, titleMarginBottom: 6, titleAlign: 'left', bodyColor: '#fff', bodySpacing: 2, bodyFont: {}, bodyAlign: 'left', footerColor: '#fff', footerSpacing: 2, footerMarginTop: 6, footerFont: { weight: 'bold', }, footerAlign: 'left', padding: 6, caretPadding: 2, caretSize: 5, cornerRadius: 6, boxHeight: (ctx, opts) => opts.bodyFont.size, boxWidth: (ctx, opts) => opts.bodyFont.size, multiKeyBackground: '#fff', displayColors: true, boxPadding: 0, borderColor: 'rgba(0,0,0,0)', borderWidth: 0, animation: { duration: 400, easing: 'easeOutQuart', }, animations: { numbers: { type: 'number', properties: ['x', 'y', 'width', 'height', 'caretX', 'caretY'], }, opacity: { easing: 'linear', duration: 200 } }, callbacks: {
                                beforeTitle: noop, title(tooltipItems) {
                                        if (tooltipItems.length > 0) { const item = tooltipItems[0]; const labels = item.chart.data.labels; const labelCount = labels ? labels.length : 0; if (this && this.options && this.options.mode === 'dataset') { return item.dataset.label || ''; } else if (item.label) { return item.label; } else if (labelCount > 0 && item.dataIndex < labelCount) { return labels[item.dataIndex]; } }
                                        return '';
                                }, afterTitle: noop, beforeBody: noop, beforeLabel: noop, label(tooltipItem) {
                                        if (this && this.options && this.options.mode === 'dataset') { return tooltipItem.label + ': ' + tooltipItem.formattedValue || tooltipItem.formattedValue; }
                                        let label = tooltipItem.dataset.label || ''; if (label) { label += ': '; }
                                        const value = tooltipItem.formattedValue; if (!isNullOrUndef(value)) { label += value; }
                                        return label;
                                }, labelColor(tooltipItem) { const meta = tooltipItem.chart.getDatasetMeta(tooltipItem.datasetIndex); const options = meta.controller.getStyle(tooltipItem.dataIndex); return { borderColor: options.borderColor, backgroundColor: options.backgroundColor, borderWidth: options.borderWidth, borderDash: options.borderDash, borderDashOffset: options.borderDashOffset, borderRadius: 0, }; }, labelTextColor() { return this.options.bodyColor; }, labelPointStyle(tooltipItem) { const meta = tooltipItem.chart.getDatasetMeta(tooltipItem.datasetIndex); const options = meta.controller.getStyle(tooltipItem.dataIndex); return { pointStyle: options.pointStyle, rotation: options.rotation, }; }, afterLabel: noop, afterBody: noop, beforeFooter: noop, footer: noop, afterFooter: noop
                        }
                }, defaultRoutes: { bodyFont: 'font', footerFont: 'font', titleFont: 'font' }, descriptors: { _scriptable: (name) => name !== 'filter' && name !== 'itemSort' && name !== 'external', _indexable: false, callbacks: { _scriptable: false, _indexable: false, }, animation: { _fallback: false }, animations: { _fallback: 'animation' } }, additionalOptionScopes: ['interaction']
        }; var plugins = Object.freeze({ __proto__: null, Decimation: plugin_decimation, Filler: index, Legend: plugin_legend, SubTitle: plugin_subtitle, Title: plugin_title, Tooltip: plugin_tooltip }); const addIfString = (labels, raw, index, addedLabels) => {
                if (typeof raw === 'string') { index = labels.push(raw) - 1; addedLabels.unshift({ index, label: raw }); } else if (isNaN(raw)) { index = null; }
                return index;
        }; function findOrAddLabel(labels, raw, index, addedLabels) {
                const first = labels.indexOf(raw); if (first === -1) { return addIfString(labels, raw, index, addedLabels); }
                const last = labels.lastIndexOf(raw); return first !== last ? index : first;
        }
        const validIndex = (index, max) => index === null ? null : _limitValue(Math.round(index), 0, max); class CategoryScale extends Scale {
                constructor(cfg) { super(cfg); this._startValue = undefined; this._valueRange = 0; this._addedLabels = []; }
                init(scaleOptions) {
                        const added = this._addedLabels; if (added.length) {
                                const labels = this.getLabels(); for (const { index, label } of added) { if (labels[index] === label) { labels.splice(index, 1); } }
                                this._addedLabels = [];
                        }
                        super.init(scaleOptions);
                }
                parse(raw, index) {
                        if (isNullOrUndef(raw)) { return null; }
                        const labels = this.getLabels(); index = isFinite(index) && labels[index] === raw ? index : findOrAddLabel(labels, raw, valueOrDefault(index, raw), this._addedLabels); return validIndex(index, labels.length - 1);
                }
                determineDataLimits() {
                        const { minDefined, maxDefined } = this.getUserBounds(); let { min, max } = this.getMinMax(true); if (this.options.bounds === 'ticks') {
                                if (!minDefined) { min = 0; }
                                if (!maxDefined) { max = this.getLabels().length - 1; }
                        }
                        this.min = min; this.max = max;
                }
                buildTicks() {
                        const min = this.min; const max = this.max; const offset = this.options.offset; const ticks = []; let labels = this.getLabels(); labels = (min === 0 && max === labels.length - 1) ? labels : labels.slice(min, max + 1); this._valueRange = Math.max(labels.length - (offset ? 0 : 1), 1); this._startValue = this.min - (offset ? 0.5 : 0); for (let value = min; value <= max; value++) { ticks.push({ value }); }
                        return ticks;
                }
                getLabelForValue(value) {
                        const labels = this.getLabels(); if (value >= 0 && value < labels.length) { return labels[value]; }
                        return value;
                }
                configure() { super.configure(); if (!this.isHorizontal()) { this._reversePixels = !this._reversePixels; } }
                getPixelForValue(value) {
                        if (typeof value !== 'number') { value = this.parse(value); }
                        return value === null ? NaN : this.getPixelForDecimal((value - this._startValue) / this._valueRange);
                }
                getPixelForTick(index) {
                        const ticks = this.ticks; if (index < 0 || index > ticks.length - 1) { return null; }
                        return this.getPixelForValue(ticks[index].value);
                }
                getValueForPixel(pixel) { return Math.round(this._startValue + this.getDecimalForPixel(pixel) * this._valueRange); }
                getBasePixel() { return this.bottom; }
        }
        CategoryScale.id = 'category'; CategoryScale.defaults = { ticks: { callback: CategoryScale.prototype.getLabelForValue } }; function generateTicks$1(generationOptions, dataRange) {
                const ticks = []; const MIN_SPACING = 1e-14; const { bounds, step, min, max, precision, count, maxTicks, maxDigits, includeBounds } = generationOptions; const unit = step || 1; const maxSpaces = maxTicks - 1; const { min: rmin, max: rmax } = dataRange; const minDefined = !isNullOrUndef(min); const maxDefined = !isNullOrUndef(max); const countDefined = !isNullOrUndef(count); const minSpacing = (rmax - rmin) / (maxDigits + 1); let spacing = niceNum((rmax - rmin) / maxSpaces / unit) * unit; let factor, niceMin, niceMax, numSpaces; if (spacing < MIN_SPACING && !minDefined && !maxDefined) { return [{ value: rmin }, { value: rmax }]; }
                numSpaces = Math.ceil(rmax / spacing) - Math.floor(rmin / spacing); if (numSpaces > maxSpaces) { spacing = niceNum(numSpaces * spacing / maxSpaces / unit) * unit; }
                if (!isNullOrUndef(precision)) { factor = Math.pow(10, precision); spacing = Math.ceil(spacing * factor) / factor; }
                if (bounds === 'ticks') { niceMin = Math.floor(rmin / spacing) * spacing; niceMax = Math.ceil(rmax / spacing) * spacing; } else { niceMin = rmin; niceMax = rmax; }
                if (minDefined && maxDefined && step && almostWhole((max - min) / step, spacing / 1000)) { numSpaces = Math.round(Math.min((max - min) / spacing, maxTicks)); spacing = (max - min) / numSpaces; niceMin = min; niceMax = max; } else if (countDefined) { niceMin = minDefined ? min : niceMin; niceMax = maxDefined ? max : niceMax; numSpaces = count - 1; spacing = (niceMax - niceMin) / numSpaces; } else { numSpaces = (niceMax - niceMin) / spacing; if (almostEquals(numSpaces, Math.round(numSpaces), spacing / 1000)) { numSpaces = Math.round(numSpaces); } else { numSpaces = Math.ceil(numSpaces); } }
                const decimalPlaces = Math.max(_decimalPlaces(spacing), _decimalPlaces(niceMin)); factor = Math.pow(10, isNullOrUndef(precision) ? decimalPlaces : precision); niceMin = Math.round(niceMin * factor) / factor; niceMax = Math.round(niceMax * factor) / factor; let j = 0; if (minDefined) {
                        if (includeBounds && niceMin !== min) {
                                ticks.push({ value: min }); if (niceMin < min) { j++; }
                                if (almostEquals(Math.round((niceMin + j * spacing) * factor) / factor, min, relativeLabelSize(min, minSpacing, generationOptions))) { j++; }
                        } else if (niceMin < min) { j++; }
                }
                for (; j < numSpaces; ++j) { ticks.push({ value: Math.round((niceMin + j * spacing) * factor) / factor }); }
                if (maxDefined && includeBounds && niceMax !== max) { if (ticks.length && almostEquals(ticks[ticks.length - 1].value, max, relativeLabelSize(max, minSpacing, generationOptions))) { ticks[ticks.length - 1].value = max; } else { ticks.push({ value: max }); } } else if (!maxDefined || niceMax === max) { ticks.push({ value: niceMax }); }
                return ticks;
        }
        function relativeLabelSize(value, minSpacing, { horizontal, minRotation }) { const rad = toRadians(minRotation); const ratio = (horizontal ? Math.sin(rad) : Math.cos(rad)) || 0.001; const length = 0.75 * minSpacing * ('' + value).length; return Math.min(minSpacing / ratio, length); }
        class LinearScaleBase extends Scale {
                constructor(cfg) { super(cfg); this.start = undefined; this.end = undefined; this._startValue = undefined; this._endValue = undefined; this._valueRange = 0; }
                parse(raw, index) {
                        if (isNullOrUndef(raw)) { return null; }
                        if ((typeof raw === 'number' || raw instanceof Number) && !isFinite(+raw)) { return null; }
                        return +raw;
                }
                handleTickRangeOptions() {
                        const { beginAtZero } = this.options; const { minDefined, maxDefined } = this.getUserBounds(); let { min, max } = this; const setMin = v => (min = minDefined ? min : v); const setMax = v => (max = maxDefined ? max : v); if (beginAtZero) { const minSign = sign(min); const maxSign = sign(max); if (minSign < 0 && maxSign < 0) { setMax(0); } else if (minSign > 0 && maxSign > 0) { setMin(0); } }
                        if (min === max) {
                                let offset = 1; if (max >= Number.MAX_SAFE_INTEGER || min <= Number.MIN_SAFE_INTEGER) { offset = Math.abs(max * 0.05); }
                                setMax(max + offset); if (!beginAtZero) { setMin(min - offset); }
                        }
                        this.min = min; this.max = max;
                }
                getTickLimit() {
                        const tickOpts = this.options.ticks; let { maxTicksLimit, stepSize } = tickOpts; let maxTicks; if (stepSize) { maxTicks = Math.ceil(this.max / stepSize) - Math.floor(this.min / stepSize) + 1; if (maxTicks > 1000) { console.warn(`scales.${this.id}.ticks.stepSize: ${stepSize} would result generating up to ${maxTicks} ticks. Limiting to 1000.`); maxTicks = 1000; } } else { maxTicks = this.computeTickLimit(); maxTicksLimit = maxTicksLimit || 11; }
                        if (maxTicksLimit) { maxTicks = Math.min(maxTicksLimit, maxTicks); }
                        return maxTicks;
                }
                computeTickLimit() { return Number.POSITIVE_INFINITY; }
                buildTicks() {
                        const opts = this.options; const tickOpts = opts.ticks; let maxTicks = this.getTickLimit(); maxTicks = Math.max(2, maxTicks); const numericGeneratorOptions = { maxTicks, bounds: opts.bounds, min: opts.min, max: opts.max, precision: tickOpts.precision, step: tickOpts.stepSize, count: tickOpts.count, maxDigits: this._maxDigits(), horizontal: this.isHorizontal(), minRotation: tickOpts.minRotation || 0, includeBounds: tickOpts.includeBounds !== false }; const dataRange = this._range || this; const ticks = generateTicks$1(numericGeneratorOptions, dataRange); if (opts.bounds === 'ticks') { _setMinAndMaxByKey(ticks, this, 'value'); }
                        if (opts.reverse) { ticks.reverse(); this.start = this.max; this.end = this.min; } else { this.start = this.min; this.end = this.max; }
                        return ticks;
                }
                configure() {
                        const ticks = this.ticks; let start = this.min; let end = this.max; super.configure(); if (this.options.offset && ticks.length) { const offset = (end - start) / Math.max(ticks.length - 1, 1) / 2; start -= offset; end += offset; }
                        this._startValue = start; this._endValue = end; this._valueRange = end - start;
                }
                getLabelForValue(value) { return formatNumber(value, this.chart.options.locale, this.options.ticks.format); }
        }
        class LinearScale extends LinearScaleBase {
                determineDataLimits() { const { min, max } = this.getMinMax(true); this.min = isNumberFinite(min) ? min : 0; this.max = isNumberFinite(max) ? max : 1; this.handleTickRangeOptions(); }
                computeTickLimit() { const horizontal = this.isHorizontal(); const length = horizontal ? this.width : this.height; const minRotation = toRadians(this.options.ticks.minRotation); const ratio = (horizontal ? Math.sin(minRotation) : Math.cos(minRotation)) || 0.001; const tickFont = this._resolveTickFontOptions(0); return Math.ceil(length / Math.min(40, tickFont.lineHeight / ratio)); }
                getPixelForValue(value) { return value === null ? NaN : this.getPixelForDecimal((value - this._startValue) / this._valueRange); }
                getValueForPixel(pixel) { return this._startValue + this.getDecimalForPixel(pixel) * this._valueRange; }
        }
        LinearScale.id = 'linear'; LinearScale.defaults = { ticks: { callback: Ticks.formatters.numeric } }; function isMajor(tickVal) { const remain = tickVal / (Math.pow(10, Math.floor(log10(tickVal)))); return remain === 1; }
        function generateTicks(generationOptions, dataRange) {
                const endExp = Math.floor(log10(dataRange.max)); const endSignificand = Math.ceil(dataRange.max / Math.pow(10, endExp)); const ticks = []; let tickVal = finiteOrDefault(generationOptions.min, Math.pow(10, Math.floor(log10(dataRange.min)))); let exp = Math.floor(log10(tickVal)); let significand = Math.floor(tickVal / Math.pow(10, exp)); let precision = exp < 0 ? Math.pow(10, Math.abs(exp)) : 1; do {
                        ticks.push({ value: tickVal, major: isMajor(tickVal) }); ++significand; if (significand === 10) { significand = 1; ++exp; precision = exp >= 0 ? 1 : precision; }
                        tickVal = Math.round(significand * Math.pow(10, exp) * precision) / precision;
                } while (exp < endExp || (exp === endExp && significand < endSignificand)); const lastTick = finiteOrDefault(generationOptions.max, tickVal); ticks.push({ value: lastTick, major: isMajor(tickVal) }); return ticks;
        }
        class LogarithmicScale extends Scale {
                constructor(cfg) { super(cfg); this.start = undefined; this.end = undefined; this._startValue = undefined; this._valueRange = 0; }
                parse(raw, index) {
                        const value = LinearScaleBase.prototype.parse.apply(this, [raw, index]); if (value === 0) { this._zero = true; return undefined; }
                        return isNumberFinite(value) && value > 0 ? value : null;
                }
                determineDataLimits() {
                        const { min, max } = this.getMinMax(true); this.min = isNumberFinite(min) ? Math.max(0, min) : null; this.max = isNumberFinite(max) ? Math.max(0, max) : null; if (this.options.beginAtZero) { this._zero = true; }
                        this.handleTickRangeOptions();
                }
                handleTickRangeOptions() {
                        const { minDefined, maxDefined } = this.getUserBounds(); let min = this.min; let max = this.max; const setMin = v => (min = minDefined ? min : v); const setMax = v => (max = maxDefined ? max : v); const exp = (v, m) => Math.pow(10, Math.floor(log10(v)) + m); if (min === max) { if (min <= 0) { setMin(1); setMax(10); } else { setMin(exp(min, -1)); setMax(exp(max, +1)); } }
                        if (min <= 0) { setMin(exp(max, -1)); }
                        if (max <= 0) { setMax(exp(min, +1)); }
                        if (this._zero && this.min !== this._suggestedMin && min === exp(this.min, 0)) { setMin(exp(min, -1)); }
                        this.min = min; this.max = max;
                }
                buildTicks() {
                        const opts = this.options; const generationOptions = { min: this._userMin, max: this._userMax }; const ticks = generateTicks(generationOptions, this); if (opts.bounds === 'ticks') { _setMinAndMaxByKey(ticks, this, 'value'); }
                        if (opts.reverse) { ticks.reverse(); this.start = this.max; this.end = this.min; } else { this.start = this.min; this.end = this.max; }
                        return ticks;
                }
                getLabelForValue(value) { return value === undefined ? '0' : formatNumber(value, this.chart.options.locale, this.options.ticks.format); }
                configure() { const start = this.min; super.configure(); this._startValue = log10(start); this._valueRange = log10(this.max) - log10(start); }
                getPixelForValue(value) {
                        if (value === undefined || value === 0) { value = this.min; }
                        if (value === null || isNaN(value)) { return NaN; }
                        return this.getPixelForDecimal(value === this.min ? 0 : (log10(value) - this._startValue) / this._valueRange);
                }
                getValueForPixel(pixel) { const decimal = this.getDecimalForPixel(pixel); return Math.pow(10, this._startValue + decimal * this._valueRange); }
        }
        LogarithmicScale.id = 'logarithmic'; LogarithmicScale.defaults = { ticks: { callback: Ticks.formatters.logarithmic, major: { enabled: true } } }; function getTickBackdropHeight(opts) {
                const tickOpts = opts.ticks; if (tickOpts.display && opts.display) { const padding = toPadding(tickOpts.backdropPadding); return valueOrDefault(tickOpts.font && tickOpts.font.size, defaults.font.size) + padding.height; }
                return 0;
        }
        function measureLabelSize(ctx, font, label) { label = isArray(label) ? label : [label]; return { w: _longestText(ctx, font.string, label), h: label.length * font.lineHeight }; }
        function determineLimits(angle, pos, size, min, max) {
                if (angle === min || angle === max) { return { start: pos - (size / 2), end: pos + (size / 2) }; } else if (angle < min || angle > max) { return { start: pos - size, end: pos }; }
                return { start: pos, end: pos + size };
        }
        function fitWithPointLabels(scale) {
                const orig = { l: scale.left + scale._padding.left, r: scale.right - scale._padding.right, t: scale.top + scale._padding.top, b: scale.bottom - scale._padding.bottom }; const limits = Object.assign({}, orig); const labelSizes = []; const padding = []; const valueCount = scale._pointLabels.length; const pointLabelOpts = scale.options.pointLabels; const additionalAngle = pointLabelOpts.centerPointLabels ? PI / valueCount : 0; for (let i = 0; i < valueCount; i++) { const opts = pointLabelOpts.setContext(scale.getPointLabelContext(i)); padding[i] = opts.padding; const pointPosition = scale.getPointPosition(i, scale.drawingArea + padding[i], additionalAngle); const plFont = toFont(opts.font); const textSize = measureLabelSize(scale.ctx, plFont, scale._pointLabels[i]); labelSizes[i] = textSize; const angleRadians = _normalizeAngle(scale.getIndexAngle(i) + additionalAngle); const angle = Math.round(toDegrees(angleRadians)); const hLimits = determineLimits(angle, pointPosition.x, textSize.w, 0, 180); const vLimits = determineLimits(angle, pointPosition.y, textSize.h, 90, 270); updateLimits(limits, orig, angleRadians, hLimits, vLimits); }
                scale.setCenterPoint(orig.l - limits.l, limits.r - orig.r, orig.t - limits.t, limits.b - orig.b); scale._pointLabelItems = buildPointLabelItems(scale, labelSizes, padding);
        }
        function updateLimits(limits, orig, angle, hLimits, vLimits) {
                const sin = Math.abs(Math.sin(angle)); const cos = Math.abs(Math.cos(angle)); let x = 0; let y = 0; if (hLimits.start < orig.l) { x = (orig.l - hLimits.start) / sin; limits.l = Math.min(limits.l, orig.l - x); } else if (hLimits.end > orig.r) { x = (hLimits.end - orig.r) / sin; limits.r = Math.max(limits.r, orig.r + x); }
                if (vLimits.start < orig.t) { y = (orig.t - vLimits.start) / cos; limits.t = Math.min(limits.t, orig.t - y); } else if (vLimits.end > orig.b) { y = (vLimits.end - orig.b) / cos; limits.b = Math.max(limits.b, orig.b + y); }
        }
        function buildPointLabelItems(scale, labelSizes, padding) {
                const items = []; const valueCount = scale._pointLabels.length; const opts = scale.options; const extra = getTickBackdropHeight(opts) / 2; const outerDistance = scale.drawingArea; const additionalAngle = opts.pointLabels.centerPointLabels ? PI / valueCount : 0; for (let i = 0; i < valueCount; i++) { const pointLabelPosition = scale.getPointPosition(i, outerDistance + extra + padding[i], additionalAngle); const angle = Math.round(toDegrees(_normalizeAngle(pointLabelPosition.angle + HALF_PI))); const size = labelSizes[i]; const y = yForAngle(pointLabelPosition.y, size.h, angle); const textAlign = getTextAlignForAngle(angle); const left = leftForTextAlign(pointLabelPosition.x, size.w, textAlign); items.push({ x: pointLabelPosition.x, y, textAlign, left, top: y, right: left + size.w, bottom: y + size.h }); }
                return items;
        }
        function getTextAlignForAngle(angle) {
                if (angle === 0 || angle === 180) { return 'center'; } else if (angle < 180) { return 'left'; }
                return 'right';
        }
        function leftForTextAlign(x, w, align) {
                if (align === 'right') { x -= w; } else if (align === 'center') { x -= (w / 2); }
                return x;
        }
        function yForAngle(y, h, angle) {
                if (angle === 90 || angle === 270) { y -= (h / 2); } else if (angle > 270 || angle < 90) { y -= h; }
                return y;
        }
        function drawPointLabels(scale, labelCount) {
                const { ctx, options: { pointLabels } } = scale; for (let i = labelCount - 1; i >= 0; i--) {
                        const optsAtIndex = pointLabels.setContext(scale.getPointLabelContext(i)); const plFont = toFont(optsAtIndex.font); const { x, y, textAlign, left, top, right, bottom } = scale._pointLabelItems[i]; const { backdropColor } = optsAtIndex; if (!isNullOrUndef(backdropColor)) { const borderRadius = toTRBLCorners(optsAtIndex.borderRadius); const padding = toPadding(optsAtIndex.backdropPadding); ctx.fillStyle = backdropColor; const backdropLeft = left - padding.left; const backdropTop = top - padding.top; const backdropWidth = right - left + padding.width; const backdropHeight = bottom - top + padding.height; if (Object.values(borderRadius).some(v => v !== 0)) { ctx.beginPath(); addRoundedRectPath(ctx, { x: backdropLeft, y: backdropTop, w: backdropWidth, h: backdropHeight, radius: borderRadius, }); ctx.fill(); } else { ctx.fillRect(backdropLeft, backdropTop, backdropWidth, backdropHeight); } }
                        renderText(ctx, scale._pointLabels[i], x, y + (plFont.lineHeight / 2), plFont, { color: optsAtIndex.color, textAlign: textAlign, textBaseline: 'middle' });
                }
        }
        function pathRadiusLine(scale, radius, circular, labelCount) { const { ctx } = scale; if (circular) { ctx.arc(scale.xCenter, scale.yCenter, radius, 0, TAU); } else { let pointPosition = scale.getPointPosition(0, radius); ctx.moveTo(pointPosition.x, pointPosition.y); for (let i = 1; i < labelCount; i++) { pointPosition = scale.getPointPosition(i, radius); ctx.lineTo(pointPosition.x, pointPosition.y); } } }
        function drawRadiusLine(scale, gridLineOpts, radius, labelCount) {
                const ctx = scale.ctx; const circular = gridLineOpts.circular; const { color, lineWidth } = gridLineOpts; if ((!circular && !labelCount) || !color || !lineWidth || radius < 0) { return; }
                ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.setLineDash(gridLineOpts.borderDash); ctx.lineDashOffset = gridLineOpts.borderDashOffset; ctx.beginPath(); pathRadiusLine(scale, radius, circular, labelCount); ctx.closePath(); ctx.stroke(); ctx.restore();
        }
        function createPointLabelContext(parent, index, label) { return createContext(parent, { label, index, type: 'pointLabel' }); }
        class RadialLinearScale extends LinearScaleBase {
                constructor(cfg) { super(cfg); this.xCenter = undefined; this.yCenter = undefined; this.drawingArea = undefined; this._pointLabels = []; this._pointLabelItems = []; }
                setDimensions() { const padding = this._padding = toPadding(getTickBackdropHeight(this.options) / 2); const w = this.width = this.maxWidth - padding.width; const h = this.height = this.maxHeight - padding.height; this.xCenter = Math.floor(this.left + w / 2 + padding.left); this.yCenter = Math.floor(this.top + h / 2 + padding.top); this.drawingArea = Math.floor(Math.min(w, h) / 2); }
                determineDataLimits() { const { min, max } = this.getMinMax(false); this.min = isNumberFinite(min) && !isNaN(min) ? min : 0; this.max = isNumberFinite(max) && !isNaN(max) ? max : 0; this.handleTickRangeOptions(); }
                computeTickLimit() { return Math.ceil(this.drawingArea / getTickBackdropHeight(this.options)); }
                generateTickLabels(ticks) { LinearScaleBase.prototype.generateTickLabels.call(this, ticks); this._pointLabels = this.getLabels().map((value, index) => { const label = callback(this.options.pointLabels.callback, [value, index], this); return label || label === 0 ? label : ''; }).filter((v, i) => this.chart.getDataVisibility(i)); }
                fit() { const opts = this.options; if (opts.display && opts.pointLabels.display) { fitWithPointLabels(this); } else { this.setCenterPoint(0, 0, 0, 0); } }
                setCenterPoint(leftMovement, rightMovement, topMovement, bottomMovement) { this.xCenter += Math.floor((leftMovement - rightMovement) / 2); this.yCenter += Math.floor((topMovement - bottomMovement) / 2); this.drawingArea -= Math.min(this.drawingArea / 2, Math.max(leftMovement, rightMovement, topMovement, bottomMovement)); }
                getIndexAngle(index) { const angleMultiplier = TAU / (this._pointLabels.length || 1); const startAngle = this.options.startAngle || 0; return _normalizeAngle(index * angleMultiplier + toRadians(startAngle)); }
                getDistanceFromCenterForValue(value) {
                        if (isNullOrUndef(value)) { return NaN; }
                        const scalingFactor = this.drawingArea / (this.max - this.min); if (this.options.reverse) { return (this.max - value) * scalingFactor; }
                        return (value - this.min) * scalingFactor;
                }
                getValueForDistanceFromCenter(distance) {
                        if (isNullOrUndef(distance)) { return NaN; }
                        const scaledDistance = distance / (this.drawingArea / (this.max - this.min)); return this.options.reverse ? this.max - scaledDistance : this.min + scaledDistance;
                }
                getPointLabelContext(index) { const pointLabels = this._pointLabels || []; if (index >= 0 && index < pointLabels.length) { const pointLabel = pointLabels[index]; return createPointLabelContext(this.getContext(), index, pointLabel); } }
                getPointPosition(index, distanceFromCenter, additionalAngle = 0) { const angle = this.getIndexAngle(index) - HALF_PI + additionalAngle; return { x: Math.cos(angle) * distanceFromCenter + this.xCenter, y: Math.sin(angle) * distanceFromCenter + this.yCenter, angle }; }
                getPointPositionForValue(index, value) { return this.getPointPosition(index, this.getDistanceFromCenterForValue(value)); }
                getBasePosition(index) { return this.getPointPositionForValue(index || 0, this.getBaseValue()); }
                getPointLabelPosition(index) { const { left, top, right, bottom } = this._pointLabelItems[index]; return { left, top, right, bottom, }; }
                drawBackground() { const { backgroundColor, grid: { circular } } = this.options; if (backgroundColor) { const ctx = this.ctx; ctx.save(); ctx.beginPath(); pathRadiusLine(this, this.getDistanceFromCenterForValue(this._endValue), circular, this._pointLabels.length); ctx.closePath(); ctx.fillStyle = backgroundColor; ctx.fill(); ctx.restore(); } }
                drawGrid() {
                        const ctx = this.ctx; const opts = this.options; const { angleLines, grid } = opts; const labelCount = this._pointLabels.length; let i, offset, position; if (opts.pointLabels.display) { drawPointLabels(this, labelCount); }
                        if (grid.display) { this.ticks.forEach((tick, index) => { if (index !== 0) { offset = this.getDistanceFromCenterForValue(tick.value); const optsAtIndex = grid.setContext(this.getContext(index - 1)); drawRadiusLine(this, optsAtIndex, offset, labelCount); } }); }
                        if (angleLines.display) {
                                ctx.save(); for (i = labelCount - 1; i >= 0; i--) {
                                        const optsAtIndex = angleLines.setContext(this.getPointLabelContext(i)); const { color, lineWidth } = optsAtIndex; if (!lineWidth || !color) { continue; }
                                        ctx.lineWidth = lineWidth; ctx.strokeStyle = color; ctx.setLineDash(optsAtIndex.borderDash); ctx.lineDashOffset = optsAtIndex.borderDashOffset; offset = this.getDistanceFromCenterForValue(opts.ticks.reverse ? this.min : this.max); position = this.getPointPosition(i, offset); ctx.beginPath(); ctx.moveTo(this.xCenter, this.yCenter); ctx.lineTo(position.x, position.y); ctx.stroke();
                                }
                                ctx.restore();
                        }
                }
                drawBorder() { }
                drawLabels() {
                        const ctx = this.ctx; const opts = this.options; const tickOpts = opts.ticks; if (!tickOpts.display) { return; }
                        const startAngle = this.getIndexAngle(0); let offset, width; ctx.save(); ctx.translate(this.xCenter, this.yCenter); ctx.rotate(startAngle); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; this.ticks.forEach((tick, index) => {
                                if (index === 0 && !opts.reverse) { return; }
                                const optsAtIndex = tickOpts.setContext(this.getContext(index)); const tickFont = toFont(optsAtIndex.font); offset = this.getDistanceFromCenterForValue(this.ticks[index].value); if (optsAtIndex.showLabelBackdrop) { ctx.font = tickFont.string; width = ctx.measureText(tick.label).width; ctx.fillStyle = optsAtIndex.backdropColor; const padding = toPadding(optsAtIndex.backdropPadding); ctx.fillRect(-width / 2 - padding.left, -offset - tickFont.size / 2 - padding.top, width + padding.width, tickFont.size + padding.height); }
                                renderText(ctx, tick.label, 0, -offset, tickFont, { color: optsAtIndex.color, });
                        }); ctx.restore();
                }
                drawTitle() { }
        }
        RadialLinearScale.id = 'radialLinear'; RadialLinearScale.defaults = { display: true, animate: true, position: 'chartArea', angleLines: { display: true, lineWidth: 1, borderDash: [], borderDashOffset: 0.0 }, grid: { circular: false }, startAngle: 0, ticks: { showLabelBackdrop: true, callback: Ticks.formatters.numeric }, pointLabels: { backdropColor: undefined, backdropPadding: 2, display: true, font: { size: 10 }, callback(label) { return label; }, padding: 5, centerPointLabels: false } }; RadialLinearScale.defaultRoutes = { 'angleLines.color': 'borderColor', 'pointLabels.color': 'color', 'ticks.color': 'color' }; RadialLinearScale.descriptors = { angleLines: { _fallback: 'grid' } }; const INTERVALS = { millisecond: { common: true, size: 1, steps: 1000 }, second: { common: true, size: 1000, steps: 60 }, minute: { common: true, size: 60000, steps: 60 }, hour: { common: true, size: 3600000, steps: 24 }, day: { common: true, size: 86400000, steps: 30 }, week: { common: false, size: 604800000, steps: 4 }, month: { common: true, size: 2.628e9, steps: 12 }, quarter: { common: false, size: 7.884e9, steps: 4 }, year: { common: true, size: 3.154e10 } }; const UNITS = (Object.keys(INTERVALS)); function sorter(a, b) { return a - b; }
        function parse(scale, input) {
                if (isNullOrUndef(input)) { return null; }
                const adapter = scale._adapter; const { parser, round, isoWeekday } = scale._parseOpts; let value = input; if (typeof parser === 'function') { value = parser(value); }
                if (!isNumberFinite(value)) { value = typeof parser === 'string' ? adapter.parse(value, parser) : adapter.parse(value); }
                if (value === null) { return null; }
                if (round) { value = round === 'week' && (isNumber(isoWeekday) || isoWeekday === true) ? adapter.startOf(value, 'isoWeek', isoWeekday) : adapter.startOf(value, round); }
                return +value;
        }
        function determineUnitForAutoTicks(minUnit, min, max, capacity) {
                const ilen = UNITS.length; for (let i = UNITS.indexOf(minUnit); i < ilen - 1; ++i) { const interval = INTERVALS[UNITS[i]]; const factor = interval.steps ? interval.steps : Number.MAX_SAFE_INTEGER; if (interval.common && Math.ceil((max - min) / (factor * interval.size)) <= capacity) { return UNITS[i]; } }
                return UNITS[ilen - 1];
        }
        function determineUnitForFormatting(scale, numTicks, minUnit, min, max) {
                for (let i = UNITS.length - 1; i >= UNITS.indexOf(minUnit); i--) { const unit = UNITS[i]; if (INTERVALS[unit].common && scale._adapter.diff(max, min, unit) >= numTicks - 1) { return unit; } }
                return UNITS[minUnit ? UNITS.indexOf(minUnit) : 0];
        }
        function determineMajorUnit(unit) { for (let i = UNITS.indexOf(unit) + 1, ilen = UNITS.length; i < ilen; ++i) { if (INTERVALS[UNITS[i]].common) { return UNITS[i]; } } }
        function addTick(ticks, time, timestamps) { if (!timestamps) { ticks[time] = true; } else if (timestamps.length) { const { lo, hi } = _lookup(timestamps, time); const timestamp = timestamps[lo] >= time ? timestamps[lo] : timestamps[hi]; ticks[timestamp] = true; } }
        function setMajorTicks(scale, ticks, map, majorUnit) {
                const adapter = scale._adapter; const first = +adapter.startOf(ticks[0].value, majorUnit); const last = ticks[ticks.length - 1].value; let major, index; for (major = first; major <= last; major = +adapter.add(major, 1, majorUnit)) { index = map[major]; if (index >= 0) { ticks[index].major = true; } }
                return ticks;
        }
        function ticksFromTimestamps(scale, values, majorUnit) {
                const ticks = []; const map = {}; const ilen = values.length; let i, value; for (i = 0; i < ilen; ++i) { value = values[i]; map[value] = i; ticks.push({ value, major: false }); }
                return (ilen === 0 || !majorUnit) ? ticks : setMajorTicks(scale, ticks, map, majorUnit);
        }
        class TimeScale extends Scale {
                constructor(props) { super(props); this._cache = { data: [], labels: [], all: [] }; this._unit = 'day'; this._majorUnit = undefined; this._offsets = {}; this._normalized = false; this._parseOpts = undefined; }
                init(scaleOpts, opts) { const time = scaleOpts.time || (scaleOpts.time = {}); const adapter = this._adapter = new _adapters._date(scaleOpts.adapters.date); mergeIf(time.displayFormats, adapter.formats()); this._parseOpts = { parser: time.parser, round: time.round, isoWeekday: time.isoWeekday }; super.init(scaleOpts); this._normalized = opts.normalized; }
                parse(raw, index) {
                        if (raw === undefined) { return null; }
                        return parse(this, raw);
                }
                beforeLayout() { super.beforeLayout(); this._cache = { data: [], labels: [], all: [] }; }
                determineDataLimits() {
                        const options = this.options; const adapter = this._adapter; const unit = options.time.unit || 'day'; let { min, max, minDefined, maxDefined } = this.getUserBounds(); function _applyBounds(bounds) {
                                if (!minDefined && !isNaN(bounds.min)) { min = Math.min(min, bounds.min); }
                                if (!maxDefined && !isNaN(bounds.max)) { max = Math.max(max, bounds.max); }
                        }
                        if (!minDefined || !maxDefined) { _applyBounds(this._getLabelBounds()); if (options.bounds !== 'ticks' || options.ticks.source !== 'labels') { _applyBounds(this.getMinMax(false)); } }
                        min = isNumberFinite(min) && !isNaN(min) ? min : +adapter.startOf(Date.now(), unit); max = isNumberFinite(max) && !isNaN(max) ? max : +adapter.endOf(Date.now(), unit) + 1; this.min = Math.min(min, max - 1); this.max = Math.max(min + 1, max);
                }
                _getLabelBounds() {
                        const arr = this.getLabelTimestamps(); let min = Number.POSITIVE_INFINITY; let max = Number.NEGATIVE_INFINITY; if (arr.length) { min = arr[0]; max = arr[arr.length - 1]; }
                        return { min, max };
                }
                buildTicks() {
                        const options = this.options; const timeOpts = options.time; const tickOpts = options.ticks; const timestamps = tickOpts.source === 'labels' ? this.getLabelTimestamps() : this._generate(); if (options.bounds === 'ticks' && timestamps.length) { this.min = this._userMin || timestamps[0]; this.max = this._userMax || timestamps[timestamps.length - 1]; }
                        const min = this.min; const max = this.max; const ticks = _filterBetween(timestamps, min, max); this._unit = timeOpts.unit || (tickOpts.autoSkip ? determineUnitForAutoTicks(timeOpts.minUnit, this.min, this.max, this._getLabelCapacity(min)) : determineUnitForFormatting(this, ticks.length, timeOpts.minUnit, this.min, this.max)); this._majorUnit = !tickOpts.major.enabled || this._unit === 'year' ? undefined : determineMajorUnit(this._unit); this.initOffsets(timestamps); if (options.reverse) { ticks.reverse(); }
                        return ticksFromTimestamps(this, ticks, this._majorUnit);
                }
                afterAutoSkip() { if (this.options.offsetAfterAutoskip) { this.initOffsets(this.ticks.map(tick => +tick.value)); } }
                initOffsets(timestamps) {
                        let start = 0; let end = 0; let first, last; if (this.options.offset && timestamps.length) {
                                first = this.getDecimalForValue(timestamps[0]); if (timestamps.length === 1) { start = 1 - first; } else { start = (this.getDecimalForValue(timestamps[1]) - first) / 2; }
                                last = this.getDecimalForValue(timestamps[timestamps.length - 1]); if (timestamps.length === 1) { end = last; } else { end = (last - this.getDecimalForValue(timestamps[timestamps.length - 2])) / 2; }
                        }
                        const limit = timestamps.length < 3 ? 0.5 : 0.25; start = _limitValue(start, 0, limit); end = _limitValue(end, 0, limit); this._offsets = { start, end, factor: 1 / (start + 1 + end) };
                }
                _generate() {
                        const adapter = this._adapter; const min = this.min; const max = this.max; const options = this.options; const timeOpts = options.time; const minor = timeOpts.unit || determineUnitForAutoTicks(timeOpts.minUnit, min, max, this._getLabelCapacity(min)); const stepSize = valueOrDefault(timeOpts.stepSize, 1); const weekday = minor === 'week' ? timeOpts.isoWeekday : false; const hasWeekday = isNumber(weekday) || weekday === true; const ticks = {}; let first = min; let time, count; if (hasWeekday) { first = +adapter.startOf(first, 'isoWeek', weekday); }
                        first = +adapter.startOf(first, hasWeekday ? 'day' : minor); if (adapter.diff(max, min, minor) > 100000 * stepSize) { throw new Error(min + ' and ' + max + ' are too far apart with stepSize of ' + stepSize + ' ' + minor); }
                        const timestamps = options.ticks.source === 'data' && this.getDataTimestamps(); for (time = first, count = 0; time < max; time = +adapter.add(time, stepSize, minor), count++) { addTick(ticks, time, timestamps); }
                        if (time === max || options.bounds === 'ticks' || count === 1) { addTick(ticks, time, timestamps); }
                        return Object.keys(ticks).sort((a, b) => a - b).map(x => +x);
                }
                getLabelForValue(value) {
                        const adapter = this._adapter; const timeOpts = this.options.time; if (timeOpts.tooltipFormat) { return adapter.format(value, timeOpts.tooltipFormat); }
                        return adapter.format(value, timeOpts.displayFormats.datetime);
                }
                _tickFormatFunction(time, index, ticks, format) { const options = this.options; const formats = options.time.displayFormats; const unit = this._unit; const majorUnit = this._majorUnit; const minorFormat = unit && formats[unit]; const majorFormat = majorUnit && formats[majorUnit]; const tick = ticks[index]; const major = majorUnit && majorFormat && tick && tick.major; const label = this._adapter.format(time, format || (major ? majorFormat : minorFormat)); const formatter = options.ticks.callback; return formatter ? callback(formatter, [label, index, ticks], this) : label; }
                generateTickLabels(ticks) { let i, ilen, tick; for (i = 0, ilen = ticks.length; i < ilen; ++i) { tick = ticks[i]; tick.label = this._tickFormatFunction(tick.value, i, ticks); } }
                getDecimalForValue(value) { return value === null ? NaN : (value - this.min) / (this.max - this.min); }
                getPixelForValue(value) { const offsets = this._offsets; const pos = this.getDecimalForValue(value); return this.getPixelForDecimal((offsets.start + pos) * offsets.factor); }
                getValueForPixel(pixel) { const offsets = this._offsets; const pos = this.getDecimalForPixel(pixel) / offsets.factor - offsets.end; return this.min + pos * (this.max - this.min); }
                _getLabelSize(label) { const ticksOpts = this.options.ticks; const tickLabelWidth = this.ctx.measureText(label).width; const angle = toRadians(this.isHorizontal() ? ticksOpts.maxRotation : ticksOpts.minRotation); const cosRotation = Math.cos(angle); const sinRotation = Math.sin(angle); const tickFontSize = this._resolveTickFontOptions(0).size; return { w: (tickLabelWidth * cosRotation) + (tickFontSize * sinRotation), h: (tickLabelWidth * sinRotation) + (tickFontSize * cosRotation) }; }
                _getLabelCapacity(exampleTime) { const timeOpts = this.options.time; const displayFormats = timeOpts.displayFormats; const format = displayFormats[timeOpts.unit] || displayFormats.millisecond; const exampleLabel = this._tickFormatFunction(exampleTime, 0, ticksFromTimestamps(this, [exampleTime], this._majorUnit), format); const size = this._getLabelSize(exampleLabel); const capacity = Math.floor(this.isHorizontal() ? this.width / size.w : this.height / size.h) - 1; return capacity > 0 ? capacity : 1; }
                getDataTimestamps() {
                        let timestamps = this._cache.data || []; let i, ilen; if (timestamps.length) { return timestamps; }
                        const metas = this.getMatchingVisibleMetas(); if (this._normalized && metas.length) { return (this._cache.data = metas[0].controller.getAllParsedValues(this)); }
                        for (i = 0, ilen = metas.length; i < ilen; ++i) { timestamps = timestamps.concat(metas[i].controller.getAllParsedValues(this)); }
                        return (this._cache.data = this.normalize(timestamps));
                }
                getLabelTimestamps() {
                        const timestamps = this._cache.labels || []; let i, ilen; if (timestamps.length) { return timestamps; }
                        const labels = this.getLabels(); for (i = 0, ilen = labels.length; i < ilen; ++i) { timestamps.push(parse(this, labels[i])); }
                        return (this._cache.labels = this._normalized ? timestamps : this.normalize(timestamps));
                }
                normalize(values) { return _arrayUnique(values.sort(sorter)); }
        }
        TimeScale.id = 'time'; TimeScale.defaults = { bounds: 'data', adapters: {}, time: { parser: false, unit: false, round: false, isoWeekday: false, minUnit: 'millisecond', displayFormats: {} }, ticks: { source: 'auto', major: { enabled: false } } }; function interpolate(table, val, reverse) {
                let lo = 0; let hi = table.length - 1; let prevSource, nextSource, prevTarget, nextTarget; if (reverse) {
                        if (val >= table[lo].pos && val <= table[hi].pos) { ({ lo, hi } = _lookupByKey(table, 'pos', val)); }
                        ({ pos: prevSource, time: prevTarget } = table[lo]); ({ pos: nextSource, time: nextTarget } = table[hi]);
                } else {
                        if (val >= table[lo].time && val <= table[hi].time) { ({ lo, hi } = _lookupByKey(table, 'time', val)); }
                        ({ time: prevSource, pos: prevTarget } = table[lo]); ({ time: nextSource, pos: nextTarget } = table[hi]);
                }
                const span = nextSource - prevSource; return span ? prevTarget + (nextTarget - prevTarget) * (val - prevSource) / span : prevTarget;
        }
        class TimeSeriesScale extends TimeScale {
                constructor(props) { super(props); this._table = []; this._minPos = undefined; this._tableRange = undefined; }
                initOffsets() { const timestamps = this._getTimestampsForTable(); const table = this._table = this.buildLookupTable(timestamps); this._minPos = interpolate(table, this.min); this._tableRange = interpolate(table, this.max) - this._minPos; super.initOffsets(timestamps); }
                buildLookupTable(timestamps) {
                        const { min, max } = this; const items = []; const table = []; let i, ilen, prev, curr, next; for (i = 0, ilen = timestamps.length; i < ilen; ++i) { curr = timestamps[i]; if (curr >= min && curr <= max) { items.push(curr); } }
                        if (items.length < 2) { return [{ time: min, pos: 0 }, { time: max, pos: 1 }]; }
                        for (i = 0, ilen = items.length; i < ilen; ++i) { next = items[i + 1]; prev = items[i - 1]; curr = items[i]; if (Math.round((next + prev) / 2) !== curr) { table.push({ time: curr, pos: i / (ilen - 1) }); } }
                        return table;
                }
                _getTimestampsForTable() {
                        let timestamps = this._cache.all || []; if (timestamps.length) { return timestamps; }
                        const data = this.getDataTimestamps(); const label = this.getLabelTimestamps(); if (data.length && label.length) { timestamps = this.normalize(data.concat(label)); } else { timestamps = data.length ? data : label; }
                        timestamps = this._cache.all = timestamps; return timestamps;
                }
                getDecimalForValue(value) { return (interpolate(this._table, value) - this._minPos) / this._tableRange; }
                getValueForPixel(pixel) { const offsets = this._offsets; const decimal = this.getDecimalForPixel(pixel) / offsets.factor - offsets.end; return interpolate(this._table, decimal * this._tableRange + this._minPos, true); }
        }
        TimeSeriesScale.id = 'timeseries'; TimeSeriesScale.defaults = TimeScale.defaults; var scales = Object.freeze({ __proto__: null, CategoryScale: CategoryScale, LinearScale: LinearScale, LogarithmicScale: LogarithmicScale, RadialLinearScale: RadialLinearScale, TimeScale: TimeScale, TimeSeriesScale: TimeSeriesScale }); Chart.register(controllers, scales, elements, plugins); Chart.helpers = { ...helpers }; Chart._adapters = _adapters; Chart.Animation = Animation; Chart.Animations = Animations; Chart.animator = animator; Chart.controllers = registry.controllers.items; Chart.DatasetController = DatasetController; Chart.Element = Element; Chart.elements = elements; Chart.Interaction = Interaction; Chart.layouts = layouts; Chart.platforms = platforms; Chart.Scale = Scale; Chart.Ticks = Ticks; Object.assign(Chart, controllers, scales, elements, plugins, platforms); Chart.Chart = Chart; if (typeof window !== 'undefined') { window.Chart = Chart; }
        return Chart;
})); (function (global, factory) { typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.markdownit = factory()); })(this, (function () {
        "use strict"; function createCommonjsModule(fn, basedir, module) { return module = { path: basedir, exports: {}, require: function (path, base) { return commonjsRequire(path, base === undefined || base === null ? module.path : base); } }, fn(module, module.exports), module.exports; }
        function getAugmentedNamespace(n) { if (n.__esModule) return n; var a = Object.defineProperty({}, "__esModule", { value: true }); Object.keys(n).forEach((function (k) { var d = Object.getOwnPropertyDescriptor(n, k); Object.defineProperty(a, k, d.get ? d : { enumerable: true, get: function () { return n[k]; } }); })); return a; }
        function commonjsRequire() { throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs"); }
        var require$$0 = { Aacute: "\xc1", aacute: "\xe1", Abreve: "\u0102", abreve: "\u0103", ac: "\u223e", acd: "\u223f", acE: "\u223e\u0333", Acirc: "\xc2", acirc: "\xe2", acute: "\xb4", Acy: "\u0410", acy: "\u0430", AElig: "\xc6", aelig: "\xe6", af: "\u2061", Afr: "\ud835\udd04", afr: "\ud835\udd1e", Agrave: "\xc0", agrave: "\xe0", alefsym: "\u2135", aleph: "\u2135", Alpha: "\u0391", alpha: "\u03b1", Amacr: "\u0100", amacr: "\u0101", amalg: "\u2a3f", amp: "&", AMP: "&", andand: "\u2a55", And: "\u2a53", and: "\u2227", andd: "\u2a5c", andslope: "\u2a58", andv: "\u2a5a", ang: "\u2220", ange: "\u29a4", angle: "\u2220", angmsdaa: "\u29a8", angmsdab: "\u29a9", angmsdac: "\u29aa", angmsdad: "\u29ab", angmsdae: "\u29ac", angmsdaf: "\u29ad", angmsdag: "\u29ae", angmsdah: "\u29af", angmsd: "\u2221", angrt: "\u221f", angrtvb: "\u22be", angrtvbd: "\u299d", angsph: "\u2222", angst: "\xc5", angzarr: "\u237c", Aogon: "\u0104", aogon: "\u0105", Aopf: "\ud835\udd38", aopf: "\ud835\udd52", apacir: "\u2a6f", ap: "\u2248", apE: "\u2a70", ape: "\u224a", apid: "\u224b", apos: "'", ApplyFunction: "\u2061", approx: "\u2248", approxeq: "\u224a", Aring: "\xc5", aring: "\xe5", Ascr: "\ud835\udc9c", ascr: "\ud835\udcb6", Assign: "\u2254", ast: "*", asymp: "\u2248", asympeq: "\u224d", Atilde: "\xc3", atilde: "\xe3", Auml: "\xc4", auml: "\xe4", awconint: "\u2233", awint: "\u2a11", backcong: "\u224c", backepsilon: "\u03f6", backprime: "\u2035", backsim: "\u223d", backsimeq: "\u22cd", Backslash: "\u2216", Barv: "\u2ae7", barvee: "\u22bd", barwed: "\u2305", Barwed: "\u2306", barwedge: "\u2305", bbrk: "\u23b5", bbrktbrk: "\u23b6", bcong: "\u224c", Bcy: "\u0411", bcy: "\u0431", bdquo: "\u201e", becaus: "\u2235", because: "\u2235", Because: "\u2235", bemptyv: "\u29b0", bepsi: "\u03f6", bernou: "\u212c", Bernoullis: "\u212c", Beta: "\u0392", beta: "\u03b2", beth: "\u2136", between: "\u226c", Bfr: "\ud835\udd05", bfr: "\ud835\udd1f", bigcap: "\u22c2", bigcirc: "\u25ef", bigcup: "\u22c3", bigodot: "\u2a00", bigoplus: "\u2a01", bigotimes: "\u2a02", bigsqcup: "\u2a06", bigstar: "\u2605", bigtriangledown: "\u25bd", bigtriangleup: "\u25b3", biguplus: "\u2a04", bigvee: "\u22c1", bigwedge: "\u22c0", bkarow: "\u290d", blacklozenge: "\u29eb", blacksquare: "\u25aa", blacktriangle: "\u25b4", blacktriangledown: "\u25be", blacktriangleleft: "\u25c2", blacktriangleright: "\u25b8", blank: "\u2423", blk12: "\u2592", blk14: "\u2591", blk34: "\u2593", block: "\u2588", bne: "=\u20e5", bnequiv: "\u2261\u20e5", bNot: "\u2aed", bnot: "\u2310", Bopf: "\ud835\udd39", bopf: "\ud835\udd53", bot: "\u22a5", bottom: "\u22a5", bowtie: "\u22c8", boxbox: "\u29c9", boxdl: "\u2510", boxdL: "\u2555", boxDl: "\u2556", boxDL: "\u2557", boxdr: "\u250c", boxdR: "\u2552", boxDr: "\u2553", boxDR: "\u2554", boxh: "\u2500", boxH: "\u2550", boxhd: "\u252c", boxHd: "\u2564", boxhD: "\u2565", boxHD: "\u2566", boxhu: "\u2534", boxHu: "\u2567", boxhU: "\u2568", boxHU: "\u2569", boxminus: "\u229f", boxplus: "\u229e", boxtimes: "\u22a0", boxul: "\u2518", boxuL: "\u255b", boxUl: "\u255c", boxUL: "\u255d", boxur: "\u2514", boxuR: "\u2558", boxUr: "\u2559", boxUR: "\u255a", boxv: "\u2502", boxV: "\u2551", boxvh: "\u253c", boxvH: "\u256a", boxVh: "\u256b", boxVH: "\u256c", boxvl: "\u2524", boxvL: "\u2561", boxVl: "\u2562", boxVL: "\u2563", boxvr: "\u251c", boxvR: "\u255e", boxVr: "\u255f", boxVR: "\u2560", bprime: "\u2035", breve: "\u02d8", Breve: "\u02d8", brvbar: "\xa6", bscr: "\ud835\udcb7", Bscr: "\u212c", bsemi: "\u204f", bsim: "\u223d", bsime: "\u22cd", bsolb: "\u29c5", bsol: "\\", bsolhsub: "\u27c8", bull: "\u2022", bullet: "\u2022", bump: "\u224e", bumpE: "\u2aae", bumpe: "\u224f", Bumpeq: "\u224e", bumpeq: "\u224f", Cacute: "\u0106", cacute: "\u0107", capand: "\u2a44", capbrcup: "\u2a49", capcap: "\u2a4b", cap: "\u2229", Cap: "\u22d2", capcup: "\u2a47", capdot: "\u2a40", CapitalDifferentialD: "\u2145", caps: "\u2229\ufe00", caret: "\u2041", caron: "\u02c7", Cayleys: "\u212d", ccaps: "\u2a4d", Ccaron: "\u010c", ccaron: "\u010d", Ccedil: "\xc7", ccedil: "\xe7", Ccirc: "\u0108", ccirc: "\u0109", Cconint: "\u2230", ccups: "\u2a4c", ccupssm: "\u2a50", Cdot: "\u010a", cdot: "\u010b", cedil: "\xb8", Cedilla: "\xb8", cemptyv: "\u29b2", cent: "\xa2", centerdot: "\xb7", CenterDot: "\xb7", cfr: "\ud835\udd20", Cfr: "\u212d", CHcy: "\u0427", chcy: "\u0447", check: "\u2713", checkmark: "\u2713", Chi: "\u03a7", chi: "\u03c7", circ: "\u02c6", circeq: "\u2257", circlearrowleft: "\u21ba", circlearrowright: "\u21bb", circledast: "\u229b", circledcirc: "\u229a", circleddash: "\u229d", CircleDot: "\u2299", circledR: "\xae", circledS: "\u24c8", CircleMinus: "\u2296", CirclePlus: "\u2295", CircleTimes: "\u2297", cir: "\u25cb", cirE: "\u29c3", cire: "\u2257", cirfnint: "\u2a10", cirmid: "\u2aef", cirscir: "\u29c2", ClockwiseContourIntegral: "\u2232", CloseCurlyDoubleQuote: "\u201d", CloseCurlyQuote: "\u2019", clubs: "\u2663", clubsuit: "\u2663", colon: ":", Colon: "\u2237", Colone: "\u2a74", colone: "\u2254", coloneq: "\u2254", comma: ",", commat: "@", comp: "\u2201", compfn: "\u2218", complement: "\u2201", complexes: "\u2102", cong: "\u2245", congdot: "\u2a6d", Congruent: "\u2261", conint: "\u222e", Conint: "\u222f", ContourIntegral: "\u222e", copf: "\ud835\udd54", Copf: "\u2102", coprod: "\u2210", Coproduct: "\u2210", copy: "\xa9", COPY: "\xa9", copysr: "\u2117", CounterClockwiseContourIntegral: "\u2233", crarr: "\u21b5", cross: "\u2717", Cross: "\u2a2f", Cscr: "\ud835\udc9e", cscr: "\ud835\udcb8", csub: "\u2acf", csube: "\u2ad1", csup: "\u2ad0", csupe: "\u2ad2", ctdot: "\u22ef", cudarrl: "\u2938", cudarrr: "\u2935", cuepr: "\u22de", cuesc: "\u22df", cularr: "\u21b6", cularrp: "\u293d", cupbrcap: "\u2a48", cupcap: "\u2a46", CupCap: "\u224d", cup: "\u222a", Cup: "\u22d3", cupcup: "\u2a4a", cupdot: "\u228d", cupor: "\u2a45", cups: "\u222a\ufe00", curarr: "\u21b7", curarrm: "\u293c", curlyeqprec: "\u22de", curlyeqsucc: "\u22df", curlyvee: "\u22ce", curlywedge: "\u22cf", curren: "\xa4", curvearrowleft: "\u21b6", curvearrowright: "\u21b7", cuvee: "\u22ce", cuwed: "\u22cf", cwconint: "\u2232", cwint: "\u2231", cylcty: "\u232d", dagger: "\u2020", Dagger: "\u2021", daleth: "\u2138", darr: "\u2193", Darr: "\u21a1", dArr: "\u21d3", dash: "\u2010", Dashv: "\u2ae4", dashv: "\u22a3", dbkarow: "\u290f", dblac: "\u02dd", Dcaron: "\u010e", dcaron: "\u010f", Dcy: "\u0414", dcy: "\u0434", ddagger: "\u2021", ddarr: "\u21ca", DD: "\u2145", dd: "\u2146", DDotrahd: "\u2911", ddotseq: "\u2a77", deg: "\xb0", Del: "\u2207", Delta: "\u0394", delta: "\u03b4", demptyv: "\u29b1", dfisht: "\u297f", Dfr: "\ud835\udd07", dfr: "\ud835\udd21", dHar: "\u2965", dharl: "\u21c3", dharr: "\u21c2", DiacriticalAcute: "\xb4", DiacriticalDot: "\u02d9", DiacriticalDoubleAcute: "\u02dd", DiacriticalGrave: "`", DiacriticalTilde: "\u02dc", diam: "\u22c4", diamond: "\u22c4", Diamond: "\u22c4", diamondsuit: "\u2666", diams: "\u2666", die: "\xa8", DifferentialD: "\u2146", digamma: "\u03dd", disin: "\u22f2", div: "\xf7", divide: "\xf7", divideontimes: "\u22c7", divonx: "\u22c7", DJcy: "\u0402", djcy: "\u0452", dlcorn: "\u231e", dlcrop: "\u230d", dollar: "$", Dopf: "\ud835\udd3b", dopf: "\ud835\udd55", Dot: "\xa8", dot: "\u02d9", DotDot: "\u20dc", doteq: "\u2250", doteqdot: "\u2251", DotEqual: "\u2250", dotminus: "\u2238", dotplus: "\u2214", dotsquare: "\u22a1", doublebarwedge: "\u2306", DoubleContourIntegral: "\u222f", DoubleDot: "\xa8", DoubleDownArrow: "\u21d3", DoubleLeftArrow: "\u21d0", DoubleLeftRightArrow: "\u21d4", DoubleLeftTee: "\u2ae4", DoubleLongLeftArrow: "\u27f8", DoubleLongLeftRightArrow: "\u27fa", DoubleLongRightArrow: "\u27f9", DoubleRightArrow: "\u21d2", DoubleRightTee: "\u22a8", DoubleUpArrow: "\u21d1", DoubleUpDownArrow: "\u21d5", DoubleVerticalBar: "\u2225", DownArrowBar: "\u2913", downarrow: "\u2193", DownArrow: "\u2193", Downarrow: "\u21d3", DownArrowUpArrow: "\u21f5", DownBreve: "\u0311", downdownarrows: "\u21ca", downharpoonleft: "\u21c3", downharpoonright: "\u21c2", DownLeftRightVector: "\u2950", DownLeftTeeVector: "\u295e", DownLeftVectorBar: "\u2956", DownLeftVector: "\u21bd", DownRightTeeVector: "\u295f", DownRightVectorBar: "\u2957", DownRightVector: "\u21c1", DownTeeArrow: "\u21a7", DownTee: "\u22a4", drbkarow: "\u2910", drcorn: "\u231f", drcrop: "\u230c", Dscr: "\ud835\udc9f", dscr: "\ud835\udcb9", DScy: "\u0405", dscy: "\u0455", dsol: "\u29f6", Dstrok: "\u0110", dstrok: "\u0111", dtdot: "\u22f1", dtri: "\u25bf", dtrif: "\u25be", duarr: "\u21f5", duhar: "\u296f", dwangle: "\u29a6", DZcy: "\u040f", dzcy: "\u045f", dzigrarr: "\u27ff", Eacute: "\xc9", eacute: "\xe9", easter: "\u2a6e", Ecaron: "\u011a", ecaron: "\u011b", Ecirc: "\xca", ecirc: "\xea", ecir: "\u2256", ecolon: "\u2255", Ecy: "\u042d", ecy: "\u044d", eDDot: "\u2a77", Edot: "\u0116", edot: "\u0117", eDot: "\u2251", ee: "\u2147", efDot: "\u2252", Efr: "\ud835\udd08", efr: "\ud835\udd22", eg: "\u2a9a", Egrave: "\xc8", egrave: "\xe8", egs: "\u2a96", egsdot: "\u2a98", el: "\u2a99", Element: "\u2208", elinters: "\u23e7", ell: "\u2113", els: "\u2a95", elsdot: "\u2a97", Emacr: "\u0112", emacr: "\u0113", empty: "\u2205", emptyset: "\u2205", EmptySmallSquare: "\u25fb", emptyv: "\u2205", EmptyVerySmallSquare: "\u25ab", emsp13: "\u2004", emsp14: "\u2005", emsp: "\u2003", ENG: "\u014a", eng: "\u014b", ensp: "\u2002", Eogon: "\u0118", eogon: "\u0119", Eopf: "\ud835\udd3c", eopf: "\ud835\udd56", epar: "\u22d5", eparsl: "\u29e3", eplus: "\u2a71", epsi: "\u03b5", Epsilon: "\u0395", epsilon: "\u03b5", epsiv: "\u03f5", eqcirc: "\u2256", eqcolon: "\u2255", eqsim: "\u2242", eqslantgtr: "\u2a96", eqslantless: "\u2a95", Equal: "\u2a75", equals: "=", EqualTilde: "\u2242", equest: "\u225f", Equilibrium: "\u21cc", equiv: "\u2261", equivDD: "\u2a78", eqvparsl: "\u29e5", erarr: "\u2971", erDot: "\u2253", escr: "\u212f", Escr: "\u2130", esdot: "\u2250", Esim: "\u2a73", esim: "\u2242", Eta: "\u0397", eta: "\u03b7", ETH: "\xd0", eth: "\xf0", Euml: "\xcb", euml: "\xeb", euro: "\u20ac", excl: "!", exist: "\u2203", Exists: "\u2203", expectation: "\u2130", exponentiale: "\u2147", ExponentialE: "\u2147", fallingdotseq: "\u2252", Fcy: "\u0424", fcy: "\u0444", female: "\u2640", ffilig: "\ufb03", fflig: "\ufb00", ffllig: "\ufb04", Ffr: "\ud835\udd09", ffr: "\ud835\udd23", filig: "\ufb01", FilledSmallSquare: "\u25fc", FilledVerySmallSquare: "\u25aa", fjlig: "fj", flat: "\u266d", fllig: "\ufb02", fltns: "\u25b1", fnof: "\u0192", Fopf: "\ud835\udd3d", fopf: "\ud835\udd57", forall: "\u2200", ForAll: "\u2200", fork: "\u22d4", forkv: "\u2ad9", Fouriertrf: "\u2131", fpartint: "\u2a0d", frac12: "\xbd", frac13: "\u2153", frac14: "\xbc", frac15: "\u2155", frac16: "\u2159", frac18: "\u215b", frac23: "\u2154", frac25: "\u2156", frac34: "\xbe", frac35: "\u2157", frac38: "\u215c", frac45: "\u2158", frac56: "\u215a", frac58: "\u215d", frac78: "\u215e", frasl: "\u2044", frown: "\u2322", fscr: "\ud835\udcbb", Fscr: "\u2131", gacute: "\u01f5", Gamma: "\u0393", gamma: "\u03b3", Gammad: "\u03dc", gammad: "\u03dd", gap: "\u2a86", Gbreve: "\u011e", gbreve: "\u011f", Gcedil: "\u0122", Gcirc: "\u011c", gcirc: "\u011d", Gcy: "\u0413", gcy: "\u0433", Gdot: "\u0120", gdot: "\u0121", ge: "\u2265", gE: "\u2267", gEl: "\u2a8c", gel: "\u22db", geq: "\u2265", geqq: "\u2267", geqslant: "\u2a7e", gescc: "\u2aa9", ges: "\u2a7e", gesdot: "\u2a80", gesdoto: "\u2a82", gesdotol: "\u2a84", gesl: "\u22db\ufe00", gesles: "\u2a94", Gfr: "\ud835\udd0a", gfr: "\ud835\udd24", gg: "\u226b", Gg: "\u22d9", ggg: "\u22d9", gimel: "\u2137", GJcy: "\u0403", gjcy: "\u0453", gla: "\u2aa5", gl: "\u2277", glE: "\u2a92", glj: "\u2aa4", gnap: "\u2a8a", gnapprox: "\u2a8a", gne: "\u2a88", gnE: "\u2269", gneq: "\u2a88", gneqq: "\u2269", gnsim: "\u22e7", Gopf: "\ud835\udd3e", gopf: "\ud835\udd58", grave: "`", GreaterEqual: "\u2265", GreaterEqualLess: "\u22db", GreaterFullEqual: "\u2267", GreaterGreater: "\u2aa2", GreaterLess: "\u2277", GreaterSlantEqual: "\u2a7e", GreaterTilde: "\u2273", Gscr: "\ud835\udca2", gscr: "\u210a", gsim: "\u2273", gsime: "\u2a8e", gsiml: "\u2a90", gtcc: "\u2aa7", gtcir: "\u2a7a", gt: ">", GT: ">", Gt: "\u226b", gtdot: "\u22d7", gtlPar: "\u2995", gtquest: "\u2a7c", gtrapprox: "\u2a86", gtrarr: "\u2978", gtrdot: "\u22d7", gtreqless: "\u22db", gtreqqless: "\u2a8c", gtrless: "\u2277", gtrsim: "\u2273", gvertneqq: "\u2269\ufe00", gvnE: "\u2269\ufe00", Hacek: "\u02c7", hairsp: "\u200a", half: "\xbd", hamilt: "\u210b", HARDcy: "\u042a", hardcy: "\u044a", harrcir: "\u2948", harr: "\u2194", hArr: "\u21d4", harrw: "\u21ad", Hat: "^", hbar: "\u210f", Hcirc: "\u0124", hcirc: "\u0125", hearts: "\u2665", heartsuit: "\u2665", hellip: "\u2026", hercon: "\u22b9", hfr: "\ud835\udd25", Hfr: "\u210c", HilbertSpace: "\u210b", hksearow: "\u2925", hkswarow: "\u2926", hoarr: "\u21ff", homtht: "\u223b", hookleftarrow: "\u21a9", hookrightarrow: "\u21aa", hopf: "\ud835\udd59", Hopf: "\u210d", horbar: "\u2015", HorizontalLine: "\u2500", hscr: "\ud835\udcbd", Hscr: "\u210b", hslash: "\u210f", Hstrok: "\u0126", hstrok: "\u0127", HumpDownHump: "\u224e", HumpEqual: "\u224f", hybull: "\u2043", hyphen: "\u2010", Iacute: "\xcd", iacute: "\xed", ic: "\u2063", Icirc: "\xce", icirc: "\xee", Icy: "\u0418", icy: "\u0438", Idot: "\u0130", IEcy: "\u0415", iecy: "\u0435", iexcl: "\xa1", iff: "\u21d4", ifr: "\ud835\udd26", Ifr: "\u2111", Igrave: "\xcc", igrave: "\xec", ii: "\u2148", iiiint: "\u2a0c", iiint: "\u222d", iinfin: "\u29dc", iiota: "\u2129", IJlig: "\u0132", ijlig: "\u0133", Imacr: "\u012a", imacr: "\u012b", image: "\u2111", ImaginaryI: "\u2148", imagline: "\u2110", imagpart: "\u2111", imath: "\u0131", Im: "\u2111", imof: "\u22b7", imped: "\u01b5", Implies: "\u21d2", incare: "\u2105", in: "\u2208", infin: "\u221e", infintie: "\u29dd", inodot: "\u0131", intcal: "\u22ba", int: "\u222b", Int: "\u222c", integers: "\u2124", Integral: "\u222b", intercal: "\u22ba", Intersection: "\u22c2", intlarhk: "\u2a17", intprod: "\u2a3c", InvisibleComma: "\u2063", InvisibleTimes: "\u2062", IOcy: "\u0401", iocy: "\u0451", Iogon: "\u012e", iogon: "\u012f", Iopf: "\ud835\udd40", iopf: "\ud835\udd5a", Iota: "\u0399", iota: "\u03b9", iprod: "\u2a3c", iquest: "\xbf", iscr: "\ud835\udcbe", Iscr: "\u2110", isin: "\u2208", isindot: "\u22f5", isinE: "\u22f9", isins: "\u22f4", isinsv: "\u22f3", isinv: "\u2208", it: "\u2062", Itilde: "\u0128", itilde: "\u0129", Iukcy: "\u0406", iukcy: "\u0456", Iuml: "\xcf", iuml: "\xef", Jcirc: "\u0134", jcirc: "\u0135", Jcy: "\u0419", jcy: "\u0439", Jfr: "\ud835\udd0d", jfr: "\ud835\udd27", jmath: "\u0237", Jopf: "\ud835\udd41", jopf: "\ud835\udd5b", Jscr: "\ud835\udca5", jscr: "\ud835\udcbf", Jsercy: "\u0408", jsercy: "\u0458", Jukcy: "\u0404", jukcy: "\u0454", Kappa: "\u039a", kappa: "\u03ba", kappav: "\u03f0", Kcedil: "\u0136", kcedil: "\u0137", Kcy: "\u041a", kcy: "\u043a", Kfr: "\ud835\udd0e", kfr: "\ud835\udd28", kgreen: "\u0138", KHcy: "\u0425", khcy: "\u0445", KJcy: "\u040c", kjcy: "\u045c", Kopf: "\ud835\udd42", kopf: "\ud835\udd5c", Kscr: "\ud835\udca6", kscr: "\ud835\udcc0", lAarr: "\u21da", Lacute: "\u0139", lacute: "\u013a", laemptyv: "\u29b4", lagran: "\u2112", Lambda: "\u039b", lambda: "\u03bb", lang: "\u27e8", Lang: "\u27ea", langd: "\u2991", langle: "\u27e8", lap: "\u2a85", Laplacetrf: "\u2112", laquo: "\xab", larrb: "\u21e4", larrbfs: "\u291f", larr: "\u2190", Larr: "\u219e", lArr: "\u21d0", larrfs: "\u291d", larrhk: "\u21a9", larrlp: "\u21ab", larrpl: "\u2939", larrsim: "\u2973", larrtl: "\u21a2", latail: "\u2919", lAtail: "\u291b", lat: "\u2aab", late: "\u2aad", lates: "\u2aad\ufe00", lbarr: "\u290c", lBarr: "\u290e", lbbrk: "\u2772", lbrace: "{", lbrack: "[", lbrke: "\u298b", lbrksld: "\u298f", lbrkslu: "\u298d", Lcaron: "\u013d", lcaron: "\u013e", Lcedil: "\u013b", lcedil: "\u013c", lceil: "\u2308", lcub: "{", Lcy: "\u041b", lcy: "\u043b", ldca: "\u2936", ldquo: "\u201c", ldquor: "\u201e", ldrdhar: "\u2967", ldrushar: "\u294b", ldsh: "\u21b2", le: "\u2264", lE: "\u2266", LeftAngleBracket: "\u27e8", LeftArrowBar: "\u21e4", leftarrow: "\u2190", LeftArrow: "\u2190", Leftarrow: "\u21d0", LeftArrowRightArrow: "\u21c6", leftarrowtail: "\u21a2", LeftCeiling: "\u2308", LeftDoubleBracket: "\u27e6", LeftDownTeeVector: "\u2961", LeftDownVectorBar: "\u2959", LeftDownVector: "\u21c3", LeftFloor: "\u230a", leftharpoondown: "\u21bd", leftharpoonup: "\u21bc", leftleftarrows: "\u21c7", leftrightarrow: "\u2194", LeftRightArrow: "\u2194", Leftrightarrow: "\u21d4", leftrightarrows: "\u21c6", leftrightharpoons: "\u21cb", leftrightsquigarrow: "\u21ad", LeftRightVector: "\u294e", LeftTeeArrow: "\u21a4", LeftTee: "\u22a3", LeftTeeVector: "\u295a", leftthreetimes: "\u22cb", LeftTriangleBar: "\u29cf", LeftTriangle: "\u22b2", LeftTriangleEqual: "\u22b4", LeftUpDownVector: "\u2951", LeftUpTeeVector: "\u2960", LeftUpVectorBar: "\u2958", LeftUpVector: "\u21bf", LeftVectorBar: "\u2952", LeftVector: "\u21bc", lEg: "\u2a8b", leg: "\u22da", leq: "\u2264", leqq: "\u2266", leqslant: "\u2a7d", lescc: "\u2aa8", les: "\u2a7d", lesdot: "\u2a7f", lesdoto: "\u2a81", lesdotor: "\u2a83", lesg: "\u22da\ufe00", lesges: "\u2a93", lessapprox: "\u2a85", lessdot: "\u22d6", lesseqgtr: "\u22da", lesseqqgtr: "\u2a8b", LessEqualGreater: "\u22da", LessFullEqual: "\u2266", LessGreater: "\u2276", lessgtr: "\u2276", LessLess: "\u2aa1", lesssim: "\u2272", LessSlantEqual: "\u2a7d", LessTilde: "\u2272", lfisht: "\u297c", lfloor: "\u230a", Lfr: "\ud835\udd0f", lfr: "\ud835\udd29", lg: "\u2276", lgE: "\u2a91", lHar: "\u2962", lhard: "\u21bd", lharu: "\u21bc", lharul: "\u296a", lhblk: "\u2584", LJcy: "\u0409", ljcy: "\u0459", llarr: "\u21c7", ll: "\u226a", Ll: "\u22d8", llcorner: "\u231e", Lleftarrow: "\u21da", llhard: "\u296b", lltri: "\u25fa", Lmidot: "\u013f", lmidot: "\u0140", lmoustache: "\u23b0", lmoust: "\u23b0", lnap: "\u2a89", lnapprox: "\u2a89", lne: "\u2a87", lnE: "\u2268", lneq: "\u2a87", lneqq: "\u2268", lnsim: "\u22e6", loang: "\u27ec", loarr: "\u21fd", lobrk: "\u27e6", longleftarrow: "\u27f5", LongLeftArrow: "\u27f5", Longleftarrow: "\u27f8", longleftrightarrow: "\u27f7", LongLeftRightArrow: "\u27f7", Longleftrightarrow: "\u27fa", longmapsto: "\u27fc", longrightarrow: "\u27f6", LongRightArrow: "\u27f6", Longrightarrow: "\u27f9", looparrowleft: "\u21ab", looparrowright: "\u21ac", lopar: "\u2985", Lopf: "\ud835\udd43", lopf: "\ud835\udd5d", loplus: "\u2a2d", lotimes: "\u2a34", lowast: "\u2217", lowbar: "_", LowerLeftArrow: "\u2199", LowerRightArrow: "\u2198", loz: "\u25ca", lozenge: "\u25ca", lozf: "\u29eb", lpar: "(", lparlt: "\u2993", lrarr: "\u21c6", lrcorner: "\u231f", lrhar: "\u21cb", lrhard: "\u296d", lrm: "\u200e", lrtri: "\u22bf", lsaquo: "\u2039", lscr: "\ud835\udcc1", Lscr: "\u2112", lsh: "\u21b0", Lsh: "\u21b0", lsim: "\u2272", lsime: "\u2a8d", lsimg: "\u2a8f", lsqb: "[", lsquo: "\u2018", lsquor: "\u201a", Lstrok: "\u0141", lstrok: "\u0142", ltcc: "\u2aa6", ltcir: "\u2a79", lt: "<", LT: "<", Lt: "\u226a", ltdot: "\u22d6", lthree: "\u22cb", ltimes: "\u22c9", ltlarr: "\u2976", ltquest: "\u2a7b", ltri: "\u25c3", ltrie: "\u22b4", ltrif: "\u25c2", ltrPar: "\u2996", lurdshar: "\u294a", luruhar: "\u2966", lvertneqq: "\u2268\ufe00", lvnE: "\u2268\ufe00", macr: "\xaf", male: "\u2642", malt: "\u2720", maltese: "\u2720", Map: "\u2905", map: "\u21a6", mapsto: "\u21a6", mapstodown: "\u21a7", mapstoleft: "\u21a4", mapstoup: "\u21a5", marker: "\u25ae", mcomma: "\u2a29", Mcy: "\u041c", mcy: "\u043c", mdash: "\u2014", mDDot: "\u223a", measuredangle: "\u2221", MediumSpace: "\u205f", Mellintrf: "\u2133", Mfr: "\ud835\udd10", mfr: "\ud835\udd2a", mho: "\u2127", micro: "\xb5", midast: "*", midcir: "\u2af0", mid: "\u2223", middot: "\xb7", minusb: "\u229f", minus: "\u2212", minusd: "\u2238", minusdu: "\u2a2a", MinusPlus: "\u2213", mlcp: "\u2adb", mldr: "\u2026", mnplus: "\u2213", models: "\u22a7", Mopf: "\ud835\udd44", mopf: "\ud835\udd5e", mp: "\u2213", mscr: "\ud835\udcc2", Mscr: "\u2133", mstpos: "\u223e", Mu: "\u039c", mu: "\u03bc", multimap: "\u22b8", mumap: "\u22b8", nabla: "\u2207", Nacute: "\u0143", nacute: "\u0144", nang: "\u2220\u20d2", nap: "\u2249", napE: "\u2a70\u0338", napid: "\u224b\u0338", napos: "\u0149", napprox: "\u2249", natural: "\u266e", naturals: "\u2115", natur: "\u266e", nbsp: "\xa0", nbump: "\u224e\u0338", nbumpe: "\u224f\u0338", ncap: "\u2a43", Ncaron: "\u0147", ncaron: "\u0148", Ncedil: "\u0145", ncedil: "\u0146", ncong: "\u2247", ncongdot: "\u2a6d\u0338", ncup: "\u2a42", Ncy: "\u041d", ncy: "\u043d", ndash: "\u2013", nearhk: "\u2924", nearr: "\u2197", neArr: "\u21d7", nearrow: "\u2197", ne: "\u2260", nedot: "\u2250\u0338", NegativeMediumSpace: "\u200b", NegativeThickSpace: "\u200b", NegativeThinSpace: "\u200b", NegativeVeryThinSpace: "\u200b", nequiv: "\u2262", nesear: "\u2928", nesim: "\u2242\u0338", NestedGreaterGreater: "\u226b", NestedLessLess: "\u226a", NewLine: "\n", nexist: "\u2204", nexists: "\u2204", Nfr: "\ud835\udd11", nfr: "\ud835\udd2b", ngE: "\u2267\u0338", nge: "\u2271", ngeq: "\u2271", ngeqq: "\u2267\u0338", ngeqslant: "\u2a7e\u0338", nges: "\u2a7e\u0338", nGg: "\u22d9\u0338", ngsim: "\u2275", nGt: "\u226b\u20d2", ngt: "\u226f", ngtr: "\u226f", nGtv: "\u226b\u0338", nharr: "\u21ae", nhArr: "\u21ce", nhpar: "\u2af2", ni: "\u220b", nis: "\u22fc", nisd: "\u22fa", niv: "\u220b", NJcy: "\u040a", njcy: "\u045a", nlarr: "\u219a", nlArr: "\u21cd", nldr: "\u2025", nlE: "\u2266\u0338", nle: "\u2270", nleftarrow: "\u219a", nLeftarrow: "\u21cd", nleftrightarrow: "\u21ae", nLeftrightarrow: "\u21ce", nleq: "\u2270", nleqq: "\u2266\u0338", nleqslant: "\u2a7d\u0338", nles: "\u2a7d\u0338", nless: "\u226e", nLl: "\u22d8\u0338", nlsim: "\u2274", nLt: "\u226a\u20d2", nlt: "\u226e", nltri: "\u22ea", nltrie: "\u22ec", nLtv: "\u226a\u0338", nmid: "\u2224", NoBreak: "\u2060", NonBreakingSpace: "\xa0", nopf: "\ud835\udd5f", Nopf: "\u2115", Not: "\u2aec", not: "\xac", NotCongruent: "\u2262", NotCupCap: "\u226d", NotDoubleVerticalBar: "\u2226", NotElement: "\u2209", NotEqual: "\u2260", NotEqualTilde: "\u2242\u0338", NotExists: "\u2204", NotGreater: "\u226f", NotGreaterEqual: "\u2271", NotGreaterFullEqual: "\u2267\u0338", NotGreaterGreater: "\u226b\u0338", NotGreaterLess: "\u2279", NotGreaterSlantEqual: "\u2a7e\u0338", NotGreaterTilde: "\u2275", NotHumpDownHump: "\u224e\u0338", NotHumpEqual: "\u224f\u0338", notin: "\u2209", notindot: "\u22f5\u0338", notinE: "\u22f9\u0338", notinva: "\u2209", notinvb: "\u22f7", notinvc: "\u22f6", NotLeftTriangleBar: "\u29cf\u0338", NotLeftTriangle: "\u22ea", NotLeftTriangleEqual: "\u22ec", NotLess: "\u226e", NotLessEqual: "\u2270", NotLessGreater: "\u2278", NotLessLess: "\u226a\u0338", NotLessSlantEqual: "\u2a7d\u0338", NotLessTilde: "\u2274", NotNestedGreaterGreater: "\u2aa2\u0338", NotNestedLessLess: "\u2aa1\u0338", notni: "\u220c", notniva: "\u220c", notnivb: "\u22fe", notnivc: "\u22fd", NotPrecedes: "\u2280", NotPrecedesEqual: "\u2aaf\u0338", NotPrecedesSlantEqual: "\u22e0", NotReverseElement: "\u220c", NotRightTriangleBar: "\u29d0\u0338", NotRightTriangle: "\u22eb", NotRightTriangleEqual: "\u22ed", NotSquareSubset: "\u228f\u0338", NotSquareSubsetEqual: "\u22e2", NotSquareSuperset: "\u2290\u0338", NotSquareSupersetEqual: "\u22e3", NotSubset: "\u2282\u20d2", NotSubsetEqual: "\u2288", NotSucceeds: "\u2281", NotSucceedsEqual: "\u2ab0\u0338", NotSucceedsSlantEqual: "\u22e1", NotSucceedsTilde: "\u227f\u0338", NotSuperset: "\u2283\u20d2", NotSupersetEqual: "\u2289", NotTilde: "\u2241", NotTildeEqual: "\u2244", NotTildeFullEqual: "\u2247", NotTildeTilde: "\u2249", NotVerticalBar: "\u2224", nparallel: "\u2226", npar: "\u2226", nparsl: "\u2afd\u20e5", npart: "\u2202\u0338", npolint: "\u2a14", npr: "\u2280", nprcue: "\u22e0", nprec: "\u2280", npreceq: "\u2aaf\u0338", npre: "\u2aaf\u0338", nrarrc: "\u2933\u0338", nrarr: "\u219b", nrArr: "\u21cf", nrarrw: "\u219d\u0338", nrightarrow: "\u219b", nRightarrow: "\u21cf", nrtri: "\u22eb", nrtrie: "\u22ed", nsc: "\u2281", nsccue: "\u22e1", nsce: "\u2ab0\u0338", Nscr: "\ud835\udca9", nscr: "\ud835\udcc3", nshortmid: "\u2224", nshortparallel: "\u2226", nsim: "\u2241", nsime: "\u2244", nsimeq: "\u2244", nsmid: "\u2224", nspar: "\u2226", nsqsube: "\u22e2", nsqsupe: "\u22e3", nsub: "\u2284", nsubE: "\u2ac5\u0338", nsube: "\u2288", nsubset: "\u2282\u20d2", nsubseteq: "\u2288", nsubseteqq: "\u2ac5\u0338", nsucc: "\u2281", nsucceq: "\u2ab0\u0338", nsup: "\u2285", nsupE: "\u2ac6\u0338", nsupe: "\u2289", nsupset: "\u2283\u20d2", nsupseteq: "\u2289", nsupseteqq: "\u2ac6\u0338", ntgl: "\u2279", Ntilde: "\xd1", ntilde: "\xf1", ntlg: "\u2278", ntriangleleft: "\u22ea", ntrianglelefteq: "\u22ec", ntriangleright: "\u22eb", ntrianglerighteq: "\u22ed", Nu: "\u039d", nu: "\u03bd", num: "#", numero: "\u2116", numsp: "\u2007", nvap: "\u224d\u20d2", nvdash: "\u22ac", nvDash: "\u22ad", nVdash: "\u22ae", nVDash: "\u22af", nvge: "\u2265\u20d2", nvgt: ">\u20d2", nvHarr: "\u2904", nvinfin: "\u29de", nvlArr: "\u2902", nvle: "\u2264\u20d2", nvlt: "<\u20d2", nvltrie: "\u22b4\u20d2", nvrArr: "\u2903", nvrtrie: "\u22b5\u20d2", nvsim: "\u223c\u20d2", nwarhk: "\u2923", nwarr: "\u2196", nwArr: "\u21d6", nwarrow: "\u2196", nwnear: "\u2927", Oacute: "\xd3", oacute: "\xf3", oast: "\u229b", Ocirc: "\xd4", ocirc: "\xf4", ocir: "\u229a", Ocy: "\u041e", ocy: "\u043e", odash: "\u229d", Odblac: "\u0150", odblac: "\u0151", odiv: "\u2a38", odot: "\u2299", odsold: "\u29bc", OElig: "\u0152", oelig: "\u0153", ofcir: "\u29bf", Ofr: "\ud835\udd12", ofr: "\ud835\udd2c", ogon: "\u02db", Ograve: "\xd2", ograve: "\xf2", ogt: "\u29c1", ohbar: "\u29b5", ohm: "\u03a9", oint: "\u222e", olarr: "\u21ba", olcir: "\u29be", olcross: "\u29bb", oline: "\u203e", olt: "\u29c0", Omacr: "\u014c", omacr: "\u014d", Omega: "\u03a9", omega: "\u03c9", Omicron: "\u039f", omicron: "\u03bf", omid: "\u29b6", ominus: "\u2296", Oopf: "\ud835\udd46", oopf: "\ud835\udd60", opar: "\u29b7", OpenCurlyDoubleQuote: "\u201c", OpenCurlyQuote: "\u2018", operp: "\u29b9", oplus: "\u2295", orarr: "\u21bb", Or: "\u2a54", or: "\u2228", ord: "\u2a5d", order: "\u2134", orderof: "\u2134", ordf: "\xaa", ordm: "\xba", origof: "\u22b6", oror: "\u2a56", orslope: "\u2a57", orv: "\u2a5b", oS: "\u24c8", Oscr: "\ud835\udcaa", oscr: "\u2134", Oslash: "\xd8", oslash: "\xf8", osol: "\u2298", Otilde: "\xd5", otilde: "\xf5", otimesas: "\u2a36", Otimes: "\u2a37", otimes: "\u2297", Ouml: "\xd6", ouml: "\xf6", ovbar: "\u233d", OverBar: "\u203e", OverBrace: "\u23de", OverBracket: "\u23b4", OverParenthesis: "\u23dc", para: "\xb6", parallel: "\u2225", par: "\u2225", parsim: "\u2af3", parsl: "\u2afd", part: "\u2202", PartialD: "\u2202", Pcy: "\u041f", pcy: "\u043f", percnt: "%", period: ".", permil: "\u2030", perp: "\u22a5", pertenk: "\u2031", Pfr: "\ud835\udd13", pfr: "\ud835\udd2d", Phi: "\u03a6", phi: "\u03c6", phiv: "\u03d5", phmmat: "\u2133", phone: "\u260e", Pi: "\u03a0", pi: "\u03c0", pitchfork: "\u22d4", piv: "\u03d6", planck: "\u210f", planckh: "\u210e", plankv: "\u210f", plusacir: "\u2a23", plusb: "\u229e", pluscir: "\u2a22", plus: "+", plusdo: "\u2214", plusdu: "\u2a25", pluse: "\u2a72", PlusMinus: "\xb1", plusmn: "\xb1", plussim: "\u2a26", plustwo: "\u2a27", pm: "\xb1", Poincareplane: "\u210c", pointint: "\u2a15", popf: "\ud835\udd61", Popf: "\u2119", pound: "\xa3", prap: "\u2ab7", Pr: "\u2abb", pr: "\u227a", prcue: "\u227c", precapprox: "\u2ab7", prec: "\u227a", preccurlyeq: "\u227c", Precedes: "\u227a", PrecedesEqual: "\u2aaf", PrecedesSlantEqual: "\u227c", PrecedesTilde: "\u227e", preceq: "\u2aaf", precnapprox: "\u2ab9", precneqq: "\u2ab5", precnsim: "\u22e8", pre: "\u2aaf", prE: "\u2ab3", precsim: "\u227e", prime: "\u2032", Prime: "\u2033", primes: "\u2119", prnap: "\u2ab9", prnE: "\u2ab5", prnsim: "\u22e8", prod: "\u220f", Product: "\u220f", profalar: "\u232e", profline: "\u2312", profsurf: "\u2313", prop: "\u221d", Proportional: "\u221d", Proportion: "\u2237", propto: "\u221d", prsim: "\u227e", prurel: "\u22b0", Pscr: "\ud835\udcab", pscr: "\ud835\udcc5", Psi: "\u03a8", psi: "\u03c8", puncsp: "\u2008", Qfr: "\ud835\udd14", qfr: "\ud835\udd2e", qint: "\u2a0c", qopf: "\ud835\udd62", Qopf: "\u211a", qprime: "\u2057", Qscr: "\ud835\udcac", qscr: "\ud835\udcc6", quaternions: "\u210d", quatint: "\u2a16", quest: "?", questeq: "\u225f", quot: '"', QUOT: '"', rAarr: "\u21db", race: "\u223d\u0331", Racute: "\u0154", racute: "\u0155", radic: "\u221a", raemptyv: "\u29b3", rang: "\u27e9", Rang: "\u27eb", rangd: "\u2992", range: "\u29a5", rangle: "\u27e9", raquo: "\xbb", rarrap: "\u2975", rarrb: "\u21e5", rarrbfs: "\u2920", rarrc: "\u2933", rarr: "\u2192", Rarr: "\u21a0", rArr: "\u21d2", rarrfs: "\u291e", rarrhk: "\u21aa", rarrlp: "\u21ac", rarrpl: "\u2945", rarrsim: "\u2974", Rarrtl: "\u2916", rarrtl: "\u21a3", rarrw: "\u219d", ratail: "\u291a", rAtail: "\u291c", ratio: "\u2236", rationals: "\u211a", rbarr: "\u290d", rBarr: "\u290f", RBarr: "\u2910", rbbrk: "\u2773", rbrace: "}", rbrack: "]", rbrke: "\u298c", rbrksld: "\u298e", rbrkslu: "\u2990", Rcaron: "\u0158", rcaron: "\u0159", Rcedil: "\u0156", rcedil: "\u0157", rceil: "\u2309", rcub: "}", Rcy: "\u0420", rcy: "\u0440", rdca: "\u2937", rdldhar: "\u2969", rdquo: "\u201d", rdquor: "\u201d", rdsh: "\u21b3", real: "\u211c", realine: "\u211b", realpart: "\u211c", reals: "\u211d", Re: "\u211c", rect: "\u25ad", reg: "\xae", REG: "\xae", ReverseElement: "\u220b", ReverseEquilibrium: "\u21cb", ReverseUpEquilibrium: "\u296f", rfisht: "\u297d", rfloor: "\u230b", rfr: "\ud835\udd2f", Rfr: "\u211c", rHar: "\u2964", rhard: "\u21c1", rharu: "\u21c0", rharul: "\u296c", Rho: "\u03a1", rho: "\u03c1", rhov: "\u03f1", RightAngleBracket: "\u27e9", RightArrowBar: "\u21e5", rightarrow: "\u2192", RightArrow: "\u2192", Rightarrow: "\u21d2", RightArrowLeftArrow: "\u21c4", rightarrowtail: "\u21a3", RightCeiling: "\u2309", RightDoubleBracket: "\u27e7", RightDownTeeVector: "\u295d", RightDownVectorBar: "\u2955", RightDownVector: "\u21c2", RightFloor: "\u230b", rightharpoondown: "\u21c1", rightharpoonup: "\u21c0", rightleftarrows: "\u21c4", rightleftharpoons: "\u21cc", rightrightarrows: "\u21c9", rightsquigarrow: "\u219d", RightTeeArrow: "\u21a6", RightTee: "\u22a2", RightTeeVector: "\u295b", rightthreetimes: "\u22cc", RightTriangleBar: "\u29d0", RightTriangle: "\u22b3", RightTriangleEqual: "\u22b5", RightUpDownVector: "\u294f", RightUpTeeVector: "\u295c", RightUpVectorBar: "\u2954", RightUpVector: "\u21be", RightVectorBar: "\u2953", RightVector: "\u21c0", ring: "\u02da", risingdotseq: "\u2253", rlarr: "\u21c4", rlhar: "\u21cc", rlm: "\u200f", rmoustache: "\u23b1", rmoust: "\u23b1", rnmid: "\u2aee", roang: "\u27ed", roarr: "\u21fe", robrk: "\u27e7", ropar: "\u2986", ropf: "\ud835\udd63", Ropf: "\u211d", roplus: "\u2a2e", rotimes: "\u2a35", RoundImplies: "\u2970", rpar: ")", rpargt: "\u2994", rppolint: "\u2a12", rrarr: "\u21c9", Rrightarrow: "\u21db", rsaquo: "\u203a", rscr: "\ud835\udcc7", Rscr: "\u211b", rsh: "\u21b1", Rsh: "\u21b1", rsqb: "]", rsquo: "\u2019", rsquor: "\u2019", rthree: "\u22cc", rtimes: "\u22ca", rtri: "\u25b9", rtrie: "\u22b5", rtrif: "\u25b8", rtriltri: "\u29ce", RuleDelayed: "\u29f4", ruluhar: "\u2968", rx: "\u211e", Sacute: "\u015a", sacute: "\u015b", sbquo: "\u201a", scap: "\u2ab8", Scaron: "\u0160", scaron: "\u0161", Sc: "\u2abc", sc: "\u227b", sccue: "\u227d", sce: "\u2ab0", scE: "\u2ab4", Scedil: "\u015e", scedil: "\u015f", Scirc: "\u015c", scirc: "\u015d", scnap: "\u2aba", scnE: "\u2ab6", scnsim: "\u22e9", scpolint: "\u2a13", scsim: "\u227f", Scy: "\u0421", scy: "\u0441", sdotb: "\u22a1", sdot: "\u22c5", sdote: "\u2a66", searhk: "\u2925", searr: "\u2198", seArr: "\u21d8", searrow: "\u2198", sect: "\xa7", semi: ";", seswar: "\u2929", setminus: "\u2216", setmn: "\u2216", sext: "\u2736", Sfr: "\ud835\udd16", sfr: "\ud835\udd30", sfrown: "\u2322", sharp: "\u266f", SHCHcy: "\u0429", shchcy: "\u0449", SHcy: "\u0428", shcy: "\u0448", ShortDownArrow: "\u2193", ShortLeftArrow: "\u2190", shortmid: "\u2223", shortparallel: "\u2225", ShortRightArrow: "\u2192", ShortUpArrow: "\u2191", shy: "\xad", Sigma: "\u03a3", sigma: "\u03c3", sigmaf: "\u03c2", sigmav: "\u03c2", sim: "\u223c", simdot: "\u2a6a", sime: "\u2243", simeq: "\u2243", simg: "\u2a9e", simgE: "\u2aa0", siml: "\u2a9d", simlE: "\u2a9f", simne: "\u2246", simplus: "\u2a24", simrarr: "\u2972", slarr: "\u2190", SmallCircle: "\u2218", smallsetminus: "\u2216", smashp: "\u2a33", smeparsl: "\u29e4", smid: "\u2223", smile: "\u2323", smt: "\u2aaa", smte: "\u2aac", smtes: "\u2aac\ufe00", SOFTcy: "\u042c", softcy: "\u044c", solbar: "\u233f", solb: "\u29c4", sol: "/", Sopf: "\ud835\udd4a", sopf: "\ud835\udd64", spades: "\u2660", spadesuit: "\u2660", spar: "\u2225", sqcap: "\u2293", sqcaps: "\u2293\ufe00", sqcup: "\u2294", sqcups: "\u2294\ufe00", Sqrt: "\u221a", sqsub: "\u228f", sqsube: "\u2291", sqsubset: "\u228f", sqsubseteq: "\u2291", sqsup: "\u2290", sqsupe: "\u2292", sqsupset: "\u2290", sqsupseteq: "\u2292", square: "\u25a1", Square: "\u25a1", SquareIntersection: "\u2293", SquareSubset: "\u228f", SquareSubsetEqual: "\u2291", SquareSuperset: "\u2290", SquareSupersetEqual: "\u2292", SquareUnion: "\u2294", squarf: "\u25aa", squ: "\u25a1", squf: "\u25aa", srarr: "\u2192", Sscr: "\ud835\udcae", sscr: "\ud835\udcc8", ssetmn: "\u2216", ssmile: "\u2323", sstarf: "\u22c6", Star: "\u22c6", star: "\u2606", starf: "\u2605", straightepsilon: "\u03f5", straightphi: "\u03d5", strns: "\xaf", sub: "\u2282", Sub: "\u22d0", subdot: "\u2abd", subE: "\u2ac5", sube: "\u2286", subedot: "\u2ac3", submult: "\u2ac1", subnE: "\u2acb", subne: "\u228a", subplus: "\u2abf", subrarr: "\u2979", subset: "\u2282", Subset: "\u22d0", subseteq: "\u2286", subseteqq: "\u2ac5", SubsetEqual: "\u2286", subsetneq: "\u228a", subsetneqq: "\u2acb", subsim: "\u2ac7", subsub: "\u2ad5", subsup: "\u2ad3", succapprox: "\u2ab8", succ: "\u227b", succcurlyeq: "\u227d", Succeeds: "\u227b", SucceedsEqual: "\u2ab0", SucceedsSlantEqual: "\u227d", SucceedsTilde: "\u227f", succeq: "\u2ab0", succnapprox: "\u2aba", succneqq: "\u2ab6", succnsim: "\u22e9", succsim: "\u227f", SuchThat: "\u220b", sum: "\u2211", Sum: "\u2211", sung: "\u266a", sup1: "\xb9", sup2: "\xb2", sup3: "\xb3", sup: "\u2283", Sup: "\u22d1", supdot: "\u2abe", supdsub: "\u2ad8", supE: "\u2ac6", supe: "\u2287", supedot: "\u2ac4", Superset: "\u2283", SupersetEqual: "\u2287", suphsol: "\u27c9", suphsub: "\u2ad7", suplarr: "\u297b", supmult: "\u2ac2", supnE: "\u2acc", supne: "\u228b", supplus: "\u2ac0", supset: "\u2283", Supset: "\u22d1", supseteq: "\u2287", supseteqq: "\u2ac6", supsetneq: "\u228b", supsetneqq: "\u2acc", supsim: "\u2ac8", supsub: "\u2ad4", supsup: "\u2ad6", swarhk: "\u2926", swarr: "\u2199", swArr: "\u21d9", swarrow: "\u2199", swnwar: "\u292a", szlig: "\xdf", Tab: "\t", target: "\u2316", Tau: "\u03a4", tau: "\u03c4", tbrk: "\u23b4", Tcaron: "\u0164", tcaron: "\u0165", Tcedil: "\u0162", tcedil: "\u0163", Tcy: "\u0422", tcy: "\u0442", tdot: "\u20db", telrec: "\u2315", Tfr: "\ud835\udd17", tfr: "\ud835\udd31", there4: "\u2234", therefore: "\u2234", Therefore: "\u2234", Theta: "\u0398", theta: "\u03b8", thetasym: "\u03d1", thetav: "\u03d1", thickapprox: "\u2248", thicksim: "\u223c", ThickSpace: "\u205f\u200a", ThinSpace: "\u2009", thinsp: "\u2009", thkap: "\u2248", thksim: "\u223c", THORN: "\xde", thorn: "\xfe", tilde: "\u02dc", Tilde: "\u223c", TildeEqual: "\u2243", TildeFullEqual: "\u2245", TildeTilde: "\u2248", timesbar: "\u2a31", timesb: "\u22a0", times: "\xd7", timesd: "\u2a30", tint: "\u222d", toea: "\u2928", topbot: "\u2336", topcir: "\u2af1", top: "\u22a4", Topf: "\ud835\udd4b", topf: "\ud835\udd65", topfork: "\u2ada", tosa: "\u2929", tprime: "\u2034", trade: "\u2122", TRADE: "\u2122", triangle: "\u25b5", triangledown: "\u25bf", triangleleft: "\u25c3", trianglelefteq: "\u22b4", triangleq: "\u225c", triangleright: "\u25b9", trianglerighteq: "\u22b5", tridot: "\u25ec", trie: "\u225c", triminus: "\u2a3a", TripleDot: "\u20db", triplus: "\u2a39", trisb: "\u29cd", tritime: "\u2a3b", trpezium: "\u23e2", Tscr: "\ud835\udcaf", tscr: "\ud835\udcc9", TScy: "\u0426", tscy: "\u0446", TSHcy: "\u040b", tshcy: "\u045b", Tstrok: "\u0166", tstrok: "\u0167", twixt: "\u226c", twoheadleftarrow: "\u219e", twoheadrightarrow: "\u21a0", Uacute: "\xda", uacute: "\xfa", uarr: "\u2191", Uarr: "\u219f", uArr: "\u21d1", Uarrocir: "\u2949", Ubrcy: "\u040e", ubrcy: "\u045e", Ubreve: "\u016c", ubreve: "\u016d", Ucirc: "\xdb", ucirc: "\xfb", Ucy: "\u0423", ucy: "\u0443", udarr: "\u21c5", Udblac: "\u0170", udblac: "\u0171", udhar: "\u296e", ufisht: "\u297e", Ufr: "\ud835\udd18", ufr: "\ud835\udd32", Ugrave: "\xd9", ugrave: "\xf9", uHar: "\u2963", uharl: "\u21bf", uharr: "\u21be", uhblk: "\u2580", ulcorn: "\u231c", ulcorner: "\u231c", ulcrop: "\u230f", ultri: "\u25f8", Umacr: "\u016a", umacr: "\u016b", uml: "\xa8", UnderBar: "_", UnderBrace: "\u23df", UnderBracket: "\u23b5", UnderParenthesis: "\u23dd", Union: "\u22c3", UnionPlus: "\u228e", Uogon: "\u0172", uogon: "\u0173", Uopf: "\ud835\udd4c", uopf: "\ud835\udd66", UpArrowBar: "\u2912", uparrow: "\u2191", UpArrow: "\u2191", Uparrow: "\u21d1", UpArrowDownArrow: "\u21c5", updownarrow: "\u2195", UpDownArrow: "\u2195", Updownarrow: "\u21d5", UpEquilibrium: "\u296e", upharpoonleft: "\u21bf", upharpoonright: "\u21be", uplus: "\u228e", UpperLeftArrow: "\u2196", UpperRightArrow: "\u2197", upsi: "\u03c5", Upsi: "\u03d2", upsih: "\u03d2", Upsilon: "\u03a5", upsilon: "\u03c5", UpTeeArrow: "\u21a5", UpTee: "\u22a5", upuparrows: "\u21c8", urcorn: "\u231d", urcorner: "\u231d", urcrop: "\u230e", Uring: "\u016e", uring: "\u016f", urtri: "\u25f9", Uscr: "\ud835\udcb0", uscr: "\ud835\udcca", utdot: "\u22f0", Utilde: "\u0168", utilde: "\u0169", utri: "\u25b5", utrif: "\u25b4", uuarr: "\u21c8", Uuml: "\xdc", uuml: "\xfc", uwangle: "\u29a7", vangrt: "\u299c", varepsilon: "\u03f5", varkappa: "\u03f0", varnothing: "\u2205", varphi: "\u03d5", varpi: "\u03d6", varpropto: "\u221d", varr: "\u2195", vArr: "\u21d5", varrho: "\u03f1", varsigma: "\u03c2", varsubsetneq: "\u228a\ufe00", varsubsetneqq: "\u2acb\ufe00", varsupsetneq: "\u228b\ufe00", varsupsetneqq: "\u2acc\ufe00", vartheta: "\u03d1", vartriangleleft: "\u22b2", vartriangleright: "\u22b3", vBar: "\u2ae8", Vbar: "\u2aeb", vBarv: "\u2ae9", Vcy: "\u0412", vcy: "\u0432", vdash: "\u22a2", vDash: "\u22a8", Vdash: "\u22a9", VDash: "\u22ab", Vdashl: "\u2ae6", veebar: "\u22bb", vee: "\u2228", Vee: "\u22c1", veeeq: "\u225a", vellip: "\u22ee", verbar: "|", Verbar: "\u2016", vert: "|", Vert: "\u2016", VerticalBar: "\u2223", VerticalLine: "|", VerticalSeparator: "\u2758", VerticalTilde: "\u2240", VeryThinSpace: "\u200a", Vfr: "\ud835\udd19", vfr: "\ud835\udd33", vltri: "\u22b2", vnsub: "\u2282\u20d2", vnsup: "\u2283\u20d2", Vopf: "\ud835\udd4d", vopf: "\ud835\udd67", vprop: "\u221d", vrtri: "\u22b3", Vscr: "\ud835\udcb1", vscr: "\ud835\udccb", vsubnE: "\u2acb\ufe00", vsubne: "\u228a\ufe00", vsupnE: "\u2acc\ufe00", vsupne: "\u228b\ufe00", Vvdash: "\u22aa", vzigzag: "\u299a", Wcirc: "\u0174", wcirc: "\u0175", wedbar: "\u2a5f", wedge: "\u2227", Wedge: "\u22c0", wedgeq: "\u2259", weierp: "\u2118", Wfr: "\ud835\udd1a", wfr: "\ud835\udd34", Wopf: "\ud835\udd4e", wopf: "\ud835\udd68", wp: "\u2118", wr: "\u2240", wreath: "\u2240", Wscr: "\ud835\udcb2", wscr: "\ud835\udccc", xcap: "\u22c2", xcirc: "\u25ef", xcup: "\u22c3", xdtri: "\u25bd", Xfr: "\ud835\udd1b", xfr: "\ud835\udd35", xharr: "\u27f7", xhArr: "\u27fa", Xi: "\u039e", xi: "\u03be", xlarr: "\u27f5", xlArr: "\u27f8", xmap: "\u27fc", xnis: "\u22fb", xodot: "\u2a00", Xopf: "\ud835\udd4f", xopf: "\ud835\udd69", xoplus: "\u2a01", xotime: "\u2a02", xrarr: "\u27f6", xrArr: "\u27f9", Xscr: "\ud835\udcb3", xscr: "\ud835\udccd", xsqcup: "\u2a06", xuplus: "\u2a04", xutri: "\u25b3", xvee: "\u22c1", xwedge: "\u22c0", Yacute: "\xdd", yacute: "\xfd", YAcy: "\u042f", yacy: "\u044f", Ycirc: "\u0176", ycirc: "\u0177", Ycy: "\u042b", ycy: "\u044b", yen: "\xa5", Yfr: "\ud835\udd1c", yfr: "\ud835\udd36", YIcy: "\u0407", yicy: "\u0457", Yopf: "\ud835\udd50", yopf: "\ud835\udd6a", Yscr: "\ud835\udcb4", yscr: "\ud835\udcce", YUcy: "\u042e", yucy: "\u044e", yuml: "\xff", Yuml: "\u0178", Zacute: "\u0179", zacute: "\u017a", Zcaron: "\u017d", zcaron: "\u017e", Zcy: "\u0417", zcy: "\u0437", Zdot: "\u017b", zdot: "\u017c", zeetrf: "\u2128", ZeroWidthSpace: "\u200b", Zeta: "\u0396", zeta: "\u03b6", zfr: "\ud835\udd37", Zfr: "\u2128", ZHcy: "\u0416", zhcy: "\u0436", zigrarr: "\u21dd", zopf: "\ud835\udd6b", Zopf: "\u2124", Zscr: "\ud835\udcb5", zscr: "\ud835\udccf", zwj: "\u200d", zwnj: "\u200c" }; var entities = require$$0; var regex$4 = /[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4E\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDF55-\uDF59]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDF3C-\uDF3E]|\uD806[\uDC3B\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]/; var encodeCache = {}; function getEncodeCache(exclude) {
                var i, ch, cache = encodeCache[exclude]; if (cache) { return cache; }
                cache = encodeCache[exclude] = []; for (i = 0; i < 128; i++) { ch = String.fromCharCode(i); if (/^[0-9a-z]$/i.test(ch)) { cache.push(ch); } else { cache.push("%" + ("0" + i.toString(16).toUpperCase()).slice(-2)); } }
                for (i = 0; i < exclude.length; i++) { cache[exclude.charCodeAt(i)] = exclude[i]; }
                return cache;
        }
        function encode$2(string, exclude, keepEscaped) {
                var i, l, code, nextCode, cache, result = ""; if (typeof exclude !== "string") { keepEscaped = exclude; exclude = encode$2.defaultChars; }
                if (typeof keepEscaped === "undefined") { keepEscaped = true; }
                cache = getEncodeCache(exclude); for (i = 0, l = string.length; i < l; i++) {
                        code = string.charCodeAt(i); if (keepEscaped && code === 37 && i + 2 < l) { if (/^[0-9a-f]{2}$/i.test(string.slice(i + 1, i + 3))) { result += string.slice(i, i + 3); i += 2; continue; } }
                        if (code < 128) { result += cache[code]; continue; }
                        if (code >= 55296 && code <= 57343) {
                                if (code >= 55296 && code <= 56319 && i + 1 < l) { nextCode = string.charCodeAt(i + 1); if (nextCode >= 56320 && nextCode <= 57343) { result += encodeURIComponent(string[i] + string[i + 1]); i++; continue; } }
                                result += "%EF%BF%BD"; continue;
                        }
                        result += encodeURIComponent(string[i]);
                }
                return result;
        }
        encode$2.defaultChars = ";/?:@&=+$,-_.!~*'()#"; encode$2.componentChars = "-_.!~*'()"; var encode_1 = encode$2; var decodeCache = {}; function getDecodeCache(exclude) {
                var i, ch, cache = decodeCache[exclude]; if (cache) { return cache; }
                cache = decodeCache[exclude] = []; for (i = 0; i < 128; i++) { ch = String.fromCharCode(i); cache.push(ch); }
                for (i = 0; i < exclude.length; i++) { ch = exclude.charCodeAt(i); cache[ch] = "%" + ("0" + ch.toString(16).toUpperCase()).slice(-2); }
                return cache;
        }
        function decode$2(string, exclude) {
                var cache; if (typeof exclude !== "string") { exclude = decode$2.defaultChars; }
                cache = getDecodeCache(exclude); return string.replace(/(%[a-f0-9]{2})+/gi, (function (seq) {
                        var i, l, b1, b2, b3, b4, chr, result = ""; for (i = 0, l = seq.length; i < l; i += 3) {
                                b1 = parseInt(seq.slice(i + 1, i + 3), 16); if (b1 < 128) { result += cache[b1]; continue; }
                                if ((b1 & 224) === 192 && i + 3 < l) {
                                        b2 = parseInt(seq.slice(i + 4, i + 6), 16); if ((b2 & 192) === 128) {
                                                chr = b1 << 6 & 1984 | b2 & 63; if (chr < 128) { result += "\ufffd\ufffd"; } else { result += String.fromCharCode(chr); }
                                                i += 3; continue;
                                        }
                                }
                                if ((b1 & 240) === 224 && i + 6 < l) {
                                        b2 = parseInt(seq.slice(i + 4, i + 6), 16); b3 = parseInt(seq.slice(i + 7, i + 9), 16); if ((b2 & 192) === 128 && (b3 & 192) === 128) {
                                                chr = b1 << 12 & 61440 | b2 << 6 & 4032 | b3 & 63; if (chr < 2048 || chr >= 55296 && chr <= 57343) { result += "\ufffd\ufffd\ufffd"; } else { result += String.fromCharCode(chr); }
                                                i += 6; continue;
                                        }
                                }
                                if ((b1 & 248) === 240 && i + 9 < l) {
                                        b2 = parseInt(seq.slice(i + 4, i + 6), 16); b3 = parseInt(seq.slice(i + 7, i + 9), 16); b4 = parseInt(seq.slice(i + 10, i + 12), 16); if ((b2 & 192) === 128 && (b3 & 192) === 128 && (b4 & 192) === 128) {
                                                chr = b1 << 18 & 1835008 | b2 << 12 & 258048 | b3 << 6 & 4032 | b4 & 63; if (chr < 65536 || chr > 1114111) { result += "\ufffd\ufffd\ufffd\ufffd"; } else { chr -= 65536; result += String.fromCharCode(55296 + (chr >> 10), 56320 + (chr & 1023)); }
                                                i += 9; continue;
                                        }
                                }
                                result += "\ufffd";
                        }
                        return result;
                }));
        }
        decode$2.defaultChars = ";/?:@&=+$,#"; decode$2.componentChars = ""; var decode_1 = decode$2; var format$1 = function format(url) {
                var result = ""; result += url.protocol || ""; result += url.slashes ? "//" : ""; result += url.auth ? url.auth + "@" : ""; if (url.hostname && url.hostname.indexOf(":") !== -1) { result += "[" + url.hostname + "]"; } else { result += url.hostname || ""; }
                result += url.port ? ":" + url.port : ""; result += url.pathname || ""; result += url.search || ""; result += url.hash || ""; return result;
        }; function Url() { this.protocol = null; this.slashes = null; this.auth = null; this.port = null; this.hostname = null; this.hash = null; this.search = null; this.pathname = null; }
        var protocolPattern = /^([a-z0-9.+-]+:)/i, portPattern = /:[0-9]*$/, simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/, delims = ["<", ">", '"', "`", " ", "\r", "\n", "\t"], unwise = ["{", "}", "|", "\\", "^", "`"].concat(delims), autoEscape = ["'"].concat(unwise), nonHostChars = ["%", "/", "?", ";", "#"].concat(autoEscape), hostEndingChars = ["/", "?", "#"], hostnameMaxLen = 255, hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/, hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/, hostlessProtocol = { javascript: true, "javascript:": true }, slashedProtocol = { http: true, https: true, ftp: true, gopher: true, file: true, "http:": true, "https:": true, "ftp:": true, "gopher:": true, "file:": true }; function urlParse(url, slashesDenoteHost) {
                if (url && url instanceof Url) { return url; }
                var u = new Url; u.parse(url, slashesDenoteHost); return u;
        }
        Url.prototype.parse = function (url, slashesDenoteHost) {
                var i, l, lowerProto, hec, slashes, rest = url; rest = rest.trim(); if (!slashesDenoteHost && url.split("#").length === 1) {
                        var simplePath = simplePathPattern.exec(rest); if (simplePath) {
                                this.pathname = simplePath[1]; if (simplePath[2]) { this.search = simplePath[2]; }
                                return this;
                        }
                }
                var proto = protocolPattern.exec(rest); if (proto) { proto = proto[0]; lowerProto = proto.toLowerCase(); this.protocol = proto; rest = rest.substr(proto.length); }
                if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) { slashes = rest.substr(0, 2) === "//"; if (slashes && !(proto && hostlessProtocol[proto])) { rest = rest.substr(2); this.slashes = true; } }
                if (!hostlessProtocol[proto] && (slashes || proto && !slashedProtocol[proto])) {
                        var hostEnd = -1; for (i = 0; i < hostEndingChars.length; i++) { hec = rest.indexOf(hostEndingChars[i]); if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) { hostEnd = hec; } }
                        var auth, atSign; if (hostEnd === -1) { atSign = rest.lastIndexOf("@"); } else { atSign = rest.lastIndexOf("@", hostEnd); }
                        if (atSign !== -1) { auth = rest.slice(0, atSign); rest = rest.slice(atSign + 1); this.auth = auth; }
                        hostEnd = -1; for (i = 0; i < nonHostChars.length; i++) { hec = rest.indexOf(nonHostChars[i]); if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) { hostEnd = hec; } }
                        if (hostEnd === -1) { hostEnd = rest.length; }
                        if (rest[hostEnd - 1] === ":") { hostEnd--; }
                        var host = rest.slice(0, hostEnd); rest = rest.slice(hostEnd); this.parseHost(host); this.hostname = this.hostname || ""; var ipv6Hostname = this.hostname[0] === "[" && this.hostname[this.hostname.length - 1] === "]"; if (!ipv6Hostname) {
                                var hostparts = this.hostname.split(/\./); for (i = 0, l = hostparts.length; i < l; i++) {
                                        var part = hostparts[i]; if (!part) { continue; }
                                        if (!part.match(hostnamePartPattern)) {
                                                var newpart = ""; for (var j = 0, k = part.length; j < k; j++) { if (part.charCodeAt(j) > 127) { newpart += "x"; } else { newpart += part[j]; } }
                                                if (!newpart.match(hostnamePartPattern)) {
                                                        var validParts = hostparts.slice(0, i); var notHost = hostparts.slice(i + 1); var bit = part.match(hostnamePartStart); if (bit) { validParts.push(bit[1]); notHost.unshift(bit[2]); }
                                                        if (notHost.length) { rest = notHost.join(".") + rest; }
                                                        this.hostname = validParts.join("."); break;
                                                }
                                        }
                                }
                        }
                        if (this.hostname.length > hostnameMaxLen) { this.hostname = ""; }
                        if (ipv6Hostname) { this.hostname = this.hostname.substr(1, this.hostname.length - 2); }
                }
                var hash = rest.indexOf("#"); if (hash !== -1) { this.hash = rest.substr(hash); rest = rest.slice(0, hash); }
                var qm = rest.indexOf("?"); if (qm !== -1) { this.search = rest.substr(qm); rest = rest.slice(0, qm); }
                if (rest) { this.pathname = rest; }
                if (slashedProtocol[lowerProto] && this.hostname && !this.pathname) { this.pathname = ""; }
                return this;
        }; Url.prototype.parseHost = function (host) {
                var port = portPattern.exec(host); if (port) {
                        port = port[0]; if (port !== ":") { this.port = port.substr(1); }
                        host = host.substr(0, host.length - port.length);
                }
                if (host) { this.hostname = host; }
        }; var parse$1 = urlParse; var encode$1 = encode_1; var decode$1 = decode_1; var format = format$1; var parse = parse$1; var mdurl = { encode: encode$1, decode: decode$1, format: format, parse: parse }; var regex$3 = /[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/; var regex$2 = /[\0-\x1F\x7F-\x9F]/; var regex$1 = /[\xAD\u0600-\u0605\u061C\u06DD\u070F\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804[\uDCBD\uDCCD]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/; var regex = /[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/; var Any = regex$3; var Cc = regex$2; var Cf = regex$1; var P = regex$4; var Z = regex; var uc_micro = { Any: Any, Cc: Cc, Cf: Cf, P: P, Z: Z }; var utils = createCommonjsModule((function (module, exports) {
                function _class(obj) { return Object.prototype.toString.call(obj); }
                function isString(obj) { return _class(obj) === "[object String]"; }
                var _hasOwnProperty = Object.prototype.hasOwnProperty; function has(object, key) { return _hasOwnProperty.call(object, key); }
                function assign(obj) {
                        var sources = Array.prototype.slice.call(arguments, 1); sources.forEach((function (source) {
                                if (!source) { return; }
                                if (typeof source !== "object") { throw new TypeError(source + "must be object"); }
                                Object.keys(source).forEach((function (key) { obj[key] = source[key]; }));
                        })); return obj;
                }
                function arrayReplaceAt(src, pos, newElements) { return [].concat(src.slice(0, pos), newElements, src.slice(pos + 1)); }
                function isValidEntityCode(c) {
                        if (c >= 55296 && c <= 57343) { return false; }
                        if (c >= 64976 && c <= 65007) { return false; }
                        if ((c & 65535) === 65535 || (c & 65535) === 65534) { return false; }
                        if (c >= 0 && c <= 8) { return false; }
                        if (c === 11) { return false; }
                        if (c >= 14 && c <= 31) { return false; }
                        if (c >= 127 && c <= 159) { return false; }
                        if (c > 1114111) { return false; }
                        return true;
                }
                function fromCodePoint(c) {
                        if (c > 65535) { c -= 65536; var surrogate1 = 55296 + (c >> 10), surrogate2 = 56320 + (c & 1023); return String.fromCharCode(surrogate1, surrogate2); }
                        return String.fromCharCode(c);
                }
                var UNESCAPE_MD_RE = /\\([!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~])/g; var ENTITY_RE = /&([a-z#][a-z0-9]{1,31});/gi; var UNESCAPE_ALL_RE = new RegExp(UNESCAPE_MD_RE.source + "|" + ENTITY_RE.source, "gi"); var DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))/i; function replaceEntityPattern(match, name) {
                        var code = 0; if (has(entities, name)) { return entities[name]; }
                        if (name.charCodeAt(0) === 35 && DIGITAL_ENTITY_TEST_RE.test(name)) { code = name[1].toLowerCase() === "x" ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10); if (isValidEntityCode(code)) { return fromCodePoint(code); } }
                        return match;
                }
                function unescapeMd(str) {
                        if (str.indexOf("\\") < 0) { return str; }
                        return str.replace(UNESCAPE_MD_RE, "$1");
                }
                function unescapeAll(str) {
                        if (str.indexOf("\\") < 0 && str.indexOf("&") < 0) { return str; }
                        return str.replace(UNESCAPE_ALL_RE, (function (match, escaped, entity) {
                                if (escaped) { return escaped; }
                                return replaceEntityPattern(match, entity);
                        }));
                }
                var HTML_ESCAPE_TEST_RE = /[&<>"]/; var HTML_ESCAPE_REPLACE_RE = /[&<>"]/g; var HTML_REPLACEMENTS = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }; function replaceUnsafeChar(ch) { return HTML_REPLACEMENTS[ch]; }
                function escapeHtml(str) {
                        if (HTML_ESCAPE_TEST_RE.test(str)) { return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar); }
                        return str;
                }
                var REGEXP_ESCAPE_RE = /[.?*+^$[\]\\(){}|-]/g; function escapeRE(str) { return str.replace(REGEXP_ESCAPE_RE, "\\$&"); }
                function isSpace(code) {
                        switch (code) { case 9: case 32: return true; }
                        return false;
                }
                function isWhiteSpace(code) {
                        if (code >= 8192 && code <= 8202) { return true; }
                        switch (code) { case 9: case 10: case 11: case 12: case 13: case 32: case 160: case 5760: case 8239: case 8287: case 12288: return true; }
                        return false;
                }
                function isPunctChar(ch) { return regex$4.test(ch); }
                function isMdAsciiPunct(ch) { switch (ch) { case 33: case 34: case 35: case 36: case 37: case 38: case 39: case 40: case 41: case 42: case 43: case 44: case 45: case 46: case 47: case 58: case 59: case 60: case 61: case 62: case 63: case 64: case 91: case 92: case 93: case 94: case 95: case 96: case 123: case 124: case 125: case 126: return true; default: return false; } }
                function normalizeReference(str) {
                        str = str.trim().replace(/\s+/g, " "); if ("\u1e9e".toLowerCase() === "\u1e7e") { str = str.replace(/\u1e9e/g, "\xdf"); }
                        return str.toLowerCase().toUpperCase();
                }
                exports.lib = {}; exports.lib.mdurl = mdurl; exports.lib.ucmicro = uc_micro; exports.assign = assign; exports.isString = isString; exports.has = has; exports.unescapeMd = unescapeMd; exports.unescapeAll = unescapeAll; exports.isValidEntityCode = isValidEntityCode; exports.fromCodePoint = fromCodePoint; exports.escapeHtml = escapeHtml; exports.arrayReplaceAt = arrayReplaceAt; exports.isSpace = isSpace; exports.isWhiteSpace = isWhiteSpace; exports.isMdAsciiPunct = isMdAsciiPunct; exports.isPunctChar = isPunctChar; exports.escapeRE = escapeRE; exports.normalizeReference = normalizeReference;
        })); var parse_link_label = function parseLinkLabel(state, start, disableNested) {
                var level, found, marker, prevPos, labelEnd = -1, max = state.posMax, oldPos = state.pos; state.pos = start + 1; level = 1; while (state.pos < max) {
                        marker = state.src.charCodeAt(state.pos); if (marker === 93) { level--; if (level === 0) { found = true; break; } }
                        prevPos = state.pos; state.md.inline.skipToken(state); if (marker === 91) { if (prevPos === state.pos - 1) { level++; } else if (disableNested) { state.pos = oldPos; return -1; } }
                }
                if (found) { labelEnd = state.pos; }
                state.pos = oldPos; return labelEnd;
        }; var unescapeAll$2 = utils.unescapeAll; var parse_link_destination = function parseLinkDestination(str, pos, max) {
                var code, level, lines = 0, start = pos, result = { ok: false, pos: 0, lines: 0, str: "" }; if (str.charCodeAt(pos) === 60) {
                        pos++; while (pos < max) {
                                code = str.charCodeAt(pos); if (code === 10) { return result; }
                                if (code === 60) { return result; }
                                if (code === 62) { result.pos = pos + 1; result.str = unescapeAll$2(str.slice(start + 1, pos)); result.ok = true; return result; }
                                if (code === 92 && pos + 1 < max) { pos += 2; continue; }
                                pos++;
                        }
                        return result;
                }
                level = 0; while (pos < max) {
                        code = str.charCodeAt(pos); if (code === 32) { break; }
                        if (code < 32 || code === 127) { break; }
                        if (code === 92 && pos + 1 < max) {
                                if (str.charCodeAt(pos + 1) === 32) { break; }
                                pos += 2; continue;
                        }
                        if (code === 40) { level++; if (level > 32) { return result; } }
                        if (code === 41) {
                                if (level === 0) { break; }
                                level--;
                        }
                        pos++;
                }
                if (start === pos) { return result; }
                if (level !== 0) { return result; }
                result.str = unescapeAll$2(str.slice(start, pos)); result.lines = lines; result.pos = pos; result.ok = true; return result;
        }; var unescapeAll$1 = utils.unescapeAll; var parse_link_title = function parseLinkTitle(str, pos, max) {
                var code, marker, lines = 0, start = pos, result = { ok: false, pos: 0, lines: 0, str: "" }; if (pos >= max) { return result; }
                marker = str.charCodeAt(pos); if (marker !== 34 && marker !== 39 && marker !== 40) { return result; }
                pos++; if (marker === 40) { marker = 41; }
                while (pos < max) {
                        code = str.charCodeAt(pos); if (code === marker) { result.pos = pos + 1; result.lines = lines; result.str = unescapeAll$1(str.slice(start + 1, pos)); result.ok = true; return result; } else if (code === 40 && marker === 41) { return result; } else if (code === 10) { lines++; } else if (code === 92 && pos + 1 < max) { pos++; if (str.charCodeAt(pos) === 10) { lines++; } }
                        pos++;
                }
                return result;
        }; var parseLinkLabel = parse_link_label; var parseLinkDestination = parse_link_destination; var parseLinkTitle = parse_link_title; var helpers = { parseLinkLabel: parseLinkLabel, parseLinkDestination: parseLinkDestination, parseLinkTitle: parseLinkTitle }; var assign$1 = utils.assign; var unescapeAll = utils.unescapeAll; var escapeHtml = utils.escapeHtml; var default_rules = {}; default_rules.code_inline = function (tokens, idx, options, env, slf) { var token = tokens[idx]; return "<code" + slf.renderAttrs(token) + ">" + escapeHtml(tokens[idx].content) + "</code>"; }; default_rules.code_block = function (tokens, idx, options, env, slf) { var token = tokens[idx]; return "<pre" + slf.renderAttrs(token) + "><code>" + escapeHtml(tokens[idx].content) + "</code></pre>\n"; }; default_rules.fence = function (tokens, idx, options, env, slf) {
                var token = tokens[idx], info = token.info ? unescapeAll(token.info).trim() : "", langName = "", langAttrs = "", highlighted, i, arr, tmpAttrs, tmpToken; if (info) { arr = info.split(/(\s+)/g); langName = arr[0]; langAttrs = arr.slice(2).join(""); }
                if (options.highlight) { highlighted = options.highlight(token.content, langName, langAttrs) || escapeHtml(token.content); } else { highlighted = escapeHtml(token.content); }
                if (highlighted.indexOf("<pre") === 0) { return highlighted + "\n"; }
                if (info) {
                        i = token.attrIndex("class"); tmpAttrs = token.attrs ? token.attrs.slice() : []; if (i < 0) { tmpAttrs.push(["class", options.langPrefix + langName]); } else { tmpAttrs[i] = tmpAttrs[i].slice(); tmpAttrs[i][1] += " " + options.langPrefix + langName; }
                        tmpToken = { attrs: tmpAttrs }; return "<pre><code" + slf.renderAttrs(tmpToken) + ">" + highlighted + "</code></pre>\n";
                }
                return "<pre><code" + slf.renderAttrs(token) + ">" + highlighted + "</code></pre>\n";
        }; default_rules.image = function (tokens, idx, options, env, slf) { var token = tokens[idx]; token.attrs[token.attrIndex("alt")][1] = slf.renderInlineAsText(token.children, options, env); return slf.renderToken(tokens, idx, options); }; default_rules.hardbreak = function (tokens, idx, options) { return options.xhtmlOut ? "<br />\n" : "<br>\n"; }; default_rules.softbreak = function (tokens, idx, options) { return options.breaks ? options.xhtmlOut ? "<br />\n" : "<br>\n" : "\n"; }; default_rules.text = function (tokens, idx) { return escapeHtml(tokens[idx].content); }; default_rules.html_block = function (tokens, idx) { return tokens[idx].content; }; default_rules.html_inline = function (tokens, idx) { return tokens[idx].content; }; function Renderer() { this.rules = assign$1({}, default_rules); }
        Renderer.prototype.renderAttrs = function renderAttrs(token) {
                var i, l, result; if (!token.attrs) { return ""; }
                result = ""; for (i = 0, l = token.attrs.length; i < l; i++) { result += " " + escapeHtml(token.attrs[i][0]) + '="' + escapeHtml(token.attrs[i][1]) + '"'; }
                return result;
        }; Renderer.prototype.renderToken = function renderToken(tokens, idx, options) {
                var nextToken, result = "", needLf = false, token = tokens[idx]; if (token.hidden) { return ""; }
                if (token.block && token.nesting !== -1 && idx && tokens[idx - 1].hidden) { result += "\n"; }
                result += (token.nesting === -1 ? "</" : "<") + token.tag; result += this.renderAttrs(token); if (token.nesting === 0 && options.xhtmlOut) { result += " /"; }
                if (token.block) { needLf = true; if (token.nesting === 1) { if (idx + 1 < tokens.length) { nextToken = tokens[idx + 1]; if (nextToken.type === "inline" || nextToken.hidden) { needLf = false; } else if (nextToken.nesting === -1 && nextToken.tag === token.tag) { needLf = false; } } } }
                result += needLf ? ">\n" : ">"; return result;
        }; Renderer.prototype.renderInline = function (tokens, options, env) {
                var type, result = "", rules = this.rules; for (var i = 0, len = tokens.length; i < len; i++) { type = tokens[i].type; if (typeof rules[type] !== "undefined") { result += rules[type](tokens, i, options, env, this); } else { result += this.renderToken(tokens, i, options); } }
                return result;
        }; Renderer.prototype.renderInlineAsText = function (tokens, options, env) {
                var result = ""; for (var i = 0, len = tokens.length; i < len; i++) { if (tokens[i].type === "text") { result += tokens[i].content; } else if (tokens[i].type === "image") { result += this.renderInlineAsText(tokens[i].children, options, env); } else if (tokens[i].type === "softbreak") { result += "\n"; } }
                return result;
        }; Renderer.prototype.render = function (tokens, options, env) {
                var i, len, type, result = "", rules = this.rules; for (i = 0, len = tokens.length; i < len; i++) { type = tokens[i].type; if (type === "inline") { result += this.renderInline(tokens[i].children, options, env); } else if (typeof rules[type] !== "undefined") { result += rules[tokens[i].type](tokens, i, options, env, this); } else { result += this.renderToken(tokens, i, options, env); } }
                return result;
        }; var renderer = Renderer; function Ruler() { this.__rules__ = []; this.__cache__ = null; }
        Ruler.prototype.__find__ = function (name) {
                for (var i = 0; i < this.__rules__.length; i++) { if (this.__rules__[i].name === name) { return i; } }
                return -1;
        }; Ruler.prototype.__compile__ = function () {
                var self = this; var chains = [""]; self.__rules__.forEach((function (rule) {
                        if (!rule.enabled) { return; }
                        rule.alt.forEach((function (altName) { if (chains.indexOf(altName) < 0) { chains.push(altName); } }));
                })); self.__cache__ = {}; chains.forEach((function (chain) {
                        self.__cache__[chain] = []; self.__rules__.forEach((function (rule) {
                                if (!rule.enabled) { return; }
                                if (chain && rule.alt.indexOf(chain) < 0) { return; }
                                self.__cache__[chain].push(rule.fn);
                        }));
                }));
        }; Ruler.prototype.at = function (name, fn, options) {
                var index = this.__find__(name); var opt = options || {}; if (index === -1) { throw new Error("Parser rule not found: " + name); }
                this.__rules__[index].fn = fn; this.__rules__[index].alt = opt.alt || []; this.__cache__ = null;
        }; Ruler.prototype.before = function (beforeName, ruleName, fn, options) {
                var index = this.__find__(beforeName); var opt = options || {}; if (index === -1) { throw new Error("Parser rule not found: " + beforeName); }
                this.__rules__.splice(index, 0, { name: ruleName, enabled: true, fn: fn, alt: opt.alt || [] }); this.__cache__ = null;
        }; Ruler.prototype.after = function (afterName, ruleName, fn, options) {
                var index = this.__find__(afterName); var opt = options || {}; if (index === -1) { throw new Error("Parser rule not found: " + afterName); }
                this.__rules__.splice(index + 1, 0, { name: ruleName, enabled: true, fn: fn, alt: opt.alt || [] }); this.__cache__ = null;
        }; Ruler.prototype.push = function (ruleName, fn, options) { var opt = options || {}; this.__rules__.push({ name: ruleName, enabled: true, fn: fn, alt: opt.alt || [] }); this.__cache__ = null; }; Ruler.prototype.enable = function (list, ignoreInvalid) {
                if (!Array.isArray(list)) { list = [list]; }
                var result = []; list.forEach((function (name) {
                        var idx = this.__find__(name); if (idx < 0) {
                                if (ignoreInvalid) { return; }
                                throw new Error("Rules manager: invalid rule name " + name);
                        }
                        this.__rules__[idx].enabled = true; result.push(name);
                }), this); this.__cache__ = null; return result;
        }; Ruler.prototype.enableOnly = function (list, ignoreInvalid) {
                if (!Array.isArray(list)) { list = [list]; }
                this.__rules__.forEach((function (rule) { rule.enabled = false; })); this.enable(list, ignoreInvalid);
        }; Ruler.prototype.disable = function (list, ignoreInvalid) {
                if (!Array.isArray(list)) { list = [list]; }
                var result = []; list.forEach((function (name) {
                        var idx = this.__find__(name); if (idx < 0) {
                                if (ignoreInvalid) { return; }
                                throw new Error("Rules manager: invalid rule name " + name);
                        }
                        this.__rules__[idx].enabled = false; result.push(name);
                }), this); this.__cache__ = null; return result;
        }; Ruler.prototype.getRules = function (chainName) {
                if (this.__cache__ === null) { this.__compile__(); }
                return this.__cache__[chainName] || [];
        }; var ruler = Ruler; var NEWLINES_RE = /\r\n?|\n/g; var NULL_RE = /\0/g; var normalize = function normalize(state) { var str; str = state.src.replace(NEWLINES_RE, "\n"); str = str.replace(NULL_RE, "\ufffd"); state.src = str; }; var block = function block(state) { var token; if (state.inlineMode) { token = new state.Token("inline", "", 0); token.content = state.src; token.map = [0, 1]; token.children = []; state.tokens.push(token); } else { state.md.block.parse(state.src, state.md, state.env, state.tokens); } }; var inline = function inline(state) { var tokens = state.tokens, tok, i, l; for (i = 0, l = tokens.length; i < l; i++) { tok = tokens[i]; if (tok.type === "inline") { state.md.inline.parse(tok.content, state.md, state.env, tok.children); } } }; var arrayReplaceAt = utils.arrayReplaceAt; function isLinkOpen(str) { return /^<a[>\s]/i.test(str); }
        function isLinkClose(str) { return /^<\/a\s*>/i.test(str); }
        var linkify = function linkify(state) {
                var i, j, l, tokens, token, currentToken, nodes, ln, text, pos, lastPos, level, htmlLinkLevel, url, fullUrl, urlText, blockTokens = state.tokens, links; if (!state.md.options.linkify) { return; }
                for (j = 0, l = blockTokens.length; j < l; j++) {
                        if (blockTokens[j].type !== "inline" || !state.md.linkify.pretest(blockTokens[j].content)) { continue; }
                        tokens = blockTokens[j].children; htmlLinkLevel = 0; for (i = tokens.length - 1; i >= 0; i--) {
                                currentToken = tokens[i]; if (currentToken.type === "link_close") {
                                        i--; while (tokens[i].level !== currentToken.level && tokens[i].type !== "link_open") { i--; }
                                        continue;
                                }
                                if (currentToken.type === "html_inline") {
                                        if (isLinkOpen(currentToken.content) && htmlLinkLevel > 0) { htmlLinkLevel--; }
                                        if (isLinkClose(currentToken.content)) { htmlLinkLevel++; }
                                }
                                if (htmlLinkLevel > 0) { continue; }
                                if (currentToken.type === "text" && state.md.linkify.test(currentToken.content)) {
                                        text = currentToken.content; links = state.md.linkify.match(text); nodes = []; level = currentToken.level; lastPos = 0; for (ln = 0; ln < links.length; ln++) {
                                                url = links[ln].url; fullUrl = state.md.normalizeLink(url); if (!state.md.validateLink(fullUrl)) { continue; }
                                                urlText = links[ln].text; if (!links[ln].schema) { urlText = state.md.normalizeLinkText("http://" + urlText).replace(/^http:\/\//, ""); } else if (links[ln].schema === "mailto:" && !/^mailto:/i.test(urlText)) { urlText = state.md.normalizeLinkText("mailto:" + urlText).replace(/^mailto:/, ""); } else { urlText = state.md.normalizeLinkText(urlText); }
                                                pos = links[ln].index; if (pos > lastPos) { token = new state.Token("text", "", 0); token.content = text.slice(lastPos, pos); token.level = level; nodes.push(token); }
                                                token = new state.Token("link_open", "a", 1); token.attrs = [["href", fullUrl]]; token.level = level++; token.markup = "linkify"; token.info = "auto"; nodes.push(token); token = new state.Token("text", "", 0); token.content = urlText; token.level = level; nodes.push(token); token = new state.Token("link_close", "a", -1); token.level = --level; token.markup = "linkify"; token.info = "auto"; nodes.push(token); lastPos = links[ln].lastIndex;
                                        }
                                        if (lastPos < text.length) { token = new state.Token("text", "", 0); token.content = text.slice(lastPos); token.level = level; nodes.push(token); }
                                        blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
                                }
                        }
                }
        }; var RARE_RE = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/; var SCOPED_ABBR_TEST_RE = /\((c|tm|r|p)\)/i; var SCOPED_ABBR_RE = /\((c|tm|r|p)\)/gi; var SCOPED_ABBR = { c: "\xa9", r: "\xae", p: "\xa7", tm: "\u2122" }; function replaceFn(match, name) { return SCOPED_ABBR[name.toLowerCase()]; }
        function replace_scoped(inlineTokens) {
                var i, token, inside_autolink = 0; for (i = inlineTokens.length - 1; i >= 0; i--) {
                        token = inlineTokens[i]; if (token.type === "text" && !inside_autolink) { token.content = token.content.replace(SCOPED_ABBR_RE, replaceFn); }
                        if (token.type === "link_open" && token.info === "auto") { inside_autolink--; }
                        if (token.type === "link_close" && token.info === "auto") { inside_autolink++; }
                }
        }
        function replace_rare(inlineTokens) {
                var i, token, inside_autolink = 0; for (i = inlineTokens.length - 1; i >= 0; i--) {
                        token = inlineTokens[i]; if (token.type === "text" && !inside_autolink) { if (RARE_RE.test(token.content)) { token.content = token.content.replace(/\+-/g, "\xb1").replace(/\.{2,}/g, "\u2026").replace(/([?!])\u2026/g, "$1..").replace(/([?!]){4,}/g, "$1$1$1").replace(/,{2,}/g, ",").replace(/(^|[^-])---(?=[^-]|$)/gm, "$1\u2014").replace(/(^|\s)--(?=\s|$)/gm, "$1\u2013").replace(/(^|[^-\s])--(?=[^-\s]|$)/gm, "$1\u2013"); } }
                        if (token.type === "link_open" && token.info === "auto") { inside_autolink--; }
                        if (token.type === "link_close" && token.info === "auto") { inside_autolink++; }
                }
        }
        var replacements = function replace(state) {
                var blkIdx; if (!state.md.options.typographer) { return; }
                for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
                        if (state.tokens[blkIdx].type !== "inline") { continue; }
                        if (SCOPED_ABBR_TEST_RE.test(state.tokens[blkIdx].content)) { replace_scoped(state.tokens[blkIdx].children); }
                        if (RARE_RE.test(state.tokens[blkIdx].content)) { replace_rare(state.tokens[blkIdx].children); }
                }
        }; var isWhiteSpace$1 = utils.isWhiteSpace; var isPunctChar$1 = utils.isPunctChar; var isMdAsciiPunct$1 = utils.isMdAsciiPunct; var QUOTE_TEST_RE = /['"]/; var QUOTE_RE = /['"]/g; var APOSTROPHE = "\u2019"; function replaceAt(str, index, ch) { return str.substr(0, index) + ch + str.substr(index + 1); }
        function process_inlines(tokens, state) {
                var i, token, text, t, pos, max, thisLevel, item, lastChar, nextChar, isLastPunctChar, isNextPunctChar, isLastWhiteSpace, isNextWhiteSpace, canOpen, canClose, j, isSingle, stack, openQuote, closeQuote; stack = []; for (i = 0; i < tokens.length; i++) {
                        token = tokens[i]; thisLevel = tokens[i].level; for (j = stack.length - 1; j >= 0; j--) { if (stack[j].level <= thisLevel) { break; } }
                        stack.length = j + 1; if (token.type !== "text") { continue; }
                        text = token.content; pos = 0; max = text.length; OUTER: while (pos < max) {
                                QUOTE_RE.lastIndex = pos; t = QUOTE_RE.exec(text); if (!t) { break; }
                                canOpen = canClose = true; pos = t.index + 1; isSingle = t[0] === "'"; lastChar = 32; if (t.index - 1 >= 0) { lastChar = text.charCodeAt(t.index - 1); } else { for (j = i - 1; j >= 0; j--) { if (tokens[j].type === "softbreak" || tokens[j].type === "hardbreak") break; if (!tokens[j].content) continue; lastChar = tokens[j].content.charCodeAt(tokens[j].content.length - 1); break; } }
                                nextChar = 32; if (pos < max) { nextChar = text.charCodeAt(pos); } else { for (j = i + 1; j < tokens.length; j++) { if (tokens[j].type === "softbreak" || tokens[j].type === "hardbreak") break; if (!tokens[j].content) continue; nextChar = tokens[j].content.charCodeAt(0); break; } }
                                isLastPunctChar = isMdAsciiPunct$1(lastChar) || isPunctChar$1(String.fromCharCode(lastChar)); isNextPunctChar = isMdAsciiPunct$1(nextChar) || isPunctChar$1(String.fromCharCode(nextChar)); isLastWhiteSpace = isWhiteSpace$1(lastChar); isNextWhiteSpace = isWhiteSpace$1(nextChar); if (isNextWhiteSpace) { canOpen = false; } else if (isNextPunctChar) { if (!(isLastWhiteSpace || isLastPunctChar)) { canOpen = false; } }
                                if (isLastWhiteSpace) { canClose = false; } else if (isLastPunctChar) { if (!(isNextWhiteSpace || isNextPunctChar)) { canClose = false; } }
                                if (nextChar === 34 && t[0] === '"') { if (lastChar >= 48 && lastChar <= 57) { canClose = canOpen = false; } }
                                if (canOpen && canClose) { canOpen = isLastPunctChar; canClose = isNextPunctChar; }
                                if (!canOpen && !canClose) {
                                        if (isSingle) { token.content = replaceAt(token.content, t.index, APOSTROPHE); }
                                        continue;
                                }
                                if (canClose) {
                                        for (j = stack.length - 1; j >= 0; j--) {
                                                item = stack[j]; if (stack[j].level < thisLevel) { break; }
                                                if (item.single === isSingle && stack[j].level === thisLevel) {
                                                        item = stack[j]; if (isSingle) { openQuote = state.md.options.quotes[2]; closeQuote = state.md.options.quotes[3]; } else { openQuote = state.md.options.quotes[0]; closeQuote = state.md.options.quotes[1]; }
                                                        token.content = replaceAt(token.content, t.index, closeQuote); tokens[item.token].content = replaceAt(tokens[item.token].content, item.pos, openQuote); pos += closeQuote.length - 1; if (item.token === i) { pos += openQuote.length - 1; }
                                                        text = token.content; max = text.length; stack.length = j; continue OUTER;
                                                }
                                        }
                                }
                                if (canOpen) { stack.push({ token: i, pos: t.index, single: isSingle, level: thisLevel }); } else if (canClose && isSingle) { token.content = replaceAt(token.content, t.index, APOSTROPHE); }
                        }
                }
        }
        var smartquotes = function smartquotes(state) {
                var blkIdx; if (!state.md.options.typographer) { return; }
                for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
                        if (state.tokens[blkIdx].type !== "inline" || !QUOTE_TEST_RE.test(state.tokens[blkIdx].content)) { continue; }
                        process_inlines(state.tokens[blkIdx].children, state);
                }
        }; function Token(type, tag, nesting) { this.type = type; this.tag = tag; this.attrs = null; this.map = null; this.nesting = nesting; this.level = 0; this.children = null; this.content = ""; this.markup = ""; this.info = ""; this.meta = null; this.block = false; this.hidden = false; }
        Token.prototype.attrIndex = function attrIndex(name) {
                var attrs, i, len; if (!this.attrs) { return -1; }
                attrs = this.attrs; for (i = 0, len = attrs.length; i < len; i++) { if (attrs[i][0] === name) { return i; } }
                return -1;
        }; Token.prototype.attrPush = function attrPush(attrData) { if (this.attrs) { this.attrs.push(attrData); } else { this.attrs = [attrData]; } }; Token.prototype.attrSet = function attrSet(name, value) { var idx = this.attrIndex(name), attrData = [name, value]; if (idx < 0) { this.attrPush(attrData); } else { this.attrs[idx] = attrData; } }; Token.prototype.attrGet = function attrGet(name) {
                var idx = this.attrIndex(name), value = null; if (idx >= 0) { value = this.attrs[idx][1]; }
                return value;
        }; Token.prototype.attrJoin = function attrJoin(name, value) { var idx = this.attrIndex(name); if (idx < 0) { this.attrPush([name, value]); } else { this.attrs[idx][1] = this.attrs[idx][1] + " " + value; } }; var token = Token; function StateCore(src, md, env) { this.src = src; this.env = env; this.tokens = []; this.inlineMode = false; this.md = md; }
        StateCore.prototype.Token = token; var state_core = StateCore; var _rules$2 = [["normalize", normalize], ["block", block], ["inline", inline], ["linkify", linkify], ["replacements", replacements], ["smartquotes", smartquotes]]; function Core() { this.ruler = new ruler; for (var i = 0; i < _rules$2.length; i++) { this.ruler.push(_rules$2[i][0], _rules$2[i][1]); } }
        Core.prototype.process = function (state) { var i, l, rules; rules = this.ruler.getRules(""); for (i = 0, l = rules.length; i < l; i++) { rules[i](state); } }; Core.prototype.State = state_core; var parser_core = Core; var isSpace$a = utils.isSpace; function getLine(state, line) { var pos = state.bMarks[line] + state.tShift[line], max = state.eMarks[line]; return state.src.substr(pos, max - pos); }
        function escapedSplit(str) {
                var result = [], pos = 0, max = str.length, ch, isEscaped = false, lastPos = 0, current = ""; ch = str.charCodeAt(pos); while (pos < max) {
                        if (ch === 124) { if (!isEscaped) { result.push(current + str.substring(lastPos, pos)); current = ""; lastPos = pos + 1; } else { current += str.substring(lastPos, pos - 1); lastPos = pos; } }
                        isEscaped = ch === 92; pos++; ch = str.charCodeAt(pos);
                }
                result.push(current + str.substring(lastPos)); return result;
        }
        var table = function table(state, startLine, endLine, silent) {
                var ch, lineText, pos, i, l, nextLine, columns, columnCount, token, aligns, t, tableLines, tbodyLines, oldParentType, terminate, terminatorRules, firstCh, secondCh; if (startLine + 2 > endLine) { return false; }
                nextLine = startLine + 1; if (state.sCount[nextLine] < state.blkIndent) { return false; }
                if (state.sCount[nextLine] - state.blkIndent >= 4) { return false; }
                pos = state.bMarks[nextLine] + state.tShift[nextLine]; if (pos >= state.eMarks[nextLine]) { return false; }
                firstCh = state.src.charCodeAt(pos++); if (firstCh !== 124 && firstCh !== 45 && firstCh !== 58) { return false; }
                if (pos >= state.eMarks[nextLine]) { return false; }
                secondCh = state.src.charCodeAt(pos++); if (secondCh !== 124 && secondCh !== 45 && secondCh !== 58 && !isSpace$a(secondCh)) { return false; }
                if (firstCh === 45 && isSpace$a(secondCh)) { return false; }
                while (pos < state.eMarks[nextLine]) {
                        ch = state.src.charCodeAt(pos); if (ch !== 124 && ch !== 45 && ch !== 58 && !isSpace$a(ch)) { return false; }
                        pos++;
                }
                lineText = getLine(state, startLine + 1); columns = lineText.split("|"); aligns = []; for (i = 0; i < columns.length; i++) {
                        t = columns[i].trim(); if (!t) { if (i === 0 || i === columns.length - 1) { continue; } else { return false; } }
                        if (!/^:?-+:?$/.test(t)) { return false; }
                        if (t.charCodeAt(t.length - 1) === 58) { aligns.push(t.charCodeAt(0) === 58 ? "center" : "right"); } else if (t.charCodeAt(0) === 58) { aligns.push("left"); } else { aligns.push(""); }
                }
                lineText = getLine(state, startLine).trim(); if (lineText.indexOf("|") === -1) { return false; }
                if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }
                columns = escapedSplit(lineText); if (columns.length && columns[0] === "") columns.shift(); if (columns.length && columns[columns.length - 1] === "") columns.pop(); columnCount = columns.length; if (columnCount === 0 || columnCount !== aligns.length) { return false; }
                if (silent) { return true; }
                oldParentType = state.parentType; state.parentType = "table"; terminatorRules = state.md.block.ruler.getRules("blockquote"); token = state.push("table_open", "table", 1); token.map = tableLines = [startLine, 0]; token = state.push("thead_open", "thead", 1); token.map = [startLine, startLine + 1]; token = state.push("tr_open", "tr", 1); token.map = [startLine, startLine + 1]; for (i = 0; i < columns.length; i++) {
                        token = state.push("th_open", "th", 1); if (aligns[i]) { token.attrs = [["style", "text-align:" + aligns[i]]]; }
                        token = state.push("inline", "", 0); token.content = columns[i].trim(); token.children = []; token = state.push("th_close", "th", -1);
                }
                token = state.push("tr_close", "tr", -1); token = state.push("thead_close", "thead", -1); for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
                        if (state.sCount[nextLine] < state.blkIndent) { break; }
                        terminate = false; for (i = 0, l = terminatorRules.length; i < l; i++) { if (terminatorRules[i](state, nextLine, endLine, true)) { terminate = true; break; } }
                        if (terminate) { break; }
                        lineText = getLine(state, nextLine).trim(); if (!lineText) { break; }
                        if (state.sCount[nextLine] - state.blkIndent >= 4) { break; }
                        columns = escapedSplit(lineText); if (columns.length && columns[0] === "") columns.shift(); if (columns.length && columns[columns.length - 1] === "") columns.pop(); if (nextLine === startLine + 2) { token = state.push("tbody_open", "tbody", 1); token.map = tbodyLines = [startLine + 2, 0]; }
                        token = state.push("tr_open", "tr", 1); token.map = [nextLine, nextLine + 1]; for (i = 0; i < columnCount; i++) {
                                token = state.push("td_open", "td", 1); if (aligns[i]) { token.attrs = [["style", "text-align:" + aligns[i]]]; }
                                token = state.push("inline", "", 0); token.content = columns[i] ? columns[i].trim() : ""; token.children = []; token = state.push("td_close", "td", -1);
                        }
                        token = state.push("tr_close", "tr", -1);
                }
                if (tbodyLines) { token = state.push("tbody_close", "tbody", -1); tbodyLines[1] = nextLine; }
                token = state.push("table_close", "table", -1); tableLines[1] = nextLine; state.parentType = oldParentType; state.line = nextLine; return true;
        }; var code = function code(state, startLine, endLine) {
                var nextLine, last, token; if (state.sCount[startLine] - state.blkIndent < 4) { return false; }
                last = nextLine = startLine + 1; while (nextLine < endLine) {
                        if (state.isEmpty(nextLine)) { nextLine++; continue; }
                        if (state.sCount[nextLine] - state.blkIndent >= 4) { nextLine++; last = nextLine; continue; }
                        break;
                }
                state.line = last; token = state.push("code_block", "code", 0); token.content = state.getLines(startLine, last, 4 + state.blkIndent, false) + "\n"; token.map = [startLine, state.line]; return true;
        }; var fence = function fence(state, startLine, endLine, silent) {
                var marker, len, params, nextLine, mem, token, markup, haveEndMarker = false, pos = state.bMarks[startLine] + state.tShift[startLine], max = state.eMarks[startLine]; if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }
                if (pos + 3 > max) { return false; }
                marker = state.src.charCodeAt(pos); if (marker !== 126 && marker !== 96) { return false; }
                mem = pos; pos = state.skipChars(pos, marker); len = pos - mem; if (len < 3) { return false; }
                markup = state.src.slice(mem, pos); params = state.src.slice(pos, max); if (marker === 96) { if (params.indexOf(String.fromCharCode(marker)) >= 0) { return false; } }
                if (silent) { return true; }
                nextLine = startLine; for (; ;) {
                        nextLine++; if (nextLine >= endLine) { break; }
                        pos = mem = state.bMarks[nextLine] + state.tShift[nextLine]; max = state.eMarks[nextLine]; if (pos < max && state.sCount[nextLine] < state.blkIndent) { break; }
                        if (state.src.charCodeAt(pos) !== marker) { continue; }
                        if (state.sCount[nextLine] - state.blkIndent >= 4) { continue; }
                        pos = state.skipChars(pos, marker); if (pos - mem < len) { continue; }
                        pos = state.skipSpaces(pos); if (pos < max) { continue; }
                        haveEndMarker = true; break;
                }
                len = state.sCount[startLine]; state.line = nextLine + (haveEndMarker ? 1 : 0); token = state.push("fence", "code", 0); token.info = params; token.content = state.getLines(startLine + 1, nextLine, len, true); token.markup = markup; token.map = [startLine, state.line]; return true;
        }; var isSpace$9 = utils.isSpace; var blockquote = function blockquote(state, startLine, endLine, silent) {
                var adjustTab, ch, i, initial, l, lastLineEmpty, lines, nextLine, offset, oldBMarks, oldBSCount, oldIndent, oldParentType, oldSCount, oldTShift, spaceAfterMarker, terminate, terminatorRules, token, isOutdented, oldLineMax = state.lineMax, pos = state.bMarks[startLine] + state.tShift[startLine], max = state.eMarks[startLine]; if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }
                if (state.src.charCodeAt(pos++) !== 62) { return false; }
                if (silent) { return true; }
                initial = offset = state.sCount[startLine] + 1; if (state.src.charCodeAt(pos) === 32) { pos++; initial++; offset++; adjustTab = false; spaceAfterMarker = true; } else if (state.src.charCodeAt(pos) === 9) { spaceAfterMarker = true; if ((state.bsCount[startLine] + offset) % 4 === 3) { pos++; initial++; offset++; adjustTab = false; } else { adjustTab = true; } } else { spaceAfterMarker = false; }
                oldBMarks = [state.bMarks[startLine]]; state.bMarks[startLine] = pos; while (pos < max) {
                        ch = state.src.charCodeAt(pos); if (isSpace$9(ch)) { if (ch === 9) { offset += 4 - (offset + state.bsCount[startLine] + (adjustTab ? 1 : 0)) % 4; } else { offset++; } } else { break; }
                        pos++;
                }
                oldBSCount = [state.bsCount[startLine]]; state.bsCount[startLine] = state.sCount[startLine] + 1 + (spaceAfterMarker ? 1 : 0); lastLineEmpty = pos >= max; oldSCount = [state.sCount[startLine]]; state.sCount[startLine] = offset - initial; oldTShift = [state.tShift[startLine]]; state.tShift[startLine] = pos - state.bMarks[startLine]; terminatorRules = state.md.block.ruler.getRules("blockquote"); oldParentType = state.parentType; state.parentType = "blockquote"; for (nextLine = startLine + 1; nextLine < endLine; nextLine++) {
                        isOutdented = state.sCount[nextLine] < state.blkIndent; pos = state.bMarks[nextLine] + state.tShift[nextLine]; max = state.eMarks[nextLine]; if (pos >= max) { break; }
                        if (state.src.charCodeAt(pos++) === 62 && !isOutdented) {
                                initial = offset = state.sCount[nextLine] + 1; if (state.src.charCodeAt(pos) === 32) { pos++; initial++; offset++; adjustTab = false; spaceAfterMarker = true; } else if (state.src.charCodeAt(pos) === 9) { spaceAfterMarker = true; if ((state.bsCount[nextLine] + offset) % 4 === 3) { pos++; initial++; offset++; adjustTab = false; } else { adjustTab = true; } } else { spaceAfterMarker = false; }
                                oldBMarks.push(state.bMarks[nextLine]); state.bMarks[nextLine] = pos; while (pos < max) {
                                        ch = state.src.charCodeAt(pos); if (isSpace$9(ch)) { if (ch === 9) { offset += 4 - (offset + state.bsCount[nextLine] + (adjustTab ? 1 : 0)) % 4; } else { offset++; } } else { break; }
                                        pos++;
                                }
                                lastLineEmpty = pos >= max; oldBSCount.push(state.bsCount[nextLine]); state.bsCount[nextLine] = state.sCount[nextLine] + 1 + (spaceAfterMarker ? 1 : 0); oldSCount.push(state.sCount[nextLine]); state.sCount[nextLine] = offset - initial; oldTShift.push(state.tShift[nextLine]); state.tShift[nextLine] = pos - state.bMarks[nextLine]; continue;
                        }
                        if (lastLineEmpty) { break; }
                        terminate = false; for (i = 0, l = terminatorRules.length; i < l; i++) { if (terminatorRules[i](state, nextLine, endLine, true)) { terminate = true; break; } }
                        if (terminate) {
                                state.lineMax = nextLine; if (state.blkIndent !== 0) { oldBMarks.push(state.bMarks[nextLine]); oldBSCount.push(state.bsCount[nextLine]); oldTShift.push(state.tShift[nextLine]); oldSCount.push(state.sCount[nextLine]); state.sCount[nextLine] -= state.blkIndent; }
                                break;
                        }
                        oldBMarks.push(state.bMarks[nextLine]); oldBSCount.push(state.bsCount[nextLine]); oldTShift.push(state.tShift[nextLine]); oldSCount.push(state.sCount[nextLine]); state.sCount[nextLine] = -1;
                }
                oldIndent = state.blkIndent; state.blkIndent = 0; token = state.push("blockquote_open", "blockquote", 1); token.markup = ">"; token.map = lines = [startLine, 0]; state.md.block.tokenize(state, startLine, nextLine); token = state.push("blockquote_close", "blockquote", -1); token.markup = ">"; state.lineMax = oldLineMax; state.parentType = oldParentType; lines[1] = state.line; for (i = 0; i < oldTShift.length; i++) { state.bMarks[i + startLine] = oldBMarks[i]; state.tShift[i + startLine] = oldTShift[i]; state.sCount[i + startLine] = oldSCount[i]; state.bsCount[i + startLine] = oldBSCount[i]; }
                state.blkIndent = oldIndent; return true;
        }; var isSpace$8 = utils.isSpace; var hr = function hr(state, startLine, endLine, silent) {
                var marker, cnt, ch, token, pos = state.bMarks[startLine] + state.tShift[startLine], max = state.eMarks[startLine]; if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }
                marker = state.src.charCodeAt(pos++); if (marker !== 42 && marker !== 45 && marker !== 95) { return false; }
                cnt = 1; while (pos < max) {
                        ch = state.src.charCodeAt(pos++); if (ch !== marker && !isSpace$8(ch)) { return false; }
                        if (ch === marker) { cnt++; }
                }
                if (cnt < 3) { return false; }
                if (silent) { return true; }
                state.line = startLine + 1; token = state.push("hr", "hr", 0); token.map = [startLine, state.line]; token.markup = Array(cnt + 1).join(String.fromCharCode(marker)); return true;
        }; var isSpace$7 = utils.isSpace; function skipBulletListMarker(state, startLine) {
                var marker, pos, max, ch; pos = state.bMarks[startLine] + state.tShift[startLine]; max = state.eMarks[startLine]; marker = state.src.charCodeAt(pos++); if (marker !== 42 && marker !== 45 && marker !== 43) { return -1; }
                if (pos < max) { ch = state.src.charCodeAt(pos); if (!isSpace$7(ch)) { return -1; } }
                return pos;
        }
        function skipOrderedListMarker(state, startLine) {
                var ch, start = state.bMarks[startLine] + state.tShift[startLine], pos = start, max = state.eMarks[startLine]; if (pos + 1 >= max) { return -1; }
                ch = state.src.charCodeAt(pos++); if (ch < 48 || ch > 57) { return -1; }
                for (; ;) {
                        if (pos >= max) { return -1; }
                        ch = state.src.charCodeAt(pos++); if (ch >= 48 && ch <= 57) {
                                if (pos - start >= 10) { return -1; }
                                continue;
                        }
                        if (ch === 41 || ch === 46) { break; }
                        return -1;
                }
                if (pos < max) { ch = state.src.charCodeAt(pos); if (!isSpace$7(ch)) { return -1; } }
                return pos;
        }
        function markTightParagraphs(state, idx) { var i, l, level = state.level + 2; for (i = idx + 2, l = state.tokens.length - 2; i < l; i++) { if (state.tokens[i].level === level && state.tokens[i].type === "paragraph_open") { state.tokens[i + 2].hidden = true; state.tokens[i].hidden = true; i += 2; } } }
        var list = function list(state, startLine, endLine, silent) {
                var ch, contentStart, i, indent, indentAfterMarker, initial, isOrdered, itemLines, l, listLines, listTokIdx, markerCharCode, markerValue, max, nextLine, offset, oldListIndent, oldParentType, oldSCount, oldTShift, oldTight, pos, posAfterMarker, prevEmptyEnd, start, terminate, terminatorRules, token, isTerminatingParagraph = false, tight = true; if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }
                if (state.listIndent >= 0 && state.sCount[startLine] - state.listIndent >= 4 && state.sCount[startLine] < state.blkIndent) { return false; }
                if (silent && state.parentType === "paragraph") { if (state.sCount[startLine] >= state.blkIndent) { isTerminatingParagraph = true; } }
                if ((posAfterMarker = skipOrderedListMarker(state, startLine)) >= 0) { isOrdered = true; start = state.bMarks[startLine] + state.tShift[startLine]; markerValue = Number(state.src.slice(start, posAfterMarker - 1)); if (isTerminatingParagraph && markerValue !== 1) return false; } else if ((posAfterMarker = skipBulletListMarker(state, startLine)) >= 0) { isOrdered = false; } else { return false; }
                if (isTerminatingParagraph) { if (state.skipSpaces(posAfterMarker) >= state.eMarks[startLine]) return false; }
                markerCharCode = state.src.charCodeAt(posAfterMarker - 1); if (silent) { return true; }
                listTokIdx = state.tokens.length; if (isOrdered) { token = state.push("ordered_list_open", "ol", 1); if (markerValue !== 1) { token.attrs = [["start", markerValue]]; } } else { token = state.push("bullet_list_open", "ul", 1); }
                token.map = listLines = [startLine, 0]; token.markup = String.fromCharCode(markerCharCode); nextLine = startLine; prevEmptyEnd = false; terminatorRules = state.md.block.ruler.getRules("list"); oldParentType = state.parentType; state.parentType = "list"; while (nextLine < endLine) {
                        pos = posAfterMarker; max = state.eMarks[nextLine]; initial = offset = state.sCount[nextLine] + posAfterMarker - (state.bMarks[startLine] + state.tShift[startLine]); while (pos < max) {
                                ch = state.src.charCodeAt(pos); if (ch === 9) { offset += 4 - (offset + state.bsCount[nextLine]) % 4; } else if (ch === 32) { offset++; } else { break; }
                                pos++;
                        }
                        contentStart = pos; if (contentStart >= max) { indentAfterMarker = 1; } else { indentAfterMarker = offset - initial; }
                        if (indentAfterMarker > 4) { indentAfterMarker = 1; }
                        indent = initial + indentAfterMarker; token = state.push("list_item_open", "li", 1); token.markup = String.fromCharCode(markerCharCode); token.map = itemLines = [startLine, 0]; if (isOrdered) { token.info = state.src.slice(start, posAfterMarker - 1); }
                        oldTight = state.tight; oldTShift = state.tShift[startLine]; oldSCount = state.sCount[startLine]; oldListIndent = state.listIndent; state.listIndent = state.blkIndent; state.blkIndent = indent; state.tight = true; state.tShift[startLine] = contentStart - state.bMarks[startLine]; state.sCount[startLine] = offset; if (contentStart >= max && state.isEmpty(startLine + 1)) { state.line = Math.min(state.line + 2, endLine); } else { state.md.block.tokenize(state, startLine, endLine, true); }
                        if (!state.tight || prevEmptyEnd) { tight = false; }
                        prevEmptyEnd = state.line - startLine > 1 && state.isEmpty(state.line - 1); state.blkIndent = state.listIndent; state.listIndent = oldListIndent; state.tShift[startLine] = oldTShift; state.sCount[startLine] = oldSCount; state.tight = oldTight; token = state.push("list_item_close", "li", -1); token.markup = String.fromCharCode(markerCharCode); nextLine = startLine = state.line; itemLines[1] = nextLine; contentStart = state.bMarks[startLine]; if (nextLine >= endLine) { break; }
                        if (state.sCount[nextLine] < state.blkIndent) { break; }
                        if (state.sCount[startLine] - state.blkIndent >= 4) { break; }
                        terminate = false; for (i = 0, l = terminatorRules.length; i < l; i++) { if (terminatorRules[i](state, nextLine, endLine, true)) { terminate = true; break; } }
                        if (terminate) { break; }
                        if (isOrdered) {
                                posAfterMarker = skipOrderedListMarker(state, nextLine); if (posAfterMarker < 0) { break; }
                                start = state.bMarks[nextLine] + state.tShift[nextLine];
                        } else { posAfterMarker = skipBulletListMarker(state, nextLine); if (posAfterMarker < 0) { break; } }
                        if (markerCharCode !== state.src.charCodeAt(posAfterMarker - 1)) { break; }
                }
                if (isOrdered) { token = state.push("ordered_list_close", "ol", -1); } else { token = state.push("bullet_list_close", "ul", -1); }
                token.markup = String.fromCharCode(markerCharCode); listLines[1] = nextLine; state.line = nextLine; state.parentType = oldParentType; if (tight) { markTightParagraphs(state, listTokIdx); }
                return true;
        }; var normalizeReference$2 = utils.normalizeReference; var isSpace$6 = utils.isSpace; var reference = function reference(state, startLine, _endLine, silent) {
                var ch, destEndPos, destEndLineNo, endLine, href, i, l, label, labelEnd, oldParentType, res, start, str, terminate, terminatorRules, title, lines = 0, pos = state.bMarks[startLine] + state.tShift[startLine], max = state.eMarks[startLine], nextLine = startLine + 1; if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }
                if (state.src.charCodeAt(pos) !== 91) { return false; }
                while (++pos < max) {
                        if (state.src.charCodeAt(pos) === 93 && state.src.charCodeAt(pos - 1) !== 92) {
                                if (pos + 1 === max) { return false; }
                                if (state.src.charCodeAt(pos + 1) !== 58) { return false; }
                                break;
                        }
                }
                endLine = state.lineMax; terminatorRules = state.md.block.ruler.getRules("reference"); oldParentType = state.parentType; state.parentType = "reference"; for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
                        if (state.sCount[nextLine] - state.blkIndent > 3) { continue; }
                        if (state.sCount[nextLine] < 0) { continue; }
                        terminate = false; for (i = 0, l = terminatorRules.length; i < l; i++) { if (terminatorRules[i](state, nextLine, endLine, true)) { terminate = true; break; } }
                        if (terminate) { break; }
                }
                str = state.getLines(startLine, nextLine, state.blkIndent, false).trim(); max = str.length; for (pos = 1; pos < max; pos++) { ch = str.charCodeAt(pos); if (ch === 91) { return false; } else if (ch === 93) { labelEnd = pos; break; } else if (ch === 10) { lines++; } else if (ch === 92) { pos++; if (pos < max && str.charCodeAt(pos) === 10) { lines++; } } }
                if (labelEnd < 0 || str.charCodeAt(labelEnd + 1) !== 58) { return false; }
                for (pos = labelEnd + 2; pos < max; pos++) { ch = str.charCodeAt(pos); if (ch === 10) { lines++; } else if (isSpace$6(ch)); else { break; } }
                res = state.md.helpers.parseLinkDestination(str, pos, max); if (!res.ok) { return false; }
                href = state.md.normalizeLink(res.str); if (!state.md.validateLink(href)) { return false; }
                pos = res.pos; lines += res.lines; destEndPos = pos; destEndLineNo = lines; start = pos; for (; pos < max; pos++) { ch = str.charCodeAt(pos); if (ch === 10) { lines++; } else if (isSpace$6(ch)); else { break; } }
                res = state.md.helpers.parseLinkTitle(str, pos, max); if (pos < max && start !== pos && res.ok) { title = res.str; pos = res.pos; lines += res.lines; } else { title = ""; pos = destEndPos; lines = destEndLineNo; }
                while (pos < max) {
                        ch = str.charCodeAt(pos); if (!isSpace$6(ch)) { break; }
                        pos++;
                }
                if (pos < max && str.charCodeAt(pos) !== 10) {
                        if (title) {
                                title = ""; pos = destEndPos; lines = destEndLineNo; while (pos < max) {
                                        ch = str.charCodeAt(pos); if (!isSpace$6(ch)) { break; }
                                        pos++;
                                }
                        }
                }
                if (pos < max && str.charCodeAt(pos) !== 10) { return false; }
                label = normalizeReference$2(str.slice(1, labelEnd)); if (!label) { return false; }
                if (silent) { return true; }
                if (typeof state.env.references === "undefined") { state.env.references = {}; }
                if (typeof state.env.references[label] === "undefined") { state.env.references[label] = { title: title, href: href }; }
                state.parentType = oldParentType; state.line = startLine + lines + 1; return true;
        }; var html_blocks = ["address", "article", "aside", "base", "basefont", "blockquote", "body", "caption", "center", "col", "colgroup", "dd", "details", "dialog", "dir", "div", "dl", "dt", "fieldset", "figcaption", "figure", "footer", "form", "frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hr", "html", "iframe", "legend", "li", "link", "main", "menu", "menuitem", "nav", "noframes", "ol", "optgroup", "option", "p", "param", "section", "source", "summary", "table", "tbody", "td", "tfoot", "th", "thead", "title", "tr", "track", "ul"]; var attr_name = "[a-zA-Z_:][a-zA-Z0-9:._-]*"; var unquoted = "[^\"'=<>`\\x00-\\x20]+"; var single_quoted = "'[^']*'"; var double_quoted = '"[^"]*"'; var attr_value = "(?:" + unquoted + "|" + single_quoted + "|" + double_quoted + ")"; var attribute = "(?:\\s+" + attr_name + "(?:\\s*=\\s*" + attr_value + ")?)"; var open_tag = "<[A-Za-z][A-Za-z0-9\\-]*" + attribute + "*\\s*\\/?>"; var close_tag = "<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>"; var comment = "\x3c!----\x3e|\x3c!--(?:-?[^>-])(?:-?[^-])*--\x3e"; var processing = "<[?][\\s\\S]*?[?]>"; var declaration = "<![A-Z]+\\s+[^>]*>"; var cdata = "<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"; var HTML_TAG_RE$1 = new RegExp("^(?:" + open_tag + "|" + close_tag + "|" + comment + "|" + processing + "|" + declaration + "|" + cdata + ")"); var HTML_OPEN_CLOSE_TAG_RE$1 = new RegExp("^(?:" + open_tag + "|" + close_tag + ")"); var HTML_TAG_RE_1 = HTML_TAG_RE$1; var HTML_OPEN_CLOSE_TAG_RE_1 = HTML_OPEN_CLOSE_TAG_RE$1; var html_re = { HTML_TAG_RE: HTML_TAG_RE_1, HTML_OPEN_CLOSE_TAG_RE: HTML_OPEN_CLOSE_TAG_RE_1 }; var HTML_OPEN_CLOSE_TAG_RE = html_re.HTML_OPEN_CLOSE_TAG_RE; var HTML_SEQUENCES = [[/^<(script|pre|style|textarea)(?=(\s|>|$))/i, /<\/(script|pre|style|textarea)>/i, true], [/^<!--/, /-->/, true], [/^<\?/, /\?>/, true], [/^<![A-Z]/, />/, true], [/^<!\[CDATA\[/, /\]\]>/, true], [new RegExp("^</?(" + html_blocks.join("|") + ")(?=(\\s|/?>|$))", "i"), /^$/, true], [new RegExp(HTML_OPEN_CLOSE_TAG_RE.source + "\\s*$"), /^$/, false]]; var html_block = function html_block(state, startLine, endLine, silent) {
                var i, nextLine, token, lineText, pos = state.bMarks[startLine] + state.tShift[startLine], max = state.eMarks[startLine]; if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }
                if (!state.md.options.html) { return false; }
                if (state.src.charCodeAt(pos) !== 60) { return false; }
                lineText = state.src.slice(pos, max); for (i = 0; i < HTML_SEQUENCES.length; i++) { if (HTML_SEQUENCES[i][0].test(lineText)) { break; } }
                if (i === HTML_SEQUENCES.length) { return false; }
                if (silent) { return HTML_SEQUENCES[i][2]; }
                nextLine = startLine + 1; if (!HTML_SEQUENCES[i][1].test(lineText)) {
                        for (; nextLine < endLine; nextLine++) {
                                if (state.sCount[nextLine] < state.blkIndent) { break; }
                                pos = state.bMarks[nextLine] + state.tShift[nextLine]; max = state.eMarks[nextLine]; lineText = state.src.slice(pos, max); if (HTML_SEQUENCES[i][1].test(lineText)) {
                                        if (lineText.length !== 0) { nextLine++; }
                                        break;
                                }
                        }
                }
                state.line = nextLine; token = state.push("html_block", "", 0); token.map = [startLine, nextLine]; token.content = state.getLines(startLine, nextLine, state.blkIndent, true); return true;
        }; var isSpace$5 = utils.isSpace; var heading = function heading(state, startLine, endLine, silent) {
                var ch, level, tmp, token, pos = state.bMarks[startLine] + state.tShift[startLine], max = state.eMarks[startLine]; if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }
                ch = state.src.charCodeAt(pos); if (ch !== 35 || pos >= max) { return false; }
                level = 1; ch = state.src.charCodeAt(++pos); while (ch === 35 && pos < max && level <= 6) { level++; ch = state.src.charCodeAt(++pos); }
                if (level > 6 || pos < max && !isSpace$5(ch)) { return false; }
                if (silent) { return true; }
                max = state.skipSpacesBack(max, pos); tmp = state.skipCharsBack(max, 35, pos); if (tmp > pos && isSpace$5(state.src.charCodeAt(tmp - 1))) { max = tmp; }
                state.line = startLine + 1; token = state.push("heading_open", "h" + String(level), 1); token.markup = "########".slice(0, level); token.map = [startLine, state.line]; token = state.push("inline", "", 0); token.content = state.src.slice(pos, max).trim(); token.map = [startLine, state.line]; token.children = []; token = state.push("heading_close", "h" + String(level), -1); token.markup = "########".slice(0, level); return true;
        }; var lheading = function lheading(state, startLine, endLine) {
                var content, terminate, i, l, token, pos, max, level, marker, nextLine = startLine + 1, oldParentType, terminatorRules = state.md.block.ruler.getRules("paragraph"); if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }
                oldParentType = state.parentType; state.parentType = "paragraph"; for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
                        if (state.sCount[nextLine] - state.blkIndent > 3) { continue; }
                        if (state.sCount[nextLine] >= state.blkIndent) { pos = state.bMarks[nextLine] + state.tShift[nextLine]; max = state.eMarks[nextLine]; if (pos < max) { marker = state.src.charCodeAt(pos); if (marker === 45 || marker === 61) { pos = state.skipChars(pos, marker); pos = state.skipSpaces(pos); if (pos >= max) { level = marker === 61 ? 1 : 2; break; } } } }
                        if (state.sCount[nextLine] < 0) { continue; }
                        terminate = false; for (i = 0, l = terminatorRules.length; i < l; i++) { if (terminatorRules[i](state, nextLine, endLine, true)) { terminate = true; break; } }
                        if (terminate) { break; }
                }
                if (!level) { return false; }
                content = state.getLines(startLine, nextLine, state.blkIndent, false).trim(); state.line = nextLine + 1; token = state.push("heading_open", "h" + String(level), 1); token.markup = String.fromCharCode(marker); token.map = [startLine, state.line]; token = state.push("inline", "", 0); token.content = content; token.map = [startLine, state.line - 1]; token.children = []; token = state.push("heading_close", "h" + String(level), -1); token.markup = String.fromCharCode(marker); state.parentType = oldParentType; return true;
        }; var paragraph = function paragraph(state, startLine) {
                var content, terminate, i, l, token, oldParentType, nextLine = startLine + 1, terminatorRules = state.md.block.ruler.getRules("paragraph"), endLine = state.lineMax; oldParentType = state.parentType; state.parentType = "paragraph"; for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
                        if (state.sCount[nextLine] - state.blkIndent > 3) { continue; }
                        if (state.sCount[nextLine] < 0) { continue; }
                        terminate = false; for (i = 0, l = terminatorRules.length; i < l; i++) { if (terminatorRules[i](state, nextLine, endLine, true)) { terminate = true; break; } }
                        if (terminate) { break; }
                }
                content = state.getLines(startLine, nextLine, state.blkIndent, false).trim(); state.line = nextLine; token = state.push("paragraph_open", "p", 1); token.map = [startLine, state.line]; token = state.push("inline", "", 0); token.content = content; token.map = [startLine, state.line]; token.children = []; token = state.push("paragraph_close", "p", -1); state.parentType = oldParentType; return true;
        }; var isSpace$4 = utils.isSpace; function StateBlock(src, md, env, tokens) {
                var ch, s, start, pos, len, indent, offset, indent_found; this.src = src; this.md = md; this.env = env; this.tokens = tokens; this.bMarks = []; this.eMarks = []; this.tShift = []; this.sCount = []; this.bsCount = []; this.blkIndent = 0; this.line = 0; this.lineMax = 0; this.tight = false; this.ddIndent = -1; this.listIndent = -1; this.parentType = "root"; this.level = 0; this.result = ""; s = this.src; indent_found = false; for (start = pos = indent = offset = 0, len = s.length; pos < len; pos++) {
                        ch = s.charCodeAt(pos); if (!indent_found) {
                                if (isSpace$4(ch)) {
                                        indent++; if (ch === 9) { offset += 4 - offset % 4; } else { offset++; }
                                        continue;
                                } else { indent_found = true; }
                        }
                        if (ch === 10 || pos === len - 1) {
                                if (ch !== 10) { pos++; }
                                this.bMarks.push(start); this.eMarks.push(pos); this.tShift.push(indent); this.sCount.push(offset); this.bsCount.push(0); indent_found = false; indent = 0; offset = 0; start = pos + 1;
                        }
                }
                this.bMarks.push(s.length); this.eMarks.push(s.length); this.tShift.push(0); this.sCount.push(0); this.bsCount.push(0); this.lineMax = this.bMarks.length - 1;
        }
        StateBlock.prototype.push = function (type, tag, nesting) { var token$1 = new token(type, tag, nesting); token$1.block = true; if (nesting < 0) this.level--; token$1.level = this.level; if (nesting > 0) this.level++; this.tokens.push(token$1); return token$1; }; StateBlock.prototype.isEmpty = function isEmpty(line) { return this.bMarks[line] + this.tShift[line] >= this.eMarks[line]; }; StateBlock.prototype.skipEmptyLines = function skipEmptyLines(from) {
                for (var max = this.lineMax; from < max; from++) { if (this.bMarks[from] + this.tShift[from] < this.eMarks[from]) { break; } }
                return from;
        }; StateBlock.prototype.skipSpaces = function skipSpaces(pos) {
                var ch; for (var max = this.src.length; pos < max; pos++) { ch = this.src.charCodeAt(pos); if (!isSpace$4(ch)) { break; } }
                return pos;
        }; StateBlock.prototype.skipSpacesBack = function skipSpacesBack(pos, min) {
                if (pos <= min) { return pos; }
                while (pos > min) { if (!isSpace$4(this.src.charCodeAt(--pos))) { return pos + 1; } }
                return pos;
        }; StateBlock.prototype.skipChars = function skipChars(pos, code) {
                for (var max = this.src.length; pos < max; pos++) { if (this.src.charCodeAt(pos) !== code) { break; } }
                return pos;
        }; StateBlock.prototype.skipCharsBack = function skipCharsBack(pos, code, min) {
                if (pos <= min) { return pos; }
                while (pos > min) { if (code !== this.src.charCodeAt(--pos)) { return pos + 1; } }
                return pos;
        }; StateBlock.prototype.getLines = function getLines(begin, end, indent, keepLastLF) {
                var i, lineIndent, ch, first, last, queue, lineStart, line = begin; if (begin >= end) { return ""; }
                queue = new Array(end - begin); for (i = 0; line < end; line++, i++) {
                        lineIndent = 0; lineStart = first = this.bMarks[line]; if (line + 1 < end || keepLastLF) { last = this.eMarks[line] + 1; } else { last = this.eMarks[line]; }
                        while (first < last && lineIndent < indent) {
                                ch = this.src.charCodeAt(first); if (isSpace$4(ch)) { if (ch === 9) { lineIndent += 4 - (lineIndent + this.bsCount[line]) % 4; } else { lineIndent++; } } else if (first - lineStart < this.tShift[line]) { lineIndent++; } else { break; }
                                first++;
                        }
                        if (lineIndent > indent) { queue[i] = new Array(lineIndent - indent + 1).join(" ") + this.src.slice(first, last); } else { queue[i] = this.src.slice(first, last); }
                }
                return queue.join("");
        }; StateBlock.prototype.Token = token; var state_block = StateBlock; var _rules$1 = [["table", table, ["paragraph", "reference"]], ["code", code], ["fence", fence, ["paragraph", "reference", "blockquote", "list"]], ["blockquote", blockquote, ["paragraph", "reference", "blockquote", "list"]], ["hr", hr, ["paragraph", "reference", "blockquote", "list"]], ["list", list, ["paragraph", "reference", "blockquote"]], ["reference", reference], ["html_block", html_block, ["paragraph", "reference", "blockquote"]], ["heading", heading, ["paragraph", "reference", "blockquote"]], ["lheading", lheading], ["paragraph", paragraph]]; function ParserBlock() { this.ruler = new ruler; for (var i = 0; i < _rules$1.length; i++) { this.ruler.push(_rules$1[i][0], _rules$1[i][1], { alt: (_rules$1[i][2] || []).slice() }); } }
        ParserBlock.prototype.tokenize = function (state, startLine, endLine) {
                var ok, i, rules = this.ruler.getRules(""), len = rules.length, line = startLine, hasEmptyLines = false, maxNesting = state.md.options.maxNesting; while (line < endLine) {
                        state.line = line = state.skipEmptyLines(line); if (line >= endLine) { break; }
                        if (state.sCount[line] < state.blkIndent) { break; }
                        if (state.level >= maxNesting) { state.line = endLine; break; }
                        for (i = 0; i < len; i++) { ok = rules[i](state, line, endLine, false); if (ok) { break; } }
                        state.tight = !hasEmptyLines; if (state.isEmpty(state.line - 1)) { hasEmptyLines = true; }
                        line = state.line; if (line < endLine && state.isEmpty(line)) { hasEmptyLines = true; line++; state.line = line; }
                }
        }; ParserBlock.prototype.parse = function (src, md, env, outTokens) {
                var state; if (!src) { return; }
                state = new this.State(src, md, env, outTokens); this.tokenize(state, state.line, state.lineMax);
        }; ParserBlock.prototype.State = state_block; var parser_block = ParserBlock; function isTerminatorChar(ch) { switch (ch) { case 10: case 33: case 35: case 36: case 37: case 38: case 42: case 43: case 45: case 58: case 60: case 61: case 62: case 64: case 91: case 92: case 93: case 94: case 95: case 96: case 123: case 125: case 126: return true; default: return false; } }
        var text = function text(state, silent) {
                var pos = state.pos; while (pos < state.posMax && !isTerminatorChar(state.src.charCodeAt(pos))) { pos++; }
                if (pos === state.pos) { return false; }
                if (!silent) { state.pending += state.src.slice(state.pos, pos); }
                state.pos = pos; return true;
        }; var isSpace$3 = utils.isSpace; var newline = function newline(state, silent) {
                var pmax, max, ws, pos = state.pos; if (state.src.charCodeAt(pos) !== 10) { return false; }
                pmax = state.pending.length - 1; max = state.posMax; if (!silent) { if (pmax >= 0 && state.pending.charCodeAt(pmax) === 32) { if (pmax >= 1 && state.pending.charCodeAt(pmax - 1) === 32) { ws = pmax - 1; while (ws >= 1 && state.pending.charCodeAt(ws - 1) === 32) ws--; state.pending = state.pending.slice(0, ws); state.push("hardbreak", "br", 0); } else { state.pending = state.pending.slice(0, -1); state.push("softbreak", "br", 0); } } else { state.push("softbreak", "br", 0); } }
                pos++; while (pos < max && isSpace$3(state.src.charCodeAt(pos))) { pos++; }
                state.pos = pos; return true;
        }; var isSpace$2 = utils.isSpace; var ESCAPED = []; for (var i = 0; i < 256; i++) { ESCAPED.push(0); } "\\!\"#$%&'()*+,./:;<=>?@[]^_`{|}~-".split("").forEach((function (ch) { ESCAPED[ch.charCodeAt(0)] = 1; })); var _escape = function escape(state, silent) {
                var ch, pos = state.pos, max = state.posMax; if (state.src.charCodeAt(pos) !== 92) { return false; }
                pos++; if (pos < max) {
                        ch = state.src.charCodeAt(pos); if (ch < 256 && ESCAPED[ch] !== 0) {
                                if (!silent) { state.pending += state.src[pos]; }
                                state.pos += 2; return true;
                        }
                        if (ch === 10) {
                                if (!silent) { state.push("hardbreak", "br", 0); }
                                pos++; while (pos < max) {
                                        ch = state.src.charCodeAt(pos); if (!isSpace$2(ch)) { break; }
                                        pos++;
                                }
                                state.pos = pos; return true;
                        }
                }
                if (!silent) { state.pending += "\\"; }
                state.pos++; return true;
        }; var backticks = function backtick(state, silent) {
                var start, max, marker, token, matchStart, matchEnd, openerLength, closerLength, pos = state.pos, ch = state.src.charCodeAt(pos); if (ch !== 96) { return false; }
                start = pos; pos++; max = state.posMax; while (pos < max && state.src.charCodeAt(pos) === 96) { pos++; }
                marker = state.src.slice(start, pos); openerLength = marker.length; if (state.backticksScanned && (state.backticks[openerLength] || 0) <= start) { if (!silent) state.pending += marker; state.pos += openerLength; return true; }
                matchStart = matchEnd = pos; while ((matchStart = state.src.indexOf("`", matchEnd)) !== -1) {
                        matchEnd = matchStart + 1; while (matchEnd < max && state.src.charCodeAt(matchEnd) === 96) { matchEnd++; }
                        closerLength = matchEnd - matchStart; if (closerLength === openerLength) {
                                if (!silent) { token = state.push("code_inline", "code", 0); token.markup = marker; token.content = state.src.slice(pos, matchStart).replace(/\n/g, " ").replace(/^ (.+) $/, "$1"); }
                                state.pos = matchEnd; return true;
                        }
                        state.backticks[closerLength] = matchStart;
                }
                state.backticksScanned = true; if (!silent) state.pending += marker; state.pos += openerLength; return true;
        }; var tokenize$1 = function strikethrough(state, silent) {
                var i, scanned, token, len, ch, start = state.pos, marker = state.src.charCodeAt(start); if (silent) { return false; }
                if (marker !== 126) { return false; }
                scanned = state.scanDelims(state.pos, true); len = scanned.length; ch = String.fromCharCode(marker); if (len < 2) { return false; }
                if (len % 2) { token = state.push("text", "", 0); token.content = ch; len--; }
                for (i = 0; i < len; i += 2) { token = state.push("text", "", 0); token.content = ch + ch; state.delimiters.push({ marker: marker, length: 0, token: state.tokens.length - 1, end: -1, open: scanned.can_open, close: scanned.can_close }); }
                state.pos += scanned.length; return true;
        }; function postProcess$1(state, delimiters) {
                var i, j, startDelim, endDelim, token, loneMarkers = [], max = delimiters.length; for (i = 0; i < max; i++) {
                        startDelim = delimiters[i]; if (startDelim.marker !== 126) { continue; }
                        if (startDelim.end === -1) { continue; }
                        endDelim = delimiters[startDelim.end]; token = state.tokens[startDelim.token]; token.type = "s_open"; token.tag = "s"; token.nesting = 1; token.markup = "~~"; token.content = ""; token = state.tokens[endDelim.token]; token.type = "s_close"; token.tag = "s"; token.nesting = -1; token.markup = "~~"; token.content = ""; if (state.tokens[endDelim.token - 1].type === "text" && state.tokens[endDelim.token - 1].content === "~") { loneMarkers.push(endDelim.token - 1); }
                }
                while (loneMarkers.length) {
                        i = loneMarkers.pop(); j = i + 1; while (j < state.tokens.length && state.tokens[j].type === "s_close") { j++; }
                        j--; if (i !== j) { token = state.tokens[j]; state.tokens[j] = state.tokens[i]; state.tokens[i] = token; }
                }
        }
        var postProcess_1$1 = function strikethrough(state) { var curr, tokens_meta = state.tokens_meta, max = state.tokens_meta.length; postProcess$1(state, state.delimiters); for (curr = 0; curr < max; curr++) { if (tokens_meta[curr] && tokens_meta[curr].delimiters) { postProcess$1(state, tokens_meta[curr].delimiters); } } }; var strikethrough = { tokenize: tokenize$1, postProcess: postProcess_1$1 }; var tokenize = function emphasis(state, silent) {
                var i, scanned, token, start = state.pos, marker = state.src.charCodeAt(start); if (silent) { return false; }
                if (marker !== 95 && marker !== 42) { return false; }
                scanned = state.scanDelims(state.pos, marker === 42); for (i = 0; i < scanned.length; i++) { token = state.push("text", "", 0); token.content = String.fromCharCode(marker); state.delimiters.push({ marker: marker, length: scanned.length, token: state.tokens.length - 1, end: -1, open: scanned.can_open, close: scanned.can_close }); }
                state.pos += scanned.length; return true;
        }; function postProcess(state, delimiters) {
                var i, startDelim, endDelim, token, ch, isStrong, max = delimiters.length; for (i = max - 1; i >= 0; i--) {
                        startDelim = delimiters[i]; if (startDelim.marker !== 95 && startDelim.marker !== 42) { continue; }
                        if (startDelim.end === -1) { continue; }
                        endDelim = delimiters[startDelim.end]; isStrong = i > 0 && delimiters[i - 1].end === startDelim.end + 1 && delimiters[i - 1].marker === startDelim.marker && delimiters[i - 1].token === startDelim.token - 1 && delimiters[startDelim.end + 1].token === endDelim.token + 1; ch = String.fromCharCode(startDelim.marker); token = state.tokens[startDelim.token]; token.type = isStrong ? "strong_open" : "em_open"; token.tag = isStrong ? "strong" : "em"; token.nesting = 1; token.markup = isStrong ? ch + ch : ch; token.content = ""; token = state.tokens[endDelim.token]; token.type = isStrong ? "strong_close" : "em_close"; token.tag = isStrong ? "strong" : "em"; token.nesting = -1; token.markup = isStrong ? ch + ch : ch; token.content = ""; if (isStrong) { state.tokens[delimiters[i - 1].token].content = ""; state.tokens[delimiters[startDelim.end + 1].token].content = ""; i--; }
                }
        }
        var postProcess_1 = function emphasis(state) { var curr, tokens_meta = state.tokens_meta, max = state.tokens_meta.length; postProcess(state, state.delimiters); for (curr = 0; curr < max; curr++) { if (tokens_meta[curr] && tokens_meta[curr].delimiters) { postProcess(state, tokens_meta[curr].delimiters); } } }; var emphasis = { tokenize: tokenize, postProcess: postProcess_1 }; var normalizeReference$1 = utils.normalizeReference; var isSpace$1 = utils.isSpace; var link = function link(state, silent) {
                var attrs, code, label, labelEnd, labelStart, pos, res, ref, token, href = "", title = "", oldPos = state.pos, max = state.posMax, start = state.pos, parseReference = true; if (state.src.charCodeAt(state.pos) !== 91) { return false; }
                labelStart = state.pos + 1; labelEnd = state.md.helpers.parseLinkLabel(state, state.pos, true); if (labelEnd < 0) { return false; }
                pos = labelEnd + 1; if (pos < max && state.src.charCodeAt(pos) === 40) {
                        parseReference = false; pos++; for (; pos < max; pos++) { code = state.src.charCodeAt(pos); if (!isSpace$1(code) && code !== 10) { break; } }
                        if (pos >= max) { return false; }
                        start = pos; res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax); if (res.ok) {
                                href = state.md.normalizeLink(res.str); if (state.md.validateLink(href)) { pos = res.pos; } else { href = ""; }
                                start = pos; for (; pos < max; pos++) { code = state.src.charCodeAt(pos); if (!isSpace$1(code) && code !== 10) { break; } }
                                res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax); if (pos < max && start !== pos && res.ok) { title = res.str; pos = res.pos; for (; pos < max; pos++) { code = state.src.charCodeAt(pos); if (!isSpace$1(code) && code !== 10) { break; } } }
                        }
                        if (pos >= max || state.src.charCodeAt(pos) !== 41) { parseReference = true; }
                        pos++;
                }
                if (parseReference) {
                        if (typeof state.env.references === "undefined") { return false; }
                        if (pos < max && state.src.charCodeAt(pos) === 91) { start = pos + 1; pos = state.md.helpers.parseLinkLabel(state, pos); if (pos >= 0) { label = state.src.slice(start, pos++); } else { pos = labelEnd + 1; } } else { pos = labelEnd + 1; }
                        if (!label) { label = state.src.slice(labelStart, labelEnd); }
                        ref = state.env.references[normalizeReference$1(label)]; if (!ref) { state.pos = oldPos; return false; }
                        href = ref.href; title = ref.title;
                }
                if (!silent) {
                        state.pos = labelStart; state.posMax = labelEnd; token = state.push("link_open", "a", 1); token.attrs = attrs = [["href", href]]; if (title) { attrs.push(["title", title]); }
                        state.md.inline.tokenize(state); token = state.push("link_close", "a", -1);
                }
                state.pos = pos; state.posMax = max; return true;
        }; var normalizeReference = utils.normalizeReference; var isSpace = utils.isSpace; var image = function image(state, silent) {
                var attrs, code, content, label, labelEnd, labelStart, pos, ref, res, title, token, tokens, start, href = "", oldPos = state.pos, max = state.posMax; if (state.src.charCodeAt(state.pos) !== 33) { return false; }
                if (state.src.charCodeAt(state.pos + 1) !== 91) { return false; }
                labelStart = state.pos + 2; labelEnd = state.md.helpers.parseLinkLabel(state, state.pos + 1, false); if (labelEnd < 0) { return false; }
                pos = labelEnd + 1; if (pos < max && state.src.charCodeAt(pos) === 40) {
                        pos++; for (; pos < max; pos++) { code = state.src.charCodeAt(pos); if (!isSpace(code) && code !== 10) { break; } }
                        if (pos >= max) { return false; }
                        start = pos; res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax); if (res.ok) { href = state.md.normalizeLink(res.str); if (state.md.validateLink(href)) { pos = res.pos; } else { href = ""; } }
                        start = pos; for (; pos < max; pos++) { code = state.src.charCodeAt(pos); if (!isSpace(code) && code !== 10) { break; } }
                        res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax); if (pos < max && start !== pos && res.ok) { title = res.str; pos = res.pos; for (; pos < max; pos++) { code = state.src.charCodeAt(pos); if (!isSpace(code) && code !== 10) { break; } } } else { title = ""; }
                        if (pos >= max || state.src.charCodeAt(pos) !== 41) { state.pos = oldPos; return false; }
                        pos++;
                } else {
                        if (typeof state.env.references === "undefined") { return false; }
                        if (pos < max && state.src.charCodeAt(pos) === 91) { start = pos + 1; pos = state.md.helpers.parseLinkLabel(state, pos); if (pos >= 0) { label = state.src.slice(start, pos++); } else { pos = labelEnd + 1; } } else { pos = labelEnd + 1; }
                        if (!label) { label = state.src.slice(labelStart, labelEnd); }
                        ref = state.env.references[normalizeReference(label)]; if (!ref) { state.pos = oldPos; return false; }
                        href = ref.href; title = ref.title;
                }
                if (!silent) { content = state.src.slice(labelStart, labelEnd); state.md.inline.parse(content, state.md, state.env, tokens = []); token = state.push("image", "img", 0); token.attrs = attrs = [["src", href], ["alt", ""]]; token.children = tokens; token.content = content; if (title) { attrs.push(["title", title]); } }
                state.pos = pos; state.posMax = max; return true;
        }; var EMAIL_RE = /^([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/; var AUTOLINK_RE = /^([a-zA-Z][a-zA-Z0-9+.\-]{1,31}):([^<>\x00-\x20]*)$/; var autolink = function autolink(state, silent) {
                var url, fullUrl, token, ch, start, max, pos = state.pos; if (state.src.charCodeAt(pos) !== 60) { return false; }
                start = state.pos; max = state.posMax; for (; ;) { if (++pos >= max) return false; ch = state.src.charCodeAt(pos); if (ch === 60) return false; if (ch === 62) break; }
                url = state.src.slice(start + 1, pos); if (AUTOLINK_RE.test(url)) {
                        fullUrl = state.md.normalizeLink(url); if (!state.md.validateLink(fullUrl)) { return false; }
                        if (!silent) { token = state.push("link_open", "a", 1); token.attrs = [["href", fullUrl]]; token.markup = "autolink"; token.info = "auto"; token = state.push("text", "", 0); token.content = state.md.normalizeLinkText(url); token = state.push("link_close", "a", -1); token.markup = "autolink"; token.info = "auto"; }
                        state.pos += url.length + 2; return true;
                }
                if (EMAIL_RE.test(url)) {
                        fullUrl = state.md.normalizeLink("mailto:" + url); if (!state.md.validateLink(fullUrl)) { return false; }
                        if (!silent) { token = state.push("link_open", "a", 1); token.attrs = [["href", fullUrl]]; token.markup = "autolink"; token.info = "auto"; token = state.push("text", "", 0); token.content = state.md.normalizeLinkText(url); token = state.push("link_close", "a", -1); token.markup = "autolink"; token.info = "auto"; }
                        state.pos += url.length + 2; return true;
                }
                return false;
        }; var HTML_TAG_RE = html_re.HTML_TAG_RE; function isLetter(ch) { var lc = ch | 32; return lc >= 97 && lc <= 122; }
        var html_inline = function html_inline(state, silent) {
                var ch, match, max, token, pos = state.pos; if (!state.md.options.html) { return false; }
                max = state.posMax; if (state.src.charCodeAt(pos) !== 60 || pos + 2 >= max) { return false; }
                ch = state.src.charCodeAt(pos + 1); if (ch !== 33 && ch !== 63 && ch !== 47 && !isLetter(ch)) { return false; }
                match = state.src.slice(pos).match(HTML_TAG_RE); if (!match) { return false; }
                if (!silent) { token = state.push("html_inline", "", 0); token.content = state.src.slice(pos, pos + match[0].length); }
                state.pos += match[0].length; return true;
        }; var has = utils.has; var isValidEntityCode = utils.isValidEntityCode; var fromCodePoint = utils.fromCodePoint; var DIGITAL_RE = /^&#((?:x[a-f0-9]{1,6}|[0-9]{1,7}));/i; var NAMED_RE = /^&([a-z][a-z0-9]{1,31});/i; var entity = function entity(state, silent) {
                var ch, code, match, pos = state.pos, max = state.posMax; if (state.src.charCodeAt(pos) !== 38) { return false; }
                if (pos + 1 < max) {
                        ch = state.src.charCodeAt(pos + 1); if (ch === 35) {
                                match = state.src.slice(pos).match(DIGITAL_RE); if (match) {
                                        if (!silent) { code = match[1][0].toLowerCase() === "x" ? parseInt(match[1].slice(1), 16) : parseInt(match[1], 10); state.pending += isValidEntityCode(code) ? fromCodePoint(code) : fromCodePoint(65533); }
                                        state.pos += match[0].length; return true;
                                }
                        } else {
                                match = state.src.slice(pos).match(NAMED_RE); if (match) {
                                        if (has(entities, match[1])) {
                                                if (!silent) { state.pending += entities[match[1]]; }
                                                state.pos += match[0].length; return true;
                                        }
                                }
                        }
                }
                if (!silent) { state.pending += "&"; }
                state.pos++; return true;
        }; function processDelimiters(state, delimiters) {
                var closerIdx, openerIdx, closer, opener, minOpenerIdx, newMinOpenerIdx, isOddMatch, lastJump, openersBottom = {}, max = delimiters.length; if (!max) return; var headerIdx = 0; var lastTokenIdx = -2; var jumps = []; for (closerIdx = 0; closerIdx < max; closerIdx++) {
                        closer = delimiters[closerIdx]; jumps.push(0); if (delimiters[headerIdx].marker !== closer.marker || lastTokenIdx !== closer.token - 1) { headerIdx = closerIdx; }
                        lastTokenIdx = closer.token; closer.length = closer.length || 0; if (!closer.close) continue; if (!openersBottom.hasOwnProperty(closer.marker)) { openersBottom[closer.marker] = [-1, -1, -1, -1, -1, -1]; }
                        minOpenerIdx = openersBottom[closer.marker][(closer.open ? 3 : 0) + closer.length % 3]; openerIdx = headerIdx - jumps[headerIdx] - 1; newMinOpenerIdx = openerIdx; for (; openerIdx > minOpenerIdx; openerIdx -= jumps[openerIdx] + 1) {
                                opener = delimiters[openerIdx]; if (opener.marker !== closer.marker) continue; if (opener.open && opener.end < 0) {
                                        isOddMatch = false; if (opener.close || closer.open) { if ((opener.length + closer.length) % 3 === 0) { if (opener.length % 3 !== 0 || closer.length % 3 !== 0) { isOddMatch = true; } } }
                                        if (!isOddMatch) { lastJump = openerIdx > 0 && !delimiters[openerIdx - 1].open ? jumps[openerIdx - 1] + 1 : 0; jumps[closerIdx] = closerIdx - openerIdx + lastJump; jumps[openerIdx] = lastJump; closer.open = false; opener.end = closerIdx; opener.close = false; newMinOpenerIdx = -1; lastTokenIdx = -2; break; }
                                }
                        }
                        if (newMinOpenerIdx !== -1) { openersBottom[closer.marker][(closer.open ? 3 : 0) + (closer.length || 0) % 3] = newMinOpenerIdx; }
                }
        }
        var balance_pairs = function link_pairs(state) { var curr, tokens_meta = state.tokens_meta, max = state.tokens_meta.length; processDelimiters(state, state.delimiters); for (curr = 0; curr < max; curr++) { if (tokens_meta[curr] && tokens_meta[curr].delimiters) { processDelimiters(state, tokens_meta[curr].delimiters); } } }; var text_collapse = function text_collapse(state) {
                var curr, last, level = 0, tokens = state.tokens, max = state.tokens.length; for (curr = last = 0; curr < max; curr++) {
                        if (tokens[curr].nesting < 0) level--; tokens[curr].level = level; if (tokens[curr].nesting > 0) level++; if (tokens[curr].type === "text" && curr + 1 < max && tokens[curr + 1].type === "text") { tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content; } else {
                                if (curr !== last) { tokens[last] = tokens[curr]; }
                                last++;
                        }
                }
                if (curr !== last) { tokens.length = last; }
        }; var isWhiteSpace = utils.isWhiteSpace; var isPunctChar = utils.isPunctChar; var isMdAsciiPunct = utils.isMdAsciiPunct; function StateInline(src, md, env, outTokens) { this.src = src; this.env = env; this.md = md; this.tokens = outTokens; this.tokens_meta = Array(outTokens.length); this.pos = 0; this.posMax = this.src.length; this.level = 0; this.pending = ""; this.pendingLevel = 0; this.cache = {}; this.delimiters = []; this._prev_delimiters = []; this.backticks = {}; this.backticksScanned = false; }
        StateInline.prototype.pushPending = function () { var token$1 = new token("text", "", 0); token$1.content = this.pending; token$1.level = this.pendingLevel; this.tokens.push(token$1); this.pending = ""; return token$1; }; StateInline.prototype.push = function (type, tag, nesting) {
                if (this.pending) { this.pushPending(); }
                var token$1 = new token(type, tag, nesting); var token_meta = null; if (nesting < 0) { this.level--; this.delimiters = this._prev_delimiters.pop(); }
                token$1.level = this.level; if (nesting > 0) { this.level++; this._prev_delimiters.push(this.delimiters); this.delimiters = []; token_meta = { delimiters: this.delimiters }; }
                this.pendingLevel = this.level; this.tokens.push(token$1); this.tokens_meta.push(token_meta); return token$1;
        }; StateInline.prototype.scanDelims = function (start, canSplitWord) {
                var pos = start, lastChar, nextChar, count, can_open, can_close, isLastWhiteSpace, isLastPunctChar, isNextWhiteSpace, isNextPunctChar, left_flanking = true, right_flanking = true, max = this.posMax, marker = this.src.charCodeAt(start); lastChar = start > 0 ? this.src.charCodeAt(start - 1) : 32; while (pos < max && this.src.charCodeAt(pos) === marker) { pos++; }
                count = pos - start; nextChar = pos < max ? this.src.charCodeAt(pos) : 32; isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar)); isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar)); isLastWhiteSpace = isWhiteSpace(lastChar); isNextWhiteSpace = isWhiteSpace(nextChar); if (isNextWhiteSpace) { left_flanking = false; } else if (isNextPunctChar) { if (!(isLastWhiteSpace || isLastPunctChar)) { left_flanking = false; } }
                if (isLastWhiteSpace) { right_flanking = false; } else if (isLastPunctChar) { if (!(isNextWhiteSpace || isNextPunctChar)) { right_flanking = false; } }
                if (!canSplitWord) { can_open = left_flanking && (!right_flanking || isLastPunctChar); can_close = right_flanking && (!left_flanking || isNextPunctChar); } else { can_open = left_flanking; can_close = right_flanking; }
                return { can_open: can_open, can_close: can_close, length: count };
        }; StateInline.prototype.Token = token; var state_inline = StateInline; var _rules = [["text", text], ["newline", newline], ["escape", _escape], ["backticks", backticks], ["strikethrough", strikethrough.tokenize], ["emphasis", emphasis.tokenize], ["link", link], ["image", image], ["autolink", autolink], ["html_inline", html_inline], ["entity", entity]]; var _rules2 = [["balance_pairs", balance_pairs], ["strikethrough", strikethrough.postProcess], ["emphasis", emphasis.postProcess], ["text_collapse", text_collapse]]; function ParserInline() {
                var i; this.ruler = new ruler; for (i = 0; i < _rules.length; i++) { this.ruler.push(_rules[i][0], _rules[i][1]); }
                this.ruler2 = new ruler; for (i = 0; i < _rules2.length; i++) { this.ruler2.push(_rules2[i][0], _rules2[i][1]); }
        }
        ParserInline.prototype.skipToken = function (state) {
                var ok, i, pos = state.pos, rules = this.ruler.getRules(""), len = rules.length, maxNesting = state.md.options.maxNesting, cache = state.cache; if (typeof cache[pos] !== "undefined") { state.pos = cache[pos]; return; }
                if (state.level < maxNesting) { for (i = 0; i < len; i++) { state.level++; ok = rules[i](state, true); state.level--; if (ok) { break; } } } else { state.pos = state.posMax; }
                if (!ok) { state.pos++; }
                cache[pos] = state.pos;
        }; ParserInline.prototype.tokenize = function (state) {
                var ok, i, rules = this.ruler.getRules(""), len = rules.length, end = state.posMax, maxNesting = state.md.options.maxNesting; while (state.pos < end) {
                        if (state.level < maxNesting) { for (i = 0; i < len; i++) { ok = rules[i](state, false); if (ok) { break; } } }
                        if (ok) {
                                if (state.pos >= end) { break; }
                                continue;
                        }
                        state.pending += state.src[state.pos++];
                }
                if (state.pending) { state.pushPending(); }
        }; ParserInline.prototype.parse = function (str, md, env, outTokens) { var i, rules, len; var state = new this.State(str, md, env, outTokens); this.tokenize(state); rules = this.ruler2.getRules(""); len = rules.length; for (i = 0; i < len; i++) { rules[i](state); } }; ParserInline.prototype.State = state_inline; var parser_inline = ParserInline; var re = function (opts) { var re = {}; re.src_Any = regex$3.source; re.src_Cc = regex$2.source; re.src_Z = regex.source; re.src_P = regex$4.source; re.src_ZPCc = [re.src_Z, re.src_P, re.src_Cc].join("|"); re.src_ZCc = [re.src_Z, re.src_Cc].join("|"); var text_separators = "[><\uff5c]"; re.src_pseudo_letter = "(?:(?!" + text_separators + "|" + re.src_ZPCc + ")" + re.src_Any + ")"; re.src_ip4 = "(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)"; re.src_auth = "(?:(?:(?!" + re.src_ZCc + "|[@/\\[\\]()]).)+@)?"; re.src_port = "(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?"; re.src_host_terminator = "(?=$|" + text_separators + "|" + re.src_ZPCc + ")(?!-|_|:\\d|\\.-|\\.(?!$|" + re.src_ZPCc + "))"; re.src_path = "(?:" + "[/?#]" + "(?:" + "(?!" + re.src_ZCc + "|" + text_separators + "|[()[\\]{}.,\"'?!\\-;]).|" + "\\[(?:(?!" + re.src_ZCc + "|\\]).)*\\]|" + "\\((?:(?!" + re.src_ZCc + "|[)]).)*\\)|" + "\\{(?:(?!" + re.src_ZCc + "|[}]).)*\\}|" + '\\"(?:(?!' + re.src_ZCc + '|["]).)+\\"|' + "\\'(?:(?!" + re.src_ZCc + "|[']).)+\\'|" + "\\'(?=" + re.src_pseudo_letter + "|[-]).|" + "\\.{2,}[a-zA-Z0-9%/&]|" + "\\.(?!" + re.src_ZCc + "|[.]).|" + (opts && opts["---"] ? "\\-(?!--(?:[^-]|$))(?:-*)|" : "\\-+|") + ",(?!" + re.src_ZCc + ").|" + ";(?!" + re.src_ZCc + ").|" + "\\!+(?!" + re.src_ZCc + "|[!]).|" + "\\?(?!" + re.src_ZCc + "|[?])." + ")+" + "|\\/" + ")?"; re.src_email_name = '[\\-;:&=\\+\\$,\\.a-zA-Z0-9_][\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]*'; re.src_xn = "xn--[a-z0-9\\-]{1,59}"; re.src_domain_root = "(?:" + re.src_xn + "|" + re.src_pseudo_letter + "{1,63}" + ")"; re.src_domain = "(?:" + re.src_xn + "|" + "(?:" + re.src_pseudo_letter + ")" + "|" + "(?:" + re.src_pseudo_letter + "(?:-|" + re.src_pseudo_letter + "){0,61}" + re.src_pseudo_letter + ")" + ")"; re.src_host = "(?:" + "(?:(?:(?:" + re.src_domain + ")\\.)*" + re.src_domain + ")" + ")"; re.tpl_host_fuzzy = "(?:" + re.src_ip4 + "|" + "(?:(?:(?:" + re.src_domain + ")\\.)+(?:%TLDS%))" + ")"; re.tpl_host_no_ip_fuzzy = "(?:(?:(?:" + re.src_domain + ")\\.)+(?:%TLDS%))"; re.src_host_strict = re.src_host + re.src_host_terminator; re.tpl_host_fuzzy_strict = re.tpl_host_fuzzy + re.src_host_terminator; re.src_host_port_strict = re.src_host + re.src_port + re.src_host_terminator; re.tpl_host_port_fuzzy_strict = re.tpl_host_fuzzy + re.src_port + re.src_host_terminator; re.tpl_host_port_no_ip_fuzzy_strict = re.tpl_host_no_ip_fuzzy + re.src_port + re.src_host_terminator; re.tpl_host_fuzzy_test = "localhost|www\\.|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:" + re.src_ZPCc + "|>|$))"; re.tpl_email_fuzzy = "(^|" + text_separators + '|"|\\(|' + re.src_ZCc + ")" + "(" + re.src_email_name + "@" + re.tpl_host_fuzzy_strict + ")"; re.tpl_link_fuzzy = "(^|(?![.:/\\-_@])(?:[$+<=>^`|\uff5c]|" + re.src_ZPCc + "))" + "((?![$+<=>^`|\uff5c])" + re.tpl_host_port_fuzzy_strict + re.src_path + ")"; re.tpl_link_no_ip_fuzzy = "(^|(?![.:/\\-_@])(?:[$+<=>^`|\uff5c]|" + re.src_ZPCc + "))" + "((?![$+<=>^`|\uff5c])" + re.tpl_host_port_no_ip_fuzzy_strict + re.src_path + ")"; return re; }; function assign(obj) {
                var sources = Array.prototype.slice.call(arguments, 1); sources.forEach((function (source) {
                        if (!source) { return; }
                        Object.keys(source).forEach((function (key) { obj[key] = source[key]; }));
                })); return obj;
        }
        function _class(obj) { return Object.prototype.toString.call(obj); }
        function isString(obj) { return _class(obj) === "[object String]"; }
        function isObject(obj) { return _class(obj) === "[object Object]"; }
        function isRegExp(obj) { return _class(obj) === "[object RegExp]"; }
        function isFunction(obj) { return _class(obj) === "[object Function]"; }
        function escapeRE(str) { return str.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&"); }
        var defaultOptions = { fuzzyLink: true, fuzzyEmail: true, fuzzyIP: false }; function isOptionsObj(obj) { return Object.keys(obj || {}).reduce((function (acc, k) { return acc || defaultOptions.hasOwnProperty(k); }), false); }
        var defaultSchemas = {
                "http:": {
                        validate: function (text, pos, self) {
                                var tail = text.slice(pos); if (!self.re.http) { self.re.http = new RegExp("^\\/\\/" + self.re.src_auth + self.re.src_host_port_strict + self.re.src_path, "i"); }
                                if (self.re.http.test(tail)) { return tail.match(self.re.http)[0].length; }
                                return 0;
                        }
                }, "https:": "http:", "ftp:": "http:", "//": {
                        validate: function (text, pos, self) {
                                var tail = text.slice(pos); if (!self.re.no_http) { self.re.no_http = new RegExp("^" + self.re.src_auth + "(?:localhost|(?:(?:" + self.re.src_domain + ")\\.)+" + self.re.src_domain_root + ")" + self.re.src_port + self.re.src_host_terminator + self.re.src_path, "i"); }
                                if (self.re.no_http.test(tail)) {
                                        if (pos >= 3 && text[pos - 3] === ":") { return 0; }
                                        if (pos >= 3 && text[pos - 3] === "/") { return 0; }
                                        return tail.match(self.re.no_http)[0].length;
                                }
                                return 0;
                        }
                }, "mailto:": {
                        validate: function (text, pos, self) {
                                var tail = text.slice(pos); if (!self.re.mailto) { self.re.mailto = new RegExp("^" + self.re.src_email_name + "@" + self.re.src_host_strict, "i"); }
                                if (self.re.mailto.test(tail)) { return tail.match(self.re.mailto)[0].length; }
                                return 0;
                        }
                }
        }; var tlds_2ch_src_re = "a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]"; var tlds_default = "biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|\u0440\u0444".split("|"); function resetScanCache(self) { self.__index__ = -1; self.__text_cache__ = ""; }
        function createValidator(re) {
                return function (text, pos) {
                        var tail = text.slice(pos); if (re.test(tail)) { return tail.match(re)[0].length; }
                        return 0;
                };
        }
        function createNormalizer() { return function (match, self) { self.normalize(match); }; }
        function compile(self) {
                var re$1 = self.re = re(self.__opts__); var tlds = self.__tlds__.slice(); self.onCompile(); if (!self.__tlds_replaced__) { tlds.push(tlds_2ch_src_re); }
                tlds.push(re$1.src_xn); re$1.src_tlds = tlds.join("|"); function untpl(tpl) { return tpl.replace("%TLDS%", re$1.src_tlds); }
                re$1.email_fuzzy = RegExp(untpl(re$1.tpl_email_fuzzy), "i"); re$1.link_fuzzy = RegExp(untpl(re$1.tpl_link_fuzzy), "i"); re$1.link_no_ip_fuzzy = RegExp(untpl(re$1.tpl_link_no_ip_fuzzy), "i"); re$1.host_fuzzy_test = RegExp(untpl(re$1.tpl_host_fuzzy_test), "i"); var aliases = []; self.__compiled__ = {}; function schemaError(name, val) { throw new Error('(LinkifyIt) Invalid schema "' + name + '": ' + val); }
                Object.keys(self.__schemas__).forEach((function (name) {
                        var val = self.__schemas__[name]; if (val === null) { return; }
                        var compiled = { validate: null, link: null }; self.__compiled__[name] = compiled; if (isObject(val)) {
                                if (isRegExp(val.validate)) { compiled.validate = createValidator(val.validate); } else if (isFunction(val.validate)) { compiled.validate = val.validate; } else { schemaError(name, val); }
                                if (isFunction(val.normalize)) { compiled.normalize = val.normalize; } else if (!val.normalize) { compiled.normalize = createNormalizer(); } else { schemaError(name, val); }
                                return;
                        }
                        if (isString(val)) { aliases.push(name); return; }
                        schemaError(name, val);
                })); aliases.forEach((function (alias) {
                        if (!self.__compiled__[self.__schemas__[alias]]) { return; }
                        self.__compiled__[alias].validate = self.__compiled__[self.__schemas__[alias]].validate; self.__compiled__[alias].normalize = self.__compiled__[self.__schemas__[alias]].normalize;
                })); self.__compiled__[""] = { validate: null, normalize: createNormalizer() }; var slist = Object.keys(self.__compiled__).filter((function (name) { return name.length > 0 && self.__compiled__[name]; })).map(escapeRE).join("|"); self.re.schema_test = RegExp("(^|(?!_)(?:[><\uff5c]|" + re$1.src_ZPCc + "))(" + slist + ")", "i"); self.re.schema_search = RegExp("(^|(?!_)(?:[><\uff5c]|" + re$1.src_ZPCc + "))(" + slist + ")", "ig"); self.re.pretest = RegExp("(" + self.re.schema_test.source + ")|(" + self.re.host_fuzzy_test.source + ")|@", "i"); resetScanCache(self);
        }
        function Match(self, shift) { var start = self.__index__, end = self.__last_index__, text = self.__text_cache__.slice(start, end); this.schema = self.__schema__.toLowerCase(); this.index = start + shift; this.lastIndex = end + shift; this.raw = text; this.text = text; this.url = text; }
        function createMatch(self, shift) { var match = new Match(self, shift); self.__compiled__[match.schema].normalize(match, self); return match; }
        function LinkifyIt(schemas, options) {
                if (!(this instanceof LinkifyIt)) { return new LinkifyIt(schemas, options); }
                if (!options) { if (isOptionsObj(schemas)) { options = schemas; schemas = {}; } }
                this.__opts__ = assign({}, defaultOptions, options); this.__index__ = -1; this.__last_index__ = -1; this.__schema__ = ""; this.__text_cache__ = ""; this.__schemas__ = assign({}, defaultSchemas, schemas); this.__compiled__ = {}; this.__tlds__ = tlds_default; this.__tlds_replaced__ = false; this.re = {}; compile(this);
        }
        LinkifyIt.prototype.add = function add(schema, definition) { this.__schemas__[schema] = definition; compile(this); return this; }; LinkifyIt.prototype.set = function set(options) { this.__opts__ = assign(this.__opts__, options); return this; }; LinkifyIt.prototype.test = function test(text) {
                this.__text_cache__ = text; this.__index__ = -1; if (!text.length) { return false; }
                var m, ml, me, len, shift, next, re, tld_pos, at_pos; if (this.re.schema_test.test(text)) { re = this.re.schema_search; re.lastIndex = 0; while ((m = re.exec(text)) !== null) { len = this.testSchemaAt(text, m[2], re.lastIndex); if (len) { this.__schema__ = m[2]; this.__index__ = m.index + m[1].length; this.__last_index__ = m.index + m[0].length + len; break; } } }
                if (this.__opts__.fuzzyLink && this.__compiled__["http:"]) { tld_pos = text.search(this.re.host_fuzzy_test); if (tld_pos >= 0) { if (this.__index__ < 0 || tld_pos < this.__index__) { if ((ml = text.match(this.__opts__.fuzzyIP ? this.re.link_fuzzy : this.re.link_no_ip_fuzzy)) !== null) { shift = ml.index + ml[1].length; if (this.__index__ < 0 || shift < this.__index__) { this.__schema__ = ""; this.__index__ = shift; this.__last_index__ = ml.index + ml[0].length; } } } } }
                if (this.__opts__.fuzzyEmail && this.__compiled__["mailto:"]) { at_pos = text.indexOf("@"); if (at_pos >= 0) { if ((me = text.match(this.re.email_fuzzy)) !== null) { shift = me.index + me[1].length; next = me.index + me[0].length; if (this.__index__ < 0 || shift < this.__index__ || shift === this.__index__ && next > this.__last_index__) { this.__schema__ = "mailto:"; this.__index__ = shift; this.__last_index__ = next; } } } }
                return this.__index__ >= 0;
        }; LinkifyIt.prototype.pretest = function pretest(text) { return this.re.pretest.test(text); }; LinkifyIt.prototype.testSchemaAt = function testSchemaAt(text, schema, pos) {
                if (!this.__compiled__[schema.toLowerCase()]) { return 0; }
                return this.__compiled__[schema.toLowerCase()].validate(text, pos, this);
        }; LinkifyIt.prototype.match = function match(text) {
                var shift = 0, result = []; if (this.__index__ >= 0 && this.__text_cache__ === text) { result.push(createMatch(this, shift)); shift = this.__last_index__; }
                var tail = shift ? text.slice(shift) : text; while (this.test(tail)) { result.push(createMatch(this, shift)); tail = tail.slice(this.__last_index__); shift += this.__last_index__; }
                if (result.length) { return result; }
                return null;
        }; LinkifyIt.prototype.tlds = function tlds(list, keepOld) {
                list = Array.isArray(list) ? list : [list]; if (!keepOld) { this.__tlds__ = list.slice(); this.__tlds_replaced__ = true; compile(this); return this; }
                this.__tlds__ = this.__tlds__.concat(list).sort().filter((function (el, idx, arr) { return el !== arr[idx - 1]; })).reverse(); compile(this); return this;
        }; LinkifyIt.prototype.normalize = function normalize(match) {
                if (!match.schema) { match.url = "http://" + match.url; }
                if (match.schema === "mailto:" && !/^mailto:/i.test(match.url)) { match.url = "mailto:" + match.url; }
        }; LinkifyIt.prototype.onCompile = function onCompile() { }; var linkifyIt = LinkifyIt; var maxInt = 2147483647; var base = 36; var tMin = 1; var tMax = 26; var skew = 38; var damp = 700; var initialBias = 72; var initialN = 128; var delimiter = "-"; var regexPunycode = /^xn--/; var regexNonASCII = /[^\x20-\x7E]/; var regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g; var errors = { overflow: "Overflow: input needs wider integers to process", "not-basic": "Illegal input >= 0x80 (not a basic code point)", "invalid-input": "Invalid input" }; var baseMinusTMin = base - tMin; var floor = Math.floor; var stringFromCharCode = String.fromCharCode; function error(type) { throw new RangeError(errors[type]); }
        function map(array, fn) {
                var length = array.length; var result = []; while (length--) { result[length] = fn(array[length]); }
                return result;
        }
        function mapDomain(string, fn) {
                var parts = string.split("@"); var result = ""; if (parts.length > 1) { result = parts[0] + "@"; string = parts[1]; }
                string = string.replace(regexSeparators, "."); var labels = string.split("."); var encoded = map(labels, fn).join("."); return result + encoded;
        }
        function ucs2decode(string) {
                var output = [], counter = 0, length = string.length, value, extra; while (counter < length) { value = string.charCodeAt(counter++); if (value >= 55296 && value <= 56319 && counter < length) { extra = string.charCodeAt(counter++); if ((extra & 64512) == 56320) { output.push(((value & 1023) << 10) + (extra & 1023) + 65536); } else { output.push(value); counter--; } } else { output.push(value); } }
                return output;
        }
        function ucs2encode(array) {
                return map(array, (function (value) {
                        var output = ""; if (value > 65535) { value -= 65536; output += stringFromCharCode(value >>> 10 & 1023 | 55296); value = 56320 | value & 1023; }
                        output += stringFromCharCode(value); return output;
                })).join("");
        }
        function basicToDigit(codePoint) {
                if (codePoint - 48 < 10) { return codePoint - 22; }
                if (codePoint - 65 < 26) { return codePoint - 65; }
                if (codePoint - 97 < 26) { return codePoint - 97; }
                return base;
        }
        function digitToBasic(digit, flag) { return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5); }
        function adapt(delta, numPoints, firstTime) {
                var k = 0; delta = firstTime ? floor(delta / damp) : delta >> 1; delta += floor(delta / numPoints); for (; delta > baseMinusTMin * tMax >> 1; k += base) { delta = floor(delta / baseMinusTMin); }
                return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
        }
        function decode(input) {
                var output = [], inputLength = input.length, out, i = 0, n = initialN, bias = initialBias, basic, j, index, oldi, w, k, digit, t, baseMinusT; basic = input.lastIndexOf(delimiter); if (basic < 0) { basic = 0; }
                for (j = 0; j < basic; ++j) {
                        if (input.charCodeAt(j) >= 128) { error("not-basic"); }
                        output.push(input.charCodeAt(j));
                }
                for (index = basic > 0 ? basic + 1 : 0; index < inputLength;) {
                        for (oldi = i, w = 1, k = base; ; k += base) {
                                if (index >= inputLength) { error("invalid-input"); }
                                digit = basicToDigit(input.charCodeAt(index++)); if (digit >= base || digit > floor((maxInt - i) / w)) { error("overflow"); }
                                i += digit * w; t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias; if (digit < t) { break; }
                                baseMinusT = base - t; if (w > floor(maxInt / baseMinusT)) { error("overflow"); }
                                w *= baseMinusT;
                        }
                        out = output.length + 1; bias = adapt(i - oldi, out, oldi == 0); if (floor(i / out) > maxInt - n) { error("overflow"); }
                        n += floor(i / out); i %= out; output.splice(i++, 0, n);
                }
                return ucs2encode(output);
        }
        function encode(input) {
                var n, delta, handledCPCount, basicLength, bias, j, m, q, k, t, currentValue, output = [], inputLength, handledCPCountPlusOne, baseMinusT, qMinusT; input = ucs2decode(input); inputLength = input.length; n = initialN; delta = 0; bias = initialBias; for (j = 0; j < inputLength; ++j) { currentValue = input[j]; if (currentValue < 128) { output.push(stringFromCharCode(currentValue)); } }
                handledCPCount = basicLength = output.length; if (basicLength) { output.push(delimiter); }
                while (handledCPCount < inputLength) {
                        for (m = maxInt, j = 0; j < inputLength; ++j) { currentValue = input[j]; if (currentValue >= n && currentValue < m) { m = currentValue; } }
                        handledCPCountPlusOne = handledCPCount + 1; if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) { error("overflow"); }
                        delta += (m - n) * handledCPCountPlusOne; n = m; for (j = 0; j < inputLength; ++j) {
                                currentValue = input[j]; if (currentValue < n && ++delta > maxInt) { error("overflow"); }
                                if (currentValue == n) {
                                        for (q = delta, k = base; ; k += base) {
                                                t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias; if (q < t) { break; }
                                                qMinusT = q - t; baseMinusT = base - t; output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))); q = floor(qMinusT / baseMinusT);
                                        }
                                        output.push(stringFromCharCode(digitToBasic(q, 0))); bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength); delta = 0; ++handledCPCount;
                                }
                        }
                        ++delta; ++n;
                }
                return output.join("");
        }
        function toUnicode(input) { return mapDomain(input, (function (string) { return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string; })); }
        function toASCII(input) { return mapDomain(input, (function (string) { return regexNonASCII.test(string) ? "xn--" + encode(string) : string; })); }
        var version = "1.4.1"; var ucs2 = { decode: ucs2decode, encode: ucs2encode }; var punycode$1 = { version: version, ucs2: ucs2, toASCII: toASCII, toUnicode: toUnicode, encode: encode, decode: decode }; var punycode$2 = Object.freeze({ __proto__: null, decode: decode, encode: encode, toUnicode: toUnicode, toASCII: toASCII, version: version, ucs2: ucs2, default: punycode$1 }); var _default = { options: { html: false, xhtmlOut: false, breaks: false, langPrefix: "language-", linkify: false, typographer: false, quotes: "\u201c\u201d\u2018\u2019", highlight: null, maxNesting: 100 }, components: { core: {}, block: {}, inline: {} } }; var zero = { options: { html: false, xhtmlOut: false, breaks: false, langPrefix: "language-", linkify: false, typographer: false, quotes: "\u201c\u201d\u2018\u2019", highlight: null, maxNesting: 20 }, components: { core: { rules: ["normalize", "block", "inline"] }, block: { rules: ["paragraph"] }, inline: { rules: ["text"], rules2: ["balance_pairs", "text_collapse"] } } }; var commonmark = { options: { html: true, xhtmlOut: true, breaks: false, langPrefix: "language-", linkify: false, typographer: false, quotes: "\u201c\u201d\u2018\u2019", highlight: null, maxNesting: 20 }, components: { core: { rules: ["normalize", "block", "inline"] }, block: { rules: ["blockquote", "code", "fence", "heading", "hr", "html_block", "lheading", "list", "reference", "paragraph"] }, inline: { rules: ["autolink", "backticks", "emphasis", "entity", "escape", "html_inline", "image", "link", "newline", "text"], rules2: ["balance_pairs", "emphasis", "text_collapse"] } } }; var punycode = getAugmentedNamespace(punycode$2); var config = { default: _default, zero: zero, commonmark: commonmark }; var BAD_PROTO_RE = /^(vbscript|javascript|file|data):/; var GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/; function validateLink(url) { var str = url.trim().toLowerCase(); return BAD_PROTO_RE.test(str) ? GOOD_DATA_RE.test(str) ? true : false : true; }
        var RECODE_HOSTNAME_FOR = ["http:", "https:", "mailto:"]; function normalizeLink(url) {
                var parsed = mdurl.parse(url, true); if (parsed.hostname) { if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) { try { parsed.hostname = punycode.toASCII(parsed.hostname); } catch (er) { } } }
                return mdurl.encode(mdurl.format(parsed));
        }
        function normalizeLinkText(url) {
                var parsed = mdurl.parse(url, true); if (parsed.hostname) { if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) { try { parsed.hostname = punycode.toUnicode(parsed.hostname); } catch (er) { } } }
                return mdurl.decode(mdurl.format(parsed), mdurl.decode.defaultChars + "%");
        }
        function MarkdownIt(presetName, options) {
                if (!(this instanceof MarkdownIt)) { return new MarkdownIt(presetName, options); }
                if (!options) { if (!utils.isString(presetName)) { options = presetName || {}; presetName = "default"; } }
                this.inline = new parser_inline; this.block = new parser_block; this.core = new parser_core; this.renderer = new renderer; this.linkify = new linkifyIt; this.validateLink = validateLink; this.normalizeLink = normalizeLink; this.normalizeLinkText = normalizeLinkText; this.utils = utils; this.helpers = utils.assign({}, helpers); this.options = {}; this.configure(presetName); if (options) { this.set(options); }
        }
        MarkdownIt.prototype.set = function (options) { utils.assign(this.options, options); return this; }; MarkdownIt.prototype.configure = function (presets) {
                var self = this, presetName; if (utils.isString(presets)) { presetName = presets; presets = config[presetName]; if (!presets) { throw new Error('Wrong `markdown-it` preset "' + presetName + '", check name'); } }
                if (!presets) { throw new Error("Wrong `markdown-it` preset, can't be empty"); }
                if (presets.options) { self.set(presets.options); }
                if (presets.components) {
                        Object.keys(presets.components).forEach((function (name) {
                                if (presets.components[name].rules) { self[name].ruler.enableOnly(presets.components[name].rules); }
                                if (presets.components[name].rules2) { self[name].ruler2.enableOnly(presets.components[name].rules2); }
                        }));
                }
                return this;
        }; MarkdownIt.prototype.enable = function (list, ignoreInvalid) {
                var result = []; if (!Array.isArray(list)) { list = [list]; }
                ["core", "block", "inline"].forEach((function (chain) { result = result.concat(this[chain].ruler.enable(list, true)); }), this); result = result.concat(this.inline.ruler2.enable(list, true)); var missed = list.filter((function (name) { return result.indexOf(name) < 0; })); if (missed.length && !ignoreInvalid) { throw new Error("MarkdownIt. Failed to enable unknown rule(s): " + missed); }
                return this;
        }; MarkdownIt.prototype.disable = function (list, ignoreInvalid) {
                var result = []; if (!Array.isArray(list)) { list = [list]; }
                ["core", "block", "inline"].forEach((function (chain) { result = result.concat(this[chain].ruler.disable(list, true)); }), this); result = result.concat(this.inline.ruler2.disable(list, true)); var missed = list.filter((function (name) { return result.indexOf(name) < 0; })); if (missed.length && !ignoreInvalid) { throw new Error("MarkdownIt. Failed to disable unknown rule(s): " + missed); }
                return this;
        }; MarkdownIt.prototype.use = function (plugin) { var args = [this].concat(Array.prototype.slice.call(arguments, 1)); plugin.apply(plugin, args); return this; }; MarkdownIt.prototype.parse = function (src, env) {
                if (typeof src !== "string") { throw new Error("Input data should be a String"); }
                var state = new this.core.State(src, this, env); this.core.process(state); return state.tokens;
        }; MarkdownIt.prototype.render = function (src, env) { env = env || {}; return this.renderer.render(this.parse(src, env), this.options, env); }; MarkdownIt.prototype.parseInline = function (src, env) { var state = new this.core.State(src, this, env); state.inlineMode = true; this.core.process(state); return state.tokens; }; MarkdownIt.prototype.renderInline = function (src, env) { env = env || {}; return this.renderer.render(this.parseInline(src, env), this.options, env); }; var lib = MarkdownIt; var markdownIt = lib; return markdownIt;
})); (function (global, factory) { typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) : (factory((global.pell = {}))); }(this, (function (exports) {
        'use strict'; var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; var defaultParagraphSeparatorString = 'defaultParagraphSeparator'; var formatBlock = 'formatBlock'; var addEventListener = function addEventListener(parent, type, listener) { return parent.addEventListener(type, listener); }; var appendChild = function appendChild(parent, child) { return parent.appendChild(child); }; var createElement = function createElement(tag) { return document.createElement(tag); }; var queryCommandState = function queryCommandState(command) { return document.queryCommandState(command); }; var queryCommandValue = function queryCommandValue(command) { return document.queryCommandValue(command); }; var exec = function exec(command) { var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null; return document.execCommand(command, false, value); }; var defaultActions = { bold: { icon: '<b>B</b>', title: 'Bold', state: function state() { return queryCommandState('bold'); }, result: function result() { return exec('bold'); } }, italic: { icon: '<i>I</i>', title: 'Italic', state: function state() { return queryCommandState('italic'); }, result: function result() { return exec('italic'); } }, underline: { icon: '<u>U</u>', title: 'Underline', state: function state() { return queryCommandState('underline'); }, result: function result() { return exec('underline'); } }, strikethrough: { icon: '<strike>S</strike>', title: 'Strike-through', state: function state() { return queryCommandState('strikeThrough'); }, result: function result() { return exec('strikeThrough'); } }, heading1: { icon: '<b>H<sub>1</sub></b>', title: 'Heading 1', result: function result() { return exec(formatBlock, '<h1>'); } }, heading2: { icon: '<b>H<sub>2</sub></b>', title: 'Heading 2', result: function result() { return exec(formatBlock, '<h2>'); } }, paragraph: { icon: '&#182;', title: 'Paragraph', result: function result() { return exec(formatBlock, '<p>'); } }, quote: { icon: '&#8220; &#8221;', title: 'Quote', result: function result() { return exec(formatBlock, '<blockquote>'); } }, olist: { icon: '&#35;', title: 'Ordered List', result: function result() { return exec('insertOrderedList'); } }, ulist: { icon: '&#8226;', title: 'Unordered List', result: function result() { return exec('insertUnorderedList'); } }, code: { icon: '&lt;/&gt;', title: 'Code', result: function result() { return exec(formatBlock, '<pre>'); } }, line: { icon: '&#8213;', title: 'Horizontal Line', result: function result() { return exec('insertHorizontalRule'); } }, link: { icon: '&#128279;', title: 'Link', result: function result() { var url = window.prompt('Enter the link URL'); if (url) exec('createLink', url); } }, image: { icon: '&#128247;', title: 'Image', result: function result() { var url = window.prompt('Enter the image URL'); if (url) exec('insertImage', url); } } }; var defaultClasses = { actionbar: 'pell-actionbar', button: 'pell-button', content: 'pell-content', selected: 'pell-button-selected' }; var init = function init(settings) {
                var actions = settings.actions ? settings.actions.map(function (action) { if (typeof action === 'string') return defaultActions[action]; else if (defaultActions[action.name]) return _extends({}, defaultActions[action.name], action); return action; }) : Object.keys(defaultActions).map(function (action) { return defaultActions[action]; }); var classes = _extends({}, defaultClasses, settings.classes); var defaultParagraphSeparator = settings[defaultParagraphSeparatorString] || 'div'; var actionbar = createElement('div'); actionbar.className = classes.actionbar; appendChild(settings.element, actionbar); var content = settings.element.content = createElement('div'); content.contentEditable = true; content.className = classes.content; content.oninput = function (_ref) { var firstChild = _ref.target.firstChild; if (firstChild && firstChild.nodeType === 3) exec(formatBlock, '<' + defaultParagraphSeparator + '>'); else if (content.innerHTML === '<br>') content.innerHTML = ''; settings.onChange(content.innerHTML); }; content.onkeydown = function (event) { if (event.key === 'Enter' && queryCommandValue(formatBlock) === 'blockquote') { setTimeout(function () { return exec(formatBlock, '<' + defaultParagraphSeparator + '>'); }, 0); } }; appendChild(settings.element, content); actions.forEach(function (action) {
                        var button = createElement('button'); button.className = classes.button; button.innerHTML = action.icon; button.title = action.title; button.setAttribute('type', 'button'); button.onclick = function () { return action.result() && content.focus(); }; if (action.state) { var handler = function handler() { return button.classList[action.state() ? 'add' : 'remove'](classes.selected); }; addEventListener(content, 'keyup', handler); addEventListener(content, 'mouseup', handler); addEventListener(button, 'click', handler); }
                        appendChild(actionbar, button);
                }); if (settings.styleWithCSS) exec('styleWithCSS'); exec(defaultParagraphSeparatorString, defaultParagraphSeparator); return settings.element;
        }; var pell = { exec: exec, init: init }; exports.exec = exec; exports.init = init; exports['default'] = pell; Object.defineProperty(exports, '__esModule', { value: true });
}))); var TurndownService = (function () {
        'use strict'; function extend(destination) {
                for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (source.hasOwnProperty(key)) destination[key] = source[key]; } }
                return destination
        }
        function repeat(character, count) { return Array(count + 1).join(character) }
        function trimLeadingNewlines(string) { return string.replace(/^\n*/, '') }
        function trimTrailingNewlines(string) { var indexEnd = string.length; while (indexEnd > 0 && string[indexEnd - 1] === '\n') indexEnd--; return string.substring(0, indexEnd) }
        var blockElements = ['ADDRESS', 'ARTICLE', 'ASIDE', 'AUDIO', 'BLOCKQUOTE', 'BODY', 'CANVAS', 'CENTER', 'DD', 'DIR', 'DIV', 'DL', 'DT', 'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'FRAMESET', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'HGROUP', 'HR', 'HTML', 'ISINDEX', 'LI', 'MAIN', 'MENU', 'NAV', 'NOFRAMES', 'NOSCRIPT', 'OL', 'OUTPUT', 'P', 'PRE', 'SECTION', 'TABLE', 'TBODY', 'TD', 'TFOOT', 'TH', 'THEAD', 'TR', 'UL']; function isBlock(node) { return is(node, blockElements) }
        var voidElements = ['AREA', 'BASE', 'BR', 'COL', 'COMMAND', 'EMBED', 'HR', 'IMG', 'INPUT', 'KEYGEN', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR']; function isVoid(node) { return is(node, voidElements) }
        function hasVoid(node) { return has(node, voidElements) }
        var meaningfulWhenBlankElements = ['A', 'TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TH', 'TD', 'IFRAME', 'SCRIPT', 'AUDIO', 'VIDEO']; function isMeaningfulWhenBlank(node) { return is(node, meaningfulWhenBlankElements) }
        function hasMeaningfulWhenBlank(node) { return has(node, meaningfulWhenBlankElements) }
        function is(node, tagNames) { return tagNames.indexOf(node.nodeName) >= 0 }
        function has(node, tagNames) { return (node.getElementsByTagName && tagNames.some(function (tagName) { return node.getElementsByTagName(tagName).length })) }
        var rules = {}; rules.paragraph = { filter: 'p', replacement: function (content) { return '\n\n' + content + '\n\n' } }; rules.lineBreak = { filter: 'br', replacement: function (content, node, options) { return options.br + '\n' } }; rules.heading = { filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'], replacement: function (content, node, options) { var hLevel = Number(node.nodeName.charAt(1)); if (options.headingStyle === 'setext' && hLevel < 3) { var underline = repeat((hLevel === 1 ? '=' : '-'), content.length); return ('\n\n' + content + '\n' + underline + '\n\n') } else { return '\n\n' + repeat('#', hLevel) + ' ' + content + '\n\n' } } }; rules.blockquote = { filter: 'blockquote', replacement: function (content) { content = content.replace(/^\n+|\n+$/g, ''); content = content.replace(/^/gm, '> '); return '\n\n' + content + '\n\n' } }; rules.list = { filter: ['ul', 'ol'], replacement: function (content, node) { var parent = node.parentNode; if (parent.nodeName === 'LI' && parent.lastElementChild === node) { return '\n' + content } else { return '\n\n' + content + '\n\n' } } }; rules.listItem = {
                filter: 'li', replacement: function (content, node, options) {
                        content = content.replace(/^\n+/, '').replace(/\n+$/, '\n').replace(/\n/gm, '\n    '); var prefix = options.bulletListMarker + '   '; var parent = node.parentNode; if (parent.nodeName === 'OL') { var start = parent.getAttribute('start'); var index = Array.prototype.indexOf.call(parent.children, node); prefix = (start ? Number(start) + index : index + 1) + '.  '; }
                        return (prefix + content + (node.nextSibling && !/\n$/.test(content) ? '\n' : ''))
                }
        }; rules.indentedCodeBlock = {
                filter: function (node, options) { return (options.codeBlockStyle === 'indented' && node.nodeName === 'PRE' && node.firstChild && node.firstChild.nodeName === 'CODE') }, replacement: function (content, node, options) {
                        return ('\n\n    ' +
                                node.firstChild.textContent.replace(/\n/g, '\n    ') + '\n\n')
                }
        }; rules.fencedCodeBlock = {
                filter: function (node, options) { return (options.codeBlockStyle === 'fenced' && node.nodeName === 'PRE' && node.firstChild && node.firstChild.nodeName === 'CODE') }, replacement: function (content, node, options) {
                        var className = node.firstChild.getAttribute('class') || ''; var language = (className.match(/language-(\S+)/) || [null, ''])[1]; var code = node.firstChild.textContent; var fenceChar = options.fence.charAt(0); var fenceSize = 3; var fenceInCodeRegex = new RegExp('^' + fenceChar + '{3,}', 'gm'); var match; while ((match = fenceInCodeRegex.exec(code))) { if (match[0].length >= fenceSize) { fenceSize = match[0].length + 1; } }
                        var fence = repeat(fenceChar, fenceSize); return ('\n\n' + fence + language + '\n' +
                                code.replace(/\n$/, '') + '\n' + fence + '\n\n')
                }
        }; rules.horizontalRule = { filter: 'hr', replacement: function (content, node, options) { return '\n\n' + options.hr + '\n\n' } }; rules.inlineLink = { filter: function (node, options) { return (options.linkStyle === 'inlined' && node.nodeName === 'A' && node.getAttribute('href')) }, replacement: function (content, node) { var href = node.getAttribute('href'); var title = cleanAttribute(node.getAttribute('title')); if (title) title = ' "' + title + '"'; return '[' + content + '](' + href + title + ')' } }; rules.referenceLink = {
                filter: function (node, options) { return (options.linkStyle === 'referenced' && node.nodeName === 'A' && node.getAttribute('href')) }, replacement: function (content, node, options) {
                        var href = node.getAttribute('href'); var title = cleanAttribute(node.getAttribute('title')); if (title) title = ' "' + title + '"'; var replacement; var reference; switch (options.linkReferenceStyle) {
                                case 'collapsed': replacement = '[' + content + '][]'; reference = '[' + content + ']: ' + href + title; break
                                case 'shortcut': replacement = '[' + content + ']'; reference = '[' + content + ']: ' + href + title; break
                                default: var id = this.references.length + 1; replacement = '[' + content + '][' + id + ']'; reference = '[' + id + ']: ' + href + title;
                        }
                        this.references.push(reference); return replacement
                }, references: [], append: function (options) {
                        var references = ''; if (this.references.length) { references = '\n\n' + this.references.join('\n') + '\n\n'; this.references = []; }
                        return references
                }
        }; rules.emphasis = {
                filter: ['em', 'i'], replacement: function (content, node, options) {
                        if (!content.trim()) return ''
                        return options.emDelimiter + content + options.emDelimiter
                }
        }; rules.strong = {
                filter: ['strong', 'b'], replacement: function (content, node, options) {
                        if (!content.trim()) return ''
                        return options.strongDelimiter + content + options.strongDelimiter
                }
        }; rules.code = {
                filter: function (node) { var hasSiblings = node.previousSibling || node.nextSibling; var isCodeBlock = node.parentNode.nodeName === 'PRE' && !hasSiblings; return node.nodeName === 'CODE' && !isCodeBlock }, replacement: function (content) {
                        if (!content) return ''
                        content = content.replace(/\r?\n|\r/g, ' '); var extraSpace = /^`|^ .*?[^ ].* $|`$/.test(content) ? ' ' : ''; var delimiter = '`'; var matches = content.match(/`+/gm) || []; while (matches.indexOf(delimiter) !== -1) delimiter = delimiter + '`'; return delimiter + extraSpace + content + extraSpace + delimiter
                }
        }; rules.image = { filter: 'img', replacement: function (content, node) { var alt = cleanAttribute(node.getAttribute('alt')); var src = node.getAttribute('src') || ''; var title = cleanAttribute(node.getAttribute('title')); var titlePart = title ? ' "' + title + '"' : ''; return src ? '![' + alt + ']' + '(' + src + titlePart + ')' : '' } }; function cleanAttribute(attribute) { return attribute ? attribute.replace(/(\n+\s*)+/g, '\n') : '' }
        function Rules(options) { this.options = options; this._keep = []; this._remove = []; this.blankRule = { replacement: options.blankReplacement }; this.keepReplacement = options.keepReplacement; this.defaultRule = { replacement: options.defaultReplacement }; this.array = []; for (var key in options.rules) this.array.push(options.rules[key]); }
        Rules.prototype = {
                add: function (key, rule) { this.array.unshift(rule); }, keep: function (filter) { this._keep.unshift({ filter: filter, replacement: this.keepReplacement }); }, remove: function (filter) { this._remove.unshift({ filter: filter, replacement: function () { return '' } }); }, forNode: function (node) {
                        if (node.isBlank) return this.blankRule
                        var rule; if ((rule = findRule(this.array, node, this.options))) return rule
                        if ((rule = findRule(this._keep, node, this.options))) return rule
                        if ((rule = findRule(this._remove, node, this.options))) return rule
                        return this.defaultRule
                }, forEach: function (fn) { for (var i = 0; i < this.array.length; i++)fn(this.array[i], i); }
        }; function findRule(rules, node, options) {
                for (var i = 0; i < rules.length; i++) { var rule = rules[i]; if (filterValue(rule, node, options)) return rule }
                return void 0
        }
        function filterValue(rule, node, options) { var filter = rule.filter; if (typeof filter === 'string') { if (filter === node.nodeName.toLowerCase()) return true } else if (Array.isArray(filter)) { if (filter.indexOf(node.nodeName.toLowerCase()) > -1) return true } else if (typeof filter === 'function') { if (filter.call(rule, node, options)) return true } else { throw new TypeError('`filter` needs to be a string, array, or function') } }
        function collapseWhitespace(options) {
                var element = options.element; var isBlock = options.isBlock; var isVoid = options.isVoid; var isPre = options.isPre || function (node) { return node.nodeName === 'PRE' }; if (!element.firstChild || isPre(element)) return
                var prevText = null; var keepLeadingWs = false; var prev = null; var node = next(prev, element, isPre); while (node !== element) {
                        if (node.nodeType === 3 || node.nodeType === 4) {
                                var text = node.data.replace(/[ \r\n\t]+/g, ' '); if ((!prevText || / $/.test(prevText.data)) && !keepLeadingWs && text[0] === ' ') { text = text.substr(1); }
                                if (!text) { node = remove(node); continue }
                                node.data = text; prevText = node;
                        } else if (node.nodeType === 1) {
                                if (isBlock(node) || node.nodeName === 'BR') {
                                        if (prevText) { prevText.data = prevText.data.replace(/ $/, ''); }
                                        prevText = null; keepLeadingWs = false;
                                } else if (isVoid(node) || isPre(node)) { prevText = null; keepLeadingWs = true; } else if (prevText) { keepLeadingWs = false; }
                        } else { node = remove(node); continue }
                        var nextNode = next(prev, node, isPre); prev = node; node = nextNode;
                }
                if (prevText) { prevText.data = prevText.data.replace(/ $/, ''); if (!prevText.data) { remove(prevText); } }
        }
        function remove(node) { var next = node.nextSibling || node.parentNode; node.parentNode.removeChild(node); return next }
        function next(prev, current, isPre) {
                if ((prev && prev.parentNode === current) || isPre(current)) { return current.nextSibling || current.parentNode }
                return current.firstChild || current.nextSibling || current.parentNode
        }
        var root = (typeof window !== 'undefined' ? window : {}); function canParseHTMLNatively() {
                var Parser = root.DOMParser; var canParse = false; try { if (new Parser().parseFromString('', 'text/html')) { canParse = true; } } catch (e) { }
                return canParse
        }
        function createHTMLParser() {
                var Parser = function () { }; { if (shouldUseActiveX()) { Parser.prototype.parseFromString = function (string) { var doc = new window.ActiveXObject('htmlfile'); doc.designMode = 'on'; doc.open(); doc.write(string); doc.close(); return doc }; } else { Parser.prototype.parseFromString = function (string) { var doc = document.implementation.createHTMLDocument(''); doc.open(); doc.write(string); doc.close(); return doc }; } }
                return Parser
        }
        function shouldUseActiveX() {
                var useActiveX = false; try { document.implementation.createHTMLDocument('').open(); } catch (e) { if (window.ActiveXObject) useActiveX = true; }
                return useActiveX
        }
        var HTMLParser = canParseHTMLNatively() ? root.DOMParser : createHTMLParser(); function RootNode(input, options) {
                var root; if (typeof input === 'string') { var doc = htmlParser().parseFromString('<x-turndown id="turndown-root">' + input + '</x-turndown>', 'text/html'); root = doc.getElementById('turndown-root'); } else { root = input.cloneNode(true); }
                collapseWhitespace({ element: root, isBlock: isBlock, isVoid: isVoid, isPre: options.preformattedCode ? isPreOrCode : null }); return root
        }
        var _htmlParser; function htmlParser() { _htmlParser = _htmlParser || new HTMLParser(); return _htmlParser }
        function isPreOrCode(node) { return node.nodeName === 'PRE' || node.nodeName === 'CODE' }
        function Node(node, options) { node.isBlock = isBlock(node); node.isCode = node.nodeName === 'CODE' || node.parentNode.isCode; node.isBlank = isBlank(node); node.flankingWhitespace = flankingWhitespace(node, options); return node }
        function isBlank(node) { return (!isVoid(node) && !isMeaningfulWhenBlank(node) && /^\s*$/i.test(node.textContent) && !hasVoid(node) && !hasMeaningfulWhenBlank(node)) }
        function flankingWhitespace(node, options) {
                if (node.isBlock || (options.preformattedCode && node.isCode)) { return { leading: '', trailing: '' } }
                var edges = edgeWhitespace(node.textContent); if (edges.leadingAscii && isFlankedByWhitespace('left', node, options)) { edges.leading = edges.leadingNonAscii; }
                if (edges.trailingAscii && isFlankedByWhitespace('right', node, options)) { edges.trailing = edges.trailingNonAscii; }
                return { leading: edges.leading, trailing: edges.trailing }
        }
        function edgeWhitespace(string) { var m = string.match(/^(([ \t\r\n]*)(\s*))[\s\S]*?((\s*?)([ \t\r\n]*))$/); return { leading: m[1], leadingAscii: m[2], leadingNonAscii: m[3], trailing: m[4], trailingNonAscii: m[5], trailingAscii: m[6] } }
        function isFlankedByWhitespace(side, node, options) {
                var sibling; var regExp; var isFlanked; if (side === 'left') { sibling = node.previousSibling; regExp = / $/; } else { sibling = node.nextSibling; regExp = /^ /; }
                if (sibling) { if (sibling.nodeType === 3) { isFlanked = regExp.test(sibling.nodeValue); } else if (options.preformattedCode && sibling.nodeName === 'CODE') { isFlanked = false; } else if (sibling.nodeType === 1 && !isBlock(sibling)) { isFlanked = regExp.test(sibling.textContent); } }
                return isFlanked
        }
        var reduce = Array.prototype.reduce; var escapes = [[/\\/g, '\\\\'], [/\*/g, '\\*'], [/^-/g, '\\-'], [/^\+ /g, '\\+ '], [/^(=+)/g, '\\$1'], [/^(#{1,6}) /g, '\\$1 '], [/`/g, '\\`'], [/^~~~/g, '\\~~~'], [/\[/g, '\\['], [/\]/g, '\\]'], [/^>/g, '\\>'], [/_/g, '\\_'], [/^(\d+)\. /g, '$1\\. ']]; function TurndownService(options) {
                if (!(this instanceof TurndownService)) return new TurndownService(options)
                var defaults = { rules: rules, headingStyle: 'setext', hr: '* * *', bulletListMarker: '*', codeBlockStyle: 'indented', fence: '```', emDelimiter: '_', strongDelimiter: '**', linkStyle: 'inlined', linkReferenceStyle: 'full', br: '  ', preformattedCode: false, blankReplacement: function (content, node) { return node.isBlock ? '\n\n' : '' }, keepReplacement: function (content, node) { return node.isBlock ? '\n\n' + node.outerHTML + '\n\n' : node.outerHTML }, defaultReplacement: function (content, node) { return node.isBlock ? '\n\n' + content + '\n\n' : content } }; this.options = extend({}, defaults, options); this.rules = new Rules(this.options);
        }
        TurndownService.prototype = {
                turndown: function (input) {
                        if (!canConvert(input)) { throw new TypeError(input + ' is not a string, or an element/document/fragment node.') }
                        if (input === '') return ''
                        var output = process.call(this, new RootNode(input, this.options)); return postProcess.call(this, output)
                }, use: function (plugin) {
                        if (Array.isArray(plugin)) { for (var i = 0; i < plugin.length; i++)this.use(plugin[i]); } else if (typeof plugin === 'function') { plugin(this); } else { throw new TypeError('plugin must be a Function or an Array of Functions') }
                        return this
                }, addRule: function (key, rule) { this.rules.add(key, rule); return this }, keep: function (filter) { this.rules.keep(filter); return this }, remove: function (filter) { this.rules.remove(filter); return this }, escape: function (string) { return escapes.reduce(function (accumulator, escape) { return accumulator.replace(escape[0], escape[1]) }, string) }
        }; function process(parentNode) {
                var self = this; return reduce.call(parentNode.childNodes, function (output, node) {
                        node = new Node(node, self.options); var replacement = ''; if (node.nodeType === 3) { replacement = node.isCode ? node.nodeValue : self.escape(node.nodeValue); } else if (node.nodeType === 1) { replacement = replacementForNode.call(self, node); }
                        return join(output, replacement)
                }, '')
        }
        function postProcess(output) { var self = this; this.rules.forEach(function (rule) { if (typeof rule.append === 'function') { output = join(output, rule.append(self.options)); } }); return output.replace(/^[\t\r\n]+/, '').replace(/[\t\r\n\s]+$/, '') }
        function replacementForNode(node) {
                var rule = this.rules.forNode(node); var content = process.call(this, node); var whitespace = node.flankingWhitespace; if (whitespace.leading || whitespace.trailing) content = content.trim(); return (whitespace.leading +
                        rule.replacement(content, node, this.options) +
                        whitespace.trailing)
        }
        function join(output, replacement) { var s1 = trimTrailingNewlines(output); var s2 = trimLeadingNewlines(replacement); var nls = Math.max(output.length - s1.length, replacement.length - s2.length); var separator = '\n\n'.substring(0, nls); return s1 + separator + s2 }
        function canConvert(input) { return (input != null && (typeof input === 'string' || (input.nodeType && (input.nodeType === 1 || input.nodeType === 9 || input.nodeType === 11)))) }
        return TurndownService;
}()); var _self = "undefined" != typeof window ? window : "undefined" != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope ? self : {}, Prism = function (e) { var n = /(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i, t = 0, r = {}, a = { manual: e.Prism && e.Prism.manual, disableWorkerMessageHandler: e.Prism && e.Prism.disableWorkerMessageHandler, util: { encode: function e(n) { return n instanceof i ? new i(n.type, e(n.content), n.alias) : Array.isArray(n) ? n.map(e) : n.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\u00a0/g, " ") }, type: function (e) { return Object.prototype.toString.call(e).slice(8, -1) }, objId: function (e) { return e.__id || Object.defineProperty(e, "__id", { value: ++t }), e.__id }, clone: function e(n, t) { var r, i; switch (t = t || {}, a.util.type(n)) { case "Object": if (i = a.util.objId(n), t[i]) return t[i]; for (var l in r = {}, t[i] = r, n) n.hasOwnProperty(l) && (r[l] = e(n[l], t)); return r; case "Array": return i = a.util.objId(n), t[i] ? t[i] : (r = [], t[i] = r, n.forEach((function (n, a) { r[a] = e(n, t) })), r); default: return n } }, getLanguage: function (e) { for (; e;) { var t = n.exec(e.className); if (t) return t[1].toLowerCase(); e = e.parentElement } return "none" }, setLanguage: function (e, t) { e.className = e.className.replace(RegExp(n, "gi"), ""), e.classList.add("language-" + t) }, currentScript: function () { if ("undefined" == typeof document) return null; if ("currentScript" in document) return document.currentScript; try { throw new Error } catch (r) { var e = (/at [^(\r\n]*\((.*):[^:]+:[^:]+\)$/i.exec(r.stack) || [])[1]; if (e) { var n = document.getElementsByTagName("script"); for (var t in n) if (n[t].src == e) return n[t] } return null } }, isActive: function (e, n, t) { for (var r = "no-" + n; e;) { var a = e.classList; if (a.contains(n)) return !0; if (a.contains(r)) return !1; e = e.parentElement } return !!t } }, languages: { plain: r, plaintext: r, text: r, txt: r, extend: function (e, n) { var t = a.util.clone(a.languages[e]); for (var r in n) t[r] = n[r]; return t }, insertBefore: function (e, n, t, r) { var i = (r = r || a.languages)[e], l = {}; for (var o in i) if (i.hasOwnProperty(o)) { if (o == n) for (var s in t) t.hasOwnProperty(s) && (l[s] = t[s]); t.hasOwnProperty(o) || (l[o] = i[o]) } var u = r[e]; return r[e] = l, a.languages.DFS(a.languages, (function (n, t) { t === u && n != e && (this[n] = l) })), l }, DFS: function e(n, t, r, i) { i = i || {}; var l = a.util.objId; for (var o in n) if (n.hasOwnProperty(o)) { t.call(n, o, n[o], r || o); var s = n[o], u = a.util.type(s); "Object" !== u || i[l(s)] ? "Array" !== u || i[l(s)] || (i[l(s)] = !0, e(s, t, o, i)) : (i[l(s)] = !0, e(s, t, null, i)) } } }, plugins: {}, highlightAll: function (e, n) { a.highlightAllUnder(document, e, n) }, highlightAllUnder: function (e, n, t) { var r = { callback: t, container: e, selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code' }; a.hooks.run("before-highlightall", r), r.elements = Array.prototype.slice.apply(r.container.querySelectorAll(r.selector)), a.hooks.run("before-all-elements-highlight", r); for (var i, l = 0; i = r.elements[l++];)a.highlightElement(i, !0 === n, r.callback) }, highlightElement: function (n, t, r) { var i = a.util.getLanguage(n), l = a.languages[i]; a.util.setLanguage(n, i); var o = n.parentElement; o && "pre" === o.nodeName.toLowerCase() && a.util.setLanguage(o, i); var s = { element: n, language: i, grammar: l, code: n.textContent }; function u(e) { s.highlightedCode = e, a.hooks.run("before-insert", s), s.element.innerHTML = s.highlightedCode, a.hooks.run("after-highlight", s), a.hooks.run("complete", s), r && r.call(s.element) } if (a.hooks.run("before-sanity-check", s), (o = s.element.parentElement) && "pre" === o.nodeName.toLowerCase() && !o.hasAttribute("tabindex") && o.setAttribute("tabindex", "0"), !s.code) return a.hooks.run("complete", s), void (r && r.call(s.element)); if (a.hooks.run("before-highlight", s), s.grammar) if (t && e.Worker) { var c = new Worker(a.filename); c.onmessage = function (e) { u(e.data) }, c.postMessage(JSON.stringify({ language: s.language, code: s.code, immediateClose: !0 })) } else u(a.highlight(s.code, s.grammar, s.language)); else u(a.util.encode(s.code)) }, highlight: function (e, n, t) { var r = { code: e, grammar: n, language: t }; if (a.hooks.run("before-tokenize", r), !r.grammar) throw new Error('The language "' + r.language + '" has no grammar.'); return r.tokens = a.tokenize(r.code, r.grammar), a.hooks.run("after-tokenize", r), i.stringify(a.util.encode(r.tokens), r.language) }, tokenize: function (e, n) { var t = n.rest; if (t) { for (var r in t) n[r] = t[r]; delete n.rest } var a = new s; return u(a, a.head, e), o(e, a, n, a.head, 0), function (e) { for (var n = [], t = e.head.next; t !== e.tail;)n.push(t.value), t = t.next; return n }(a) }, hooks: { all: {}, add: function (e, n) { var t = a.hooks.all; t[e] = t[e] || [], t[e].push(n) }, run: function (e, n) { var t = a.hooks.all[e]; if (t && t.length) for (var r, i = 0; r = t[i++];)r(n) } }, Token: i }; function i(e, n, t, r) { this.type = e, this.content = n, this.alias = t, this.length = 0 | (r || "").length } function l(e, n, t, r) { e.lastIndex = n; var a = e.exec(t); if (a && r && a[1]) { var i = a[1].length; a.index += i, a[0] = a[0].slice(i) } return a } function o(e, n, t, r, s, g) { for (var f in t) if (t.hasOwnProperty(f) && t[f]) { var h = t[f]; h = Array.isArray(h) ? h : [h]; for (var d = 0; d < h.length; ++d) { if (g && g.cause == f + "," + d) return; var v = h[d], p = v.inside, m = !!v.lookbehind, y = !!v.greedy, k = v.alias; if (y && !v.pattern.global) { var x = v.pattern.toString().match(/[imsuy]*$/)[0]; v.pattern = RegExp(v.pattern.source, x + "g") } for (var b = v.pattern || v, w = r.next, A = s; w !== n.tail && !(g && A >= g.reach); A += w.value.length, w = w.next) { var E = w.value; if (n.length > e.length) return; if (!(E instanceof i)) { var P, L = 1; if (y) { if (!(P = l(b, A, e, m)) || P.index >= e.length) break; var S = P.index, O = P.index + P[0].length, j = A; for (j += w.value.length; S >= j;)j += (w = w.next).value.length; if (A = j -= w.value.length, w.value instanceof i) continue; for (var C = w; C !== n.tail && (j < O || "string" == typeof C.value); C = C.next)L++, j += C.value.length; L--, E = e.slice(A, j), P.index -= A } else if (!(P = l(b, 0, E, m))) continue; S = P.index; var N = P[0], _ = E.slice(0, S), M = E.slice(S + N.length), W = A + E.length; g && W > g.reach && (g.reach = W); var z = w.prev; if (_ && (z = u(n, z, _), A += _.length), c(n, z, L), w = u(n, z, new i(f, p ? a.tokenize(N, p) : N, k, N)), M && u(n, w, M), L > 1) { var I = { cause: f + "," + d, reach: W }; o(e, n, t, w.prev, A, I), g && I.reach > g.reach && (g.reach = I.reach) } } } } } } function s() { var e = { value: null, prev: null, next: null }, n = { value: null, prev: e, next: null }; e.next = n, this.head = e, this.tail = n, this.length = 0 } function u(e, n, t) { var r = n.next, a = { value: t, prev: n, next: r }; return n.next = a, r.prev = a, e.length++, a } function c(e, n, t) { for (var r = n.next, a = 0; a < t && r !== e.tail; a++)r = r.next; n.next = r, r.prev = n, e.length -= a } if (e.Prism = a, i.stringify = function e(n, t) { if ("string" == typeof n) return n; if (Array.isArray(n)) { var r = ""; return n.forEach((function (n) { r += e(n, t) })), r } var i = { type: n.type, content: e(n.content, t), tag: "span", classes: ["token", n.type], attributes: {}, language: t }, l = n.alias; l && (Array.isArray(l) ? Array.prototype.push.apply(i.classes, l) : i.classes.push(l)), a.hooks.run("wrap", i); var o = ""; for (var s in i.attributes) o += " " + s + '="' + (i.attributes[s] || "").replace(/"/g, "&quot;") + '"'; return "<" + i.tag + ' class="' + i.classes.join(" ") + '"' + o + ">" + i.content + "</" + i.tag + ">" }, !e.document) return e.addEventListener ? (a.disableWorkerMessageHandler || e.addEventListener("message", (function (n) { var t = JSON.parse(n.data), r = t.language, i = t.code, l = t.immediateClose; e.postMessage(a.highlight(i, a.languages[r], r)), l && e.close() }), !1), a) : a; var g = a.util.currentScript(); function f() { a.manual || a.highlightAll() } if (g && (a.filename = g.src, g.hasAttribute("data-manual") && (a.manual = !0)), !a.manual) { var h = document.readyState; "loading" === h || "interactive" === h && g && g.defer ? document.addEventListener("DOMContentLoaded", f) : window.requestAnimationFrame ? window.requestAnimationFrame(f) : window.setTimeout(f, 16) } return a }(_self); "undefined" != typeof module && module.exports && (module.exports = Prism), "undefined" != typeof global && (global.Prism = Prism); Prism.languages.markup = { comment: { pattern: /<!--(?:(?!<!--)[\s\S])*?-->/, greedy: !0 }, prolog: { pattern: /<\?[\s\S]+?\?>/, greedy: !0 }, doctype: { pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i, greedy: !0, inside: { "internal-subset": { pattern: /(^[^\[]*\[)[\s\S]+(?=\]>$)/, lookbehind: !0, greedy: !0, inside: null }, string: { pattern: /"[^"]*"|'[^']*'/, greedy: !0 }, punctuation: /^<!|>$|[[\]]/, "doctype-tag": /^DOCTYPE/i, name: /[^\s<>'"]+/ } }, cdata: { pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i, greedy: !0 }, tag: { pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/, greedy: !0, inside: { tag: { pattern: /^<\/?[^\s>\/]+/, inside: { punctuation: /^<\/?/, namespace: /^[^\s>\/:]+:/ } }, "special-attr": [], "attr-value": { pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/, inside: { punctuation: [{ pattern: /^=/, alias: "attr-equals" }, /"|'/] } }, punctuation: /\/?>/, "attr-name": { pattern: /[^\s>\/]+/, inside: { namespace: /^[^\s>\/:]+:/ } } } }, entity: [{ pattern: /&[\da-z]{1,8};/i, alias: "named-entity" }, /&#x?[\da-f]{1,8};/i] }, Prism.languages.markup.tag.inside["attr-value"].inside.entity = Prism.languages.markup.entity, Prism.languages.markup.doctype.inside["internal-subset"].inside = Prism.languages.markup, Prism.hooks.add("wrap", (function (a) { "entity" === a.type && (a.attributes.title = a.content.replace(/&amp;/, "&")) })), Object.defineProperty(Prism.languages.markup.tag, "addInlined", { value: function (a, e) { var s = {}; s["language-" + e] = { pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i, lookbehind: !0, inside: Prism.languages[e] }, s.cdata = /^<!\[CDATA\[|\]\]>$/i; var t = { "included-cdata": { pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i, inside: s } }; t["language-" + e] = { pattern: /[\s\S]+/, inside: Prism.languages[e] }; var n = {}; n[a] = { pattern: RegExp("(<__[^>]*>)(?:<!\\[CDATA\\[(?:[^\\]]|\\](?!\\]>))*\\]\\]>|(?!<!\\[CDATA\\[)[^])*?(?=</__>)".replace(/__/g, (function () { return a })), "i"), lookbehind: !0, greedy: !0, inside: t }, Prism.languages.insertBefore("markup", "cdata", n) } }), Object.defineProperty(Prism.languages.markup.tag, "addAttribute", { value: function (a, e) { Prism.languages.markup.tag.inside["special-attr"].push({ pattern: RegExp("(^|[\"'\\s])(?:" + a + ")\\s*=\\s*(?:\"[^\"]*\"|'[^']*'|[^\\s'\">=]+(?=[\\s>]))", "i"), lookbehind: !0, inside: { "attr-name": /^[^\s=]+/, "attr-value": { pattern: /=[\s\S]+/, inside: { value: { pattern: /(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/, lookbehind: !0, alias: [e, "language-" + e], inside: Prism.languages[e] }, punctuation: [{ pattern: /^=/, alias: "attr-equals" }, /"|'/] } } } }) } }), Prism.languages.html = Prism.languages.markup, Prism.languages.mathml = Prism.languages.markup, Prism.languages.svg = Prism.languages.markup, Prism.languages.xml = Prism.languages.extend("markup", {}), Prism.languages.ssml = Prism.languages.xml, Prism.languages.atom = Prism.languages.xml, Prism.languages.rss = Prism.languages.xml; !function (s) { var e = /(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/; s.languages.css = { comment: /\/\*[\s\S]*?\*\//, atrule: { pattern: /@[\w-](?:[^;{\s]|\s+(?![\s{]))*(?:;|(?=\s*\{))/, inside: { rule: /^@[\w-]+/, "selector-function-argument": { pattern: /(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/, lookbehind: !0, alias: "selector" }, keyword: { pattern: /(^|[^\w-])(?:and|not|only|or)(?![\w-])/, lookbehind: !0 } } }, url: { pattern: RegExp("\\burl\\((?:" + e.source + "|(?:[^\\\\\r\n()\"']|\\\\[^])*)\\)", "i"), greedy: !0, inside: { function: /^url/i, punctuation: /^\(|\)$/, string: { pattern: RegExp("^" + e.source + "$"), alias: "url" } } }, selector: { pattern: RegExp("(^|[{}\\s])[^{}\\s](?:[^{};\"'\\s]|\\s+(?![\\s{])|" + e.source + ")*(?=\\s*\\{)"), lookbehind: !0 }, string: { pattern: e, greedy: !0 }, property: { pattern: /(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i, lookbehind: !0 }, important: /!important\b/i, function: { pattern: /(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i, lookbehind: !0 }, punctuation: /[(){};:,]/ }, s.languages.css.atrule.inside.rest = s.languages.css; var t = s.languages.markup; t && (t.tag.addInlined("style", "css"), t.tag.addAttribute("style", "css")) }(Prism); Prism.languages.clike = { comment: [{ pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/, lookbehind: !0, greedy: !0 }, { pattern: /(^|[^\\:])\/\/.*/, lookbehind: !0, greedy: !0 }], string: { pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/, greedy: !0 }, "class-name": { pattern: /(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i, lookbehind: !0, inside: { punctuation: /[.\\]/ } }, keyword: /\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/, boolean: /\b(?:false|true)\b/, function: /\b\w+(?=\()/, number: /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i, operator: /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/, punctuation: /[{}[\];(),.:]/ }; Prism.languages.javascript = Prism.languages.extend("clike", { "class-name": [Prism.languages.clike["class-name"], { pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/, lookbehind: !0 }], keyword: [{ pattern: /((?:^|\})\s*)catch\b/, lookbehind: !0 }, { pattern: /(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/, lookbehind: !0 }], function: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/, number: { pattern: RegExp("(^|[^\\w$])(?:NaN|Infinity|0[bB][01]+(?:_[01]+)*n?|0[oO][0-7]+(?:_[0-7]+)*n?|0[xX][\\dA-Fa-f]+(?:_[\\dA-Fa-f]+)*n?|\\d+(?:_\\d+)*n|(?:\\d+(?:_\\d+)*(?:\\.(?:\\d+(?:_\\d+)*)?)?|\\.\\d+(?:_\\d+)*)(?:[Ee][+-]?\\d+(?:_\\d+)*)?)(?![\\w$])"), lookbehind: !0 }, operator: /--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/ }), Prism.languages.javascript["class-name"][0].pattern = /(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/, Prism.languages.insertBefore("javascript", "keyword", { regex: { pattern: RegExp("((?:^|[^$\\w\\xA0-\\uFFFF.\"'\\])\\s]|\\b(?:return|yield))\\s*)/(?:(?:\\[(?:[^\\]\\\\\r\n]|\\\\.)*\\]|\\\\.|[^/\\\\\\[\r\n])+/[dgimyus]{0,7}|(?:\\[(?:[^[\\]\\\\\r\n]|\\\\.|\\[(?:[^[\\]\\\\\r\n]|\\\\.|\\[(?:[^[\\]\\\\\r\n]|\\\\.)*\\])*\\])*\\]|\\\\.|[^/\\\\\\[\r\n])+/[dgimyus]{0,7}v[dgimyus]{0,7})(?=(?:\\s|/\\*(?:[^*]|\\*(?!/))*\\*/)*(?:$|[\r\n,.;:})\\]]|//))"), lookbehind: !0, greedy: !0, inside: { "regex-source": { pattern: /^(\/)[\s\S]+(?=\/[a-z]*$)/, lookbehind: !0, alias: "language-regex", inside: Prism.languages.regex }, "regex-delimiter": /^\/|\/$/, "regex-flags": /^[a-z]+$/ } }, "function-variable": { pattern: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/, alias: "function" }, parameter: [{ pattern: /(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/, lookbehind: !0, inside: Prism.languages.javascript }, { pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i, lookbehind: !0, inside: Prism.languages.javascript }, { pattern: /(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/, lookbehind: !0, inside: Prism.languages.javascript }, { pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/, lookbehind: !0, inside: Prism.languages.javascript }], constant: /\b[A-Z](?:[A-Z_]|\dx?)*\b/ }), Prism.languages.insertBefore("javascript", "string", { hashbang: { pattern: /^#!.*/, greedy: !0, alias: "comment" }, "template-string": { pattern: /`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/, greedy: !0, inside: { "template-punctuation": { pattern: /^`|`$/, alias: "string" }, interpolation: { pattern: /((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/, lookbehind: !0, inside: { "interpolation-punctuation": { pattern: /^\$\{|\}$/, alias: "punctuation" }, rest: Prism.languages.javascript } }, string: /[\s\S]+/ } }, "string-property": { pattern: /((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m, lookbehind: !0, greedy: !0, alias: "property" } }), Prism.languages.insertBefore("javascript", "operator", { "literal-property": { pattern: /((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m, lookbehind: !0, alias: "property" } }), Prism.languages.markup && (Prism.languages.markup.tag.addInlined("script", "javascript"), Prism.languages.markup.tag.addAttribute("on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)", "javascript")), Prism.languages.js = Prism.languages.javascript; !function (e) { var t = "\\b(?:BASH|BASHOPTS|BASH_ALIASES|BASH_ARGC|BASH_ARGV|BASH_CMDS|BASH_COMPLETION_COMPAT_DIR|BASH_LINENO|BASH_REMATCH|BASH_SOURCE|BASH_VERSINFO|BASH_VERSION|COLORTERM|COLUMNS|COMP_WORDBREAKS|DBUS_SESSION_BUS_ADDRESS|DEFAULTS_PATH|DESKTOP_SESSION|DIRSTACK|DISPLAY|EUID|GDMSESSION|GDM_LANG|GNOME_KEYRING_CONTROL|GNOME_KEYRING_PID|GPG_AGENT_INFO|GROUPS|HISTCONTROL|HISTFILE|HISTFILESIZE|HISTSIZE|HOME|HOSTNAME|HOSTTYPE|IFS|INSTANCE|JOB|LANG|LANGUAGE|LC_ADDRESS|LC_ALL|LC_IDENTIFICATION|LC_MEASUREMENT|LC_MONETARY|LC_NAME|LC_NUMERIC|LC_PAPER|LC_TELEPHONE|LC_TIME|LESSCLOSE|LESSOPEN|LINES|LOGNAME|LS_COLORS|MACHTYPE|MAILCHECK|MANDATORY_PATH|NO_AT_BRIDGE|OLDPWD|OPTERR|OPTIND|ORBIT_SOCKETDIR|OSTYPE|PAPERSIZE|PATH|PIPESTATUS|PPID|PS1|PS2|PS3|PS4|PWD|RANDOM|REPLY|SECONDS|SELINUX_INIT|SESSION|SESSIONTYPE|SESSION_MANAGER|SHELL|SHELLOPTS|SHLVL|SSH_AUTH_SOCK|TERM|UID|UPSTART_EVENTS|UPSTART_INSTANCE|UPSTART_JOB|UPSTART_SESSION|USER|WINDOWID|XAUTHORITY|XDG_CONFIG_DIRS|XDG_CURRENT_DESKTOP|XDG_DATA_DIRS|XDG_GREETER_DATA_DIR|XDG_MENU_PREFIX|XDG_RUNTIME_DIR|XDG_SEAT|XDG_SEAT_PATH|XDG_SESSION_DESKTOP|XDG_SESSION_ID|XDG_SESSION_PATH|XDG_SESSION_TYPE|XDG_VTNR|XMODIFIERS)\\b", n = { pattern: /(^(["']?)\w+\2)[ \t]+\S.*/, lookbehind: !0, alias: "punctuation", inside: null }, a = { bash: n, environment: { pattern: RegExp("\\$" + t), alias: "constant" }, variable: [{ pattern: /\$?\(\([\s\S]+?\)\)/, greedy: !0, inside: { variable: [{ pattern: /(^\$\(\([\s\S]+)\)\)/, lookbehind: !0 }, /^\$\(\(/], number: /\b0x[\dA-Fa-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:[Ee]-?\d+)?/, operator: /--|\+\+|\*\*=?|<<=?|>>=?|&&|\|\||[=!+\-*/%<>^&|]=?|[?~:]/, punctuation: /\(\(?|\)\)?|,|;/ } }, { pattern: /\$\((?:\([^)]+\)|[^()])+\)|`[^`]+`/, greedy: !0, inside: { variable: /^\$\(|^`|\)$|`$/ } }, { pattern: /\$\{[^}]+\}/, greedy: !0, inside: { operator: /:[-=?+]?|[!\/]|##?|%%?|\^\^?|,,?/, punctuation: /[\[\]]/, environment: { pattern: RegExp("(\\{)" + t), lookbehind: !0, alias: "constant" } } }, /\$(?:\w+|[#?*!@$])/], entity: /\\(?:[abceEfnrtv\\"]|O?[0-7]{1,3}|U[0-9a-fA-F]{8}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{1,2})/ }; e.languages.bash = { shebang: { pattern: /^#!\s*\/.*/, alias: "important" }, comment: { pattern: /(^|[^"{\\$])#.*/, lookbehind: !0 }, "function-name": [{ pattern: /(\bfunction\s+)[\w-]+(?=(?:\s*\(?:\s*\))?\s*\{)/, lookbehind: !0, alias: "function" }, { pattern: /\b[\w-]+(?=\s*\(\s*\)\s*\{)/, alias: "function" }], "for-or-select": { pattern: /(\b(?:for|select)\s+)\w+(?=\s+in\s)/, alias: "variable", lookbehind: !0 }, "assign-left": { pattern: /(^|[\s;|&]|[<>]\()\w+(?=\+?=)/, inside: { environment: { pattern: RegExp("(^|[\\s;|&]|[<>]\\()" + t), lookbehind: !0, alias: "constant" } }, alias: "variable", lookbehind: !0 }, string: [{ pattern: /((?:^|[^<])<<-?\s*)(\w+)\s[\s\S]*?(?:\r?\n|\r)\2/, lookbehind: !0, greedy: !0, inside: a }, { pattern: /((?:^|[^<])<<-?\s*)(["'])(\w+)\2\s[\s\S]*?(?:\r?\n|\r)\3/, lookbehind: !0, greedy: !0, inside: { bash: n } }, { pattern: /(^|[^\\](?:\\\\)*)"(?:\\[\s\S]|\$\([^)]+\)|\$(?!\()|`[^`]+`|[^"\\`$])*"/, lookbehind: !0, greedy: !0, inside: a }, { pattern: /(^|[^$\\])'[^']*'/, lookbehind: !0, greedy: !0 }, { pattern: /\$'(?:[^'\\]|\\[\s\S])*'/, greedy: !0, inside: { entity: a.entity } }], environment: { pattern: RegExp("\\$?" + t), alias: "constant" }, variable: a.variable, function: { pattern: /(^|[\s;|&]|[<>]\()(?:add|apropos|apt|apt-cache|apt-get|aptitude|aspell|automysqlbackup|awk|basename|bash|bc|bconsole|bg|bzip2|cal|cat|cfdisk|chgrp|chkconfig|chmod|chown|chroot|cksum|clear|cmp|column|comm|composer|cp|cron|crontab|csplit|curl|cut|date|dc|dd|ddrescue|debootstrap|df|diff|diff3|dig|dir|dircolors|dirname|dirs|dmesg|docker|docker-compose|du|egrep|eject|env|ethtool|expand|expect|expr|fdformat|fdisk|fg|fgrep|file|find|fmt|fold|format|free|fsck|ftp|fuser|gawk|git|gparted|grep|groupadd|groupdel|groupmod|groups|grub-mkconfig|gzip|halt|head|hg|history|host|hostname|htop|iconv|id|ifconfig|ifdown|ifup|import|install|ip|jobs|join|kill|killall|less|link|ln|locate|logname|logrotate|look|lpc|lpr|lprint|lprintd|lprintq|lprm|ls|lsof|lynx|make|man|mc|mdadm|mkconfig|mkdir|mke2fs|mkfifo|mkfs|mkisofs|mknod|mkswap|mmv|more|most|mount|mtools|mtr|mutt|mv|nano|nc|netstat|nice|nl|node|nohup|notify-send|npm|nslookup|op|open|parted|passwd|paste|pathchk|ping|pkill|pnpm|podman|podman-compose|popd|pr|printcap|printenv|ps|pushd|pv|quota|quotacheck|quotactl|ram|rar|rcp|reboot|remsync|rename|renice|rev|rm|rmdir|rpm|rsync|scp|screen|sdiff|sed|sendmail|seq|service|sftp|sh|shellcheck|shuf|shutdown|sleep|slocate|sort|split|ssh|stat|strace|su|sudo|sum|suspend|swapon|sync|tac|tail|tar|tee|time|timeout|top|touch|tr|traceroute|tsort|tty|umount|uname|unexpand|uniq|units|unrar|unshar|unzip|update-grub|uptime|useradd|userdel|usermod|users|uudecode|uuencode|v|vcpkg|vdir|vi|vim|virsh|vmstat|wait|watch|wc|wget|whereis|which|who|whoami|write|xargs|xdg-open|yarn|yes|zenity|zip|zsh|zypper)(?=$|[)\s;|&])/, lookbehind: !0 }, keyword: { pattern: /(^|[\s;|&]|[<>]\()(?:case|do|done|elif|else|esac|fi|for|function|if|in|select|then|until|while)(?=$|[)\s;|&])/, lookbehind: !0 }, builtin: { pattern: /(^|[\s;|&]|[<>]\()(?:\.|:|alias|bind|break|builtin|caller|cd|command|continue|declare|echo|enable|eval|exec|exit|export|getopts|hash|help|let|local|logout|mapfile|printf|pwd|read|readarray|readonly|return|set|shift|shopt|source|test|times|trap|type|typeset|ulimit|umask|unalias|unset)(?=$|[)\s;|&])/, lookbehind: !0, alias: "class-name" }, boolean: { pattern: /(^|[\s;|&]|[<>]\()(?:false|true)(?=$|[)\s;|&])/, lookbehind: !0 }, "file-descriptor": { pattern: /\B&\d\b/, alias: "important" }, operator: { pattern: /\d?<>|>\||\+=|=[=~]?|!=?|<<[<-]?|[&\d]?>>|\d[<>]&?|[<>][&=]?|&[>&]?|\|[&|]?/, inside: { "file-descriptor": { pattern: /^\d/, alias: "important" } } }, punctuation: /\$?\(\(?|\)\)?|\.\.|[{}[\];\\]/, number: { pattern: /(^|\s)(?:[1-9]\d*|0)(?:[.,]\d+)?\b/, lookbehind: !0 } }, n.inside = e.languages.bash; for (var o = ["comment", "function-name", "for-or-select", "assign-left", "string", "environment", "function", "keyword", "builtin", "boolean", "file-descriptor", "operator", "punctuation", "number"], s = a.variable[1].inside, i = 0; i < o.length; i++)s[o[i]] = e.languages.bash[o[i]]; e.languages.shell = e.languages.bash }(Prism); !function (e) { function n(e, n) { return e.replace(/<<(\d+)>>/g, (function (e, s) { return "(?:" + n[+s] + ")" })) } function s(e, s, a) { return RegExp(n(e, s), a || "") } function a(e, n) { for (var s = 0; s < n; s++)e = e.replace(/<<self>>/g, (function () { return "(?:" + e + ")" })); return e.replace(/<<self>>/g, "[^\\s\\S]") } var t = "bool byte char decimal double dynamic float int long object sbyte short string uint ulong ushort var void", r = "class enum interface record struct", i = "add alias and ascending async await by descending from(?=\\s*(?:\\w|$)) get global group into init(?=\\s*;) join let nameof not notnull on or orderby partial remove select set unmanaged value when where with(?=\\s*{)", o = "abstract as base break case catch checked const continue default delegate do else event explicit extern finally fixed for foreach goto if implicit in internal is lock namespace new null operator out override params private protected public readonly ref return sealed sizeof stackalloc static switch this throw try typeof unchecked unsafe using virtual volatile while yield"; function l(e) { return "\\b(?:" + e.trim().replace(/ /g, "|") + ")\\b" } var d = l(r), p = RegExp(l(t + " " + r + " " + i + " " + o)), c = l(r + " " + i + " " + o), u = l(t + " " + r + " " + o), g = a("<(?:[^<>;=+\\-*/%&|^]|<<self>>)*>", 2), b = a("\\((?:[^()]|<<self>>)*\\)", 2), h = "@?\\b[A-Za-z_]\\w*\\b", f = n("<<0>>(?:\\s*<<1>>)?", [h, g]), m = n("(?!<<0>>)<<1>>(?:\\s*\\.\\s*<<1>>)*", [c, f]), k = "\\[\\s*(?:,\\s*)*\\]", y = n("<<0>>(?:\\s*(?:\\?\\s*)?<<1>>)*(?:\\s*\\?)?", [m, k]), w = n("[^,()<>[\\];=+\\-*/%&|^]|<<0>>|<<1>>|<<2>>", [g, b, k]), v = n("\\(<<0>>+(?:,<<0>>+)+\\)", [w]), x = n("(?:<<0>>|<<1>>)(?:\\s*(?:\\?\\s*)?<<2>>)*(?:\\s*\\?)?", [v, m, k]), $ = { keyword: p, punctuation: /[<>()?,.:[\]]/ }, _ = "'(?:[^\r\n'\\\\]|\\\\.|\\\\[Uux][\\da-fA-F]{1,8})'", B = '"(?:\\\\.|[^\\\\"\r\n])*"'; e.languages.csharp = e.languages.extend("clike", { string: [{ pattern: s("(^|[^$\\\\])<<0>>", ['@"(?:""|\\\\[^]|[^\\\\"])*"(?!")']), lookbehind: !0, greedy: !0 }, { pattern: s("(^|[^@$\\\\])<<0>>", [B]), lookbehind: !0, greedy: !0 }], "class-name": [{ pattern: s("(\\busing\\s+static\\s+)<<0>>(?=\\s*;)", [m]), lookbehind: !0, inside: $ }, { pattern: s("(\\busing\\s+<<0>>\\s*=\\s*)<<1>>(?=\\s*;)", [h, x]), lookbehind: !0, inside: $ }, { pattern: s("(\\busing\\s+)<<0>>(?=\\s*=)", [h]), lookbehind: !0 }, { pattern: s("(\\b<<0>>\\s+)<<1>>", [d, f]), lookbehind: !0, inside: $ }, { pattern: s("(\\bcatch\\s*\\(\\s*)<<0>>", [m]), lookbehind: !0, inside: $ }, { pattern: s("(\\bwhere\\s+)<<0>>", [h]), lookbehind: !0 }, { pattern: s("(\\b(?:is(?:\\s+not)?|as)\\s+)<<0>>", [y]), lookbehind: !0, inside: $ }, { pattern: s("\\b<<0>>(?=\\s+(?!<<1>>|with\\s*\\{)<<2>>(?:\\s*[=,;:{)\\]]|\\s+(?:in|when)\\b))", [x, u, h]), inside: $ }], keyword: p, number: /(?:\b0(?:x[\da-f_]*[\da-f]|b[01_]*[01])|(?:\B\.\d+(?:_+\d+)*|\b\d+(?:_+\d+)*(?:\.\d+(?:_+\d+)*)?)(?:e[-+]?\d+(?:_+\d+)*)?)(?:[dflmu]|lu|ul)?\b/i, operator: />>=?|<<=?|[-=]>|([-+&|])\1|~|\?\?=?|[-+*/%&|^!=<>]=?/, punctuation: /\?\.?|::|[{}[\];(),.:]/ }), e.languages.insertBefore("csharp", "number", { range: { pattern: /\.\./, alias: "operator" } }), e.languages.insertBefore("csharp", "punctuation", { "named-parameter": { pattern: s("([(,]\\s*)<<0>>(?=\\s*:)", [h]), lookbehind: !0, alias: "punctuation" } }), e.languages.insertBefore("csharp", "class-name", { namespace: { pattern: s("(\\b(?:namespace|using)\\s+)<<0>>(?:\\s*\\.\\s*<<0>>)*(?=\\s*[;{])", [h]), lookbehind: !0, inside: { punctuation: /\./ } }, "type-expression": { pattern: s("(\\b(?:default|sizeof|typeof)\\s*\\(\\s*(?!\\s))(?:[^()\\s]|\\s(?!\\s)|<<0>>)*(?=\\s*\\))", [b]), lookbehind: !0, alias: "class-name", inside: $ }, "return-type": { pattern: s("<<0>>(?=\\s+(?:<<1>>\\s*(?:=>|[({]|\\.\\s*this\\s*\\[)|this\\s*\\[))", [x, m]), inside: $, alias: "class-name" }, "constructor-invocation": { pattern: s("(\\bnew\\s+)<<0>>(?=\\s*[[({])", [x]), lookbehind: !0, inside: $, alias: "class-name" }, "generic-method": { pattern: s("<<0>>\\s*<<1>>(?=\\s*\\()", [h, g]), inside: { function: s("^<<0>>", [h]), generic: { pattern: RegExp(g), alias: "class-name", inside: $ } } }, "type-list": { pattern: s("\\b((?:<<0>>\\s+<<1>>|record\\s+<<1>>\\s*<<5>>|where\\s+<<2>>)\\s*:\\s*)(?:<<3>>|<<4>>|<<1>>\\s*<<5>>|<<6>>)(?:\\s*,\\s*(?:<<3>>|<<4>>|<<6>>))*(?=\\s*(?:where|[{;]|=>|$))", [d, f, h, x, p.source, b, "\\bnew\\s*\\(\\s*\\)"]), lookbehind: !0, inside: { "record-arguments": { pattern: s("(^(?!new\\s*\\()<<0>>\\s*)<<1>>", [f, b]), lookbehind: !0, greedy: !0, inside: e.languages.csharp }, keyword: p, "class-name": { pattern: RegExp(x), greedy: !0, inside: $ }, punctuation: /[,()]/ } }, preprocessor: { pattern: /(^[\t ]*)#.*/m, lookbehind: !0, alias: "property", inside: { directive: { pattern: /(#)\b(?:define|elif|else|endif|endregion|error|if|line|nullable|pragma|region|undef|warning)\b/, lookbehind: !0, alias: "keyword" } } } }); var E = B + "|" + _, R = n("/(?![*/])|//[^\r\n]*[\r\n]|/\\*(?:[^*]|\\*(?!/))*\\*/|<<0>>", [E]), z = a(n("[^\"'/()]|<<0>>|\\(<<self>>*\\)", [R]), 2), S = "\\b(?:assembly|event|field|method|module|param|property|return|type)\\b", j = n("<<0>>(?:\\s*\\(<<1>>*\\))?", [m, z]); e.languages.insertBefore("csharp", "class-name", { attribute: { pattern: s("((?:^|[^\\s\\w>)?])\\s*\\[\\s*)(?:<<0>>\\s*:\\s*)?<<1>>(?:\\s*,\\s*<<1>>)*(?=\\s*\\])", [S, j]), lookbehind: !0, greedy: !0, inside: { target: { pattern: s("^<<0>>(?=\\s*:)", [S]), alias: "keyword" }, "attribute-arguments": { pattern: s("\\(<<0>>*\\)", [z]), inside: e.languages.csharp }, "class-name": { pattern: RegExp(m), inside: { punctuation: /\./ } }, punctuation: /[:,]/ } } }); var A = ":[^}\r\n]+", F = a(n("[^\"'/()]|<<0>>|\\(<<self>>*\\)", [R]), 2), P = n("\\{(?!\\{)(?:(?![}:])<<0>>)*<<1>>?\\}", [F, A]), U = a(n("[^\"'/()]|/(?!\\*)|/\\*(?:[^*]|\\*(?!/))*\\*/|<<0>>|\\(<<self>>*\\)", [E]), 2), Z = n("\\{(?!\\{)(?:(?![}:])<<0>>)*<<1>>?\\}", [U, A]); function q(n, a) { return { interpolation: { pattern: s("((?:^|[^{])(?:\\{\\{)*)<<0>>", [n]), lookbehind: !0, inside: { "format-string": { pattern: s("(^\\{(?:(?![}:])<<0>>)*)<<1>>(?=\\}$)", [a, A]), lookbehind: !0, inside: { punctuation: /^:/ } }, punctuation: /^\{|\}$/, expression: { pattern: /[\s\S]+/, alias: "language-csharp", inside: e.languages.csharp } } }, string: /[\s\S]+/ } } e.languages.insertBefore("csharp", "string", { "interpolation-string": [{ pattern: s('(^|[^\\\\])(?:\\$@|@\\$)"(?:""|\\\\[^]|\\{\\{|<<0>>|[^\\\\{"])*"', [P]), lookbehind: !0, greedy: !0, inside: q(P, F) }, { pattern: s('(^|[^@\\\\])\\$"(?:\\\\.|\\{\\{|<<0>>|[^\\\\"{])*"', [Z]), lookbehind: !0, greedy: !0, inside: q(Z, U) }], char: { pattern: RegExp(_), greedy: !0 } }), e.languages.dotnet = e.languages.cs = e.languages.csharp }(Prism); !function (e) { var a = [/\b(?:async|sync|yield)\*/, /\b(?:abstract|assert|async|await|break|case|catch|class|const|continue|covariant|default|deferred|do|dynamic|else|enum|export|extends|extension|external|factory|final|finally|for|get|hide|if|implements|import|in|interface|library|mixin|new|null|on|operator|part|rethrow|return|set|show|static|super|switch|sync|this|throw|try|typedef|var|void|while|with|yield)\b/], n = "(^|[^\\w.])(?:[a-z]\\w*\\s*\\.\\s*)*(?:[A-Z]\\w*\\s*\\.\\s*)*", s = { pattern: RegExp(n + "[A-Z](?:[\\d_A-Z]*[a-z]\\w*)?\\b"), lookbehind: !0, inside: { namespace: { pattern: /^[a-z]\w*(?:\s*\.\s*[a-z]\w*)*(?:\s*\.)?/, inside: { punctuation: /\./ } } } }; e.languages.dart = e.languages.extend("clike", { "class-name": [s, { pattern: RegExp(n + "[A-Z]\\w*(?=\\s+\\w+\\s*[;,=()])"), lookbehind: !0, inside: s.inside }], keyword: a, operator: /\bis!|\b(?:as|is)\b|\+\+|--|&&|\|\||<<=?|>>=?|~(?:\/=?)?|[+\-*\/%&^|=!<>]=?|\?/ }), e.languages.insertBefore("dart", "string", { "string-literal": { pattern: /r?(?:("""|''')[\s\S]*?\1|(["'])(?:\\.|(?!\2)[^\\\r\n])*\2(?!\2))/, greedy: !0, inside: { interpolation: { pattern: /((?:^|[^\\])(?:\\{2})*)\$(?:\w+|\{(?:[^{}]|\{[^{}]*\})*\})/, lookbehind: !0, inside: { punctuation: /^\$\{?|\}$/, expression: { pattern: /[\s\S]+/, inside: e.languages.dart } } }, string: /[\s\S]+/ } }, string: void 0 }), e.languages.insertBefore("dart", "class-name", { metadata: { pattern: /@\w+/, alias: "function" } }), e.languages.insertBefore("dart", "class-name", { generics: { pattern: /<(?:[\w\s,.&?]|<(?:[\w\s,.&?]|<(?:[\w\s,.&?]|<[\w\s,.&?]*>)*>)*>)*>/, inside: { "class-name": s, keyword: a, punctuation: /[<>(),.:]/, operator: /[?&|]/ } } }) }(Prism); Prism.languages.go = Prism.languages.extend("clike", { string: { pattern: /(^|[^\\])"(?:\\.|[^"\\\r\n])*"|`[^`]*`/, lookbehind: !0, greedy: !0 }, keyword: /\b(?:break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go(?:to)?|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/, boolean: /\b(?:_|false|iota|nil|true)\b/, number: [/\b0(?:b[01_]+|o[0-7_]+)i?\b/i, /\b0x(?:[a-f\d_]+(?:\.[a-f\d_]*)?|\.[a-f\d_]+)(?:p[+-]?\d+(?:_\d+)*)?i?(?!\w)/i, /(?:\b\d[\d_]*(?:\.[\d_]*)?|\B\.\d[\d_]*)(?:e[+-]?[\d_]+)?i?(?!\w)/i], operator: /[*\/%^!=]=?|\+[=+]?|-[=-]?|\|[=|]?|&(?:=|&|\^=?)?|>(?:>=?|=)?|<(?:<=?|=|-)?|:=|\.\.\./, builtin: /\b(?:append|bool|byte|cap|close|complex|complex(?:64|128)|copy|delete|error|float(?:32|64)|u?int(?:8|16|32|64)?|imag|len|make|new|panic|print(?:ln)?|real|recover|rune|string|uintptr)\b/ }), Prism.languages.insertBefore("go", "string", { char: { pattern: /'(?:\\.|[^'\\\r\n]){0,10}'/, greedy: !0 } }), delete Prism.languages.go["class-name"]; Prism.languages.graphql = { comment: /#.*/, description: { pattern: /(?:"""(?:[^"]|(?!""")")*"""|"(?:\\.|[^\\"\r\n])*")(?=\s*[a-z_])/i, greedy: !0, alias: "string", inside: { "language-markdown": { pattern: /(^"(?:"")?)(?!\1)[\s\S]+(?=\1$)/, lookbehind: !0, inside: Prism.languages.markdown } } }, string: { pattern: /"""(?:[^"]|(?!""")")*"""|"(?:\\.|[^\\"\r\n])*"/, greedy: !0 }, number: /(?:\B-|\b)\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i, boolean: /\b(?:false|true)\b/, variable: /\$[a-z_]\w*/i, directive: { pattern: /@[a-z_]\w*/i, alias: "function" }, "attr-name": { pattern: /\b[a-z_]\w*(?=\s*(?:\((?:[^()"]|"(?:\\.|[^\\"\r\n])*")*\))?:)/i, greedy: !0 }, "atom-input": { pattern: /\b[A-Z]\w*Input\b/, alias: "class-name" }, scalar: /\b(?:Boolean|Float|ID|Int|String)\b/, constant: /\b[A-Z][A-Z_\d]*\b/, "class-name": { pattern: /(\b(?:enum|implements|interface|on|scalar|type|union)\s+|&\s*|:\s*|\[)[A-Z_]\w*/, lookbehind: !0 }, fragment: { pattern: /(\bfragment\s+|\.{3}\s*(?!on\b))[a-zA-Z_]\w*/, lookbehind: !0, alias: "function" }, "definition-mutation": { pattern: /(\bmutation\s+)[a-zA-Z_]\w*/, lookbehind: !0, alias: "function" }, "definition-query": { pattern: /(\bquery\s+)[a-zA-Z_]\w*/, lookbehind: !0, alias: "function" }, keyword: /\b(?:directive|enum|extend|fragment|implements|input|interface|mutation|on|query|repeatable|scalar|schema|subscription|type|union)\b/, operator: /[!=|&]|\.{3}/, "property-query": /\w+(?=\s*\()/, object: /\w+(?=\s*\{)/, punctuation: /[!(){}\[\]:=,]/, property: /\w+/ }, Prism.hooks.add("after-tokenize", (function (n) { if ("graphql" === n.language) for (var t = n.tokens.filter((function (n) { return "string" != typeof n && "comment" !== n.type && "scalar" !== n.type })), e = 0; e < t.length;) { var a = t[e++]; if ("keyword" === a.type && "mutation" === a.content) { var r = []; if (c(["definition-mutation", "punctuation"]) && "(" === l(1).content) { e += 2; var i = f(/^\($/, /^\)$/); if (-1 === i) continue; for (; e < i; e++) { var o = l(0); "variable" === o.type && (b(o, "variable-input"), r.push(o.content)) } e = i + 1 } if (c(["punctuation", "property-query"]) && "{" === l(0).content && (e++, b(l(0), "property-mutation"), r.length > 0)) { var s = f(/^\{$/, /^\}$/); if (-1 === s) continue; for (var u = e; u < s; u++) { var p = t[u]; "variable" === p.type && r.indexOf(p.content) >= 0 && b(p, "variable-input") } } } } function l(n) { return t[e + n] } function c(n, t) { t = t || 0; for (var e = 0; e < n.length; e++) { var a = l(e + t); if (!a || a.type !== n[e]) return !1 } return !0 } function f(n, a) { for (var r = 1, i = e; i < t.length; i++) { var o = t[i], s = o.content; if ("punctuation" === o.type && "string" == typeof s) if (n.test(s)) r++; else if (a.test(s) && 0 == --r) return i } return -1 } function b(n, t) { var e = n.alias; e ? Array.isArray(e) || (n.alias = e = [e]) : n.alias = e = [], e.push(t) } })); !function (t) { function a(t) { return RegExp("(^(?:" + t + "):[ \t]*(?![ \t]))[^]+", "i") } t.languages.http = { "request-line": { pattern: /^(?:CONNECT|DELETE|GET|HEAD|OPTIONS|PATCH|POST|PRI|PUT|SEARCH|TRACE)\s(?:https?:\/\/|\/)\S*\sHTTP\/[\d.]+/m, inside: { method: { pattern: /^[A-Z]+\b/, alias: "property" }, "request-target": { pattern: /^(\s)(?:https?:\/\/|\/)\S*(?=\s)/, lookbehind: !0, alias: "url", inside: t.languages.uri }, "http-version": { pattern: /^(\s)HTTP\/[\d.]+/, lookbehind: !0, alias: "property" } } }, "response-status": { pattern: /^HTTP\/[\d.]+ \d+ .+/m, inside: { "http-version": { pattern: /^HTTP\/[\d.]+/, alias: "property" }, "status-code": { pattern: /^(\s)\d+(?=\s)/, lookbehind: !0, alias: "number" }, "reason-phrase": { pattern: /^(\s).+/, lookbehind: !0, alias: "string" } } }, header: { pattern: /^[\w-]+:.+(?:(?:\r\n?|\n)[ \t].+)*/m, inside: { "header-value": [{ pattern: a("Content-Security-Policy"), lookbehind: !0, alias: ["csp", "languages-csp"], inside: t.languages.csp }, { pattern: a("Public-Key-Pins(?:-Report-Only)?"), lookbehind: !0, alias: ["hpkp", "languages-hpkp"], inside: t.languages.hpkp }, { pattern: a("Strict-Transport-Security"), lookbehind: !0, alias: ["hsts", "languages-hsts"], inside: t.languages.hsts }, { pattern: a("[^:]+"), lookbehind: !0 }], "header-name": { pattern: /^[^:]+/, alias: "keyword" }, punctuation: /^:/ } } }; var e, n = t.languages, s = { "application/javascript": n.javascript, "application/json": n.json || n.javascript, "application/xml": n.xml, "text/xml": n.xml, "text/html": n.html, "text/css": n.css, "text/plain": n.plain }, i = { "application/json": !0, "application/xml": !0 }; function r(t) { var a = t.replace(/^[a-z]+\//, ""); return "(?:" + t + "|\\w+/(?:[\\w.-]+\\+)+" + a + "(?![+\\w.-]))" } for (var p in s) if (s[p]) { e = e || {}; var l = i[p] ? r(p) : p; e[p.replace(/\//g, "-")] = { pattern: RegExp("(content-type:\\s*" + l + "(?:(?:\r\n?|\n)[\\w-].*)*(?:\r(?:\n|(?!\n))|\n))[^ \t\\w-][^]*", "i"), lookbehind: !0, inside: s[p] } } e && t.languages.insertBefore("http", "header", e) }(Prism); !function (e) { var n = /\b(?:abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|exports|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|module|native|new|non-sealed|null|open|opens|package|permits|private|protected|provides|public|record(?!\s*[(){}[\]<>=%~.:,;?+\-*/&|^])|requires|return|sealed|short|static|strictfp|super|switch|synchronized|this|throw|throws|to|transient|transitive|try|uses|var|void|volatile|while|with|yield)\b/, t = "(?:[a-z]\\w*\\s*\\.\\s*)*(?:[A-Z]\\w*\\s*\\.\\s*)*", s = { pattern: RegExp("(^|[^\\w.])" + t + "[A-Z](?:[\\d_A-Z]*[a-z]\\w*)?\\b"), lookbehind: !0, inside: { namespace: { pattern: /^[a-z]\w*(?:\s*\.\s*[a-z]\w*)*(?:\s*\.)?/, inside: { punctuation: /\./ } }, punctuation: /\./ } }; e.languages.java = e.languages.extend("clike", { string: { pattern: /(^|[^\\])"(?:\\.|[^"\\\r\n])*"/, lookbehind: !0, greedy: !0 }, "class-name": [s, { pattern: RegExp("(^|[^\\w.])" + t + "[A-Z]\\w*(?=\\s+\\w+\\s*[;,=()]|\\s*(?:\\[[\\s,]*\\]\\s*)?::\\s*new\\b)"), lookbehind: !0, inside: s.inside }, { pattern: RegExp("(\\b(?:class|enum|extends|implements|instanceof|interface|new|record|throws)\\s+)" + t + "[A-Z]\\w*\\b"), lookbehind: !0, inside: s.inside }], keyword: n, function: [e.languages.clike.function, { pattern: /(::\s*)[a-z_]\w*/, lookbehind: !0 }], number: /\b0b[01][01_]*L?\b|\b0x(?:\.[\da-f_p+-]+|[\da-f_]+(?:\.[\da-f_p+-]+)?)\b|(?:\b\d[\d_]*(?:\.[\d_]*)?|\B\.\d[\d_]*)(?:e[+-]?\d[\d_]*)?[dfl]?/i, operator: { pattern: /(^|[^.])(?:<<=?|>>>?=?|->|--|\+\+|&&|\|\||::|[?:~]|[-+*/%&|^!=<>]=?)/m, lookbehind: !0 } }), e.languages.insertBefore("java", "string", { "triple-quoted-string": { pattern: /"""[ \t]*[\r\n](?:(?:"|"")?(?:\\.|[^"\\]))*"""/, greedy: !0, alias: "string" }, char: { pattern: /'(?:\\.|[^'\\\r\n]){1,6}'/, greedy: !0 } }), e.languages.insertBefore("java", "class-name", { annotation: { pattern: /(^|[^.])@\w+(?:\s*\.\s*\w+)*/, lookbehind: !0, alias: "punctuation" }, generics: { pattern: /<(?:[\w\s,.?]|&(?!&)|<(?:[\w\s,.?]|&(?!&)|<(?:[\w\s,.?]|&(?!&)|<(?:[\w\s,.?]|&(?!&))*>)*>)*>)*>/, inside: { "class-name": s, keyword: n, punctuation: /[<>(),.:]/, operator: /[?&|]/ } }, import: [{ pattern: RegExp("(\\bimport\\s+)" + t + "(?:[A-Z]\\w*|\\*)(?=\\s*;)"), lookbehind: !0, inside: { namespace: s.inside.namespace, punctuation: /\./, operator: /\*/, "class-name": /\w+/ } }, { pattern: RegExp("(\\bimport\\s+static\\s+)" + t + "(?:\\w+|\\*)(?=\\s*;)"), lookbehind: !0, alias: "static", inside: { namespace: s.inside.namespace, static: /\b\w+$/, punctuation: /\./, operator: /\*/, "class-name": /\w+/ } }], namespace: { pattern: RegExp("(\\b(?:exports|import(?:\\s+static)?|module|open|opens|package|provides|requires|to|transitive|uses|with)\\s+)(?!<keyword>)[a-z]\\w*(?:\\.[a-z]\\w*)*\\.?".replace(/<keyword>/g, (function () { return n.source }))), lookbehind: !0, inside: { punctuation: /\./ } } }) }(Prism); Prism.languages.json = { property: { pattern: /(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?=\s*:)/, lookbehind: !0, greedy: !0 }, string: { pattern: /(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?!\s*:)/, lookbehind: !0, greedy: !0 }, comment: { pattern: /\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/, greedy: !0 }, number: /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i, punctuation: /[{}[\],]/, operator: /:/, boolean: /\b(?:false|true)\b/, null: { pattern: /\bnull\b/, alias: "keyword" } }, Prism.languages.webmanifest = Prism.languages.json; !function (n) { n.languages.kotlin = n.languages.extend("clike", { keyword: { pattern: /(^|[^.])\b(?:abstract|actual|annotation|as|break|by|catch|class|companion|const|constructor|continue|crossinline|data|do|dynamic|else|enum|expect|external|final|finally|for|fun|get|if|import|in|infix|init|inline|inner|interface|internal|is|lateinit|noinline|null|object|open|operator|out|override|package|private|protected|public|reified|return|sealed|set|super|suspend|tailrec|this|throw|to|try|typealias|val|var|vararg|when|where|while)\b/, lookbehind: !0 }, function: [{ pattern: /(?:`[^\r\n`]+`|\b\w+)(?=\s*\()/, greedy: !0 }, { pattern: /(\.)(?:`[^\r\n`]+`|\w+)(?=\s*\{)/, lookbehind: !0, greedy: !0 }], number: /\b(?:0[xX][\da-fA-F]+(?:_[\da-fA-F]+)*|0[bB][01]+(?:_[01]+)*|\d+(?:_\d+)*(?:\.\d+(?:_\d+)*)?(?:[eE][+-]?\d+(?:_\d+)*)?[fFL]?)\b/, operator: /\+[+=]?|-[-=>]?|==?=?|!(?:!|==?)?|[\/*%<>]=?|[?:]:?|\.\.|&&|\|\||\b(?:and|inv|or|shl|shr|ushr|xor)\b/ }), delete n.languages.kotlin["class-name"]; var e = { "interpolation-punctuation": { pattern: /^\$\{?|\}$/, alias: "punctuation" }, expression: { pattern: /[\s\S]+/, inside: n.languages.kotlin } }; n.languages.insertBefore("kotlin", "string", { "string-literal": [{ pattern: /"""(?:[^$]|\$(?:(?!\{)|\{[^{}]*\}))*?"""/, alias: "multiline", inside: { interpolation: { pattern: /\$(?:[a-z_]\w*|\{[^{}]*\})/i, inside: e }, string: /[\s\S]+/ } }, { pattern: /"(?:[^"\\\r\n$]|\\.|\$(?:(?!\{)|\{[^{}]*\}))*"/, alias: "singleline", inside: { interpolation: { pattern: /((?:^|[^\\])(?:\\{2})*)\$(?:[a-z_]\w*|\{[^{}]*\})/i, lookbehind: !0, inside: e }, string: /[\s\S]+/ } }], char: { pattern: /'(?:[^'\\\r\n]|\\(?:.|u[a-fA-F0-9]{0,4}))'/, greedy: !0 } }), delete n.languages.kotlin.string, n.languages.insertBefore("kotlin", "keyword", { annotation: { pattern: /\B@(?:\w+:)?(?:[A-Z]\w*|\[[^\]]+\])/, alias: "builtin" } }), n.languages.insertBefore("kotlin", "function", { label: { pattern: /\b\w+@|@\w+\b/, alias: "symbol" } }), n.languages.kt = n.languages.kotlin, n.languages.kts = n.languages.kotlin }(Prism); !function (e) { function n(e, n) { return "___" + e.toUpperCase() + n + "___" } Object.defineProperties(e.languages["markup-templating"] = {}, { buildPlaceholders: { value: function (t, a, r, o) { if (t.language === a) { var c = t.tokenStack = []; t.code = t.code.replace(r, (function (e) { if ("function" == typeof o && !o(e)) return e; for (var r, i = c.length; -1 !== t.code.indexOf(r = n(a, i));)++i; return c[i] = e, r })), t.grammar = e.languages.markup } } }, tokenizePlaceholders: { value: function (t, a) { if (t.language === a && t.tokenStack) { t.grammar = e.languages[a]; var r = 0, o = Object.keys(t.tokenStack); !function c(i) { for (var u = 0; u < i.length && !(r >= o.length); u++) { var g = i[u]; if ("string" == typeof g || g.content && "string" == typeof g.content) { var l = o[r], s = t.tokenStack[l], f = "string" == typeof g ? g : g.content, p = n(a, l), k = f.indexOf(p); if (k > -1) { ++r; var m = f.substring(0, k), d = new e.Token(a, e.tokenize(s, t.grammar), "language-" + a, s), h = f.substring(k + p.length), v = []; m && v.push.apply(v, c([m])), v.push(d), h && v.push.apply(v, c([h])), "string" == typeof g ? i.splice.apply(i, [u, 1].concat(v)) : g.content = v } } else g.content && c(g.content) } return i }(t.tokens) } } } }) }(Prism); !function (e) { var a = /\/\*[\s\S]*?\*\/|\/\/.*|#(?!\[).*/, t = [{ pattern: /\b(?:false|true)\b/i, alias: "boolean" }, { pattern: /(::\s*)\b[a-z_]\w*\b(?!\s*\()/i, greedy: !0, lookbehind: !0 }, { pattern: /(\b(?:case|const)\s+)\b[a-z_]\w*(?=\s*[;=])/i, greedy: !0, lookbehind: !0 }, /\b(?:null)\b/i, /\b[A-Z_][A-Z0-9_]*\b(?!\s*\()/], i = /\b0b[01]+(?:_[01]+)*\b|\b0o[0-7]+(?:_[0-7]+)*\b|\b0x[\da-f]+(?:_[\da-f]+)*\b|(?:\b\d+(?:_\d+)*\.?(?:\d+(?:_\d+)*)?|\B\.\d+)(?:e[+-]?\d+)?/i, n = /<?=>|\?\?=?|\.{3}|\??->|[!=]=?=?|::|\*\*=?|--|\+\+|&&|\|\||<<|>>|[?~]|[/^|%*&<>.+-]=?/, s = /[{}\[\](),:;]/; e.languages.php = { delimiter: { pattern: /\?>$|^<\?(?:php(?=\s)|=)?/i, alias: "important" }, comment: a, variable: /\$+(?:\w+\b|(?=\{))/, package: { pattern: /(namespace\s+|use\s+(?:function\s+)?)(?:\\?\b[a-z_]\w*)+\b(?!\\)/i, lookbehind: !0, inside: { punctuation: /\\/ } }, "class-name-definition": { pattern: /(\b(?:class|enum|interface|trait)\s+)\b[a-z_]\w*(?!\\)\b/i, lookbehind: !0, alias: "class-name" }, "function-definition": { pattern: /(\bfunction\s+)[a-z_]\w*(?=\s*\()/i, lookbehind: !0, alias: "function" }, keyword: [{ pattern: /(\(\s*)\b(?:array|bool|boolean|float|int|integer|object|string)\b(?=\s*\))/i, alias: "type-casting", greedy: !0, lookbehind: !0 }, { pattern: /([(,?]\s*)\b(?:array(?!\s*\()|bool|callable|(?:false|null)(?=\s*\|)|float|int|iterable|mixed|object|self|static|string)\b(?=\s*\$)/i, alias: "type-hint", greedy: !0, lookbehind: !0 }, { pattern: /(\)\s*:\s*(?:\?\s*)?)\b(?:array(?!\s*\()|bool|callable|(?:false|null)(?=\s*\|)|float|int|iterable|mixed|never|object|self|static|string|void)\b/i, alias: "return-type", greedy: !0, lookbehind: !0 }, { pattern: /\b(?:array(?!\s*\()|bool|float|int|iterable|mixed|object|string|void)\b/i, alias: "type-declaration", greedy: !0 }, { pattern: /(\|\s*)(?:false|null)\b|\b(?:false|null)(?=\s*\|)/i, alias: "type-declaration", greedy: !0, lookbehind: !0 }, { pattern: /\b(?:parent|self|static)(?=\s*::)/i, alias: "static-context", greedy: !0 }, { pattern: /(\byield\s+)from\b/i, lookbehind: !0 }, /\bclass\b/i, { pattern: /((?:^|[^\s>:]|(?:^|[^-])>|(?:^|[^:]):)\s*)\b(?:abstract|and|array|as|break|callable|case|catch|clone|const|continue|declare|default|die|do|echo|else|elseif|empty|enddeclare|endfor|endforeach|endif|endswitch|endwhile|enum|eval|exit|extends|final|finally|fn|for|foreach|function|global|goto|if|implements|include|include_once|instanceof|insteadof|interface|isset|list|match|namespace|never|new|or|parent|print|private|protected|public|readonly|require|require_once|return|self|static|switch|throw|trait|try|unset|use|var|while|xor|yield|__halt_compiler)\b/i, lookbehind: !0 }], "argument-name": { pattern: /([(,]\s*)\b[a-z_]\w*(?=\s*:(?!:))/i, lookbehind: !0 }, "class-name": [{ pattern: /(\b(?:extends|implements|instanceof|new(?!\s+self|\s+static))\s+|\bcatch\s*\()\b[a-z_]\w*(?!\\)\b/i, greedy: !0, lookbehind: !0 }, { pattern: /(\|\s*)\b[a-z_]\w*(?!\\)\b/i, greedy: !0, lookbehind: !0 }, { pattern: /\b[a-z_]\w*(?!\\)\b(?=\s*\|)/i, greedy: !0 }, { pattern: /(\|\s*)(?:\\?\b[a-z_]\w*)+\b/i, alias: "class-name-fully-qualified", greedy: !0, lookbehind: !0, inside: { punctuation: /\\/ } }, { pattern: /(?:\\?\b[a-z_]\w*)+\b(?=\s*\|)/i, alias: "class-name-fully-qualified", greedy: !0, inside: { punctuation: /\\/ } }, { pattern: /(\b(?:extends|implements|instanceof|new(?!\s+self\b|\s+static\b))\s+|\bcatch\s*\()(?:\\?\b[a-z_]\w*)+\b(?!\\)/i, alias: "class-name-fully-qualified", greedy: !0, lookbehind: !0, inside: { punctuation: /\\/ } }, { pattern: /\b[a-z_]\w*(?=\s*\$)/i, alias: "type-declaration", greedy: !0 }, { pattern: /(?:\\?\b[a-z_]\w*)+(?=\s*\$)/i, alias: ["class-name-fully-qualified", "type-declaration"], greedy: !0, inside: { punctuation: /\\/ } }, { pattern: /\b[a-z_]\w*(?=\s*::)/i, alias: "static-context", greedy: !0 }, { pattern: /(?:\\?\b[a-z_]\w*)+(?=\s*::)/i, alias: ["class-name-fully-qualified", "static-context"], greedy: !0, inside: { punctuation: /\\/ } }, { pattern: /([(,?]\s*)[a-z_]\w*(?=\s*\$)/i, alias: "type-hint", greedy: !0, lookbehind: !0 }, { pattern: /([(,?]\s*)(?:\\?\b[a-z_]\w*)+(?=\s*\$)/i, alias: ["class-name-fully-qualified", "type-hint"], greedy: !0, lookbehind: !0, inside: { punctuation: /\\/ } }, { pattern: /(\)\s*:\s*(?:\?\s*)?)\b[a-z_]\w*(?!\\)\b/i, alias: "return-type", greedy: !0, lookbehind: !0 }, { pattern: /(\)\s*:\s*(?:\?\s*)?)(?:\\?\b[a-z_]\w*)+\b(?!\\)/i, alias: ["class-name-fully-qualified", "return-type"], greedy: !0, lookbehind: !0, inside: { punctuation: /\\/ } }], constant: t, function: { pattern: /(^|[^\\\w])\\?[a-z_](?:[\w\\]*\w)?(?=\s*\()/i, lookbehind: !0, inside: { punctuation: /\\/ } }, property: { pattern: /(->\s*)\w+/, lookbehind: !0 }, number: i, operator: n, punctuation: s }; var l = { pattern: /\{\$(?:\{(?:\{[^{}]+\}|[^{}]+)\}|[^{}])+\}|(^|[^\\{])\$+(?:\w+(?:\[[^\r\n\[\]]+\]|->\w+)?)/, lookbehind: !0, inside: e.languages.php }, r = [{ pattern: /<<<'([^']+)'[\r\n](?:.*[\r\n])*?\1;/, alias: "nowdoc-string", greedy: !0, inside: { delimiter: { pattern: /^<<<'[^']+'|[a-z_]\w*;$/i, alias: "symbol", inside: { punctuation: /^<<<'?|[';]$/ } } } }, { pattern: /<<<(?:"([^"]+)"[\r\n](?:.*[\r\n])*?\1;|([a-z_]\w*)[\r\n](?:.*[\r\n])*?\2;)/i, alias: "heredoc-string", greedy: !0, inside: { delimiter: { pattern: /^<<<(?:"[^"]+"|[a-z_]\w*)|[a-z_]\w*;$/i, alias: "symbol", inside: { punctuation: /^<<<"?|[";]$/ } }, interpolation: l } }, { pattern: /`(?:\\[\s\S]|[^\\`])*`/, alias: "backtick-quoted-string", greedy: !0 }, { pattern: /'(?:\\[\s\S]|[^\\'])*'/, alias: "single-quoted-string", greedy: !0 }, { pattern: /"(?:\\[\s\S]|[^\\"])*"/, alias: "double-quoted-string", greedy: !0, inside: { interpolation: l } }]; e.languages.insertBefore("php", "variable", { string: r, attribute: { pattern: /#\[(?:[^"'\/#]|\/(?![*/])|\/\/.*$|#(?!\[).*$|\/\*(?:[^*]|\*(?!\/))*\*\/|"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*')+\](?=\s*[a-z$#])/im, greedy: !0, inside: { "attribute-content": { pattern: /^(#\[)[\s\S]+(?=\]$)/, lookbehind: !0, inside: { comment: a, string: r, "attribute-class-name": [{ pattern: /([^:]|^)\b[a-z_]\w*(?!\\)\b/i, alias: "class-name", greedy: !0, lookbehind: !0 }, { pattern: /([^:]|^)(?:\\?\b[a-z_]\w*)+/i, alias: ["class-name", "class-name-fully-qualified"], greedy: !0, lookbehind: !0, inside: { punctuation: /\\/ } }], constant: t, number: i, operator: n, punctuation: s } }, delimiter: { pattern: /^#\[|\]$/, alias: "punctuation" } } } }), e.hooks.add("before-tokenize", (function (a) { /<\?/.test(a.code) && e.languages["markup-templating"].buildPlaceholders(a, "php", /<\?(?:[^"'/#]|\/(?![*/])|("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|(?:\/\/|#(?!\[))(?:[^?\n\r]|\?(?!>))*(?=$|\?>|[\r\n])|#\[|\/\*(?:[^*]|\*(?!\/))*(?:\*\/|$))*?(?:\?>|$)/g) })), e.hooks.add("after-tokenize", (function (a) { e.languages["markup-templating"].tokenizePlaceholders(a, "php") })) }(Prism); !function (e) { var i = e.languages.powershell = { comment: [{ pattern: /(^|[^`])<#[\s\S]*?#>/, lookbehind: !0 }, { pattern: /(^|[^`])#.*/, lookbehind: !0 }], string: [{ pattern: /"(?:`[\s\S]|[^`"])*"/, greedy: !0, inside: null }, { pattern: /'(?:[^']|'')*'/, greedy: !0 }], namespace: /\[[a-z](?:\[(?:\[[^\]]*\]|[^\[\]])*\]|[^\[\]])*\]/i, boolean: /\$(?:false|true)\b/i, variable: /\$\w+\b/, function: [/\b(?:Add|Approve|Assert|Backup|Block|Checkpoint|Clear|Close|Compare|Complete|Compress|Confirm|Connect|Convert|ConvertFrom|ConvertTo|Copy|Debug|Deny|Disable|Disconnect|Dismount|Edit|Enable|Enter|Exit|Expand|Export|Find|ForEach|Format|Get|Grant|Group|Hide|Import|Initialize|Install|Invoke|Join|Limit|Lock|Measure|Merge|Move|New|Open|Optimize|Out|Ping|Pop|Protect|Publish|Push|Read|Receive|Redo|Register|Remove|Rename|Repair|Request|Reset|Resize|Resolve|Restart|Restore|Resume|Revoke|Save|Search|Select|Send|Set|Show|Skip|Sort|Split|Start|Step|Stop|Submit|Suspend|Switch|Sync|Tee|Test|Trace|Unblock|Undo|Uninstall|Unlock|Unprotect|Unpublish|Unregister|Update|Use|Wait|Watch|Where|Write)-[a-z]+\b/i, /\b(?:ac|cat|chdir|clc|cli|clp|clv|compare|copy|cp|cpi|cpp|cvpa|dbp|del|diff|dir|ebp|echo|epal|epcsv|epsn|erase|fc|fl|ft|fw|gal|gbp|gc|gci|gcs|gdr|gi|gl|gm|gp|gps|group|gsv|gu|gv|gwmi|iex|ii|ipal|ipcsv|ipsn|irm|iwmi|iwr|kill|lp|ls|measure|mi|mount|move|mp|mv|nal|ndr|ni|nv|ogv|popd|ps|pushd|pwd|rbp|rd|rdr|ren|ri|rm|rmdir|rni|rnp|rp|rv|rvpa|rwmi|sal|saps|sasv|sbp|sc|select|set|shcm|si|sl|sleep|sls|sort|sp|spps|spsv|start|sv|swmi|tee|trcm|type|write)\b/i], keyword: /\b(?:Begin|Break|Catch|Class|Continue|Data|Define|Do|DynamicParam|Else|ElseIf|End|Exit|Filter|Finally|For|ForEach|From|Function|If|InlineScript|Parallel|Param|Process|Return|Sequence|Switch|Throw|Trap|Try|Until|Using|Var|While|Workflow)\b/i, operator: { pattern: /(^|\W)(?:!|-(?:b?(?:and|x?or)|as|(?:Not)?(?:Contains|In|Like|Match)|eq|ge|gt|is(?:Not)?|Join|le|lt|ne|not|Replace|sh[lr])\b|-[-=]?|\+[+=]?|[*\/%]=?)/i, lookbehind: !0 }, punctuation: /[|{}[\];(),.]/ }; i.string[0].inside = { function: { pattern: /(^|[^`])\$\((?:\$\([^\r\n()]*\)|(?!\$\()[^\r\n)])*\)/, lookbehind: !0, inside: i }, boolean: i.boolean, variable: i.variable } }(Prism); Prism.languages.python = { comment: { pattern: /(^|[^\\])#.*/, lookbehind: !0, greedy: !0 }, "string-interpolation": { pattern: /(?:f|fr|rf)(?:("""|''')[\s\S]*?\1|("|')(?:\\.|(?!\2)[^\\\r\n])*\2)/i, greedy: !0, inside: { interpolation: { pattern: /((?:^|[^{])(?:\{\{)*)\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}])+\})+\})+\}/, lookbehind: !0, inside: { "format-spec": { pattern: /(:)[^:(){}]+(?=\}$)/, lookbehind: !0 }, "conversion-option": { pattern: /![sra](?=[:}]$)/, alias: "punctuation" }, rest: null } }, string: /[\s\S]+/ } }, "triple-quoted-string": { pattern: /(?:[rub]|br|rb)?("""|''')[\s\S]*?\1/i, greedy: !0, alias: "string" }, string: { pattern: /(?:[rub]|br|rb)?("|')(?:\\.|(?!\1)[^\\\r\n])*\1/i, greedy: !0 }, function: { pattern: /((?:^|\s)def[ \t]+)[a-zA-Z_]\w*(?=\s*\()/g, lookbehind: !0 }, "class-name": { pattern: /(\bclass\s+)\w+/i, lookbehind: !0 }, decorator: { pattern: /(^[\t ]*)@\w+(?:\.\w+)*/m, lookbehind: !0, alias: ["annotation", "punctuation"], inside: { punctuation: /\./ } }, keyword: /\b(?:_(?=\s*:)|and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|match|nonlocal|not|or|pass|print|raise|return|try|while|with|yield)\b/, builtin: /\b(?:__import__|abs|all|any|apply|ascii|basestring|bin|bool|buffer|bytearray|bytes|callable|chr|classmethod|cmp|coerce|compile|complex|delattr|dict|dir|divmod|enumerate|eval|execfile|file|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|intern|isinstance|issubclass|iter|len|list|locals|long|map|max|memoryview|min|next|object|oct|open|ord|pow|property|range|raw_input|reduce|reload|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|unichr|unicode|vars|xrange|zip)\b/, boolean: /\b(?:False|None|True)\b/, number: /\b0(?:b(?:_?[01])+|o(?:_?[0-7])+|x(?:_?[a-f0-9])+)\b|(?:\b\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\B\.\d+(?:_\d+)*)(?:e[+-]?\d+(?:_\d+)*)?j?(?!\w)/i, operator: /[-+%=]=?|!=|:=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]/, punctuation: /[{}[\];(),.:]/ }, Prism.languages.python["string-interpolation"].inside.interpolation.inside.rest = Prism.languages.python, Prism.languages.py = Prism.languages.python; !function (e) { e.languages.ruby = e.languages.extend("clike", { comment: { pattern: /#.*|^=begin\s[\s\S]*?^=end/m, greedy: !0 }, "class-name": { pattern: /(\b(?:class|module)\s+|\bcatch\s+\()[\w.\\]+|\b[A-Z_]\w*(?=\s*\.\s*new\b)/, lookbehind: !0, inside: { punctuation: /[.\\]/ } }, keyword: /\b(?:BEGIN|END|alias|and|begin|break|case|class|def|define_method|defined|do|each|else|elsif|end|ensure|extend|for|if|in|include|module|new|next|nil|not|or|prepend|private|protected|public|raise|redo|require|rescue|retry|return|self|super|then|throw|undef|unless|until|when|while|yield)\b/, operator: /\.{2,3}|&\.|===|<?=>|[!=]?~|(?:&&|\|\||<<|>>|\*\*|[+\-*/%<>!^&|=])=?|[?:]/, punctuation: /[(){}[\].,;]/ }), e.languages.insertBefore("ruby", "operator", { "double-colon": { pattern: /::/, alias: "punctuation" } }); var n = { pattern: /((?:^|[^\\])(?:\\{2})*)#\{(?:[^{}]|\{[^{}]*\})*\}/, lookbehind: !0, inside: { content: { pattern: /^(#\{)[\s\S]+(?=\}$)/, lookbehind: !0, inside: e.languages.ruby }, delimiter: { pattern: /^#\{|\}$/, alias: "punctuation" } } }; delete e.languages.ruby.function; var t = "(?:" + ["([^a-zA-Z0-9\\s{(\\[<=])(?:(?!\\1)[^\\\\]|\\\\[^])*\\1", "\\((?:[^()\\\\]|\\\\[^]|\\((?:[^()\\\\]|\\\\[^])*\\))*\\)", "\\{(?:[^{}\\\\]|\\\\[^]|\\{(?:[^{}\\\\]|\\\\[^])*\\})*\\}", "\\[(?:[^\\[\\]\\\\]|\\\\[^]|\\[(?:[^\\[\\]\\\\]|\\\\[^])*\\])*\\]", "<(?:[^<>\\\\]|\\\\[^]|<(?:[^<>\\\\]|\\\\[^])*>)*>"].join("|") + ")", i = '(?:"(?:\\\\.|[^"\\\\\r\n])*"|(?:\\b[a-zA-Z_]\\w*|[^\\s\0-\\x7F]+)[?!]?|\\$.)'; e.languages.insertBefore("ruby", "keyword", { "regex-literal": [{ pattern: RegExp("%r" + t + "[egimnosux]{0,6}"), greedy: !0, inside: { interpolation: n, regex: /[\s\S]+/ } }, { pattern: /(^|[^/])\/(?!\/)(?:\[[^\r\n\]]+\]|\\.|[^[/\\\r\n])+\/[egimnosux]{0,6}(?=\s*(?:$|[\r\n,.;})#]))/, lookbehind: !0, greedy: !0, inside: { interpolation: n, regex: /[\s\S]+/ } }], variable: /[@$]+[a-zA-Z_]\w*(?:[?!]|\b)/, symbol: [{ pattern: RegExp("(^|[^:]):" + i), lookbehind: !0, greedy: !0 }, { pattern: RegExp("([\r\n{(,][ \t]*)" + i + "(?=:(?!:))"), lookbehind: !0, greedy: !0 }], "method-definition": { pattern: /(\bdef\s+)\w+(?:\s*\.\s*\w+)?/, lookbehind: !0, inside: { function: /\b\w+$/, keyword: /^self\b/, "class-name": /^\w+/, punctuation: /\./ } } }), e.languages.insertBefore("ruby", "string", { "string-literal": [{ pattern: RegExp("%[qQiIwWs]?" + t), greedy: !0, inside: { interpolation: n, string: /[\s\S]+/ } }, { pattern: /("|')(?:#\{[^}]+\}|#(?!\{)|\\(?:\r\n|[\s\S])|(?!\1)[^\\#\r\n])*\1/, greedy: !0, inside: { interpolation: n, string: /[\s\S]+/ } }, { pattern: /<<[-~]?([a-z_]\w*)[\r\n](?:.*[\r\n])*?[\t ]*\1/i, alias: "heredoc-string", greedy: !0, inside: { delimiter: { pattern: /^<<[-~]?[a-z_]\w*|\b[a-z_]\w*$/i, inside: { symbol: /\b\w+/, punctuation: /^<<[-~]?/ } }, interpolation: n, string: /[\s\S]+/ } }, { pattern: /<<[-~]?'([a-z_]\w*)'[\r\n](?:.*[\r\n])*?[\t ]*\1/i, alias: "heredoc-string", greedy: !0, inside: { delimiter: { pattern: /^<<[-~]?'[a-z_]\w*'|\b[a-z_]\w*$/i, inside: { symbol: /\b\w+/, punctuation: /^<<[-~]?'|'$/ } }, string: /[\s\S]+/ } }], "command-literal": [{ pattern: RegExp("%x" + t), greedy: !0, inside: { interpolation: n, command: { pattern: /[\s\S]+/, alias: "string" } } }, { pattern: /`(?:#\{[^}]+\}|#(?!\{)|\\(?:\r\n|[\s\S])|[^\\`#\r\n])*`/, greedy: !0, inside: { interpolation: n, command: { pattern: /[\s\S]+/, alias: "string" } } }] }), delete e.languages.ruby.string, e.languages.insertBefore("ruby", "number", { builtin: /\b(?:Array|Bignum|Binding|Class|Continuation|Dir|Exception|FalseClass|File|Fixnum|Float|Hash|IO|Integer|MatchData|Method|Module|NilClass|Numeric|Object|Proc|Range|Regexp|Stat|String|Struct|Symbol|TMS|Thread|ThreadGroup|Time|TrueClass)\b/, constant: /\b[A-Z][A-Z0-9_]*(?:[?!]|\b)/ }), e.languages.rb = e.languages.ruby }(Prism); Prism.languages.swift = { comment: { pattern: /(^|[^\\:])(?:\/\/.*|\/\*(?:[^/*]|\/(?!\*)|\*(?!\/)|\/\*(?:[^*]|\*(?!\/))*\*\/)*\*\/)/, lookbehind: !0, greedy: !0 }, "string-literal": [{ pattern: RegExp('(^|[^"#])(?:"(?:\\\\(?:\\((?:[^()]|\\([^()]*\\))*\\)|\r\n|[^(])|[^\\\\\r\n"])*"|"""(?:\\\\(?:\\((?:[^()]|\\([^()]*\\))*\\)|[^(])|[^\\\\"]|"(?!""))*""")(?!["#])'), lookbehind: !0, greedy: !0, inside: { interpolation: { pattern: /(\\\()(?:[^()]|\([^()]*\))*(?=\))/, lookbehind: !0, inside: null }, "interpolation-punctuation": { pattern: /^\)|\\\($/, alias: "punctuation" }, punctuation: /\\(?=[\r\n])/, string: /[\s\S]+/ } }, { pattern: RegExp('(^|[^"#])(#+)(?:"(?:\\\\(?:#+\\((?:[^()]|\\([^()]*\\))*\\)|\r\n|[^#])|[^\\\\\r\n])*?"|"""(?:\\\\(?:#+\\((?:[^()]|\\([^()]*\\))*\\)|[^#])|[^\\\\])*?""")\\2'), lookbehind: !0, greedy: !0, inside: { interpolation: { pattern: /(\\#+\()(?:[^()]|\([^()]*\))*(?=\))/, lookbehind: !0, inside: null }, "interpolation-punctuation": { pattern: /^\)|\\#+\($/, alias: "punctuation" }, string: /[\s\S]+/ } }], directive: { pattern: RegExp("#(?:(?:elseif|if)\\b(?:[ \t]*(?:![ \t]*)?(?:\\b\\w+\\b(?:[ \t]*\\((?:[^()]|\\([^()]*\\))*\\))?|\\((?:[^()]|\\([^()]*\\))*\\))(?:[ \t]*(?:&&|\\|\\|))?)+|(?:else|endif)\\b)"), alias: "property", inside: { "directive-name": /^#\w+/, boolean: /\b(?:false|true)\b/, number: /\b\d+(?:\.\d+)*\b/, operator: /!|&&|\|\||[<>]=?/, punctuation: /[(),]/ } }, literal: { pattern: /#(?:colorLiteral|column|dsohandle|file(?:ID|Literal|Path)?|function|imageLiteral|line)\b/, alias: "constant" }, "other-directive": { pattern: /#\w+\b/, alias: "property" }, attribute: { pattern: /@\w+/, alias: "atrule" }, "function-definition": { pattern: /(\bfunc\s+)\w+/, lookbehind: !0, alias: "function" }, label: { pattern: /\b(break|continue)\s+\w+|\b[a-zA-Z_]\w*(?=\s*:\s*(?:for|repeat|while)\b)/, lookbehind: !0, alias: "important" }, keyword: /\b(?:Any|Protocol|Self|Type|actor|as|assignment|associatedtype|associativity|async|await|break|case|catch|class|continue|convenience|default|defer|deinit|didSet|do|dynamic|else|enum|extension|fallthrough|fileprivate|final|for|func|get|guard|higherThan|if|import|in|indirect|infix|init|inout|internal|is|isolated|lazy|left|let|lowerThan|mutating|none|nonisolated|nonmutating|open|operator|optional|override|postfix|precedencegroup|prefix|private|protocol|public|repeat|required|rethrows|return|right|safe|self|set|some|static|struct|subscript|super|switch|throw|throws|try|typealias|unowned|unsafe|var|weak|where|while|willSet)\b/, boolean: /\b(?:false|true)\b/, nil: { pattern: /\bnil\b/, alias: "constant" }, "short-argument": /\$\d+\b/, omit: { pattern: /\b_\b/, alias: "keyword" }, number: /\b(?:[\d_]+(?:\.[\de_]+)?|0x[a-f0-9_]+(?:\.[a-f0-9p_]+)?|0b[01_]+|0o[0-7_]+)\b/i, "class-name": /\b[A-Z](?:[A-Z_\d]*[a-z]\w*)?\b/, function: /\b[a-z_]\w*(?=\s*\()/i, constant: /\b(?:[A-Z_]{2,}|k[A-Z][A-Za-z_]+)\b/, operator: /[-+*/%=!<>&|^~?]+|\.[.\-+*/%=!<>&|^~?]+/, punctuation: /[{}[\]();,.:\\]/ }, Prism.languages.swift["string-literal"].forEach((function (e) { e.inside.interpolation.inside = Prism.languages.swift })); !function (e) { e.languages.typescript = e.languages.extend("javascript", { "class-name": { pattern: /(\b(?:class|extends|implements|instanceof|interface|new|type)\s+)(?!keyof\b)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?:\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>)?/, lookbehind: !0, greedy: !0, inside: null }, builtin: /\b(?:Array|Function|Promise|any|boolean|console|never|number|string|symbol|unknown)\b/ }), e.languages.typescript.keyword.push(/\b(?:abstract|declare|is|keyof|readonly|require)\b/, /\b(?:asserts|infer|interface|module|namespace|type)\b(?=\s*(?:[{_$a-zA-Z\xA0-\uFFFF]|$))/, /\btype\b(?=\s*(?:[\{*]|$))/), delete e.languages.typescript.parameter, delete e.languages.typescript["literal-property"]; var s = e.languages.extend("typescript", {}); delete s["class-name"], e.languages.typescript["class-name"].inside = s, e.languages.insertBefore("typescript", "function", { decorator: { pattern: /@[$\w\xA0-\uFFFF]+/, inside: { at: { pattern: /^@/, alias: "operator" }, function: /^[\s\S]+/ } }, "generic-function": { pattern: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>(?=\s*\()/, greedy: !0, inside: { function: /^#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*/, generic: { pattern: /<[\s\S]+/, alias: "class-name", inside: s } } } }), e.languages.ts = e.languages.typescript }(Prism); !function (e) { var n = /[*&][^\s[\]{},]+/, r = /!(?:<[\w\-%#;/?:@&=+$,.!~*'()[\]]+>|(?:[a-zA-Z\d-]*!)?[\w\-%#;/?:@&=+$.~*'()]+)?/, t = "(?:" + r.source + "(?:[ \t]+" + n.source + ")?|" + n.source + "(?:[ \t]+" + r.source + ")?)", a = "(?:[^\\s\\x00-\\x08\\x0e-\\x1f!\"#%&'*,\\-:>?@[\\]`{|}\\x7f-\\x84\\x86-\\x9f\\ud800-\\udfff\\ufffe\\uffff]|[?:-]<PLAIN>)(?:[ \t]*(?:(?![#:])<PLAIN>|:<PLAIN>))*".replace(/<PLAIN>/g, (function () { return "[^\\s\\x00-\\x08\\x0e-\\x1f,[\\]{}\\x7f-\\x84\\x86-\\x9f\\ud800-\\udfff\\ufffe\\uffff]" })), d = "\"(?:[^\"\\\\\r\n]|\\\\.)*\"|'(?:[^'\\\\\r\n]|\\\\.)*'"; function o(e, n) { n = (n || "").replace(/m/g, "") + "m"; var r = "([:\\-,[{]\\s*(?:\\s<<prop>>[ \t]+)?)(?:<<value>>)(?=[ \t]*(?:$|,|\\]|\\}|(?:[\r\n]\\s*)?#))".replace(/<<prop>>/g, (function () { return t })).replace(/<<value>>/g, (function () { return e })); return RegExp(r, n) } e.languages.yaml = { scalar: { pattern: RegExp("([\\-:]\\s*(?:\\s<<prop>>[ \t]+)?[|>])[ \t]*(?:((?:\r?\n|\r)[ \t]+)\\S[^\r\n]*(?:\\2[^\r\n]+)*)".replace(/<<prop>>/g, (function () { return t }))), lookbehind: !0, alias: "string" }, comment: /#.*/, key: { pattern: RegExp("((?:^|[:\\-,[{\r\n?])[ \t]*(?:<<prop>>[ \t]+)?)<<key>>(?=\\s*:\\s)".replace(/<<prop>>/g, (function () { return t })).replace(/<<key>>/g, (function () { return "(?:" + a + "|" + d + ")" }))), lookbehind: !0, greedy: !0, alias: "atrule" }, directive: { pattern: /(^[ \t]*)%.+/m, lookbehind: !0, alias: "important" }, datetime: { pattern: o("\\d{4}-\\d\\d?-\\d\\d?(?:[tT]|[ \t]+)\\d\\d?:\\d{2}:\\d{2}(?:\\.\\d*)?(?:[ \t]*(?:Z|[-+]\\d\\d?(?::\\d{2})?))?|\\d{4}-\\d{2}-\\d{2}|\\d\\d?:\\d{2}(?::\\d{2}(?:\\.\\d*)?)?"), lookbehind: !0, alias: "number" }, boolean: { pattern: o("false|true", "i"), lookbehind: !0, alias: "important" }, null: { pattern: o("null|~", "i"), lookbehind: !0, alias: "important" }, string: { pattern: o(d), lookbehind: !0, greedy: !0 }, number: { pattern: o("[+-]?(?:0x[\\da-f]+|0o[0-7]+|(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?|\\.inf|\\.nan)", "i"), lookbehind: !0 }, tag: r, important: n, punctuation: /---|[:[\]{}\-,|>?]|\.\.\./ }, e.languages.yml = e.languages.yaml }(Prism); !function () { if ("undefined" != typeof Prism && "undefined" != typeof document) { var e = "line-numbers", n = /\n(?!$)/g, t = Prism.plugins.lineNumbers = { getLine: function (n, t) { if ("PRE" === n.tagName && n.classList.contains(e)) { var i = n.querySelector(".line-numbers-rows"); if (i) { var r = parseInt(n.getAttribute("data-start"), 10) || 1, s = r + (i.children.length - 1); t < r && (t = r), t > s && (t = s); var l = t - r; return i.children[l] } } }, resize: function (e) { r([e]) }, assumeViewportIndependence: !0 }, i = void 0; window.addEventListener("resize", (function () { t.assumeViewportIndependence && i === window.innerWidth || (i = window.innerWidth, r(Array.prototype.slice.call(document.querySelectorAll("pre.line-numbers")))) })), Prism.hooks.add("complete", (function (t) { if (t.code) { var i = t.element, s = i.parentNode; if (s && /pre/i.test(s.nodeName) && !i.querySelector(".line-numbers-rows") && Prism.util.isActive(i, e)) { i.classList.remove(e), s.classList.add(e); var l, o = t.code.match(n), a = o ? o.length + 1 : 1, u = new Array(a + 1).join("<span></span>"); (l = document.createElement("span")).setAttribute("aria-hidden", "true"), l.className = "line-numbers-rows", l.innerHTML = u, s.hasAttribute("data-start") && (s.style.counterReset = "linenumber " + (parseInt(s.getAttribute("data-start"), 10) - 1)), t.element.appendChild(l), r([s]), Prism.hooks.run("line-numbers", t) } } })), Prism.hooks.add("line-numbers", (function (e) { e.plugins = e.plugins || {}, e.plugins.lineNumbers = !0 })) } function r(e) { if (0 != (e = e.filter((function (e) { var n, t = (n = e, n ? window.getComputedStyle ? getComputedStyle(n) : n.currentStyle || null : null)["white-space"]; return "pre-wrap" === t || "pre-line" === t }))).length) { var t = e.map((function (e) { var t = e.querySelector("code"), i = e.querySelector(".line-numbers-rows"); if (t && i) { var r = e.querySelector(".line-numbers-sizer"), s = t.textContent.split(n); r || ((r = document.createElement("span")).className = "line-numbers-sizer", t.appendChild(r)), r.innerHTML = "0", r.style.display = "block"; var l = r.getBoundingClientRect().height; return r.innerHTML = "", { element: e, lines: s, lineHeights: [], oneLinerHeight: l, sizer: r } } })).filter(Boolean); t.forEach((function (e) { var n = e.sizer, t = e.lines, i = e.lineHeights, r = e.oneLinerHeight; i[t.length - 1] = void 0, t.forEach((function (e, t) { if (e && e.length > 1) { var s = n.appendChild(document.createElement("span")); s.style.display = "block", s.textContent = e } else i[t] = r })) })), t.forEach((function (e) { for (var n = e.sizer, t = e.lineHeights, i = 0, r = 0; r < t.length; r++)void 0 === t[r] && (t[r] = n.children[i++].getBoundingClientRect().height) })), t.forEach((function (e) { var n = e.sizer, t = e.element.querySelector(".line-numbers-rows"); n.style.display = "none", n.innerHTML = "", e.lineHeights.forEach((function (e, n) { t.children[n].style.height = e + "px" })) })) } } }();