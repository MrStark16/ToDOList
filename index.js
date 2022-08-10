//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Sachin:Sachin16@cluster0.he5lbzo.mongodb.net/todolistDB" , {useNewUrlParser:true} );

const itemsSchema = {
  name:String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name : "Welcome to your todolist !"
});

const item2 = new Item({
  name : "Hit the + button to aff a new item"
});

const item3 = new Item({
  name : "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];



const listSchema = {
  name: String,
  items:[itemsSchema]
};

const List = mongoose.model("List", listSchema);




app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

    if(foundItems.length===0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfully saved default items to database");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
});

});

app.get("/:customListName", function(req,res){         //for dynamic routing
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList){
      if(!err){
        if(!foundList){
          //Create a New List
          const list = new List({
            name : customListName,
            items : defaultItems
          });

          list.save();
          res.redirect("/"+customListName);
        }
        else {
          //Show an existing list
          res.render("list",{listTitle: customListName, newListItems: foundList.items})  //list is name of ejs file and listTitle is dynamic ejs value
        }
      }
    });


});


app.post("/", function(req, res){

  const itemName = req.body.newItem;  //name attribute from form
  const listName = req.body.list;    // value attribute from form

  const item = new Item({
    name :itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});


app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox; //value attribute from input type checkbox //return item id
  const listName = req.body.listName;      // value attribute from input type hidden

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Successfully Deleted checked Item");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}, function(err ,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });


  }



});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);



// app.listen(port, function() {
//   console.log("Server has started Successfully");
// });
