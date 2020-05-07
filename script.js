let elementIndex = 0;

let currentFolder;
let allFolders1 = [];


window.addEventListener('DOMContentLoaded', (event) => {
    window.api.send("getAllFolders", "");
    window.api.receive('getAllFoldersResult', (replyString) => {
        try {
            allFolders1 = JSON.parse(replyString)['files'];
            let allFoldersSorted = sortFolderNamesArray(allFolders1);
            //console.log(allFoldersSorted);
            currentFolder = allFoldersSorted[elementIndex];
            choose(currentFolder, false);
            print("test")
            window.api.send("files", "what ever");
            window.api.receive("sendFolderPictures", (data) => {
                console.log(`Received ${data} from main process`);
                let resultObject = JSON.parse(data);
                let transferArray = resultObject["transferArray"];
                for (let element of transferArray) {
                    //console.log(element);
                    addPicture(element);
                }
            });
        } catch (err) {
            console.error(err);
        }
    });
});

function getFolderNumber(folderName) {
    console.log(`getFolderNumber(${folderName})`);
    let pattern = /\\([^\\]+)$/;
    let numberString = folderName.match(pattern);
    let number = parseInt(numberString);
    return number;
}

function sortFolderNamesArray(folderNamesArray) {

    console.log(`sortFolderNamesArray(${folderNamesArray})`);
    if (!folderNamesArray) {
        throw "folderNamesArray does not exist.";
    } else if (folderNamesArray.length == 0) {
        throw "folderNamesArray is empty.";
    }
    let newArray = [];
    for (let folderPath of folderNamesArray) {
        newArray.push({
            "folderPath": folderPath,
            "folderNumber": getFolderNumber(folderPath)
        });
    }
    newArray.sort((a, b) => a.folderNumber - b.folderNumber);
    return newArray;
}

function nextPerson() {
    elementIndex += 1;
    currentFolder = allFolders1[elementIndex]
    choose(currentFolder, true);
}

function previousPerson() {
    if (elementIndex >= 1) {
        elementIndex -= 1;
        currentFolder = allFolders1[elementIndex]
        choose(currentFolder, true);
    }
}

function print(text) {
    var node = document.createElement("LI");                 // Create a <li> node
    var textnode = document.createTextNode((text));         // Create a text node
    node.appendChild(textnode);                              // Append the text to <li>
    document.querySelector(".images").appendChild(node);
}
function addPicture(src) {
    var imageElement = document.createElement("img");                 // Create a <li> imageElement
    imageElement.setAttribute("src", src)
    document.querySelector(".images").appendChild(imageElement);
}
function emptyDiv() {
    let myPictures = document.querySelector(".images");
    var elements = myPictures.querySelectorAll("img");
    while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
    }
}
function choose(folderName, willDelete) {
    if (willDelete) {
        const myNode = document.getElementById("database_people");
        myNode.innerHTML = '';
    }
    window.api.send("requestFolderPictures", folderName);
    console.log("choose function")
    window.api.receive("requestFolderResponse", (data) => {
        let resultObject = JSON.parse(data);
        let picturesArray = resultObject["transferArray"];
        for (let pictureName of picturesArray) {
            addPicture(pictureName)
        }
    });
}