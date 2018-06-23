import axios from 'axios';
import { $ } from './bling'

function ajaxHeart(e) {
  //stop default: post
  e.preventDefault();
  //take over with js
  axios
    .post(this.action)
    .then(res => {
      //.heart: bc its a name attribute inside our form
      const isHearted = this.heart.classList.toggle('heart__button--hearted');
      $('.heart-count').textContent = res.data.hearts.length;
      if(isHearted) {
        this.heart.classList.add('heart__button--float')
        //remove from page so doesnt get in way 
        setTimeout(() => this.heart.classList.remove('heart__button--float'), 
        2500);
      }
    })
    .catch(console.error)
  }

export default ajaxHeart;