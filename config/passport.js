const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const {userModel} = require("../models/user");

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, 
    function (email, password, cb) {
        return userModel.findOne({email, password})
           .then(user => {
               if (!user) {
                   return cb(null, false, {message: 'Email hoặc password không đúng'});
               }
               return cb(null, user, {message: 'Đăng nhập thành công'});
          })
          .catch(err => cb(err));
    }
));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret'
    },
    async(jwtPayload, cb) => {
        try {
            const user = await userModel.findOne({ 'email': jwtPayload.email });
            if (user) {
                return cb(null, user);
            }
        }
        catch (err) {
            return cb(err);
        }
    }
));