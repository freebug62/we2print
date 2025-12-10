/**
 * This is a sample template.
 * It returns a JSON object to be used by the app.
 */
module.exports = {
    title: 'Sample template 85x55mm — 2 sides',
    size: {
        width: 85,
        height: 55,
        measure: 'mm',
        dpi: 300,
        cutline: 3,
        safeline: 5
    },
    pages: [
        {
            background: null, //'dist/asset/template/background/mm/85x55/sample-1.jpg',
            color: '#dddddd',
            elements: [
                {
                    type: 'text',
                    x: 15,
                    y: 10,
                    text: 'Sample text',
                    color: '#ffffff',
                    family: 'Oi',
                    size: 21,
                    weight: 'normal',
                    style: 'normal',
                    locked: false
                },
                {
                    type: 'vector',
                    x: 6,
                    y: 6,
                    width: 73,
                    height: 12,
                    vector: 'dist/asset/template/shape/aggressive-streak-sm.svg',
                    color: '#4b4c48ff',
                    locked: false
                },
                {
                    type: 'image',
                    x: 30,
                    y: 40,
                    width: 25,
                    height: 13,
                    image: 'dist/asset/template/image/sample-1.png',
                    locked: false
                },
                {
                    type: 'text',
                    x: 30,
                    y: 35,
                    text: 'Sample text 2',
                    color: '#0095ffff',
                    family: 'Arial',
                    size: 16,
                    weight: 'normal',
                    style: 'normal',
                    locked: false
                },
                {
                    type: 'image',
                    x: 50,
                    y: 22,
                    width: 30,
                    height: 23,
                    image: 'dist/asset/template/image/sample-2.png',
                    locked: false
                },
                {
                    type: 'text',
                    x: 30,
                    y: 50,
                    text: 'Sample text 3',
                    color: '#bfff00',
                    family: 'Arial',
                    size: 12,
                    weight: 'normal',
                    style: 'normal',
                    locked: false
                },
                {
                    type: 'vector',
                    x: 6,
                    y: 6,
                    width: 20,
                    height: 20,
                    vector: 'dist/asset/template/shape/circle-bloat.svg',
                    color: '#099b2bff',
                    locked: false
                },
                {
                    type: 'vector',
                    x: 10,
                    y: 32,
                    width: 12,
                    height: 12,
                    vector: 'dist/asset/template/shape/badge-03.svg',
                    color: '#ea00ffff',
                    locked: false
                }
            ]
        },
        {
            background: 'dist/asset/template/background/mm/85x55/sample-2.jpg',
            color: '#ea7c7c',
            elements: [
                {
                    type: 'vector',
                    x: 20,
                    y: 5,
                    width: 12,
                    height: 8,
                    vector: 'dist/asset/template/shape/aggressive-streak-sm.svg',
                    color: '#ffe600ff',
                    locked: false
                },
                {
                    type: 'text',
                    x: 6,
                    y: 6,
                    text: 'Sample text',
                    color: '#ffffff',
                    family: 'Arial',
                    size: 21,
                    weight: 'bold',
                    style: 'italic',
                    locked: false
                },
                {
                    type: 'image',
                    x: 30,
                    y: 22,
                    width: 32,
                    height: 28,
                    image: 'dist/asset/template/image/sample-2.png',
                    locked: true
                },
                {
                    type: 'text',
                    x: 30,
                    y: 20,
                    text: 'Sample text 3',
                    color: '#00ccffff',
                    family: 'Arial',
                    size: 36,
                    weight: 'normal',
                    style: 'normal',
                    locked: true
                },
                {
                    type: 'vector',
                    x: 30,
                    y: 15,
                    width: 20,
                    height: 20,
                    vector: 'dist/asset/template/shape/circle.svg',
                    color: '#099b2bff',
                    locked: true
                }
            ]
        }
    ]
};