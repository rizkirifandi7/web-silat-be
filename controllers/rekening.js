const { Rekening } = require('../models');
const fs = require('fs');
const cloudinary = require('../middleware/cloudinary');

const getAllRekening = async (req, res) => {
  try {
    const rekening = await Rekening.findAll();
    res.status(200).json(rekening);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving rekening', error });
  }
};

const getRekeningById = async (req, res) => {
  const { id } = req.params;
  try {
    const rekening = await Rekening.findByPk(id);
    if (rekening) {
      res.status(200).json(rekening);
    } else {
      res.status(404).json({ message: 'Rekening not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving rekening', error });
  }
};

const createRekening = async (req, res) => {
  const { logo, namaBank, noRekening } = req.body;
  try {
    const newRekening = await Rekening.create({
      logo,
      namaBank,
      noRekening,
    });
    res.status(201).json(newRekening);
  } catch (error) {
    res.status(500).json({ message: 'Error creating rekening', error });
  }
};

const updateRekening = async (req, res) => {
  const { id } = req.params;
  const { logo, namaBank, noRekening } = req.body;
  try {
    const rekening = await Rekening.findByPk(id);
    if (!rekening) {
      return res.status(404).json({ message: 'Rekening not found' });
    }

    rekening.logo = logo || rekening.logo;
    rekening.namaBank = namaBank || rekening.namaBank;
    rekening.noRekening = noRekening || rekening.noRekening;

    await rekening.save();
    res.status(200).json(rekening);
  } catch (error) {
    res.status(500).json({ message: 'Error updating rekening', error });
  }
};

const deleteRekening = async (req, res) => {
  const { id } = req.params;
  try {
    const rekening = await Rekening.findByPk(id);
    if (!rekening) {
      return res.status(404).json({ message: 'Rekening not found' });
    }

    await rekening.destroy();
    res.status(200).json({ message: 'Rekening deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting rekening', error });
  }
};

module.exports = {
  getAllRekening,
  getRekeningById,
  createRekening,
  updateRekening,
  deleteRekening,
};