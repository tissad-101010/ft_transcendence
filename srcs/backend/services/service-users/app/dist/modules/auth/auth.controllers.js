"use strict";
/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.controllers.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 11:44:30 by tissad            #+#    #+#             */
/*   Updated: 2025/12/10 11:39:56 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupController = signupController;
exports.signinController = signinController;
exports.getProfileController = getProfileController;
exports.changePasswordController = changePasswordController;
exports.uploadAvatarController = uploadAvatarController;
// this file receives the request from the frontend and call userservice 
// to handle the request response
const path_1 = __importDefault(require("path"));
const users_services_1 = require("../users/users.services");
const credential_utils_1 = require("../../utils/credential.utils");
const auth_services_1 = require("./auth.services");
const jwt_utils_1 = require("../../utils/jwt.utils");
const auth_middleware_1 = require("../middleware/auth.middleware");
/***********************************/
/*     Auth Controllers            */
/***********************************/
async function signupController(request, reply) {
    const inputData = request.body;
    // Step 1: validate credentials before proceeding
    const credentialValidation = credential_utils_1.CredentialUtils.validateCredentials(inputData);
    if (!credentialValidation.isValid) {
        console.log('[Signup Controller] Invalid credentials:', credentialValidation.errors);
        // send back error response
        return reply.code(400).send({
            message: 'Signup failed: Invalid credentials',
            signupComplete: false,
            errors: credentialValidation
        });
    }
    // Step 2: check for existing username or email
    const userService = new users_services_1.UsersService(request.server.prisma);
    // check if username or email already exists
    try {
        console.log('[Signup Controller] Checking for existing username or email');
        const existingUser = await userService.getUserByEmail(inputData.email)
            || await userService.getUserByUsername(inputData.username);
        if (existingUser) {
            console.log('[Signup Controller] Username or email already exists');
            // send back error response
            return reply.code(409).send({
                message: 'Username or email already exists',
                signupComplete: false,
            });
        }
    }
    catch (error) {
        console.error('[Signup Controller] Error checking existing user:', error);
        return reply.code(500).send({
            message: 'Internal server error during signup',
            signupComplete: false,
        });
    }
    // Step 3: proceed to register the user
    try {
        console.log('[Signup Controller] Credentials validated, proceeding to register user');
        const authService = new auth_services_1.AuthService(request.server);
        const signupResponse = await authService.registerUser(inputData);
        if (!signupResponse.signupComplete) {
            return reply.code(400).send(signupResponse);
        }
        // Successful registration redirect to signin page
        console.log('[Signup Controller] User registered successfully');
        return reply.code(201).send(signupResponse);
    }
    catch (error) {
        console.error('[Signup Controller] Error during user registration:', error);
        return reply.code(500).send({
            message: 'Internal server error during signup',
            signupComplete: false,
        });
    }
}
// signin controller to handle signin requests  
async function signinController(request, reply) {
    console.log('[Signin Controller] Received signin request');
    const inputData = request.body;
    const authService = new auth_services_1.AuthService(request.server);
    try {
        // authenticate the user
        const loginResponse = await authService.authenticateUser(inputData);
        if (!loginResponse.signinComplete) {
            return reply.code(401).send(loginResponse);
        }
        console.log('[Signin Controller] User authenticated successfully');
        // prepare BASIC response data
        const responseData = {
            message: loginResponse.message,
            signinComplete: loginResponse.signinComplete,
            twoFactorRequired: loginResponse.twoFactorRequired,
            methodsEnabled: loginResponse.methodsEnabled,
        };
        // handle 2FA requirement
        if (loginResponse.twoFactorRequired) {
            console.log('[Signin Controller] 2FA required, sending response without access tokens');
            jwt_utils_1.JwtUtils.setTempTokenCookie(reply, loginResponse.tempToken);
            return reply.code(200).send(responseData); // or redirect to 2FA page
        }
        // no 2FA required, set JWT cookies
        console.log('[Signin Controller] No 2FA required, setting JWT cookies');
        // set JWT cookies
        jwt_utils_1.JwtUtils.setRefreshTokenCookie(reply, loginResponse.refreshToken);
        jwt_utils_1.JwtUtils.setAccessTokenCookie(reply, loginResponse.accessToken);
        console.log('[Signin Controller] JWT cookies set successfully');
        console.log('[Signin Controller] responseData:', responseData);
        return reply.code(200).send(responseData);
    }
    catch (error) {
        console.error('[Signin Controller] Error during authentication:', error);
        return reply.code(500).send({
            message: 'Internal server error during authentication',
            signinComplete: false,
        });
    }
}
// controller to get user profile
async function getProfileController(request, reply) {
    // JwtMiddleware(request, reply);
    // return; // ensure middleware is executed before proceeding
    console.log('[Profile Controller] Received profile request');
    const redisClient = request.server.redis;
    const authService = new auth_services_1.AuthService(request.server);
    const user = await (0, auth_middleware_1.JwtMiddleware)(request, reply);
    if (!user) {
        console.error('[Profile Controller] Unauthorized: No valid user found after middleware');
        return; // response already sent in middleware
    }
    try {
        // check if user profile is cached in redis
        const cachedProfile = await redisClient.get(`user_profile:${user.userId}`);
        if (cachedProfile) {
            console.log('[Profile Controller] User profile retrieved from cache for user ID:', user.userId);
            return reply.code(200).send(JSON.parse(cachedProfile));
        }
        else {
            console.log('[Profile Controller] No cached profile found, fetching from database for user ID:', user.userId);
            const userProfile = await authService.getUserProfile(user.userId);
            if (!userProfile) {
                console.error('[Profile Controller] User profile not found for user ID:', user.userId);
                return reply.code(404).send({ message: 'User profile not found ❌' });
            }
            // store user profile in redis cache (optional) 
            await redisClient.set(`user_profile:${user.userId}`, JSON.stringify(userProfile), 'EX', 15 * 60 // 15 minutes expiration
            );
            console.log('[Profile Controller] User profile retrieved successfully for user ID:', user.userId);
            return reply.code(200).send(userProfile);
        }
    }
    catch (error) {
        console.error('[Profile Controller] Error retrieving user profile:', error);
        return reply.code(500).send({ message: 'Internal server error ❌' });
    }
}
/* ************************************************************************** */
// change password controller
async function changePasswordController(request, reply) {
    console.log('[Change Password Controller] Received change password request');
    const authService = new auth_services_1.AuthService(request.server);
    const cookies = jwt_utils_1.JwtUtils.extractCookiesFromRequest(request);
    const access_token = jwt_utils_1.JwtUtils.extractTokenFromCookies(cookies, 'access_token');
    const user = jwt_utils_1.JwtUtils.extractUserFromAccessToken(access_token);
    if (!user) {
        console.error('[Change Password Controller] Unauthorized: No valid user found in request');
        return reply.code(401).send({ message: 'Unauthorized ❌' });
    }
    const { currentPassword, newPassword } = request.body;
    if (!currentPassword || !newPassword) {
        console.error('[Change Password Controller] Bad Request: Missing current or new password');
        return reply.code(400).send({ message: 'Bad Request: Missing current or new password',
            passwordChangeComplete: false
        });
    }
    try {
        const changeResult = await authService.changeUserPassword(user.userId, currentPassword, newPassword);
        if (!changeResult.passwordChangeComplete) {
            console.error('[Change Password Controller] Password change failed:', changeResult.message);
            return reply.code(400).send(changeResult);
        }
        console.log('[Change Password Controller] Password changed successfully for user ID:', user.userId);
        return reply.code(200).send(changeResult);
    }
    catch (error) {
        console.error('[Change Password Controller] Error during password change:', error);
        return reply.code(500).send({
            message: 'Internal server error during password change',
            passwordChangeComplete: false,
        });
    }
}
const storage_utils_1 = require("../../utils/storage.utils");
// upload avatar controller
async function uploadAvatarController(request, reply) {
    console.log('[Upload Avatar Controller] START');
    const authService = new auth_services_1.AuthService(request.server);
    // extract user from access token
    const cookies = jwt_utils_1.JwtUtils.extractCookiesFromRequest(request);
    const access_token = jwt_utils_1.JwtUtils.extractTokenFromCookies(cookies, 'access_token');
    const user = jwt_utils_1.JwtUtils.extractUserFromAccessToken(access_token);
    if (!user) {
        return reply.code(401).send({ message: 'Unauthorized ❌' });
    }
    try {
        const data = await request.body;
        const file = data.avatar;
        console.log('[Upload Avatar Controller] File received:', file);
        console.log('[Upload Avatar Controller] File name:', file.filename);
        if (!file) {
            return reply.code(400).send({ message: 'No avatar file provided', uploadComplete: false });
        }
        // new unique file name to avoid conflicts
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path_1.default.extname(file.filename);
        const newFileName = `avatar-${user.userId}-${uniqueSuffix}${fileExtension}`;
        console.log('[Upload Avatar Controller] New file name:', newFileName);
        // read file buffer
        const buffer = await file.toBuffer();
        console.log('[Upload Avatar Controller] File buffer size:', buffer.length);
        // upload to GCP Storage
        /****************************************************** */
        const filePath = await (0, storage_utils_1.uploadAvatar)(buffer, newFileName, file.mimetype);
        // const signedUrl = await generateSignedUrl(newFileName, 24 * 3600); // URL valide 24h
        //****************************************************** */
        console.log('[Upload Avatar Controller] File saved successfully:', filePath);
        console.log('[Upload Avatar Controller] basename:', path_1.default.basename(filePath));
        // console.log('[Upload Avatar Controller] signedUrl:', signedUrl);
        const avatarUrl = filePath; // use direct GCP URL
        console.log('[Upload Avatar Controller] avatarUrl:', avatarUrl);
        // update user url avatar in database
        const result = await authService.uploadUserAvatar(user.userId, avatarUrl);
        return reply.code(200).send(result);
    }
    catch (error) {
        console.error("[Upload Avatar Controller] ERROR:", error);
        return reply.code(500).send({
            message: error instanceof Error ? error.message : 'Internal server error during avatar upload',
            uploadComplete: false,
        });
    }
}
/* ************************************************************************** */
