import users from "../data/users.json" assert { type: "json" };
import stories from "../data/stories.json" with { type: "json" };

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
