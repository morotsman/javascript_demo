define(function() {
    
        var MyView = function(){
            
            this.render = function(content){
                console.log(content);
            };
            
        };
    
    
        return new MyView();
    }
);