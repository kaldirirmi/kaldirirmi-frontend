'use strict';
// In object-oriented programming languages, a Mixin is a class that contains methods for use by other classes without having to be the parent class of those other classes. How those other classes gain access to the mixin's methods depends on the language. Mixins are sometimes described as being "included" rather than "inherited".


const obj1 = {
  name: 'Hakke',
  city: 'IStanbul'
};

const mix1 = {
  toString(){
    return `${this.name} was born in ${this.city}`;
  },
  age(){
    const year = new Date().getFullYear();
    return year;
  }
};

const mix2= {
  toString(){
    `return ${this.name} `;
  }
}

Object.assign(obj1, mix1, mix2);

obj1.age();
obj1.toString();



const EnumerableFirstLast = (function(){ // function based module pattern.
  const first = function(){
    return this[0];
  },
  last = function(){
    return this[this.length - 1];
  };

  return function(){
    this.first = first;
    this.last = last;
  };
}());


EnumerableFirstLast.call(Array.prototype);

const a = [1, 2, 3];

a.first();
a.last();



// IIFE (Immediately Invoked Function Expression) is a JavaScript function that runs as soon as it is defined.

// It is a design pattern which is also known as Self-Executing Anonymous Function and contains two major parts. The first is the anonymous function with lexical scope enclosed within the Grouping Operator (). This prevents accessing variables within the IIFE idiom as well as polluting the global scope.

// The second part is creating the immediately executing function expression (), through which the JavaScript engine will directly interpret the function.
var result = (function () { 
  var name = "Barry"; 
  return name; 
})(); 
// Immediately creates the output: 
result; // "Barry"



(() => {
  //define the behavior
  const SomeBehavior = {

  };

  //add the behavior to a spesific namespace ..
  const ns = (window.SomeNamespace = window.SomeNamespace || { });
  ns.SomeBehavior = SomeBehavior;

})();

  class SomeElement {
    beforeRegister(){
      this.is = 'some-element';
    }

    get behaviors(){
      return[window.SomeNamespace.SomeBehavior]
    }

    set behaviors(val){
      this._behaviors = val;
    }
  }