const router = require('express').Router();
const {
  getAllRekening,
  getRekeningById,
  createRekening,
  updateRekening,
  deleteRekening,
} = require('../controllers/rekening');

router.get('/', getAllRekening);
router.get('/:id', getRekeningById);
router.post('/', createRekening);
router.put('/:id', updateRekening);
router.delete('/:id', deleteRekening);

module.exports = router;