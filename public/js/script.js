var ias = jQuery.ias({
  container:  '#posts',
  item:       '.post',
  pagination: '#pagination',
  next:       '.next'
});
ias.extension(new IASSpinnerExtension());

var toggle = document.getElementById("lightNight");
var classNight = document.getElementsByClassName('on');
var classLight = document.getElementsByClassName('off');

if (docCookies.getItem("nightMode") === 'on'){
  document.body.classList.add('on');
  document.body.classList.remove('off');
} else {
  document.body.classList.add('off');
  document.body.classList.remove('on');
}

function modifieTexte() {
  if (document.body.classList.contains('off') == true) {
    document.body.classList.add('on');
    document.body.classList.remove('off');
    docCookies.setItem("nightMode", "on", Infinity);
  } else {
    document.body.classList.add('off');
    document.body.classList.remove('on');
    docCookies.setItem("nightMode", "off", Infinity);
  }
}
toggle.addEventListener("click", modifieTexte, false);


function createNode(element) {
    return document.createElement(element);
}

function append(parent, el) {
  return parent.appendChild(el);
}

const section = document.getElementById('posts');
const url = '/api';

fetch(url)
.then((resp) => resp.json())

.then(function(data) {

  let authors = data;
  return authors.map(function(author) {

    let article = createNode('article'),
        header = createNode('header');
        footer = createNode('footer');

    article.classList.add('post');

    header.innerHTML = `<a target="_blank" href="${author.url}">${author.title}</a>`;
    footer.innerHTML = `<span class="source">Posté par ${author.source}</span><span class="heure"> à ${author.heure}</span>`;

    append(article, header);
    append(article, footer);
    append(section, article);

    if (author.dateToday != undefined){
      let div = createNode('div');
      div.classList.add('dateSection');
      div.innerHTML = `${author.dateToday}`;
      append(section, div);
    }
    if (author.url === undefined){
      article.classList.add('undefined');
    }

  })
})
.catch(function(error) {
  console.log(error);
});
