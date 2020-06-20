var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/users");

router.get("/", function(req,res){
	res.render("landing");
})

router.get("/register", function(req,res){
					req.flash("error","Try Again!")
	res.render("./register")
});

router.post("/register", function(req,res){
	User.register(new User({username: req.body.username}), req.body.password, function(err,user){
		if(err){
			    return res.render("register")
		} else{
			passport.authenticate("local")(req,res,function(){
				req.flash("success","Successfully signed up!")
				res.redirect("/campgrounds");
			})
		}
	})
});

router.get("/login", function(req,res){
	req.flash("success","Successfully logged in!")
	res.render("./login")
});

router.post("/login",passport.authenticate("local", {
	successRedirect: "/campgrounds",
    failureRedirect: "/login"}), function(req,res){
});

router.get("/logout", function(req,res){
	req.logout();
	req.flash("success", "Logged Out!");
	res.redirect("/campgrounds");
});

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	} else{
		res.redirect("/login")
	}
};

module.exports = router;
