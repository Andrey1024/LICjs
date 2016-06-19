define(["require","exports","./LexAnalyser","./Poliz"],function(a,b,c,d){"use strict";var e=function(){function a(){this.currIndex=0,this.poliz=new d.CommandList,this.varList=new Object,this.lexems=[]}return a.prototype.currLex=function(){return this.lexems.length<=this.currIndex?{type:c.LexType.lex_null,value:""}:this.lexems[this.currIndex]},a.prototype.Expression=function(){var a=!1;for(this.currLex().type===c.LexType.lex_minus&&(a=!0,this.currIndex++),this.Term(),a&&this.poliz.Push(new d.PolizUnaryMinus);this.currLex().type===c.LexType.lex_plus||this.currLex().type===c.LexType.lex_minus;){var b=this.currLex().type;switch(this.currIndex++,this.Term(),b){case c.LexType.lex_plus:this.poliz.Push(new d.PolizAdd);break;case c.LexType.lex_minus:this.poliz.Push(new d.PolizMinus)}}},a.prototype.Term=function(){for(this.Factor();this.currLex().type===c.LexType.lex_mul||this.currLex().type===c.LexType.lex_div;){var a=this.currLex().type;switch(this.currIndex++,this.Factor(),a){case c.LexType.lex_mul:this.poliz.Push(new d.PolizMul);break;case c.LexType.lex_div:this.poliz.Push(new d.PolizDiv)}}},a.prototype.Factor=function(){switch(this.currLex().type){case c.LexType.lex_number:this.poliz.Push(new d.PolizConst(this.currLex().value)),this.currIndex++;break;case c.LexType.lex_lbracket:if(this.currIndex++,this.Expression(),this.currLex().type!==c.LexType.lex_rbracket)throw"Expected closing bracket";break;case c.LexType.lex_func:this.Function();break;case c.LexType.lex_var:this.varList[this.currLex().value]=new d.Variable(this.currLex().value),this.poliz.Push(new d.PolizVarAddr(this.varList[this.currLex().value])),this.poliz.Push(new d.PolizVar),this.currIndex++;break;default:throw"Bad factor"}},a.prototype.Function=function(){var a=this.currLex().value;if(this.currIndex++,this.currLex().type!==c.LexType.lex_lbracket)throw"Expected opening bracket";for(this.currIndex++,this.Expression();this.currLex().type===c.LexType.lex_comma;)this.currIndex++,this.Expression();if(this.currLex().type!==c.LexType.lex_rbracket)throw"Expected closing bracket";switch(a){case"sin":this.poliz.Push(new d.PolizSin);break;case"cos":this.poliz.Push(new d.PolizCos);break;case"pow":this.poliz.Push(new d.PolizPow)}this.currIndex++},a.prototype.Parse=function(a){this.lexems!==a&&(this.lexems=a,this.poliz.Reset(),this.varList={},this.currIndex=0,this.Expression())},a.prototype.Execute=function(a){var b=new d.Stack;this.poliz.SetStart();for(var c=0;c<a.length;c++)this.varList.hasOwnProperty(a[c].name)&&(this.varList[a[c].name].value=a[c].value);for(;this.poliz.GetCurrent();)this.poliz.GetCurrent().evaluate(b,this.poliz);return b.Pop().value},a.prototype.Simplify=function(){},a}();b.Parser=e});