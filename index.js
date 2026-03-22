const postButton = document.getElementById('postBtn');
const postIn = document.getElementById('postIn');
const feed = document.getElementById('feed');

//popup elements
const createPost = document.getElementById('StartCreatePost');
const closePopup = document.getElementById('close');
const imgUpload = document.getElementById('imageInput');
const popup = document.getElementById('popup');


let image;

createPost.addEventListener('click', () => {
    popup.style.display = 'flex';
})
closePopup.addEventListener('click', () => {
    popup.style.display = 'none';
})

imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const existing = document.getElementById('imgPreview');
        if (existing != null) {
            existing.remove();
        }
        const preview = document.createElement('img');
        preview.id = 'imgPreview'
        preview.src = e.target.result;
        popup.firstElementChild.prepend(preview);

        image = e;
    };
    reader.readAsDataURL(file);

})


const storeName = "posts";

let db;
const request = indexedDB.open("MyTestDatabase", 3);
request.onerror = (event) => {
    console.error("Why didn't you allow my web app to use IndexedDB?!");
};
request.onsuccess = (event) => {
    db = event.target.result;

    db.onerror = (event) => {
        // Generic error handler for all errors targeted at this database's
        console.error(`Database error: ${event.target.error?.message}`);
    };

    getAllPosts().then(posts => {

        setFeed(posts);
    })

    postButton.addEventListener('click', () => addPost({
        Body: postIn.value, Image: image, createdAt: Date.now()
    }))
};

request.onupgradeneeded = (event) => {
    // Save the IDBDatabase interface
    const db = event.target.result;


    if (db.objectStoreNames.contains(storeName)) {
        db.deleteObjectStore(storeName); // Delete the object store
        console.log(`Object store '${storeName}' deleted successfully.`);
    } else {
        console.log(`Object store '${storeName}' not found.`);
    }

    // Create an objectStore for this database
    const objectStore = db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
};

function addPost(data) {
    popup.style.display = 'none';
    postIn.value = "";
    addToFeed(data)
    if (data.Body == "") {
        return
    }
    console.log(data)
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    const request = store.add(data);

    request.onerror = (event) => {
        console.error("Add failed:", event.target.error);
    };
}

function getAllPosts() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);

        const request = store.getAll();

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

function setFeed(posts) {
    console.log(posts)
    posts.forEach(postData => {
        addToFeed(postData)
    });
}
function addToFeed(postData) {
    postContainer = document.createElement('div');
    postContainer.classList.add('post');

    postContent = document.createElement('p');
    postContent.textContent = postData.Body;
    postContainer.append(postContent);
    if (postData.Image) {
        tempDiv = document.createElement('div');
        tempDiv.style.textAlign = "center";

        postImage = document.createElement('img');
        postImage.src = URL.createObjectURL(postData.Image);
        tempDiv.append(postImage)
        postContainer.append(tempDiv);
    }


    feed.prepend(postContainer);
}