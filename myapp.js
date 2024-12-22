import { Gallery } from './image-list.js';

const webworker = new Worker("./gallery/webworker.js");

const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = window.registration = await navigator.serviceWorker.register(
        'gallery/sw.js',
        {
          scope: './',//gallery/',
          type: "module"
        }
      );
      if (registration.installing) {
        console.log('Service worker installing');
      } else if (registration.waiting) {
        console.log('Service worker installed');
      } else if (registration.active) {
        console.log('Service worker active');
      }
      navigator.serviceWorker.ready.then((registration) => {
        console.log("Active service worker is available");
      });

       setTimeout(() => {
        // debugger;
    (registration?.active ?? registration?.installing ?? registration.waiting).postMessage("Hi service worker");
  
       }, 5000);

       // for(let i =0; i < 999999999; i++) {
       //  if(i % 300) continue;
       //  console.log(i);
       // }
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};

const imgSection = document.querySelector('section');

const getImageBlob = async (url) => {
  const imageResponse = await fetch(url);
  if (!imageResponse.ok) {
    throw new Error(
      `Image didn't load successfully; error code: ${
        imageResponse.statusText || imageResponse.status
      }`
    );
  }
  return imageResponse.blob();
};

const createGalleryFigure = async (galleryImage) => {
  try {
    const imageBlob = await getImageBlob(galleryImage.url);
    const myImage = document.createElement('img');
    const myCaption = document.createElement('caption');
    const myFigure = document.createElement('figure');
    const myName = document.createElement('span');
    myName.textContent = `${galleryImage.name}: `;
    const myCredit = document.createElement('span');
    myCredit.innerHTML = `Taken by ${galleryImage.credit}`;
    myCaption.append(myName, myCredit);
    myImage.src = window.URL.createObjectURL(imageBlob);
    myImage.setAttribute('alt', galleryImage.alt);
    myFigure.append(myImage, myCaption);
    imgSection.append(myFigure);
  } catch (error) {
    console.error(error);
  }
};

window["worker-btn"].addEventListener("click", () => {
  webworker.postMessage(["Hello"]);
});

webworker.onmessage = async ({data}) => {
  const galleryImage =  {
      name: 'Worker Image',
      alt: 'A random image for fetching by worker.',
      url: 'gallery/bountyHunters.jpg',
      credit:
        '<a href="https://www.flickr.com/photos/legofenris/">legOfenris</a>, published under a <a href="https://creativecommons.org/licenses/by-nc-nd/2.0/">Attribution-NonCommercial-NoDerivs 2.0 Generic</a> license.',
    };

  try {
    const imageBlob = new Blob([data.response]);
    const myImage = document.createElement('img');
    const myCaption = document.createElement('caption');
    const myFigure = document.createElement('figure');
    const myName = document.createElement('span');
    myName.textContent = `${galleryImage.name}: `;
    const myCredit = document.createElement('span');
    myCredit.innerHTML = `Taken by ${galleryImage.credit}`;
    myCaption.append(myName, myCredit);
    myImage.src = window.URL.createObjectURL(imageBlob);
    myImage.setAttribute('alt', galleryImage.alt);
    myFigure.append(myImage, myCaption);
    imgSection.append(myFigure);
  } catch (error) {
    console.error(error);
  }
}

console.log("Hello there, howdy?");
registerServiceWorker();
Gallery.images.map(createGalleryFigure);
