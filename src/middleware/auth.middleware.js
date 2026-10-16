const userModel = require("../models/user.models");
const jwt = require("jsonwebtoken");
async function authMiddleware(req, res, next) {
    //token can also be in headers.authorization as a Bearer token,
    //  so we check both places. header.authorization is a common way
    //  to send tokens in HTTP requests, where the token is prefixed with 
    // the word "Bearer" followed by a space.
    //header means the HTTP headers of the request, which can contain
    //  additional information about the request, such as authentication
    //  tokens, content type, etc.
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(401).json({message : "Unauthorized access, token not found", status: "failed"});
    }
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.user_Id);
        if(!user){
            return res.status(401).json({message : "Unauthorized access, user not found", status: "failed"});
        }
        req.user = user;
        next();
    }
    catch(err){
        return res.status(401).json({message : "Unauthorized access, token is invalid", status: "failed"});

    }
}
async function authSystemUserMiddleware(req,res,next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(401).json({message : "Unauthorized access, token not found", status: "failed"});
    }
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.user_Id).select("+systemUser");

        if(!user){
            return res.status(401).json({message : "Unauthorized access, user not found", status: "failed"});
        }

        if(!user.systemUser ){
            return res.status(403).json({message : "Forbidden access, not the a system user"});
        }
        req.user = user;
        next();
    }
    catch(err){
        return res.status(401).json({message : "Unauthorized access, token is invalid", status: "failed"});

    }

}
module.exports = {authMiddleware
    ,authSystemUserMiddleware
};