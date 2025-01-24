// import users from "../data/users.json" with { type: "json" };
import { readFileSync } from "fs";
const users = JSON.parse(
  readFileSync(new URL("../data/users.json", import.meta.url))
);
// import stories from "../data/stories.json" with { type: "json" };
const stories = JSON.parse(
  readFileSync(new URL("../data/stories.json", import.meta.url))
);

/** 
var result = users.find(t=>t.username ==='slavv');
if (!result){
    console.log('nothing in there');
} else {
console.log(result);
}
*/

let result = JSON.stringify(stories);
// console.log(result)
