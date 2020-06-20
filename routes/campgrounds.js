var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");

router.get("/", function(req,res){
	res.render("landing");
})

router.get("/campgrounds", function(req,res){
	Campground.find({}, function(err, allcampgrounds){
		if(err){
			console.log(err)
		} else{
			res.render("index", {campgrounds: allcampgrounds, currentUser: req.user});
		}
	})
});

router.post("/campgrounds", isLoggedIn, function(req,res){
	var name = req.body.name;
	var image = req.body.image;
	var description = req.body.description;
	var price = req.body.price;
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var newCampground = {name: name, image: image, description: description, author: author, price: price};
	Campground.create(newCampground, function(err,addedCampground){
		if(err){
			console.log(err)
		} else{
			req.flash("success", "Campground successfully added!")
			res.redirect("/campgrounds")
		}
	})
});

router.get("/campgrounds/new", isLoggedIn, function(req,res){
	res.render("new");
})
router.get("/campgrounds/:id", function(req,res){
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err){
			console.log(err)
		} else{
			res.render("show", {campground: foundCampground})
		}
	})
});

router.get("/campgrounds/:id/edit", checkOwnership, function(req,res){
	   Campground.findById(req.params.id, function(err,foundCampground){
			   res.render("edit", {campground: foundCampground})
		})
});

router.put("/campgrounds/:id",checkOwnership, function(req,res){
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err,updatedCampground){
		if(err){
			res.redirect("/campgrounds")
		} else{
			req.flash("success", "Campground successfully updated!")
			res.redirect("/campgrounds/" + req.params.id)
		}
	})
});

router.delete("/campgrounds/:id",checkOwnership, function(req,res){
	Campground.findByIdAndRemove(req.params.id,function(err){
		if(err){
			res.redirect("/campgrounds");
		} else{
			req.flash("success", "Campground successfully deleted!")
			res.redirect("/campgrounds");
		}
	});
});

router.get("/campgrounds/:id/comments/:comment_id/edit",checkCommentOwnership, function(req,res){
	Comment.findById(req.params.comment_id, function(err, foundComment){
		if(err){
			console.log(err)
		} else{
			res.render("comments/edit" ,{campground_id: req.params.id, comment: foundComment })
		}
		
})
	});

router.put("/campgrounds/:id/comments/:comment_id",checkCommentOwnership, function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, foundComment){
		if(err){
			res.redirect("back")
		} else{
			req.flash("success", "Comment successfully updated!")
			res.redirect("/campgrounds/" + req.params.id )
		}
	})
});

router.delete("/campgrounds/:id/comments/:comment_id",checkCommentOwnership, function(req,res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			res.redirect("back")
		} else{
			req.flash("success","Comment deleted!")
			res.redirect("/campgrounds/" + req.params.id );
		}
	})
});



function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	} else{
		req.flash("error","You need to be logged in!")
		res.redirect("/login")
	}
};


function checkOwnership(req,res,next){
if(req.isAuthenticated()){
	   Campground.findById(req.params.id, function(err,foundCampground){
		if(err){
			console.log(err);
			res.redirect("/campgrounds")
		} else{
			if(foundCampground.author.id.equals(req.user._id)){
			   next();
			   } else{
				   req.flash("error","Permission Denied!")
				   res.redirect("back")
			   }
		}
	})
	   } else{
		   req.flash("error","You need to be logged in!")
	       res.redirect("back");
} };

function checkCommentOwnership(req,res,next){
if(req.isAuthenticated()){
	   Comment.findById(req.params.comment_id, function(err,foundComment){
		if(err){
			req.flash("error","Campground not found")
			console.log(err);
			res.redirect("/campgrounds")
		} else{
			if(foundComment.author.id.equals(req.user._id)){
			   next();
			   } else{
				   req.flash("error","Permission Denied!")
				   res.redirect("back")
			   }
		}
	})
	   } else{
		   req.flash("error","You need to be logged in!")
	       res.redirect("back");
} };




module.exports = router;