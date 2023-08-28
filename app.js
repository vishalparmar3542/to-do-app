const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
require("dotenv").config();
let items = [];
const Itemschema = new mongoose.Schema({
  name: { type: String },
});
const newschema = new mongoose.Schema({
  name: { type: String },
  task: [Itemschema],
});

//  mongodb://127.0.0.1:27017/todolistDB
const Item = mongoose.model("Item", Itemschema);
const Newlist = mongoose.model("Newlist", newschema);
const demoitem1 = new Item({
  name: "demo work2",
});
const demoitem2 = new Item({
  name: "demowork2",
});
const demoitem = [];
let col = [];

//mongodb://127.0.0.1:27017/todolistDB    //use this for local 
const url = process.env.MONGOLINK;
mongoose
  .connect(`mongodb+srv://${url}`,{ useNewUrlParser: true })
  .then(() => {
    console.log("Connected!");
  })
  .catch((err) => {
    console.log(`not able to connect  error is : "${err}`);
  });

async function getallcollection(home) {
  Newlist.find({}, { _id: 0, task: 0 }).then((val) => {
    val.forEach((ob) => {
      if (ob.name != home) col.push(ob.name);
    });
  });
}

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

let workItems = ["do homework"];
let today = new Date();
const options = {
  weekday: "long",
  day: "numeric",
  month: "long",
};

let day = today.toLocaleDateString("en-US", options);

app.get("/:listname", (req, res) => {
  items = [];
  col = [];
  getallcollection(req.params.listname);

  Newlist.find({ name: req.params.listname })
    .then(function (dbitem) {
      dbitem[0].task.forEach((obj) => {
        items.push(obj);
        console.log(obj);
      });
      res.render("List", {
        kindOfDay: day,
        type: req.params.listname,
        newListItems: items,
        collection: col,
      });
    })
    .catch((err) => {
      console.log("not able to do initial find from here" + err);
    });
});

app.get("/", (req, res) => {
  items = [];
  col = [];
  getallcollection("");
  Item.find()
    .then(function (dbitems) {
      dbitems.forEach(function (task) {
        items.push(task);

        // console.log(task);
      });
    })
    .then(() => {
      // console.log(items);

      console.log(col);
      res.render("List", {
        kindOfDay: day,
        type: "ALL Task's",
        newListItems: items,
        collection: col,
      });
    })
    .catch((err) => {
      console.log("not able to do initial find");
    });
});

app.post("/", (req, res) => {
  let item = req.body.newTask;
  const ntask = new Item({
    name: item,
  });
  if (item != "") {
    if (req.body.button != "ALL Task's") {
      Newlist.updateOne(
        { name: req.body.button },
        { $push: { task: ntask } }
      ).then(() => {
        console.log("success");
        res.redirect(`/${req.body.button}`);
      });
    } else {
      //console.log(req.body.newTask);
      ntask.save().then(() => console.log("done"));
      res.redirect("/");
    }
  } else {
    res.redirect("/");
  }
  // res.send();
});
app.post("/delete", (req, res) => {
  curList = req.body.Listname;
  const id = req.body.checkbox;
  if (curList != "ALL Task's") {
    Newlist.updateOne({ name: curList }, { $pull: { task: { _id: id } } })
      .then(() => {
        console.log("deleted");
      })
      .then(() => {
        res.redirect(`/${curList}`);
      });
  } else {
    Item.deleteOne({ _id: id })
      .then(() => {
        console.log("deleted");
      })
      .then(() => {
        res.redirect("/");
      });
  }
});
app.post("/create", (req, res) => {
  const listname = req.body.newTask;

  Newlist.findOne({ name: listname }).then((found) => {
    if (!found) {
      const newlistitem = new Newlist({
        name: listname,
        task: demoitem,
      });
      newlistitem.save().then(() => {
        console.log("datasaved");
        res.redirect(`/${listname}`);
      });
    } else {
      res.redirect(`/${listname}`);
    }
  });
});

app.listen(3000, () => {
  console.log("Server started");
});
