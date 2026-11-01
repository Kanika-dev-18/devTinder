const auth = (req,res,next)=>{
    const token="kanika";
    const isVerified = token ==="kanika";
    if(isVerified){
        console.log(" verified");
        next();
    }else{
        res.status(401).send("unauthorized request");
    }
}

module.exports = {auth,}