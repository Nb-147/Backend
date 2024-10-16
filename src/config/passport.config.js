import passport from "passport";
import local from "passport-local";
import GitHubStrategy from "passport-github2";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import bcrypt from "bcrypt";
import User from "../dao/models/user.js";
import { config } from "./config.js"; 

export const initPassport = () => {
    passport.use("register",
        new local.Strategy(
            {
                passReqToCallback: true, 
                usernameField: "email"
            },
            async (req, email, password, done) => {
                try {
                    const { firstName, lastName, age } = req.body;

                    if (!firstName || !lastName || !email || !password || !age) {
                        return done(null, false, { message: "All fields are required." });
                    }

                    let existingUser = await User.findOne({ email });
                    if (existingUser) {
                        return done(null, false, { message: "User already exists." });
                    }

                    const hashedPassword = await bcrypt.hash(password, 10);

                    const newUser = new User({
                        firstName,
                        lastName,
                        email,
                        age,
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
                    const user = await User.findOne({ email });
                    if (!user) {
                        return done(null, false, { message: "Incorrect email." });
                    }

                    const match = await bcrypt.compare(password, user.password);
                    if (!match) {
                        return done(null, false, { message: "Incorrect password." });
                    }

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
                        console.log('Error: Email inválido');
                        return done(null, false);
                    }

                    if (!name) {
                        console.log('Error: Falta nombre');
                        return done(null, false);
                    }

                    let usuario = await User.findOne({ email });
                    if (!usuario) {
                        usuario = await User.create({ 
                            firstName: name,
                            lastName: "GitHubUser",
                            email,
                            password: "placeholder-password",
                            profileGithub: profile
                        });
                    }
                    return done(null, usuario);
                } catch (error) {
                    console.error('Error en la autenticación de GitHub:', error);
                    return done(error);
                }
            }
        )
    );

    passport.use(
        new JWTStrategy(
            {
                jwtFromRequest: ExtractJwt.fromExtractors([(req) => req.cookies.jwt]),
                secretOrKey: config.JWT_SECRET, 
            },
            async (jwt_payload, done) => {
                try {
                    const user = await User.findById(jwt_payload.id);
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