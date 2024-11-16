import express from 'express';
import passport from 'passport';
import sessionsController from '../controllers/sessionsController.js';

const router = express.Router();

router.get("/error", sessionsController.getError);
router.get('/register', sessionsController.getRegister);
router.get('/github', passport.authenticate("github", { session: false }));
router.get("/callbackGithub", passport.authenticate("github", { failureRedirect: "/api/sessions/error", session: false }), sessionsController.githubCallback);
router.get('/logout', sessionsController.getLogout);
router.get('/current', sessionsController.getCurrent);

router.post('/register', sessionsController.postRegister);
router.post('/login', sessionsController.postLogin);

export default router;