import hey, {sum, hello} from './helloworld';

var h1 = document.querySelector('h1');
var helloNode = document.createTextNode(hello);
var heyNode = document.createTextNode(hey());

h1.appendChild(helloNode);
h1.appendChild(heyNode);