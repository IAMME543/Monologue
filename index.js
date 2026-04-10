const postButton = document.getElementById('postBtn');
const postIn = document.getElementById('postIn');
const feed = document.getElementById('feed');

//popup elements
const createPost = document.getElementById('StartCreatePost');
const closePopup = document.getElementById('close');
const imgUpload = document.getElementById('imageInput');
const imgBtn = document.getElementById('imageBtn');
const popup = document.getElementById('popup');
const hamburgerMenu = document.getElementById('hamburgerMenu');


const copy = document.getElementById('copy');
const remove = document.getElementById('remove');
const edit = document.getElementById('edit');


let state = {
    selectedPost: null,
    editingPost: false,
    imageStore: ""
}

document.addEventListener('click', (e) => {
    if (!popup.firstElementChild.contains(e.target) && popup.style.display !== 'none') {
        popup.style.display = 'none';
    }
    if (!hamburgerMenu.contains(e.target) && hamburgerMenu.style.display !== 'none') {
        hamburgerMenu.style.display = 'none';
    }
})

copy.addEventListener('click', (e) => {
    const content = state.selectedPost.querySelector(':scope > p').innerHTML

    const htmlBlob = new Blob([content], { type: "text/html" });
    const plainBlob = new Blob([content], { type: "text/plain" });
    const clipboardItem = new ClipboardItem({
        "text/html": htmlBlob,
        "text/plain": plainBlob
    });
    navigator.clipboard.write([clipboardItem]);
    hamburgerMenu.style.display = 'none'
    e.stopPropagation();
})
remove.addEventListener('click', (e) => {
    postData = state.selectedPost.postData;
    postData.visible = false;
    setPost(postData)
    state.selectedPost.remove();
    hamburgerMenu.style.display = 'none'
    e.stopPropagation();
})
edit.addEventListener('click', (e) => {
    popup.style.display = 'flex'
    data = state.selectedPost.postData;
    postIn.value = data.Body;
    if (data.Image) {
        state.imageStore = data.Image


        addImagePreview(data.Image);
    }
    state.editingPost = true;
    hamburgerMenu.style.display = 'none';
    e.stopPropagation();
})


createPost.addEventListener('click', (e) => {
    popup.style.display = 'flex';
    postIn.focus();
    hamburgerMenu.style.display = 'none'
    e.stopPropagation();

})
closePopup.addEventListener('click', (e) => {
    popup.style.display = 'none';
    state.editingPost = false;

    const image = document.getElementById('imgWrap');
    if (image != null) {
        image.remove();
    }
    imageInput.value = "";
    state.imageStore = "";
    postIn.value = "";
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox
    e.stopPropagation();
})

imgBtn.addEventListener('click', (e) => {
    imageInput.click();
    e.stopPropagation();
})
imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {

        addImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    event.stopPropagation();
})
function addImagePreview(img) {
    removeImagePreview();
    const imgWrap = document.createElement('div');
    const preview = document.createElement('img');
    preview.id = 'imgPreview'
    preview.src = img;
    imgWrap.id = 'imgWrap'
    imgWrap.append(preview);
    popup.firstElementChild.prepend(imgWrap);
    state.imageStore = img;
    let remove = document.createElement('button');
    remove.innerHTML = "X";
    remove.classList.add("removeBtn");
    remove.addEventListener('click', (e) => {
        removeImagePreview();
        e.stopPropagation();
    });
    imgWrap.append(remove)
}
function removeImagePreview() {
    const existing = document.getElementById('imgWrap');
    if (existing != null) {
        existing.remove();
    }
}

const storeName = "posts";

let db;
const request = indexedDB.open("MyTestDatabase", 4);
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

    postButton.addEventListener('click', (e) => {
        if (state.editingPost) {
            postData = state.selectedPost.postData;
            postData.Body = postIn.value;
            postData.Image = state.imageStore;
            postData.createdAt = Date.now();

            setPost(postData);

            html = postData.Body.replace(/\r?\n/g, ' <br> ');
            state.selectedPost.querySelector('p').innerHTML = html;

            const imgWrap = document.createElement('div');
            const preview = document.createElement('img');
            preview.id = 'imgPreview'
            preview.src = postData.Image;
            imgWrap.id = 'imgWrap'
            imgWrap.append(preview);
            state.selectedPost.querySelector('p').append(imgWrap);
        } else {
            addPost({
                Body: postIn.value, Image: state.imageStore, createdAt: Date.now(), visible: true
            })
        }
        closePopup.click();
        e.stopPropagation();
    })

};

request.onupgradeneeded = (event) => {
    // Save the IDBDatabase interface
    const db = event.target.result;


    // if (db.objectStoreNames.contains(storeName)) {
    //     db.deleteObjectStore(storeName); // Delete the object store
    //     console.log(`Object store '${storeName}' deleted successfully.`);
    // } else {
    //     console.log(`Object store '${storeName}' not found.`);
    // }

    // Create an objectStore for this database
    const objectStore = db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
};

function addPost(data) {
    addToFeed(data)
    if (data.Body == "") {
        return
    }
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
        let result;

        request.onsuccess = (event) => {
            result = event.target.result;
        };
        request.onerror = (event) => {
            reject(event.target.error);
        };
        transaction.oncomplete = () => {
            resolve(result);
        }
    });
}
function setPost(data) {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    const updateRequest = store.put(data);

    updateRequest.onsuccess = () => {
        console.log("Record updated successfully");
    };

    updateRequest.onerror = () => {
        console.error("Update failed");
    };
};
function setFeed(posts) {
    feed.replaceChildren();
    posts.forEach(postData => {
        addToFeed(postData)
    });
}

function addToFeed(postData) {
    const visible = postData.visible ?? true;
    if (visible) {
        postContainer = document.createElement('div');
        postContainer.classList.add('post');
        feed.prepend(postContainer);
        postContainer.postData = postData;

        //content
        html = postData.Body.replace(/\r?\n/g, ' <br> ');
        postContent = document.createElement('p');
        postContent.innerHTML = html;
        postContainer.append(postContent);
        //Images
        if (postData.Image) {
            tempDiv = document.createElement('div');
            tempDiv.style.textAlign = "center";

            postImage = document.createElement('img');
            postImage.src = postData.Image;
            tempDiv.append(postImage);
            postContent.append(tempDiv);
        }

        const bottomDiv = document.createElement('div');
        bottomDiv.classList.add('bottomDiv');
        postContainer.append(bottomDiv);
        //timestamp
        const date = new Date(postData.createdAt)
        const options = { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' };
        const formatted = date.toLocaleString('en-US', options);

        const dateP = document.createElement('p')
        dateP.innerHTML = formatted;
        dateP.classList.add('date');
        bottomDiv.append(dateP)

        //hamburger menu
        const hamburger = document.createElement('button');
        hamburger.classList.add('hamburger')
        bottomDiv.append(hamburger)
        hamburger.innerHTML = " ..."

        document.querySelectorAll('.hamburger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                openMenu(btn);
                e.stopPropagation();
            })
        })
    }
}

function openMenu(btn) {
    hamburgerMenu.style.display = 'flex'

    const rect = btn.getBoundingClientRect();
    if (window.innerWidth < 768) {
        hamburgerMenu.style.top = `${rect.bottom + window.scrollY - hamburgerMenu.offsetHeight}px`;
        hamburgerMenu.style.left = `${rect.left + window.scrollX - hamburgerMenu.offsetWidth}px`;
    }
    else {
        hamburgerMenu.style.top = `${rect.bottom + window.scrollY - hamburgerMenu.offsetHeight}px`;
        hamburgerMenu.style.left = `${rect.right + window.scrollX}px`;
    }
    state.selectedPost = btn.parentElement.parentElement;
}
