const queue = {
    items: [],

    enqueue: function(item) {
        if(this.items.indexOf(item) === -1) this.items.push(item);
        else {
            
        }
    },

    dequeue: function() {
        return this.items.shift();
    }


}