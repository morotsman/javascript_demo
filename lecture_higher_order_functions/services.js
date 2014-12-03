/*
 * Service represents a legacy component, only to look at it will generate weeks of regresion tests. 
 */
var orderService = {
    book: function (numberOfItems) {
        if (numberOfItems > 100) {//whoa, more then 100 items, better crash the application!!!
            throw "The number of items are above critical level.";
        }
        if (numberOfItems > 50) { //We never have more then 50 items anyway
            return {result: false, message: "Sorry, could not book that many items"};
        }
        var id = Math.floor(Math.random() * 100) + 1;
        return{
            result: true,
            id: id,
            message: numberOfItems + " items has been booked. The order id is: " + id
        };
    },
    isCreditOk: function (name) {
        if (name === "Niklas") {//In him we trust
            return {result: true, message: "Credit Ok."};
        }
        return {result: false, message: "No credit for you " + name};//No way I give credit to this person.
    },
    finalize: function (id, name) {
        if (id === 50) {//I realy don't like 50, Ok?
            throw "Something went wrong.";
        }
        var message = name ? ("Hi " + name + ", the items in order " + id + " are on the way.") : "The items in order " + id + " are on the way.";
        return {result: true, message: message};
    }
};

