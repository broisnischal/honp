//#region node_modules/@better-auth/core/dist/env/env-impl.mjs
var _envShim = Object.create(null);
var _getEnv = (useShim) => globalThis.process?.env || globalThis.Deno?.env.toObject() || globalThis.__env__ || (useShim ? _envShim : globalThis);
var env = new Proxy(_envShim, {
	get(_, prop) {
		return _getEnv()[prop] ?? _envShim[prop];
	},
	has(_, prop) {
		return prop in _getEnv() || prop in _envShim;
	},
	set(_, prop, value) {
		const env = _getEnv(true);
		env[prop] = value;
		return true;
	},
	deleteProperty(_, prop) {
		if (!prop) return false;
		const env = _getEnv(true);
		delete env[prop];
		return true;
	},
	ownKeys() {
		const env = _getEnv(true);
		return Object.keys(env);
	}
});
function toBoolean(val) {
	return val ? val !== "false" : false;
}
var nodeENV = typeof process !== "undefined" && process.env && "production" || "";
/** Detect if `NODE_ENV` environment variable is `production` */
var isProduction = nodeENV === "production";
/** Detect if `NODE_ENV` environment variable is `dev` or `development` */
var isDevelopment = () => nodeENV === "dev" || nodeENV === "development";
/** Detect if `NODE_ENV` environment variable is `test` */
var isTest = () => nodeENV === "test" || toBoolean(env.TEST);
/**
* Get environment variable with fallback
*/
function getEnvVar(key, fallback) {
	if (typeof process !== "undefined" && process.env) return process.env[key] ?? fallback;
	if (typeof Deno !== "undefined") return Deno.env.get(key) ?? fallback;
	if (typeof Bun !== "undefined") return Bun.env[key] ?? fallback;
	return fallback;
}
/**
* Get boolean environment variable
*/
function getBooleanEnvVar(key, fallback = true) {
	const value = getEnvVar(key);
	if (!value) return fallback;
	return value !== "0" && value.toLowerCase() !== "false" && value !== "";
}
/**
* Common environment variables used in Better Auth
*/
var ENV = Object.freeze({
	get BETTER_AUTH_SECRET() {
		return getEnvVar("BETTER_AUTH_SECRET");
	},
	get AUTH_SECRET() {
		return getEnvVar("AUTH_SECRET");
	},
	get BETTER_AUTH_TELEMETRY() {
		return getEnvVar("BETTER_AUTH_TELEMETRY");
	},
	get BETTER_AUTH_TELEMETRY_ID() {
		return getEnvVar("BETTER_AUTH_TELEMETRY_ID");
	},
	get NODE_ENV() {
		return getEnvVar("NODE_ENV", "development");
	},
	get PACKAGE_VERSION() {
		return getEnvVar("PACKAGE_VERSION", "0.0.0");
	},
	get BETTER_AUTH_TELEMETRY_ENDPOINT() {
		return getEnvVar("BETTER_AUTH_TELEMETRY_ENDPOINT", "");
	}
});
//#endregion
//#region node_modules/@better-auth/core/dist/env/color-depth.mjs
var COLORS_2 = 1;
var COLORS_16 = 4;
var COLORS_256 = 8;
var COLORS_16m = 24;
var TERM_ENVS = {
	eterm: COLORS_16,
	cons25: COLORS_16,
	console: COLORS_16,
	cygwin: COLORS_16,
	dtterm: COLORS_16,
	gnome: COLORS_16,
	hurd: COLORS_16,
	jfbterm: COLORS_16,
	konsole: COLORS_16,
	kterm: COLORS_16,
	mlterm: COLORS_16,
	mosh: COLORS_16m,
	putty: COLORS_16,
	st: COLORS_16,
	"rxvt-unicode-24bit": COLORS_16m,
	terminator: COLORS_16m,
	"xterm-kitty": COLORS_16m
};
var CI_ENVS_MAP = new Map(Object.entries({
	APPVEYOR: COLORS_256,
	BUILDKITE: COLORS_256,
	CIRCLECI: COLORS_16m,
	DRONE: COLORS_256,
	GITEA_ACTIONS: COLORS_16m,
	GITHUB_ACTIONS: COLORS_16m,
	GITLAB_CI: COLORS_256,
	TRAVIS: COLORS_256
}));
var TERM_ENVS_REG_EXP = [
	/ansi/,
	/color/,
	/linux/,
	/direct/,
	/^con[0-9]*x[0-9]/,
	/^rxvt/,
	/^screen/,
	/^xterm/,
	/^vt100/,
	/^vt220/
];
function getColorDepth() {
	if (getEnvVar("FORCE_COLOR") !== void 0) switch (getEnvVar("FORCE_COLOR")) {
		case "":
		case "1":
		case "true": return COLORS_16;
		case "2": return COLORS_256;
		case "3": return COLORS_16m;
		default: return COLORS_2;
	}
	if (getEnvVar("NODE_DISABLE_COLORS") !== void 0 && getEnvVar("NODE_DISABLE_COLORS") !== "" || getEnvVar("NO_COLOR") !== void 0 && getEnvVar("NO_COLOR") !== "" || getEnvVar("TERM") === "dumb") return COLORS_2;
	if (getEnvVar("TMUX")) return COLORS_16m;
	if ("TF_BUILD" in env && "AGENT_NAME" in env) return COLORS_16;
	if ("CI" in env) {
		for (const { 0: envName, 1: colors } of CI_ENVS_MAP) if (envName in env) return colors;
		if (getEnvVar("CI_NAME") === "codeship") return COLORS_256;
		return COLORS_2;
	}
	if ("TEAMCITY_VERSION" in env) return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.exec(getEnvVar("TEAMCITY_VERSION")) !== null ? COLORS_16 : COLORS_2;
	switch (getEnvVar("TERM_PROGRAM")) {
		case "iTerm.app":
			if (!getEnvVar("TERM_PROGRAM_VERSION") || /^[0-2]\./.exec(getEnvVar("TERM_PROGRAM_VERSION")) !== null) return COLORS_256;
			return COLORS_16m;
		case "HyperTerm":
		case "MacTerm": return COLORS_16m;
		case "Apple_Terminal": return COLORS_256;
	}
	if (getEnvVar("COLORTERM") === "truecolor" || getEnvVar("COLORTERM") === "24bit") return COLORS_16m;
	if (getEnvVar("TERM")) {
		if (/truecolor/.exec(getEnvVar("TERM")) !== null) return COLORS_16m;
		if (/^xterm-256/.exec(getEnvVar("TERM")) !== null) return COLORS_256;
		const termEnv = getEnvVar("TERM").toLowerCase();
		if (TERM_ENVS[termEnv]) return TERM_ENVS[termEnv];
		if (TERM_ENVS_REG_EXP.some((term) => term.exec(termEnv) !== null)) return COLORS_16;
	}
	if (getEnvVar("COLORTERM")) return COLORS_16;
	return COLORS_2;
}
//#endregion
//#region node_modules/@better-auth/core/dist/env/logger.mjs
var TTY_COLORS = {
	reset: "\x1B[0m",
	bright: "\x1B[1m",
	dim: "\x1B[2m",
	undim: "\x1B[22m",
	underscore: "\x1B[4m",
	blink: "\x1B[5m",
	reverse: "\x1B[7m",
	hidden: "\x1B[8m",
	fg: {
		black: "\x1B[30m",
		red: "\x1B[31m",
		green: "\x1B[32m",
		yellow: "\x1B[33m",
		blue: "\x1B[34m",
		magenta: "\x1B[35m",
		cyan: "\x1B[36m",
		white: "\x1B[37m"
	},
	bg: {
		black: "\x1B[40m",
		red: "\x1B[41m",
		green: "\x1B[42m",
		yellow: "\x1B[43m",
		blue: "\x1B[44m",
		magenta: "\x1B[45m",
		cyan: "\x1B[46m",
		white: "\x1B[47m"
	}
};
var levels = [
	"debug",
	"info",
	"success",
	"warn",
	"error"
];
function shouldPublishLog(currentLogLevel, logLevel) {
	return levels.indexOf(logLevel) >= levels.indexOf(currentLogLevel);
}
var levelColors = {
	info: TTY_COLORS.fg.blue,
	success: TTY_COLORS.fg.green,
	warn: TTY_COLORS.fg.yellow,
	error: TTY_COLORS.fg.red,
	debug: TTY_COLORS.fg.magenta
};
var formatMessage = (level, message, colorsEnabled) => {
	const timestamp = (/* @__PURE__ */ new Date()).toISOString();
	if (colorsEnabled) return `${TTY_COLORS.dim}${timestamp}${TTY_COLORS.reset} ${levelColors[level]}${level.toUpperCase()}${TTY_COLORS.reset} ${TTY_COLORS.bright}[Better Auth]:${TTY_COLORS.reset} ${message}`;
	return `${timestamp} ${level.toUpperCase()} [Better Auth]: ${message}`;
};
var createLogger = (options) => {
	const enabled = options?.disabled !== true;
	const logLevel = options?.level ?? "warn";
	const colorsEnabled = options?.disableColors !== void 0 ? !options.disableColors : getColorDepth() !== 1;
	const LogFunc = (level, message, args = []) => {
		if (!enabled || !shouldPublishLog(logLevel, level)) return;
		const formattedMessage = formatMessage(level, message, colorsEnabled);
		if (!options || typeof options.log !== "function") {
			if (level === "error") console.error(formattedMessage, ...args);
			else if (level === "warn") console.warn(formattedMessage, ...args);
			else console.log(formattedMessage, ...args);
			return;
		}
		options.log(level === "success" ? "info" : level, message, ...args);
	};
	return {
		...Object.fromEntries(levels.map((level) => [level, (...[message, ...args]) => LogFunc(level, message, args)])),
		get level() {
			return logLevel;
		}
	};
};
var logger = createLogger();
//#endregion
//#region node_modules/@better-auth/core/dist/utils/error-codes.mjs
function defineErrorCodes(codes) {
	return Object.fromEntries(Object.entries(codes).map(([key, value]) => [key, {
		code: key,
		message: value,
		toString: () => key
	}]));
}
//#endregion
//#region node_modules/@better-auth/core/dist/error/codes.mjs
var BASE_ERROR_CODES = defineErrorCodes({
	USER_NOT_FOUND: "User not found",
	FAILED_TO_CREATE_USER: "Failed to create user",
	FAILED_TO_CREATE_SESSION: "Failed to create session",
	FAILED_TO_UPDATE_USER: "Failed to update user",
	FAILED_TO_GET_SESSION: "Failed to get session",
	INVALID_PASSWORD: "Invalid password",
	INVALID_EMAIL: "Invalid email",
	INVALID_EMAIL_OR_PASSWORD: "Invalid email or password",
	INVALID_USER: "Invalid user",
	SOCIAL_ACCOUNT_ALREADY_LINKED: "Social account already linked",
	PROVIDER_NOT_FOUND: "Provider not found",
	INVALID_TOKEN: "Invalid token",
	TOKEN_EXPIRED: "Token expired",
	ID_TOKEN_NOT_SUPPORTED: "id_token not supported",
	FAILED_TO_GET_USER_INFO: "Failed to get user info",
	USER_EMAIL_NOT_FOUND: "User email not found",
	EMAIL_NOT_VERIFIED: "Email not verified",
	PASSWORD_TOO_SHORT: "Password too short",
	PASSWORD_TOO_LONG: "Password too long",
	USER_ALREADY_EXISTS: "User already exists.",
	USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "User already exists. Use another email.",
	EMAIL_CAN_NOT_BE_UPDATED: "Email can not be updated",
	CREDENTIAL_ACCOUNT_NOT_FOUND: "Credential account not found",
	SESSION_EXPIRED: "Session expired. Re-authenticate to perform this action.",
	FAILED_TO_UNLINK_LAST_ACCOUNT: "You can't unlink your last account",
	ACCOUNT_NOT_FOUND: "Account not found",
	USER_ALREADY_HAS_PASSWORD: "User already has a password. Provide that to delete the account.",
	CROSS_SITE_NAVIGATION_LOGIN_BLOCKED: "Cross-site navigation login blocked. This request appears to be a CSRF attack.",
	VERIFICATION_EMAIL_NOT_ENABLED: "Verification email isn't enabled",
	EMAIL_ALREADY_VERIFIED: "Email is already verified",
	EMAIL_MISMATCH: "Email mismatch",
	SESSION_NOT_FRESH: "Session is not fresh",
	LINKED_ACCOUNT_ALREADY_EXISTS: "Linked account already exists",
	INVALID_ORIGIN: "Invalid origin",
	INVALID_CALLBACK_URL: "Invalid callbackURL",
	INVALID_REDIRECT_URL: "Invalid redirectURL",
	INVALID_ERROR_CALLBACK_URL: "Invalid errorCallbackURL",
	INVALID_NEW_USER_CALLBACK_URL: "Invalid newUserCallbackURL",
	MISSING_OR_NULL_ORIGIN: "Missing or null Origin",
	CALLBACK_URL_REQUIRED: "callbackURL is required",
	FAILED_TO_CREATE_VERIFICATION: "Unable to create verification",
	FIELD_NOT_ALLOWED: "Field not allowed to be set",
	ASYNC_VALIDATION_NOT_SUPPORTED: "Async validation is not supported",
	VALIDATION_ERROR: "Validation Error",
	MISSING_FIELD: "Field is required",
	METHOD_NOT_ALLOWED_DEFER_SESSION_REQUIRED: "POST method requires deferSessionRefresh to be enabled in session config",
	BODY_MUST_BE_AN_OBJECT: "Body must be an object",
	PASSWORD_ALREADY_SET: "User already has a password set"
});
//#endregion
//#region node_modules/better-call/dist/error.mjs
function isErrorStackTraceLimitWritable() {
	const desc = Object.getOwnPropertyDescriptor(Error, "stackTraceLimit");
	if (desc === void 0) return Object.isExtensible(Error);
	return Object.prototype.hasOwnProperty.call(desc, "writable") ? desc.writable : desc.set !== void 0;
}
/**
* Hide internal stack frames from the error stack trace.
*/
function hideInternalStackFrames(stack) {
	const lines = stack.split("\n    at ");
	if (lines.length <= 1) return stack;
	lines.splice(1, 1);
	return lines.join("\n    at ");
}
/**
* Creates a custom error class that hides stack frames.
*/
function makeErrorForHideStackFrame(Base, clazz) {
	class HideStackFramesError extends Base {
		#hiddenStack;
		constructor(...args) {
			if (isErrorStackTraceLimitWritable()) {
				const limit = Error.stackTraceLimit;
				Error.stackTraceLimit = 0;
				super(...args);
				Error.stackTraceLimit = limit;
			} else super(...args);
			const stack = (/* @__PURE__ */ new Error()).stack;
			if (stack) this.#hiddenStack = hideInternalStackFrames(stack.replace(/^Error/, this.name));
		}
		get errorStack() {
			return this.#hiddenStack;
		}
	}
	Object.defineProperty(HideStackFramesError.prototype, "constructor", {
		get() {
			return clazz;
		},
		enumerable: false,
		configurable: true
	});
	return HideStackFramesError;
}
var statusCodes = {
	OK: 200,
	CREATED: 201,
	ACCEPTED: 202,
	NO_CONTENT: 204,
	MULTIPLE_CHOICES: 300,
	MOVED_PERMANENTLY: 301,
	FOUND: 302,
	SEE_OTHER: 303,
	NOT_MODIFIED: 304,
	TEMPORARY_REDIRECT: 307,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	PAYMENT_REQUIRED: 402,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	METHOD_NOT_ALLOWED: 405,
	NOT_ACCEPTABLE: 406,
	PROXY_AUTHENTICATION_REQUIRED: 407,
	REQUEST_TIMEOUT: 408,
	CONFLICT: 409,
	GONE: 410,
	LENGTH_REQUIRED: 411,
	PRECONDITION_FAILED: 412,
	PAYLOAD_TOO_LARGE: 413,
	URI_TOO_LONG: 414,
	UNSUPPORTED_MEDIA_TYPE: 415,
	RANGE_NOT_SATISFIABLE: 416,
	EXPECTATION_FAILED: 417,
	"I'M_A_TEAPOT": 418,
	MISDIRECTED_REQUEST: 421,
	UNPROCESSABLE_ENTITY: 422,
	LOCKED: 423,
	FAILED_DEPENDENCY: 424,
	TOO_EARLY: 425,
	UPGRADE_REQUIRED: 426,
	PRECONDITION_REQUIRED: 428,
	TOO_MANY_REQUESTS: 429,
	REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
	UNAVAILABLE_FOR_LEGAL_REASONS: 451,
	INTERNAL_SERVER_ERROR: 500,
	NOT_IMPLEMENTED: 501,
	BAD_GATEWAY: 502,
	SERVICE_UNAVAILABLE: 503,
	GATEWAY_TIMEOUT: 504,
	HTTP_VERSION_NOT_SUPPORTED: 505,
	VARIANT_ALSO_NEGOTIATES: 506,
	INSUFFICIENT_STORAGE: 507,
	LOOP_DETECTED: 508,
	NOT_EXTENDED: 510,
	NETWORK_AUTHENTICATION_REQUIRED: 511
};
var InternalAPIError = class extends Error {
	constructor(status = "INTERNAL_SERVER_ERROR", body = void 0, headers = {}, statusCode = typeof status === "number" ? status : statusCodes[status]) {
		super(body?.message, body?.cause ? { cause: body.cause } : void 0);
		this.status = status;
		this.body = body;
		this.headers = headers;
		this.statusCode = statusCode;
		this.name = "APIError";
		this.status = status;
		this.headers = headers;
		this.statusCode = statusCode;
		this.body = body;
	}
};
var ValidationError = class extends InternalAPIError {
	constructor(message, issues) {
		super(400, {
			message,
			code: "VALIDATION_ERROR"
		});
		this.message = message;
		this.issues = issues;
		this.issues = issues;
	}
};
var BetterCallError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "BetterCallError";
	}
};
var kAPIErrorHeaderSymbol = Symbol.for("better-call:api-error-headers");
var APIError$1 = makeErrorForHideStackFrame(InternalAPIError, Error);
//#endregion
//#region node_modules/@better-auth/core/dist/error/index.mjs
var BetterAuthError = class extends Error {
	constructor(message, options) {
		super(message, options);
		this.name = "BetterAuthError";
		this.message = message;
		this.stack = "";
	}
};
var APIError = class APIError extends APIError$1 {
	constructor(...args) {
		super(...args);
	}
	static fromStatus(status, body) {
		return new APIError(status, body);
	}
	static from(status, error) {
		return new APIError(status, {
			message: error.message,
			code: error.code
		});
	}
};
//#endregion
//#region node_modules/@better-auth/utils/dist/random.mjs
function expandAlphabet(alphabet) {
	switch (alphabet) {
		case "a-z": return "abcdefghijklmnopqrstuvwxyz";
		case "A-Z": return "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		case "0-9": return "0123456789";
		case "-_": return "-_";
		default: throw new Error(`Unsupported alphabet: ${alphabet}`);
	}
}
function createRandomStringGenerator(...baseAlphabets) {
	const baseCharSet = baseAlphabets.map(expandAlphabet).join("");
	if (baseCharSet.length === 0) throw new Error("No valid characters provided for random string generation.");
	const baseCharSetLength = baseCharSet.length;
	return (length, ...alphabets) => {
		if (length <= 0) throw new Error("Length must be a positive integer.");
		let charSet = baseCharSet;
		let charSetLength = baseCharSetLength;
		if (alphabets.length > 0) {
			charSet = alphabets.map(expandAlphabet).join("");
			charSetLength = charSet.length;
		}
		const maxValid = Math.floor(256 / charSetLength) * charSetLength;
		const buf = new Uint8Array(length * 2);
		const bufLength = buf.length;
		let result = "";
		let bufIndex = bufLength;
		let rand;
		while (result.length < length) {
			if (bufIndex >= bufLength) {
				crypto.getRandomValues(buf);
				bufIndex = 0;
			}
			rand = buf[bufIndex++];
			if (rand < maxValid) result += charSet[rand % charSetLength];
		}
		return result;
	};
}
//#endregion
//#region node_modules/@better-auth/core/dist/db/get-tables.mjs
var getAuthTables = (options) => {
	const pluginSchema = (options.plugins ?? []).reduce((acc, plugin) => {
		const schema = plugin.schema;
		if (!schema) return acc;
		for (const [key, value] of Object.entries(schema)) acc[key] = {
			fields: {
				...acc[key]?.fields,
				...value.fields
			},
			modelName: value.modelName || key
		};
		return acc;
	}, {});
	const shouldAddRateLimitTable = options.rateLimit?.storage === "database";
	const rateLimitTable = { rateLimit: {
		modelName: options.rateLimit?.modelName || "rateLimit",
		fields: {
			key: {
				type: "string",
				unique: true,
				required: true,
				fieldName: options.rateLimit?.fields?.key || "key"
			},
			count: {
				type: "number",
				required: true,
				fieldName: options.rateLimit?.fields?.count || "count"
			},
			lastRequest: {
				type: "number",
				bigint: true,
				required: true,
				fieldName: options.rateLimit?.fields?.lastRequest || "lastRequest",
				defaultValue: () => Date.now()
			}
		}
	} };
	const { user, session, account, verification, ...pluginTables } = pluginSchema;
	const verificationTable = { verification: {
		modelName: options.verification?.modelName || "verification",
		fields: {
			identifier: {
				type: "string",
				required: true,
				fieldName: options.verification?.fields?.identifier || "identifier",
				index: true
			},
			value: {
				type: "string",
				required: true,
				fieldName: options.verification?.fields?.value || "value"
			},
			expiresAt: {
				type: "date",
				required: true,
				fieldName: options.verification?.fields?.expiresAt || "expiresAt"
			},
			createdAt: {
				type: "date",
				required: true,
				defaultValue: () => /* @__PURE__ */ new Date(),
				fieldName: options.verification?.fields?.createdAt || "createdAt"
			},
			updatedAt: {
				type: "date",
				required: true,
				defaultValue: () => /* @__PURE__ */ new Date(),
				onUpdate: () => /* @__PURE__ */ new Date(),
				fieldName: options.verification?.fields?.updatedAt || "updatedAt"
			},
			...verification?.fields,
			...options.verification?.additionalFields
		},
		order: 4
	} };
	const sessionTable = { session: {
		modelName: options.session?.modelName || "session",
		fields: {
			expiresAt: {
				type: "date",
				required: true,
				fieldName: options.session?.fields?.expiresAt || "expiresAt"
			},
			token: {
				type: "string",
				required: true,
				fieldName: options.session?.fields?.token || "token",
				unique: true
			},
			createdAt: {
				type: "date",
				required: true,
				fieldName: options.session?.fields?.createdAt || "createdAt",
				defaultValue: () => /* @__PURE__ */ new Date()
			},
			updatedAt: {
				type: "date",
				required: true,
				fieldName: options.session?.fields?.updatedAt || "updatedAt",
				onUpdate: () => /* @__PURE__ */ new Date()
			},
			ipAddress: {
				type: "string",
				required: false,
				fieldName: options.session?.fields?.ipAddress || "ipAddress"
			},
			userAgent: {
				type: "string",
				required: false,
				fieldName: options.session?.fields?.userAgent || "userAgent"
			},
			userId: {
				type: "string",
				fieldName: options.session?.fields?.userId || "userId",
				references: {
					model: options.user?.modelName || "user",
					field: "id",
					onDelete: "cascade"
				},
				required: true,
				index: true
			},
			...session?.fields,
			...options.session?.additionalFields
		},
		order: 2
	} };
	return {
		user: {
			modelName: options.user?.modelName || "user",
			fields: {
				name: {
					type: "string",
					required: true,
					fieldName: options.user?.fields?.name || "name",
					sortable: true
				},
				email: {
					type: "string",
					unique: true,
					required: true,
					fieldName: options.user?.fields?.email || "email",
					sortable: true
				},
				emailVerified: {
					type: "boolean",
					defaultValue: false,
					required: true,
					fieldName: options.user?.fields?.emailVerified || "emailVerified",
					input: false
				},
				image: {
					type: "string",
					required: false,
					fieldName: options.user?.fields?.image || "image"
				},
				createdAt: {
					type: "date",
					defaultValue: () => /* @__PURE__ */ new Date(),
					required: true,
					fieldName: options.user?.fields?.createdAt || "createdAt"
				},
				updatedAt: {
					type: "date",
					defaultValue: () => /* @__PURE__ */ new Date(),
					onUpdate: () => /* @__PURE__ */ new Date(),
					required: true,
					fieldName: options.user?.fields?.updatedAt || "updatedAt"
				},
				...user?.fields,
				...options.user?.additionalFields
			},
			order: 1
		},
		...!options.secondaryStorage || options.session?.storeSessionInDatabase ? sessionTable : {},
		account: {
			modelName: options.account?.modelName || "account",
			fields: {
				accountId: {
					type: "string",
					required: true,
					fieldName: options.account?.fields?.accountId || "accountId"
				},
				providerId: {
					type: "string",
					required: true,
					fieldName: options.account?.fields?.providerId || "providerId"
				},
				userId: {
					type: "string",
					references: {
						model: options.user?.modelName || "user",
						field: "id",
						onDelete: "cascade"
					},
					required: true,
					fieldName: options.account?.fields?.userId || "userId",
					index: true
				},
				accessToken: {
					type: "string",
					required: false,
					returned: false,
					fieldName: options.account?.fields?.accessToken || "accessToken"
				},
				refreshToken: {
					type: "string",
					required: false,
					returned: false,
					fieldName: options.account?.fields?.refreshToken || "refreshToken"
				},
				idToken: {
					type: "string",
					required: false,
					returned: false,
					fieldName: options.account?.fields?.idToken || "idToken"
				},
				accessTokenExpiresAt: {
					type: "date",
					required: false,
					returned: false,
					fieldName: options.account?.fields?.accessTokenExpiresAt || "accessTokenExpiresAt"
				},
				refreshTokenExpiresAt: {
					type: "date",
					required: false,
					returned: false,
					fieldName: options.account?.fields?.refreshTokenExpiresAt || "refreshTokenExpiresAt"
				},
				scope: {
					type: "string",
					required: false,
					fieldName: options.account?.fields?.scope || "scope"
				},
				password: {
					type: "string",
					required: false,
					returned: false,
					fieldName: options.account?.fields?.password || "password"
				},
				createdAt: {
					type: "date",
					required: true,
					fieldName: options.account?.fields?.createdAt || "createdAt",
					defaultValue: () => /* @__PURE__ */ new Date()
				},
				updatedAt: {
					type: "date",
					required: true,
					fieldName: options.account?.fields?.updatedAt || "updatedAt",
					onUpdate: () => /* @__PURE__ */ new Date()
				},
				...account?.fields,
				...options.account?.additionalFields
			},
			order: 3
		},
		...!options.secondaryStorage || options.verification?.storeInDatabase ? verificationTable : {},
		...pluginTables,
		...shouldAddRateLimitTable ? rateLimitTable : {}
	};
};
//#endregion
//#region node_modules/@better-auth/core/dist/utils/json.mjs
var iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
function reviveDate(value) {
	if (typeof value === "string" && iso8601Regex.test(value)) {
		const date = new Date(value);
		if (!isNaN(date.getTime())) return date;
	}
	return value;
}
/**
* Recursively walk a pre-parsed object and convert ISO 8601 date strings
* to Date instances. This handles the case where a Redis client (or similar)
* returns already-parsed JSON objects whose date fields are still strings.
*/
function reviveDates(value) {
	if (value === null || value === void 0) return value;
	if (typeof value === "string") return reviveDate(value);
	if (value instanceof Date) return value;
	if (Array.isArray(value)) return value.map(reviveDates);
	if (typeof value === "object") {
		const result = {};
		for (const key of Object.keys(value)) result[key] = reviveDates(value[key]);
		return result;
	}
	return value;
}
function safeJSONParse(data) {
	try {
		if (typeof data !== "string") {
			if (data === null || data === void 0) return null;
			return reviveDates(data);
		}
		return JSON.parse(data, (_, value) => reviveDate(value));
	} catch (e) {
		logger.error("Error parsing JSON", { error: e });
		return null;
	}
}
//#endregion
//#region node_modules/@opentelemetry/semantic-conventions/build/esm/stable_attributes.js
/**
* The name of a collection (table, container) within the database.
*
* @example public.users
* @example customers
*
* @note It is **RECOMMENDED** to capture the value as provided by the application
* without attempting to do any case normalization.
*
* The collection name **SHOULD NOT** be extracted from `db.query.text`,
* when the database system supports query text with multiple collections
* in non-batch operations.
*
* For batch operations, if the individual operations are known to have the same
* collection name then that collection name **SHOULD** be used.
*/
var ATTR_DB_COLLECTION_NAME = "db.collection.name";
/**
* The name of the operation or command being executed.
*
* @example findAndModify
* @example HMSET
* @example SELECT
*
* @note It is **RECOMMENDED** to capture the value as provided by the application
* without attempting to do any case normalization.
*
* The operation name **SHOULD NOT** be extracted from `db.query.text`,
* when the database system supports query text with multiple operations
* in non-batch operations.
*
* If spaces can occur in the operation name, multiple consecutive spaces
* **SHOULD** be normalized to a single space.
*
* For batch operations, if the individual operations are known to have the same operation name
* then that operation name **SHOULD** be used prepended by `BATCH `,
* otherwise `db.operation.name` **SHOULD** be `BATCH` or some other database
* system specific term if more applicable.
*/
var ATTR_DB_OPERATION_NAME = "db.operation.name";
/**
* [HTTP response status code](https://tools.ietf.org/html/rfc7231#section-6).
*
* @example 200
*/
var ATTR_HTTP_RESPONSE_STATUS_CODE = "http.response.status_code";
/**
* The matched route template for the request. This **MUST** be low-cardinality and include all static path segments, with dynamic path segments represented with placeholders.
*
* @example /users/:userID?
* @example my-controller/my-action/{id?}
*
* @note **MUST NOT** be populated when this is not supported by the HTTP server framework as the route attribute should have low-cardinality and the URI path can NOT substitute it.
* **SHOULD** include the [application root](/docs/http/http-spans.md#http-server-definitions) if there is one.
*
* A static path segment is a part of the route template with a fixed, low-cardinality value. This includes literal strings like `/users/` and placeholders that
* are constrained to a finite, predefined set of values, e.g. `{controller}` or `{action}`.
*
* A dynamic path segment is a placeholder for a value that can have high cardinality and is not constrained to a predefined list like static path segments.
*
* Instrumentations **SHOULD** use routing information provided by the corresponding web framework. They **SHOULD** pick the most precise source of routing information and **MAY**
* support custom route formatting. Instrumentations **SHOULD** document the format and the API used to obtain the route string.
*/
var ATTR_HTTP_ROUTE = "http.route";
//#endregion
//#region node_modules/@better-auth/core/dist/instrumentation/attributes.mjs
/** Operation identifier (e.g. getSession, signUpWithEmailAndPassword). Uses endpoint operationId when set, otherwise the endpoint key. */
var ATTR_OPERATION_ID = "better_auth.operation_id";
/** Hook type (e.g. before, after, create.before). */
var ATTR_HOOK_TYPE = "better_auth.hook.type";
/** Execution context (e.g. user, plugin:id). */
var ATTR_CONTEXT = "better_auth.context";
//#endregion
//#region node_modules/@opentelemetry/api/build/esm/version.js
var VERSION = "1.9.1";
//#endregion
//#region node_modules/@opentelemetry/api/build/esm/internal/semver.js
var re = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
/**
* Create a function to test an API version to see if it is compatible with the provided ownVersion.
*
* The returned function has the following semantics:
* - Exact match is always compatible
* - Major versions must match exactly
*    - 1.x package cannot use global 2.x package
*    - 2.x package cannot use global 1.x package
* - The minor version of the API module requesting access to the global API must be less than or equal to the minor version of this API
*    - 1.3 package may use 1.4 global because the later global contains all functions 1.3 expects
*    - 1.4 package may NOT use 1.3 global because it may try to call functions which don't exist on 1.3
* - If the major version is 0, the minor version is treated as the major and the patch is treated as the minor
* - Patch and build tag differences are not considered at this time
*
* @param ownVersion version which should be checked against
*/
function _makeCompatibilityCheck(ownVersion) {
	const acceptedVersions = new Set([ownVersion]);
	const rejectedVersions = /* @__PURE__ */ new Set();
	const myVersionMatch = ownVersion.match(re);
	if (!myVersionMatch) return () => false;
	const ownVersionParsed = {
		major: +myVersionMatch[1],
		minor: +myVersionMatch[2],
		patch: +myVersionMatch[3],
		prerelease: myVersionMatch[4]
	};
	if (ownVersionParsed.prerelease != null) return function isExactmatch(globalVersion) {
		return globalVersion === ownVersion;
	};
	function _reject(v) {
		rejectedVersions.add(v);
		return false;
	}
	function _accept(v) {
		acceptedVersions.add(v);
		return true;
	}
	return function isCompatible(globalVersion) {
		if (acceptedVersions.has(globalVersion)) return true;
		if (rejectedVersions.has(globalVersion)) return false;
		const globalVersionMatch = globalVersion.match(re);
		if (!globalVersionMatch) return _reject(globalVersion);
		const globalVersionParsed = {
			major: +globalVersionMatch[1],
			minor: +globalVersionMatch[2],
			patch: +globalVersionMatch[3],
			prerelease: globalVersionMatch[4]
		};
		if (globalVersionParsed.prerelease != null) return _reject(globalVersion);
		if (ownVersionParsed.major !== globalVersionParsed.major) return _reject(globalVersion);
		if (ownVersionParsed.major === 0) {
			if (ownVersionParsed.minor === globalVersionParsed.minor && ownVersionParsed.patch <= globalVersionParsed.patch) return _accept(globalVersion);
			return _reject(globalVersion);
		}
		if (ownVersionParsed.minor <= globalVersionParsed.minor) return _accept(globalVersion);
		return _reject(globalVersion);
	};
}
/**
* Test an API version to see if it is compatible with this API.
*
* - Exact match is always compatible
* - Major versions must match exactly
*    - 1.x package cannot use global 2.x package
*    - 2.x package cannot use global 1.x package
* - The minor version of the API module requesting access to the global API must be less than or equal to the minor version of this API
*    - 1.3 package may use 1.4 global because the later global contains all functions 1.3 expects
*    - 1.4 package may NOT use 1.3 global because it may try to call functions which don't exist on 1.3
* - If the major version is 0, the minor version is treated as the major and the patch is treated as the minor
* - Patch and build tag differences are not considered at this time
*
* @param version version of the API requesting an instance of the global API
*/
var isCompatible = _makeCompatibilityCheck(VERSION);
//#endregion
//#region node_modules/@opentelemetry/api/build/esm/internal/global-utils.js
var major = VERSION.split(".")[0];
var GLOBAL_OPENTELEMETRY_API_KEY = Symbol.for(`opentelemetry.js.api.${major}`);
var _global = typeof globalThis === "object" ? globalThis : typeof self === "object" ? self : typeof window === "object" ? window : typeof global === "object" ? global : {};
function registerGlobal(type, instance, diag, allowOverride = false) {
	var _a;
	const api = _global[GLOBAL_OPENTELEMETRY_API_KEY] = (_a = _global[GLOBAL_OPENTELEMETRY_API_KEY]) !== null && _a !== void 0 ? _a : { version: VERSION };
	if (!allowOverride && api[type]) {
		const err = /* @__PURE__ */ new Error(`@opentelemetry/api: Attempted duplicate registration of API: ${type}`);
		diag.error(err.stack || err.message);
		return false;
	}
	if (api.version !== "1.9.1") {
		const err = /* @__PURE__ */ new Error(`@opentelemetry/api: Registration of version v${api.version} for ${type} does not match previously registered API v${VERSION}`);
		diag.error(err.stack || err.message);
		return false;
	}
	api[type] = instance;
	diag.debug(`@opentelemetry/api: Registered a global for ${type} v${VERSION}.`);
	return true;
}
function getGlobal(type) {
	var _a, _b;
	const globalVersion = (_a = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _a === void 0 ? void 0 : _a.version;
	if (!globalVersion || !isCompatible(globalVersion)) return;
	return (_b = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _b === void 0 ? void 0 : _b[type];
}
function unregisterGlobal(type, diag) {
	diag.debug(`@opentelemetry/api: Unregistering a global for ${type} v${VERSION}.`);
	const api = _global[GLOBAL_OPENTELEMETRY_API_KEY];
	if (api) delete api[type];
}
//#endregion
//#region node_modules/@opentelemetry/api/build/esm/diag/ComponentLogger.js
/**
* Component Logger which is meant to be used as part of any component which
* will add automatically additional namespace in front of the log message.
* It will then forward all message to global diag logger
* @example
* const cLogger = diag.createComponentLogger({ namespace: '@opentelemetry/instrumentation-http' });
* cLogger.debug('test');
* // @opentelemetry/instrumentation-http test
*/
var DiagComponentLogger = class {
	constructor(props) {
		this._namespace = props.namespace || "DiagComponentLogger";
	}
	debug(...args) {
		return logProxy("debug", this._namespace, args);
	}
	error(...args) {
		return logProxy("error", this._namespace, args);
	}
	info(...args) {
		return logProxy("info", this._namespace, args);
	}
	warn(...args) {
		return logProxy("warn", this._namespace, args);
	}
	verbose(...args) {
		return logProxy("verbose", this._namespace, args);
	}
};
function logProxy(funcName, namespace, args) {
	const logger = getGlobal("diag");
	if (!logger) return;
	return logger[funcName](namespace, ...args);
}
//#endregion
//#region node_modules/@opentelemetry/api/build/esm/diag/types.js
/**
* Defines the available internal logging levels for the diagnostic logger, the numeric values
* of the levels are defined to match the original values from the initial LogLevel to avoid
* compatibility/migration issues for any implementation that assume the numeric ordering.
*/
var DiagLogLevel;
(function(DiagLogLevel) {
	/** Diagnostic Logging level setting to disable all logging (except and forced logs) */
	DiagLogLevel[DiagLogLevel["NONE"] = 0] = "NONE";
	/** Identifies an error scenario */
	DiagLogLevel[DiagLogLevel["ERROR"] = 30] = "ERROR";
	/** Identifies a warning scenario */
	DiagLogLevel[DiagLogLevel["WARN"] = 50] = "WARN";
	/** General informational log message */
	DiagLogLevel[DiagLogLevel["INFO"] = 60] = "INFO";
	/** General debug log message */
	DiagLogLevel[DiagLogLevel["DEBUG"] = 70] = "DEBUG";
	/**
	* Detailed trace level logging should only be used for development, should only be set
	* in a development environment.
	*/
	DiagLogLevel[DiagLogLevel["VERBOSE"] = 80] = "VERBOSE";
	/** Used to set the logging level to include all logging */
	DiagLogLevel[DiagLogLevel["ALL"] = 9999] = "ALL";
})(DiagLogLevel || (DiagLogLevel = {}));
//#endregion
//#region node_modules/@opentelemetry/api/build/esm/diag/internal/logLevelLogger.js
function createLogLevelDiagLogger(maxLevel, logger) {
	if (maxLevel < DiagLogLevel.NONE) maxLevel = DiagLogLevel.NONE;
	else if (maxLevel > DiagLogLevel.ALL) maxLevel = DiagLogLevel.ALL;
	logger = logger || {};
	function _filterFunc(funcName, theLevel) {
		const theFunc = logger[funcName];
		if (typeof theFunc === "function" && maxLevel >= theLevel) return theFunc.bind(logger);
		return function() {};
	}
	return {
		error: _filterFunc("error", DiagLogLevel.ERROR),
		warn: _filterFunc("warn", DiagLogLevel.WARN),
		info: _filterFunc("info", DiagLogLevel.INFO),
		debug: _filterFunc("debug", DiagLogLevel.DEBUG),
		verbose: _filterFunc("verbose", DiagLogLevel.VERBOSE)
	};
}
//#endregion
//#region node_modules/@opentelemetry/api/build/esm/api/diag.js
var API_NAME$2 = "diag";
/**
* Singleton object which represents the entry point to the OpenTelemetry internal
* diagnostic API
*
* @since 1.0.0
*/
var DiagAPI = class DiagAPI {
	/** Get the singleton instance of the DiagAPI API */
	static instance() {
		if (!this._instance) this._instance = new DiagAPI();
		return this._instance;
	}
	/**
	* Private internal constructor
	* @private
	*/
	constructor() {
		function _logProxy(funcName) {
			return function(...args) {
				const logger = getGlobal("diag");
				if (!logger) return;
				return logger[funcName](...args);
			};
		}
		const self = this;
		const setLogger = (logger, optionsOrLogLevel = { logLevel: DiagLogLevel.INFO }) => {
			var _a, _b, _c;
			if (logger === self) {
				const err = /* @__PURE__ */ new Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
				self.error((_a = err.stack) !== null && _a !== void 0 ? _a : err.message);
				return false;
			}
			if (typeof optionsOrLogLevel === "number") optionsOrLogLevel = { logLevel: optionsOrLogLevel };
			const oldLogger = getGlobal("diag");
			const newLogger = createLogLevelDiagLogger((_b = optionsOrLogLevel.logLevel) !== null && _b !== void 0 ? _b : DiagLogLevel.INFO, logger);
			if (oldLogger && !optionsOrLogLevel.suppressOverrideMessage) {
				const stack = (_c = (/* @__PURE__ */ new Error()).stack) !== null && _c !== void 0 ? _c : "<failed to generate stacktrace>";
				oldLogger.warn(`Current logger will be overwritten from ${stack}`);
				newLogger.warn(`Current logger will overwrite one already registered from ${stack}`);
			}
			return registerGlobal("diag", newLogger, self, true);
		};
		self.setLogger = setLogger;
		self.disable = () => {
			unregisterGlobal(API_NAME$2, self);
		};
		self.createComponentLogger = (options) => {
			return new DiagComponentLogger(options);
		};
		self.verbose = _logProxy("verbose");
		self.debug = _logProxy("debug");
		self.info = _logProxy("info");
		self.warn = _logProxy("warn");
		self.error = _logProxy("error");
	}
};
//#endregion
//#region node_modules/@opentelemetry/api/build/esm/context/context.js
/**
* Get a key to uniquely identify a context value
*
* @since 1.0.0
*/
function createContextKey(description) {
	return Symbol.for(description);
}
/**
* The root context is used as the default parent context when there is no active context
*
* @since 1.0.0
*/
var ROOT_CONTEXT = new class BaseContext {
	/**
	* Construct a new context which inherits values from an optional parent context.
	*
	* @param parentContext a context from which to inherit values
	*/
	constructor(parentContext) {
		const self = this;
		self._currentContext = parentContext ? new Map(parentContext) : /* @__PURE__ */ new Map();
		self.getValue = (key) => self._currentContext.get(key);
		self.setValue = (key, value) => {
			const context = new BaseContext(self._currentContext);
			context._currentContext.set(key, value);
			return context;
		};
		self.deleteValue = (key) => {
			const context = new BaseContext(self._currentContext);
			context._currentContext.delete(key);
			return context;
		};
	}
}();
//#endregion
//#region node_modules/@opentelemetry/api/build/esm/context/NoopContextManager.js
var NoopContextManager = class {
	active() {
		return ROOT_CONTEXT;
	}
	with(_context, fn, thisArg, ...args) {
		return fn.call(thisArg, ...args);
	}
	bind(_context, target) {
		return target;
	}
	enable() {
		return this;
	}
	disable() {
		return this;
	}
};
//#endregion
//#region node_modules/@opentelemetry/api/build/esm/api/context.js
var API_NAME$1 = "context";
var NOOP_CONTEXT_MANAGER = new NoopContextManager();
/**
* Singleton object which represents the entry point to the OpenTelemetry Context API
*
* @since 1.0.0
*/
var ContextAPI = class ContextAPI {
	/** Empty private constructor prevents end users from constructing a new instance of the API */
	constructor() {}
	/** Get the singleton instance of the Context API */
	static getInstance() {
		if (!this._instance) this._instance = new ContextAPI();
		return this._instance;
	}
	/**
	* Set the current context manager.
	*
	* @returns true if the context manager was successfully registered, else false
	*/
	setGlobalContextManager(contextManager) {
		return registerGlobal(API_NAME$1, contextManager, DiagAPI.instance());
	}
	/**
	* Get the currently active context
	*/
	active() {
		return this._getContextManager().active();
	}
	/**
	* Execute a function with an active context
	*
	* @param context context to be active during function execution
	* @param fn function to execute in a context
	* @param thisArg optional receiver to be used for calling fn
	* @param args optional arguments forwarded to fn
	*/
	with(context, fn, thisArg, ...args) {
		return this._getContextManager().with(context, fn, thisArg, ...args);
	}
	/**
	* Bind a context to a target function or event emitter
	*
	* @param context context to bind to the event emitter or function. Defaults to the currently active context
	* @param target function or event emitter to bind
	*/
	bind(context, target) {
		return this._getContextManager().bind(context, target);
	}
	_getContextManager() {
		return getGlobal(API_NAME$1) || NOOP_CONTEXT_MANAGER;
	}
	/** Disable and remove the global context manager */
	disable() {
		this._getContextManager().disable();
		unregisterGlobal(API_NAME$1, DiagAPI.instance());
	}
};
//#endregion
//#region node_modules/@opentelemetry/api/build/esm/trace/trace_flags.js
/**
* @since 1.0.0
*/
var TraceFlags;
(function(TraceFlags) {
	/** Represents no flag set. */
	TraceFlags[TraceFlags["NONE"] = 0] = "NONE";
	/** Bit to represent whether trace is sampled in trace flags. */
	TraceFlags[TraceFlags["SAMPLED"] = 1] = "SAMPLED";
})(TraceFlags || (TraceFlags = {}));
/**
* @since 1.0.0
*/
var INVALID_SPAN_CONTEXT = {
	traceId: "00000000000000000000000000000000",
	spanId: "0000000000000000",
	traceFlags: TraceFlags.NONE
};
//#endregion
//#region node_modules/@opentelemetry/api/build/esm/trace/NonRecordingSpan.js
/**
* The NonRecordingSpan is the default {@link Span} that is used when no Span
* implementation is available. All operations are no-op including context
* propagation.
*/
var NonRecordingSpan = class {
	constructor(spanContext = INVALID_SPAN_CONTEXT) {
		this._spanContext = spanContext;
	}
	spanContext() {
		return this._spanContext;
	}
	setAttribute(_key, _value) {
		return this;
	}
	setAttributes(_attributes) {
		return this;
	}
	addEvent(_name, _attributes) {
		return this;
	}
	addLink(_link) {
		return this;
	}
	addLinks(_links) {
		return this;
	}
	setStatus(_status) {
		return this;
	}
	updateName(_name) {
		return this;
	}
	end(_endTime) {}
	isRecording() {
		return false;
	}
	recordException(_exception, _time) {}
};
//#endregion
//#region node_modules/@opentelemetry/api/build/esm/trace/context-utils.js
/**
* span key
*/
var SPAN_KEY = createContextKey("OpenTelemetry Context Key SPAN");
/**
* Return the span if one exists
*
* @param context context to get span from
*/
function getSpan(context) {
	return context.getValue(SPAN_KEY) || void 0;
}
/**
* Gets the span from the current context, if one exists.
*/
function getActiveSpan() {
	return getSpan(ContextAPI.getInstance().active());
}
/**
* Set the span on a context
*
* @param context context to use as parent
* @param span span to set active
*/
function setSpan(context, span) {
	return context.setValue(SPAN_KEY, span);
}
/**
* Remove current span stored in the context
*
* @param context context to delete span from
*/
function deleteSpan(context) {
	return context.deleteValue(SPAN_KEY);
}
/**
* Wrap span context in a NoopSpan and set as span in a new
* context
*
* @param context context to set active span on
* @param spanContext span context to be wrapped
*/
function setSpanContext(context, spanContext) {
	return setSpan(context, new NonRecordingSpan(spanContext));
}
/**
* Get the span context of the span if it exists.
*
* @param context context to get values from
*/
function getSpanContext(context) {
	var _a;
	return (_a = getSpan(context)) === null || _a === void 0 ? void 0 : _a.spanContext();
}
//#endregion
//#region node_modules/@opentelemetry/api/build/esm/trace/spancontext-utils.js
var isHex = new Uint8Array([
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	1,
	1,
	1,
	1,
	1,
	1,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	1,
	1,
	1,
	1,
	1,
	1
]);
function isValidHex(id, length) {
	if (typeof id !== "string" || id.length !== length) return false;
	let r = 0;
	for (let i = 0; i < id.length; i += 4) r += (isHex[id.charCodeAt(i)] | 0) + (isHex[id.charCodeAt(i + 1)] | 0) + (isHex[id.charCodeAt(i + 2)] | 0) + (isHex[id.charCodeAt(i + 3)] | 0);
	return r === length;
}
/**
* @since 1.0.0
*/
function isValidTraceId(traceId) {
	return isValidHex(traceId, 32) && traceId !== "00000000000000000000000000000000";
}
/**
* @since 1.0.0
*/
function isValidSpanId(spanId) {
	return isValidHex(spanId, 16) && spanId !== "0000000000000000";
}
/**
* Returns true if this {@link SpanContext} is valid.
* @return true if this {@link SpanContext} is valid.
*
* @since 1.0.0
*/
function isSpanContextValid(spanContext) {
	return isValidTraceId(spanContext.traceId) && isValidSpanId(spanContext.spanId);
}
/**
* Wrap the given {@link SpanContext} in a new non-recording {@link Span}
*
* @param spanContext span context to be wrapped
* @returns a new non-recording {@link Span} with the provided context
*/
function wrapSpanContext(spanContext) {
	return new NonRecordingSpan(spanContext);
}
//#endregion
//#region node_modules/@opentelemetry/api/build/esm/trace/NoopTracer.js
var contextApi = ContextAPI.getInstance();
/**
* No-op implementations of {@link Tracer}.
*/
var NoopTracer = class {
	startSpan(name, options, context = contextApi.active()) {
		if (Boolean(options === null || options === void 0 ? void 0 : options.root)) return new NonRecordingSpan();
		const parentFromContext = context && getSpanContext(context);
		if (isSpanContext(parentFromContext) && isSpanContextValid(parentFromContext)) return new NonRecordingSpan(parentFromContext);
		else return new NonRecordingSpan();
	}
	startActiveSpan(name, arg2, arg3, arg4) {
		let opts;
		let ctx;
		let fn;
		if (arguments.length < 2) return;
		else if (arguments.length === 2) fn = arg2;
		else if (arguments.length === 3) {
			opts = arg2;
			fn = arg3;
		} else {
			opts = arg2;
			ctx = arg3;
			fn = arg4;
		}
		const parentContext = ctx !== null && ctx !== void 0 ? ctx : contextApi.active();
		const span = this.startSpan(name, opts, parentContext);
		const contextWithSpanSet = setSpan(parentContext, span);
		return contextApi.with(contextWithSpanSet, fn, void 0, span);
	}
};
function isSpanContext(spanContext) {
	return spanContext !== null && typeof spanContext === "object" && "spanId" in spanContext && typeof spanContext["spanId"] === "string" && "traceId" in spanContext && typeof spanContext["traceId"] === "string" && "traceFlags" in spanContext && typeof spanContext["traceFlags"] === "number";
}
//#endregion
//#region node_modules/@opentelemetry/api/build/esm/trace/ProxyTracer.js
var NOOP_TRACER = new NoopTracer();
/**
* Proxy tracer provided by the proxy tracer provider
*
* @since 1.0.0
*/
var ProxyTracer = class {
	constructor(provider, name, version, options) {
		this._provider = provider;
		this.name = name;
		this.version = version;
		this.options = options;
	}
	startSpan(name, options, context) {
		return this._getTracer().startSpan(name, options, context);
	}
	startActiveSpan(_name, _options, _context, _fn) {
		const tracer = this._getTracer();
		return Reflect.apply(tracer.startActiveSpan, tracer, arguments);
	}
	/**
	* Try to get a tracer from the proxy tracer provider.
	* If the proxy tracer provider has no delegate, return a noop tracer.
	*/
	_getTracer() {
		if (this._delegate) return this._delegate;
		const tracer = this._provider.getDelegateTracer(this.name, this.version, this.options);
		if (!tracer) return NOOP_TRACER;
		this._delegate = tracer;
		return this._delegate;
	}
};
//#endregion
//#region node_modules/@opentelemetry/api/build/esm/trace/NoopTracerProvider.js
/**
* An implementation of the {@link TracerProvider} which returns an impotent
* Tracer for all calls to `getTracer`.
*
* All operations are no-op.
*/
var NoopTracerProvider = class {
	getTracer(_name, _version, _options) {
		return new NoopTracer();
	}
};
//#endregion
//#region node_modules/@opentelemetry/api/build/esm/trace/ProxyTracerProvider.js
var NOOP_TRACER_PROVIDER = new NoopTracerProvider();
/**
* Tracer provider which provides {@link ProxyTracer}s.
*
* Before a delegate is set, tracers provided are NoOp.
*   When a delegate is set, traces are provided from the delegate.
*   When a delegate is set after tracers have already been provided,
*   all tracers already provided will use the provided delegate implementation.
*
* @deprecated This will be removed in the next major version.
* @since 1.0.0
*/
var ProxyTracerProvider = class {
	/**
	* Get a {@link ProxyTracer}
	*/
	getTracer(name, version, options) {
		var _a;
		return (_a = this.getDelegateTracer(name, version, options)) !== null && _a !== void 0 ? _a : new ProxyTracer(this, name, version, options);
	}
	getDelegate() {
		var _a;
		return (_a = this._delegate) !== null && _a !== void 0 ? _a : NOOP_TRACER_PROVIDER;
	}
	/**
	* Set the delegate tracer provider
	*/
	setDelegate(delegate) {
		this._delegate = delegate;
	}
	getDelegateTracer(name, version, options) {
		var _a;
		return (_a = this._delegate) === null || _a === void 0 ? void 0 : _a.getTracer(name, version, options);
	}
};
//#endregion
//#region node_modules/@opentelemetry/api/build/esm/trace/status.js
/**
* An enumeration of status codes.
*
* @since 1.0.0
*/
var SpanStatusCode;
(function(SpanStatusCode) {
	/**
	* The default status.
	*/
	SpanStatusCode[SpanStatusCode["UNSET"] = 0] = "UNSET";
	/**
	* The operation has been validated by an Application developer or
	* Operator to have completed successfully.
	*/
	SpanStatusCode[SpanStatusCode["OK"] = 1] = "OK";
	/**
	* The operation contains an error.
	*/
	SpanStatusCode[SpanStatusCode["ERROR"] = 2] = "ERROR";
})(SpanStatusCode || (SpanStatusCode = {}));
//#endregion
//#region node_modules/@opentelemetry/api/build/esm/api/trace.js
var API_NAME = "trace";
//#endregion
//#region node_modules/@better-auth/core/dist/instrumentation/tracer.mjs
var tracer = class TraceAPI {
	/** Empty private constructor prevents end users from constructing a new instance of the API */
	constructor() {
		this._proxyTracerProvider = new ProxyTracerProvider();
		this.wrapSpanContext = wrapSpanContext;
		this.isSpanContextValid = isSpanContextValid;
		this.deleteSpan = deleteSpan;
		this.getSpan = getSpan;
		this.getActiveSpan = getActiveSpan;
		this.getSpanContext = getSpanContext;
		this.setSpan = setSpan;
		this.setSpanContext = setSpanContext;
	}
	/** Get the singleton instance of the Trace API */
	static getInstance() {
		if (!this._instance) this._instance = new TraceAPI();
		return this._instance;
	}
	/**
	* Set the current global tracer.
	*
	* @returns true if the tracer provider was successfully registered, else false
	*/
	setGlobalTracerProvider(provider) {
		const success = registerGlobal(API_NAME, this._proxyTracerProvider, DiagAPI.instance());
		if (success) this._proxyTracerProvider.setDelegate(provider);
		return success;
	}
	/**
	* Returns the global tracer provider.
	*/
	getTracerProvider() {
		return getGlobal(API_NAME) || this._proxyTracerProvider;
	}
	/**
	* Returns a tracer from the global tracer provider.
	*/
	getTracer(name, version) {
		return this.getTracerProvider().getTracer(name, version);
	}
	/** Remove the global tracer provider */
	disable() {
		unregisterGlobal(API_NAME, DiagAPI.instance());
		this._proxyTracerProvider = new ProxyTracerProvider();
	}
}.getInstance().getTracer("better-auth", "1.6.0");
/**
* Better-auth uses `throw ctx.redirect(url)` for flow control (e.g. OAuth
* callbacks). These are APIErrors with 3xx status codes and should not be
* recorded as span errors.
*/
function isRedirectError(err) {
	if (err != null && typeof err === "object" && "name" in err && err.name === "APIError" && "statusCode" in err) {
		const status = err.statusCode;
		return status >= 300 && status < 400;
	}
	return false;
}
function endSpanWithError(span, err) {
	if (isRedirectError(err)) {
		span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, err.statusCode);
		span.setStatus({ code: SpanStatusCode.OK });
	} else {
		span.recordException(err);
		span.setStatus({
			code: SpanStatusCode.ERROR,
			message: String(err?.message ?? err)
		});
	}
	span.end();
}
function withSpan(name, attributes, fn) {
	return tracer.startActiveSpan(name, { attributes }, (span) => {
		try {
			const result = fn();
			if (result instanceof Promise) return result.then((value) => {
				span.end();
				return value;
			}).catch((err) => {
				endSpanWithError(span, err);
				throw err;
			});
			span.end();
			return result;
		} catch (err) {
			endSpanWithError(span, err);
			throw err;
		}
	});
}
//#endregion
//#region node_modules/@better-auth/core/dist/utils/id.mjs
var generateId = (size) => {
	return createRandomStringGenerator("a-z", "A-Z", "0-9")(size || 32);
};
//#endregion
//#region node_modules/@better-auth/core/dist/db/adapter/get-default-model-name.mjs
var initGetDefaultModelName = ({ usePlural, schema }) => {
	/**
	* This function helps us get the default model name from the schema defined by devs.
	* Often times, the user will be using the `modelName` which could had been customized by the users.
	* This function helps us get the actual model name useful to match against the schema. (eg: schema[model])
	*
	* If it's still unclear what this does:
	*
	* 1. User can define a custom modelName.
	* 2. When using a custom modelName, doing something like `schema[model]` will not work.
	* 3. Using this function helps us get the actual model name based on the user's defined custom modelName.
	*/
	const getDefaultModelName = (model) => {
		if (usePlural && model.charAt(model.length - 1) === "s") {
			const pluralessModel = model.slice(0, -1);
			let m = schema[pluralessModel] ? pluralessModel : void 0;
			if (!m) m = Object.entries(schema).find(([_, f]) => f.modelName === pluralessModel)?.[0];
			if (m) return m;
		}
		let m = schema[model] ? model : void 0;
		if (!m) m = Object.entries(schema).find(([_, f]) => f.modelName === model)?.[0];
		if (!m) throw new BetterAuthError(`Model "${model}" not found in schema`);
		return m;
	};
	return getDefaultModelName;
};
//#endregion
//#region node_modules/@better-auth/core/dist/db/adapter/get-default-field-name.mjs
var initGetDefaultFieldName = ({ schema, usePlural }) => {
	const getDefaultModelName = initGetDefaultModelName({
		schema,
		usePlural
	});
	/**
	* This function helps us get the default field name from the schema defined by devs.
	* Often times, the user will be using the `fieldName` which could had been customized by the users.
	* This function helps us get the actual field name useful to match against the schema. (eg: schema[model].fields[field])
	*
	* If it's still unclear what this does:
	*
	* 1. User can define a custom fieldName.
	* 2. When using a custom fieldName, doing something like `schema[model].fields[field]` will not work.
	*/
	const getDefaultFieldName = ({ field, model: unsafeModel }) => {
		if (field === "id" || field === "_id") return "id";
		const model = getDefaultModelName(unsafeModel);
		let f = schema[model]?.fields[field];
		if (!f) {
			const result = Object.entries(schema[model].fields).find(([_, f]) => f.fieldName === field);
			if (result) {
				f = result[1];
				field = result[0];
			}
		}
		if (!f) throw new BetterAuthError(`Field ${field} not found in model ${model}`);
		return field;
	};
	return getDefaultFieldName;
};
//#endregion
//#region node_modules/@better-auth/core/dist/db/adapter/get-id-field.mjs
var initGetIdField = ({ usePlural, schema, disableIdGeneration, options, customIdGenerator, supportsUUIDs }) => {
	const getDefaultModelName = initGetDefaultModelName({
		usePlural,
		schema
	});
	const idField = ({ customModelName, forceAllowId }) => {
		const useNumberId = options.advanced?.database?.generateId === "serial";
		const useUUIDs = options.advanced?.database?.generateId === "uuid";
		const shouldGenerateId = (() => {
			if (disableIdGeneration) return false;
			else if (useNumberId && !forceAllowId) return false;
			else if (useUUIDs) return !supportsUUIDs;
			else return true;
		})();
		const model = getDefaultModelName(customModelName ?? "id");
		return {
			type: useNumberId ? "number" : "string",
			required: shouldGenerateId ? true : false,
			...shouldGenerateId ? { defaultValue() {
				if (disableIdGeneration) return void 0;
				const generateId$1 = options.advanced?.database?.generateId;
				if (generateId$1 === false || generateId$1 === "serial") return void 0;
				if (typeof generateId$1 === "function") return generateId$1({ model });
				if (generateId$1 === "uuid") return crypto.randomUUID();
				if (customIdGenerator) return customIdGenerator({ model });
				return generateId();
			} } : {},
			transform: {
				input: (value) => {
					if (!value) return void 0;
					if (useNumberId) {
						const numberValue = Number(value);
						if (isNaN(numberValue)) return;
						return numberValue;
					}
					if (useUUIDs) {
						if (shouldGenerateId && !forceAllowId) return value;
						if (disableIdGeneration) return void 0;
						if (supportsUUIDs) return void 0;
						if (forceAllowId && typeof value === "string") if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) return value;
						else {
							const stack = (/* @__PURE__ */ new Error()).stack?.split("\n").filter((_, i) => i !== 1).join("\n").replace("Error:", "");
							logger.warn("[Adapter Factory] - Invalid UUID value for field `id` provided when `forceAllowId` is true. Generating a new UUID.", stack);
						}
						if (typeof value !== "string" && !supportsUUIDs) return crypto.randomUUID();
						return;
					}
					return value;
				},
				output: (value) => {
					if (!value) return void 0;
					return String(value);
				}
			}
		};
	};
	return idField;
};
//#endregion
//#region node_modules/@better-auth/core/dist/db/adapter/get-field-attributes.mjs
var initGetFieldAttributes = ({ usePlural, schema, options, customIdGenerator, disableIdGeneration }) => {
	const getDefaultModelName = initGetDefaultModelName({
		usePlural,
		schema
	});
	const getDefaultFieldName = initGetDefaultFieldName({
		usePlural,
		schema
	});
	const idField = initGetIdField({
		usePlural,
		schema,
		options,
		customIdGenerator,
		disableIdGeneration
	});
	const getFieldAttributes = ({ model, field }) => {
		const defaultModelName = getDefaultModelName(model);
		const defaultFieldName = getDefaultFieldName({
			field,
			model: defaultModelName
		});
		const fields = schema[defaultModelName].fields;
		fields.id = idField({ customModelName: defaultModelName });
		const fieldAttributes = fields[defaultFieldName];
		if (!fieldAttributes) throw new BetterAuthError(`Field ${field} not found in model ${model}`);
		return fieldAttributes;
	};
	return getFieldAttributes;
};
//#endregion
//#region node_modules/@better-auth/core/dist/db/adapter/get-field-name.mjs
var initGetFieldName = ({ schema, usePlural }) => {
	const getDefaultModelName = initGetDefaultModelName({
		schema,
		usePlural
	});
	const getDefaultFieldName = initGetDefaultFieldName({
		schema,
		usePlural
	});
	/**
	* Get the field name which is expected to be saved in the database based on the user's schema.
	*
	* This function is useful if you need to save the field name to the database.
	*
	* For example, if the user has defined a custom field name for the `user` model, then you can use this function to get the actual field name from the schema.
	*/
	function getFieldName({ model: modelName, field: fieldName }) {
		const model = getDefaultModelName(modelName);
		const field = getDefaultFieldName({
			model,
			field: fieldName
		});
		return schema[model]?.fields[field]?.fieldName || field;
	}
	return getFieldName;
};
//#endregion
//#region node_modules/@better-auth/core/dist/db/adapter/get-model-name.mjs
var initGetModelName = ({ usePlural, schema }) => {
	const getDefaultModelName = initGetDefaultModelName({
		schema,
		usePlural
	});
	/**
	* Users can overwrite the default model of some tables. This function helps find the correct model name.
	* Furthermore, if the user passes `usePlural` as true in their adapter config,
	* then we should return the model name ending with an `s`.
	*/
	const getModelName = (model) => {
		const defaultModelKey = getDefaultModelName(model);
		if (schema && schema[defaultModelKey] && schema[defaultModelKey].modelName !== model) return usePlural ? `${schema[defaultModelKey].modelName}s` : schema[defaultModelKey].modelName;
		return usePlural ? `${model}s` : model;
	};
	return getModelName;
};
//#endregion
//#region node_modules/@better-auth/core/dist/db/adapter/utils.mjs
function withApplyDefault(value, field, action) {
	if (action === "update") {
		if (value === void 0 && field.onUpdate !== void 0) {
			if (typeof field.onUpdate === "function") return field.onUpdate();
			return field.onUpdate;
		}
		return value;
	}
	if (action === "create") {
		if (value === void 0 || field.required === true && value === null) {
			if (field.defaultValue !== void 0) {
				if (typeof field.defaultValue === "function") return field.defaultValue();
				return field.defaultValue;
			}
		}
	}
	return value;
}
//#endregion
//#region node_modules/@better-auth/core/dist/db/adapter/factory.mjs
var debugLogs = [];
var transactionId = -1;
var createAsIsTransaction = (adapter) => (fn) => fn(adapter);
var createAdapterFactory = ({ adapter: customAdapter, config: cfg }) => (options) => {
	const uniqueAdapterFactoryInstanceId = Math.random().toString(36).substring(2, 15);
	const config = {
		...cfg,
		supportsBooleans: cfg.supportsBooleans ?? true,
		supportsDates: cfg.supportsDates ?? true,
		supportsJSON: cfg.supportsJSON ?? false,
		adapterName: cfg.adapterName ?? cfg.adapterId,
		supportsNumericIds: cfg.supportsNumericIds ?? true,
		supportsUUIDs: cfg.supportsUUIDs ?? false,
		supportsArrays: cfg.supportsArrays ?? false,
		transaction: cfg.transaction ?? false,
		disableTransformInput: cfg.disableTransformInput ?? false,
		disableTransformOutput: cfg.disableTransformOutput ?? false,
		disableTransformJoin: cfg.disableTransformJoin ?? false
	};
	if (options.advanced?.database?.generateId === "serial" && config.supportsNumericIds === false) throw new BetterAuthError(`[${config.adapterName}] Your database or database adapter does not support numeric ids. Please disable "useNumberId" in your config.`);
	const schema = getAuthTables(options);
	const debugLog = (...args) => {
		if (config.debugLogs === true || typeof config.debugLogs === "object") {
			const logger = createLogger({ level: "info" });
			if (typeof config.debugLogs === "object" && "isRunningAdapterTests" in config.debugLogs) {
				if (config.debugLogs.isRunningAdapterTests) {
					args.shift();
					debugLogs.push({
						instance: uniqueAdapterFactoryInstanceId,
						args
					});
				}
				return;
			}
			if (typeof config.debugLogs === "object" && config.debugLogs.logCondition && !config.debugLogs.logCondition?.()) return;
			if (typeof args[0] === "object" && "method" in args[0]) {
				const method = args.shift().method;
				if (typeof config.debugLogs === "object") {
					if (method === "create" && !config.debugLogs.create) return;
					else if (method === "update" && !config.debugLogs.update) return;
					else if (method === "updateMany" && !config.debugLogs.updateMany) return;
					else if (method === "findOne" && !config.debugLogs.findOne) return;
					else if (method === "findMany" && !config.debugLogs.findMany) return;
					else if (method === "delete" && !config.debugLogs.delete) return;
					else if (method === "deleteMany" && !config.debugLogs.deleteMany) return;
					else if (method === "count" && !config.debugLogs.count) return;
				}
				logger.info(`[${config.adapterName}]`, ...args);
			} else logger.info(`[${config.adapterName}]`, ...args);
		}
	};
	const logger = createLogger(options.logger);
	const getDefaultModelName = initGetDefaultModelName({
		usePlural: config.usePlural,
		schema
	});
	const getDefaultFieldName = initGetDefaultFieldName({
		usePlural: config.usePlural,
		schema
	});
	const getModelName = initGetModelName({
		usePlural: config.usePlural,
		schema
	});
	const getFieldName = initGetFieldName({
		schema,
		usePlural: config.usePlural
	});
	const idField = initGetIdField({
		schema,
		options,
		usePlural: config.usePlural,
		disableIdGeneration: config.disableIdGeneration,
		customIdGenerator: config.customIdGenerator,
		supportsUUIDs: config.supportsUUIDs
	});
	const getFieldAttributes = initGetFieldAttributes({
		schema,
		options,
		usePlural: config.usePlural,
		disableIdGeneration: config.disableIdGeneration,
		customIdGenerator: config.customIdGenerator
	});
	const transformInput = async (data, defaultModelName, action, forceAllowId) => {
		const transformedData = {};
		const fields = schema[defaultModelName].fields;
		const newMappedKeys = config.mapKeysTransformInput ?? {};
		const useNumberId = options.advanced?.database?.generateId === "serial";
		fields.id = idField({
			customModelName: defaultModelName,
			forceAllowId: forceAllowId && "id" in data
		});
		for (const field in fields) {
			let value = data[field];
			const fieldAttributes = fields[field];
			const newFieldName = newMappedKeys[field] || fields[field].fieldName || field;
			if (value === void 0 && (fieldAttributes.defaultValue === void 0 && !fieldAttributes.transform?.input && !(action === "update" && fieldAttributes.onUpdate) || action === "update" && !fieldAttributes.onUpdate)) continue;
			if (fieldAttributes && fieldAttributes.type === "date" && !(value instanceof Date) && typeof value === "string") try {
				value = new Date(value);
			} catch {
				logger.error("[Adapter Factory] Failed to convert string to date", {
					value,
					field
				});
			}
			let newValue = withApplyDefault(value, fieldAttributes, action);
			if (fieldAttributes.transform?.input) newValue = await fieldAttributes.transform.input(newValue);
			if (fieldAttributes.references?.field === "id" && useNumberId) if (Array.isArray(newValue)) newValue = newValue.map((x) => x !== null ? Number(x) : null);
			else newValue = newValue !== null ? Number(newValue) : null;
			else if (config.supportsJSON === false && typeof newValue === "object" && fieldAttributes.type === "json") newValue = JSON.stringify(newValue);
			else if (config.supportsArrays === false && Array.isArray(newValue) && (fieldAttributes.type === "string[]" || fieldAttributes.type === "number[]")) newValue = JSON.stringify(newValue);
			else if (config.supportsDates === false && newValue instanceof Date && fieldAttributes.type === "date") newValue = newValue.toISOString();
			else if (config.supportsBooleans === false && typeof newValue === "boolean") newValue = newValue ? 1 : 0;
			if (config.customTransformInput) newValue = config.customTransformInput({
				data: newValue,
				action,
				field: newFieldName,
				fieldAttributes,
				model: getModelName(defaultModelName),
				schema,
				options
			});
			if (newValue !== void 0) transformedData[newFieldName] = newValue;
		}
		return transformedData;
	};
	const transformOutput = async (data, unsafe_model, select = [], join) => {
		const transformSingleOutput = async (data, unsafe_model, select = []) => {
			if (!data) return null;
			const newMappedKeys = config.mapKeysTransformOutput ?? {};
			const transformedData = {};
			const tableSchema = schema[getDefaultModelName(unsafe_model)].fields;
			const idKey = Object.entries(newMappedKeys).find(([_, v]) => v === "id")?.[0];
			tableSchema[idKey ?? "id"] = { type: options.advanced?.database?.generateId === "serial" ? "number" : "string" };
			for (const key in tableSchema) {
				if (select.length && !select.includes(key)) continue;
				const field = tableSchema[key];
				if (field) {
					const originalKey = field.fieldName || key;
					let newValue = data[Object.entries(newMappedKeys).find(([_, v]) => v === originalKey)?.[0] || originalKey];
					if (field.transform?.output) newValue = await field.transform.output(newValue);
					const newFieldName = newMappedKeys[key] || key;
					if (originalKey === "id" || field.references?.field === "id") {
						if (typeof newValue !== "undefined" && newValue !== null) newValue = String(newValue);
					} else if (config.supportsJSON === false && typeof newValue === "string" && field.type === "json") newValue = safeJSONParse(newValue);
					else if (config.supportsArrays === false && typeof newValue === "string" && (field.type === "string[]" || field.type === "number[]")) newValue = safeJSONParse(newValue);
					else if (config.supportsDates === false && typeof newValue === "string" && field.type === "date") newValue = new Date(newValue);
					else if (config.supportsBooleans === false && typeof newValue === "number" && field.type === "boolean") newValue = newValue === 1;
					if (config.customTransformOutput) newValue = config.customTransformOutput({
						data: newValue,
						field: newFieldName,
						fieldAttributes: field,
						select,
						model: getModelName(unsafe_model),
						schema,
						options
					});
					transformedData[newFieldName] = newValue;
				}
			}
			return transformedData;
		};
		if (!join || Object.keys(join).length === 0) return await transformSingleOutput(data, unsafe_model, select);
		unsafe_model = getDefaultModelName(unsafe_model);
		const transformedData = await transformSingleOutput(data, unsafe_model, select);
		const requiredModels = Object.entries(join).map(([model, joinConfig]) => ({
			modelName: getModelName(model),
			defaultModelName: getDefaultModelName(model),
			joinConfig
		}));
		if (!data) return null;
		for (const { modelName, defaultModelName, joinConfig } of requiredModels) {
			let joinedData = await (async () => {
				if (options.experimental?.joins) return data[modelName];
				else return await handleFallbackJoin({
					baseModel: unsafe_model,
					baseData: transformedData,
					joinModel: modelName,
					specificJoinConfig: joinConfig
				});
			})();
			if (joinedData === void 0 || joinedData === null) joinedData = joinConfig.relation === "one-to-one" ? null : [];
			if (joinConfig.relation === "one-to-many" && !Array.isArray(joinedData)) joinedData = [joinedData];
			const transformed = [];
			if (Array.isArray(joinedData)) for (const item of joinedData) {
				const transformedItem = await transformSingleOutput(item, modelName, []);
				transformed.push(transformedItem);
			}
			else {
				const transformedItem = await transformSingleOutput(joinedData, modelName, []);
				transformed.push(transformedItem);
			}
			transformedData[defaultModelName] = (joinConfig.relation === "one-to-one" ? transformed[0] : transformed) ?? null;
		}
		return transformedData;
	};
	const transformWhereClause = ({ model, where, action }) => {
		if (!where) return void 0;
		const newMappedKeys = config.mapKeysTransformInput ?? {};
		return where.map((w) => {
			const { field: unsafe_field, value, operator = "eq", connector = "AND", mode = "sensitive" } = w;
			if (operator === "in") {
				if (!Array.isArray(value)) throw new BetterAuthError("Value must be an array");
			}
			let newValue = value;
			const defaultModelName = getDefaultModelName(model);
			const defaultFieldName = getDefaultFieldName({
				field: unsafe_field,
				model
			});
			const fieldName = newMappedKeys[defaultFieldName] || getFieldName({
				field: defaultFieldName,
				model: defaultModelName
			});
			const fieldAttr = getFieldAttributes({
				field: defaultFieldName,
				model: defaultModelName
			});
			const useNumberId = options.advanced?.database?.generateId === "serial";
			if (defaultFieldName === "id" || fieldAttr.references?.field === "id") {
				if (useNumberId) if (Array.isArray(value)) newValue = value.map(Number);
				else newValue = Number(value);
			}
			if (fieldAttr.type === "date" && value instanceof Date && !config.supportsDates) newValue = value.toISOString();
			if (fieldAttr.type === "boolean" && typeof newValue === "string") newValue = newValue === "true";
			if (fieldAttr.type === "number") {
				if (typeof newValue === "string" && newValue.trim() !== "") {
					const parsed = Number(newValue);
					if (!Number.isNaN(parsed)) newValue = parsed;
				} else if (Array.isArray(newValue)) {
					const parsed = newValue.map((v) => typeof v === "string" && v.trim() !== "" ? Number(v) : NaN);
					if (parsed.every((n) => !Number.isNaN(n))) newValue = parsed;
				}
			}
			if (fieldAttr.type === "boolean" && typeof newValue === "boolean" && !config.supportsBooleans) newValue = newValue ? 1 : 0;
			if (fieldAttr.type === "json" && typeof value === "object" && !config.supportsJSON) try {
				newValue = JSON.stringify(value);
			} catch (error) {
				throw new Error(`Failed to stringify JSON value for field ${fieldName}`, { cause: error });
			}
			if (config.customTransformInput) newValue = config.customTransformInput({
				data: newValue,
				fieldAttributes: fieldAttr,
				field: fieldName,
				model: getModelName(model),
				schema,
				options,
				action
			});
			return {
				operator,
				connector,
				field: fieldName,
				value: newValue,
				mode
			};
		});
	};
	const transformJoinClause = (baseModel, unsanitizedJoin, select) => {
		if (!unsanitizedJoin) return void 0;
		if (Object.keys(unsanitizedJoin).length === 0) return void 0;
		const transformedJoin = {};
		for (const [model, join] of Object.entries(unsanitizedJoin)) {
			if (!join) continue;
			const defaultModelName = getDefaultModelName(model);
			const defaultBaseModelName = getDefaultModelName(baseModel);
			let foreignKeys = Object.entries(schema[defaultModelName].fields).filter(([field, fieldAttributes]) => fieldAttributes.references && getDefaultModelName(fieldAttributes.references.model) === defaultBaseModelName);
			let isForwardJoin = true;
			if (!foreignKeys.length) {
				foreignKeys = Object.entries(schema[defaultBaseModelName].fields).filter(([field, fieldAttributes]) => fieldAttributes.references && getDefaultModelName(fieldAttributes.references.model) === defaultModelName);
				isForwardJoin = false;
			}
			if (!foreignKeys.length) throw new BetterAuthError(`No foreign key found for model ${model} and base model ${baseModel} while performing join operation.`);
			else if (foreignKeys.length > 1) throw new BetterAuthError(`Multiple foreign keys found for model ${model} and base model ${baseModel} while performing join operation. Only one foreign key is supported.`);
			const [foreignKey, foreignKeyAttributes] = foreignKeys[0];
			if (!foreignKeyAttributes.references) throw new BetterAuthError(`No references found for foreign key ${foreignKey} on model ${model} while performing join operation.`);
			let from;
			let to;
			let requiredSelectField;
			if (isForwardJoin) {
				requiredSelectField = foreignKeyAttributes.references.field;
				from = getFieldName({
					model: baseModel,
					field: requiredSelectField
				});
				to = getFieldName({
					model,
					field: foreignKey
				});
			} else {
				requiredSelectField = foreignKey;
				from = getFieldName({
					model: baseModel,
					field: requiredSelectField
				});
				to = getFieldName({
					model,
					field: foreignKeyAttributes.references.field
				});
			}
			if (select && !select.includes(requiredSelectField)) select.push(requiredSelectField);
			const isUnique = to === "id" ? true : foreignKeyAttributes.unique ?? false;
			let limit = options.advanced?.database?.defaultFindManyLimit ?? 100;
			if (isUnique) limit = 1;
			else if (typeof join === "object" && typeof join.limit === "number") limit = join.limit;
			transformedJoin[getModelName(model)] = {
				on: {
					from,
					to
				},
				limit,
				relation: isUnique ? "one-to-one" : "one-to-many"
			};
		}
		return {
			join: transformedJoin,
			select
		};
	};
	/**
	* Handle joins by making separate queries and combining results (fallback for adapters that don't support native joins).
	*/
	const handleFallbackJoin = async ({ baseModel, baseData, joinModel, specificJoinConfig: joinConfig }) => {
		if (!baseData) return baseData;
		const modelName = getModelName(joinModel);
		const field = joinConfig.on.to;
		const value = baseData[getDefaultFieldName({
			field: joinConfig.on.from,
			model: baseModel
		})];
		if (value === null || value === void 0) return joinConfig.relation === "one-to-one" ? null : [];
		let result;
		const where = transformWhereClause({
			model: modelName,
			where: [{
				field,
				value,
				operator: "eq",
				connector: "AND"
			}],
			action: "findOne"
		});
		try {
			if (joinConfig.relation === "one-to-one") result = await withSpan(`db findOne ${modelName}`, {
				[ATTR_DB_OPERATION_NAME]: "findOne",
				[ATTR_DB_COLLECTION_NAME]: modelName
			}, () => adapterInstance.findOne({
				model: modelName,
				where
			}));
			else {
				const limit = joinConfig.limit ?? options.advanced?.database?.defaultFindManyLimit ?? 100;
				result = await withSpan(`db findMany ${modelName}`, {
					[ATTR_DB_OPERATION_NAME]: "findMany",
					[ATTR_DB_COLLECTION_NAME]: modelName
				}, () => adapterInstance.findMany({
					model: modelName,
					where,
					limit
				}));
			}
		} catch (error) {
			logger.error(`Failed to query fallback join for model ${modelName}:`, {
				where,
				limit: joinConfig.limit
			});
			console.error(error);
			throw error;
		}
		return result;
	};
	const adapterInstance = customAdapter({
		options,
		schema,
		debugLog,
		getFieldName,
		getModelName,
		getDefaultModelName,
		getDefaultFieldName,
		getFieldAttributes,
		transformInput,
		transformOutput,
		transformWhereClause
	});
	let lazyLoadTransaction = null;
	const adapter = {
		transaction: async (cb) => {
			if (!lazyLoadTransaction) if (!config.transaction) lazyLoadTransaction = createAsIsTransaction(adapter);
			else {
				logger.debug(`[${config.adapterName}] - Using provided transaction implementation.`);
				lazyLoadTransaction = config.transaction;
			}
			return lazyLoadTransaction(cb);
		},
		create: async ({ data: unsafeData, model: unsafeModel, select, forceAllowId = false }) => {
			transactionId++;
			const thisTransactionId = transactionId;
			const model = getModelName(unsafeModel);
			unsafeModel = getDefaultModelName(unsafeModel);
			if ("id" in unsafeData && typeof unsafeData.id !== "undefined" && !forceAllowId) {
				logger.warn(`[${config.adapterName}] - You are trying to create a record with an id. This is not allowed as we handle id generation for you, unless you pass in the \`forceAllowId\` parameter. The id will be ignored.`);
				const stack = (/* @__PURE__ */ new Error()).stack?.split("\n").filter((_, i) => i !== 1).join("\n").replace("Error:", "Create method with `id` being called at:");
				console.log(stack);
				unsafeData.id = void 0;
			}
			debugLog({ method: "create" }, `${formatTransactionId(thisTransactionId)} ${formatStep(1, 4)}`, `${formatMethod("create")} ${formatAction("Unsafe Input")}:`, {
				model,
				data: unsafeData
			});
			let data = unsafeData;
			if (!config.disableTransformInput) data = await transformInput(unsafeData, unsafeModel, "create", forceAllowId);
			debugLog({ method: "create" }, `${formatTransactionId(thisTransactionId)} ${formatStep(2, 4)}`, `${formatMethod("create")} ${formatAction("Parsed Input")}:`, {
				model,
				data
			});
			const res = await withSpan(`db create ${model}`, {
				[ATTR_DB_OPERATION_NAME]: "create",
				[ATTR_DB_COLLECTION_NAME]: model
			}, () => adapterInstance.create({
				data,
				model
			}));
			debugLog({ method: "create" }, `${formatTransactionId(thisTransactionId)} ${formatStep(3, 4)}`, `${formatMethod("create")} ${formatAction("DB Result")}:`, {
				model,
				res
			});
			let transformed = res;
			if (!config.disableTransformOutput) transformed = await transformOutput(res, unsafeModel, select, void 0);
			debugLog({ method: "create" }, `${formatTransactionId(thisTransactionId)} ${formatStep(4, 4)}`, `${formatMethod("create")} ${formatAction("Parsed Result")}:`, {
				model,
				data: transformed
			});
			return transformed;
		},
		update: async ({ model: unsafeModel, where: unsafeWhere, update: unsafeData }) => {
			transactionId++;
			const thisTransactionId = transactionId;
			unsafeModel = getDefaultModelName(unsafeModel);
			const model = getModelName(unsafeModel);
			const where = transformWhereClause({
				model: unsafeModel,
				where: unsafeWhere,
				action: "update"
			});
			debugLog({ method: "update" }, `${formatTransactionId(thisTransactionId)} ${formatStep(1, 4)}`, `${formatMethod("update")} ${formatAction("Unsafe Input")}:`, {
				model,
				data: unsafeData
			});
			let data = unsafeData;
			if (!config.disableTransformInput) data = await transformInput(unsafeData, unsafeModel, "update");
			debugLog({ method: "update" }, `${formatTransactionId(thisTransactionId)} ${formatStep(2, 4)}`, `${formatMethod("update")} ${formatAction("Parsed Input")}:`, {
				model,
				data
			});
			const res = await withSpan(`db update ${model}`, {
				[ATTR_DB_OPERATION_NAME]: "update",
				[ATTR_DB_COLLECTION_NAME]: model
			}, () => adapterInstance.update({
				model,
				where,
				update: data
			}));
			debugLog({ method: "update" }, `${formatTransactionId(thisTransactionId)} ${formatStep(3, 4)}`, `${formatMethod("update")} ${formatAction("DB Result")}:`, {
				model,
				data: res
			});
			let transformed = res;
			if (!config.disableTransformOutput) transformed = await transformOutput(res, unsafeModel, void 0, void 0);
			debugLog({ method: "update" }, `${formatTransactionId(thisTransactionId)} ${formatStep(4, 4)}`, `${formatMethod("update")} ${formatAction("Parsed Result")}:`, {
				model,
				data: transformed
			});
			return transformed;
		},
		updateMany: async ({ model: unsafeModel, where: unsafeWhere, update: unsafeData }) => {
			transactionId++;
			const thisTransactionId = transactionId;
			const model = getModelName(unsafeModel);
			const where = transformWhereClause({
				model: unsafeModel,
				where: unsafeWhere,
				action: "updateMany"
			});
			unsafeModel = getDefaultModelName(unsafeModel);
			debugLog({ method: "updateMany" }, `${formatTransactionId(thisTransactionId)} ${formatStep(1, 4)}`, `${formatMethod("updateMany")} ${formatAction("Unsafe Input")}:`, {
				model,
				data: unsafeData
			});
			let data = unsafeData;
			if (!config.disableTransformInput) data = await transformInput(unsafeData, unsafeModel, "update");
			debugLog({ method: "updateMany" }, `${formatTransactionId(thisTransactionId)} ${formatStep(2, 4)}`, `${formatMethod("updateMany")} ${formatAction("Parsed Input")}:`, {
				model,
				data
			});
			const updatedCount = await withSpan(`db updateMany ${model}`, {
				[ATTR_DB_OPERATION_NAME]: "updateMany",
				[ATTR_DB_COLLECTION_NAME]: model
			}, () => adapterInstance.updateMany({
				model,
				where,
				update: data
			}));
			debugLog({ method: "updateMany" }, `${formatTransactionId(thisTransactionId)} ${formatStep(3, 4)}`, `${formatMethod("updateMany")} ${formatAction("DB Result")}:`, {
				model,
				data: updatedCount
			});
			debugLog({ method: "updateMany" }, `${formatTransactionId(thisTransactionId)} ${formatStep(4, 4)}`, `${formatMethod("updateMany")} ${formatAction("Parsed Result")}:`, {
				model,
				data: updatedCount
			});
			return updatedCount;
		},
		findOne: async ({ model: unsafeModel, where: unsafeWhere, select, join: unsafeJoin }) => {
			transactionId++;
			const thisTransactionId = transactionId;
			const model = getModelName(unsafeModel);
			const where = transformWhereClause({
				model: unsafeModel,
				where: unsafeWhere,
				action: "findOne"
			});
			unsafeModel = getDefaultModelName(unsafeModel);
			let join;
			let passJoinToAdapter = true;
			if (!config.disableTransformJoin) {
				const result = transformJoinClause(unsafeModel, unsafeJoin, select);
				if (result) {
					join = result.join;
					select = result.select;
				}
				if (!options.experimental?.joins && join && Object.keys(join).length > 0) passJoinToAdapter = false;
			} else join = unsafeJoin;
			debugLog({ method: "findOne" }, `${formatTransactionId(thisTransactionId)} ${formatStep(1, 3)}`, `${formatMethod("findOne")}:`, {
				model,
				where,
				select,
				join
			});
			const res = await withSpan(`db findOne ${model}`, {
				[ATTR_DB_OPERATION_NAME]: "findOne",
				[ATTR_DB_COLLECTION_NAME]: model
			}, () => adapterInstance.findOne({
				model,
				where,
				select,
				join: passJoinToAdapter ? join : void 0
			}));
			debugLog({ method: "findOne" }, `${formatTransactionId(thisTransactionId)} ${formatStep(2, 3)}`, `${formatMethod("findOne")} ${formatAction("DB Result")}:`, {
				model,
				data: res
			});
			let transformed = res;
			if (!config.disableTransformOutput) transformed = await transformOutput(res, unsafeModel, select, join);
			debugLog({ method: "findOne" }, `${formatTransactionId(thisTransactionId)} ${formatStep(3, 3)}`, `${formatMethod("findOne")} ${formatAction("Parsed Result")}:`, {
				model,
				data: transformed
			});
			return transformed;
		},
		findMany: async ({ model: unsafeModel, where: unsafeWhere, limit: unsafeLimit, select, sortBy, offset, join: unsafeJoin }) => {
			transactionId++;
			const thisTransactionId = transactionId;
			const limit = unsafeLimit ?? options.advanced?.database?.defaultFindManyLimit ?? 100;
			const model = getModelName(unsafeModel);
			const where = transformWhereClause({
				model: unsafeModel,
				where: unsafeWhere,
				action: "findMany"
			});
			unsafeModel = getDefaultModelName(unsafeModel);
			let join;
			let passJoinToAdapter = true;
			if (!config.disableTransformJoin) {
				const result = transformJoinClause(unsafeModel, unsafeJoin, select);
				if (result) {
					join = result.join;
					select = result.select;
				}
				if (!options.experimental?.joins && join && Object.keys(join).length > 0) passJoinToAdapter = false;
			} else join = unsafeJoin;
			debugLog({ method: "findMany" }, `${formatTransactionId(thisTransactionId)} ${formatStep(1, 3)}`, `${formatMethod("findMany")}:`, {
				model,
				where,
				limit,
				sortBy,
				offset,
				join
			});
			const res = await withSpan(`db findMany ${model}`, {
				[ATTR_DB_OPERATION_NAME]: "findMany",
				[ATTR_DB_COLLECTION_NAME]: model
			}, () => adapterInstance.findMany({
				model,
				where,
				limit,
				select,
				sortBy,
				offset,
				join: passJoinToAdapter ? join : void 0
			}));
			debugLog({ method: "findMany" }, `${formatTransactionId(thisTransactionId)} ${formatStep(2, 3)}`, `${formatMethod("findMany")} ${formatAction("DB Result")}:`, {
				model,
				data: res
			});
			let transformed = res;
			if (!config.disableTransformOutput) transformed = await Promise.all(res.map(async (r) => {
				return await transformOutput(r, unsafeModel, void 0, join);
			}));
			debugLog({ method: "findMany" }, `${formatTransactionId(thisTransactionId)} ${formatStep(3, 3)}`, `${formatMethod("findMany")} ${formatAction("Parsed Result")}:`, {
				model,
				data: transformed
			});
			return transformed;
		},
		delete: async ({ model: unsafeModel, where: unsafeWhere }) => {
			transactionId++;
			const thisTransactionId = transactionId;
			const model = getModelName(unsafeModel);
			const where = transformWhereClause({
				model: unsafeModel,
				where: unsafeWhere,
				action: "delete"
			});
			unsafeModel = getDefaultModelName(unsafeModel);
			debugLog({ method: "delete" }, `${formatTransactionId(thisTransactionId)} ${formatStep(1, 2)}`, `${formatMethod("delete")}:`, {
				model,
				where
			});
			await withSpan(`db delete ${model}`, {
				[ATTR_DB_OPERATION_NAME]: "delete",
				[ATTR_DB_COLLECTION_NAME]: model
			}, () => adapterInstance.delete({
				model,
				where
			}));
			debugLog({ method: "delete" }, `${formatTransactionId(thisTransactionId)} ${formatStep(2, 2)}`, `${formatMethod("delete")} ${formatAction("DB Result")}:`, { model });
		},
		deleteMany: async ({ model: unsafeModel, where: unsafeWhere }) => {
			transactionId++;
			const thisTransactionId = transactionId;
			const model = getModelName(unsafeModel);
			const where = transformWhereClause({
				model: unsafeModel,
				where: unsafeWhere,
				action: "deleteMany"
			});
			unsafeModel = getDefaultModelName(unsafeModel);
			debugLog({ method: "deleteMany" }, `${formatTransactionId(thisTransactionId)} ${formatStep(1, 2)}`, `${formatMethod("deleteMany")} ${formatAction("DeleteMany")}:`, {
				model,
				where
			});
			const res = await withSpan(`db deleteMany ${model}`, {
				[ATTR_DB_OPERATION_NAME]: "deleteMany",
				[ATTR_DB_COLLECTION_NAME]: model
			}, () => adapterInstance.deleteMany({
				model,
				where
			}));
			debugLog({ method: "deleteMany" }, `${formatTransactionId(thisTransactionId)} ${formatStep(2, 2)}`, `${formatMethod("deleteMany")} ${formatAction("DB Result")}:`, {
				model,
				data: res
			});
			return res;
		},
		count: async ({ model: unsafeModel, where: unsafeWhere }) => {
			transactionId++;
			const thisTransactionId = transactionId;
			const model = getModelName(unsafeModel);
			const where = transformWhereClause({
				model: unsafeModel,
				where: unsafeWhere,
				action: "count"
			});
			unsafeModel = getDefaultModelName(unsafeModel);
			debugLog({ method: "count" }, `${formatTransactionId(thisTransactionId)} ${formatStep(1, 2)}`, `${formatMethod("count")}:`, {
				model,
				where
			});
			const res = await withSpan(`db count ${model}`, {
				[ATTR_DB_OPERATION_NAME]: "count",
				[ATTR_DB_COLLECTION_NAME]: model
			}, () => adapterInstance.count({
				model,
				where
			}));
			debugLog({ method: "count" }, `${formatTransactionId(thisTransactionId)} ${formatStep(2, 2)}`, `${formatMethod("count")}:`, {
				model,
				data: res
			});
			return res;
		},
		createSchema: adapterInstance.createSchema ? async (_, file) => {
			const tables = getAuthTables(options);
			if (options.secondaryStorage && !options.session?.storeSessionInDatabase) delete tables.session;
			return adapterInstance.createSchema({
				file,
				tables
			});
		} : void 0,
		options: {
			adapterConfig: config,
			...adapterInstance.options ?? {}
		},
		id: config.adapterId,
		...config.debugLogs?.isRunningAdapterTests ? { adapterTestDebugLogs: {
			resetDebugLogs() {
				debugLogs = debugLogs.filter((log) => log.instance !== uniqueAdapterFactoryInstanceId);
			},
			printDebugLogs() {
				const separator = `─`.repeat(80);
				const logs = debugLogs.filter((log) => log.instance === uniqueAdapterFactoryInstanceId);
				if (logs.length === 0) return;
				const log = logs.reverse().map((log) => {
					log.args[0] = `\n${log.args[0]}`;
					return [...log.args, "\n"];
				}).reduce((prev, curr) => {
					return [...curr, ...prev];
				}, [`\n${separator}`]);
				console.log(...log);
			}
		} } : {}
	};
	return adapter;
};
function formatTransactionId(transactionId) {
	if (getColorDepth() < 8) return `#${transactionId}`;
	return `${TTY_COLORS.fg.magenta}#${transactionId}${TTY_COLORS.reset}`;
}
function formatStep(step, total) {
	return `${TTY_COLORS.bg.black}${TTY_COLORS.fg.yellow}[${step}/${total}]${TTY_COLORS.reset}`;
}
function formatMethod(method) {
	return `${TTY_COLORS.bright}${method}${TTY_COLORS.reset}`;
}
function formatAction(action) {
	return `${TTY_COLORS.dim}(${action})${TTY_COLORS.reset}`;
}
//#endregion
export { isProduction as A, logger as C, getBooleanEnvVar as D, env as E, getEnvVar as O, createLogger as S, ENV as T, APIError$1 as _, withSpan as a, kAPIErrorHeaderSymbol as b, ATTR_OPERATION_ID as c, ATTR_HTTP_ROUTE as d, safeJSONParse as f, BetterAuthError as g, APIError as h, generateId as i, isTest as j, isDevelopment as k, ATTR_DB_COLLECTION_NAME as l, createRandomStringGenerator as m, initGetModelName as n, ATTR_CONTEXT as o, getAuthTables as p, initGetFieldName as r, ATTR_HOOK_TYPE as s, createAdapterFactory as t, ATTR_HTTP_RESPONSE_STATUS_CODE as u, BetterCallError as v, shouldPublishLog as w, BASE_ERROR_CODES as x, ValidationError as y };
