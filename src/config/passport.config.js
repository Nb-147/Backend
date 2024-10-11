import passport from "passport";
import local from "passport-local";
import GitHubStrategy from "passport-github2";
import User from "../dao/models/user.js";

export const initPassport = () => {

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

    // Local Strategy
    passport.use("login", 
        new local.Strategy(
            {
                usernameField: "email"
            },
            async (username, password, done) => {
                try {
                    return done(null, { nombre: "Juan", email: "juan@test.com" });
                } catch (error) {
                    return done(error);
                }
            }   
        )
    );

    passport.serializeUser((user, done) => {
        return done(null, user);
    });
    passport.deserializeUser((user, done) => {
        return done(null, user);
    });
};
