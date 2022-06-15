let form = document.getElementById('form');
let result = document.getElementById('result');

form.onsubmit = async (event) => {
    event.preventDefault();
    result.textContent = 'La recherche peut prendre un moment...';
    let article = document.getElementById('article-input').value;
    let response = await fetch('/.netlify/functions/search?article=' + encodeURI(article));
    let data = await response.json();
    result.textContent = data.join(' > ');
}