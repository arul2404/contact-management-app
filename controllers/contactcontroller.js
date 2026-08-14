const asyncHandler = require("express-async-handler");
const contactmodel = require("../models/contactmodel");
//@desc get all contacts
//@route GET /api/contacts
//@access private 

const getcontacts = asyncHandler(async (req, res) => {
    const contacts = await contactmodel.find({ user_id: req.user.id });
    res.status(200).json(contacts);
});

//@desc  create new contacts
//@route POST /api/contacts
//@access private

const createcontact =asyncHandler(async (req, res) => {
    console.log("the request body is :", req.body);
    const {name,email,phone} = req.body;
    if(!name||!email||!phone) {
     res.status(400).json({ message: "Please provide all required fields" });
     throw new Error("please provide all required fields");
    }

    const contact = await contactmodel.create({
        name,
        email,
        phone,
        user_id: req.user.id
    });
    res.status(201).json(contact);
});


//@desc  get new contacts
//@route GET /api/contacts/:id
//@access private

const getcontact = asyncHandler(async (req, res) => {
    const contact = await contactmodel.findById(req.params.id);
    if (!contact) {
        res.status(404).json({ message: "Contact not found" });
        throw new Error("Contact not found");
    }
    res.status(200).json(contact);
});

//@desc  update  contacts
//@route PUT /api/contacts/:id
//@access private

const updatecontact = asyncHandler(async (req, res) => {
    const contact = await contactmodel.findById(req.params.id);
    if (!contact) {
        res.status(404).json({ message: "Contact not found" });
        throw new Error("Contact not found");
    }
    if (contact.user_id.toString() !== req.user.id) {
        res.status(403);
        throw new Error("User dont have permission to update other user contacts");
    }
    const updatedContact = await contactmodel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );
    res.status(200).json(updatedContact);
});

//@desc  delete  contacts
//@route DELETE /api/contacts/:id
//@access private

const deletecontact = asyncHandler(async (req, res) => {
    const contact = await contactmodel.findById(req.params.id);
    if (!contact) {
        res.status(404).json({ message: "Contact not found" });
        throw new Error("Contact not found");
    }
    if (contact.user_id.toString() !== req.user.id) {
        res.status(403);
        throw new Error("User dont have permission to delete other user contacts");
    }
    await contactmodel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: `Contact deleted for ${req.params.id}` });
});



module.exports = { getcontacts, createcontact, getcontact, updatecontact, deletecontact };