let jwt = require("jsonwebtoken")
module.exports=(req,res,next)=>{
    console.log(req.header("authurization"));
    if(!req.header("authurization")){return res.status(400).json({status:400,msg:"jwt must be provided"})}
    let isAuthurize = jwt.verify(req.header("authurization"),process.env.JWT_SECRET)
    if(!isAuthurize){
      return res.status(401).json({status:401,msg:"not authurztion"})
    }  
    req.userId=isAuthurize.userId;
    next()
  }