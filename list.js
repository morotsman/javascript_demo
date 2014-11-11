
var List = (function(){
        
function List(_source){
    
    function ArrayList(){
        var cons = function(head, tail){
            var result = new ArrayList();
            result._head = head;
            result._tail = tail;
            result.isEmpty = false;
            result.head = function(){
              return result._head;  
            };
            result.tail = function(){
                return result._tail;
            };
            return result;
        };
    
        var empty = function(){
            var result = new ArrayList();
            result.head = function(){
                throw "head on empty";
            };
            result.tail = function(){
                throw "tail on empty";
            };
            result.isEmpty = true;
            return result;
        }; 
        
        this.init = function(a){
          //console.log("init");
          if(a.length === 0){
            return empty();    
          }else{
            return cons(a[0], this.init(a.splice(1)));
          }  
        };    
        
        this.forEach = function(fun){
          if(this.isEmpty){
            return;   
          }else{
            fun(this.head());
            this.tail().forEach(fun);
          }  
        }; 
        
        this.filter = function(predicate){
            if(this.isEmpty){
                return empty();
            }else{
                var that = this;
                if(predicate(this.head())){
                  return cons(this.head(), that.tail().filter(predicate));  
                }else{
                   return that.tail().filter(predicate); 
                }
            }
        }; 
        
        
        this.foldLeft = function(initial, fun){
            if(this.isEmpty){
                return initial;
            }else{
                return this.tail().foldLeft(fun(initial, this.head()), fun);
            }  
        };
    
        this.foldRight = function(initial, fun){
            if(this.isEmpty){
                return initial;
            }else{
                return fun(this.tail().foldRight(initial, fun), this.head());
            }  
        };        

        this.Cons = function(head){
            return cons(head,this);  
        };
        
    };
    
    var result = new ArrayList();
    return result.init(_source);
    

}

return List;
})();
