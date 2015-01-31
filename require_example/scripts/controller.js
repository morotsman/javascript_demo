define(["./view", "./dao"], function(view, dao) {
    
        var MyController = function(){
            
            this.contentUpdated = function(){
                view.render(dao.getData());
            };
            
        };
    
    
        return new MyController();
    }
);