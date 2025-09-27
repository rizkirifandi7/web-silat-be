const { Order, OrderItem, Katalog } = require("../models");

const createOrder = async (req, res) => {
	const { namaPembeli, email, alamat, noTelepon, items } = req.body;

	try {
		// Hitung total harga
		let totalHarga = 0;
		for (const item of items) {
			const katalog = await Katalog.findByPk(item.idKatalog);
			if (!katalog || katalog.status !== "tersedia") {
				return res
					.status(400)
					.json({ message: `Produk ${item.idKatalog} tidak tersedia` });
			}
			totalHarga += parseFloat(katalog.harga) * item.jumlah;
		}

		// Buat order
		const order = await Order.create({
			namaPembeli,
			email,
			alamat,
			noTelepon,
			totalHarga,
			statusPembayaran: "pending",
		});

		// Buat order items
		for (const item of items) {
			const katalog = await Katalog.findByPk(item.idKatalog);
			await OrderItem.create({
				idOrder: order.id,
				idKatalog: item.idKatalog,
				jumlah: item.jumlah,
				hargaSatuan: katalog.harga,
			});
		}

		res.status(201).json({ message: "Order created successfully", order });
	} catch (error) {
		res.status(500).json({ message: "Error creating order", error });
	}
};

const getOrderById = async (req, res) => {
	const { id } = req.params;
	try {
		const order = await Order.findByPk(id, {
			include: [
				{
					model: OrderItem,
					as: "orderItems",
					include: [{ model: Katalog, as: "katalog" }],
				},
			],
		});
		if (order) {
			res.status(200).json(order);
		} else {
			res.status(404).json({ message: "Order not found" });
		}
	} catch (error) {
		res.status(500).json({ message: "Error retrieving order", error });
	}
};

module.exports = {
	createOrder,
	getOrderById,
};
