//webworker
// import x from "./mymod.js";

self.onmessage = () => {
	const fetchResp =	fetch("http://localhost:8000/gallery/workerImage.jpg");
	fetchResp.then(async (res) => {
		if(res.ok) {
		// const blobURL = URL.createObjectURL(await res.body.blob());
		const buffer = await res.arrayBuffer();
		self.postMessage({response: buffer}, {transfer: [buffer]});	
		}
		
	});
	// console.log("Hey, there you");
};

// console.log("x", x);