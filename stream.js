function Stream(){
    
    var lazy = function(fun /*, arguments*/){
      var parameters = [].splice.call(arguments, 1);  
      
      return function(/*arguments*/){
        var args = parameters.concat([].slice.call(arguments, 0));
        return fun.apply(fun, args);
      };
    }; 
    
    var cons = function(head, tail){
        var result = new Stream();
        result._head = head;
        result._tail = tail;
        result.isEmpty = false;
        result.head = function(){
          return result._head;  
        };
        result.tail = function(){
            return result._tail();
        };
        return result;
    };
    
    var empty = function(){
        var result = new Stream();
        result.head = function(){
            throw "head on empty";
        };
        result.tail = function(){
            throw "tail on empty";
        };
        result.isEmpty = true;
        return result;
    };    
    
    var init = function(a){
      //console.log("init");
      if(a.length === 0){
        return empty();    
      }else{
        return cons(a[0], lazy(function(){return init(a.splice(1));}));//be lazy
      }  
    };    
    
    this.stream = function(_source){
        return init(_source.slice(0));//TODO, better way to not destroy original array? here I make a copy
    };
    
    this.generate = function(seed, fun){
      var loop = function(seed){
        return cons(seed, lazy(function(){ return loop(fun(seed)); }));
      };
      
      return loop(seed);
    };
    
    this.generateFromStream = function(stream, fun){
      var loop = function(stream){
        return cons(stream.head(), lazy(function(){ return loop(fun(stream)); }));
      };
      
      return loop(stream);
    };    
    
    
    this.map = function(fun){
      //console.log("map");
      if(this.isEmpty){
          return empty();
      }else{
          var that = this;
          return cons(fun(this.head()), lazy(function(){return that.tail().map(fun);})); 
      }     
    };
    
    this.take = function(number){
        //console.log("take: " + number);
        if(this.isEmpty || number <= 0){
            return empty();
        }else if(number === 1){
           return cons(this.head(), lazy(function() { return empty();}));
        }else{
            var that = this;
            return cons(this.head(), lazy(function() { return that.tail().take(number-1);}));
        }
    };
    
    this.filter = function(predicate){
        if(this.isEmpty){
            return empty();
        }else{
            //console.log("filter: " + this.head());
            var that = this;
            if(predicate(this.head())){
              return cons(this.head(), lazy(function() { return that.tail().filter(predicate);}));  
            }else{
               return that.tail().filter(predicate); 
            }
        }
    };
    
    this.toArray = function(){
        var loop = function(s, acc){
            if(s.isEmpty){
              return acc;   
            }else{
                acc.push(s.head());
                return loop(s.tail(), acc);
            }
            
        };
        
        return loop(this, new Array());
    };
    
    this.Cons = function(head, tail){
        return cons(head,tail);
    };
    
    this.Empty = function(){
        return empty();
    };
    
    
        
}





