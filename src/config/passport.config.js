import passport from "passport";
import local from "passport-local";
import GitHubStrategy from "passport-github2";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { generaHash, validaHash } from "../utils/utils.js"; 
import User from "../dao/models/user.js";
import { config } from "./config.js"; 

const searchToken = (req) => {
    let token = null;

    if (req.cookies && req.cookies.jwt) {
        console.log(`Passport receives token...`);
        token = req.cookies.jwt;
    }
    return token;
};

export const initPassport = () => {
    passport.use("register",
        new local.Strategy(
            {
                passReqToCallback: true, 
                usernameField: "email"
            },
            async (req, email, password, done) => {
                try {
                    const { first_name, last_name, age } = req.body;

                    if (!first_name || !last_name || !email || !password || !age) {
                        return done(null, false, { message: "All fields are required." });
                    }

                    let existingUser = await User.findOne({ email });
                    if (existingUser) {
                        return done(null, false, { message: "User already exists." });
                    }

                    const hashedPassword = generaHash(password);

                    const newUser = new User({
                        first_name,
                        last_name,
                        email,
                        age: Number(age), 
                        password: hashedPassword,
                        role: "user"
                    });

                    await newUser.save();

                    return done(null, newUser);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    passport.use("login",
        new local.Strategy(
            {
                usernameField: "email"
            },
            async (email, password, done) => {
                try {
                    const user = await User.findOne({ email }).lean(); 
                    if (!user) {
                        return done(null, false, { message: "Incorrect email." });
                    }

                    const match = validaHash(password, user.password);
                    if (!match) {
                        return done(null, false, { message: "Incorrect password." });
                    }

                    delete user.password; 

                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    passport.use("github",
        new GitHubStrategy(
            {
                clientID: "Iv23ligedxuASWuSO3Om",
                clientSecret: "c736ecd9977af971cf4530fae3532a69d63e4ac8",
                callbackURL: "http://localhost:8080/api/sessions/callbackGitHub",
                scope: ['user:email']
            },
            async (token, rt, profile, done) => {
                try {
                    let email = profile.emails && profile.emails[0] ? profile.emails[0].value : profile._json.email;
                    let name = profile.displayName || profile.username;

                    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
                        console.log('Error: Invalid email');
                        return done(null, false);
                    }

                    if (!name) {
                        console.log('Error: Missing name, using default.');
                        name = "GitHub User";
                    }

                    let usuario = await User.findOne({ email });
                    if (!usuario) {
                        usuario = await User.create({ 
                            first_name: name,
                            last_name: "GitHubUser",
                            email,
                            password: "placeholder-password",
                            profileGithub: profile
                        });
                    }
                    return done(null, usuario);
                } catch (error) {
                    console.error('GitHub authentication failed:', error);
                    return done(error);
                }
            }
        )
    );

    passport.use("current",
        new JWTStrategy(
            {
                jwtFromRequest: ExtractJwt.fromExtractors([searchToken]),
                secretOrKey: config.JWT_SECRET, 
            },
            async (jwt_payload, done) => {
                try {
                    const user = await User.findById(jwt_payload.id).lean(); 
                    if (user) {
                        return done(null, user);
                    } else {
                        return done(null, false);
                    }
                } catch (error) {
                    return done(error, false);
                }
            }
        )
    );
};