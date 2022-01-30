const fs = require('fs')
const fsPromises = fs.promises

var dataJson

// node js documentation 
fs.readFile('./broken-database.json',(err,dataString)=>{

    if(err) {
        console.log('Failed to read the file')
        return false
    }

    else {
        dataJson = JSON.parse(dataString)
        fixedName()
        fixedPrice()
        fixedQuantity()
    }
})

function fixedName() {

    for(var element in dataJson ) {
        var corretName;
        var nameErr = dataJson[element].name
        nameErr = nameErr.replaceAll('ß','b') // w3 school
        nameErr = nameErr.replaceAll('æ','a')
        nameErr = nameErr.replaceAll('¢','c')
        nameErr = nameErr.replaceAll('ø','o')

        var words =  nameErr.split(' ')
        for(index in words) {
            const word = words[index]
            if(word === 'com' || word === 'de' || word === 'e') {
                words.splice(index,1,word)
            }
            else {
                const capitalizeWord = word.charAt(0).toUpperCase() + word.slice(1)
                words.splice(index,1,capitalizeWord)
            }
        }
        nameErr = words.join(' ')
        dataJson[element].name = nameErr
    }
}

function fixedPrice() {
    for(var element in dataJson) {
        var priceErr = dataJson[element].price
        priceErr = parseFloat(priceErr)  // w3 school

        dataJson[element].price = priceErr 
    }
}

function fixedQuantity() {
    for(element in dataJson) {

        const quantityItem = dataJson[element].quantity
        if(quantityItem === undefined) {
            const item = dataJson[element]

            const {id,name,price,category} = item
            
            const correctObj = {
                id:id,
                name:name,
                quantity:0,
                price:price,
                category:category
            }

            dataJson.splice(element,1,correctObj)
        }
    }
    // https://stackoverflow.com/questions/36856232/write-add-data-in-json-file-using-node-js 

    fs.stat("./saida.json", (err, stats) => { 
        const stringDataJson = JSON.stringify(dataJson,null,2)
        // https://www.geeksforgeeks.org/node-js-fs-stat-method/
        if(stats) {
            console.log('The file saida.json is already exist,so will be rewrite')
        }
        fs.writeFile('./saida.json',stringDataJson,(err)=>{
            if(err) {
                console.log(err)
            }
            else {
                organizerObjs()
                calculateTotalPrice()
            }
        })
    });
}

async function organizerObjs(){ // https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
// https://stackoverflow.com/questions/40593875/using-filesystem-in-node-js-with-async-await
    let file
    try {
        fs.readFile('./saida.json',(err,fileDataString)=>{
            if(err) {
                console.log(err)
            }
            else {
                file = JSON.parse(fileDataString)
                file.sort((a,b)=>{
                    const categoryA = a.category
                    const categoryB = b.category 

                    const idA = a.id
                    const idB = b.id

                    if(categoryA > categoryB) {
                        return 1
                    }
                    else if(categoryB < categoryB) {
                        return -1
                    }
                    else {
                        if(idA > idB) {
                            return 1
                        }
                        else if(idA < idB) {
                            return -1
                        }
                    }

                })
                const fileStringify = JSON.stringify(file,null,2) // https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
                fs.writeFile('./saida.json',fileStringify,(err)=>{
                    if(err) console.log(err)
                })
            }
        })
    }
    catch {
        console.log(err)
    }
}


function calculateTotalPrice() {

    var priceAcessories = priceElectronics = priceHomeAppliences = pricePan = 0
   // preco dos accesorios = preco do Eletronicos = precos eletrodomesticos = preco das panelas

    fs.readFile('./saida.json',(err,dataFile)=>{
        if(err) console.log(err)
        else {
            file = JSON.parse(dataFile)

            for(var element in file) {
                const priceElement = file[element].price
                const categoryElement = file[element].category
        
                switch(categoryElement) {
                    case 'Acessórios':
                        priceAcessories+=priceElement
                        break
                    case 'Eletrodomésticos':
                        priceHomeAppliences+=priceElement
                        break
                    case 'Eletrônicos':
                        priceElectronics+=priceElement
                        break
                    case 'Panelas' :
                        pricePan +=priceElement
                        break
                    default :
                        console.log('There is nothing category to correspind with this product')
                }
            }
        }
    })
}