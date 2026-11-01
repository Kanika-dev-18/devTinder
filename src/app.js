const express = require("express");

const app = express();

app.get("/test",(req,res)=>{
    res.send("getting");
});
app.post("/kanika", (req,res)=>{
    res.send("Kanika, this side. POSTED!!!!");
})
app.delete("/kanika", (req,res)=>{
    res.send("DELETED!!!!");
})

app.listen(3000, ()=>{
    console.log("server success");
});