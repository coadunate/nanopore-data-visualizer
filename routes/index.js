var express = require('express');
// var hdf5 = require('hdf5').hdf5;
// var h5lt = require('hdf5').h5lt;
var router = express.Router();


var d3 = require('d3');


// var Access = require('hdf5/lib/globals').Access;
//
// var directory = __dirname + '/../includes/data/fast5/' // directory where fast5
// // .. files are stored.
// var filename = 'file1.fast5'
//
//
// var file = new hdf5.File(directory + filename, Access.ACC_RDONLY);
//
// var group = file.openGroup('/Analyses/Basecall_1D_001/BaseCalled_template');
//
// var dataset = h5lt.readDataset(group.id,'Events');
// //
// // console.log(JSON.stringify(dataset));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: "Express" });
});

module.exports = router;
