import axios from 'axios';
import { $ } from './bling';

//hook up to submit event on the form tag (heart)
function ajaxHeart (e) {
  e.preventDefault();
  axios
    .post(this.action)
    .then(res => {
      //check if form is already hearted. can access name property on the html element by doing this.heart in this case
      const isHearted = this.heart.classList.toggle('heart__button--hearted');

      //res.data gives the entire user, .hearts gives the hearts array, length will give the actual length of the array of objects and will be updated during the then
      $('.heart-count').textContent = res.data.hearts.length;
      if(isHearted) {
        this.heart.classList.add('heart__button--float');
        setTimeout(() => this.heart.classList.remove('heart__button--float'), 2500);
      }
    })
    .catch(console.error);
}

export default ajaxHeart;
