var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), // mongo connection
    bodyParser = require('body-parser'), // parses information from POST
    methodOverride = require('method-override'); // used to manipulate POST

// Any requests to this controller must pass through this 'use' function
// Copy and pasted from method-override
router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}));

// Build the REST operations at the base for blobs
// This will be accessible from http://127.0.0.1:3000/blobs if the default route for / is left unchanged
router.route('/')
    // GET all blobs
    .get(async function(req, res, next) {
        try {
            var blobs = await mongoose.model('Blob').find({});
            res.format({
                html: function(){
                    res.render('blobs/index', {
                        title: 'All my Blobs',
                        blobs: blobs // Promijenjeno "blobs" u "blobs"
                    });
                },
                json: function(){
                    res.json(blobs);
                }
            });
        } catch (err) {
            next(err);
        }
    })
    // POST a new blob
    .post(async function(req, res) {
        try {
            var blob = req.body;
            var createdBlob = await mongoose.model('Blob').create(blob);
            res.format({
                html: function(){
                    res.location("/blobs"); // Promijenjeno "blobs" u "/blobs"
                    res.redirect("/blobs");
                },
                json: function(){
                    res.json(createdBlob);
                }
            });
        } catch (err) {
            next(err);
        }
    });

/* GET New Blob page. */
router.get('/new', function(req, res) {
    res.render('blobs/new', { title: 'Add New Blob' });
});

// Route middleware to validate :id
router.param('id', async function(req, res, next, id) {
    try {
        var blob = await mongoose.model('Blob').findById(id);
        if (!blob) {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        } else {
            req.id = id;
            next(); 
        }
    } catch (err) {
        next(err);
    }
});

router.route('/:id')
    .get(async function(req, res, next) {
        try {
            var blob = await mongoose.model('Blob').findById(req.params.id);
            if (!blob) {
                var err = new Error('Not Found');
                err.status = 404;
                next(err);
            } else {
                var blobdob = blob.dob.toISOString().substring(0, blob.dob.toISOString().indexOf('T'));
                res.format({
                    html: function(){
                        res.render('blobs/show', {
                            blobdob: blobdob,
                            blob: blob
                        });
                    },
                    json: function(){
                        res.json(blob);
                    }
                });
            }
        } catch (err) {
            next(err);
        }
    });

router.route('/:id/edit')
    .get(async function(req, res, next) {
        try {
            var blob = await mongoose.model('Blob').findById(req.id);
            if (!blob) {
                var err = new Error('Not Found');
                err.status = 404;
                next(err);
            } else {
                var blobdob = blob.dob.toISOString().substring(0, blob.dob.toISOString().indexOf('T'));
                res.format({
                    html: function(){
                        res.render('blobs/edit', {
                            title: 'Blob' + blob._id,
                            blobdob: blobdob,
                            blob: blob
                        });
                    },
                    json: function(){
                        res.json(blob);
                    }
                });
            }
        } catch (err) {
            next(err);
        }
    })
    .put(async function(req, res, next) {
        try {
            var updateData = req.body;
            // Convert isloved to a boolean if it's a string
            if (updateData.isloved === 'on') {
                updateData.isloved = true;
            } else if (updateData.isloved === 'off') {
                updateData.isloved = false;
            }
            var updatedBlob = await mongoose.model('Blob').findByIdAndUpdate(req.id, updateData, { new: true });
            res.format({
                html: function(){
                    res.redirect("/blobs/" + updatedBlob._id);
                },
                json: function(){
                    res.json(updatedBlob);
                }
            });
        } catch (err) {
            next(err);
        }
    })
    .delete(async function (req, res, next) { // Dodan next kao parametar
        try {
            var deletedBlob = await mongoose.model('Blob').findOneAndDelete({ _id: req.id });
            if (!deletedBlob) {
                return res.status(404).send({ message: 'Blob not found' });
            }
            console.log('DELETE removing ID: ' + deletedBlob._id);
            res.format({
                html: function () {
                    res.redirect("/blobs");
                },
                json: function () {
                    res.json({ message: 'deleted', item: deletedBlob });
                }
            });
        } catch (err) {
            next(err); // Dodan next za preusmjeravanje na globalni rukovatelj greškama
        }
    });


module.exports = router;
