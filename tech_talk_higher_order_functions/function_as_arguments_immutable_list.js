/*
 * 
 * An immutable List.
 * 
 * This list is for demonstration purposes only, i.e. should not be used in production.
 * 
 * The list will stack overflow for large lists.
 */
var List = (function () {

    function LinkedList() {
        
        /*
         * Adds an element at the beginning of this list.
         * 
         * @param {type} element: the element to prepend. 
         * @returns a list which contains x as first element and which continues with this list.
         */
        this.cons = function (element) {
            return new Cons(element, this);
        };
        
        /*
         * Applies a function f to all elements of this list.
         * 
         * @param {type} fun: the function that is applied for its side-effect to every element. The result of function f is discarded.
         * @returns {undefined}
         */
        this.forEach = function (fun) {
            if (this.isEmpty()) {
                return;
            } else {
                fun(this.head());
                this.tail().forEach(fun);
            }
        };
        
        /*
         * Builds a new collection by applying a function to all elements of this list.
         * 
         * @param {type} fun: the function to apply to each element
         * @returns a new list resulting from applying the given function f to each element of this list and collecting the results. 
         */
        this.map = function (fun) {
            if (this.isEmpty()) {
                return this;
            } else {
                return new Cons(fun(this.head()), this.tail().map(fun));
            }
        };
        
        /*
         * Alternative version of map to avoid code duplication. 
         * 
         * If javascript supported tail recursive optimization it would be better to use foldLeft
         * and then reverse.  
         * 
         */
        this.map_2 = function(fun){
            return this.foldRight(new Empty(), function(acc, v) {
                return new Cons(fun(v),acc);
            });  
        };
        
        /*
         * 
         * @returns A list that is reversed.
         */
        this.reverse = function(){
            var loop = function(list, acc){
                if (list.isEmpty()){
                    return acc;
                }else{
                    return loop(list.tail(), new Cons(list.head(), acc));
                }
            };
            
            return loop(this, new Empty());   
        };
       
        /*
         * Alternative version of reverse to avoid code duplication. 
         * 
         */        
        this.reverse_2 = function(){
            return this.foldLeft(new Empty(), function(acc, v){
               return new Cons(v,acc); 
            });
        };
        
        /*
         * Selects all elements of this traversable collection which satisfy a predicate.
         * 
         * @param {type} predicate: the predicate used to test elements.
         * @returns a new List consisting of all elements of this List that satisfy the given predicate. The order of the elements is preserved. 
         */
        this.filter = function (predicate) {
            if (this.isEmpty()) {
                return new Empty();
            } else {
                if (predicate(this.head())) {
                    return new Cons(this.head(), this.tail().filter(predicate));
                } else {
                    return this.tail().filter(predicate);
                }
            }
        };
        
        this.filter_2 = function(predicate) {
            return this.foldRight(new Empty(), function(acc, v){
                if(predicate(v)){
                    return new Cons(v, acc);
                }else{
                    return acc;
                }
            });  
        };
        
        /*
         * The length of the List.
         * 
         * @returns the number of elements in this sequence.
         */
        this.length = function () {
            if (this.isEmpty()) {
                return 0;
            } else {
                return 1 + this.tail().length();
            }
        };    
        
        /*
         * 
         * Implementation of length using foldLeft
         */
        this.length_2 = function () {
            return this.foldLeft(0, function(acc){
                return acc + 1;
            });
        };
        
        /*
         * Selects all elements except first n ones
         * 
         * @param {type} number: the number of elements to drop from this list.
         * @returns a list consisting of all elements of this list except the first n ones, or else the empty list, if this list has less than n elements. 
         */
        this.drop = function(number){
            if(this.isEmpty() || number <= 0){
                return new Empty();
            }else{
               return this.tail().drop(number-1); 
            }
        };

        /*
         * Drops longest prefix of elements that satisfy a predicate.
         * 
         * @param {type} predicate
         * @returns the longest suffix of this list whose first element does not satisfy the predicate p. 
         */
        this.dropWhile = function(predicate){
            if(this.isEmpty() || !predicate(this.head())){
                return new Empty();
            }else{
               return this.tail().dropWhile(predicate); 
            }
        };        

        /*
         * Selects first n elements.
         * 
         * @param {type} number: the number of elements to take from this list.
         * @returns a list consisting only of the first n elements of this list, or else the whole list, if it has less than n elements. 
         */
        this.take = function(number){
            if(this.isEmpty() || number <= 0){
                return new Empty();  
            } else{
                return new Cons(this.head(), this.tail().take(number-1));
            }    
        };

     
        /*
         * Takes longest prefix of elements that satisfy a predicate.
         * 
         * @param {type} predicate
         * @returns the longest prefix of this list whose elements all satisfy the predicate p.
         */
        this.takeWhile = function(predicate){
            if(this.isEmpty() || !predicate(this.head())){
                return new Empty();  
            } else{
                return new Cons(this.head(), this.tail().takeWhile(predicate));
            }    
        };        
        

        /*
         * Applies a binary operator to all elements of this list and a start value, going right to left.
         * 
         * @param {type} initial: the start value.
         * @param {type} fun : the binary operator
         * @returns the result of inserting op between consecutive elements of this list, going right to left with the start value z on the right:
         * op(x_1, op(x_2, ... op(x_n, z)...)) where x1, ..., xn are the elements of this list. 
         */
        this.foldRight = function (initial, fun) {
            if (this.isEmpty()) {
                return initial;
            } else {
                return fun(this.tail().foldRight(initial, fun), this.head());
            }
        };        
        
        /*
         * Applies a binary operator to a start value and all elements of this sequence, going left to right.
         * 
         * @param {type} initial: the start value.
         * @param {type} fun : the binary operator
         * @returns the result of inserting op between consecutive elements of this sequence, going left to right with the start value z on the left:
         * op(...op(z, x_1), x_2, ..., x_n) where where x1, ..., xn are the elements of this sequence. 
         */
        this.foldLeft = function (initial, fun) {
            if (this.isEmpty()) {
                return initial;
            } else {
                return this.tail().foldLeft(fun(initial, this.head()), fun);
            }
        };
        


    }
    ;

    /*
     * Represents the non empty List.
     * 
     * head: the first element of the List.
     * tail: the rest of the List.
     */
    function Cons(_head, _tail) {
        var head = _head;
        var tail = _tail;

        this.head = function () {
            return head;
        };

        this.tail = function () {
            return tail;
        };

        this.isEmpty = function () {
            return false;
        };
    }
    ;
    //inherit from LinkedList
    Cons.prototype = new LinkedList();

   /*
    * Represents the empty List.
    */
    function Empty() {
        this.head = function () {
            throw "head on empty";
        };

        this.tail = function () {
            throw "tail on empty";
        };
        
        this.isEmpty = function () {
            return true;
        };
    }
    ;

    //inherit from LinkedList
    Empty.prototype = new LinkedList();


    function List() {

        var init = function (source) {
            if (source === undefined || source.length === 0) {
                return new Empty();
            } else {
                return new Cons(source[0], init(source.slice(1, source.length)));
            }
        };


        return init(Array.prototype.slice.call(arguments, 0));
    }

    return List;
})();

