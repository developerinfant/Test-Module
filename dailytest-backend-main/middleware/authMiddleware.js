
const protect = (req, res, next) => {

    next();
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {

        console.warn('WARNING: authorizeRoles middleware is ineffective without proper authentication (e.g., JWTs or sessions).');
        next();
    };
};

module.exports = { protect, authorizeRoles };