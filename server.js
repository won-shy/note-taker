const express = require('express')
const app = express();
const path = require('path')
const fs = require('fs')
// npm package to create id to be able to delete
const uuidv1 = require('uuid/v1')
const { dirname } = require('path');
// heroku deployment
PORT = process.env.PORT || 3000

//Middleware
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/notes', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

app.get('/api/notes', (req, res) => {
    fs.readFile(path.join(__dirname, '/db/db.json'), 'utf-8', (err, data) => {
        if (err) {
            console.error(err)
            res.status(500).json({ error: 'Failed to read note.' })
        } else {
            const notes = JSON.parse(data)
            res.json(notes)
        }
    })
});

app.post('/api/notes', (req, res) => {
    fs.readFile(path.join(__dirname, '/db/db.json'), 'utf-8', (err, data) => {
        if (err) {
            console.error(err)
            res.status(500).json({ error: 'Failed to read note.' })
        } else {
            console.log(data)
            const notes = JSON.parse(data)
            console.log(notes)
            const newNote = req.body
            //adding ID to note to be able to delete
            newNote.id = uuidv1()
            //pushing note to left colum to save
            notes.push(newNote)
            fs.writeFile(path.join(__dirname, '/db/db.json'), JSON.stringify(notes), 'utf-8', (err) => {
                if (err) {
                    console.error(err)
                    res.status(500).json({ error: 'Failed to write note.' })
                } else {
                    res.status(201).json(newNote)
                }
            })
        }
    })
});

//added is param to notes
app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id
    fs.readFile(path.join(__dirname, '/db/db.json'), 'utf-8', (err, data) => {
        if (err) {
            console.error(err)
            res.status(500).json({ error: 'Failed to read note.' })
        } else {
            const notes = JSON.parse(data)
            const noteIndex = notes.findIndex((note) => note.id === noteId)
            if (noteIndex === -1) {
                res.status(400).json({ error: 'Failed to read note' })
            } else {
                //moving note index to top of list
                notes.splice(noteIndex, 1)
                fs.writeFile(path.join(__dirname, '/db/db.json'), JSON.stringify(notes), 'utf-8', (error) => {
                    if (error) {
                        console.error(error)
                        res.status(500).json({ error: 'Failed to delete.' })
                    } else {
                        res.status(200).json({ success: true })
                    }
                })
            }
        }
    })
});



app.listen(PORT, () => {
    console.log(`The current port being used in http://localhost:${PORT}.`)
});