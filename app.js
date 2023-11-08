const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

// var items = [];//array isliye ta ky alag items store hosken ismen or hmari list bnsky
// var workItems = [];

app.set('view engine', 'ejs');//must be below const app=express() line

app.use(bodyParser.urlencoded({ extended: true }));//we need bodyparser here to read the properties of text written in the text input field of our form

app.use(express.static("public"));

mongoose.connect("mongodb+srv://abdurrehman555:Aba109_100@cluster0.bm7nlaj.mongodb.net/todolistDB").then(() => console.log("Connected..")).catch((err) => console.log(err));
//connecting & creating our todolistDB with our todolist app

const toDoListSchema = new mongoose.Schema({
    name: String
});

const Item = new mongoose.model("Item", toDoListSchema);
//we need to define our schema & create our new model as well before inserting data in our DB
const items = async () => {

    try {
        const item1 = new Item({
            name: "Ur Mom"
        });
        const item2 = new Item({
            name: "Ur Other Mom"
        });
        const item3 = new Item({
            name: "Ur Dad"
        });

        const defaultItems = [item1, item2, item3];

        if (defaultItems === 0) {
            const itemData = await Item.insertMany(defaultItems);
            console.log("Successfully inserted default items to our Database..");
            res.redirect("/");
        } else {
            res.render(defaultItems);
        }
    } catch (error) {
        console.log(error.message);
    }
};
items();
//this function inserts items in our todolistDB's collection called 'items' 

app.get("/", async (req, res) => {

    const result = await Item.find({});

    res.render("list", { listTitle: "Today", newListItems: result });
});

const listSchema = new mongoose.Schema({
    name: String,
    items: [toDoListSchema]
});

const List = new mongoose.model("List", listSchema);
//customList model & schema

app.get("/:customListName", async (req, res) => {
    const customListName = _.capitalize(req.params.customListName);
    
    const newItem1 = new List({
        name: "Breakfast.."
    });
    const newItem2 = new List({
        name: "Mom"
    });
    const newItem3 = new List({
        name: "Dad"
    });

    const newDefaultItems = [newItem1, newItem2, newItem3];

    const foundList = await List.findOne({ name: customListName }).exec();

    if (!foundList) {
        const list = new List({
            name: customListName,
            items: newDefaultItems
        });
        await list.save();
        res.redirect("/"+ customListName);
    } else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
        
    }
});

app.post("/", async (req, res) => {
    const itemName = req.body.newItem;//requesting the newItem input value from our html body
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    } else {
        const foundList = await List.findOne({ name: listName }).exec();
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+ listName);//this will push new items in the new custom lists that we've made
    }
   
});

app.post("/delete", async (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){

        try {
            const data = await Item.findByIdAndDelete(checkedItemId);
            console.log("Successfully removed " + data.name);
            res.redirect("/");
        } catch (error) {
            console.log(error.message);
        }

    } else {
       const customData = await List.findOneAndUpdate({ name: listName },{ $pull:{ items:{_id: checkedItemId} }}, );
       console.log("removed "+ customData.name);
        res.redirect("/"+ listName);

    }
    

});

app.get("/about", function (req, res) {
    res.render("about");
});

app.listen(process.env.PORT || 3000, function () {
    console.log("Server started at port 3000");
});

// KEY:NO4PXMPB3YREQ7QWAWX342NUF5JVUUOE
//  heroku Authenticator app#2 verification code: 345611
// heroku app deployment video link:https://drive.google.com/drive/folders/1WRu8lKHYlUxwD-ewm-AVfyJu5Yx0DWd9