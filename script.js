window.addEventListener('DOMContentLoaded', (event) => {
    print("test")
    window.api.send("files", "what ever");
    window.api.receive("getAllFoldersResult", (data) => {
        //print(`Received ${data} from main process`);
        let resultObject = JSON.parse(data);
    });
    window.api.receive("sendFolderPictures", (data) => {
        console.log(`Received ${data} from main process`);
        // TODO: FINISH THIS
        let resultObject = JSON.parse(data);
    });
});
function btnPressRequestFolders() {

    let myList = document.querySelector(".myList");

    window.api.send("getAllFolders", "");
    window.api.receive('getAllFoldersResult', function (data) {
        let folderNamesArray = JSON.parse(data).files;
        for (let folder of folderNamesArray) {
            var node = document.createElement("li");
            var button = document.createElement("button");
            button.addEventListener("click", function(){
                choose(folder);
            });
            var textnode = document.createTextNode(folder);
            node.appendChild(textnode);
            node.appendChild(button);
            var buttonTextNode = document.createTextNode("Choose " + folder);
            button.appendChild(buttonTextNode);
            myList.appendChild(node);
        }
    });
}
function print(text) {
    var node = document.createElement("LI");                 // Create a <li> node
    var textnode = document.createTextNode((text));         // Create a text node
    node.appendChild(textnode);                              // Append the text to <li>
    document.querySelector(".myList").appendChild(node);
}
function addPicture(src) {
    var imageElement = document.createElement("img");                 // Create a <li> imageElement
    imageElement.setAttribute("src", src)
    document.querySelector(".myPictures").appendChild(imageElement);
}
function emptyDiv() {
    let myPictures = document.querySelector(".myPictures");
    var elements = myPictures.querySelectorAll("img");
    while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
    }
}
function choose(folderName) {
    window.api.send("requestFolderPictures", folderName);
    console.log("choose function")
    window.api.receive("requestFolderResponse", (data) => {
        let resultObject = JSON.parse(data);

    });
}